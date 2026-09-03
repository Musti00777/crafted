import assert from "node:assert/strict";
import test from "node:test";

import {
  createImprovementLoop,
  createImprovementResult,
  getSuggestionTargetStep,
} from "../js/improvement-loop.js";

const ruleIds = (result) =>
  result.suggestions.map(({ ruleId }) => ruleId);

const communicationState = () => ({
  idea: "",
  context: "",
  role: "",
  action: "Write an email",
  format: [],
  customFormat: "",
  tone: [],
  customTone: "",
  currentStep: "tone",
  wizardStarted: true,
});

test("an Improvement Run analyzes and generates from the current state", () => {
  const state = communicationState();
  const result = createImprovementResult(state);

  assert.equal(result.analysis.category, "communication");
  assert.equal(result.analysis.craft.action.value, state.action);
  assert.ok(result.metaPrompt.includes(state.action));
  assert.deepEqual(ruleIds(result), [
    "communication-recipient-missing",
    "communication-purpose-missing",
  ]);
});

test("every generated Suggestion maps to its existing CRAFT step", () => {
  const result = createImprovementResult(communicationState());

  for (const suggestion of result.suggestions) {
    assert.equal(getSuggestionTargetStep(suggestion), suggestion.field);
  }
});

test("only Context, Role, Action, Format, and Tone are navigation targets", () => {
  for (const field of ["context", "role", "action", "format", "tone"]) {
    assert.equal(getSuggestionTargetStep({ field }), field);
  }

  for (const field of ["idea", "", "unknown", undefined]) {
    assert.equal(getSuggestionTargetStep({ field }), null);
  }
  assert.equal(getSuggestionTargetStep(null), null);
});

test("selecting a Suggestion navigates without changing field content", () => {
  const state = communicationState();
  state.context = "Keep this existing context.";
  const before = structuredClone(state);
  const visited = [];
  const loop = createImprovementLoop({
    readState: () => state,
    navigateToStep: (step) => visited.push(step),
  });

  assert.equal(loop.selectSuggestion({ field: "context" }), true);
  assert.deepEqual(visited, ["context"]);
  assert.deepEqual(state, before);
  assert.equal(state.context, "Keep this existing context.");
});

test("an invalid Suggestion target does not navigate or mutate state", () => {
  const state = communicationState();
  const before = structuredClone(state);
  const visited = [];
  const loop = createImprovementLoop({
    readState: () => state,
    navigateToStep: (step) => visited.push(step),
  });

  assert.equal(loop.selectSuggestion({ field: "idea" }), false);
  assert.deepEqual(visited, []);
  assert.deepEqual(state, before);
});

test("the loop reads updated field state on the second Improvement Run", () => {
  const state = communicationState();
  const loop = createImprovementLoop({ readState: () => state });
  const first = loop.run();

  state.action = "Write a follow-up email asking my manager to approve the budget";
  const second = loop.run();

  assert.equal(second.analysis.craft.action.value, state.action);
  assert.ok(second.metaPrompt.includes(state.action));
  assert.notEqual(second.metaPrompt, first.metaPrompt);
});

test("a new Improvement Run replaces the latest result instead of appending", () => {
  const state = communicationState();
  const rendered = [];
  const loop = createImprovementLoop({
    readState: () => state,
    renderResult: (result) => rendered.push(result),
  });
  const first = loop.run();

  state.context = "The recipient is my manager.";
  const second = loop.run();

  assert.notStrictEqual(first, second);
  assert.strictEqual(loop.getLatestResult(), second);
  assert.strictEqual(rendered.at(-1), second);
  assert.equal(loop.getLatestResult().suggestions.length, second.suggestions.length);
});

test("a resolved recipient Suggestion disappears after a manual edit", () => {
  const state = communicationState();
  const loop = createImprovementLoop({ readState: () => state });
  const first = loop.run();
  assert.ok(ruleIds(first).includes("communication-recipient-missing"));

  state.context = "The recipient is my manager.";
  const second = loop.run();
  assert.equal(
    ruleIds(second).includes("communication-recipient-missing"),
    false,
  );
});

test("an unresolved purpose Suggestion persists across runs", () => {
  const state = communicationState();
  const loop = createImprovementLoop({ readState: () => state });
  assert.ok(ruleIds(loop.run()).includes("communication-purpose-missing"));

  state.context = "The recipient is my manager.";
  assert.ok(ruleIds(loop.run()).includes("communication-purpose-missing"));
});

test("multiple Edit → Improve cycles use each successive state", () => {
  const state = communicationState();
  const loop = createImprovementLoop({ readState: () => state });

  const first = loop.run();
  state.context = "The recipient is my manager.";
  const second = loop.run();
  state.action = "Write an email to inform my manager about the launch date";
  state.tone = ["Professional"];
  const third = loop.run();

  assert.ok(ruleIds(first).includes("communication-recipient-missing"));
  assert.equal(
    ruleIds(second).includes("communication-recipient-missing"),
    false,
  );
  assert.deepEqual(third.suggestions, []);
  assert.ok(third.metaPrompt.includes("Professional"));
  assert.strictEqual(loop.getLatestResult(), third);
});

test("Suggestions targeting different fields navigate through one callback", () => {
  const visited = [];
  const loop = createImprovementLoop({
    readState: communicationState,
    navigateToStep: (step) => visited.push(step),
  });

  loop.selectSuggestion({ field: "context" });
  loop.selectSuggestion({ field: "action" });
  loop.selectSuggestion({ field: "tone" });

  assert.deepEqual(visited, ["context", "action", "tone"]);
});

test("running and navigating preserve all user-entered CRAFT data", () => {
  const state = {
    idea: "Launch update",
    context: "For returning customers",
    role: "Product marketer",
    action: "Write an email to inform customers about the launch date",
    format: ["Email"],
    customFormat: "With a subject line",
    tone: ["Friendly"],
    customTone: "Warm but direct",
  };
  const before = structuredClone(state);
  const loop = createImprovementLoop({ readState: () => state });

  loop.run();
  loop.selectSuggestion({ field: "context" });
  loop.run();

  assert.deepEqual(state, before);
});

test("each run creates fresh analysis rather than reusing a stale snapshot", () => {
  const state = communicationState();
  const loop = createImprovementLoop({ readState: () => state });
  const first = loop.run();

  state.context = "The recipient is my manager.";
  const second = loop.run();

  assert.notStrictEqual(first.analysis, second.analysis);
  assert.equal(first.analysis.craft.context.value, "");
  assert.equal(second.analysis.craft.context.value, state.context);
  assert.ok(
    second.suggestions.every((suggestion) =>
      second.analysis.findings.some(
        (finding) => finding.ruleId === suggestion.ruleId,
      ),
    ),
  );
});

test("the workflow has no API for supplying an old analysis snapshot", () => {
  const state = communicationState();
  const stale = createImprovementResult(state).analysis;
  state.context = "The recipient is my manager.";

  const fresh = createImprovementResult(state, stale);

  assert.notStrictEqual(fresh.analysis, stale);
  assert.equal(fresh.analysis.craft.context.value, state.context);
  assert.equal(
    ruleIds(fresh).includes("communication-recipient-missing"),
    false,
  );
});

test("the loop requires a current-state reader", () => {
  assert.throws(
    () => createImprovementLoop({}),
    /requires a state reader/,
  );
});
