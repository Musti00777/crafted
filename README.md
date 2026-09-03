# CRAFTED

CRAFTED is a browser-based prompt-building app based on the CRAFT framework:
Context, Role, Action, Format, and Tone.

## Build 9: Suggestions + Prioritization

The app includes the existing CRAFT wizard, Action validation, and live Draft
Preview. Build 8 includes a deterministic, local meta-prompt generator that turns a
valid CRAFT state into one structured prompt string. Action is always first;
Idea, Context, Role, Format, and Tone appear only when the user supplied them.

The generator reuses the existing Improvement Engine snapshot, preserves the
user's wording, and adds only deterministic structural labels. A small local
language detector selects English or German labels; ties and uncertain input
fall back to English. No user state is mutated or persisted.

Build 9 adds `generateSuggestions(state, analysis = analyzePrompt(state))` in
`js/engine/suggestion-engine.js`. The optional analysis must be a snapshot for
the same state. Only existing findings are converted to actionable English or
German copy from `js/data/suggestions.js`; diagnosis is not repeated when an
analysis is supplied. Language selection reuses Build 8's detector and fallback.

Suggestions contain `id`, `field`, `priority`, `severity`, `message`, and `ruleId`.
Priority is based on existing rule phases: structural (1), category gaps (2),
generic quality (3), and refinements (4). Missing or vague Action always takes
priority 1. Within a priority, severity sorts critical → high → medium → low;
remaining ties use the explicit order in `rules.js`, not incoming finding order.

Existing problem keys and shared suggestion IDs deduplicate equivalent Action,
audience, Format, or Tone next steps. Distinct gaps within one field are retained.
Deduplication precedes the four-item cap. Fewer findings produce fewer suggestions;
no mapped findings means `[]`, not filler. Unknown or malformed findings are
ignored. New analysis rules therefore need matching bilingual suggestion copy.
Suggestions ask for missing information; they never supply assumed facts, rewrite
input, mutate state/analysis, or update fields automatically.

The Edit → Improve loop, CRAFT Summary logic,
persistent browser storage, history, accounts, and clipboard enhancements are
intentionally not implemented yet. Generators remain engine APIs in this build;
existing UI behavior is unchanged.

## Tests

Run `node --test` from the `crafted` directory. The suite uses Node's built-in
test runner without npm packages. Run `node --check <file>` for JavaScript syntax
checks and `git diff --check` for whitespace errors.

## Run locally

Because the JavaScript entry point uses ES Modules, serve the `crafted` directory
with a small local web server instead of opening `index.html` directly.

For example, if Python is available:

```sh
cd crafted
python -m http.server 8000
```

Then open `http://localhost:8000` in a browser.

No installation, build command, environment variables, external services, or
secrets are required.

## Structure

```text
crafted/
├── index.html
├── css/
├── js/
│   ├── engine/
│   └── data/
├── assets/
├── tests/
└── README.md
```

All paths are relative, so the project can be hosted from a GitHub Pages project
subdirectory later.
