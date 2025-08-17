import {
  createContext,
  ReactNode,
  useLayoutEffect,
  useState,
  useEffect,
  useCallback,
} from "react";

type Theme = "light" | "dark";

interface ThemeContext {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContext>({
  theme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
});

// helper to set initial value: check storage synchronously if we can, otherwise default.
const getInitial = (): Theme => {
  if (typeof window === "undefined") return "light"; //server or background service worker guard

  const savedTheme = localStorage.getItem("theme") as Theme | null;
  return (
    savedTheme ??
    (window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light")
  );
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(getInitial);

  // Sync DOM class before first paint
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  // Persist on every theme changes
  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.set({ theme });
    } else {
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  const toggleTheme = useCallback(
    () => setTheme((theme) => (theme === "light" ? "dark" : "light")),
    []
  );

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
