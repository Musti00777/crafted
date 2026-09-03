import { STEP_ORDER } from "./navigation.js";
import { createCraftSummaryFromAnalysis } from "./craft-summary.js";
import { analyzePrompt } from "./engine/improvement-engine.js";
import { generateMetaPrompt } from "./engine/prompt-generator.js";
import { generateSuggestions } from "./engine/suggestion-engine.js";

const navigableFields = new Set(STEP_ORDER);

export const getSuggestionTargetStep = (suggestion) =>
  navigableFields.has(suggestion?.field) ? suggestion.field : null;

export const createImprovementResult = (state = {}) => {
  const analysis = analyzePrompt(state);

  return {
    analysis,
    metaPrompt: generateMetaPrompt(state),
    suggestions: generateSuggestions(state, analysis),
    summary: createCraftSummaryFromAnalysis(analysis),
  };
};

export const createImprovementLoop = ({
  readState,
  renderResult = () => {},
  navigateToStep = () => {},
  createResult = createImprovementResult,
}) => {
  if (typeof readState !== "function") {
    throw new TypeError("The improvement loop requires a state reader.");
  }

  let latestResult = null;

  return Object.freeze({
    run() {
      const nextResult = createResult(readState());
      latestResult = nextResult;
      renderResult(nextResult);
      return nextResult;
    },
    selectSuggestion(suggestion) {
      const targetStep = getSuggestionTargetStep(suggestion);
      if (!targetStep) return false;

      navigateToStep(targetStep);
      return true;
    },
    getLatestResult() {
      return latestResult;
    },
  });
};
