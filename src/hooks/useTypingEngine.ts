import { useCallback, useEffect, useRef, useState } from "react";
import { generateExactCharacterParagraph, generateParagraph, getParagraphById } from "@/lib/paragraphs";
import { calculateTypingStats } from "@/lib/typing";

export type InputMode = "words" | "keystrokes" | "paragraph";

export interface TypingEngineReturn {
  text: string; userInput: string; currentIndex: number; isRunning: boolean; isFinished: boolean;
  timeLeft: number; duration: number; wpm: number; grossWpm: number; accuracy: number;
  errorCount: number; wordCount: number;
  keystrokeCount: number; screen: "home" | "typing" | "result"; inputMode: InputMode;
  selectedParagraphId: number; customParagraph: string; setWordCount: (n: number) => void;
  setKeystrokeCount: (n: number) => void; setDuration: (d: number) => void;
  setInputMode: (m: InputMode) => void; setSelectedParagraphId: (id: number) => void;
  setCustomParagraph: (t: string) => void; startTest: () => void;
  handleInput: (value: string, selectionStart?: number) => void; goHome: () => void; finishTest: () => void;
}

export function useTypingEngine(): TypingEngineReturn {
  const [wordCount, setWordCountState] = useState(50);
  const [keystrokeCount, setKeystrokeCountState] = useState(250);
  const [duration, setDurationState] = useState(10);
  const [inputMode, setInputMode] = useState<InputMode>("words");
  const [selectedParagraphId, setSelectedParagraphId] = useState(1);
  const [customParagraph, setCustomParagraph] = useState("");
  const [text, setText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [wpm, setWpm] = useState(0);
  const [grossWpm, setGrossWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [errorCount, setErrorCount] = useState(0);
  const [screen, setScreen] = useState<"home" | "typing" | "result">("home");

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const textRef = useRef("");
  const inputRef = useRef("");
  const startTimeRef = useRef<number | null>(null);
  const durationRef = useRef(duration);
  const finishRef = useRef<() => void>(() => undefined);
  const statsFrameRef = useRef<number | null>(null);
  const pendingStatsRef = useRef<{ input: string; elapsed: number } | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  const updateStats = useCallback((input: string, elapsedSeconds: number) => {
    const stats = calculateTypingStats(textRef.current, input, elapsedSeconds);
    setWpm(stats.netWpm); setGrossWpm(stats.grossWpm); setAccuracy(stats.accuracy);
    return stats;
  }, []);

  const scheduleStatsUpdate = useCallback((input: string, elapsedSeconds: number) => {
    pendingStatsRef.current = { input, elapsed: elapsedSeconds };
    if (statsFrameRef.current !== null) return;
    statsFrameRef.current = requestAnimationFrame(() => {
      statsFrameRef.current = null;
      const pending = pendingStatsRef.current;
      pendingStatsRef.current = null;
      if (pending) updateStats(pending.input, pending.elapsed);
    });
  }, [updateStats]);

  const finishTest = useCallback(() => {
    if (screen === "result" || !textRef.current) return;
    clearTimer();
    if (statsFrameRef.current !== null) {
      cancelAnimationFrame(statsFrameRef.current);
      statsFrameRef.current = null;
      pendingStatsRef.current = null;
    }
    const elapsed = startTimeRef.current ? Math.min(durationRef.current * 60, (Date.now() - startTimeRef.current) / 1000) : 0;
    const stats = updateStats(inputRef.current, elapsed);
    setErrorCount(stats.incorrectCharacters);
    setTimeLeft(Math.max(0, Math.ceil(durationRef.current * 60 - elapsed)));
    setIsRunning(false); setIsFinished(true); setScreen("result");
  }, [clearTimer, screen, updateStats]);

  useEffect(() => { finishRef.current = finishTest; }, [finishTest]);

  const startTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setInterval(() => {
      if (!startTimeRef.current) return;
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const remaining = durationRef.current * 60 - elapsed;
      if (remaining <= 0) finishRef.current();
      else { setTimeLeft(Math.ceil(remaining)); scheduleStatsUpdate(inputRef.current, elapsed); }
    }, 250);
  }, [clearTimer, scheduleStatsUpdate]);

  const startTest = useCallback(() => {
    const newText = inputMode === "paragraph"
      ? (customParagraph.trim() || getParagraphById(selectedParagraphId)).trim()
      : inputMode === "keystrokes"
        ? generateExactCharacterParagraph(keystrokeCount)
        : generateParagraph(wordCount);
    durationRef.current = duration;
    textRef.current = newText; inputRef.current = ""; startTimeRef.current = null;
    setText(newText); setUserInput(""); setCurrentIndex(0); setTimeLeft(durationRef.current * 60);
    setWpm(0); setGrossWpm(0); setAccuracy(100); setErrorCount(0);
    setIsRunning(false); setIsFinished(false); setScreen("typing");
  }, [customParagraph, duration, inputMode, keystrokeCount, selectedParagraphId, wordCount]);

  const handleInput = useCallback((value: string, selectionStart?: number) => {
    if (screen !== "typing" || isFinished) return;
    inputRef.current = value; setUserInput(value);
    setCurrentIndex(selectionStart ?? value.length);
    if (!startTimeRef.current && value.length > 0) { startTimeRef.current = Date.now(); setIsRunning(true); startTimer(); }
    if (startTimeRef.current) scheduleStatsUpdate(value, (Date.now() - startTimeRef.current) / 1000);
    if (value.length >= textRef.current.length) finishTest();
  }, [finishTest, isFinished, screen, startTimer, scheduleStatsUpdate]);

  const goHome = useCallback(() => {
    clearTimer(); textRef.current = ""; inputRef.current = ""; startTimeRef.current = null;
    setIsRunning(false); setIsFinished(false); setUserInput(""); setCurrentIndex(0);
    setWpm(0); setGrossWpm(0); setAccuracy(100); setErrorCount(0); setScreen("home");
  }, [clearTimer]);

  useEffect(() => () => {
    clearTimer();
    if (statsFrameRef.current !== null) cancelAnimationFrame(statsFrameRef.current);
  }, [clearTimer]);

  return {
    text, userInput, currentIndex, isRunning, isFinished, timeLeft, duration, wpm, grossWpm, accuracy,
    errorCount, wordCount, keystrokeCount, screen, inputMode,
    selectedParagraphId, customParagraph, setWordCount: (n) => setWordCountState(Math.min(2000, Math.max(0, Math.floor(n) || 0))),
    setKeystrokeCount: (n) => setKeystrokeCountState(Math.min(10000, Math.max(0, Math.floor(n) || 0))),
    setDuration: (n) => setDurationState(Math.max(1, Math.min(20, Math.floor(n) || 1))),
    setInputMode, setSelectedParagraphId, setCustomParagraph, startTest, handleInput, goHome, finishTest,
  };
}
