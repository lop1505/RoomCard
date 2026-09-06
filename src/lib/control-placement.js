export const getControlPlacement = (control) =>
  ["card", "drawer", "both"].includes(control?.display_in) ? control.display_in : "card";

export const isControlInContext = (control, config, context) => {
  if (config?.detail_drawer?.enabled !== true) return context === "card";
  const placement = getControlPlacement(control);
  return placement === "both" || placement === context;
};
