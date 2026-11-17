
import { useState, useCallback, useEffect } from "react";

export interface TestResult {
  date: string;
  wpm: number;
  accuracy: number;
  mode: string;
}

const HISTORY_KEY = "typing_history";
const PB_KEY = "typing_pb";
const MAX_HISTORY_ENTRIES = 5;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function loadHistory(): TestResult[] {
  try {
    const all: TestResult[] = JSON.parse(
      localStorage.getItem(HISTORY_KEY) || "[]"
    );

    const oneDayAgo = Date.now() - ONE_DAY_MS;

    const filtered = all.filter((r) => {
      const d = new Date(r.date).getTime();
      return !isNaN(d) && d > oneDayAgo;
    });

    const limited = filtered.slice(0, MAX_HISTORY_ENTRIES);

    if (limited.length !== all.length) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(limited));
    }

    return limited;
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

  // Automatically delete results older than 24 hours
  useEffect(() => {
    const cleanup = () => {
      setHistory((prev) => {
        const oneDayAgo = Date.now() - ONE_DAY_MS;

        const filtered = prev.filter((r) => {
          const date = new Date(r.date).getTime();
          return !isNaN(date) && date > oneDayAgo;
        });

        if (filtered.length !== prev.length) {
          localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
        }

        return filtered;
      });
    };

    // Check expiry every minute
    const interval = window.setInterval(cleanup, 60 * 1000);

    // Clean expired results immediately
    cleanup();

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const addResult = useCallback((result: Omit<TestResult, "date">) => {
    const entry: TestResult = {
      ...result,
      date: new Date().toISOString(),
    };

    setHistory((prev) => {
      const oneDayAgo = Date.now() - ONE_DAY_MS;

      const validHistory = prev.filter((r) => {
        const date = new Date(r.date).getTime();
        return !isNaN(date) && date > oneDayAgo;
      });

      const updated = [entry, ...validHistory].slice(
        0,
        MAX_HISTORY_ENTRIES
      );

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
