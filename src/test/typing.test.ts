import { describe, expect, it } from "vitest";
import { buildExactCharacterPassage, calculateTypingStats, countWords } from "@/lib/typing";

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

});
