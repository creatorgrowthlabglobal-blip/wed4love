import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import CreateLetter from "./pages/CreateLetter";
import LetterReady from "./pages/LetterReady";
import LetterHistory from "./pages/LetterHistory";
import ViewLetter from "./pages/ViewLetter";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import PaymentStatus from "./pages/PaymentStatus";
import PaymentDebug from "./pages/PaymentDebug";
import Demo from "./pages/Demo";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Refund from "./pages/Refund";
import Contact from "./pages/Contact";
import { saveLetterLocal, getLetterLocal } from "./lib/letterStorage";
import { getCurrentUser } from "./lib/auth";

// Seed a test letter for dev testing
const TEST_ID = "demo-jungey";
if (!getLetterLocal(TEST_ID)) {
  saveLetterLocal({
    id: TEST_ID,
    type: "love",
    senderName: "Alex",
    receiverName: "Jungey",
    letterText: "Every moment with you feels like a dream I never want to wake up from. You are my sunshine on cloudy days, my calm in every storm. I love you more than words could ever say. 💕",
    images: [],
    videos: [],
    audios: [],
    selectedMusic: null,
    quiz: [{ question: "What's our favorite place?", options: ["Beach", "Mountains", "Paris", "Home"], correctAnswer: "Home" }],
    email: "test@example.com",
    date: new Date().toISOString(),
  });
}
const ENVELOPE_TEST_ID = "demo-envelope";
if (!getLetterLocal(ENVELOPE_TEST_ID)) {
  saveLetterLocal({
    id: ENVELOPE_TEST_ID,
    type: "love",
    senderName: "Alex",
    receiverName: "Someone Special",
    letterText: "Every moment with you feels like a dream I never want to wake up from.",
    images: [],
    videos: [],
    audios: [],
    selectedMusic: null,
    quiz: [],
    email: "test@example.com",
    date: new Date().toISOString(),
    template: "purple",
  });
}

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  if (!getCurrentUser()) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/" element={<Index />} />
          <Route path="/create-letter" element={<ProtectedRoute><CreateLetter /></ProtectedRoute>} />
          <Route path="/letter-ready/:id" element={<ProtectedRoute><LetterReady /></ProtectedRoute>} />
          <Route path="/letter-history" element={<ProtectedRoute><LetterHistory /></ProtectedRoute>} />
          <Route path="/view/:id" element={<ViewLetter />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/payment-status" element={<PaymentStatus />} />
          <Route path="/payment-debug" element={<PaymentDebug />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/refund" element={<Refund />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
