import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, ClipboardList, Download, Home, Printer, RotateCcw, Target, Timer, Trophy } from "lucide-react";
import { useMemo } from "react";
import { calculateTypingStats, countWords } from "@/lib/typing";
import type { ReactNode } from "react";

interface ResultScreenProps {
  wpm: number;
  grossWpm: number;
  accuracy: number;
  errorCount: number;
  duration: number;
  timeLeft: number;
  text: string;
  userInput: string;
  onHome: () => void;
  onRestart: () => void;
}

export function ResultScreen({
  wpm, grossWpm, accuracy, errorCount,
  duration, timeLeft, text, userInput, onHome, onRestart,
}: ResultScreenProps) {
  const timeTaken = Math.max(0, duration * 60 - timeLeft);
  const minutesTaken = Math.floor(timeTaken / 60);
  const secondsTaken = timeTaken % 60;
  const stats = useMemo(() => calculateTypingStats(text, userInput, timeTaken), [text, userInput, timeTaken]);
  const comparison = useMemo(() => {
    const items: ComparisonItem[] = [];
    const length = Math.max(text.length, userInput.length);
    for (let index = 0; index < length; index += 1) {
      const expected = text[index];
      const actual = userInput[index];
      const state: ComparisonItem["state"] = expected === undefined
        ? "extra"
        : actual === undefined
          ? "missing"
          : expected === actual
            ? "correct"
            : "incorrect";
      items.push({ expected, actual, state });
    }
    return items;
  }, [text, userInput]);

  const breakdown = useMemo(() => {
    const incorrect = comparison.filter((item) => item.state === "incorrect");
    return {
      incorrect: stats.incorrectCharacters,
      missing: comparison.filter((item) => item.state === "missing").length,
      extra: comparison.filter((item) => item.state === "extra").length,
      spacing: incorrect.filter((item) => item.expected === " " || item.actual === " ").length,
      punctuation: incorrect.filter((item) => /[^\w\s]/.test(item.expected || "") || /[^\w\s]/.test(item.actual || "")).length,
    };
  }, [comparison, stats.incorrectCharacters]);

  const errorPercentage = Math.max(0, 100 - stats.accuracy);
  const isComplete = userInput === text;
  const formatTime = `${String(minutesTaken).padStart(2, "0")}:${String(secondsTaken).padStart(2, "0")}`;
  const reportText = `Precision Typing result\nNet WPM: ${wpm}\nGross WPM: ${grossWpm}\nAccuracy: ${stats.accuracy}%\nCorrect characters: ${stats.correctCharacters}\nIncorrect characters: ${stats.incorrectCharacters}\nMissing characters: ${breakdown.missing}\nExtra characters: ${breakdown.extra}\nTime: ${formatTime}`;

  const downloadReport = () => {
    const url = URL.createObjectURL(new Blob([reportText], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "precision-typing-result.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:py-10">
        <header className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className={`mb-2 flex items-center gap-2 text-sm font-medium ${isComplete ? "text-success" : "text-amber-600"}`}>
              {isComplete ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              {isComplete ? "Test completed" : "Test submitted early"}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Typing test results</h1>
            <p className="mt-1 text-sm text-muted-foreground">A detailed report built from this attempt's actual input.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" /> Print</Button>
            <Button variant="outline" size="sm" onClick={downloadReport}><Download className="mr-2 h-4 w-4" /> Download</Button>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <MetricCard icon={<Trophy />} label="Net WPM" value={String(wpm)} accent />
          <MetricCard icon={<Target />} label="Gross WPM" value={String(grossWpm)} />
          <MetricCard icon={<CheckCircle2 />} label="Accuracy" value={`${stats.accuracy}%`} />
          <MetricCard icon={<Timer />} label="Time" value={formatTime} />
          <MetricCard icon={<ClipboardList />} label="Keystrokes" value={String(userInput.length)} />
          <MetricCard icon={<AlertCircle />} label="Errors" value={String(stats.incorrectCharacters)} danger />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border border-border bg-card p-5">
            <SectionHeading title="Performance summary" subtitle="Measured from the completed passage and typed input." />
            <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
              <Detail label="Correct characters" value={stats.correctCharacters} />
              <Detail label="Incorrect characters" value={stats.incorrectCharacters} danger />
              <Detail label="Error percentage" value={`${errorPercentage}%`} danger />
              <Detail label="Characters completed" value={userInput.length} />
              <Detail label="Words completed" value={countWords(userInput)} />
              <Detail label="KDPH" value={stats.kdph} />
              <Detail label="Full mistakes" value="—" muted />
              <Detail label="Half mistakes" value="—" muted />
              <Detail label="Weighted mistakes" value="—" muted />
            </div>
            <p className="mt-5 border-t border-border pt-4 text-xs text-muted-foreground">
              Weighted full/half mistake scoring and pass thresholds are not configured for this practice test, so no qualification verdict is shown.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <SectionHeading title="Mistake breakdown" subtitle="Where this attempt lost accuracy." />
            <div className="mt-5 space-y-3">
              <BreakdownRow label="Incorrect characters" value={breakdown.incorrect} color="bg-red-500" />
              <BreakdownRow label="Missing characters" value={breakdown.missing} color="bg-amber-500" />
              <BreakdownRow label="Extra characters" value={breakdown.extra} color="bg-purple-500" />
              <BreakdownRow label="Spacing errors" value={breakdown.spacing} color="bg-blue-500" />
              <BreakdownRow label="Punctuation errors" value={breakdown.punctuation} color="bg-teal-500" />
            </div>
          </div>
        </section>

        <section id="mistakes" className="rounded-2xl border border-border bg-card p-5">
          <SectionHeading title="Passage comparison" subtitle="Green is correct, red is a wrong character, amber is missing, and purple is extra input." />
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <ComparisonPanel title="Original passage" items={comparison} side="expected" />
            <ComparisonPanel title="Your input" items={comparison} side="actual" />
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <Legend color="bg-success" label="Correct" />
            <Legend color="bg-red-500/25 text-red-600" label="Wrong" />
            <Legend color="bg-amber-500/25 text-amber-700" label="Missing" />
            <Legend color="bg-purple-500/25 text-purple-700" label="Extra" />
          </div>
        </section>

        <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-foreground">Ready for another attempt?</h2>
            <p className="text-sm text-muted-foreground">Retry the same test or return to practice settings.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={onHome}><Home className="mr-2 h-4 w-4" /> Return to practice</Button>
            <Button onClick={onRestart}><RotateCcw className="mr-2 h-4 w-4" /> Retry test</Button>
          </div>
        </section>
      </main>
    </div>
  );
}

interface ComparisonItem {
  expected?: string;
  actual?: string;
  state: "correct" | "incorrect" | "missing" | "extra";
}

function MetricCard({ icon, label, value, accent, danger }: { icon: ReactNode; label: string; value: string; accent?: boolean; danger?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 text-muted-foreground [&>svg]:h-4 [&>svg]:w-4">{icon}<span className="text-xs">{label}</span></div>
      <div className={`mt-2 text-2xl font-bold tabular-nums ${danger ? "text-red-600" : accent ? "text-primary" : "text-foreground"}`}>{value}</div>
    </div>
  );
}

function SectionHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return <div><h2 className="font-semibold text-foreground">{title}</h2><p className="mt-1 text-xs text-muted-foreground">{subtitle}</p></div>;
}

function Detail({ label, value, danger, muted }: { label: string; value: number | string; danger?: boolean; muted?: boolean }) {
  return <div><div className={`text-lg font-semibold tabular-nums ${danger ? "text-red-600" : muted ? "text-muted-foreground" : "text-foreground"}`}>{value}</div><div className="mt-1 text-xs text-muted-foreground">{label}</div></div>;
}

function BreakdownRow({ label, value, color }: { label: string; value: number; color: string }) {
  return <div className="flex items-center justify-between text-sm"><span className="flex items-center gap-2 text-muted-foreground"><span className={`h-2 w-2 rounded-full ${color}`} />{label}</span><span className="font-semibold tabular-nums text-foreground">{value}</span></div>;
}

function ComparisonPanel({ title, items, side }: { title: string; items: ComparisonItem[]; side: "expected" | "actual" }) {
  return (
    <div className="rounded-xl border border-border bg-background/50 p-4">
      <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</h3>
      <div className="max-h-72 overflow-y-auto whitespace-pre-wrap break-words font-mono text-sm leading-7">
        {items.map((item, index) => {
          const value = side === "expected" ? item.expected : item.actual;
          const className = item.state === "correct"
            ? "text-success"
            : item.state === "incorrect"
              ? "rounded bg-red-500/20 text-red-600"
              : item.state === "missing"
                ? "rounded bg-amber-500/20 text-amber-700"
                : "rounded bg-purple-500/20 text-purple-700";
          return <span key={index} className={className} title={`${item.state}${value ? `: ${JSON.stringify(value)}` : ""}`}>{value ?? "·"}</span>;
        })}
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return <span className="flex items-center gap-1.5"><span className={`h-2.5 w-2.5 rounded-sm ${color}`} />{label}</span>;
}
