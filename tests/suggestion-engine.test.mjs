import assert from "node:assert/strict";
import test from "node:test";

import { rules } from "../js/data/rules.js";
import { suggestions } from "../js/data/suggestions.js";
import { analyzePrompt } from "../js/engine/improvement-engine.js";
import { detectLanguage } from "../js/engine/language-detector.js";
import {
  generateSuggestions,
  MAX_SUGGESTIONS,
  suggestionEngine,
} from "../js/engine/suggestion-engine.js";

const ids = (result) => result.map(({ ruleId }) => ruleId);

// Synthetic combinations exercise ranking/deduplication independently of the
// current detector's single-category output, using only existing rule metadata.
const finding = (ruleId) => {
  const { field, severity, type, message } = rules.find(({ id }) => id === ruleId);
  return { ruleId, field, severity, type, message };
};

const freezeDeep = (value) => {
  if (value && typeof value === "object") {
    Object.values(value).forEach(freezeDeep);
    Object.freeze(value);
  }
  return value;
};

test("weak Action is highest priority even when category gaps come first in analysis", () => {
  const state = { idea: "Prepare for a job interview", action: "Help me" };
  const analysis = analyzePrompt(state);
  assert.equal(analysis.findings[0].ruleId, "interview-position-missing");

  const result = generateSuggestions(state, analysis);
  assert.equal(result[0].ruleId, "generic-action-too-vague");
  assert.equal(result[0].field, "action");
  assert.equal(result[0].priority, 1);
  assert.equal(result[0].severity, "high");
});

test("missing Action produces a blocking Action suggestion", () => {
  assert.deepEqual(generateSuggestions({}), [{
    id: "action-task",
    field: "action",
    priority: 1,
    severity: "critical",
    message: "Describe the task you want completed and the result you need in Action.",
    ruleId: "structural-action-missing",
  }]);
});

test("missing communication context links to Context without inventing a recipient", () => {
  const result = generateSuggestions({ action: "Write an email" });
  assert.deepEqual(ids(result), [
    "communication-recipient-missing",
    "communication-purpose-missing",
  ]);
  assert.equal(result[0].field, "context");
  assert.equal(result[0].message, "Add who will receive the message to Context.");
  assert.equal(result[1].field, "action");
});

test("category-specific platform gap requests a choice rather than supplying one", () => {
  const result = generateSuggestions({
    action: "Create a caption for product awareness",
  });
  assert.equal(result[0].ruleId, "social-platform-missing");
  assert.equal(result[0].priority, 2);
  assert.equal(result[0].field, "context");
  assert.equal(
    result[0].message,
    "Name the platform where you intend to publish the content in Context.",
  );
  assert.equal(JSON.stringify(result).includes("Instagram"), false);
});

test("ranks by priority, severity, then explicit rule order regardless of input order", () => {
  const findings = [
    finding("communication-tone-missing"),
    finding("business-format-missing"),
    finding("interview-company-missing"),
    finding("interview-position-missing"),
  ];
  const result = generateSuggestions({}, { findings });
  assert.deepEqual(ids(result), [
    "interview-position-missing",
    "interview-company-missing",
    "business-format-missing",
    "communication-tone-missing",
  ]);
  assert.deepEqual(result.map(({ priority }) => priority), [2, 2, 4, 4]);
  assert.deepEqual(result, generateSuggestions({}, { findings: [...findings].reverse() }));
});

test("equal priority and severity use rule order as a stable tie-break", () => {
  const findings = [
    finding("social-audience-missing"),
    finding("social-goal-missing"),
    finding("social-output-type-missing"),
  ];
  assert.deepEqual(ids(generateSuggestions({}, { findings })), [
    "social-output-type-missing",
    "social-goal-missing",
    "social-audience-missing",
  ]);
});

test("more than four real findings return only the top four", () => {
  const state = { action: "Create social media content" };
  const analysis = analyzePrompt(state);
  assert.equal(analysis.findings.length, 5);
  const result = generateSuggestions(state);

  assert.equal(result.length, MAX_SUGGESTIONS);
  assert.deepEqual(ids(result), [
    "social-platform-missing",
    "social-output-type-missing",
    "social-goal-missing",
    "social-audience-missing",
  ]);
});

test("deduplicates repeated findings before applying the limit", () => {
  const findings = [
    ...Array.from({ length: 6 }, () => finding("social-platform-missing")),
    finding("social-goal-missing"),
    finding("social-audience-missing"),
    finding("social-tone-missing"),
  ];
  assert.deepEqual(ids(generateSuggestions({}, { findings })), [
    "social-platform-missing",
    "social-goal-missing",
    "social-audience-missing",
    "social-tone-missing",
  ]);
});

test("deduplicates materially equivalent next steps from different rules", () => {
  const findings = [
    finding("generic-action-too-vague"),
    finding("structural-action-missing"),
    finding("social-audience-missing"),
    finding("business-audience-missing"),
    finding("learning-format-missing"),
    finding("business-format-missing"),
    finding("social-tone-missing"),
    finding("communication-tone-missing"),
  ];
  const result = generateSuggestions({}, { findings });
  assert.deepEqual(ids(result), [
    "structural-action-missing",
    "business-audience-missing",
    "business-format-missing",
    "communication-tone-missing",
  ]);
  assert.equal(new Set(result.map(({ id }) => id)).size, result.length);
  assert.deepEqual(result, generateSuggestions({}, { findings: [...findings].reverse() }));
});

test("does not collapse distinct Context gaps into one suggestion", () => {
  const result = generateSuggestions({ action: "Prepare me for a job interview" });
  assert.deepEqual(ids(result).slice(0, 2), [
    "interview-position-missing",
    "interview-company-missing",
  ]);
  assert.equal(result[0].field, result[1].field);
  assert.notEqual(result[0].id, result[1].id);
});

test("the complete five-field UAT input still receives actionable gaps", () => {
  const state = {
    idea: "ich suche einen neuen Job",
    context:
      "Ich arbeite als Business Analyst bei einer Bank. Ich suche neue Herausforderungen.",
    role: "Du bist ein career coach.",
    action: "Hilf mir für die Vorbereitung für den Interviews.",
    format: ["Step-by-step"],
    tone: ["Professional"],
  };
  const result = generateSuggestions(state);

  assert.deepEqual(ids(result), [
    "interview-position-missing",
    "interview-goal-missing",
  ]);
  assert.equal(
    result[1].message,
    "Lege im Feld Action fest, ob du Übungsfragen, Beispielantworten, ein Probeinterview, Feedback oder einen Vorbereitungsplan möchtest.",
  );
  assert.ok(result.every(({ message }) => !message.includes("Acme")));
  assert.deepEqual(result, generateSuggestions(state));
});

test("strong prompts stop without filler and a single refinement stays single", () => {
  const general = { action: "Convert these recipe measurements from cups to grams" };
  const communication = {
    action: "Write a follow-up email to a customer to confirm the delivery date",
    tone: ["Professional"],
  };
  assert.deepEqual(generateSuggestions(general), []);
  assert.deepEqual(generateSuggestions(communication), []);
  assert.deepEqual(ids(generateSuggestions({ ...communication, tone: [] })), [
    "communication-tone-missing",
  ]);
});

test("localizes suggestions with the existing German language detector", () => {
  const state = { action: "Erkläre neuronale Netze" };
  assert.equal(detectLanguage(state), "de");
  const result = generateSuggestions(state);
  assert.equal(result[0].ruleId, "learning-level-missing");
  assert.equal(
    result[0].message,
    "Beschreibe im Kontext die bisherigen Kenntnisse der lernenden Person zum Thema.",
  );
  for (const item of result) {
    assert.equal(item.message, suggestions.find(({ ruleId }) => ruleId === item.ruleId).messages.de);
  }
});

test("uses English suggestions and keeps IDs independent of language", () => {
  const english = generateSuggestions({ action: "Explain neural networks" });
  const german = generateSuggestions({ action: "Erkläre neuronale Netze" });
  assert.equal(
    english[0].message,
    "Describe the learner's current knowledge of the topic in Context.",
  );
  assert.deepEqual(english.map(({ id }) => id), german.map(({ id }) => id));
});

test("uncertain and tied language evidence fall back to English", () => {
  for (const state of [{ action: "KPI dashboard" }, { action: "KPI dashboard bitte please" }]) {
    assert.equal(detectLanguage(state), "en");
    const result = generateSuggestions(state);
    assert.ok(result.length > 0);
    for (const item of result) {
      assert.equal(item.message, suggestions.find(({ ruleId }) => ruleId === item.ruleId).messages.en);
    }
  }
});

test("is deterministic and leaves deeply frozen state and analysis untouched", () => {
  const state = freezeDeep({
    idea: "Prepare for a job interview",
    action: "Help me",
    format: ["Bullet points"],
    tone: ["Friendly"],
  });
  const analysis = freezeDeep(analyzePrompt(state));
  const before = JSON.stringify({ state, analysis });
  const first = generateSuggestions(state, analysis);
  assert.deepEqual(first, generateSuggestions(state, analysis));
  assert.deepEqual(first, generateSuggestions(state));
  assert.equal(JSON.stringify({ state, analysis }), before);
  first[0].message = "Modified output only";
  assert.notEqual(generateSuggestions(state, analysis)[0].message, first[0].message);
});

test("does not expose raw diagnosis or create suggestions without findings", () => {
  const source = finding("communication-recipient-missing");
  source.message = "Assume the recipient is Alex at Acme on Monday with a budget of 5000.";
  const result = generateSuggestions({ action: "Write an email" }, { findings: [source] });
  assert.equal(result[0].message, "Add who will receive the message to Context.");
  assert.equal(JSON.stringify(result).includes("Acme"), false);
  assert.deepEqual(generateSuggestions({ action: "Help me" }, { findings: [] }), []);
});

test("ignores unmapped or malformed findings instead of generating generic filler", () => {
  const findings = [
    null,
    { ruleId: "future-rule", field: "context", severity: "high" },
    { ...finding("social-platform-missing"), field: "tone" },
    { ...finding("social-platform-missing"), severity: "unknown" },
  ];
  assert.deepEqual(generateSuggestions({}, { findings }), []);
  assert.deepEqual(generateSuggestions({}, { findings: null }), []);
});

test("every existing rule has actionable bilingual copy and a valid traceable contract", () => {
  assert.equal(new Set(suggestions.map(({ ruleId }) => ruleId)).size, rules.length);
  assert.equal(suggestions.length, rules.length);
  assert.equal(suggestionEngine.generateSuggestions, generateSuggestions);

  for (const rule of rules) {
    const source = finding(rule.id);
    const [result] = generateSuggestions({}, { findings: [source] });
    const copy = suggestions.find(({ ruleId }) => ruleId === rule.id);
    assert.ok(copy?.messages.en.trim());
    assert.ok(copy?.messages.de.trim());
    assert.equal(result.ruleId, source.ruleId);
    assert.equal(result.field, source.field);
    assert.equal(result.severity, source.severity);
    assert.ok(["context", "role", "action", "format", "tone"].includes(result.field));
    assert.ok([1, 2, 3, 4].includes(result.priority));
    assert.ok(result.id.length > 0);
    assert.notEqual(result.message, source.message);
    assert.deepEqual(Object.keys(result), ["id", "field", "priority", "severity", "message", "ruleId"]);
    assert.deepEqual(JSON.parse(JSON.stringify(result)), result);
    const [localized] = generateSuggestions(
      { action: "Hilf mir" },
      { findings: [source] },
    );
    assert.equal(localized.id, result.id);
    assert.equal(localized.message, copy.messages.de);
  }
});

test("real category analyses yield only source-linked, bounded, unique suggestions", () => {
  for (const action of [
    "Help me",
    "Prepare me for a job interview",
    "Write an email",
    "Explain neural networks",
    "Create social media content",
    "Create a management report with KPI analysis",
    "Write a short birthday message to my friend",
  ]) {
    const state = { action };
    const analysis = analyzePrompt(state);
    const result = generateSuggestions(state, analysis);
    assert.ok(result.length <= MAX_SUGGESTIONS);
    assert.equal(new Set(result.map(({ id }) => id)).size, result.length);
    for (const item of result) {
      assert.ok(analysis.findings.some(
        (source) => source.ruleId === item.ruleId && source.field === item.field,
      ));
    }
  }
});
