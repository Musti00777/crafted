const defineFragments = (fragments) => Object.freeze(fragments);

export const promptFragments = Object.freeze({
  en: defineFragments({
    action: "Complete the following task:",
    idea: "Use this as the starting point:",
    context: "Take this context into account:",
    role: "Adopt this role:",
    format: "Return the result in this format:",
    tone: "Use this tone:",
    guardrail:
      "Treat the provided details as authoritative. Do not silently assume missing requirements; ask a focused clarification question when one is essential.",
  }),
  de: defineFragments({
    action: "Führe die folgende Aufgabe aus:",
    idea: "Nutze dies als Ausgangspunkt:",
    context: "Berücksichtige diesen Kontext:",
    role: "Übernimm diese Rolle:",
    format: "Liefere das Ergebnis in diesem Format:",
    tone: "Verwende diesen Ton:",
    guardrail:
      "Behandle die bereitgestellten Angaben als verbindlich. Ergänze fehlende Anforderungen nicht stillschweigend; stelle eine gezielte Rückfrage, wenn eine Angabe wesentlich ist.",
  }),
});
