import assert from "node:assert/strict";
import test from "node:test";

import { generateMetaPrompt } from "../js/engine/prompt-generator.js";

test("generates a non-empty Action-first prompt from Action only", () => {
  assert.equal(
    generateMetaPrompt({ action: "Write a launch plan" }),
    [
      "Task",
      "Complete the following task using the supplied requirements:",
      "Write a launch plan",
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
      "Task",
      "Complete the following task using the supplied requirements:",
      "Draft the announcement",
      "",
      "Relevant context",
      "The launch is scheduled for Monday.",
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
      "Task",
      "Complete the following task using the supplied requirements:",
      "Draft a product launch announcement",
      "",
      "Relevant context",
      "The audience consists of returning customers.",
      "",
      "Role to adopt",
      "An experienced product marketer",
      "",
      "Required output format",
      "Bullet points, Short paragraphs",
      "",
      "Required tone",
      "Professional, Friendly",
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

  assert.ok(output.includes("Starting point\nA weekly project update"));
  assert.ok(
    output.includes(
      "Required output format\nBullet points, One closing paragraph",
    ),
  );
  assert.ok(output.includes("Required tone\nCalm and direct"));
});

test("omits missing optional fields without empty labels or filler", () => {
  const output = generateMetaPrompt({ action: "Summarize the supplied notes" });

  assert.equal(
    output,
    "Task\nComplete the following task using the supplied requirements:\nSummarize the supplied notes",
  );
  for (const label of [
    "Starting point",
    "Relevant context",
    "Role to adopt",
    "Required output format",
    "Required tone",
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
      "Aufgabe",
      "Führe die folgende Aufgabe anhand der bereitgestellten Anforderungen aus:",
      "Erkläre neuronale Netze",
      "",
      "Relevanter Kontext",
      "Für eine Schulklasse ohne Vorkenntnisse",
      "",
      "Gewünschtes Ausgabeformat",
      "Schritt für Schritt",
      "",
      "Gewünschter Ton",
      "Freundlich",
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
    "Task\nComplete the following task using the supplied requirements:\nExplain neural networks\n\nRequired tone\nFriendly",
  );
});

test("falls back to English when language evidence is uncertain", () => {
  assert.equal(
    generateMetaPrompt({ action: "Plan Q3" }),
    "Task\nComplete the following task using the supplied requirements:\nPlan Q3",
  );
});

test("does not introduce unsupported facts", () => {
  const action = "Summarize the notes";
  const output = generateMetaPrompt({ action });

  assert.equal(
    output,
    `Task\nComplete the following task using the supplied requirements:\n${action}`,
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
