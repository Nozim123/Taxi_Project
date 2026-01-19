import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import RidePage from "./pages/RidePage";
import DriverPage from "./pages/DriverPage";
import DriverRegisterPage from "./pages/DriverRegisterPage";
import AdminPage from "./pages/AdminPage";
import AuthPage from "./pages/AuthPage";
import RideHistoryPage from "./pages/RideHistoryPage";
import ProfilePage from "./pages/ProfilePage";
import { InstallPage } from "./components/pwa/InstallPrompt";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/ride" element={<RidePage />} />
            <Route path="/driver" element={<DriverPage />} />
            <Route path="/driver/register" element={<DriverRegisterPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/history" element={<RideHistoryPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/install" element={<InstallPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
