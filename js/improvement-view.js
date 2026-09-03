const fieldLabel = (field) =>
  `${field.slice(0, 1).toUpperCase()}${field.slice(1)}`;

const renderMetaPrompt = (container, metaPrompt) => {
  const output = container.ownerDocument.createElement("p");
  output.className = "improved-prompt__text";
  output.textContent = metaPrompt;
  container.replaceChildren(output);
};

const renderSuggestions = (container, suggestions) => {
  if (suggestions.length === 0) {
    const message = container.ownerDocument.createElement("p");
    message.className = "improvement-empty-message";
    message.textContent = "No further suggestions right now.";
    container.replaceChildren(message);
    return;
  }

  const list = container.ownerDocument.createElement("ol");
  list.className = "suggestion-list";

  suggestions.forEach((suggestion) => {
    const item = container.ownerDocument.createElement("li");
    const button = container.ownerDocument.createElement("button");
    const target = container.ownerDocument.createElement("span");
    const message = container.ownerDocument.createElement("span");
    const arrow = container.ownerDocument.createElement("span");

    button.className = "suggestion-card";
    button.type = "button";
    button.dataset.action = "open-suggestion";
    button.dataset.suggestionField = suggestion.field;
    button.setAttribute(
      "aria-label",
      `Edit ${fieldLabel(suggestion.field)}: ${suggestion.message}`,
    );

    target.className = "suggestion-card__field";
    target.textContent = fieldLabel(suggestion.field);
    message.className = "suggestion-card__message";
    message.textContent = suggestion.message;
    arrow.className = "suggestion-card__arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "→";

    button.append(target, message, arrow);
    item.append(button);
    list.append(item);
  });

  container.replaceChildren(list);
};

export const renderCraftSummary = (container, summary) => {
  const list = container.ownerDocument.createElement("ul");
  list.className = "craft-summary";

  summary.forEach(({ label, used }) => {
    const item = container.ownerDocument.createElement("li");
    const field = container.ownerDocument.createElement("span");
    const status = container.ownerDocument.createElement("span");

    item.className = "craft-summary__item";
    field.className = "craft-summary__field";
    field.textContent = label;
    status.className = `craft-summary__status craft-summary__status--${
      used ? "used" : "unused"
    }`;
    status.textContent = used ? "Used" : "Not used";

    item.append(field, status);
    list.append(item);
  });

  container.replaceChildren(list);
};

export const renderImprovementResult = (elements, result) => {
  renderMetaPrompt(elements.metaPrompt, result.metaPrompt);
  renderSuggestions(elements.suggestions, result.suggestions);
  renderCraftSummary(elements.summary, result.summary);
  elements.metaStatus.textContent = "Latest run";
  elements.suggestionStatus.textContent = `${result.suggestions.length} current`;
  elements.previewEyebrow.textContent = "Improvement result";
  elements.previewStatus.textContent = "Improved";
};
