import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import "@/index.css";
import { OnboardingApp } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <OnboardingApp />
    <Toaster position='top-right' richColors closeButton />
  </StrictMode>,
);
