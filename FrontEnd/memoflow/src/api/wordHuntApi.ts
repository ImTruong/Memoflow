const DICTIONARY_ENDPOINT = 'https://api.dictionaryapi.dev/api/v2/entries/en';
const TRANSLATE_ENDPOINT = 'https://api.mymemory.translated.net/get';

export async function isEnglishWord(word: string): Promise<boolean> {
  if (!word || word.length < 2) return false;

  try {
    const response = await fetch(`${DICTIONARY_ENDPOINT}/${word.toLowerCase()}`);
    return response.ok;
  } catch {
    return false;
  }
}

export async function fetchVietnameseMeaning(word: string): Promise<string | null> {
  if (!word || word.length < 2) return null;

  try {
    const response = await fetch(
      `${TRANSLATE_ENDPOINT}?q=${encodeURIComponent(word.toLowerCase())}&langpair=en|vi`
    );

    if (!response.ok) return null;

    const payload = await response.json();
    const translated = payload?.responseData?.translatedText;

    if (typeof translated !== 'string') {
      return null;
    }

    const cleaned = translated.trim();
    if (!cleaned || cleaned.toLowerCase() === word.toLowerCase()) {
      return null;
    }

    return cleaned;
  } catch {
    return null;
  }
}
