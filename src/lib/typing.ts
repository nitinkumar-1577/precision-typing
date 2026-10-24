export interface TypingStats {
  correctCharacters: number;
  incorrectCharacters: number;
  comparedCharacters: number;
  accuracy: number;
  grossWpm: number;
  netWpm: number;
  kdph: number;
}

export function countWords(value: string): number {
  return value.trim() ? value.trim().split(/\s+/).length : 0;
}

export function buildExactCharacterPassage(source: string, target: number): string {
  const normalized = source.replace(/\s+/g, " ").trim();
  if (target <= 0) return "";
  if (!normalized) return " ".repeat(target);
  if (target <= normalized.length) return normalized.slice(0, target);

  const parts: string[] = [];
  let length = 0;
  while (length < target) {
    const separator = parts.length ? " " : "";
    const remaining = target - length - separator.length;
    if (remaining <= 0) break;
    const chunk = normalized.slice(0, remaining);
    parts.push(chunk);
    length += separator.length + chunk.length;
    if (chunk.length < normalized.length) break;
  }
  return parts.join(" ").slice(0, target);
}

export function calculateTypingStats(
  reference: string,
  input: string,
  elapsedSeconds: number,
): TypingStats {
  const comparedCharacters = Math.max(reference.length, input.length);
  let correctCharacters = 0;
  for (let i = 0; i < Math.min(reference.length, input.length); i += 1) {
    if (reference[i] === input[i]) correctCharacters += 1;
  }
  const incorrectCharacters = Math.max(0, comparedCharacters - correctCharacters);
  const minutes = Math.max(0, elapsedSeconds) / 60;
  const grossWpm = minutes > 0 ? Math.round((input.length / 5) / minutes) : 0;
  const netWpm = minutes > 0
    ? Math.max(0, Math.round((correctCharacters / 5) / minutes))
    : 0;
  const accuracy = comparedCharacters > 0
    ? Math.round((correctCharacters / comparedCharacters) * 100)
    : 100;
  const kdph = minutes > 0 ? Math.round(input.length * 60 / minutes) : 0;
  return { correctCharacters, incorrectCharacters, comparedCharacters, accuracy, grossWpm, netWpm, kdph };
}

export interface MistakeCounts {
  halfMistakes: number;
  fullMistakes: number;
}

export function classifyMistakes(reference: string, input: string): MistakeCounts {
  const expected = reference.split(/\s+/).filter(Boolean);
  const actual = input.split(/\s+/).filter(Boolean);
  let expectedIndex = 0;
  let actualIndex = 0;
  let halfMistakes = 0;
  let fullMistakes = 0;

  while (expectedIndex < expected.length && actualIndex < actual.length) {
    const expectedWord = expected[expectedIndex];
    const actualWord = actual[actualIndex];
    if (expectedWord === actualWord) {
      expectedIndex += 1;
      actualIndex += 1;
      continue;
    }
    if (actual[actualIndex + 1] === expectedWord || actualWord === expected[expectedIndex + 1]) {
      fullMistakes += 1;
      if (actual[actualIndex + 1] === expectedWord) actualIndex += 1;
      else expectedIndex += 1;
      continue;
    }
    if (
      actualWord.toLowerCase() === expectedWord.toLowerCase() ||
      stripPunctuation(actualWord) === stripPunctuation(expectedWord) ||
      similarity(actualWord, expectedWord) >= 0.5
    ) {
      halfMistakes += 1;
    } else {
      fullMistakes += 1;
    }
    expectedIndex += 1;
    actualIndex += 1;
  }
  fullMistakes += Math.max(0, actual.length - actualIndex);
  return { halfMistakes, fullMistakes };
}

function stripPunctuation(value: string): string {
  return value.replace(/[^\w\s]/g, "");
}

function similarity(a: string, b: string): number {
  const maxLength = Math.max(a.length, b.length);
  if (!maxLength) return 1;
  let matches = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i += 1) {
    if (a[i] === b[i]) matches += 1;
  }
  return matches / maxLength;
}
