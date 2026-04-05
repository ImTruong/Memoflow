const TRANSLATE_ENDPOINT = 'https://api.mymemory.translated.net/get';
const DICTIONARY_ENDPOINT = 'https://api.dictionaryapi.dev/api/v2/entries/en';

const translationCache = new Map<string, string>();
const dictionarySignalCache = new Map<string, { hasEntry: boolean; hasAudio: boolean }>();

const ENGLISH_STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'by',
  'for',
  'from',
  'in',
  'is',
  'it',
  'of',
  'on',
  'or',
  'that',
  'the',
  'to',
  'with',
  'which',
  'often',
  'usually',
  'contains',
]);

type TranslationCandidate = {
  text: string;
  matchScore: number;
  qualityScore: number;
  fromPrimary: boolean;
};

export type StoryWordReplacement = {
  source: string;
  english: string;
  placeholder: string;
};

export type ParsedStoryWordFile = {
  paragraphs: string[];
  vocabulary: string[];
  plainText: string;
  warnings: string[];
  replacements: StoryWordReplacement[];
};

const normalizeWhitespace = (value: string): string => {
  return value.replace(/\s+/g, ' ').trim();
};

const normalizeEnglishPhrase = (value: string): string => {
  const words = value.match(/[A-Za-z]+(?:['-][A-Za-z]+)*/g) ?? [];
  return words.join(' ').trim();
};

const tokenizeAsciiWords = (value: string): string[] => {
  const tokens = value.toLowerCase().match(/[a-z]+/g);
  return tokens ?? [];
};

const isLikelyEnglishDefinition = (value: string): boolean => {
  const tokens = tokenizeAsciiWords(value);
  if (tokens.length < 6) {
    return false;
  }

  let stopWordCount = 0;
  for (const token of tokens) {
    if (ENGLISH_STOP_WORDS.has(token)) {
      stopWordCount += 1;
    }
  }

  return /[.!?]/.test(value) || stopWordCount >= 3;
};

const isLikelyEnglish = (value: string): boolean => {
  return /^[A-Za-z][A-Za-z\s'-]*$/.test(value.trim());
};

const toTitleCaseWord = (value: string): string => {
  if (!value) {
    return value;
  }

  if (value.includes('-')) {
    return value
      .split('-')
      .map((item) => toTitleCaseWord(item))
      .join('-');
  }

  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
};

const toVocabularyWord = (value: string): string => {
  const normalized = normalizeEnglishPhrase(value);
  if (!normalized) {
    return '';
  }

  return normalized
    .split(' ')
    .map((word) => toTitleCaseWord(word))
    .join(' ');
};

const toPlaceholder = (value: string): string => {
  const normalized = normalizeEnglishPhrase(value);
  if (!normalized) {
    return '{word}';
  }

  return `{${normalized.split(' ').join('_').toLowerCase()}}`;
};

const toRecord = (value: unknown): Record<string, unknown> | null => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return null;
};

const toNormalizedScore = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    if (value > 1) {
      return Math.max(0, Math.min(1, value / 100));
    }

    return Math.max(0, Math.min(1, value));
  }

  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) {
      if (parsed > 1) {
        return Math.max(0, Math.min(1, parsed / 100));
      }

      return Math.max(0, Math.min(1, parsed));
    }
  }

  return 0;
};

const getTranslationCandidates = (payload: unknown): TranslationCandidate[] => {
  const candidates: TranslationCandidate[] = [];
  const root = toRecord(payload);

  if (!root) {
    return candidates;
  }

  const responseData = toRecord(root.responseData);
  if (responseData && typeof responseData.translatedText === 'string') {
    candidates.push({
      text: responseData.translatedText,
      matchScore: toNormalizedScore(responseData.match),
      qualityScore: toNormalizedScore(responseData.quality),
      fromPrimary: true,
    });
  }

  const matches = Array.isArray(root.matches) ? root.matches : [];
  matches.forEach((match) => {
    const item = toRecord(match);
    if (!item || typeof item.translation !== 'string') {
      return;
    }

    candidates.push({
      text: item.translation,
      matchScore: toNormalizedScore(item.match),
      qualityScore: toNormalizedScore(item.quality),
      fromPrimary: false,
    });
  });

  return candidates;
};

const canLookupDictionary = (value: string): boolean => {
  const normalized = normalizeEnglishPhrase(value);
  return /^[A-Za-z]+(?:['-][A-Za-z]+)*$/.test(normalized);
};

const fetchDictionarySignal = async (
  candidate: string,
): Promise<{ hasEntry: boolean; hasAudio: boolean }> => {
  const normalized = normalizeEnglishPhrase(candidate).toLowerCase();
  if (!normalized || !canLookupDictionary(normalized)) {
    return { hasEntry: false, hasAudio: false };
  }

  const cached = dictionarySignalCache.get(normalized);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(`${DICTIONARY_ENDPOINT}/${encodeURIComponent(normalized)}`);
    if (!response.ok) {
      const fallback = { hasEntry: false, hasAudio: false };
      dictionarySignalCache.set(normalized, fallback);
      return fallback;
    }

    const payload = (await response.json()) as unknown;
    const entries = Array.isArray(payload) ? payload : [];
    const firstEntry = entries.length > 0 ? toRecord(entries[0]) : null;

    const phonetics = firstEntry && Array.isArray(firstEntry.phonetics) ? firstEntry.phonetics : [];
    const hasAudio = phonetics.some((item) => {
      const record = toRecord(item);
      return Boolean(record && typeof record.audio === 'string' && record.audio.trim().length > 0);
    });

    const signal = { hasEntry: entries.length > 0, hasAudio };
    dictionarySignalCache.set(normalized, signal);
    return signal;
  } catch {
    const fallback = { hasEntry: false, hasAudio: false };
    dictionarySignalCache.set(normalized, fallback);
    return fallback;
  }
};

const scoreTranslationCandidate = (
  candidate: TranslationCandidate,
  normalizedText: string,
  dictionarySignal: { hasEntry: boolean; hasAudio: boolean },
): number => {
  const wordCount = normalizedText.split(' ').filter((item) => item.length > 0).length;
  const wordCountScore = wordCount === 1 ? 56 : wordCount === 2 ? 16 : -30;
  const dictionaryScore = (dictionarySignal.hasEntry ? 20 : 0) + (dictionarySignal.hasAudio ? 9 : 0);
  const providerScore = candidate.matchScore * 120 + candidate.qualityScore * 44;
  const primaryScore = candidate.fromPrimary ? 5 : 0;

  return providerScore + wordCountScore + dictionaryScore + primaryScore;
};

const uniqueByLowerCase = (items: string[]): string[] => {
  const seen = new Set<string>();
  const results: string[] = [];

  items.forEach((item) => {
    const normalized = item.trim();
    if (!normalized) {
      return;
    }

    const key = normalized.toLowerCase();
    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    results.push(normalized);
  });

  return results;
};

const normalizeParagraphText = (value: string): string => {
  return value
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;!?])/g, '$1')
    .replace(/\{\s+/g, '{')
    .replace(/\s+\}/g, '}')
    .trim();
};

const escapeRegExp = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const applyReplacementTerms = (
  value: string,
  replacements: StoryWordReplacement[],
): string => {
  const sorted = [...replacements].sort((a, b) => b.source.length - a.source.length);

  return sorted.reduce((result, replacement) => {
    const source = replacement.source.trim();
    if (!source) {
      return result;
    }

    const pattern = new RegExp(
      `(^|[^\\p{L}\\p{N}_])(${escapeRegExp(source)})(?=$|[^\\p{L}\\p{N}_])`,
      'giu',
    );

    return result.replace(pattern, (_, prefix: string) => `${prefix}${replacement.placeholder}`);
  }, value);
};

const translateTermToEnglish = async (sourceTerm: string): Promise<string> => {
  const source = normalizeWhitespace(sourceTerm);
  if (!source) {
    return '';
  }

  const cacheKey = source.toLowerCase();
  const cached = translationCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  if (isLikelyEnglish(source)) {
    const normalized = normalizeEnglishPhrase(source);
    translationCache.set(cacheKey, normalized);
    return normalized;
  }

  try {
    const response = await fetch(
      `${TRANSLATE_ENDPOINT}?q=${encodeURIComponent(source)}&langpair=vi|en`,
    );

    if (response.ok) {
      const payload = (await response.json()) as unknown;
      const rawCandidates = getTranslationCandidates(payload);

      const uniqueCandidates = uniqueByLowerCase(
        rawCandidates
          .map((item) => normalizeEnglishPhrase(item.text))
          .filter((item) => item.length > 0),
      );

      const candidateByText = new Map<string, TranslationCandidate>();
      rawCandidates.forEach((candidate) => {
        const normalized = normalizeEnglishPhrase(candidate.text);
        if (!normalized) {
          return;
        }

        const key = normalized.toLowerCase();
        const current = candidateByText.get(key);
        if (!current) {
          candidateByText.set(key, candidate);
          return;
        }

        if (candidate.matchScore > current.matchScore || candidate.qualityScore > current.qualityScore) {
          candidateByText.set(key, candidate);
        }
      });

      const scoredCandidates = await Promise.all(
        uniqueCandidates.slice(0, 12).map(async (normalizedText) => {
          const normalizedKey = normalizedText.toLowerCase();
          const candidate = candidateByText.get(normalizedKey);
          if (!candidate || isLikelyEnglishDefinition(normalizedText)) {
            return null;
          }

          const dictionarySignal = await fetchDictionarySignal(normalizedText);
          return {
            text: normalizedText,
            score: scoreTranslationCandidate(candidate, normalizedText, dictionarySignal),
          };
        }),
      );

      const best = scoredCandidates
        .filter((item): item is { text: string; score: number } => item !== null)
        .sort((a, b) => b.score - a.score)[0];

      if (best?.text) {
        translationCache.set(cacheKey, best.text);
        return best.text;
      }
    }
  } catch {
    // Fallback to local normalization below.
  }

  const fallback = normalizeEnglishPhrase(source);
  translationCache.set(cacheKey, fallback);
  return fallback;
};

export async function parseStoryWordFile(file: File): Promise<ParsedStoryWordFile> {
  if (!file.name.toLowerCase().endsWith('.docx')) {
    throw new Error('Hiện tại chỉ hỗ trợ file Word định dạng .docx.');
  }

  const mammoth = await import('mammoth');

  const buffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer: buffer });

  const parser = new DOMParser();
  const documentNode = parser.parseFromString(result.value, 'text/html');

  const paragraphNodes = Array.from(documentNode.querySelectorAll('p'));

  const rawBoldSegments = Array.from(documentNode.querySelectorAll('strong, b'))
    .map((node) => normalizeWhitespace(node.textContent ?? ''))
    .filter((segment) => segment.length > 0);

  const uniqueBoldSegments = uniqueByLowerCase(rawBoldSegments);

  const replacements: StoryWordReplacement[] = [];

  for (const source of uniqueBoldSegments) {
    const translated = await translateTermToEnglish(source);
    const englishWord = toVocabularyWord(translated || source);
    if (!englishWord) {
      continue;
    }

    const placeholder = toPlaceholder(englishWord);

    replacements.push({
      source,
      english: englishWord,
      placeholder,
    });
  }

  const paragraphs = paragraphNodes.length > 0
    ? paragraphNodes
        .map((node) => applyReplacementTerms(node.textContent ?? '', replacements))
        .map((paragraph) => normalizeParagraphText(paragraph))
        .filter((paragraph) => paragraph.length > 0)
    : (documentNode.body.textContent ?? '')
        .split(/\n\s*\n/g)
        .map((paragraph) => applyReplacementTerms(paragraph, replacements))
        .map((paragraph) => normalizeParagraphText(paragraph))
        .filter((paragraph) => paragraph.length > 0);

  const vocabulary = uniqueByLowerCase(replacements.map((item) => item.english));
  const warnings = result.messages.map((message) => message.message);

  return {
    paragraphs,
    vocabulary,
    plainText: paragraphs.join('\n\n'),
    warnings,
    replacements,
  };
}
