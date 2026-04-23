import { useTypingEngine } from "@/hooks/useTypingEngine";
import { useTypingSound } from "@/hooks/useTypingSound";
import { useTheme } from "@/hooks/useTheme";
import { useHistory } from "@/hooks/useHistory";
import { HomeScreen } from "@/components/HomeScreen";
import { TypingScreen } from "@/components/TypingScreen";
import { ResultScreen } from "@/components/ResultScreen";
import { useEffect, useRef, useState, useCallback } from "react";

const Index = () => {
  const engine = useTypingEngine();
  const { soundEnabled, setSoundEnabled, playKeypressSound } = useTypingSound();
  const { isDark, toggleTheme } = useTheme();
  const { history, personalBest, addResult } = useHistory();
  
  const prevInputLenRef = useRef(0);
  const resultSavedRef = useRef(false);

  useEffect(() => {
    if (engine.screen === "typing" && engine.userInput.length !== prevInputLenRef.current) {
      playKeypressSound();
    }
    prevInputLenRef.current = engine.userInput.length;
  }, [engine.userInput, engine.screen, playKeypressSound]);

  // Save result when reaching result screen
  useEffect(() => {
    if (engine.screen === "result" && !resultSavedRef.current) {
      resultSavedRef.current = true;
      addResult({ wpm: engine.wpm, accuracy: engine.accuracy, mode: engine.inputMode });
    }
    if (engine.screen !== "result") {
      resultSavedRef.current = false;
    }
  }, [engine.screen, engine.wpm, engine.accuracy, engine.inputMode, addResult]);

  if (engine.screen === "result") {
    return (
      <ResultScreen
        wpm={engine.wpm} grossWpm={engine.grossWpm} accuracy={engine.accuracy}
        errorCount={engine.errorCount} halfMistakes={engine.halfMistakes} fullMistakes={engine.fullMistakes}
        duration={engine.duration} timeLeft={engine.timeLeft} text={engine.text} userInput={engine.userInput}
        onHome={engine.goHome} onRestart={engine.startTest}
      />
    );
  }

  if (engine.screen === "typing") {
    return (
      <TypingScreen
        text={engine.text} userInput={engine.userInput} currentIndex={engine.currentIndex}
        timeLeft={engine.timeLeft} wpm={engine.wpm} accuracy={engine.accuracy} isRunning={engine.isRunning}
        soundEnabled={soundEnabled} onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onInput={engine.handleInput} onHome={engine.goHome} onSubmit={engine.finishTest}
        isDark={isDark} onToggleTheme={toggleTheme} personalBest={personalBest}
      />
    );
  }

  return (
    <HomeScreen
      wordCount={engine.wordCount} setWordCount={engine.setWordCount}
      keystrokeCount={engine.keystrokeCount} setKeystrokeCount={engine.setKeystrokeCount}
      duration={engine.duration} setDuration={engine.setDuration}
      inputMode={engine.inputMode} setInputMode={engine.setInputMode}
      selectedParagraphId={engine.selectedParagraphId} setSelectedParagraphId={engine.setSelectedParagraphId}
      customParagraph={engine.customParagraph} setCustomParagraph={engine.setCustomParagraph}
      onStart={engine.startTest} isDark={isDark} onToggleTheme={toggleTheme}
      personalBest={personalBest} history={history}
    />
  );
};

export default Index;
