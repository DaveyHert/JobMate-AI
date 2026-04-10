// ============================================================================
// ThemeContext — system / light / dark theme support
// ============================================================================
// Three preferences:
//   "system" — follows the OS dark-mode setting (default)
//   "light"  — always light
//   "dark"   — always dark
//
// Bug fix: always write to localStorage as a sync cache so getInitialPreference
// can read it synchronously before the async chrome.storage hydration completes.
// Without this, every page load fell back to the system preference (dark on most
// systems) until chrome.storage resolved, causing flicker and lost preferences.
// ============================================================================

import {
  createContext,
  ReactNode,
  useLayoutEffect,
  useState,
  useEffect,
  useCallback,
} from "react";

export type ThemePreference = "light" | "dark" | "system";
export type AppliedTheme = "light" | "dark";

interface ThemeContextValue {
  theme: AppliedTheme;             // actually applied theme
  preference: ThemePreference;     // stored user preference
  setPreference: (p: ThemePreference) => void;
  toggleTheme: () => void;         // toggles between light/dark (for simple toggles)
}

export const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  preference: "system",
  setPreference: () => {},
  toggleTheme: () => {},
});

function getInitialPreference(): ThemePreference {
  if (typeof window === "undefined") return "system";
  // Always read from localStorage (kept in sync as a cache, even in extension context)
  const saved = localStorage.getItem("themePreference") as ThemePreference | null;
  if (saved === "light" || saved === "dark" || saved === "system") return saved;
  // Migrate from old "theme" key (used before system mode was added)
  const legacy = localStorage.getItem("theme") as ThemePreference | null;
  if (legacy === "light" || legacy === "dark") return legacy;
  return "system";
}

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [preference, setPreferenceState] = useState<ThemePreference>(getInitialPreference);
  const [systemDark, setSystemDark] = useState<boolean>(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  // Reactively track system dark-mode changes
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Derived applied theme
  const theme: AppliedTheme =
    preference === "system" ? (systemDark ? "dark" : "light") : preference;

  // Sync DOM class before first paint to avoid flash
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  // Hydrate from chrome.storage on mount and subscribe to cross-context changes.
  // Reads both the new key ("themePreference") and the legacy key ("theme").
  useEffect(() => {
    if (typeof chrome === "undefined" || !chrome.storage?.local) return;

    chrome.storage.local.get(["themePreference", "theme"]).then((result) => {
      const stored = (result.themePreference ?? result.theme) as ThemePreference | undefined;
      if (stored === "light" || stored === "dark" || stored === "system") {
        setPreferenceState((current) => (current === stored ? current : stored));
      }
    });

    const listener = (
      changes: { [key: string]: chrome.storage.StorageChange },
      area: string
    ) => {
      if (area !== "local") return;
      const next = (changes.themePreference?.newValue ??
        changes.theme?.newValue) as ThemePreference | undefined;
      if (next === "light" || next === "dark" || next === "system") {
        setPreferenceState((current) => (current === next ? current : next));
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  // Persist on every preference change.
  // Always write localStorage (sync cache) so next page load reads it immediately.
  useEffect(() => {
    localStorage.setItem("themePreference", preference);
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.set({ themePreference: preference });
    }
  }, [preference]);

  const setPreference = useCallback((p: ThemePreference) => {
    setPreferenceState(p);
  }, []);

  // toggleTheme flips between light/dark (ignores/exits system mode).
  // Used by simple on/off toggles in the popup settings.
  const toggleTheme = useCallback(() => {
    setPreferenceState(theme === "dark" ? "light" : "dark");
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, preference, setPreference, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
