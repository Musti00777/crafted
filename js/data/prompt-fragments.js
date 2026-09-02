const defineFragments = (fragments) => Object.freeze(fragments);

export const promptFragments = Object.freeze({
  en: defineFragments({
    action: "Task",
    idea: "Starting idea",
    context: "Context",
    role: "Role",
    format: "Output format",
    tone: "Tone",
  }),
  de: defineFragments({
    action: "Aufgabe",
    idea: "Ausgangsidee",
    context: "Kontext",
    role: "Rolle",
    format: "Ausgabeformat",
    tone: "Ton",
  }),
});
