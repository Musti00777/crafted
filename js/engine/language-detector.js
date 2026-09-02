export const DEFAULT_LANGUAGE = "en";
export const SUPPORTED_LANGUAGES = Object.freeze(["en", "de"]);

export const LANGUAGE_INPUT_FIELDS = Object.freeze([
  "idea",
  "context",
  "role",
  "action",
  "customFormat",
  "customTone",
]);

const LANGUAGE_SIGNALS = Object.freeze({
  de: Object.freeze([
    "als",
    "bitte",
    "das",
    "der",
    "die",
    "ein",
    "eine",
    "einen",
    "einem",
    "einer",
    "erkläre",
    "erstelle",
    "für",
    "hilf",
    "ich",
    "mein",
    "meine",
    "meinen",
    "mir",
    "mit",
    "schreibe",
    "soll",
    "und",
    "vorbereitung",
  ]),
  en: Object.freeze([
    "a",
    "an",
    "and",
    "as",
    "create",
    "explain",
    "for",
    "help",
    "i",
    "me",
    "my",
    "please",
    "prepare",
    "should",
    "the",
    "to",
    "with",
    "write",
  ]),
});

const collectLanguageText = (state) =>
  LANGUAGE_INPUT_FIELDS.map((field) => state?.[field] ?? "").join(" ");

const tokenize = (value) =>
  String(value ?? "")
    .normalize("NFKC")
    .toLocaleLowerCase("de-DE")
    .match(/\p{L}+/gu) ?? [];

const countSignals = (tokens, language) => {
  const signals = new Set(LANGUAGE_SIGNALS[language]);
  return tokens.filter((token) => signals.has(token)).length;
};

export const detectLanguage = (state = {}) => {
  const text = collectLanguageText(state);
  const tokens = tokenize(text);
  const germanCharacterSignal = /[äöüß]/iu.test(text) ? 1 : 0;
  const germanScore = countSignals(tokens, "de") + germanCharacterSignal;
  const englishScore = countSignals(tokens, "en");

  return germanScore > englishScore ? "de" : DEFAULT_LANGUAGE;
};

export const languageDetector = Object.freeze({ detectLanguage });
