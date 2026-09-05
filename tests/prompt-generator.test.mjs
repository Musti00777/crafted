import assert from "node:assert/strict";
import test from "node:test";

import { generateMetaPrompt } from "../js/engine/prompt-generator.js";

const EN_GUARDRAIL =
  "Treat the provided details as authoritative. Do not silently assume missing requirements; ask a focused clarification question when one is essential.";
const DE_GUARDRAIL =
  "Behandle die bereitgestellten Angaben als verbindlich. Ergänze fehlende Anforderungen nicht stillschweigend; stelle eine gezielte Rückfrage, wenn eine Angabe wesentlich ist.";

test("generates a non-empty Action-first prompt from Action only", () => {
  assert.equal(
    generateMetaPrompt({ action: "Write a launch plan" }),
    [
      "Complete the following task:",
      "Write a launch plan",
      "",
      EN_GUARDRAIL,
    ].join("\n"),
  );
});

test("places Action before supplied Context", () => {
  assert.equal(
    generateMetaPrompt({
      context: "The launch is scheduled for Monday.",
      action: "Draft the announcement",
    }),
    [
      "Complete the following task:",
      "Draft the announcement",
      "",
      "Take this context into account:",
      "The launch is scheduled for Monday.",
      "",
      EN_GUARDRAIL,
    ].join("\n"),
  );
});

test("integrates every populated CRAFT field", () => {
  assert.equal(
    generateMetaPrompt({
      context: "The audience consists of returning customers.",
      role: "An experienced product marketer",
      action: "Draft a product launch announcement",
      format: ["Bullet points", "Short paragraphs"],
      tone: ["Professional", "Friendly"],
    }),
    [
      "Complete the following task:",
      "Draft a product launch announcement",
      "",
      "Take this context into account:",
      "The audience consists of returning customers.",
      "",
      "Adopt this role:",
      "An experienced product marketer",
      "",
      "Return the result in this format:",
      "Bullet points, Short paragraphs",
      "",
      "Use this tone:",
      "Professional, Friendly",
      "",
      EN_GUARDRAIL,
    ].join("\n"),
  );
});

test("preserves the starting idea and custom selections when supplied", () => {
  const output = generateMetaPrompt({
    idea: "A weekly project update",
    action: "Draft the update",
    format: ["Bullet points"],
    customFormat: "One closing paragraph",
    customTone: "Calm and direct",
  });

  assert.ok(output.includes("Use this as the starting point:\nA weekly project update"));
  assert.ok(
    output.includes(
      "Return the result in this format:\nBullet points, One closing paragraph",
    ),
  );
  assert.ok(output.includes("Use this tone:\nCalm and direct"));
  assert.ok(output.endsWith(EN_GUARDRAIL));
});

test("omits missing optional fields without empty labels or filler", () => {
  const output = generateMetaPrompt({ action: "Summarize the supplied notes" });

  assert.equal(
    output,
    `Complete the following task:\nSummarize the supplied notes\n\n${EN_GUARDRAIL}`,
  );
  for (const label of [
    "Use this as the starting point:",
    "Take this context into account:",
    "Adopt this role:",
    "Return the result in this format:",
    "Use this tone:",
  ]) {
    assert.equal(output.includes(label), false);
  }
});

test("uses German structure for German input", () => {
  assert.equal(
    generateMetaPrompt({
      context: "Für eine Schulklasse ohne Vorkenntnisse",
      action: "Erkläre neuronale Netze",
      format: ["Schritt für Schritt"],
      tone: ["Freundlich"],
    }),
    [
      "Führe die folgende Aufgabe aus:",
      "Erkläre neuronale Netze",
      "",
      "Berücksichtige diesen Kontext:",
      "Für eine Schulklasse ohne Vorkenntnisse",
      "",
      "Liefere das Ergebnis in diesem Format:",
      "Schritt für Schritt",
      "",
      "Verwende diesen Ton:",
      "Freundlich",
      "",
      DE_GUARDRAIL,
    ].join("\n"),
  );
});

test("uses English structure for English input", () => {
  const output = generateMetaPrompt({
    action: "Explain neural networks",
    tone: ["Friendly"],
  });

  assert.equal(
    output,
    `Complete the following task:\nExplain neural networks\n\nUse this tone:\nFriendly\n\n${EN_GUARDRAIL}`,
  );
});

test("falls back to English when language evidence is uncertain", () => {
  assert.equal(
    generateMetaPrompt({ action: "Plan Q3" }),
    `Complete the following task:\nPlan Q3\n\n${EN_GUARDRAIL}`,
  );
});

test("does not introduce unsupported facts", () => {
  const action = "Summarize the notes";
  const output = generateMetaPrompt({ action });

  assert.equal(
    output,
    `Complete the following task:\n${action}\n\n${EN_GUARDRAIL}`,
  );
  for (const inventedValue of [
    "company",
    "audience",
    "deadline",
    "Acme",
    "Monday",
  ]) {
    assert.equal(output.includes(inventedValue), false);
  }
});

test("the UAT input becomes an executable Meta-Prompt without invented context", () => {
  const state = {
    idea: "I am searching a new job.",
    context:
      "I am working at a bank as business manager. I have compliance experience.",
    role: "An experienced HR person and head hunter.",
    action: "Train me for my interviews and coach me with helpful information.",
    format: ["Step-by-step"],
    tone: ["Professional"],
  };
  const output = generateMetaPrompt(state);

  assert.match(output, /^Complete the following task:/);
  assert.match(output, /Adopt this role:/);
  assert.match(output, /Take this context into account:/);
  assert.match(output, /Return the result in this format:/);
  assert.match(output, /ask a focused clarification question/);
  for (const value of [
    state.idea,
    state.context,
    state.role,
    state.action,
    ...state.format,
    ...state.tone,
  ]) {
    assert.equal(output.split(value).length - 1, 1);
  }
  assert.doesNotMatch(output, /Acme|Senior Product Designer|Monday/);
});

test("returns an empty string when the required Action is missing", () => {
  assert.equal(
    generateMetaPrompt({ context: "Context without a requested task" }),
    "",
  );
});

test("is deterministic and does not mutate the input state", () => {
  const state = Object.freeze({
    context: "Use only the supplied figures",
    action: "Create a concise report",
    format: Object.freeze(["Table"]),
    tone: Object.freeze(["Professional"]),
  });
  const before = JSON.stringify(state);

  assert.equal(generateMetaPrompt(state), generateMetaPrompt(state));
  assert.equal(JSON.stringify(state), before);
});
