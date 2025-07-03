import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Dashboard from "./components/dashboard/Dashboard";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Dashboard />
  </StrictMode>
);
