import { createInitialState } from "./state.js";

const appRoot = document.querySelector("[data-app]");

if (!appRoot) {
  throw new Error("CRAFTED could not find its application root.");
}

const state = createInitialState();

appRoot.dataset.status = state.status;
