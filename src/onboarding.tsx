import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import "./index.css";
import { OnboardingApp } from "./pages/onboarding/OnboardingApp";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <OnboardingApp />
    <Toaster position="bottom-right" richColors closeButton />
  </StrictMode>
);
