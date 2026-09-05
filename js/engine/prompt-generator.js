import { promptFragments } from "../data/prompt-fragments.js";
import { analyzePrompt } from "./improvement-engine.js";
import { DEFAULT_LANGUAGE, detectLanguage } from "./language-detector.js";

export const META_PROMPT_FIELD_ORDER = Object.freeze([
  "action",
  "idea",
  "context",
  "role",
  "format",
  "tone",
]);

const contentFor = (craft, field) => {
  const element = craft[field];
  if (!element?.provided) return "";

  return Array.isArray(element.values)
    ? element.values.join(", ")
    : element.value;
};

export const generateMetaPrompt = (state = {}) => {
  const analysis = analyzePrompt(state);
  if (!analysis.craft.action.provided) return "";

  const language = detectLanguage(state);
  const fragments = promptFragments[language] ?? promptFragments[DEFAULT_LANGUAGE];

  const sections = META_PROMPT_FIELD_ORDER.map((field) => ({
    label: fragments[field],
    content: contentFor(analysis.craft, field),
  }))
    .filter(({ content }) => content)
    .map(({ label, content }) => `${label}\n${content}`);

  return [...sections, fragments.guardrail].join("\n\n");
};

export const promptGenerator = Object.freeze({ generateMetaPrompt });
