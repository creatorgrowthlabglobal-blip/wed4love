import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { getLetter, StoredLetter } from "@/lib/letterStorage";
import EnvelopeReveal from "@/components/viewer/EnvelopeReveal";
import QuizExperience from "@/components/viewer/QuizExperience";
import BalloonGame from "@/components/viewer/BalloonGame";
import VideoPlayer from "@/components/viewer/VideoPlayer";
import MemoryFolder from "@/components/viewer/MemoryFolder";
import mailboxClosed from "@/assets/mailbox-closed.jpg";
import mailboxOpen from "@/assets/mailbox-open.jpg";

type Stage = "envelope" | "quiz" | "balloons" | "video" | "folder";

const ViewLetter = () => {
  const { id } = useParams();
  const [letter, setLetter] = useState<StoredLetter | null>(null);
  const [stage, setStage] = useState<Stage>("envelope");
  const [notFound, setNotFound] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (id) {
      const found = getLetter(id);
      if (found) {
        setLetter(found);
      } else {
        setNotFound(true);
      }
    }
    // Preload mailbox frames immediately on route mount so the recipient
    // sees the image instantly, not a top-to-bottom progressive load.
    [mailboxClosed, mailboxOpen].forEach((src) => {
      const img = new Image();
      img.decoding = "async";
      img.src = src;
    });
  }, [id]);


  // Start music playback
  useEffect(() => {
    if (letter?.customMusicData && !audioRef.current) {
      const audio = new Audio(letter.customMusicData);
      audio.loop = true;
      audio.volume = 0.3;
      audio.play().catch(() => {});
      audioRef.current = audio;
    }
  }, [letter]);

  if (notFound) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{
        background: "linear-gradient(180deg, hsl(350 60% 95%), hsl(340 50% 90%))",
      }}>
        <div className="text-center px-6">
          <p className="text-5xl mb-4">💌</p>
          <h1 className="font-display text-2xl font-bold mb-2" style={{ color: "hsl(0 20% 20%)" }}>
            Letter Not Found
          </h1>
          <p className="font-body text-base" style={{ color: "hsl(0 15% 55%)" }}>
            This letter may have been removed or the link is incorrect.
          </p>
        </div>
      </div>
    );
  }

  if (!letter) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{
        background: "linear-gradient(180deg, hsl(350 60% 95%), hsl(340 50% 90%))",
      }}>
        <div className="text-center">
          <div className="flex justify-center gap-1 mb-3">
            {[0,1,2].map(i => (
              <div key={i} className="w-2.5 h-2.5 rounded-full animate-pulse" style={{
                background: "hsl(340 80% 70%)",
                animationDelay: `${i * 0.2}s`,
              }} />
            ))}
          </div>
          <p className="font-body text-sm" style={{ color: "hsl(0 15% 55%)" }}>Loading your letter...</p>
        </div>
      </div>
    );
  }

  const getNextStage = (current: Stage): Stage | null => {
    const hasQuiz = letter.quiz && letter.quiz.length > 0;
    const isBirthday = letter.type === "birthday";
    const hasMedia = letter.videos.length > 0 || letter.audios.length > 0;

    const flow: Stage[] = ["envelope"];
    if (hasQuiz) flow.push("quiz");
    if (isBirthday) flow.push("balloons");
    if (hasMedia) flow.push("video");
    flow.push("folder");

    const idx = flow.indexOf(current);
    return idx < flow.length - 1 ? flow[idx + 1] : null;
  };

  const advance = () => {
    const next = getNextStage(stage);
    if (next) setStage(next);
  };

  return (
    <AnimatePresence mode="wait">
      {stage === "envelope" && (
        <EnvelopeReveal key="envelope" receiverName={letter.receiverName || "Someone Special"} onContinue={advance} />
      )}
      {stage === "quiz" && (
        <QuizExperience key="quiz" questions={letter.quiz} onComplete={advance} />
      )}
      {stage === "balloons" && (
        <BalloonGame key="balloons" onComplete={advance} />
      )}
      {stage === "video" && (
        <VideoPlayer key="video" videos={letter.videos} audios={letter.audios} onContinue={advance} />
      )}
      {stage === "folder" && (
        <MemoryFolder
          key="folder"
          letterText={letter.letterText}
          senderName={letter.senderName || "Someone"}
          receiverName={letter.receiverName || "Someone Special"}
          images={letter.images}
        />
      )}
    </AnimatePresence>
  );
};

export default ViewLetter;
