import assert from "node:assert/strict";
import test from "node:test";

import {
  EMPTY_PREVIEW_MESSAGE,
  buildDraftPreview,
} from "../js/preview.js";

test("empty state contains only the calm placeholder", () => {
  assert.deepEqual(buildDraftPreview({}), {
    isEmpty: true,
    sections: [],
    text: EMPTY_PREVIEW_MESSAGE,
  });
});

test("populated fields are included in CRAFT order", () => {
  const preview = buildDraftPreview({
    idea: "Launch a newsletter",
    context: "For returning customers",
    role: "Lifecycle marketer",
    action: "Draft the first issue",
  });

  assert.deepEqual(preview.sections, [
    { label: "Idea", content: "Launch a newsletter" },
    { label: "Context", content: "For returning customers" },
    { label: "Role", content: "Lifecycle marketer" },
    { label: "Action", content: "Draft the first issue" },
  ]);
});

test("empty optional fields are omitted", () => {
  assert.deepEqual(buildDraftPreview({ action: "Create a plan" }).sections, [
    { label: "Action", content: "Create a plan" },
  ]);
});

test("Format combines selections and custom input without duplicates", () => {
  const preview = buildDraftPreview({
    format: ["Bullet points", "Detailed"],
    customFormat: "bullet points",
  });

  assert.deepEqual(preview.sections, [
    { label: "Format", content: "Bullet points, Detailed" },
  ]);
});

test("Tone combines selections and custom input", () => {
  const preview = buildDraftPreview({
    tone: ["Professional", "Friendly"],
    customTone: "Direct but warm",
  });

  assert.deepEqual(preview.sections, [
    {
      label: "Tone",
      content: "Professional, Friendly, Direct but warm",
    },
  ]);
});

test("output is deterministic for the same state", () => {
  const state = {
    idea: "  Keep my wording  ",
    action: "First line\nSecond line",
    format: ["Table"],
    tone: ["Friendly"],
  };

  assert.deepEqual(buildDraftPreview(state), buildDraftPreview(state));
  assert.equal(
    buildDraftPreview(state).text,
    "Idea\nKeep my wording\n\nAction\nFirst line\nSecond line\n\nFormat\nTable\n\nTone\nFriendly",
  );
});
