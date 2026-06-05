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
  createWhopCheckout,
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
    // Show overlay IMMEDIATELY. Force React to flush + browser to paint
    // BEFORE we start the heavy base64 encoding (which can lock the main
    // thread for several seconds on big photos/audio).
    setRedirecting("checkout");
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    );

    const letterId = Math.random().toString(36).substring(2, 10);
    const user = getCurrentUser();
    const email = user?.email || "";

    // PARALLELIZE the three slow things that used to run serially:
    //  1) entitlement check (network, ~300-800ms)
    //  2) Whop checkout creation (network, ~600-1500ms)
    //  3) base64 encode + saveLetter (CPU + localStorage, can be seconds)
    // The old flow waited for #3, then #1, then #2 — total = sum.
    // New flow = max(of all three), so checkout opens as soon as Whop responds.

    const redirectTo = `${window.location.origin}/payment-status?product=letter&letter_id=${letterId}`;

    try {
      sessionStorage.setItem(
        "wish4love_pending_payment_v1",
        JSON.stringify({ product: "letter", letterId, email, ts: Date.now() })
      );
    } catch {}

    const entitlementPromise = email
      ? fetchEntitlement(email).catch((e) => {
          console.warn("[CreateLetter] entitlement check failed", e);
          return null;
        })
      : Promise.resolve(null);

    const checkoutPromise = createWhopCheckout({
      product: "letter",
      app_email: email,
      letter_id: letterId,
      redirect_url: redirectTo,
    }).catch((e) => {
      console.error("[CreateLetter] create-checkout failed", e);
      return null;
    });

    // Kick off file encoding + save in parallel. We MUST await it before
    // navigating to /letter-ready (entitled user path), but for the paywall
    // path the letter just needs to exist by the time the user returns from
    // Whop — so we let it complete in the background while they're paying.
    const savePromise = (async () => {
      const imgData = await filesToBase64(images);
      let customMusicData: string | null = null;
      if (customMusic) customMusicData = await fileToBase64(customMusic);
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
        email,
        date: new Date().toLocaleDateString(),
        template,
      });
    })();

    // Returning user with active access → wait for save, skip Whop.
    const ent = await entitlementPromise;
    if (hasActiveLetterAccess(ent)) {
      setRedirecting("create");
      toast({
        title: "Welcome back 💌",
        description: "Your monthly access is active — creating your letter now.",
      });
      await savePromise.catch((e) => console.error("[CreateLetter] save failed", e));
      setTimeout(() => navigate(`/letter-ready/${letterId}`, { replace: true }), 600);
      return;
    }

    // Paywall path → redirect as soon as Whop URL is ready. saveLetter keeps
    // running in the background; payment-status will read it on return.
    const checkout = await checkoutPromise;
    if (!checkout?.purchase_url) {
      toast({
        title: "Couldn't open checkout",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
      setRedirecting(null);
      return;
    }
    // Make sure the letter is persisted before we navigate away — otherwise
    // a fast Whop response could redirect before localStorage is written.
    await savePromise.catch((e) => console.error("[CreateLetter] save failed", e));
    // Same-tab navigation is the most reliable across desktop + mobile +
    // in-app browsers. Avoids popup blockers that bite when the click
    // originated from a modal button (state update breaks the gesture chain).
    window.location.assign(checkout.purchase_url);
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
    </div>
  );
};

export default CreateLetter;
