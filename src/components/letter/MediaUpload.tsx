import { useRef, useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { ImagePlus, Video, X, Upload, Camera, Mic, Square } from "lucide-react";

interface MediaUploadProps {
  images: File[];
  videos: File[];
  audios: File[];
  onImagesChange: (files: File[]) => void;
  onVideosChange: (files: File[]) => void;
  onAudiosChange: (files: File[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const MediaUpload = ({
  images, videos, audios,
  onImagesChange, onVideosChange, onAudiosChange,
  onNext, onBack,
}: MediaUploadProps) => {
  const imageRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const handleImageFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) onImagesChange([...images, ...Array.from(e.target.files)]);
  };

  const removeImage = (index: number) => onImagesChange(images.filter((_, i) => i !== index));
  const removeVideo = (index: number) => onVideosChange(videos.filter((_, i) => i !== index));
  const removeAudio = (index: number) => onAudiosChange(audios.filter((_, i) => i !== index));

  const startVideoRecording = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      setIsRecordingVideo(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      const recorder = new MediaRecorder(mediaStream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const file = new File([blob], `video-${Date.now()}.webm`, { type: "video/webm" });
        onVideosChange([...videos, file]);
      };
      recorder.start();
    } catch {
      alert("Camera access is needed to record a video.");
    }
  }, [videos, onVideosChange]);

  const startAudioRecording = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(mediaStream);
      setIsRecordingAudio(true);
      const recorder = new MediaRecorder(mediaStream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const file = new File([blob], `voice-${Date.now()}.webm`, { type: "audio/webm" });
        onAudiosChange([...audios, file]);
      };
      recorder.start();
    } catch {
      alert("Microphone access is needed to record audio.");
    }
  }, [audios, onAudiosChange]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setIsRecordingVideo(false);
    setIsRecordingAudio(false);
  }, [stream]);

  useEffect(() => {
    return () => { stream?.getTracks().forEach((t) => t.stop()); };
  }, [stream]);

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
          Attach Your Memories
        </h2>
        <p className="font-body text-sm text-muted-foreground">
          Make your letter even more special with photos and recordings
        </p>
      </div>

      <div className="space-y-6">
        {/* Photo Upload Box */}
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
                  <button onClick={() => removeImage(j)} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-foreground/70 text-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Record Special Message */}
        <div className="letter-paper rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Camera className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-display text-base font-semibold text-foreground">Record a Special Message</p>
              <p className="font-body text-xs text-muted-foreground">Record a video or voice message</p>
            </div>
          </div>

          {/* Live video preview */}
          {isRecordingVideo && (
            <div className="mb-4 rounded-xl overflow-hidden border-2 border-primary/30 relative">
              <video ref={videoRef} muted className="w-full aspect-video object-cover bg-foreground/5" />
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 bg-destructive/90 rounded-full">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="font-body text-xs text-white font-medium">Recording</span>
              </div>
            </div>
          )}

          {isRecordingAudio && (
            <div className="mb-4 rounded-xl border-2 border-accent/30 p-6 flex flex-col items-center gap-3 bg-accent/5">
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center animate-pulse">
                <Mic className="w-8 h-8 text-accent" />
              </div>
              <p className="font-body text-sm text-foreground">Recording audio...</p>
            </div>
          )}

          {(isRecordingVideo || isRecordingAudio) ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={stopRecording}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-destructive text-destructive-foreground font-display text-sm font-semibold rounded-xl transition-all duration-300"
            >
              <Square className="w-4 h-4" />
              Stop Recording
            </motion.button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startVideoRecording}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-4 bg-primary/10 text-primary font-display text-sm font-semibold rounded-xl border border-primary/20 hover:bg-primary/15 transition-all duration-300"
              >
                <Video className="w-5 h-5" />
                Record Video
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startAudioRecording}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-4 bg-accent/10 text-accent font-display text-sm font-semibold rounded-xl border border-accent/20 hover:bg-accent/15 transition-all duration-300"
              >
                <Mic className="w-5 h-5" />
                Record Voice
              </motion.button>
            </div>
          )}

          {(videos.length > 0 || audios.length > 0) && (
            <div className="flex flex-wrap gap-2 mt-4">
              {videos.map((file, j) => (
                <div key={`v-${j}`} className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/15 text-xs font-body">
                  <Video className="w-3 h-3 text-primary" />
                  <span className="max-w-[100px] truncate text-foreground">{file.name}</span>
                  <button onClick={() => removeVideo(j)} className="text-muted-foreground hover:text-destructive"><X className="w-3 h-3" /></button>
                </div>
              ))}
              {audios.map((file, j) => (
                <div key={`a-${j}`} className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 rounded-full border border-accent/15 text-xs font-body">
                  <Mic className="w-3 h-3 text-accent" />
                  <span className="max-w-[100px] truncate text-foreground">{file.name}</span>
                  <button onClick={() => removeAudio(j)} className="text-muted-foreground hover:text-destructive"><X className="w-3 h-3" /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onBack}
          className="px-6 py-3 bg-secondary text-secondary-foreground font-display text-sm font-semibold rounded-xl border border-border/50 transition-all duration-300 hover:shadow-card">
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
