import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  ArrowLeft,
  Phone,
  Mic,
  Square,
  Play,
  CalendarIcon,
  Sparkles,
  Check,
  Cake,
  Heart,
  Gift,
  Bell,
} from "lucide-react";
import Header from "@/components/Header";
import FloatingHearts from "@/components/FloatingHearts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const FREE_KEY = "wish4love_free_calls_remaining";
const FREE_TOTAL = 2;

const occasions = [
  { id: "birthday", label: "Birthday", icon: Cake },
  { id: "anniversary", label: "Anniversary", icon: Heart },
  { id: "just-because", label: "Just Because", icon: Gift },
  { id: "custom", label: "Custom", icon: Bell },
];

const ttsVoices = [
  "Warm Female (Default)",
  "Soft Male",
  "Playful Female",
  "Gentle Male",
];

const ScheduleCall = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [recipientName, setRecipientName] = useState("");
  const [phone, setPhone] = useState("");
  const [occasion, setOccasion] = useState("birthday");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState("09:00");
  const [mode, setMode] = useState<"voice" | "tts">("voice");
  const [ttsText, setTtsText] = useState("");
  const [voice, setVoice] = useState(ttsVoices[0]);

  const [recording, setRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [freeLeft, setFreeLeft] = useState<number>(FREE_TOTAL);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(FREE_KEY);
    if (stored === null) {
      localStorage.setItem(FREE_KEY, String(FREE_TOTAL));
      setFreeLeft(FREE_TOTAL);
    } else {
      setFreeLeft(Math.max(0, parseInt(stored, 10) || 0));
    }
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setRecordedUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      mediaRef.current = mr;
      setRecording(true);
    } catch {
      toast({
        title: "Microphone unavailable",
        description: "Please allow microphone access to record your voice.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    mediaRef.current?.stop();
    setRecording(false);
  };

  const handleBuy = (label: string) => {
    toast({
      title: "Coming soon ✨",
      description: `${label} will be available once we launch the calling network.`,
    });
  };

  const handleSchedule = () => {
    if (!recipientName.trim() || !phone.trim() || !date) {
      toast({
        title: "Almost there",
        description: "Please add the recipient, phone, and date for the call.",
        variant: "destructive",
      });
      return;
    }
    if (freeLeft <= 0) {
      toast({
        title: "No free calls left",
        description: "Top up below to schedule more reminder calls.",
        variant: "destructive",
      });
      return;
    }
    const next = freeLeft - 1;
    localStorage.setItem(FREE_KEY, String(next));
    setFreeLeft(next);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-[hsl(350_100%_97%)] to-background">
        <Header />
        <FloatingHearts count={8} />
        <div className="min-h-screen flex items-center justify-center px-4 pt-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="max-w-md w-full bg-white rounded-3xl p-10 text-center border border-primary/10"
            style={{ boxShadow: "0 20px 60px hsl(340 60% 80% / 0.25)" }}
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <Check className="w-7 h-7 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold mb-2">Call scheduled ✨</h1>
            <p className="font-body text-sm text-muted-foreground mb-6">
              We'll ring {recipientName} on{" "}
              {date && format(date, "PPP")} at {time}. They'll hear your{" "}
              {mode === "voice" ? "voice message" : "personalized message"}.
            </p>
            <p className="font-body text-xs text-muted-foreground mb-6">
              {freeLeft} of {FREE_TOTAL} free calls remaining
            </p>
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => {
                  setSuccess(false);
                  setRecipientName("");
                  setPhone("");
                  setDate(undefined);
                  setRecordedUrl(null);
                  setTtsText("");
                }}
                className="rounded-full"
              >
                Schedule another
              </Button>
              <Link
                to="/"
                className="font-body text-sm text-muted-foreground hover:text-foreground"
              >
                Back to home
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-[hsl(350_100%_97%)] to-background">
      <Header />
      <FloatingHearts count={5} />

      <main className="container mx-auto px-4 pt-28 pb-20 max-w-2xl">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-5">
            <Phone className="w-6 h-6 text-primary" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold leading-tight mb-3">
            Schedule a <span className="text-primary italic">Reminder Call</span>
          </h1>
          <p className="font-body text-sm text-muted-foreground max-w-md mx-auto">
            Never miss a birthday or anniversary again. Record your voice or type a message —
            we'll ring your loved one at the perfect moment.
          </p>
          <div className="inline-flex items-center gap-2 mt-5 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="font-body text-xs font-semibold text-foreground">
              {freeLeft} of {FREE_TOTAL} free calls remaining
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 sm:p-8 border border-primary/10 space-y-6"
          style={{ boxShadow: "0 20px 60px hsl(340 60% 80% / 0.18)" }}
        >
          {/* Recipient */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="font-body text-xs font-semibold text-foreground mb-1.5 block">
                Recipient name
              </label>
              <Input
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Mom, Sarah, Best Friend…"
              />
            </div>
            <div>
              <label className="font-body text-xs font-semibold text-foreground mb-1.5 block">
                Phone number
              </label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 123 4567"
                type="tel"
              />
            </div>
          </div>

          {/* Occasion */}
          <div>
            <label className="font-body text-xs font-semibold text-foreground mb-2 block">
              Occasion
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {occasions.map((o) => {
                const Icon = o.icon;
                const active = occasion === o.id;
                return (
                  <button
                    key={o.id}
                    onClick={() => setOccasion(o.id)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all",
                      active
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-primary/30",
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-body text-xs font-medium">{o.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date + time */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="font-body text-xs font-semibold text-foreground mb-1.5 block">
                Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="font-body text-xs font-semibold text-foreground mb-1.5 block">
                Time
              </label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          {/* Mode toggle */}
          <div>
            <label className="font-body text-xs font-semibold text-foreground mb-2 block">
              Message
            </label>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setMode("voice")}
                className={cn(
                  "flex-1 py-2 rounded-xl font-body text-sm font-medium transition-all border",
                  mode === "voice"
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border text-muted-foreground hover:border-primary/30",
                )}
              >
                Record voice
              </button>
              <button
                onClick={() => setMode("tts")}
                className={cn(
                  "flex-1 py-2 rounded-xl font-body text-sm font-medium transition-all border",
                  mode === "tts"
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border text-muted-foreground hover:border-primary/30",
                )}
              >
                Type message (TTS)
              </button>
            </div>

            <AnimatePresence mode="wait">
              {mode === "voice" ? (
                <motion.div
                  key="voice"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="rounded-xl border border-dashed border-primary/30 bg-primary/[0.03] p-5 text-center"
                >
                  {!recording ? (
                    <Button
                      type="button"
                      onClick={startRecording}
                      variant="outline"
                      className="rounded-full"
                    >
                      <Mic className="w-4 h-4 mr-2" />
                      {recordedUrl ? "Re-record" : "Start recording"}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={stopRecording}
                      className="rounded-full"
                    >
                      <Square className="w-4 h-4 mr-2 fill-current" />
                      Stop recording
                    </Button>
                  )}
                  {recordedUrl && !recording && (
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <Play className="w-4 h-4 text-primary" />
                      <audio src={recordedUrl} controls className="max-w-full" />
                    </div>
                  )}
                  <p className="font-body text-xs text-muted-foreground mt-3">
                    Recorded only in your browser for this preview.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="tts"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-3"
                >
                  <Textarea
                    value={ttsText}
                    onChange={(e) => setTtsText(e.target.value)}
                    placeholder="Happy birthday Mom! Just wanted to remind you how much you mean to me…"
                    rows={4}
                  />
                  <Select value={voice} onValueChange={setVoice}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {ttsVoices.map((v) => (
                        <SelectItem key={v} value={v}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Button
            onClick={handleSchedule}
            className="w-full rounded-full py-6 text-base font-display font-semibold"
          >
            <Phone className="w-4 h-4 mr-2" />
            Schedule call
          </Button>
        </motion.div>

        {/* Top-ups */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <button
            onClick={() => handleBuy("$5 reminder pack (10 calls)")}
            className="w-full bg-gradient-to-br from-primary/10 to-[hsl(340_90%_88%)] rounded-2xl p-5 border border-primary/20 text-left hover:border-primary/40 transition"
          >
            <p className="font-display text-lg font-bold">
              $5 <span className="text-xs font-body text-muted-foreground">— 10 extra reminder calls</span>
            </p>
            <p className="font-body text-xs text-muted-foreground">
              Top up when your 2 free calls run out
            </p>
          </button>
        </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default ScheduleCall;
