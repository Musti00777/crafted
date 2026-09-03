export const COPY_FEEDBACK = Object.freeze({
  idle: Object.freeze({ state: "idle", label: "Copy Prompt", message: "" }),
  success: Object.freeze({
    state: "success",
    label: "Copied",
    message: "Improved prompt copied to the clipboard.",
  }),
  error: Object.freeze({
    state: "error",
    label: "Copy failed",
    message: "The improved prompt could not be copied. Please try again.",
  }),
});

export const isPromptCopyAvailable = (prompt) =>
  typeof prompt === "string" && prompt.trim().length > 0;

export const createPromptCopyController = ({
  readVisiblePrompt,
  writeText,
  onFeedback = () => {},
  scheduleReset = (callback, delay) => setTimeout(callback, delay),
  feedbackDuration = 1600,
}) => {
  if (typeof readVisiblePrompt !== "function" || typeof writeText !== "function") {
    throw new TypeError("Prompt copying requires read and write functions.");
  }

  let feedbackVersion = 0;

  const resetFeedback = () => {
    feedbackVersion += 1;
    onFeedback(COPY_FEEDBACK.idle);
  };

  const showTemporaryFeedback = (feedback, version) => {
    if (version !== feedbackVersion) return;
    onFeedback(feedback);
    scheduleReset(() => {
      if (version === feedbackVersion) resetFeedback();
    }, feedbackDuration);
  };

  return Object.freeze({
    async copy() {
      const prompt = readVisiblePrompt();
      if (!isPromptCopyAvailable(prompt)) {
        return { ok: false, reason: "empty" };
      }

      const version = ++feedbackVersion;
      try {
        await writeText(prompt);
        showTemporaryFeedback(COPY_FEEDBACK.success, version);
        return { ok: true, text: prompt };
      } catch {
        showTemporaryFeedback(COPY_FEEDBACK.error, version);
        return { ok: false, reason: "clipboard" };
      }
    },
    resetFeedback,
  });
};
