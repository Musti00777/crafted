import assert from "node:assert/strict";
import test from "node:test";

import {
  createCraftSummary,
  createCraftSummaryFromAnalysis,
} from "../js/craft-summary.js";
import { analyzePrompt } from "../js/engine/improvement-engine.js";
import { createImprovementResult } from "../js/improvement-loop.js";

const fields = (summary) => summary.map(({ field }) => field);
const used = (summary) =>
  Object.fromEntries(summary.map((item) => [item.field, item.used]));

test("CRAFT Summary always represents all five fields in CRAFT order", () => {
  const summary = createCraftSummary({});

  assert.deepEqual(fields(summary), [
    "context",
    "role",
    "action",
    "format",
    "tone",
  ]);
  assert.deepEqual(summary.map(({ label }) => label), [
    "Context",
    "Role",
    "Action",
    "Format",
    "Tone",
  ]);
});

test("empty optional fields and a missing required Action are not used", () => {
  assert.deepEqual(used(createCraftSummary({})), {
    context: false,
    role: false,
    action: false,
    format: false,
    tone: false,
  });
});

test("meaningful content marks each CRAFT field as used", () => {
  const summary = createCraftSummary({
    context: "For returning customers",
    role: "Product marketer",
    action: "Draft a launch email",
    format: ["Email"],
    tone: ["Friendly"],
  });

  assert.deepEqual(Object.values(used(summary)), [true, true, true, true, true]);
});

test("custom Format and Tone content count as used", () => {
  const summary = createCraftSummary({
    action: "Draft an update",
    customFormat: "Three short paragraphs",
    customTone: "Warm but direct",
  });

  assert.equal(used(summary).format, true);
  assert.equal(used(summary).tone, true);
});

test("Action follows meaningful required-field content", () => {
  assert.equal(used(createCraftSummary({ action: "  \n " })).action, false);
  assert.equal(used(createCraftSummary({ action: "Draft the update" })).action, true);
});

test("CRAFT Summary updates after state changes", () => {
  const state = { action: "Draft the update", context: "" };
  const before = createCraftSummary(state);
  state.context = "For the project team";
  const after = createCraftSummary(state);

  assert.equal(used(before).context, false);
  assert.equal(used(after).context, true);
});

test("CRAFT Summary reuses the provided status from analysis", () => {
  const analysis = analyzePrompt({
    context: "For the project team",
    action: "Draft the update",
  });

  assert.deepEqual(
    createCraftSummaryFromAnalysis(analysis).map(({ field, used: isUsed }) => ({
      field,
      used: isUsed,
    })),
    [
      { field: "context", used: true },
      { field: "role", used: false },
      { field: "action", used: true },
      { field: "format", used: false },
      { field: "tone", used: false },
    ],
  );
});

test("Improvement results carry a Summary from their same analysis", () => {
  const result = createImprovementResult({
    action: "Write an email",
    format: ["Email"],
  });

  for (const item of result.summary) {
    assert.equal(item.used, result.analysis.craft[item.field].provided);
  }
});

test("Summary generation does not mutate or evaluate user state", () => {
  const state = Object.freeze({
    context: "Existing context",
    action: "Draft the update",
    format: Object.freeze(["Table"]),
    tone: Object.freeze([]),
  });
  const before = JSON.stringify(state);
  const summary = createCraftSummary(state);

  assert.equal(JSON.stringify(state), before);
  assert.deepEqual(Object.keys(summary[0]), ["field", "label", "used"]);
  assert.equal(
    /(incomplete|weak|should|add|missing|improve)/i.test(JSON.stringify(summary)),
    false,
  );
});
