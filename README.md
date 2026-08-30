# CRAFTED

CRAFTED is a browser-based prompt-building app based on the CRAFT framework:
Context, Role, Action, Format, and Tone.

## Build 2: UI Shell & Responsive Layout

This feature branch expands the Build 1 scaffold into a static product workspace
with a sidebar, prompt builder, CRAFT stepper, Context card, and draft preview.
It includes responsive desktop, tablet, and mobile layouts plus prepared visual
states for controls, fields, and progress steps.

The CRAFT wizard, navigation behavior, field persistence, prompt generation,
improvement logic, suggestions, validation, detection, history, and clipboard
features are intentionally not implemented yet.

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
