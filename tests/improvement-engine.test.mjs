import assert from "node:assert/strict";
import test from "node:test";

import { rules } from "../js/data/rules.js";
import { detectCategory } from "../js/engine/category-detector.js";
import { analyzePrompt } from "../js/engine/improvement-engine.js";

const findingIds = (analysis) =>
  analysis.findings.map(({ ruleId }) => ruleId);

const hasFinding = (analysis, ruleId) =>
  findingIds(analysis).includes(ruleId);

test("returns a deterministic, serializable analysis", () => {
  const state = {
    idea: "Prepare for a job interview",
    action: "Help me",
  };

  const first = analyzePrompt(state);
  const second = analyzePrompt(state);

  assert.deepEqual(first, second);
  assert.doesNotThrow(() => JSON.stringify(first));
  assert.deepEqual(Object.keys(first), [
    "category",
    "categoryDetection",
    "craft",
    "findings",
  ]);
});

test("does not mutate the input state or its selections", () => {
  const state = Object.freeze({
    idea: "Draft a clear birthday greeting",
    action: "Write a short birthday message to my friend",
    format: Object.freeze(["Short paragraphs"]),
    customFormat: "Greeting card",
    tone: Object.freeze(["Warm"]),
  });

  const before = JSON.stringify(state);
  const analysis = analyzePrompt(state);

  assert.equal(JSON.stringify(state), before);
  assert.deepEqual(analysis.craft.format.values, [
    "Short paragraphs",
    "Greeting card",
  ]);
  assert.deepEqual(analysis.craft.tone.values, ["Warm"]);
});

test("flags a vague general request but accepts a clear general request", () => {
  const vague = analyzePrompt({ action: "Help me" });
  const clear = analyzePrompt({
    action: "Convert these recipe measurements from cups to grams",
  });

  assert.equal(vague.category, "general");
  assert.equal(vague.craft.action.quality, "vague");
  assert.ok(hasFinding(vague, "generic-action-too-vague"));

  assert.equal(clear.category, "general");
  assert.equal(clear.craft.action.quality, "clear");
  assert.deepEqual(clear.findings, []);
});

test("treats a missing Action as the highest-priority structural issue", () => {
  const analysis = analyzePrompt({ idea: "Prepare for a job interview" });

  assert.equal(analysis.craft.action.quality, "missing");
  assert.equal(analysis.findings[0].ruleId, "structural-action-missing");
  assert.equal(analysis.findings[0].severity, "critical");
  assert.equal(
    analysis.findings.some(
      ({ ruleId }) => ruleId === "generic-action-too-vague",
    ),
    false,
  );
});

test("interview analysis identifies gaps and rewards complete context", () => {
  const incomplete = analyzePrompt({
    action: "Help me prepare for a job interview",
  });
  const complete = analyzePrompt({
    context: "Company: Acme. Industry: software.",
    role: "Act as an experienced interview coach",
    action:
      "Create practice questions and model answers for a Senior Product Designer position",
    format: ["Question and answer pairs"],
  });

  assert.equal(incomplete.category, "interview");
  assert.ok(hasFinding(incomplete, "interview-position-missing"));
  assert.ok(hasFinding(incomplete, "interview-company-missing"));

  assert.equal(complete.category, "interview");
  assert.ok(complete.findings.length < incomplete.findings.length);
  assert.equal(hasFinding(complete, "interview-position-missing"), false);
  assert.equal(hasFinding(complete, "interview-company-missing"), false);
  assert.equal(hasFinding(complete, "interview-role-missing"), false);
  assert.equal(hasFinding(complete, "interview-format-missing"), false);
});

test("interview preparation alone does not count as a concrete outcome", () => {
  const incomplete = analyzePrompt({
    idea: "ich suche einen neuen Job",
    context: "Ich arbeite als Business Analyst bei einer Bank.",
    role: "Du bist ein career coach.",
    action: "Hilf mir für die Vorbereitung für den Interviews.",
    format: ["Step-by-step"],
    tone: ["Professional"],
  });

  assert.equal(incomplete.category, "interview");
  assert.ok(hasFinding(incomplete, "interview-goal-missing"));
  assert.equal(hasFinding(incomplete, "interview-company-missing"), false);
  assert.equal(
    hasFinding(
      analyzePrompt({
        role: "Du bist ein career coach.",
        action: "Erstelle Fragen und Antworten für die Interviews.",
      }),
      "interview-goal-missing",
    ),
    false,
  );
  assert.equal(
    hasFinding(
      analyzePrompt({
        role: "Du bist ein career coach.",
        action: "Erstelle einen Plan für die Interviews.",
      }),
      "interview-goal-missing",
    ),
    false,
  );
});

test("communication analysis finds missing recipient and purpose", () => {
  const incomplete = analyzePrompt({ action: "Write an email" });
  const complete = analyzePrompt({
    action: "Write a follow-up email to a customer to confirm the delivery date",
    tone: ["Professional"],
  });

  assert.equal(incomplete.category, "communication");
  assert.ok(hasFinding(incomplete, "communication-recipient-missing"));
  assert.ok(hasFinding(incomplete, "communication-purpose-missing"));

  assert.equal(complete.category, "communication");
  assert.equal(
    hasFinding(complete, "communication-recipient-missing"),
    false,
  );
  assert.equal(hasFinding(complete, "communication-purpose-missing"), false);
  assert.ok(complete.findings.length < incomplete.findings.length);
});

test("learning analysis finds missing topic and level without inventing either", () => {
  const analysis = analyzePrompt({
    action: "Explain this topic so I can learn for an exam",
  });

  assert.equal(analysis.category, "learning");
  assert.ok(hasFinding(analysis, "learning-topic-missing"));
  assert.ok(hasFinding(analysis, "learning-level-missing"));
  assert.ok(analysis.findings.every(({ message }) => !message.includes("neural")));
});

test("clear explanatory requests use the learning rule pack", () => {
  for (const action of ["Explain neural networks", "Erkläre neuronale Netze"]) {
    assert.equal(analyzePrompt({ action }).category, "learning");
  }
});

test("social analysis identifies a missing platform", () => {
  const analysis = analyzePrompt({
    action: "Create a caption for product awareness",
  });

  assert.equal(analysis.category, "social");
  assert.ok(hasFinding(analysis, "social-platform-missing"));
});

test("business analysis respects an explicit report format while finding other gaps", () => {
  const analysis = analyzePrompt({
    action: "Create a management report with KPI analysis",
  });

  assert.equal(analysis.category, "business");
  assert.ok(hasFinding(analysis, "business-audience-missing"));
  assert.ok(hasFinding(analysis, "business-purpose-missing"));
  assert.ok(hasFinding(analysis, "business-scope-missing"));
  assert.equal(hasFinding(analysis, "business-format-missing"), false);
});

test("business analysis still flags a missing output format when none is named", () => {
  const analysis = analyzePrompt({
    action: "Analyze KPI trends for management to support a decision",
  });

  assert.equal(analysis.category, "business");
  assert.ok(hasFinding(analysis, "business-format-missing"));
});

test("does not automatically flag empty optional CRAFT fields", () => {
  const analysis = analyzePrompt({
    action: "Write a short birthday message to my friend",
  });

  assert.equal(analysis.category, "general");
  assert.deepEqual(analysis.findings, []);
});

test("uses stable unique rule IDs and emits no duplicate findings", () => {
  const configuredIds = rules.map(({ id }) => id);
  assert.equal(new Set(configuredIds).size, configuredIds.length);

  const analysis = analyzePrompt({
    action: "Create social media content",
  });
  const emittedIds = findingIds(analysis);
  assert.equal(new Set(emittedIds).size, emittedIds.length);
});

test("uses the existing category detector as its category source", () => {
  const states = [
    { action: "Prepare for a job interview with a hiring manager" },
    { action: "Write an email" },
    { action: "Explain neural networks so I can study for an exam" },
    { action: "Create an Instagram caption for a new post" },
    { action: "Create a management report with KPI analysis" },
    { action: "Convert cups to grams" },
  ];

  states.forEach((state) => {
    assert.equal(analyzePrompt(state).category, detectCategory(state).category);
  });
});
