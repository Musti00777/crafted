# CRAFTED

CRAFTED is a browser-based prompt-building app based on the CRAFT framework:
Context, Role, Action, Format, and Tone.

## Build 8: Meta-Prompt Generator

The app includes the existing CRAFT wizard, Action validation, and live Draft
Preview. Build 8 adds a deterministic, local meta-prompt generator that turns a
valid CRAFT state into one structured prompt string. Action is always first;
Idea, Context, Role, Format, and Tone appear only when the user supplied them.

The generator reuses the existing Improvement Engine snapshot, preserves the
user's wording, and adds only deterministic structural labels. A small local
language detector selects English or German labels; ties and uncertain input
fall back to English. No user state is mutated or persisted.

Suggestions, prioritization, the Edit → Improve loop, CRAFT Summary logic,
persistent browser storage, history, accounts, and clipboard enhancements are
intentionally not implemented yet. The generator remains an engine API in this
build; existing UI behavior is unchanged.

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
