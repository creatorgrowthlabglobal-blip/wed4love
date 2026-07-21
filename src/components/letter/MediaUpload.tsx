import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ImagePlus, X, Upload, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const MAX_DIM = 1600;
const QUALITY = 0.82;

interface MediaUploadProps {
  images: File[];
  onImagesChange: (files: File[]) => void;
  onNext: () => void;
  onBack: () => void;
  isBirthday?: boolean;
}

/**
 * Compress an image File client-side BEFORE it sits in state.
 * Big phone photos (5-15MB HEIC/JPEG) were causing the perceived "upload is
 * slow" — the slowness was actually the base64 encode at save time. By
 * shrinking on selection we keep state small and saving stays instant.
 */
const compressImageFile = async (file: File): Promise<File> => {
  if (!file.type.startsWith("image/")) return file;
  try {
    const bitmap = await createImageBitmap(file).catch(() => null);
    let width: number, height: number, source: CanvasImageSource;

    if (bitmap) {
      width = bitmap.width;
      height = bitmap.height;
      source = bitmap;
    } else {
      const dataUrl: string = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onloadend = () => res(r.result as string);
        r.onerror = rej;
        r.readAsDataURL(file);
      });
      const img = await new Promise<HTMLImageElement>((res, rej) => {
        const i = new Image();
        i.onload = () => res(i);
        i.onerror = rej;
        i.src = dataUrl;
      });
      width = img.naturalWidth;
      height = img.naturalHeight;
      source = img;
    }

    const scale = Math.min(1, MAX_DIM / Math.max(width, height));
    const w = Math.round(width * scale);
    const h = Math.round(height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(source, 0, 0, w, h);
    const blob: Blob | null = await new Promise((res) =>
      canvas.toBlob(res, "image/jpeg", QUALITY)
    );
    if (!blob) return file;
    if (blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.(heic|heif|png|webp)$/i, ".jpg"), {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch (e) {
    console.warn("[MediaUpload] compress failed, using original", e);
    return file;
  }
};

const MediaUpload = ({ images, onImagesChange, onNext, onBack, isBirthday }: MediaUploadProps) => {
  const MAX_PHOTOS = isBirthday ? 3 : 5;
  const imageRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);
  const atLimit = images.length >= MAX_PHOTOS;

  const handleImageFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const incoming = Array.from(e.target.files);
    e.target.value = "";

    setProcessing(true);
    try {
      // Compress in parallel — much faster than sequential.
      const compressed = await Promise.all(
        incoming.map((f) =>
          compressImageFile(f).catch((err) => {
            console.warn("[MediaUpload] one image failed", err);
            return f;
          })
        )
      );
      const combined = [...images, ...compressed].slice(0, MAX_PHOTOS);
      onImagesChange(combined);
      if (incoming.length + images.length > MAX_PHOTOS) {
        toast({
          title: "Photo limit reached",
          description: `Only the first ${MAX_PHOTOS} photos were added.`,
        });
      }
    } catch (err) {
      console.error("[MediaUpload] processing failed", err);
      toast({
        title: "Couldn't add photos",
        description: "Please try again with a different image.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const removeImage = (index: number) => onImagesChange(images.filter((_, i) => i !== index));

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto"
    >
      <div className="text-center mb-8">
        <p className="font-display text-lg text-primary mb-1">Add some magic</p>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Add Your Photos
        </h2>
        <p className="font-body text-sm text-muted-foreground">
          Make your letter even more special with photos
        </p>
      </div>

      <div className="letter-paper rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <ImagePlus className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-display text-base font-semibold text-foreground">Photos</p>
            <p className="font-body text-xs text-muted-foreground">Add images that tell your story</p>
          </div>
        </div>

        <div
          onClick={() => !atLimit && !processing && imageRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all duration-300 ${
            atLimit || processing
              ? "border-muted/40 bg-muted/10 cursor-not-allowed opacity-60"
              : "border-primary/30 cursor-pointer hover:border-primary/50 hover:bg-primary/5"
          }`}
        >
          {processing ? (
            <>
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
              <p className="font-display text-sm font-medium text-foreground mb-0.5">Optimizing photos…</p>
              <p className="font-body text-xs text-muted-foreground">This only takes a moment</p>
            </>
          ) : atLimit ? (
            <>
              <Upload className="w-8 h-8 text-primary/50 mb-2" />
              <p className="font-display text-sm font-medium text-foreground mb-0.5">Maximum reached</p>
              <p className="font-body text-xs text-muted-foreground">Remove a photo to add a different one</p>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-primary/50 mb-2" />
              <p className="font-display text-sm font-medium text-foreground mb-0.5">Click to upload photos</p>
              <p className="font-body text-xs text-muted-foreground">JPG, PNG, WEBP · Up to {MAX_PHOTOS} photos</p>
            </>
          )}
        </div>
        <input
          ref={imageRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleImageFiles}
          disabled={atLimit || processing}
        />

        <p className="font-body text-xs text-muted-foreground mt-2 text-right">
          {images.length} / {MAX_PHOTOS} photos
        </p>

        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-4">
            {images.map((file, j) => (
              <div key={j} className="relative group rounded-xl overflow-hidden border border-border/50 aspect-square">
                <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" />
                <button
                  onClick={() => removeImage(j)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-foreground/70 text-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-between">
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onBack}
          className="px-8 py-3 bg-secondary text-secondary-foreground font-display text-sm font-semibold rounded-xl border border-border/50 transition-all duration-300 hover:shadow-card">
          ← Go Back
        </motion.button>
        <motion.button
          whileHover={{ scale: processing ? 1 : 1.03 }}
          whileTap={{ scale: processing ? 1 : 0.97 }}
          onClick={onNext}
          disabled={processing}
          className="btn-glow px-8 py-3 bg-primary text-primary-foreground font-display text-sm font-semibold rounded-xl shadow-romantic transition-all duration-400 hover:shadow-glow disabled:opacity-60 disabled:cursor-not-allowed">
          {processing ? "Processing…" : "Continue →"}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default MediaUpload;
