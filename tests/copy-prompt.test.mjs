import assert from "node:assert/strict";
import test from "node:test";

import {
  COPY_FEEDBACK,
  createPromptCopyController,
  isPromptCopyAvailable,
} from "../js/copy-prompt.js";

test("Copy is unavailable before a valid visible Meta-Prompt exists", () => {
  for (const value of [undefined, null, "", "   \n "]) {
    assert.equal(isPromptCopyAvailable(value), false);
  }
  assert.equal(isPromptCopyAvailable("Task\nDraft the update"), true);
  assert.equal(COPY_FEEDBACK.idle.label, "Copy Meta-Prompt");
  assert.match(COPY_FEEDBACK.success.message, /Meta-Prompt/);
  assert.match(COPY_FEEDBACK.error.message, /Meta-Prompt/);
});

test("Copy writes exactly the currently visible Meta-Prompt", async () => {
  const visible = "Task\nDraft the update\n\nTone\nFriendly";
  const writes = [];
  const copier = createPromptCopyController({
    readVisiblePrompt: () => visible,
    writeText: async (value) => writes.push(value),
  });

  const result = await copier.copy();

  assert.deepEqual(writes, [visible]);
  assert.deepEqual(result, { ok: true, text: visible });
});

test("a later Improvement Run makes Copy use the newest visible prompt", async () => {
  let visible = "Task\nFirst version";
  const writes = [];
  const copier = createPromptCopyController({
    readVisiblePrompt: () => visible,
    writeText: async (value) => writes.push(value),
  });

  await copier.copy();
  visible = "Task\nSecond version\n\nContext\nUpdated context";
  await copier.copy();

  assert.deepEqual(writes, ["Task\nFirst version", visible]);
});

test("editing state without rerunning still copies the visible prior result", async () => {
  const state = { action: "First version" };
  const visible = "Task\nFirst version";
  let copied = "";
  const copier = createPromptCopyController({
    readVisiblePrompt: () => visible,
    writeText: async (value) => {
      copied = value;
    },
  });

  state.action = "Edited but not improved again";
  await copier.copy();

  assert.equal(copied, visible);
  assert.equal(state.action, "Edited but not improved again");
});

test("successful Copy feedback appears and resets", async () => {
  const feedback = [];
  const scheduled = [];
  const copier = createPromptCopyController({
    readVisiblePrompt: () => "Task\nDraft the update",
    writeText: async () => {},
    onFeedback: (value) => feedback.push(value),
    scheduleReset: (callback, delay) => scheduled.push({ callback, delay }),
  });

  await copier.copy();
  assert.strictEqual(feedback.at(-1), COPY_FEEDBACK.success);
  assert.equal(scheduled[0].delay, 1600);

  scheduled[0].callback();
  assert.strictEqual(feedback.at(-1), COPY_FEEDBACK.idle);
});

test("manual feedback reset prevents an older timer from changing it again", async () => {
  const feedback = [];
  const scheduled = [];
  const copier = createPromptCopyController({
    readVisiblePrompt: () => "Task\nDraft the update",
    writeText: async () => {},
    onFeedback: (value) => feedback.push(value),
    scheduleReset: (callback) => scheduled.push(callback),
  });

  await copier.copy();
  copier.resetFeedback();
  const countAfterReset = feedback.length;
  scheduled[0]();

  assert.equal(feedback.length, countAfterReset);
  assert.strictEqual(feedback.at(-1), COPY_FEEDBACK.idle);
});

test("clipboard failure reports failure without throwing or false success", async () => {
  const feedback = [];
  const copier = createPromptCopyController({
    readVisiblePrompt: () => "Task\nDraft the update",
    writeText: async () => {
      throw new Error("Permission denied");
    },
    onFeedback: (value) => feedback.push(value),
    scheduleReset: () => {},
  });

  const result = await copier.copy();

  assert.deepEqual(result, { ok: false, reason: "clipboard" });
  assert.strictEqual(feedback.at(-1), COPY_FEEDBACK.error);
  assert.equal(feedback.includes(COPY_FEEDBACK.success), false);
});

test("empty visible content is never sent to the clipboard", async () => {
  let writes = 0;
  const feedback = [];
  const copier = createPromptCopyController({
    readVisiblePrompt: () => "",
    writeText: async () => {
      writes += 1;
    },
    onFeedback: (value) => feedback.push(value),
  });

  assert.deepEqual(await copier.copy(), { ok: false, reason: "empty" });
  assert.equal(writes, 0);
  assert.deepEqual(feedback, []);
});

test("Copy does not mutate state or the visible prompt", async () => {
  const state = Object.freeze({ action: "Draft the update" });
  const visible = "Task\nDraft the update";
  const before = JSON.stringify(state);
  const copier = createPromptCopyController({
    readVisiblePrompt: () => visible,
    writeText: async () => {},
  });

  await copier.copy();

  assert.equal(JSON.stringify(state), before);
  assert.equal(visible, "Task\nDraft the update");
});

test("Copy requires explicit visible-read and clipboard-write functions", () => {
  assert.throws(
    () => createPromptCopyController({}),
    /requires read and write functions/,
  );
});
