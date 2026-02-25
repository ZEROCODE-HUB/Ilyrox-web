import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Notifications from "./pages/Notifications";
import SavedProperties from "./pages/SavedProperties";
import Auth from "./pages/Auth";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import ProgramFamilies from "./pages/ProgramFamilies";
import { sileo, Toaster as ToasterSileo } from "sileo";

const queryClient = new QueryClient();

const App = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Index />,
    },
    {
      path: "/auth",
      element: <Auth />,
    },
    {
      path: "/notifications",
      element: <Notifications />,
    },
    {
      path: "/saved",
      element: <SavedProperties />,
    },
    {
      path: "/privacy",
      element: <PrivacyPolicy />,
    },
    {
      path: "/terms",
      element: <TermsAndConditions />,
    },
    {
      path: "/programs-families",
      element: <ProgramFamilies />,
    },
    {
      path: "*",
      element: <NotFound />,
    },
  ]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <ToasterSileo />
            <RouterProvider router={router} />
          </TooltipProvider>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
