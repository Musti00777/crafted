const stateFields = new Set([
  "idea",
  "context",
  "role",
  "action",
  "format",
  "customFormat",
  "tone",
  "customTone",
  "currentStep",
  "wizardStarted",
  "improvementReady",
]);

const selectionFields = new Set(["format", "tone"]);

export const createInitialState = () => ({
  status: "ready",
  idea: "",
  context: "",
  role: "",
  action: "",
  format: [],
  customFormat: "",
  tone: [],
  customTone: "",
  currentStep: "context",
  wizardStarted: false,
  improvementReady: false,
});

let state = createInitialState();

export const getState = () => state;

export const updateState = (updates) => {
  const safeUpdates = Object.fromEntries(
    Object.entries(updates).filter(([field]) => stateFields.has(field)),
  );

  state = { ...state, ...safeUpdates };
  return state;
};

export const updateField = (field, value) => {
  if (!stateFields.has(field)) {
    throw new Error(`Unknown CRAFTED state field: ${field}`);
  }

  return updateState({ [field]: value });
};

export const toggleSelection = (field, value) => {
  if (!selectionFields.has(field)) {
    throw new Error(`CRAFTED cannot toggle selections for: ${field}`);
  }

  const currentSelections = state[field];
  const nextSelections = currentSelections.includes(value)
    ? currentSelections.filter((selection) => selection !== value)
    : [...currentSelections, value];

  return updateField(field, nextSelections);
};
