import { useEffect, useRef, useState } from "react";
import { Mic, Square, Play, Pause, Trash2, Sparkles } from "lucide-react";

interface VoiceRecorderProps {
  audioBlob: Blob | null;
  onChange: (blob: Blob | null) => void;
}

const MAX_SECONDS = 60;

const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

const VoiceRecorder = ({ audioBlob, onChange }: VoiceRecorderProps) => {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
      audioElRef.current?.pause();
    };
  }, []);

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startRecording = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
      const recorder = new MediaRecorder(stream, { mimeType });
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        onChange(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
      setSeconds(0);
      timerRef.current = window.setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= MAX_SECONDS) {
            stopRecording();
            return MAX_SECONDS;
          }
          return s + 1;
        });
      }, 1000);
    } catch {
      setError("Couldn't access your microphone — check your browser's permission settings.");
    }
  };

  const clear = () => {
    audioElRef.current?.pause();
    setPlaying(false);
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    onChange(null);
    setSeconds(0);
  };

  const togglePlay = () => {
    if (!audioBlob) return;
    if (playing) {
      audioElRef.current?.pause();
      setPlaying(false);
      return;
    }
    if (!audioUrlRef.current) audioUrlRef.current = URL.createObjectURL(audioBlob);
    const audio = audioElRef.current ?? new Audio();
    audio.src = audioUrlRef.current;
    audio.onended = () => setPlaying(false);
    audio.play().catch(() => setPlaying(false));
    audioElRef.current = audio;
    setPlaying(true);
  };

  return (
    <div className="letter-paper rounded-2xl p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Mic className="w-5 h-5 text-elegant-gold" />
        <span className="font-heading text-base font-semibold">Voice Message</span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-elegant-gold/15 text-elegant-gold font-body text-[10px] font-bold uppercase tracking-wide">
          <Sparkles className="w-2.5 h-2.5" />
          Premium
        </span>
      </div>

      {!audioBlob && !recording && (
        <button
          type="button"
          onClick={startRecording}
          className="w-full flex flex-col items-center justify-center gap-2 py-6 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary/50 hover:bg-primary/5 transition-colors"
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Mic className="w-5 h-5 text-primary" />
          </div>
          <span className="font-body text-sm font-medium text-foreground">Tap to record your voice</span>
          <span className="font-body text-xs text-muted-foreground">Up to {MAX_SECONDS} seconds</span>
        </button>
      )}

      {recording && (
        <div className="flex flex-col items-center justify-center gap-3 py-6">
          <div className="w-12 h-12 rounded-full bg-red-500/15 flex items-center justify-center animate-pulse">
            <Mic className="w-5 h-5 text-red-500" />
          </div>
          <span className="font-heading text-lg font-semibold text-foreground">{formatTime(seconds)}</span>
          <button
            type="button"
            onClick={stopRecording}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-500 text-white font-body text-sm font-semibold hover:bg-red-600 transition-colors"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            Stop
          </button>
        </div>
      )}

      {audioBlob && !recording && (
        <div className="flex items-center gap-3 p-3 rounded-xl border bg-primary/10 border-primary/40">
          <button
            type="button"
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-primary/15 hover:bg-primary/25 flex items-center justify-center flex-shrink-0 transition-colors"
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? <Pause className="w-4 h-4 text-primary" /> : <Play className="w-4 h-4 text-primary ml-0.5" />}
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-heading text-sm font-semibold text-foreground">Voice message recorded</p>
            <p className="font-body text-xs text-muted-foreground">{formatTime(seconds)} — they'll hear this when they open your letter</p>
          </div>
          <button
            type="button"
            onClick={clear}
            className="w-8 h-8 rounded-full bg-secondary/70 hover:bg-secondary flex items-center justify-center flex-shrink-0 text-foreground/60"
            aria-label="Remove voice message"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {error && <p className="font-body text-xs text-destructive mt-2">{error}</p>}
    </div>
  );
};

export default VoiceRecorder;
