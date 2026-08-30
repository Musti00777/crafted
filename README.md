# CRAFTED

CRAFTED is a browser-based prompt-building app based on the CRAFT framework:
Context, Role, Action, Format, and Tone.

## Build 1

This build contains the project scaffold and a responsive visual shell. The CRAFT
wizard, prompt generation, improvement logic, suggestions, validation, and
detection features are intentionally not implemented yet.

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
