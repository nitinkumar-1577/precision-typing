import { useState, useCallback, useRef, useEffect } from "react";
import { generateParagraph, getParagraphById } from "@/lib/paragraphs";

export type InputMode = "words" | "keystrokes" | "paragraph";

export interface TypingEngineReturn {
  text: string;
  userInput: string;
  currentIndex: number;
  isRunning: boolean;
  isFinished: boolean;
  timeLeft: number;
  duration: number;
  wpm: number;
  grossWpm: number;
  accuracy: number;
  errorCount: number;
  halfMistakes: number;
  fullMistakes: number;
  wordCount: number;
  keystrokeCount: number;
  screen: "home" | "typing" | "result";
  inputMode: InputMode;
  selectedParagraphId: number;
  customParagraph: string;
  setWordCount: (n: number) => void;
  setKeystrokeCount: (n: number) => void;
  setDuration: (d: number) => void;
  setInputMode: (m: InputMode) => void;
  setSelectedParagraphId: (id: number) => void;
  setCustomParagraph: (t: string) => void;
  startTest: () => void;
  handleInput: (value: string) => void;
  goHome: () => void;
  finishTest: () => void;
}

export function useTypingEngine(): TypingEngineReturn {
  const [wordCount, setWordCount] = useState(50);
  const [keystrokeCount, setKeystrokeCount] = useState(250);
  const [duration, setDuration] = useState(10);
  const [inputMode, setInputMode] = useState<InputMode>("words");
  const [selectedParagraphId, setSelectedParagraphId] = useState(1);
  const [customParagraph, setCustomParagraph] = useState("");

  const [text, setText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctChars, setCorrectChars] = useState(0);
  const [incorrectChars, setIncorrectChars] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10 * 60);
  const [wpm, setWpm] = useState(0);
  const [grossWpm, setGrossWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [errorCount, setErrorCount] = useState(0);
  const [halfMistakes, setHalfMistakes] = useState(0);
  const [fullMistakes, setFullMistakes] = useState(0);
  const [screen, setScreen] = useState<"home" | "typing" | "result">("home");

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const correctCharsRef = useRef(0);
  const incorrectCharsRef = useRef(0);
  const currentIndexRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const textRef = useRef("");
  const userInputRef = useRef("");

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const calculateResults = useCallback(() => {
    if (!startTimeRef.current) return { wpm: 0, grossWpm: 0, accuracy: 100, errors: 0, halfMistakes: 0, fullMistakes: 0 };

    const elapsedMs = Date.now() - startTimeRef.current;
    const elapsedMin = elapsedMs / 60000;
    if (elapsedMin === 0) return { wpm: 0, grossWpm: 0, accuracy: 100, errors: 0, halfMistakes: 0, fullMistakes: 0 };

    const totalCharsTyped = correctCharsRef.current + incorrectCharsRef.current;
    const gross = (totalCharsTyped / 5) / elapsedMin;
    const incorrectWords = incorrectCharsRef.current / 5;
    const net = Math.max(0, Math.round(gross - incorrectWords));
    const acc = totalCharsTyped > 0 ? Math.round((correctCharsRef.current / totalCharsTyped) * 100) : 100;

    // SSC CGL error classification
    const typed = userInputRef.current;
    const original = textRef.current;
    const typedWords = typed.split(/\s+/).filter(Boolean);
    const originalWords = original.split(/\s+/).filter(Boolean);

    let half = 0;
    let full = 0;

    let tIdx = 0;
    let oIdx = 0;
    while (tIdx < typedWords.length && oIdx < originalWords.length) {
      const tw = typedWords[tIdx];
      const ow = originalWords[oIdx];

      if (tw === ow) {
        // correct
        tIdx++;
        oIdx++;
        continue;
      }

      // Check if it's an added word (not in original) - look ahead
      if (tIdx + 1 < typedWords.length && typedWords[tIdx + 1] === ow) {
        full++; // addition of a word
        tIdx++;
        continue;
      }

      // Check for omission (skipped word) - look ahead in original
      if (oIdx + 1 < originalWords.length && tw === originalWords[oIdx + 1]) {
        full++; // omission
        oIdx++;
        continue;
      }

      // Substitution or spelling error - classify
      const isCapError = tw.toLowerCase() === ow.toLowerCase();
      const isPuncError = stripPunctuation(tw) === stripPunctuation(ow);
      const isSpacingError = tw.replace(/\s/g, '') === ow.replace(/\s/g, '');

      if (isCapError || isPuncError || isSpacingError) {
        half++; // capitalization, punctuation, or spacing error
      } else {
        // Check spelling similarity
        const sim = wordSimilarity(tw, ow);
        if (sim >= 0.5) {
          half++; // spelling error (partially correct)
        } else {
          full++; // complete substitution
        }
      }

      tIdx++;
      oIdx++;
    }

    // Remaining typed words = additions
    full += Math.max(0, typedWords.length - tIdx);
    // Remaining original words = omissions (only if user was in that range)

    return { wpm: net, grossWpm: Math.round(gross), accuracy: acc, errors: half + full, halfMistakes: half, fullMistakes: full };
  }, []);

  const finishTest = useCallback(() => {
    clearTimer();
    const results = calculateResults();
    setWpm(results.wpm);
    setGrossWpm(results.grossWpm);
    setAccuracy(results.accuracy);
    setErrorCount(results.errors);
    setHalfMistakes(results.halfMistakes);
    setFullMistakes(results.fullMistakes);
    setIsRunning(false);
    setIsFinished(true);
    setScreen("result");
  }, [clearTimer, calculateResults]);

  const startTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          finishTest();
          return 0;
        }
        const results = calculateResults();
        setWpm(results.wpm);
        setGrossWpm(results.grossWpm);
        setAccuracy(results.accuracy);
        return prev - 1;
      });
    }, 1000);
  }, [clearTimer, finishTest, calculateResults]);

  const generateText = useCallback((mode: InputMode, wc: number, ks: number, paraId: number, custom: string): string => {
    if (mode === "paragraph") {
      if (custom.trim()) return custom.trim();
      return getParagraphById(paraId);
    }
    if (mode === "keystrokes") {
      const words = Math.ceil(ks / 5);
      return generateParagraph(words);
    }
    return generateParagraph(wc);
  }, []);

  const startTest = useCallback(() => {
    const newText = generateText(inputMode, wordCount, keystrokeCount, selectedParagraphId, customParagraph);
    setText(newText);
    textRef.current = newText;
    setUserInput("");
    userInputRef.current = "";
    setCurrentIndex(0);
    currentIndexRef.current = 0;
    correctCharsRef.current = 0;
    incorrectCharsRef.current = 0;
    setCorrectChars(0);
    setIncorrectChars(0);
    setWpm(0);
    setGrossWpm(0);
    setAccuracy(100);
    setErrorCount(0);
    setHalfMistakes(0);
    setFullMistakes(0);
    setIsRunning(false);
    setIsFinished(false);
    startTimeRef.current = null;
    setTimeLeft(duration * 60);
    setScreen("typing");
  }, [wordCount, keystrokeCount, duration, inputMode, selectedParagraphId, customParagraph, generateText]);

  const handleInput = useCallback((value: string) => {
    const currentText = textRef.current;

    if (!startTimeRef.current && value.length > 0) {
      startTimeRef.current = Date.now();
      setIsRunning(true);
      startTimer();
    }

    const prevLen = currentIndexRef.current;
    const newLen = value.length;
    const prevInput = userInputRef.current;

    if (newLen > prevLen) {
      for (let i = prevLen; i < newLen; i++) {
        if (i < currentText.length) {
          if (value[i] === currentText[i]) {
            correctCharsRef.current++;
          } else {
            incorrectCharsRef.current++;
          }
        }
      }
    } else if (newLen < prevLen) {
      for (let i = newLen; i < prevLen; i++) {
        if (i < currentText.length) {
          if (prevInput[i] === currentText[i]) {
            correctCharsRef.current = Math.max(0, correctCharsRef.current - 1);
          } else {
            incorrectCharsRef.current = Math.max(0, incorrectCharsRef.current - 1);
          }
        }
      }
    }

    setCorrectChars(correctCharsRef.current);
    setIncorrectChars(incorrectCharsRef.current);
    setCurrentIndex(newLen);
    currentIndexRef.current = newLen;
    setUserInput(value);
    userInputRef.current = value;

    if (newLen >= currentText.length) {
      finishTest();
    }
  }, [startTimer, finishTest]);

  const goHome = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    setIsFinished(false);
    setUserInput("");
    userInputRef.current = "";
    setCurrentIndex(0);
    currentIndexRef.current = 0;
    correctCharsRef.current = 0;
    incorrectCharsRef.current = 0;
    setCorrectChars(0);
    setIncorrectChars(0);
    setWpm(0);
    setGrossWpm(0);
    setAccuracy(100);
    setErrorCount(0);
    setHalfMistakes(0);
    setFullMistakes(0);
    startTimeRef.current = null;
    setScreen("home");
  }, [clearTimer]);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  return {
    text,
    userInput,
    currentIndex,
    isRunning,
    isFinished,
    timeLeft,
    duration,
    wpm,
    grossWpm,
    accuracy,
    errorCount,
    halfMistakes,
    fullMistakes,
    wordCount,
    keystrokeCount,
    screen,
    inputMode,
    selectedParagraphId,
    customParagraph,
    setWordCount: (wc: number) => setWordCount(Math.max(1, Math.min(2000, wc))),
    setKeystrokeCount: (ks: number) => setKeystrokeCount(Math.max(5, Math.min(10000, ks))),
    setDuration: (d: number) => setDuration(Math.max(1, Math.min(20, d))),
    setInputMode,
    setSelectedParagraphId,
    setCustomParagraph,
    startTest,
    handleInput,
    goHome,
    finishTest,
  };
}

function stripPunctuation(s: string): string {
  return s.replace(/[^\w\s]/g, '');
}

/** Calculate similarity ratio between two words (0-1) */
function wordSimilarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  let matches = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] === b[i]) matches++;
  }
  return matches / maxLen;
}
