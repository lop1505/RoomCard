const clampNum = (v, min, max, fallback) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(min, Math.min(n, max)) : fallback;
};

const replaceTemplateExpressions = (str, evalExpr) => {
  let out = "";
  let i = 0;
  while (i < str.length) {
    if (str[i] === "$" && str[i + 1] === "{") {
      i += 2;
      let expr = "";
      let depth = 0;
      let inSingle = false;
      let inDouble = false;
      let inBacktick = false;
      let esc = false;
      let closed = false;
      for (; i < str.length; i++) {
        const ch = str[i];
        if (esc) {
          expr += ch;
          esc = false;
          continue;
        }
        if (ch === "\\") {
          expr += ch;
          esc = true;
          continue;
        }
        if (inSingle) {
          if (ch === "'") inSingle = false;
          expr += ch;
          continue;
        }
        if (inDouble) {
          if (ch === '"') inDouble = false;
          expr += ch;
          continue;
        }
        if (inBacktick) {
          if (ch === "`") inBacktick = false;
          expr += ch;
          continue;
        }
        if (ch === "'") { inSingle = true; expr += ch; continue; }
        if (ch === '"') { inDouble = true; expr += ch; continue; }
        if (ch === "`") { inBacktick = true; expr += ch; continue; }
        if (ch === "{") { depth++; expr += ch; continue; }
        if (ch === "}") {
          if (depth === 0) { closed = true; i++; break; }
          depth--; expr += ch; continue;
        }
        expr += ch;
      }
      if (!closed) {
        out += "${" + expr;
        break;
      }
      out += evalExpr(expr.trim());
      continue;
    }
    out += str[i];
    i++;
  }
  return out;
};

const trimStr = (v) => (typeof v === "string" ? v.trim() : v);

export { clampNum, replaceTemplateExpressions, trimStr };
