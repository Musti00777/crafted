import { STEP_CONFIG, STEP_ORDER } from "./navigation.js";
import { analyzePrompt } from "./engine/improvement-engine.js";

export const createCraftSummaryFromAnalysis = (analysis = {}) =>
  STEP_ORDER.map((field) => ({
    field,
    label: STEP_CONFIG[field].name,
    used: Boolean(analysis.craft?.[field]?.provided),
  }));

export const createCraftSummary = (state = {}) =>
  createCraftSummaryFromAnalysis(analyzePrompt(state));
