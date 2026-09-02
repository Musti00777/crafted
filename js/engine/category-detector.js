import { categories } from "../data/categories.js";

export const CATEGORY_INPUT_FIELDS = Object.freeze([
  "idea",
  "context",
  "role",
  "action",
]);

export const CATEGORY_SCORING = Object.freeze({
  strongTerm: 3,
  keyword: 1,
  minimumSpecializedScore: 2,
});

export const normalizeCategoryText = (value) =>
  String(value ?? "")
    .normalize("NFKC")
    .toLocaleLowerCase("de-DE")
    .replaceAll("ß", "ss")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

const collectDetectionText = (state) =>
  normalizeCategoryText(
    CATEGORY_INPUT_FIELDS.map((field) => state?.[field] ?? "").join(" "),
  );

const includesTerm = (text, term) => {
  const normalizedTerm = normalizeCategoryText(term);
  return normalizedTerm && ` ${text} `.includes(` ${normalizedTerm} `);
};

const scoreCategory = (category, text) => {
  const strongMatches = category.strongTerms.filter((term) =>
    includesTerm(text, term),
  );
  const keywordMatches = category.keywords.filter((term) =>
    includesTerm(text, term),
  );

  return {
    category: category.id,
    score:
      strongMatches.length * CATEGORY_SCORING.strongTerm +
      keywordMatches.length * CATEGORY_SCORING.keyword,
    strongMatchCount: strongMatches.length,
    matchedTerms: [...strongMatches, ...keywordMatches],
  };
};

const confidenceFor = ({ score, strongMatchCount, matchedTerms }) => {
  if (strongMatchCount >= 2 || (score >= 5 && matchedTerms.length >= 3)) {
    return "high";
  }

  if (strongMatchCount >= 1 || matchedTerms.length >= 3) return "medium";
  return "low";
};

const generalResult = (matchedTerms = []) => ({
  category: "general",
  confidence: "low",
  matchedTerms,
});

export const detectCategory = (state = {}) => {
  const text = collectDetectionText(state);
  if (!text) return generalResult();

  const results = categories
    .filter(({ id }) => id !== "general")
    .map((category) => scoreCategory(category, text));
  const highestScore = Math.max(...results.map(({ score }) => score));

  if (highestScore < CATEGORY_SCORING.minimumSpecializedScore) {
    return generalResult();
  }

  const leaders = results.filter(({ score }) => score === highestScore);
  if (leaders.length !== 1) {
    const matchedTerms = [
      ...new Set(leaders.flatMap((result) => result.matchedTerms)),
    ].sort();
    return generalResult(matchedTerms);
  }

  const winner = leaders[0];
  return {
    category: winner.category,
    confidence: confidenceFor(winner),
    matchedTerms: winner.matchedTerms,
  };
};
