import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("mobile header does not expose an inactive menu control", () => {
  const mobileHeader = html.match(
    /<header class="mobile-header">([\s\S]*?)<\/header>/,
  )?.[1];

  assert.ok(mobileHeader, "mobile header should exist");
  assert.doesNotMatch(mobileHeader, /<button\b/);
  assert.doesNotMatch(mobileHeader, /Open navigation/);
});

test("current Create navigation uses link semantics", () => {
  assert.match(
    html,
    /<a class="nav-item nav-item--active" href="\.\/" aria-current="page">/,
  );
  assert.doesNotMatch(html, /<button class="nav-item nav-item--active"/);
});
