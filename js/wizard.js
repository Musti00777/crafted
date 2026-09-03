import { STEP_CONFIG, STEP_ORDER, getStepStatus } from "./navigation.js";

const arrowIcon = `
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m9 18 6-6-6-6" />
  </svg>
`;

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const renderTextField = (step, config, value, errorMessage = "") => {
  const hasError = Boolean(errorMessage);
  const errorId = `${step}-error`;
  const describedBy = hasError ? ` aria-describedby="${errorId}"` : "";

  return `
  <div class="form-field${hasError ? " form-field--error" : ""}">
    <label for="${step}-input">${config.label}</label>
    <textarea
      id="${step}-input"
      name="${step}"
      rows="6"
      data-state-field="${step}"
      data-primary-input
      placeholder="${escapeHtml(config.placeholder)}"
      ${hasError ? 'aria-invalid="true"' : ""}${describedBy}
    >${escapeHtml(value)}</textarea>
    ${
      hasError
        ? `<p class="field-message field-message--error" id="${errorId}" role="alert" aria-live="polite" data-validation-message>${escapeHtml(errorMessage)}</p>`
        : ""
    }
  </div>
`;
};

const renderChoiceChip = (field, option, selectedValues) => {
  const isSelected = selectedValues.includes(option);

  return `
    <button
      class="choice-chip${isSelected ? " choice-chip--selected" : ""}"
      type="button"
      data-action="toggle-option"
      data-field="${field}"
      data-value="${escapeHtml(option)}"
      aria-pressed="${isSelected}"
    >
      <span class="choice-chip__check" aria-hidden="true">✓</span>
      ${escapeHtml(option)}
    </button>
  `;
};

const renderChoiceFields = (config, state) => `
  <fieldset class="option-fieldset">
    <legend>Select any that fit</legend>
    <div class="choice-chips">
      ${config.options
        .map((option) => renderChoiceChip(config.stateField, option, state[config.stateField]))
        .join("")}
    </div>
  </fieldset>

  <div class="form-field form-field--compact">
    <label for="${config.customField}-input">${config.customLabel}</label>
    <input
      id="${config.customField}-input"
      name="${config.customField}"
      type="text"
      value="${escapeHtml(state[config.customField])}"
      data-state-field="${config.customField}"
      data-primary-input
      placeholder="${escapeHtml(config.customPlaceholder)}"
      autocomplete="off"
    />
  </div>
`;

const renderActions = (step, config) => {
  const actions = [];

  if (config.allowBack) {
    actions.push(
      '<button class="button button--secondary" type="button" data-action="back">Back</button>',
    );
  }

  if (config.allowSkip) {
    actions.push(
      '<button class="button button--secondary" type="button" data-action="skip">Skip</button>',
    );
  }

  const primaryAction = step === "tone" ? "improve" : "continue";
  actions.push(`
    <button class="button button--primary" type="button" data-action="${primaryAction}">
      ${config.primaryLabel}
      ${arrowIcon}
    </button>
  `);

  const actionClass = actions.length === 3 ? " builder-card__actions--three" : "";
  return `<footer class="builder-card__actions${actionClass}">${actions.join("")}</footer>`;
};

const renderReadyState = (state) =>
  state.improvementReady
    ? `
      <div class="wizard-ready" role="status" tabindex="-1" data-ready-status>
        <strong>Prompt improved</strong>
        <span>Your latest result is ready. Select a suggestion to edit a linked CRAFT field.</span>
      </div>
    `
    : "";

export const renderStepper = (container, currentStep) => {
  container.innerHTML = STEP_ORDER.map((step) => {
    const config = STEP_CONFIG[step];
    const status = getStepStatus(step, currentStep);
    const currentAttribute = status === "current" ? ' aria-current="step"' : "";

    return `
      <li class="stepper__item stepper__item--${status}"${currentAttribute}>
        <span class="stepper__marker">${config.letter}</span>
        <span class="stepper__label">${config.name}</span>
      </li>
    `;
  }).join("");
};

export const renderStep = (container, state, validationErrors = {}) => {
  const step = state.currentStep;
  const config = STEP_CONFIG[step];
  const fields =
    config.type === "text"
      ? renderTextField(step, config, state[step], validationErrors[step])
      : renderChoiceFields(config, state);

  container.setAttribute("aria-labelledby", `${step}-title`);
  container.innerHTML = `
    <header class="builder-card__header">
      <p class="step-kicker">
        <span aria-hidden="true">${config.letter}</span>
        ${config.letter} · ${config.name.toUpperCase()}
      </p>
      <h2 id="${step}-title">${config.question}</h2>
      <p>${config.guidance}</p>
    </header>

    ${fields}
    ${renderReadyState(state)}
    ${renderActions(step, config)}
  `;
};
