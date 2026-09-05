const defineExampleSet = (examples) => Object.freeze(examples);

const defineLanguageExamples = (examples) =>
  Object.freeze(
    Object.fromEntries(
      Object.entries(examples).map(([category, values]) => [
        category,
        defineExampleSet(values),
      ]),
    ),
  );

export const DEFAULT_EXAMPLE_CATEGORY = "general";

export const examples = Object.freeze({
  en: defineLanguageExamples({
    interview: {
      context:
        "Example: I am applying for a product manager role and have five years of relevant experience.",
      role: "Example: An experienced career coach and hiring manager.",
      action:
        "Example: Prepare likely interview questions, model answers, and feedback for me.",
      format: "Example: Mock interview followed by structured feedback",
      tone: "Example: Supportive, direct, and professional",
    },
    communication: {
      context:
        "Example: The message is for a long-term customer whose delivery is delayed.",
      role: "Example: An experienced customer communications specialist.",
      action:
        "Example: Write an email that explains the delay and confirms the next step.",
      format: "Example: Email with subject line and short paragraphs",
      tone: "Example: Professional, transparent, and empathetic",
    },
    learning: {
      context:
        "Example: I am a beginner and need to understand the topic for an upcoming exam.",
      role: "Example: A patient teacher who explains concepts with simple examples.",
      action:
        "Example: Explain the topic, check my understanding, and give me practice questions.",
      format: "Example: Step-by-step lesson with a short quiz",
      tone: "Example: Clear, patient, and encouraging",
    },
    social: {
      context:
        "Example: The post is for LinkedIn and should reach small-business owners.",
      role: "Example: A social media strategist for professional audiences.",
      action:
        "Example: Write a post that introduces the idea and encourages comments.",
      format: "Example: Short post with hook, body, and call to action",
      tone: "Example: Confident, approachable, and concise",
    },
    business: {
      context:
        "Example: The management team needs a decision-ready summary of the latest results.",
      role: "Example: A senior business analyst advising decision-makers.",
      action:
        "Example: Analyze the information, identify key findings, and recommend next steps.",
      format: "Example: Executive summary followed by a findings table",
      tone: "Example: Objective, concise, and professional",
    },
    general: {
      context:
        "Example: Add who this is for, the relevant background, and any constraints.",
      role: "Example: Choose an expert whose experience fits your idea.",
      action: "Example: State the exact result you want AI to produce.",
      format: "Example: A checklist followed by clear next steps",
      tone: "Example: Clear, practical, and encouraging",
    },
  }),
  de: defineLanguageExamples({
    interview: {
      context:
        "Beispiel: Ich bewerbe mich als Product Manager und habe fünf Jahre relevante Erfahrung.",
      role: "Beispiel: Ein erfahrener Karriere-Coach und Hiring Manager.",
      action:
        "Beispiel: Bereite typische Interviewfragen, Beispielantworten und Feedback für mich vor.",
      format: "Beispiel: Probeinterview mit anschließendem strukturiertem Feedback",
      tone: "Beispiel: Unterstützend, direkt und professionell",
    },
    communication: {
      context:
        "Beispiel: Die Nachricht geht an einen langjährigen Kunden, dessen Lieferung verspätet ist.",
      role: "Beispiel: Ein erfahrener Spezialist für Kundenkommunikation.",
      action:
        "Beispiel: Schreibe eine E-Mail, die die Verzögerung erklärt und den nächsten Schritt bestätigt.",
      format: "Beispiel: E-Mail mit Betreff und kurzen Absätzen",
      tone: "Beispiel: Professionell, transparent und empathisch",
    },
    learning: {
      context:
        "Beispiel: Ich bin Anfänger und muss das Thema für eine anstehende Prüfung verstehen.",
      role: "Beispiel: Eine geduldige Lehrkraft, die mit einfachen Beispielen erklärt.",
      action:
        "Beispiel: Erkläre das Thema, prüfe mein Verständnis und gib mir Übungsfragen.",
      format: "Beispiel: Schritt-für-Schritt-Lektion mit kurzem Quiz",
      tone: "Beispiel: Klar, geduldig und ermutigend",
    },
    social: {
      context:
        "Beispiel: Der Beitrag ist für LinkedIn und soll kleine Unternehmen erreichen.",
      role: "Beispiel: Ein Social-Media-Stratege für berufliche Zielgruppen.",
      action:
        "Beispiel: Schreibe einen Beitrag, der die Idee vorstellt und zu Kommentaren anregt.",
      format: "Beispiel: Kurzer Beitrag mit Hook, Hauptteil und Handlungsaufruf",
      tone: "Beispiel: Selbstbewusst, zugänglich und prägnant",
    },
    business: {
      context:
        "Beispiel: Das Management benötigt eine entscheidungsreife Zusammenfassung der Ergebnisse.",
      role: "Beispiel: Ein Senior Business Analyst, der Entscheidungsträger berät.",
      action:
        "Beispiel: Analysiere die Informationen, nenne Kernerkenntnisse und empfehle nächste Schritte.",
      format: "Beispiel: Management Summary mit anschließender Ergebnistabelle",
      tone: "Beispiel: Objektiv, prägnant und professionell",
    },
    general: {
      context:
        "Beispiel: Ergänze Zielgruppe, relevanten Hintergrund und wichtige Einschränkungen.",
      role: "Beispiel: Wähle eine Fachperson, deren Erfahrung zu deiner Idee passt.",
      action: "Beispiel: Beschreibe genau, welches Ergebnis die KI erstellen soll.",
      format: "Beispiel: Checkliste mit klaren nächsten Schritten",
      tone: "Beispiel: Klar, praktisch und ermutigend",
    },
  }),
});
