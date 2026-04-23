import { useState, useCallback } from "react";

export interface TestResult {
  date: string;
  wpm: number;
  accuracy: number;
  mode: string;
}

const HISTORY_KEY = "typing_history";
const PB_KEY = "typing_pb";

function loadHistory(): TestResult[] {
  try {
    const all: TestResult[] = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    const fiveDaysAgo = Date.now() - 5 * 24 * 60 * 60 * 1000;
    const filtered = all.filter((r) => {
      const d = new Date(r.date).getTime();
      return !isNaN(d) && d >= fiveDaysAgo;
    });
    if (filtered.length !== all.length) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
    }
    return filtered;
  } catch {
    return [];
  }
}

function loadPB(): number {
  return parseInt(localStorage.getItem(PB_KEY) || "0", 10);
}

export function useHistory() {
  const [history, setHistory] = useState<TestResult[]>(loadHistory);
  const [personalBest, setPersonalBest] = useState<number>(loadPB);

  const addResult = useCallback((result: Omit<TestResult, "date">) => {
    const entry: TestResult = { ...result, date: new Date().toLocaleString() };
    setHistory((prev) => {
      const updated = [entry, ...prev].slice(0, 10);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
    if (result.wpm > personalBest) {
      setPersonalBest(result.wpm);
      localStorage.setItem(PB_KEY, String(result.wpm));
    }
  }, [personalBest]);

  return { history, personalBest, addResult };
}
