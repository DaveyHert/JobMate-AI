import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import PortalApp from "./App";
import "@/index.css";
import { ThemeProvider } from "@/context/ThemeContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <PortalApp />
      <Toaster position='top-right' richColors closeButton />
    </ThemeProvider>
  </StrictMode>,
);
