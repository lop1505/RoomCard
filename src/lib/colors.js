import { trimStr } from "./values.js";

const hexToRgba = (hex, alpha = 0.35) => {
  const m = /^#?([0-9a-f]{6})$/i.exec(trimStr(hex) || "");
  if (!m) return "";
  const raw = m[1];
  const r = parseInt(raw.slice(0, 2), 16);
  const g = parseInt(raw.slice(2, 4), 16);
  const b = parseInt(raw.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const readableTextForHex = (hex) => {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(trimStr(hex) || "");
  if (!m) return "";
  const raw = m[1].length === 3
    ? m[1].split("").map((ch) => ch + ch).join("")
    : m[1];
  const r = parseInt(raw.slice(0, 2), 16);
  const g = parseInt(raw.slice(2, 4), 16);
  const b = parseInt(raw.slice(4, 6), 16);
  return ((r * 299 + g * 587 + b * 114) / 1000) >= 140 ? "#000000" : "#ffffff";
};

const parseColorToPickerHex = (color) => {
  const value = trimStr(color) || "";
  const hex = /^#([0-9a-f]{6})$/i.exec(value);
  if (hex) return `#${hex[1]}`;
  const rgba = /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(?:\d*\.?\d+))?\s*\)$/i.exec(value);
  if (!rgba) return "#000000";
  const clamp = (n) => Math.max(0, Math.min(255, Number(n) || 0)).toString(16).padStart(2, "0");
  return `#${clamp(rgba[1])}${clamp(rgba[2])}${clamp(rgba[3])}`;
};

export { hexToRgba, readableTextForHex, parseColorToPickerHex };
