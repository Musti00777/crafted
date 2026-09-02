import assert from "node:assert/strict";
import test from "node:test";

import {
  detectCategory,
  normalizeCategoryText,
} from "../js/engine/category-detector.js";

const categoryFor = (action) => detectCategory({ action }).category;

test("detects an English interview prompt", () => {
  assert.equal(
    categoryFor("Help me prepare for a job interview with a hiring manager"),
    "interview",
  );
});

test("detects a German interview prompt", () => {
  assert.equal(
    categoryFor("Hilf mir bei der Vorbereitung auf ein Vorstellungsgespräch"),
    "interview",
  );
});

test("detects communication", () => {
  assert.equal(categoryFor("Write a follow-up email to a customer"), "communication");
});

test("detects learning", () => {
  assert.equal(
    categoryFor("Explain neural networks so I can study for an exam"),
    "learning",
  );
});

test("detects social content", () => {
  assert.equal(categoryFor("Create an Instagram caption for my new post"), "social");
});

test("detects business reporting", () => {
  assert.equal(categoryFor("Create a management report with KPI analysis"), "business");
});

test("uses general for generic and empty input", () => {
  assert.equal(categoryFor("Create a plan"), "general");
  assert.equal(detectCategory({}).category, "general");
});

test("matching is case-insensitive and handles German characters", () => {
  assert.equal(categoryFor("INSTAGRAM CAPTION"), "social");
  assert.equal(categoryFor("ERKLÄRE DAS FÜR DIE PRÜFUNG"), "learning");
  assert.equal(normalizeCategoryText("  Grüße—für   DIE Prüfung! "), "grüsse für die prüfung");
});

test("uses only Idea, Context, Role, and Action", () => {
  assert.equal(
    detectCategory({
      action: "Create a plan",
      format: ["LinkedIn post", "Management report"],
      tone: ["Professional"],
      customFormat: "Instagram caption",
      customTone: "Recruiter",
    }).category,
    "general",
  );
});

test("returns general for an exact top-score tie", () => {
  const result = detectCategory({ action: "Email reply tutorial course" });

  assert.equal(result.category, "general");
  assert.deepEqual(result.matchedTerms, ["course", "email", "reply", "tutorial"]);
});

test("returns a stable structured result", () => {
  const state = {
    idea: "Prepare for an application",
    context: "The recruiter shared the position",
    role: "Career coach",
    action: "Review my CV",
  };

  const firstResult = detectCategory(state);
  const secondResult = detectCategory(state);

  assert.equal(firstResult.category, "interview");
  assert.deepEqual(firstResult, secondResult);
  assert.deepEqual(Object.keys(firstResult), [
    "category",
    "confidence",
    "matchedTerms",
  ]);
});
