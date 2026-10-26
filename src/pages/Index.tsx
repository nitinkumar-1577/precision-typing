import { useTypingEngine } from "@/hooks/useTypingEngine";
import { useTypingSound } from "@/hooks/useTypingSound";
import { useTheme } from "@/hooks/useTheme";
import { useHistory } from "@/hooks/useHistory";
import { HomeScreen } from "@/components/HomeScreen";
import { TypingScreen } from "@/components/TypingScreen";
import { ResultScreen } from "@/components/ResultScreen";
import { useEffect, useRef } from "react";

const Index = () => {
  const engine = useTypingEngine();
  const { soundEnabled, setSoundEnabled, playKeypressSound, playBackspaceSound, volume, profile, backspaceEnabled, setVolume, setProfile, setBackspaceEnabled, playPreview } = useTypingSound();
  const { isDark, toggleTheme } = useTheme();
  const { history, personalBest, addResult } = useHistory();
  
  const resultSavedRef = useRef(false);
  const lastSoundInputRef = useRef(engine.userInput);

  useEffect(() => {
    if (engine.screen !== "typing") lastSoundInputRef.current = engine.userInput;
  }, [engine.screen, engine.userInput]);

  const handleInput = (value: string, selectionStart?: number) => {
    const previousValue = lastSoundInputRef.current;
    engine.handleInput(value, selectionStart);
    if (engine.screen !== "typing" || value === previousValue) return;
    lastSoundInputRef.current = value;
    if (value.length < previousValue.length) {
      playBackspaceSound();
      return;
    }

    const insertedCharacter = value.length === previousValue.length + 1
      ? value[selectionStart === undefined ? value.length - 1 : Math.max(0, selectionStart - 1)]
      : undefined;
    playKeypressSound(insertedCharacter === " " ? "space" : insertedCharacter === "\n" ? "enter" : "keypress");
  };

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
        errorCount={engine.errorCount}
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
        volume={volume} profile={profile} backspaceEnabled={backspaceEnabled}
        onVolumeChange={setVolume} onProfileChange={setProfile}
        onBackspaceSoundChange={setBackspaceEnabled} onPreviewSound={playPreview}
        onInput={handleInput} onHome={engine.goHome} onSubmit={engine.finishTest}
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
