import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import FloatingHearts from "@/components/FloatingHearts";
import ProgressBar from "@/components/letter/ProgressBar";
import LetterTypeSelection from "@/components/letter/LetterTypeSelection";
import SenderReceiverDetails from "@/components/letter/SenderReceiverDetails";
import LetterWriting from "@/components/letter/LetterWriting";
import MediaUpload from "@/components/letter/MediaUpload";
import MusicSelection from "@/components/letter/MusicSelection";
import PreviewPayment from "@/components/letter/PreviewPayment";
import { fileToBase64, filesToBase64, saveLetter } from "@/lib/letterStorage";

const STEP_LABELS = ["Details", "Write", "Photos", "Music", "Preview"];

const CreateLetter = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [letterType, setLetterType] = useState<"love" | "birthday" | null>(null);
  const [template, setTemplate] = useState<"photo" | "purple">("photo");
  const [details, setDetails] = useState({
    senderName: "",
    receiverName: "",
    relationship: "",
    occasion: "",
    specialDate: "",
  });
  const [letterText, setLetterText] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [selectedMusic, setSelectedMusic] = useState<string | null>(null);
  const [customMusic, setCustomMusic] = useState<File | null>(null);

  const handleSelectType = (type: "love" | "birthday", tmpl: "photo" | "purple") => {
    setLetterType(type);
    setTemplate(tmpl);
    setStep(1);
  };

  const handlePay = async () => {
    const letterId = Math.random().toString(36).substring(2, 10);

    const imgData = await filesToBase64(images);

    let customMusicData: string | null = null;
    if (customMusic) {
      customMusicData = await fileToBase64(customMusic);
    }

    saveLetter({
      id: letterId,
      type: letterType || "love",
      senderName: details.senderName,
      receiverName: details.receiverName,
      letterText,
      images: imgData,
      videos: [],
      audios: [],
      selectedMusic,
      customMusicData,
      quiz: [],
      email: "",
      date: new Date().toLocaleDateString(),
      template,
    });

    navigate(`/letter-ready/${letterId}`);
  };

  return (
    <div
      className="min-h-screen gradient-blush relative"
    >
      <Header />
      <FloatingHearts count={5} />
      <main className="relative z-10 pt-36 sm:pt-28 pb-20 px-4 sm:px-6">
        {step > 0 && (
          <ProgressBar
            currentStep={step - 1}
            totalSteps={STEP_LABELS.length}
            stepLabels={STEP_LABELS}
          />
        )}

        <AnimatePresence mode="wait">
          {step === 0 && <LetterTypeSelection key="type" onSelect={handleSelectType} />}
          {step === 1 && <SenderReceiverDetails key="details" data={details} onChange={setDetails} onNext={() => setStep(2)} />}
          {step === 2 && <LetterWriting key="write" letterText={letterText} onChange={setLetterText} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
          {step === 3 && (
            <MediaUpload
              key="media"
              images={images}
              onImagesChange={setImages}
              onNext={() => setStep(4)}
              onBack={() => setStep(2)}
            />
          )}
          {step === 4 && (
            <MusicSelection
              key="music"
              selectedMusic={selectedMusic}
              customMusic={customMusic}
              onSelectMusic={setSelectedMusic}
              onCustomMusic={setCustomMusic}
              onNext={() => setStep(5)}
              onBack={() => setStep(3)}
            />
          )}
          {step === 5 && (
            <PreviewPayment
              key="preview"
              letterData={{
                senderName: details.senderName,
                receiverName: details.receiverName,
                letterText,
                images,
                selectedMusic,
                letterType,
              }}
              template={template}
              onTemplateChange={setTemplate}
              onPay={handlePay}
              onBack={() => setStep(4)}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default CreateLetter;
