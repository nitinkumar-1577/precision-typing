import { useRef, useEffect, useState, memo } from "react";
import { Home, Volume2, VolumeX } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PersonalBestBadge } from "@/components/PersonalBestBadge";

interface TypingScreenProps {
  text: string;
  userInput: string;
  currentIndex: number;
  timeLeft: number;
  wpm: number;
  accuracy: number;
  isRunning: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onInput: (value: string) => void;
  onHome: () => void;
  onSubmit: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  personalBest: number;
}

const CharSpan = memo(function CharSpan({
  char, state,
}: {
  char: string; state: "correct" | "incorrect" | "pending" | "current";
}) {
  let className = "text-muted-foreground";
  if (state === "correct") className = "text-success";
  else if (state === "incorrect") className = "bg-incorrect-bg text-error";
  else if (state === "current") className = "bg-primary/20 text-foreground";

  return <span className={className}>{char}</span>;
});

export function TypingScreen({
  text, userInput, currentIndex, timeLeft, wpm, accuracy, isRunning,
  soundEnabled, onToggleSound, onInput, onHome, onSubmit,
  isDark, onToggleTheme, personalBest,
}: TypingScreenProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const textDisplayRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(true);

  useEffect(() => { textareaRef.current?.focus(); }, []);

  useEffect(() => {
    if (textDisplayRef.current) {
      const el = textDisplayRef.current.querySelector('[data-current="true"]');
      if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [currentIndex]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex items-center justify-between border-b border-border px-7 py-10 sm:px-6">
        <div className="flex items-center gap-4 sm:gap-6 text-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Time:</span>
            <span className="font-mono font-semibold text-foreground tabular-nums">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">WPM:</span>
            <span className="font-mono font-semibold text-foreground tabular-nums">{wpm}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Acc:</span>
            <span className="font-mono font-semibold text-foreground tabular-nums">{accuracy}%</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PersonalBestBadge wpm={personalBest} />
          <button onClick={onToggleSound} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground" title={soundEnabled ? "Mute" : "Unmute"}>
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
          <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
          <button onClick={onHome} className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center px-4 pt-6 sm:px-6">
        <div className="w-full max-w-6xl">
          {!isFocused && (
            <div className="mb-2 cursor-pointer rounded-md bg-current-bg px-3 py-1.5 text-center text-sm text-muted-foreground" onClick={() => textareaRef.current?.focus()}>
              Click here to continue typing
            </div>
          )}

          <div
            ref={textDisplayRef}
            className="relative mb-4 max-h-[55vh] overflow-y-auto rounded-lg border border-border bg-card p-4 sm:p-6 font-mono text-base leading-8 cursor-text select-none"
            onClick={() => textareaRef.current?.focus()}
          >
            {text.split("").map((char, i) => {
              let state: "correct" | "incorrect" | "pending" | "current" = "pending";
              if (i < currentIndex) state = userInput[i] === char ? "correct" : "incorrect";
              else if (i === currentIndex) state = "current";
              return <CharSpan key={i} char={char} state={state} />;
            })}
          </div>

          <div className="flex justify-center">
            <button onClick={onSubmit} className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              Submit Test
            </button>
          </div>

          <textarea
            ref={textareaRef}
            value={userInput}
            onChange={(e) => onInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Tab") e.preventDefault(); }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="absolute -left-[9999px] h-0 w-0 opacity-0"
            autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
