import { memo } from "react";

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export const ThemeToggle = memo(function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-secondary"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      <svg width="18" height="18" viewBox="0 0 18 18">
        <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M9 1 A8 8 0 0 1 9 17 Z" fill="currentColor" />
      </svg>
    </button>
  );
});
