import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import {Analytics} from "@vercel/analytics/react";
import Footer from "./components/Footer";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen flex flex-col"> {/* Ise add karein taki footer niche rahe */}
          <div className="flex-grow">
            <Routes>
              <Route path="/" element={<Index />} />
            </Routes>
          </div>
          <Footer /> {/* Aapka Brand aur Privacy yahan dikhega */}
        </div>
      </BrowserRouter>
      <Analytics />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
