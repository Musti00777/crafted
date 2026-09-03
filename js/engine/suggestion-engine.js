import { RULE_PHASE_ORDER, rules } from "../data/rules.js";
import { suggestions } from "../data/suggestions.js";
import { analyzePrompt } from "./improvement-engine.js";
import { DEFAULT_LANGUAGE, detectLanguage } from "./language-detector.js";

export const MAX_SUGGESTIONS = 4;

const severityRank = new Map(
  ["critical", "high", "medium", "low"].map((severity, index) => [severity, index]),
);
const ruleById = new Map(
  rules.map((rule, index) => [rule.id, { rule, index }]),
);
const copyByRuleId = new Map(
  suggestions.map((suggestion) => [suggestion.ruleId, suggestion]),
);

const priorityFor = (rule) => {
  // Build 7 calls weak Action a generic issue. For UX it must come first.
  if (rule.field === "action" && rule.type === "vague-action") return 1;
  return RULE_PHASE_ORDER.indexOf(rule.phase) + 1;
};

const candidateFor = (finding, language) => {
  const source = ruleById.get(finding?.ruleId);
  const copy = copyByRuleId.get(finding?.ruleId);
  if (
    !source ||
    !copy ||
    finding.field !== source.rule.field ||
    !severityRank.has(finding.severity)
  ) {
    return null;
  }

  return {
    ruleIndex: source.index,
    problemKey: `${finding.field}:${source.rule.dedupeKey ?? copy.id}`,
    suggestion: {
      id: copy.id,
      field: finding.field,
      priority: priorityFor(source.rule),
      severity: finding.severity,
      message: copy.messages[language] ?? copy.messages[DEFAULT_LANGUAGE],
      ruleId: finding.ruleId,
    },
  };
};

const compareCandidates = (left, right) =>
  left.suggestion.priority - right.suggestion.priority ||
  severityRank.get(left.suggestion.severity) -
    severityRank.get(right.suggestion.severity) ||
  left.ruleIndex - right.ruleIndex;

// Callers may reuse an analysis snapshot for the same state. No second
// diagnosis is performed; only mapped findings become suggestion candidates.
export const generateSuggestions = (state = {}, analysis = analyzePrompt(state)) => {
  if (!Array.isArray(analysis?.findings)) return [];

  const language = detectLanguage(state);
  const candidates = analysis.findings
    .map((finding) => candidateFor(finding, language))
    .filter(Boolean)
    .sort(compareCandidates);
  const seenProblems = new Set();
  const result = [];

  for (const candidate of candidates) {
    if (seenProblems.has(candidate.problemKey)) continue;
    seenProblems.add(candidate.problemKey);
    result.push(candidate.suggestion);
    if (result.length === MAX_SUGGESTIONS) break;
  }

  return result;
};

export const suggestionEngine = Object.freeze({ generateSuggestions });
