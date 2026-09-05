const defineSuggestion = (ruleId, id, en, de) =>
  Object.freeze({ ruleId, id, messages: Object.freeze({ en, de }) });

// UX copy only: diagnosis, fields, severities, and phases remain in Build 7.
// Shared IDs identify materially equivalent next steps, not entire fields.
export const suggestions = Object.freeze([
  defineSuggestion(
    "structural-action-missing",
    "action-task",
    "Describe the task you want completed and the result you need in Action.",
    "Beschreibe im Feld Action die gewünschte Aufgabe und das benötigte Ergebnis.",
  ),
  defineSuggestion(
    "generic-action-too-vague",
    "action-task",
    "Replace the broad request in Action with the task to perform and the outcome you need.",
    "Ersetze die allgemeine Anfrage im Feld Action durch eine konkrete Aufgabe und das gewünschte Ergebnis.",
  ),
  defineSuggestion(
    "interview-position-missing",
    "context-interview-position",
    "Add the job title or position you are preparing for to Context.",
    "Ergänze im Kontext die Stellenbezeichnung oder Position, auf die du dich vorbereitest.",
  ),
  defineSuggestion(
    "interview-company-missing",
    "context-interview-organization",
    "If known, add the company or industry relevant to the interview to Context.",
    "Ergänze im Kontext das Unternehmen oder die Branche für das Gespräch, sofern bekannt.",
  ),
  defineSuggestion(
    "interview-goal-missing",
    "action-interview-outcome",
    "Specify in Action whether you want practice questions, model answers, a mock interview, feedback, or a preparation plan.",
    "Lege im Feld Action fest, ob du Übungsfragen, Beispielantworten, ein Probeinterview, Feedback oder einen Vorbereitungsplan möchtest.",
  ),
  defineSuggestion(
    "communication-recipient-missing",
    "context-audience",
    "Add who will receive the message to Context.",
    "Ergänze im Kontext, an wen die Nachricht gerichtet ist.",
  ),
  defineSuggestion(
    "communication-purpose-missing",
    "action-message-purpose",
    "State in Action what the message should achieve.",
    "Beschreibe im Feld Action, was die Nachricht erreichen soll.",
  ),
  defineSuggestion(
    "learning-topic-missing",
    "context-learning-topic",
    "Name the topic or concept you want to learn in Context.",
    "Nenne im Kontext das Thema oder Konzept, das gelernt werden soll.",
  ),
  defineSuggestion(
    "learning-level-missing",
    "context-learning-level",
    "Describe the learner's current knowledge of the topic in Context.",
    "Beschreibe im Kontext die bisherigen Kenntnisse der lernenden Person zum Thema.",
  ),
  defineSuggestion(
    "learning-goal-missing",
    "context-learning-goal",
    "Add what the learner should be able to understand or do afterward to Context.",
    "Ergänze im Kontext, was die lernende Person danach verstehen oder tun können soll.",
  ),
  defineSuggestion(
    "social-platform-missing",
    "context-social-platform",
    "Name the platform where you intend to publish the content in Context.",
    "Nenne im Kontext die Plattform, auf der du den Inhalt veröffentlichen möchtest.",
  ),
  defineSuggestion(
    "social-output-type-missing",
    "action-social-output",
    "Specify the kind of social content you want in Action.",
    "Lege im Feld Action fest, welche Art von Social-Media-Inhalt du benötigst.",
  ),
  defineSuggestion(
    "social-goal-missing",
    "context-social-goal",
    "Add what you want the content to achieve to Context.",
    "Ergänze im Kontext, was du mit dem Inhalt erreichen möchtest.",
  ),
  defineSuggestion(
    "social-audience-missing",
    "context-audience",
    "Describe who you want the content to reach in Context.",
    "Beschreibe im Kontext, wen du mit dem Inhalt erreichen möchtest.",
  ),
  defineSuggestion(
    "business-audience-missing",
    "context-audience",
    "Name who will read the output or use it to make a decision in Context.",
    "Nenne im Kontext, wer das Ergebnis lesen oder für eine Entscheidung nutzen wird.",
  ),
  defineSuggestion(
    "business-purpose-missing",
    "context-business-purpose",
    "Add the business purpose or decision the output should support to Context.",
    "Ergänze im Kontext den geschäftlichen Zweck oder die Entscheidung, die das Ergebnis unterstützen soll.",
  ),
  defineSuggestion(
    "business-scope-missing",
    "context-business-scope",
    "Add the relevant data scope or boundaries for the task to Context.",
    "Ergänze im Kontext den relevanten Datenumfang oder die Grenzen der Aufgabe.",
  ),
  defineSuggestion(
    "interview-role-missing",
    "role-expertise",
    "Choose the perspective or expertise that should guide the interview preparation in Role.",
    "Lege im Feld Rolle fest, welche Perspektive oder Expertise die Gesprächsvorbereitung leiten soll.",
  ),
  defineSuggestion(
    "interview-format-missing",
    "format-structure",
    "Choose how the interview practice should be structured in Format.",
    "Lege im Feld Format fest, wie die Gesprächsübung aufgebaut sein soll.",
  ),
  defineSuggestion(
    "communication-tone-missing",
    "tone-style",
    "Specify how the message should sound to its recipient in Tone.",
    "Beschreibe im Feld Ton, wie die Nachricht auf die empfangende Person wirken soll.",
  ),
  defineSuggestion(
    "learning-format-missing",
    "format-structure",
    "Choose how the learning material should be structured in Format.",
    "Lege im Feld Format fest, wie das Lernmaterial aufgebaut sein soll.",
  ),
  defineSuggestion(
    "social-tone-missing",
    "tone-style",
    "Describe the style you want for the social content in Tone.",
    "Beschreibe im Feld Ton den gewünschten Stil des Social-Media-Inhalts.",
  ),
  defineSuggestion(
    "business-format-missing",
    "format-structure",
    "Choose how the business output should be organized in Format.",
    "Lege im Feld Format fest, wie das geschäftliche Ergebnis aufgebaut sein soll.",
  ),
]);
