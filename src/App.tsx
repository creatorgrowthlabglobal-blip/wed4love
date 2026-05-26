import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CreateLetter from "./pages/CreateLetter";
import LetterReady from "./pages/LetterReady";
import LetterHistory from "./pages/LetterHistory";
import ViewLetter from "./pages/ViewLetter";
import NotFound from "./pages/NotFound";
import { saveLetter, getLetter } from "./lib/letterStorage";

// Seed a test letter for dev testing
const TEST_ID = "demo-jungey";
if (!getLetter(TEST_ID)) {
  saveLetter({
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/create-letter" element={<CreateLetter />} />
          <Route path="/letter-ready/:id" element={<LetterReady />} />
          <Route path="/letter-history" element={<LetterHistory />} />
          <Route path="/view/:id" element={<ViewLetter />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
