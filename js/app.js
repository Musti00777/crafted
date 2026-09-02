import { getNextStep, getPreviousStep } from "./navigation.js";
import { getState, toggleSelection, updateField, updateState } from "./state.js";
import { validateAction } from "./validation.js";
import { renderStep, renderStepper } from "./wizard.js";

const appRoot = document.querySelector("[data-app]");
const ideaInput = document.querySelector("#idea-input");
const startButton = document.querySelector('[data-action="start-wizard"]');
const wizard = document.querySelector("[data-wizard]");
const stepper = document.querySelector("[data-stepper]");
const stepCard = document.querySelector("[data-step-card]");

if (!appRoot || !ideaInput || !startButton || !wizard || !stepper || !stepCard) {
  throw new Error("CRAFTED could not find its application shell.");
}

let actionError = "";

const focusStepInput = () => {
  const focusTarget = stepCard.querySelector("[data-primary-input]");
  focusTarget?.focus({ preventScroll: true });
};

const renderWizard = ({ focusInput = false } = {}) => {
  const state = getState();
  wizard.hidden = !state.wizardStarted;

  if (!state.wizardStarted) return;

  renderStepper(stepper, state.currentStep);
  renderStep(stepCard, state, { action: actionError });

  if (focusInput) {
    requestAnimationFrame(focusStepInput);
  }
};

const moveToStep = (step) => {
  if (step !== "action") actionError = "";
  updateState({ currentStep: step, improvementReady: false });
  renderWizard({ focusInput: true });
};

const showReadyForImprovement = () => {
  updateState({ improvementReady: true });
  renderWizard();
  stepCard.querySelector("[data-ready-status]")?.focus({ preventScroll: true });
};

const performPrimaryAction = () => {
  const state = getState();

  if (state.currentStep === "action") {
    const result = validateAction(state.action);
    actionError = result.message;

    if (!result.isValid) {
      renderWizard({ focusInput: true });
      return;
    }
  }

  if (state.currentStep === "tone") {
    showReadyForImprovement();
    return;
  }

  moveToStep(getNextStep(state.currentStep));
};

const startWizard = () => {
  actionError = "";
  updateState({
    idea: ideaInput.value,
    wizardStarted: true,
    currentStep: "context",
    improvementReady: false,
  });

  renderWizard({ focusInput: true });
  wizard.scrollIntoView({
    block: "start",
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth",
  });
};

ideaInput.value = getState().idea;
ideaInput.addEventListener("input", () => updateField("idea", ideaInput.value));
ideaInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    startWizard();
  }
});

startButton.addEventListener("click", startWizard);

wizard.addEventListener("input", (event) => {
  const field = event.target.dataset.stateField;
  if (!field) return;

  updateField(field, event.target.value);

  if (
    field === "action" &&
    actionError &&
    validateAction(event.target.value).isValid
  ) {
    actionError = "";
    event.target.removeAttribute("aria-invalid");
    event.target.removeAttribute("aria-describedby");
    event.target.closest(".form-field")?.classList.remove("form-field--error");
    event.target
      .closest(".form-field")
      ?.querySelector("[data-validation-message]")
      ?.remove();
  }
});

wizard.addEventListener("keydown", (event) => {
  const isStateField = event.target.matches("[data-state-field]");
  const isPrimaryShortcut = event.key === "Enter" && (event.ctrlKey || event.metaKey);

  if (isStateField && isPrimaryShortcut) {
    event.preventDefault();
    performPrimaryAction();
  }
});

wizard.addEventListener("click", (event) => {
  const actionButton = event.target.closest("button[data-action]");
  if (!actionButton) return;

  const action = actionButton.dataset.action;
  const state = getState();

  if (action === "toggle-option") {
    const nextState = toggleSelection(actionButton.dataset.field, actionButton.dataset.value);
    const isSelected = nextState[actionButton.dataset.field].includes(actionButton.dataset.value);
    actionButton.classList.toggle("choice-chip--selected", isSelected);
    actionButton.setAttribute("aria-pressed", String(isSelected));
    return;
  }

  if (action === "back") {
    moveToStep(getPreviousStep(state.currentStep));
    return;
  }

  if (action === "skip") {
    if (state.currentStep === "tone") {
      showReadyForImprovement();
    } else {
      moveToStep(getNextStep(state.currentStep));
    }
    return;
  }

  if (action === "continue") {
    performPrimaryAction();
    return;
  }

  if (action === "improve") {
    showReadyForImprovement();
  }
});

renderWizard();
appRoot.dataset.status = getState().status;
