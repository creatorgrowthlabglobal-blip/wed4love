import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { getLetter, StoredLetter } from "@/lib/letterStorage";
import { getPresetById } from "@/lib/musicPresets";
import EnvelopeReveal from "@/components/viewer/EnvelopeReveal";
import FramedScene from "@/components/viewer/FramedScene";

import QuizExperience from "@/components/viewer/QuizExperience";
import BalloonGame from "@/components/viewer/BalloonGame";
import VideoPlayer from "@/components/viewer/VideoPlayer";
import MemoryFolder from "@/components/viewer/MemoryFolder";
import RealisticMailbox from "@/components/viewer/RealisticMailbox";
import PurpleMailbox from "@/components/viewer/PurpleMailbox";
import mailboxClosed from "@/assets/mailbox-closed.jpg";
import mailboxOpen from "@/assets/mailbox-open.jpg";

type Stage = "mailbox" | "envelope" | "quiz" | "balloons" | "video" | "folder";

const ViewLetter = () => {
  const { id } = useParams();
  const [letter, setLetter] = useState<StoredLetter | null>(null);
  const [stage, setStage] = useState<Stage>("mailbox"); // overridden below for purple template
  const [notFound, setNotFound] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (id) {
      getLetter(id).then((found) => {
        if (cancelled) return;
        if (found) {
          setLetter(found);
          if ((found.template || "photo") === "purple") {
            setStage("envelope");
          }
        } else {
          setNotFound(true);
        }
      });
    }
    [mailboxClosed, mailboxOpen].forEach((src) => {
      const img = new Image();
      img.decoding = "async";
      img.src = src;
    });
    return () => { cancelled = true; };
  }, [id]);


  const startMusic = () => {
    if (!letter) return;
    const preset = getPresetById(letter.selectedMusic);
    const src = preset?.url || letter.customMusicData;
    if (!src) {
      console.warn("[ViewLetter] No music source", { selectedMusic: letter.selectedMusic, hasCustom: !!letter.customMusicData });
      return;
    }
    if (!audioRef.current) {
      const audio = new Audio(src);
      audio.loop = true;
      audio.volume = 0.3;
      audioRef.current = audio;
    }
    const audio = audioRef.current;
    if (!audio.paused) return;
    audio.play().then(() => {
      console.log("[ViewLetter] Music started:", src);
    }).catch((e) => {
      console.warn("[ViewLetter] Music play blocked, will retry on next interaction:", e);
    });
  };

  // Start music on the first user interaction anywhere on the page.
  // Keep retrying on each interaction until play() actually succeeds,
  // in case the first attempt was blocked by autoplay policy.
  useEffect(() => {
    if (!letter) return;
    const handler = () => {
      startMusic();
      if (audioRef.current && !audioRef.current.paused) {
        window.removeEventListener("pointerdown", handler, true);
        window.removeEventListener("touchstart", handler, true);
        window.removeEventListener("click", handler, true);
        window.removeEventListener("keydown", handler, true);
      }
    };
    window.addEventListener("pointerdown", handler, true);
    window.addEventListener("touchstart", handler, true);
    window.addEventListener("click", handler, true);
    window.addEventListener("keydown", handler, true);
    return () => {
      window.removeEventListener("pointerdown", handler, true);
      window.removeEventListener("touchstart", handler, true);
      window.removeEventListener("click", handler, true);
      window.removeEventListener("keydown", handler, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const flow: Stage[] = ["mailbox", "envelope"];
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

  const template = letter.template || "photo";

  return (
    <>
      <AnimatePresence mode="wait">
      {stage === "mailbox" && template === "purple" && (
        <FramedScene key="mailbox-purple">
          <PurpleMailbox className="w-full h-full" onContinue={advance} senderName={letter.senderName} />
        </FramedScene>
      )}
      {stage === "mailbox" && template !== "purple" && (
        <motion.div
          key="mailbox-photo"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            background: "radial-gradient(ellipse at 50% 35%, #FDF1F5 0%, #F6DCE5 55%, #EFC9D6 100%)",
          }}
        >
          <RealisticMailbox className="w-full h-full" onContinue={advance} senderName={letter.senderName} />
        </motion.div>
      )}
      {stage === "envelope" && (
        <FramedScene key="envelope">
          <EnvelopeReveal
            receiverName={letter.receiverName || "Someone Special"}
            senderName={letter.senderName}
            letterText={letter.letterText}
            images={letter.images}
            onLetterOpen={startMusic}
            onContinue={advance}
          />
        </FramedScene>
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
    </>
  );
};

export default ViewLetter;
