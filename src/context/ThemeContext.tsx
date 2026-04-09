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

  // Hydrate from chrome.storage on mount and subscribe to cross-context
  // changes. Without this, popup and dashboard each boot from their own
  // synchronous source (localStorage / system pref) and never see what the
  // other extension context saved. The functional updater in setTheme avoids
  // a re-render loop with the persist effect below.
  useEffect(() => {
    if (typeof chrome === "undefined" || !chrome.storage?.local) return;

    chrome.storage.local.get(["theme"]).then((result) => {
      const stored = result.theme as Theme | undefined;
      if (stored === "light" || stored === "dark") {
        setTheme((current) => (current === stored ? current : stored));
      }
    });

    const listener = (
      changes: { [key: string]: chrome.storage.StorageChange },
      area: string
    ) => {
      if (area !== "local") return;
      const next = changes.theme?.newValue as Theme | undefined;
      if (next === "light" || next === "dark") {
        setTheme((current) => (current === next ? current : next));
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  // Persist on every theme change
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
