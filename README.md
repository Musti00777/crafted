# CRAFTED

CRAFTED is a browser-based prompt-building app based on the CRAFT framework:
Context, Role, Action, Format, and Tone.

## Build 7: Improvement Engine

The app includes the existing CRAFT wizard, Action validation, and live Draft
Preview. Build 7 adds a deterministic, local analysis engine that evaluates the
current CRAFT fields and returns structured findings with stable rule IDs,
severities, fields, types, and messages. Category-specific rule packs cover
interview, communication, learning, social, business, and general prompts.

The engine reuses local category detection and applies rules in a documented
order: structural issues, category-specific gaps, generic quality issues, then
optional refinements. It derives its result without mutating or persisting state.
Rules only identify useful missing information; they do not invent context or
claim probabilistic confidence.

Improved prompt generation, language detection, suggestions, CRAFT Summary
logic, persistent browser storage, history, accounts, and clipboard behavior are
intentionally not implemented yet. Build 7 does not expose analysis findings in
the UI; they prepare data for later builds.

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
