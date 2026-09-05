import assert from "node:assert/strict";

export const assertModuleBoundaries = (inputs) => {
  const entry = "src/room-card.js";
  const graph = new Map(Object.entries(inputs).map(([path, input]) => [path, input.imports.map(item => item.path).filter(path => path in inputs)]));
  for (const [path, dependencies] of graph) {
    for (const dependency of dependencies) {
      assert.ok(path === entry || dependency !== entry, `Back-import into entry: ${path} → ${dependency}`);
      if (/^src\/(lib|i18n)\//.test(path)) assert.ok(/^src\/(lib|i18n)\//.test(dependency) || dependency === "src/version.js", `Invalid library dependency: ${path} → ${dependency}`);
      if (path.startsWith("src/shared/")) assert.ok(!/^src\/(card|editor)\//.test(dependency), `Invalid shared dependency: ${path} → ${dependency}`);
      if (path.startsWith("src/editor/")) assert.ok(!dependency.startsWith("src/card/"), `Editor must not depend on card: ${dependency}`);
      if (path.startsWith("src/card/")) assert.ok(!dependency.startsWith("src/editor/"), `Card must not depend on editor: ${dependency}`);
    }
  }
  const visiting = new Set();
  const visited = new Set();
  const visit = (path) => {
    if (visiting.has(path)) throw new Error(`Module cycle at ${path}`);
    if (visited.has(path)) return;
    visiting.add(path);
    for (const dependency of graph.get(path) || []) visit(dependency);
    visiting.delete(path);
    visited.add(path);
  };
  for (const path of graph.keys()) visit(path);
};
