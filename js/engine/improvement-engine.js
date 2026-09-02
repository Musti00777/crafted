import { RULE_PHASE_ORDER, rules } from "../data/rules.js";
import {
  detectCategory,
  normalizeCategoryText,
} from "./category-detector.js";

const TEXT_FIELDS = Object.freeze(["idea", "context", "role", "action"]);
const SELECTION_FIELDS = Object.freeze(["format", "tone"]);

const cleanText = (value) => String(value ?? "").trim();

const uniqueValues = (values) => {
  const seen = new Set();
  return values.filter((value) => {
    const key = normalizeCategoryText(value);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const selectionValues = (state, field) => {
  const selected = Array.isArray(state?.[field]) ? state[field] : [];
  const customField = `custom${field[0].toUpperCase()}${field.slice(1)}`;
  const custom = cleanText(state?.[customField]);

  return uniqueValues(
    [...selected, custom]
      .map(cleanText)
      .filter(Boolean),
  );
};

const buildCraftSnapshot = (state) => {
  const craft = {};

  TEXT_FIELDS.forEach((field) => {
    const value = cleanText(state?.[field]);
    craft[field] = {
      provided: Boolean(value),
      value,
    };
  });

  SELECTION_FIELDS.forEach((field) => {
    const values = selectionValues(state, field);
    craft[field] = {
      provided: values.length > 0,
      values,
    };
  });

  return craft;
};

const buildEvaluationContext = (state, craft) => ({
  state,
  craft,
  normalized: Object.fromEntries(
    TEXT_FIELDS.map((field) => [
      field,
      normalizeCategoryText(craft[field].value),
    ]),
  ),
});

const fieldIsProvided = (context, field) =>
  Boolean(context.craft[field]?.provided);

const collectScopeText = (context, scope = TEXT_FIELDS) =>
  scope
    .map((field) => context.normalized[field] ?? "")
    .filter(Boolean)
    .join(" ");

const includesTerm = (text, term) => {
  const normalizedTerm = normalizeCategoryText(term);
  return Boolean(
    normalizedTerm && ` ${text} `.includes(` ${normalizedTerm} `),
  );
};

const hasSignal = (context, condition) => {
  const text = collectScopeText(context, condition.scope);
  return condition.terms.some((term) => includesTerm(text, term));
};

const countDescriptiveWords = (context, condition) => {
  const ignoredWords = new Set(
    condition.ignoredTerms.flatMap((term) =>
      normalizeCategoryText(term).split(" ").filter(Boolean),
    ),
  );

  return collectScopeText(context, condition.scope)
    .split(" ")
    .filter((word) => word.length > 1 && !ignoredWords.has(word)).length;
};

const actionIsVague = (context, condition) => {
  const action = context.normalized.action;
  if (!action) return false;

  if (
    condition.alwaysPhrases.some(
      (phrase) => action === normalizeCategoryText(phrase),
    )
  ) {
    return true;
  }

  const isContextualPhrase = condition.contextualPhrases.some(
    (phrase) => action === normalizeCategoryText(phrase),
  );
  if (!isContextualPhrase) return false;

  const supportWordCount = collectScopeText(
    context,
    condition.supportFields,
  )
    .split(" ")
    .filter(Boolean).length;

  return supportWordCount < condition.minimumSupportWords;
};

const evaluateCondition = (context, condition) => {
  switch (condition.kind) {
    case "all":
      return condition.conditions.every((item) =>
        evaluateCondition(context, item),
      );
    case "any":
      return condition.conditions.some((item) =>
        evaluateCondition(context, item),
      );
    case "field-missing":
      return !fieldIsProvided(context, condition.field);
    case "signal-present":
      return hasSignal(context, condition);
    case "signal-missing":
      return !hasSignal(context, condition);
    case "detail-missing":
      return countDescriptiveWords(context, condition) < condition.minimumWords;
    case "action-vague":
      return actionIsVague(context, condition);
    default:
      return false;
  }
};

const ruleAppliesToCategory = (rule, category) =>
  rule.categories.includes("*") || rule.categories.includes(category);

const orderRules = () => {
  const phaseRank = new Map(
    RULE_PHASE_ORDER.map((phase, index) => [phase, index]),
  );

  return rules
    .map((rule, index) => ({ rule, index }))
    .sort(
      (left, right) =>
        phaseRank.get(left.rule.phase) - phaseRank.get(right.rule.phase) ||
        left.index - right.index,
    )
    .map(({ rule }) => rule);
};

const toFinding = ({ id: ruleId, field, severity, type, message }) => ({
  ruleId,
  field,
  severity,
  type,
  message,
});

export const analyzePrompt = (state = {}) => {
  const craft = buildCraftSnapshot(state);
  const context = buildEvaluationContext(state, craft);
  const categoryDetection = detectCategory(state);
  const findingsByProblem = new Map();

  orderRules().forEach((rule) => {
    if (!ruleAppliesToCategory(rule, categoryDetection.category)) return;
    if (!evaluateCondition(context, rule.condition)) return;

    const problemKey = rule.dedupeKey ?? rule.id;
    if (!findingsByProblem.has(problemKey)) {
      findingsByProblem.set(problemKey, toFinding(rule));
    }
  });

  const vagueRule = rules.find(({ id }) => id === "generic-action-too-vague");
  craft.action.quality = !craft.action.provided
    ? "missing"
    : evaluateCondition(context, vagueRule.condition)
      ? "vague"
      : "clear";

  return {
    category: categoryDetection.category,
    categoryDetection: {
      confidence: categoryDetection.confidence,
      matchedTerms: [...categoryDetection.matchedTerms],
    },
    craft,
    findings: [...findingsByProblem.values()],
  };
};

export const improvementEngine = Object.freeze({ analyzePrompt });
