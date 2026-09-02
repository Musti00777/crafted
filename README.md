# CRAFTED

CRAFTED is a browser-based prompt-building app based on the CRAFT framework:
Context, Role, Action, Format, and Tone.

## Build 6: Category Detection

The app includes the existing CRAFT wizard, Action validation, and live Draft
Preview. Build 6 adds deterministic, local category detection for interview,
communication, learning, social, business, and general prompts. Detection uses
English and German phrases and keywords from Idea, Context, Role, and Action.

Strong phrases receive more weight than individual keywords. Weak evidence and
top-score ties return the conservative `general` fallback. Format and Tone do not
participate in classification, and the detected category is not displayed or
persisted yet.

Prompt improvement, language detection, suggestions, CRAFT Summary logic,
persistent browser storage, history, accounts, and clipboard behavior are
intentionally not implemented yet.

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
