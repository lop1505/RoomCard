// Match the editor and its existing HA preview without creating another card.
const KEY = Symbol.for("room-card.drawer-preview");
const scopeOf = (node) => {
  for (let current = node; current; current = current.parentNode || current.host) {
    if (current.localName === "hui-dialog-edit-card") return current;
  }
  return null;
};
export const registerDrawerPreview = (node, open) => {
  const scope = scopeOf(node);
  if (!scope) return () => {};
  const entries = scope[KEY] ||= new Set();
  entries.add(open);
  return () => { entries.delete(open); if (!entries.size) delete scope[KEY]; };
};
export const requestDrawerPreview = (editor, trigger) => {
  const entries = scopeOf(editor)?.[KEY];
  if (!entries || entries.size !== 1) return false;
  return [...entries][0](trigger);
};
