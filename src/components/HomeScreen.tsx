import { Button } from "@/components/ui/button";
import { Keyboard, Type, FileText } from "lucide-react";
import { InputMode } from "@/hooks/useTypingEngine";
import { getParagraphCount } from "@/lib/paragraphs";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PersonalBestBadge } from "@/components/PersonalBestBadge";
import { HistoryTable } from "@/components/HistoryTable";
import type { TestResult } from "@/hooks/useHistory";

interface HomeScreenProps {
  wordCount: number;
  setWordCount: (n: number) => void;
  keystrokeCount: number;
  setKeystrokeCount: (n: number) => void;
  duration: number;
  setDuration: (d: number) => void;
  inputMode: InputMode;
  setInputMode: (m: InputMode) => void;
  selectedParagraphId: number;
  setSelectedParagraphId: (id: number) => void;
  customParagraph: string;
  setCustomParagraph: (t: string) => void;
  onStart: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  personalBest: number;
  history: TestResult[];
}

export function HomeScreen({
  wordCount,
  setWordCount,
  keystrokeCount,
  setKeystrokeCount,
  duration,
  setDuration,
  inputMode,
  setInputMode,
  selectedParagraphId,
  setSelectedParagraphId,
  customParagraph,
  setCustomParagraph,
  onStart,
  isDark,
  onToggleTheme,
  personalBest,
  history,
}: HomeScreenProps) {
  const paragraphCount = getParagraphCount();

  const handleWordChange = (val: number) => {
    const clamped = Math.min(2000, Math.max(1, val));
    setWordCount(clamped);
    setKeystrokeCount(clamped * 5);
  };

  const handleKeystrokeChange = (val: number) => {
    const clamped = Math.min(10000, Math.max(5, val));
    setKeystrokeCount(clamped);
    setWordCount(Math.ceil(clamped / 5));
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center bg-background p-4 overflow-hidden">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-primary/8 blur-[150px]" />
        <div className="absolute right-1/4 bottom-1/3 h-[300px] w-[300px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      {/* Top bar */}
      <div className="relative z-10 flex w-full max-w-5xl items-center justify-between mb-4 pt-2">
        <PersonalBestBadge wpm={personalBest} />
        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
      </div>

      <div className="relative z-10 flex flex-1 items-center justify-center w-full">
        <div className="w-full max-w-5xl space-y-5">
          {/* Header */}
          <div className="text-center space-y-1.5">
            <div className="flex items-center justify-center gap-2.5 mb-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Keyboard className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Precision Typing Test</h1>
            </div>
            <p className="text-sm text-muted-foreground">Practice with exam-standard accuracy</p>
          </div>

          {/* Card */}
          <div className="space-y-4 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-5 shadow-lg shadow-primary/5">
            {/* Mode Tabs */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Type className="h-3.5 w-3.5" /> Mode
              </label>
              <div className="flex rounded-xl border border-border/50 overflow-hidden">
                {(["words", "keystrokes", "paragraph"] as InputMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setInputMode(mode)}
                    className={`flex-1 px-3 py-2 text-sm font-medium capitalize transition-all duration-200 ${
                      inputMode === mode
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-card/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Word Mode */}
            {inputMode === "words" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground">Words (1–2000)</label>
                    <input
                      type="number" min={1} max={2000} value={wordCount}
                      onChange={(e) => { const v = parseInt(e.target.value);  handleWordChange(v); }}
                      className="w-full rounded-xl border border-input bg-background/80 px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring transition-shadow"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground">Keystrokes</label>
                    <input
                      type="number" min={5} max={10000} value={keystrokeCount}
                      onChange={(e) => { const v = parseInt(e.target.value);  handleKeystrokeChange(v); }}
                      className="w-full rounded-xl border border-input bg-background/80 px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring transition-shadow"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Keystroke Mode */}
            {inputMode === "keystrokes" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground">Keystrokes (5–10000)</label>
                    <input
                      type="number" min={5} max={10000} value={keystrokeCount}
                      onChange={(e) => { const v = parseInt(e.target.value); handleKeystrokeChange(v); }}
                      className="w-full rounded-xl border border-input bg-background/80 px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring transition-shadow"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground">Words</label>
                    <input
                      type="number" min={1} max={2000} value={wordCount}
                      onChange={(e) => { const v = parseInt(e.target.value); if (!isNaN(v)) handleWordChange(v); }}
                      className="w-full rounded-xl border border-input bg-background/80 px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring transition-shadow"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Paragraph Mode */}
            {inputMode === "paragraph" && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Select Paragraph (1–{paragraphCount})</label>
                  <select
                    value={selectedParagraphId}
                    onChange={(e) => setSelectedParagraphId(parseInt(e.target.value))}
                    className="w-full rounded-xl border border-input bg-background/80 px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring transition-shadow"
                  >
                    {Array.from({ length: paragraphCount }, (_, i) => (
                      <option key={i + 1} value={i + 1}>Paragraph {i + 1}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Or paste custom paragraph</label>
                  <textarea
                    value={customParagraph}
                    onChange={(e) => setCustomParagraph(e.target.value)}
                    placeholder="Paste your own paragraph here..."
                    rows={3}
                    className="w-full rounded-xl border border-input bg-background/80 px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring resize-none transition-shadow"
                  />
                </div>
              </div>
            )}

            {/* Duration - Manual Input */}
            <div className="flex justify-center space-y-0 space-x-20">
              <label className="text-sm font-medium text-foreground ">Duration (1–20 minutes)</label>
              <input
                type="number" min={1} max={20} value={duration}
                onChange={(e) => {
                  const v = parseInt(e.target.value);
                 setDuration(Math.min(20, Math.max(1, v)));
                }}
                className="w-full rounded-xl border border-input bg-background/80 px-5 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring transition-shadow"
              />
            </div>
<div className="flex justify-center w-full">
            <Button onClick={onStart} className="w-fit mx-auto px-8 py-2 shadow-sm rounded-xl" size="default">
              <FileText className="h-4 w-4 mr-2" />
              Start Typing Test
            </Button></div>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Default: 50 words · 250 keystrokes · 10 minutes
          </p>

          {/* History Table */}
          <HistoryTable history={history} />
        </div>
      </div>
    </div>
  );
}
