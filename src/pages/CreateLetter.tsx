import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import FloatingHearts from "@/components/FloatingHearts";
import CheckoutOverlay from "@/components/CheckoutOverlay";
import ProgressBar from "@/components/letter/ProgressBar";
import LetterTypeSelection from "@/components/letter/LetterTypeSelection";
import SenderReceiverDetails from "@/components/letter/SenderReceiverDetails";
import LetterWriting from "@/components/letter/LetterWriting";
import MediaUpload from "@/components/letter/MediaUpload";
import MusicSelection from "@/components/letter/MusicSelection";
import PreviewPayment from "@/components/letter/PreviewPayment";
import { fileToBase64, filesToBase64, saveLetter } from "@/lib/letterStorage";
import { getCurrentUser } from "@/lib/auth";
import {
  WHOP_LETTER_CHECKOUT,
  buildWhopCheckoutUrl,
  fetchEntitlement,
  hasActiveLetterAccess,
} from "@/lib/whop";
import { toast } from "@/hooks/use-toast";



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
  const [redirecting, setRedirecting] = useState<null | "checkout" | "create">(null);

  const handleSelectType = (type: "love" | "birthday", tmpl: "photo" | "purple") => {
    setLetterType(type);
    setTemplate(tmpl);
    setStep(1);
  };

  const handlePay = async () => {
    const letterId = Math.random().toString(36).substring(2, 10);
    const user = getCurrentUser();

    // Save the letter first so it exists whether we pay or skip the paywall.
    const imgData = await filesToBase64(images);
    let customMusicData: string | null = null;
    if (customMusic) {
      customMusicData = await fileToBase64(customMusic);
    }

    await saveLetter({
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
      email: user?.email || "",
      date: new Date().toLocaleDateString(),
      template,
    });

    // Returning user with active letter access → skip Whop, create immediately.
    if (user?.email) {
      try {
        const ent = await fetchEntitlement(user.email);
        if (hasActiveLetterAccess(ent)) {
          setRedirecting("create");
          toast({
            title: "Welcome back 💌",
            description: "Your monthly access is active — creating your letter now.",
          });
          setTimeout(() => navigate(`/letter-ready/${letterId}`, { replace: true }), 600);
          return;
        }
      } catch (e) {
        console.warn("[CreateLetter] entitlement check failed, falling through to paywall", e);
      }
    }

    // Otherwise → Whop checkout. Persist context so /payment-status can recover
    // it even if Whop strips our redirect query params.
    setRedirecting("checkout");
    try {
      sessionStorage.setItem(
        "wish4love_pending_payment_v1",
        JSON.stringify({ product: "letter", letterId, email: user?.email || "", ts: Date.now() })
      );
    } catch {}
    const redirectTo = `${window.location.origin}/payment-status?product=letter&letter_id=${letterId}`;
    const checkoutUrl = buildWhopCheckoutUrl(WHOP_LETTER_CHECKOUT, {
      email: user?.email,
      redirectTo,
      metadata: {
        letter_id: letterId,
        // app_email is the email the user is signed in with — webhook will
        // grant entitlement to THIS email even if user changes it at Whop.
        app_email: user?.email || "",
      },
    });
    window.location.href = checkoutUrl;
  };



  return (
    <div
      className="min-h-screen gradient-blush relative"
    >
      {step !== 5 && <Header />}
      <FloatingHearts count={5} />
      <main className={`relative z-10 ${step === 5 ? "pt-8" : "pt-36 sm:pt-28"} pb-20 px-4 sm:px-6`}>
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
                customMusic,
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
      {redirecting && (
        <CheckoutOverlay
          message={
            redirecting === "create"
              ? "Your monthly access is active — preparing your letter…"
              : undefined
          }
        />
      )}
      </main>
    </div>
  );
};

export default CreateLetter;
