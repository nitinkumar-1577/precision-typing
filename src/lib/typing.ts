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
  const alignment = alignCharacters(reference, input);
  const comparedCharacters = alignment.comparisonCount;
  const correctCharacters = alignment.correctCharacters;
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

export function alignCharacters(reference: string, input: string): {
  correctCharacters: number;
  comparisonCount: number;
  referenceStates: Array<"correct" | "incorrect" | "pending">;
} {
  if (reference.length > 1200 || input.length > 1200) {
    const states = Array<"correct" | "incorrect" | "pending">(reference.length).fill("pending");
    let correctCharacters = 0;
    const limit = Math.min(reference.length, input.length);
    for (let index = 0; index < limit; index += 1) {
      states[index] = reference[index] === input[index] ? "correct" : "incorrect";
      if (states[index] === "correct") correctCharacters += 1;
    }
    for (let index = limit; index < input.length; index += 1) {
      if (index < reference.length) states[index] = "incorrect";
    }
    return {
      correctCharacters,
      comparisonCount: Math.max(reference.length, input.length),
      referenceStates: states,
    };
  }
  const rows = reference.length + 1;
  const cols = input.length + 1;
  const costs = Array.from({ length: rows }, (_, row) => Array.from({ length: cols }, (_, col) => row + col));
  for (let row = 1; row < rows; row += 1) {
    for (let col = 1; col < cols; col += 1) {
      const substitution = costs[row - 1][col - 1] + (reference[row - 1] === input[col - 1] ? 0 : 1);
      costs[row][col] = Math.min(costs[row - 1][col] + 1, costs[row][col - 1] + 1, substitution);
    }
  }
  const states = Array<"correct" | "incorrect" | "pending">(reference.length).fill("pending");
  let row = reference.length;
  let col = input.length;
  let correctCharacters = 0;
  let comparisonCount = 0;
  while (row > 0 || col > 0) {
    if (row > 0 && col > 0 && costs[row][col] === costs[row - 1][col - 1] + (reference[row - 1] === input[col - 1] ? 0 : 1)) {
      states[row - 1] = reference[row - 1] === input[col - 1] ? "correct" : "incorrect";
      if (reference[row - 1] === input[col - 1]) correctCharacters += 1;
      comparisonCount += 1;
      row -= 1; col -= 1;
    } else if (row > 0 && costs[row][col] === costs[row - 1][col] + 1) {
      // A reference suffix with no corresponding input is still pending,
      // not an error. It becomes an omission only once later input exists.
      states[row - 1] = col > 0 ? "incorrect" : "pending";
      comparisonCount += 1;
      row -= 1;
    } else {
      if (row > 0) states[row - 1] = col > 0 ? "incorrect" : "pending";
      comparisonCount += 1;
      col -= 1;
    }
  }
  return { correctCharacters, comparisonCount, referenceStates: states };
}
