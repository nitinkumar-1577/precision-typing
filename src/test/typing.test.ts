import { describe, expect, it } from "vitest";
import { buildExactCharacterPassage, calculateMistakeStats, calculateTypingStats, countWords, getHighlightState } from "@/lib/typing";

describe("typing calculations", () => {
  it("builds an exact character target", () => {
    const passage = buildExactCharacterPassage("One two three four", 11);
    expect(passage).toHaveLength(11);
    expect(countWords("one  two\nthree")).toBe(3);
  });

  it("calculates five-character WPM and accuracy", () => {
    const stats = calculateTypingStats("a".repeat(1000), "a".repeat(950) + "b".repeat(50), 300);
    expect(stats.grossWpm).toBe(40);
    expect(stats.accuracy).toBe(95);
    expect(stats.netWpm).toBe(38);
  });

  it("counts incorrect printable input toward gross speed", () => {
    const stats = calculateTypingStats("a".repeat(300), "b".repeat(200), 60);
    expect(stats.grossWpm).toBe(40);
    expect(stats.netWpm).toBe(0);
  });

  it("calculates full, half, and weighted mistakes", () => {
    expect(calculateMistakeStats("ab cd", "ax  d")).toEqual({
      fullMistakes: 1,
      halfMistakes: 1,
      weightedMistakes: 1.5,
    });
  });

  it("counts one insertion as one full mistake without shifting duplicates", () => {
    expect(calculateMistakeStats("abcd", "axbcd")).toEqual({
      fullMistakes: 1,
      halfMistakes: 0,
      weightedMistakes: 1,
    });
  });

  it("aligns insertions without shifting all following matches", () => {
    const stats = calculateTypingStats("abcd", "axbcd", 60);
    expect(stats.correctCharacters).toBe(4);
    expect(stats.accuracy).toBe(80);
  });

  it("guards zero elapsed time", () => {
    const stats = calculateTypingStats("abc", "abc", 0);
    expect(stats.grossWpm).toBe(0);
    expect(stats.netWpm).toBe(0);
    expect(Number.isFinite(stats.accuracy)).toBe(true);
  });

  it("isolates character highlight states", () => {
    expect(getHighlightState("a", "axb", 0, 3)).toBe("correct");
    expect(getHighlightState("b", "axb", 1, 3)).toBe("incorrect");
    expect(getHighlightState("c", "ax", 2, 3)).toBe("missed");
    expect(getHighlightState("d", "ax", 3, 3)).toBe("current");
    expect(getHighlightState("e", "ax", 4, 3)).toBe("pending");
  });

});
