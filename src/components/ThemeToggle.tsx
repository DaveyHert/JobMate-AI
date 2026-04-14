
import { Sun, Moon, Monitor, LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Types and Constants
 */
type Theme = "light" | "dark" | "system";

interface ThemeOption {
  id: Theme;
  label: string;
  Icon: LucideIcon;
}

const THEME_OPTIONS: readonly ThemeOption[] = [
  { id: "light", label: "Light", Icon: Sun },
  { id: "dark", label: "Dark", Icon: Moon },
  { id: "system", label: "System", Icon: Monitor },
] as const;

interface ThemeToggleProps {
  theme: Theme;
  onChange: (theme: Theme) => void;
  className?: string;
}

/**
 * A segmented control theme toggle featuring spring-animated background transitions.
 */
export default function ThemeToggle({
  theme,
  onChange,
  className = "",
}: ThemeToggleProps) {
  return (
    <div 
      className={`bg-brand-brand-muted inline-flex items-center rounded-full p-1 ${className}`}
      role="radiogroup"
      aria-label="Theme preference"
    >
      {THEME_OPTIONS.map(({ id, label, Icon }) => {
        const isActive = theme === id;

        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={`Switch to ${label} theme`}
            onClick={() => onChange(id)}
            className={`
              relative flex h-8 w-10 items-center justify-center rounded-full 
              transition-colors duration-200 outline-none focus-visible:ring-2 
              focus-visible:ring-ring focus-visible:ring-offset-2
              ${isActive ? "text-foreground" : "text-brand-muted-foreground hover:text-foreground"}
            `}
          >
            {isActive && (
              <motion.div
                layoutId="theme-active-indicator"
                className="bg-background absolute inset-0 rounded-full border border-black/5 shadow-sm dark:border-white/5"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            
            <Icon 
              className="relative z-10 h-[18px] w-[18px]" 
              strokeWidth={2.5} 
            />
          </button>
        );
      })}
    </div>
  );
}