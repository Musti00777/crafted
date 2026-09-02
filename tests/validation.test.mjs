import assert from "node:assert/strict";
import test from "node:test";

import { ACTION_ERROR_MESSAGE, validateAction } from "../js/validation.js";

test("Action rejects empty and whitespace-only values", () => {
  for (const value of ["", "   ", "\n\t "]) {
    assert.deepEqual(validateAction(value), {
      isValid: false,
      message: ACTION_ERROR_MESSAGE,
    });
  }
});

test("Action accepts any value containing non-whitespace content", () => {
  for (const value of ["a", " Create a plan ", "\nDraft an email\n"]) {
    assert.deepEqual(validateAction(value), {
      isValid: true,
      message: "",
    });
  }
});
