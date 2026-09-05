# CRAFTED

CRAFTED is a browser-based prompt-building app based on the CRAFT framework:
Context, Role, Action, Format, and Tone.

## Build 15: Meta-Prompt + Contextual Examples

Build 15 turns the Improvement result into an explicit, executable Meta-Prompt.
Each supplied CRAFT field is introduced as an instruction, Action remains first,
and a final guardrail tells the receiving AI to ask a focused clarification
question instead of silently assuming an essential missing requirement. The UI
labels the result as `Improved Meta-Prompt` so Draft Preview and final output are
clearly distinguishable.

Wizard examples now come from a deterministic local example engine. It classifies
the starting Idea only, selects English or German copy, and supplies relevant
Context, Role, Action, custom Format, and custom Tone examples for interview/job
search, communication, learning, social, business, or a neutral fallback. The
examples remain placeholders and never become user data automatically.

## Build 14: Improvement Quality Pass

Build 14 corrects the UAT false negative for mixed-language job-interview
prompts. Clear interview evidence such as `career coach` and plural
`job interviews` now selects the existing interview rule pack. A broad request
for interview preparation no longer counts as a concrete desired outcome;
CRAFTED asks the user to choose an outcome such as practice questions, model
answers, feedback, a plan, or a checklist instead.

The generated Meta-Prompt keeps Action first, adds a deterministic execution
instruction, and uses action-oriented section labels. User content remains
unchanged, no missing context is inferred, and all behavior stays local and
dependency-free.

## Build 12: Tests + Responsive Polish

The app includes the existing CRAFT wizard, Action validation, and live Draft
Preview. Build 8 includes a deterministic, local meta-prompt generator that turns a
valid CRAFT state into one structured prompt string. Action is always first;
Idea, Context, Role, Format, and Tone appear only when the user supplied them.

The generator reuses the existing Improvement Engine snapshot, preserves the
user's wording, and adds only deterministic instructions and structural labels.
A small local language detector selects English or German copy; ties and
uncertain input fall back to English. No user state is mutated or persisted.

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

Build 10 connects these modules through `createImprovementLoop()`. Every Improve
Prompt action reads the current CRAFT state, creates a fresh analysis, regenerates
the Meta-Prompt, derives Suggestions from that same analysis, and replaces the
previous result. The controller keeps only the latest result and has no API for
accepting an old analysis snapshot.

The preview panel now displays the generated Meta-Prompt and up to four current
Suggestions. Each Suggestion is a keyboard-accessible button linked to one CRAFT
field. Selecting it uses the existing wizard navigation and focuses that field;
it never applies copy or changes user input. The user edits manually and can run
Improve Prompt again as many times as needed in the current browser session.

Build 11 completes the current result panel with a neutral CRAFT Summary and plain
text copying. The Summary always lists Context, Role, Action, Format, and Tone as
`Used` or `Not used`. Status comes directly from the existing
`analysis.craft[field].provided` values, so the Summary adds no scoring, advice,
or inferred information. It refreshes as the user edits the current CRAFT state.

Copy Meta-Prompt stays disabled until a non-empty improved prompt is visible. Copy reads
that rendered prompt at click time and sends exactly that text to the browser's
Clipboard API. As a result, edits made before another Improvement Run do not
silently change the copied text, while a later run automatically becomes the new
copy source. Success and failure use temporary button text plus an accessible live
message; failures are contained without false success feedback or dependencies.

CRAFT Summary and Copy Meta-Prompt are implemented. Persistent browser storage,
history, accounts, reset/new-prompt behavior, export, sharing, automatic field
completion, and automatic rewriting remain intentionally unimplemented.

Build 12 is the pre-deployment quality gate. The complete CRAFT workflow was
regression-tested with keyboard navigation, repeated Edit → Improve cycles,
clipboard success and failure handling, and long English and German content.
The responsive shell was verified at 1440px, 1024px, 768px, 390px, and 360px
without horizontal overflow or clipped controls. The inactive mobile menu control
was removed, and the current Create navigation item now uses link semantics.

No product intelligence, persistence, deployment configuration, API, backend,
database, framework, external service, or runtime dependency was added.

## Tests

Run `node --test` from the `crafted` directory. The suite uses Node's built-in
test runner without npm packages. Build 15 has 114 tests. Run `node --check
<file>` for JavaScript syntax checks and `git diff --check` for whitespace
errors.

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
