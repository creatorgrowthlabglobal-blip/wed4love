import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import InviteTemplates from "./pages/InviteTemplates";
import ChooseTemplate from "./pages/ChooseTemplate";
import CreateInvite from "./pages/CreateInvite";
import ViewInvite from "./pages/ViewInvite";
import RsvpDashboard from "./pages/RsvpDashboard";
import AuthPage from "./pages/AuthPage";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Refund from "./pages/Refund";
import Contact from "./pages/Contact";
import CustomInquiry from "./pages/CustomInquiry";
import MyInvitations from "./pages/MyInvitations";
import Demo from "./pages/Demo";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CurrencyProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/pricing" element={<InviteTemplates />} />
            <Route path="/choose-template" element={<ChooseTemplate />} />
            <Route path="/create-invite" element={<ProtectedRoute><CreateInvite /></ProtectedRoute>} />
            <Route path="/invite/:id" element={<ViewInvite />} />
            <Route path="/dashboard/:inviteId" element={<ProtectedRoute><RsvpDashboard /></ProtectedRoute>} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/refund" element={<Refund />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/custom-inquiry" element={<CustomInquiry />} />
            <Route path="/my-invitations" element={<ProtectedRoute><MyInvitations /></ProtectedRoute>} />
            <Route path="/demo" element={<Demo />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </CurrencyProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
