# CRAFTED

CRAFTED is a browser-based prompt-building app based on the CRAFT framework:
Context, Role, Action, Format, and Tone.

## Build 3: CRAFT Wizard + State + Navigation

This feature branch turns the approved UI shell into a functional five-step CRAFT
wizard. It includes centralized in-memory state, Start CRAFT, forward/back/skip
navigation, dynamic stepper states, persistent text and chip selections, and
Ctrl/Cmd + Enter keyboard shortcuts.

Validation, prompt generation, improvement logic, suggestions, detection, CRAFT
Summary logic, persistent browser storage, history, accounts, and clipboard
behavior are intentionally not implemented yet.

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
