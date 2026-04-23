import { memo } from "react";
import type { TestResult } from "@/hooks/useHistory";

export const HistoryTable = memo(function HistoryTable({ history,onDelete }: { history: TestResult[],onDelete:(date:string)=>void }) {
  if (history.length === 0) return null;
  return (
    <div className="w-full max-w-3xl mx-auto mt-6">
      <h3 className="text-sm font-medium text-foreground mb-2">Recent Results</h3>
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
            <th className="px-3 py-2 text-left text-center font-medium text-muted-foregrounduppercase">Action</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Date</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-muted-foreground">WPM</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-muted-foreground">Accuracy</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-muted-foreground">Mode</th>
            </tr>
          </thead>
          <tbody>
            {history
            .filter((r) => {
              const testDate = new Date(r.date);
              const oneDayAgo = new Date();
              oneDayAgo.setDate(oneDayAgo.getDate()-1);
              return testDate >= oneDayAgo; })
            .map((r, i) => (
              <tr key={i} className="border-b border-border/50 last:border-0">
                <td className="px-3 py-2 text-muted-foreground">{r.date}</td>
                <td className="px-3 py-2 text-center font-mono font-semibold text-foreground">{r.wpm}</td>
                <td className="px-3 py-2 text-center font-mono text-foreground">{r.accuracy}%</td>
                <td className="px-3 py-2 text-center capitalize text-muted-foreground">{r.mode}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});
