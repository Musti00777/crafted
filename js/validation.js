export const ACTION_ERROR_MESSAGE = "Add an action to continue.";

export const validateAction = (value) => {
  const isValid = typeof value === "string" && value.trim().length > 0;

  return {
    isValid,
    message: isValid ? "" : ACTION_ERROR_MESSAGE,
  };
};
