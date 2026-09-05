import assert from "node:assert/strict";
import test from "node:test";

import {
  EXAMPLE_FIELDS,
  exampleEngine,
  getContextualExamples,
} from "../js/engine/example-engine.js";
import { getContextualStepConfig } from "../js/wizard.js";

test("a job-search idea receives interview-specific examples", () => {
  const result = getContextualExamples({
    idea: "I am searching a new job.",
  });

  assert.equal(result.category, "interview");
  assert.equal(result.language, "en");
  assert.match(result.fields.context, /applying for a product manager role/i);
  assert.match(result.fields.role, /career coach and hiring manager/i);
  assert.match(result.fields.action, /interview questions/i);
  assert.doesNotMatch(JSON.stringify(result.fields), /online shop|spring launch/i);
});

test("a German job-search idea receives German interview examples", () => {
  const result = getContextualExamples({ idea: "Ich suche einen neuen Job." });

  assert.equal(result.category, "interview");
  assert.equal(result.language, "de");
  assert.match(result.fields.context, /^Beispiel:/);
  assert.match(result.fields.action, /Interviewfragen/);
});

test("examples are selected from the idea only", () => {
  const result = getContextualExamples({
    idea: "Plan a LinkedIn post",
    action: "Write an email",
    context: "Prepare for a job interview",
  });

  assert.equal(result.category, "social");
  assert.match(result.fields.role, /social media strategist/i);
});

test("unknown ideas use neutral examples rather than an unrelated scenario", () => {
  const result = getContextualExamples({ idea: "A birthday surprise" });

  assert.equal(result.category, "general");
  assert.match(result.fields.context, /relevant background/i);
  assert.doesNotMatch(JSON.stringify(result.fields), /launch|interview|email/i);
});

test("every result is complete, deterministic, and leaves state untouched", () => {
  const state = Object.freeze({ idea: "Explain neural networks" });
  const before = JSON.stringify(state);
  const first = getContextualExamples(state);

  assert.deepEqual(Object.keys(first.fields), EXAMPLE_FIELDS);
  assert.ok(Object.values(first.fields).every((value) => value.trim()));
  assert.deepEqual(first, getContextualExamples(state));
  assert.equal(JSON.stringify(state), before);
  assert.equal(exampleEngine.getContextualExamples, getContextualExamples);
});

test("wizard placeholders use the contextual examples without changing config", () => {
  const state = { idea: "I am searching a new job." };
  const context = getContextualStepConfig("context", state);
  const action = getContextualStepConfig("action", state);
  const format = getContextualStepConfig("format", state);

  assert.match(context.placeholder, /applying for a product manager role/i);
  assert.match(action.placeholder, /interview questions/i);
  assert.match(format.customPlaceholder, /mock interview/i);
  assert.equal(getContextualStepConfig("unknown", state), null);
});
