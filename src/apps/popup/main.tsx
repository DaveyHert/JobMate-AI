import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import "./index.css";
import App from "./App";
import { ThemeProvider } from "./context/ThemeContext";

// Without ThemeProvider here, useThemeContext() inside <App /> falls back to
// the no-op default and the popup's <html> class never gets set — so dark
// mode never takes effect in the popup, even though the dashboard works.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
      <Toaster position="bottom-center" richColors closeButton />
    </ThemeProvider>
  </StrictMode>
);
