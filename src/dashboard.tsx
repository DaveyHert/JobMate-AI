import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Dashboard from "./components/dashboard/Dashboard";
import "./index.css";
import { ThemeProvider } from "./context/ThemeContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <Dashboard />
    </ThemeProvider>
  </StrictMode>
);
