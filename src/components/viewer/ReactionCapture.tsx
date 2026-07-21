import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Video, Square, RotateCcw, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ReactionCaptureProps {
  letterId: string;
  /** Marketing-preview mode: skips the upload/DB insert/email — lets a visitor
   *  try the real camera flow without writing anything or needing a real letter. */
  demoMode?: boolean;
}

const MAX_SECONDS = 15;

// Safari (desktop and iOS) doesn't support WebM at all — MediaRecorder throws
// synchronously if you hand it an unsupported mimeType, so we have to probe
// candidates in order rather than assuming WebM always works.
const VIDEO_MIME_CANDIDATES = [
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm",
  "video/mp4;codecs=h264,aac",
  "video/mp4",
];

const pickSupportedMimeType = (candidates: string[]): string | null =>
  candidates.find((c) => MediaRecorder.isTypeSupported(c)) ?? null;

/**
 * Consent-gated front-camera reaction recorder, shown once the recipient has
 * read the letter. Uploads directly to the private letter-media bucket and
 * inserts a letter_reactions row client-side (same permissive, link-based
 * access model as everything else here), then asks a tiny edge function to
 * email the sender — "someone left you a reaction" is the whole point of the
 * feature: free, ready-made content starring the person they sent this to.
 */
const ReactionCapture = ({ letterId, demoMode = false }: ReactionCaptureProps) => {
  const [phase, setPhase] = useState<"prompt" | "declined" | "recording" | "preview" | "sending" | "sent">("prompt");
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState("");
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startRecording = async () => {
    setError("");
    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: true });
    } catch {
      setError("Couldn't access your camera — check your browser's permission settings.");
      return;
    }

    const mimeType = pickSupportedMimeType(VIDEO_MIME_CANDIDATES);
    if (!mimeType) {
      stream.getTracks().forEach((t) => t.stop());
      setError("Video recording isn't supported in this browser. Try a different one, like Chrome.");
      return;
    }

    try {
      streamRef.current = stream;
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream, { mimeType });
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setRecordedBlob(blob);
        setPhase("preview");
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setPhase("recording");
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
    } catch (e) {
      console.error("[ReactionCapture] MediaRecorder creation failed", e);
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setError("Couldn't start recording on this device. Please try again.");
    }
  };

  // The live camera preview can only be attached once the <video> element has
  // actually mounted — it's conditionally rendered and only exists once phase
  // becomes "recording", which happens *after* getUserMedia resolves. Setting
  // srcObject inside startRecording() itself is too early (videoRef.current
  // is still null at that point), which is what caused the black preview.
  useEffect(() => {
    if (phase === "recording" && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [phase]);

  useEffect(() => {
    if (phase === "preview" && recordedBlob && videoRef.current) {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = URL.createObjectURL(recordedBlob);
      videoRef.current.srcObject = null;
      videoRef.current.src = previewUrlRef.current;
      videoRef.current.muted = false;
      videoRef.current.play().catch(() => {});
    }
  }, [phase, recordedBlob]);

  const reRecord = () => {
    setRecordedBlob(null);
    setPhase("prompt");
  };

  const send = async () => {
    if (!recordedBlob) return;
    setPhase("sending");
    setError("");

    if (demoMode) {
      // Marketing preview: skip persistence entirely, just show what sending feels like.
      setTimeout(() => setPhase("sent"), 600);
      return;
    }

    try {
      const ext = recordedBlob.type.includes("mp4") ? "mp4" : "webm";
      const path = `${letterId}/reactions/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("letter-media")
        .upload(path, recordedBlob, { contentType: recordedBlob.type });
      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase
        .from("letter_reactions")
        .insert({ letter_id: letterId, video_url: path });
      if (insertError) throw insertError;

      supabase.functions.invoke("notify-reaction", { body: { letter_id: letterId } }).catch(() => {});
      setPhase("sent");
    } catch (e) {
      console.error("[ReactionCapture] send failed", e);
      setError("Couldn't send your reaction. Please try again.");
      setPhase("preview");
    }
  };

  if (phase === "declined" || phase === "sent") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 pt-8 text-center"
        style={{ borderTop: "1px solid hsl(340 40% 80% / 0.4)" }}
      >
        <p className="font-body text-sm" style={{ color: "hsl(340 30% 45%)" }}>
          {phase === "sent"
            ? demoMode
              ? "That's it — that's the whole feature. Nothing was saved. 💌"
              : "Your reaction is on its way to them 💌"
            : ""}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mt-8 pt-8"
      style={{ borderTop: "1px solid hsl(340 40% 80% / 0.4)" }}
    >
      {phase === "prompt" && (
        <div className="text-center">
          <p className="font-display text-base italic mb-4" style={{ color: "hsl(340 30% 35%)" }}>
            {demoMode ? "Try it — record a test reaction 🎥" : "Want to send back a reaction? 🎥"}
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={startRecording}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-display text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
              style={{ background: "linear-gradient(135deg, hsl(340 90% 65%), hsl(340 90% 58%))", boxShadow: "0 8px 24px hsl(340 80% 60% / 0.35)" }}
            >
              <Video className="w-4 h-4" />
              {demoMode ? "Try Recording" : "Record a Reaction"}
            </button>
            <button
              onClick={() => setPhase("declined")}
              className="font-body text-sm text-foreground/50 hover:text-foreground/80 transition-colors"
            >
              No thanks
            </button>
          </div>
          {error && <p className="font-body text-xs text-destructive mt-3">{error}</p>}
        </div>
      )}

      {(phase === "recording" || phase === "preview" || phase === "sending") && (
        <div className="max-w-xs mx-auto">
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-[3/4]" style={{ boxShadow: "0 12px 30px hsl(340 60% 50% / 0.25)" }}>
            <video ref={videoRef} autoPlay muted={phase === "recording"} playsInline className="w-full h-full object-cover" />
            {phase === "recording" && (
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-white font-body text-xs">{MAX_SECONDS - seconds}s</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-3 mt-4">
            {phase === "recording" && (
              <button
                onClick={stopRecording}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-500 text-white font-body text-sm font-semibold hover:bg-red-600 transition-colors"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                Stop
              </button>
            )}
            {phase === "preview" && (
              <>
                <button
                  onClick={reRecord}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-secondary text-secondary-foreground font-body text-sm font-semibold"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Re-record
                </button>
                <button
                  onClick={send}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-white font-body text-sm font-semibold"
                  style={{ background: "linear-gradient(135deg, hsl(340 90% 65%), hsl(340 90% 58%))" }}
                >
                  <Send className="w-3.5 h-3.5" />
                  Send Reaction
                </button>
              </>
            )}
            {phase === "sending" && (
              <p className="font-body text-sm text-muted-foreground">Sending…</p>
            )}
          </div>
          {error && <p className="font-body text-xs text-destructive mt-2 text-center">{error}</p>}
        </div>
      )}
    </motion.div>
  );
};

export default ReactionCapture;
