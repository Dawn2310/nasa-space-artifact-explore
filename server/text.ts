// Small text helpers shared by the verifier, the mock model and the eval.

const NUMBER_WORDS: Record<string, string> = {
  two: '2', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: '10',
  eleven: '11', twelve: '12', thirteen: '13', fourteen: '14', fifteen: '15', sixteen: '16',
  seventeen: '17', eighteen: '18', nineteen: '19', twenty: '20', thirty: '30', forty: '40', fifty: '50',
  sixty: '60', seventy: '70', eighty: '80', ninety: '90', hundred: '100', thousand: '1000',
  million: '1000000', billion: '1000000000',
};

/** Remove every occurrence of the given names (case-insensitive). Longest names should come first. */
export function stripNames(text: string, names: string[]): string {
  let out = text;
  for (const name of names) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out = out.replace(new RegExp(escaped, 'gi'), ' ');
  }
  return out;
}

/**
 * Canonical number tokens in a text: digit numbers ("1,100" -> "1100", "04" -> "4", "3.75" -> "3.75")
 * and number words from "two" up ("six" -> "6", "thousand" -> "1000"). "one" is skipped on purpose:
 * it is mostly used as a pronoun ("one of two twin rovers").
 */
export function numberTokens(text: string): Set<string> {
  const out = new Set<string>();
  for (const match of text.matchAll(/\d+(?:,\d{3})*(?:\.\d+)?/g)) {
    const raw = match[0].replace(/,/g, '');
    const value = Number(raw);
    if (Number.isFinite(value)) out.add(String(value));
  }
  for (const match of text.toLowerCase().matchAll(/[a-z]+/g)) {
    const value = NUMBER_WORDS[match[0]];
    if (value) out.add(value);
  }
  return out;
}

/** Number tokens of `text` that are missing from `allowed`. */
export function missingNumbers(text: string, allowed: Set<string>): string[] {
  return [...numberTokens(text)].filter((n) => !allowed.has(n));
}

/** Rough sentence split, good enough to count sentences in short answers. */
export function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?]["']?)\s+(?=["']?[A-Z])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/** Make user-controlled text safe to place inside our delimiter tags. */
export function neutralizeTags(text: string): string {
  return text.replace(/</g, '‹').replace(/>/g, '›');
}
