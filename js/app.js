import { getNextStep, getPreviousStep } from "./navigation.js";
import { createCraftSummary } from "./craft-summary.js";
import {
  COPY_FEEDBACK,
  createPromptCopyController,
  isPromptCopyAvailable,
} from "./copy-prompt.js";
import { createImprovementLoop } from "./improvement-loop.js";
import {
  renderCraftSummary,
  renderImprovementResult,
} from "./improvement-view.js";
import { renderDraftPreview } from "./preview.js";
import { getState, toggleSelection, updateField, updateState } from "./state.js";
import { validateAction } from "./validation.js";
import { renderStep, renderStepper } from "./wizard.js";

const appRoot = document.querySelector("[data-app]");
const ideaInput = document.querySelector("#idea-input");
const startButton = document.querySelector('[data-action="start-wizard"]');
const wizard = document.querySelector("[data-wizard]");
const stepper = document.querySelector("[data-stepper]");
const stepCard = document.querySelector("[data-step-card]");
const preview = document.querySelector("[data-draft-preview]");
const metaPrompt = document.querySelector("[data-improved-prompt]");
const suggestions = document.querySelector("[data-suggestions]");
const metaStatus = document.querySelector("[data-improved-status]");
const suggestionStatus = document.querySelector("[data-suggestions-status]");
const previewEyebrow = document.querySelector("[data-preview-eyebrow]");
const previewStatus = document.querySelector("[data-preview-status]");
const summary = document.querySelector("[data-craft-summary]");
const copyButton = document.querySelector("[data-copy-prompt]");
const copyLabel = document.querySelector("[data-copy-label]");
const copyFeedback = document.querySelector("[data-copy-feedback]");

if (
  !appRoot ||
  !ideaInput ||
  !startButton ||
  !wizard ||
  !stepper ||
  !stepCard ||
  !preview ||
  !metaPrompt ||
  !suggestions ||
  !metaStatus ||
  !suggestionStatus ||
  !previewEyebrow ||
  !previewStatus ||
  !summary ||
  !copyButton ||
  !copyLabel ||
  !copyFeedback
) {
  throw new Error("CRAFTED could not find its application shell.");
}

let actionError = "";

const renderPreview = (state = getState()) => renderDraftPreview(preview, state);
const renderSummary = (state = getState()) =>
  renderCraftSummary(summary, createCraftSummary(state));

const readVisibleMetaPrompt = () =>
  metaPrompt.querySelector(".improved-prompt__text")?.textContent ?? "";

const setCopyFeedback = (feedback) => {
  copyButton.dataset.feedback = feedback.state;
  copyLabel.textContent = feedback.label;
  copyFeedback.textContent = feedback.message;
};

const promptCopier = createPromptCopyController({
  readVisiblePrompt: readVisibleMetaPrompt,
  writeText: (text) => {
    if (!navigator.clipboard?.writeText) {
      return Promise.reject(new Error("Clipboard API unavailable"));
    }
    return navigator.clipboard.writeText(text);
  },
  onFeedback: setCopyFeedback,
});

const syncCopyAvailability = () => {
  copyButton.disabled = !isPromptCopyAvailable(readVisibleMetaPrompt());
};

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

const scrollWizardIntoView = () => {
  wizard.scrollIntoView({
    block: "start",
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth",
  });
};

const revealStep = (step) => {
  moveToStep(step);
  scrollWizardIntoView();
};

const showImprovementResult = () => {
  updateState({ improvementReady: true });
  renderWizard();
  stepCard.querySelector("[data-ready-status]")?.focus({ preventScroll: true });
};

const improvementLoop = createImprovementLoop({
  readState: getState,
  navigateToStep: revealStep,
  renderResult: (result) => {
    renderImprovementResult(
      {
        metaPrompt,
        suggestions,
        metaStatus,
        suggestionStatus,
        previewEyebrow,
        previewStatus,
        summary,
      },
      result,
    );
    promptCopier.resetFeedback();
    syncCopyAvailability();
    showImprovementResult();
  },
});

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
    improvementLoop.run();
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
  scrollWizardIntoView();
};

ideaInput.value = getState().idea;
ideaInput.addEventListener("input", () => {
  renderPreview(updateField("idea", ideaInput.value));
});
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
  renderPreview();
  renderSummary();

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
    renderPreview(nextState);
    renderSummary(nextState);
    return;
  }

  if (action === "back") {
    moveToStep(getPreviousStep(state.currentStep));
    return;
  }

  if (action === "skip") {
    if (state.currentStep === "tone") {
      improvementLoop.run();
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
    improvementLoop.run();
  }
});

suggestions.addEventListener("click", (event) => {
  const suggestionButton = event.target.closest(
    'button[data-action="open-suggestion"]',
  );
  if (!suggestionButton) return;

  improvementLoop.selectSuggestion({
    field: suggestionButton.dataset.suggestionField,
  });
});

copyButton.addEventListener("click", () => {
  void promptCopier.copy();
});

renderWizard();
renderPreview();
renderSummary();
setCopyFeedback(COPY_FEEDBACK.idle);
syncCopyAvailability();
appRoot.dataset.status = getState().status;
