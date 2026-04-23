import { Button } from "@/components/ui/button";
import { Home, RotateCcw } from "lucide-react";
import { useMemo } from "react";

interface ResultScreenProps {
  wpm: number;
  grossWpm: number;
  accuracy: number;
  errorCount: number;
  halfMistakes: number;
  fullMistakes: number;
  duration: number;
  timeLeft: number;
  text: string;
  userInput: string;
  onHome: () => void;
  onRestart: () => void;
}

export function ResultScreen({
  wpm, grossWpm, accuracy, errorCount, halfMistakes, fullMistakes,
  duration, timeLeft, text, userInput, onHome, onRestart,
}: ResultScreenProps) {
  const timeTaken = duration * 60 - timeLeft;
  const minutesTaken = Math.floor(timeTaken / 60);
  const secondsTaken = timeTaken % 60;

  const highlightedText = useMemo(() => {
    const chars: { char: string; correct: boolean }[] = [];
    for (let i = 0; i < userInput.length && i < text.length; i++) {
      chars.push({ char: text[i], correct: userInput[i] === text[i] });
    }
    return chars;
  }, [text, userInput]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex flex-1 flex-col items-center px-4 py-6 sm:px-6 overflow-y-auto">
        <div className="w-full max-w-5xl space-y-6">
          <h2 className="text-center text-xl font-semibold text-foreground">Test Complete</h2>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Net WPM" value={String(wpm)} highlight />
            <StatCard label="Gross WPM" value={String(grossWpm)} />
            <StatCard label="Accuracy" value={`${accuracy}%`} />
            <StatCard label="Time" value={`${minutesTaken}m ${secondsTaken}s`} />
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-lg font-semibold text-error tabular-nums">{errorCount}</div>
                <div className="text-xs text-muted-foreground">Total Errors</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-foreground tabular-nums">{halfMistakes}</div>
                <div className="text-xs text-muted-foreground">Half Mistakes</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-foreground tabular-nums">{fullMistakes}</div>
                <div className="text-xs text-muted-foreground">Full Mistakes</div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-medium text-foreground mb-3">Your Typed Text</h3>
            <div className="font-mono text-sm leading-7 max-h-[40vh] overflow-y-auto">
              {highlightedText.map((item, i) => (
                <span key={i} className={item.correct ? "text-success" : "bg-incorrect-bg text-error"}>
                  {item.char}
                </span>
              ))}
              {userInput.length < text.length && (
                <span className="text-muted-foreground/40">{text.slice(userInput.length)}</span>
              )}
            </div>
          </div>

          {/* Single bottom action row */}
          <div className="flex space-x-20">
            <div className="flex justify-center w-full space-x-20">
            <Button variant="outline" className="px-16 gap-2" onClick={onHome}>
              <Home className="h-4 w-4" /> Home
            </Button>
            <Button className="px-16 gap-2" onClick={onRestart}>
              <RotateCcw className="h-4 w-4" /> Retry
            </Button></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 text-center">
      <div className={`text-xl font-bold tabular-nums ${highlight ? "text-primary" : "text-foreground"}`}>{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
