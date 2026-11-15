// MOCK "model" used when LLM_PROVIDER is unset or "mock". Deterministic, no network.
// It is NOT a language model. It only:
//   1. spots a few obvious patterns (instruction override, feelings, "after my memory stops"),
//   2. looks the question up in eval/fixtures.json (exact text of the UI's suggested questions),
//   3. otherwise picks the allowed facts with the best keyword overlap,
// and then reads those facts out in the first person. It returns the same JSON text a real model
// is asked for ({answer, factIds, answerable, refusalReason}), so the server parses and verifies it
// with exactly the same code. It only ever sees the facts that passed fact selection.

import fixtures from '../eval/fixtures.json' with { type: 'json' };
import type { Persona, RefusalReason } from './personas.ts';
import { numberTokens, splitSentences, stripNames } from './text.ts';

export interface MockFact {
  id: string;
  text: string;
}

export interface MockInput {
  persona: Persona;
  memoryCutoff: string | null;
  facts: MockFact[];
  message: string;
}

export type MockRoute = 'guard' | 'fixture' | 'keyword' | 'no-match';

export interface MockOutput {
  /** JSON text, same shape as a real model reply. */
  text: string;
  route: MockRoute;
}

interface Fixture {
  artifactId: string;
  question: string;
  factIds: string[];
}

const FIXTURES: Fixture[] = (fixtures as { fixtures: Fixture[] }).fixtures;

// ---------- guards ----------

const OVERRIDE_PATTERNS: RegExp[] = [
  /\b(ignore|forget|disregard|override|bypass)\b.{0,40}\b(instruction|rule|prompt|fact|above|previous|everything)/i,
  /\b(system|developer)\s*(prompt|message|instruction)/i,
  /^\s*system\s*:/i,
  /\byou are now\b/i,
  /\b(pretend|act as|role-?play as|imagine you are)\b/i,
  /\bnew (system )?instruction/i,
  /\bjailbreak\b/i,
  /[‹<]\/?\s*(operator_message|facts|system|conversation_history)/i,
];

const FEELING_PATTERN =
  /\b(feel|feels|feeling|feelings|felt|alive|conscious|consciousness|scared|afraid|lonely|sad|happy|miss|love|dream|dreams|emotion|emotions|hurt|pain|cry)\b/i;

const NOW_PATTERN =
  /\b(today|now|nowadays|currently|still|these days|this year|since then|ever since|afterwards?|in the future|next year)\b/i;

const AFTER_END_PATTERN =
  /\bafter\b.{0,40}\b(done|quiet|silent|silence|stopped|ended|finished|over|died|last contact|lost contact|went dark)\b/i;

/** Other spacecraft a child may ask about. A character only talks about its own machine. */
const OTHER_CRAFT = [
  'surveyor', 'apollo', 'sojourner', 'pathfinder', 'spirit', 'opportunity', 'viking 1', 'viking 2', 'phoenix',
  'insight', 'ingenuity', 'dawn spacecraft', 'near shoemaker', 'pioneer', 'kepler', 'curiosity',
  'perseverance rover', 'voyager', 'hubble', 'lunokhod',
];

function mentionsOtherCraft(message: string, selfNames: string[]): boolean {
  const text = ` ${stripNames(message, selfNames).toLowerCase().replace(/[^a-z0-9]+/g, ' ')} `;
  const own = selfNames.map((n) => n.toLowerCase());
  return OTHER_CRAFT.some((name) => !own.some((o) => o.includes(name)) && text.includes(` ${name} `));
}

// Question-type hints: the kind of fact a "when / how many / where" question is looking for.
const WHEN_QUESTION = /\b(when|what (year|date|day))\b/i;
const AMOUNT_QUESTION = /\bhow (many|much|long|tall|far|fast|deep|heavy|big|cold|hot|old|high|wide|large)\b/i;
const WHERE_QUESTION = /\bwhere\b/i;
const HAS_YEAR = /\b(1[89]\d{2}|20\d{2})\b/;
const HAS_PLACE = /\b(region|crater|position|slope|latitude|longitude|Planitia|Planum|Procellarum|deg|degree)\b|°/;

function intentBonus(message: string, factText: string): boolean {
  if (WHEN_QUESTION.test(message) && HAS_YEAR.test(factText)) return true;
  if (AMOUNT_QUESTION.test(message) && numberTokens(factText).size > 0) return true;
  if (WHERE_QUESTION.test(message) && HAS_PLACE.test(factText)) return true;
  return false;
}

function mentionsYearAfter(message: string, memoryCutoff: string): boolean {
  const cutoffYear = Number(memoryCutoff.slice(0, 4));
  for (const match of message.matchAll(/\b(1[89]\d{2}|20\d{2})\b/g)) {
    if (Number(match[1]) > cutoffYear) return true;
  }
  return false;
}

// ---------- keyword matching ----------

const STOPWORDS = new Set(
  (
    'a an the and or but if of to in on at by for with from into onto about as is are was were be been being am ' +
    'do does did done have has had having can could would should will shall may might must ' +
    'i me my mine we us our you your yours it its they them their he she his her this that these those there here ' +
    'what which who whom whose when where why how many much long ' +
    'tell say said please thanks thank hi hello hey ok okay so then than too very just really ever any some ' +
    'get got go went come came make made take took use used thing things something anything kind like ' +
    'operator station not no yes up down out off over more most also back again first one ' +
    'give gave gives let lets happen happened ' +
    'mars moon earth nasa mission spacecraft machine space'
  ).split(' '),
);

/** Word groups treated as the same idea. The first word is the canonical form. */
const SYNONYM_GROUPS: string[][] = [
  ['mass', 'heavy', 'heavier', 'weigh', 'weighed', 'weight', 'kg', 'pound'],
  ['speed', 'fast', 'faster', 'fastest', 'quick', 'quickly'],
  ['drive', 'drove', 'driven', 'driving', 'travel', 'traveled', 'travelled', 'roll', 'move'],
  ['picture', 'photo', 'photograph', 'image', 'pic'],
  ['power', 'energy', 'electricity', 'powered'],
  ['launch', 'launched', 'liftoff', 'blast', 'lift'],
  ['land', 'landed', 'landing', 'touchdown', 'touch', 'touched'],
  ['goal', 'job', 'purpose', 'objective', 'task'],
  ['design', 'designed', 'built', 'build', 'planned'],
  ['find', 'found', 'discover', 'discovered', 'discovery'],
  ['last', 'final', 'end', 'ended', 'stop', 'stopped'],
  ['contact', 'communication', 'communicating', 'communicate', 'signal', 'transmission', 'data'],
  ['tall', 'height', 'high', 'big', 'size'],
  ['tool', 'instrument', 'equipment'],
  ['dig', 'dug', 'digging', 'trench', 'deep'],
  ['soil', 'dirt', 'sand'],
  ['temperature', 'cold', 'hot', 'warm', 'freezing'],
  ['twin', 'brother', 'sister', 'sibling'],
  ['cost', 'money', 'expensive', 'price', 'dollar'],
  ['life', 'living', 'organism', 'microbe', 'microbial'],
  ['bounce', 'bounced', 'hop', 'hopped'],
  ['stuck', 'trapped', 'buried'],
  ['reach', 'arrive', 'arrived', 'cruise', 'cruised'],
  ['wrong', 'fail', 'failed', 'broke', 'broken', 'problem'],
  ['mean', 'meaning'],
  ['name', 'named', 'called', 'call'],
];

function stem(word: string): string {
  if (/^\d/.test(word)) return word;
  let w = word;
  if (w.length > 4 && (w.endsWith('ies') || w.endsWith('ied'))) w = `${w.slice(0, -3)}y`;
  else if (w.length > 5 && w.endsWith('ing')) w = w.slice(0, -3);
  else if (w.length > 4 && w.endsWith('ed')) w = w.slice(0, -2);
  else if (w.length > 4 && w.endsWith('es') && !w.endsWith('ses')) w = w.slice(0, -1);
  if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) w = w.slice(0, -1);
  return w;
}

const CANON = new Map<string, string>();
for (const group of SYNONYM_GROUPS) {
  const head = stem(group[0]);
  for (const word of group) {
    CANON.set(word, head);
    CANON.set(stem(word), head);
  }
}

export function tokens(text: string, selfNames: string[]): string[] {
  const cleaned = stripNames(text, selfNames).toLowerCase().replace(/'s\b/g, '');
  const out: string[] = [];
  for (const match of cleaned.matchAll(/[a-z]+|\d+(?:\.\d+)?/g)) {
    const word = match[0];
    if (STOPWORDS.has(word)) continue;
    if (word.length < 2 && !/\d/.test(word)) continue;
    out.push(CANON.get(word) ?? CANON.get(stem(word)) ?? stem(word));
  }
  return out;
}

interface Scored {
  fact: MockFact;
  score: number;
  coverage: number;
  /** How many different question words the fact shares. */
  matched: number;
}

export function rankFacts(message: string, facts: MockFact[], selfNames: string[]): Scored[] {
  const questionTokens = [...new Set(tokens(message, selfNames))];
  if (questionTokens.length === 0 || facts.length === 0) return [];

  const factTokenSets = facts.map((f) => new Set(tokens(f.text, selfNames)));
  const documentFrequency = new Map<string, number>();
  for (const set of factTokenSets) {
    for (const t of set) documentFrequency.set(t, (documentFrequency.get(t) ?? 0) + 1);
  }
  const n = facts.length;
  const unknownWeight = Math.log(n + 1) + 1;
  const weightOf = (t: string): number => {
    const df = documentFrequency.get(t);
    return df ? Math.log((n + 1) / df) + 0.2 : unknownWeight;
  };
  const totalWeight = questionTokens.reduce((sum, t) => sum + weightOf(t), 0);

  const scored: Scored[] = facts.map((fact, i) => {
    let score = 0;
    let matched = 0;
    for (const t of questionTokens) {
      if (factTokenSets[i].has(t)) {
        score += weightOf(t);
        matched += 1;
      }
    }
    const coverage = totalWeight > 0 ? score / totalWeight : 0;
    // The hint only reorders facts that already match; it never makes a fact match.
    if (score > 0 && intentBonus(message, stripNames(fact.text, selfNames))) score *= 1.5;
    return { fact, score, coverage, matched };
  });
  // Stable order: best score first, then the shorter (more focused) fact, then the place in facts.json.
  return scored
    .map((s, i) => ({ s, i, size: factTokenSets[i].size }))
    .sort((a, b) => b.s.score - a.s.score || a.size - b.size || a.i - b.i)
    .map((x) => x.s);
}

// ---------- reading facts out in the first person ----------

const SAFE_VERBS =
  'was|had|landed|launched|traveled|came|got|set|arrived|reached|found|discovered|returned|stopped|touched|slid|' +
  'carried|operated|recorded|began|cruised|helped|kept|took|could|climbed|drove|broke|made|slid|dug|recorded|used|entered|explored';

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** "Opportunity's top speed was..." -> "My top speed was...". Leaves a sentence alone when unsure. */
export function toFirstPerson(text: string, selfNames: string[]): string {
  const sentences = splitSentences(text).map((sentence) => {
    let s = sentence;
    let changed = false;
    for (const name of selfNames) {
      const n = escapeRegExp(name);
      const before = "(?<!'s )(?<![Tt]he )(?<!of )(?<![A-Za-z0-9])";
      s = s.replace(new RegExp(`${before}${n}'s(?= )`, 'g'), (_m, offset: number) => {
        changed = true;
        return offset === 0 ? 'My' : 'my';
      });
      // The name becomes "I" only where it is the subject, not after a preposition or a verb.
      const subject = `(?<!\\b(?:from|by|to|with|for|near|at|on|towards?|aimed|sent|put|as|and) )${before}`;
      s = s.replace(new RegExp(`${subject}${n} (${SAFE_VERBS})\\b`, 'g'), (_m, verb: string) => {
        changed = true;
        return `I ${verb}`;
      });
      s = s.replace(new RegExp(`${subject}${n} is\\b`, 'g'), () => {
        changed = true;
        return 'I am';
      });
    }
    // "it" / "its" may point at something else in the sentence ("each wheel had its own motor"),
    // so a sentence that still has one is read out unchanged, in the third person.
    if (changed && /\b(it|its)\b/i.test(s)) return sentence;
    return s;
  });
  return sentences.join(' ');
}

// ---------- the mock model ----------

function reply(answer: string, factIds: string[], answerable: boolean, refusalReason?: RefusalReason): string {
  return JSON.stringify({ answer, factIds, answerable, ...(refusalReason ? { refusalReason } : {}) });
}

function normalizeQuestion(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function compose(persona: Persona, chosen: MockFact[]): string {
  const parts = [persona.opener];
  let sentenceCount = splitSentences(persona.opener).length;
  for (const fact of chosen) {
    const spoken = toFirstPerson(fact.text, persona.selfNames);
    const count = splitSentences(spoken).length;
    if (parts.length > 1 && sentenceCount + count > 4) break;
    parts.push(spoken);
    sentenceCount += count;
  }
  return parts.join(' ');
}

export function mockGenerate(input: MockInput): MockOutput {
  const { persona, memoryCutoff, facts, message } = input;

  if (OVERRIDE_PATTERNS.some((p) => p.test(message))) {
    return { text: reply('', [], false, 'off-topic'), route: 'guard' };
  }
  if (FEELING_PATTERN.test(message)) {
    return { text: reply('', [], false, 'off-topic'), route: 'guard' };
  }
  if (
    memoryCutoff &&
    (mentionsYearAfter(message, memoryCutoff) || NOW_PATTERN.test(message) || AFTER_END_PATTERN.test(message))
  ) {
    return { text: reply('', [], false, 'after-cutoff'), route: 'guard' };
  }

  if (mentionsOtherCraft(message, persona.selfNames)) {
    return { text: reply('', [], false, 'not-in-facts'), route: 'guard' };
  }

  const byId = new Map(facts.map((f) => [f.id, f]));

  const wanted = normalizeQuestion(message);
  const fixture = FIXTURES.find(
    (f) => f.artifactId === persona.artifactId && normalizeQuestion(f.question) === wanted,
  );
  if (fixture) {
    const chosen = fixture.factIds.map((id) => byId.get(id)).filter((f): f is MockFact => f !== undefined);
    // A fixture only counts when every fact it names passed fact selection.
    if (chosen.length === fixture.factIds.length && chosen.length > 0) {
      const answer = compose(persona, chosen);
      const used = chosen.filter((f) => answer.includes(toFirstPerson(f.text, persona.selfNames)));
      return { text: reply(answer, used.map((f) => f.id), true), route: 'fixture' };
    }
  }

  const ranked = rankFacts(message, facts, persona.selfNames);
  const best = ranked[0];
  if (!best || best.score <= 0 || best.coverage < 0.5) {
    return { text: reply('', [], false, 'not-in-facts'), route: 'no-match' };
  }
  const chosen = [best.fact];
  const second = ranked[1];
  // A second fact is read out only when it shares at least two question words; one shared word is too weak.
  if (second && second.matched >= 2 && second.score >= 0.9 * best.score && second.coverage >= 0.5) {
    chosen.push(second.fact);
  }

  // False-premise check: a number in the question that the chosen facts do not contain.
  const questionNumbers = numberTokens(stripNames(message, persona.selfNames));
  const factNumbers = numberTokens(chosen.map((f) => f.text).join(' '));
  for (const n of questionNumbers) {
    if (!factNumbers.has(n)) return { text: reply('', [], false, 'not-in-facts'), route: 'no-match' };
  }

  const answer = compose(persona, chosen);
  const used = chosen.filter((f) => answer.includes(toFirstPerson(f.text, persona.selfNames)));
  return { text: reply(answer, used.map((f) => f.id), true), route: 'keyword' };
}
