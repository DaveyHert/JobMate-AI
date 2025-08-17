import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

export function useThemeContext() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useThemeContext must be used inside an ThemeProvider");
  }
  return context;
}
