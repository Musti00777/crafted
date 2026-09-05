import {
  DEFAULT_EXAMPLE_CATEGORY,
  examples,
} from "../data/examples.js";
import { detectCategory } from "./category-detector.js";
import { DEFAULT_LANGUAGE, detectLanguage } from "./language-detector.js";

export const EXAMPLE_FIELDS = Object.freeze([
  "context",
  "role",
  "action",
  "format",
  "tone",
]);

export const getContextualExamples = (state = {}) => {
  const ideaState = { idea: state?.idea ?? "" };
  const language = detectLanguage(ideaState);
  const languageExamples = examples[language] ?? examples[DEFAULT_LANGUAGE];
  const detectedCategory = detectCategory(ideaState).category;
  const category = languageExamples[detectedCategory]
    ? detectedCategory
    : DEFAULT_EXAMPLE_CATEGORY;

  return {
    category,
    language,
    fields: Object.fromEntries(
      EXAMPLE_FIELDS.map((field) => [field, languageExamples[category][field]]),
    ),
  };
};

export const exampleEngine = Object.freeze({ getContextualExamples });
