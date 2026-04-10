import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import DashboardApp from "./components/dashboard/DashboardApp";
import "./index.css";
import { ThemeProvider } from "./context/ThemeContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <DashboardApp />
      <Toaster position="bottom-right" richColors closeButton />
    </ThemeProvider>
  </StrictMode>
);
