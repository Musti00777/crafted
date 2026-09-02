export const EMPTY_PREVIEW_MESSAGE =
  "Your draft preview will appear here as you add CRAFT details.";

const normalizeText = (value) =>
  typeof value === "string" ? value.trim() : "";

const combineValues = (selections, customValue) => {
  const values = [
    ...(Array.isArray(selections) ? selections : []),
    customValue,
  ]
    .map(normalizeText)
    .filter(Boolean);
  const seen = new Set();

  return values.filter((value) => {
    const key = value.toLowerCase();
    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
};

export const buildDraftPreview = (state = {}) => {
  const sections = [
    { label: "Idea", content: normalizeText(state.idea) },
    { label: "Context", content: normalizeText(state.context) },
    { label: "Role", content: normalizeText(state.role) },
    { label: "Action", content: normalizeText(state.action) },
    {
      label: "Format",
      content: combineValues(state.format, state.customFormat).join(", "),
    },
    {
      label: "Tone",
      content: combineValues(state.tone, state.customTone).join(", "),
    },
  ].filter(({ content }) => content);

  return {
    isEmpty: sections.length === 0,
    sections,
    text: sections.length
      ? sections.map(({ label, content }) => `${label}\n${content}`).join("\n\n")
      : EMPTY_PREVIEW_MESSAGE,
  };
};

const createEmptyState = () => {
  const mark = document.createElement("span");
  mark.className = "preview-empty__mark";
  mark.setAttribute("aria-hidden", "true");
  mark.textContent = "C";

  const message = document.createElement("p");
  message.textContent = EMPTY_PREVIEW_MESSAGE;

  return [mark, message];
};

const createSectionList = (sections) => {
  const list = document.createElement("dl");
  list.className = "draft-preview__content";

  sections.forEach(({ label, content }) => {
    const item = document.createElement("div");
    item.className = "draft-preview__section";

    const term = document.createElement("dt");
    term.textContent = label;

    const description = document.createElement("dd");
    description.textContent = content;

    item.append(term, description);
    list.append(item);
  });

  return list;
};

export const renderDraftPreview = (container, state) => {
  const preview = buildDraftPreview(state);
  container.classList.toggle("preview-empty", preview.isEmpty);
  container.replaceChildren(
    ...(preview.isEmpty ? createEmptyState() : [createSectionList(preview.sections)]),
  );

  return preview;
};
