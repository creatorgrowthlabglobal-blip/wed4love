import { useRef } from "react";
import { motion } from "framer-motion";
import { ImagePlus, X, Upload } from "lucide-react";

interface MediaUploadProps {
  images: File[];
  onImagesChange: (files: File[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const MediaUpload = ({ images, onImagesChange, onNext, onBack }: MediaUploadProps) => {
  const imageRef = useRef<HTMLInputElement>(null);

  const handleImageFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) onImagesChange([...images, ...Array.from(e.target.files)]);
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
          onClick={() => imageRef.current?.click()}
          className="border-2 border-dashed border-primary/30 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
        >
          <Upload className="w-8 h-8 text-primary/50 mb-2" />
          <p className="font-display text-sm font-medium text-foreground mb-0.5">Click to upload photos</p>
          <p className="font-body text-xs text-muted-foreground">JPG, PNG, WEBP supported</p>
        </div>
        <input ref={imageRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageFiles} />

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
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onNext}
          className="btn-glow px-8 py-3 bg-primary text-primary-foreground font-display text-sm font-semibold rounded-xl shadow-romantic transition-all duration-400 hover:shadow-glow">
          Continue →
        </motion.button>
      </div>
    </motion.div>
  );
};

export default MediaUpload;
