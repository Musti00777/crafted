const defineFragments = (fragments) => Object.freeze(fragments);

export const promptFragments = Object.freeze({
  en: defineFragments({
    action: "Task",
    actionInstruction: "Complete the following task using the supplied requirements:",
    idea: "Starting point",
    context: "Relevant context",
    role: "Role to adopt",
    format: "Required output format",
    tone: "Required tone",
  }),
  de: defineFragments({
    action: "Aufgabe",
    actionInstruction:
      "Führe die folgende Aufgabe anhand der bereitgestellten Anforderungen aus:",
    idea: "Ausgangspunkt",
    context: "Relevanter Kontext",
    role: "Einzunehmende Rolle",
    format: "Gewünschtes Ausgabeformat",
    tone: "Gewünschter Ton",
  }),
});
