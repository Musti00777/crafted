export const STEP_ORDER = Object.freeze([
  "context",
  "role",
  "action",
  "format",
  "tone",
]);

export const STEP_CONFIG = Object.freeze({
  context: Object.freeze({
    letter: "C",
    name: "Context",
    question: "What’s useful to know?",
    guidance:
      "Add the background, audience, or situation that will help make the result more relevant.",
    type: "text",
    label: "Context details",
    placeholder:
      "Example: I run a small online shop and I’m planning a spring product launch for returning customers.",
    allowBack: false,
    allowSkip: true,
    primaryLabel: "Continue",
  }),
  role: Object.freeze({
    letter: "R",
    name: "Role",
    question: "Who should AI be?",
    guidance:
      "Describe the perspective or expertise that would make the response more useful.",
    type: "text",
    label: "Role details",
    placeholder: "Example: An experienced launch strategist for small online brands.",
    allowBack: true,
    allowSkip: true,
    primaryLabel: "Continue",
  }),
  action: Object.freeze({
    letter: "A",
    name: "Action",
    question: "What should AI do?",
    guidance: "Describe the task, outcome, or problem you want AI to handle.",
    type: "text",
    label: "Action details",
    placeholder: "Example: Create a launch plan with a timeline and campaign ideas.",
    allowBack: true,
    allowSkip: false,
    primaryLabel: "Continue",
  }),
  format: Object.freeze({
    letter: "F",
    name: "Format",
    question: "How should the response be structured?",
    guidance: "Select one or more formats, or add your own.",
    type: "choices",
    stateField: "format",
    customField: "customFormat",
    customLabel: "Custom format",
    customPlaceholder: "Add another format...",
    options: Object.freeze([
      "Bullet points",
      "Table",
      "Step-by-step",
      "Short answer",
      "Detailed",
      "Email",
    ]),
    allowBack: true,
    allowSkip: true,
    primaryLabel: "Continue",
  }),
  tone: Object.freeze({
    letter: "T",
    name: "Tone",
    question: "How should it sound?",
    guidance: "Choose one or more tones, or describe a custom style.",
    type: "choices",
    stateField: "tone",
    customField: "customTone",
    customLabel: "Custom tone",
    customPlaceholder: "Add another tone...",
    options: Object.freeze([
      "Professional",
      "Friendly",
      "Casual",
      "Confident",
      "Persuasive",
      "Empathetic",
    ]),
    allowBack: true,
    allowSkip: true,
    primaryLabel: "Improve Prompt",
  }),
});

export const getStepIndex = (step) => STEP_ORDER.indexOf(step);

export const getNextStep = (step) => {
  const nextStep = STEP_ORDER[getStepIndex(step) + 1];
  return nextStep ?? step;
};

export const getPreviousStep = (step) => {
  const previousStep = STEP_ORDER[getStepIndex(step) - 1];
  return previousStep ?? step;
};

export const getStepStatus = (step, currentStep) => {
  const stepIndex = getStepIndex(step);
  const currentIndex = getStepIndex(currentStep);

  if (stepIndex < currentIndex) return "completed";
  if (stepIndex === currentIndex) return "current";
  return "upcoming";
};
