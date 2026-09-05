import { trimStr } from "./values.js";
import { isEntityOffline } from "./states.js";

// Keep the three legacy policies separate: permissive visibility versus
// strict room-mode/adaptive validity, with distinct numeric threshold rules.
const parseTimeOfDay = (value) => {
  const match = typeof value === "string" ? value.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/) : null;
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = Number(match[3] || 0);
  if (hours > 23 || minutes > 59 || seconds > 59) return null;
  return (hours * 3600) + (minutes * 60) + seconds;
};

const evaluateAdaptiveImageCondition = (condition, hass, now, matchMedia) => {
  if (!condition || typeof condition !== "object") return { valid: false, active: false };
  const type = condition.condition;
  if (type === "state") {
    const entity = trimStr(condition.entity);
    if (!entity) return { valid: false, active: false };
    const stateObj = hass?.states?.[entity];
    if (!stateObj || isEntityOffline(stateObj)) return { valid: false, active: false };
    const current = String(stateObj.state ?? "");
    if (condition.state_not !== undefined && trimStr(String(condition.state_not)) !== "") {
      const excluded = (Array.isArray(condition.state_not) ? condition.state_not : [condition.state_not]).map(String);
      return { valid: true, active: !excluded.includes(current) };
    }
    const expected = (Array.isArray(condition.state) ? condition.state : [condition.state])
      .filter((value) => value !== undefined && trimStr(String(value)) !== "")
      .map(String);
    return expected.length > 0 ? { valid: true, active: expected.includes(current) } : { valid: false, active: false };
  }
  if (type === "numeric_state") {
    const entity = trimStr(condition.entity);
    const resolveThreshold = (threshold) => {
      const raw = trimStr(String(threshold ?? ""));
      if (!raw) return null;
      const direct = Number(raw);
      if (Number.isFinite(direct)) return direct;
      const entityValue = Number(hass?.states?.[raw]?.state);
      return Number.isFinite(entityValue) ? entityValue : null;
    };
    const above = resolveThreshold(condition.above);
    const below = resolveThreshold(condition.below);
    const stateObj = entity ? hass?.states?.[entity] : null;
    const value = Number(stateObj?.state);
    if (!entity || (above === null && below === null) || !stateObj || isEntityOffline(stateObj) || !Number.isFinite(value)) return { valid: false, active: false };
    return { valid: true, active: (above === null || value > above) && (below === null || value < below) };
  }
  if (type === "time") {
    const after = condition.after === undefined ? null : parseTimeOfDay(condition.after);
    const before = condition.before === undefined ? null : parseTimeOfDay(condition.before);
    const weekdays = Array.isArray(condition.weekday) ? condition.weekday.map((day) => String(day).toLowerCase()) : [];
    const weekdayNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    if (after === null && before === null && weekdays.length === 0) return { valid: false, active: false };
    if ((condition.after !== undefined && after === null) || (condition.before !== undefined && before === null)) return { valid: false, active: false };
    if (weekdays.some((day) => !weekdayNames.includes(day))) return { valid: false, active: false };
    const current = (now.getHours() * 3600) + (now.getMinutes() * 60) + now.getSeconds();
    const timeActive = after !== null && before !== null && after > before
      ? current > after || current < before
      : (after === null || current > after) && (before === null || current < before);
    return { valid: true, active: timeActive && (weekdays.length === 0 || weekdays.includes(weekdayNames[now.getDay()])) };
  }
  if (type === "screen") {
    const query = trimStr(condition.media_query);
    if (!query || typeof matchMedia !== "function") return { valid: false, active: false };
    try { return { valid: true, active: matchMedia(query).matches }; }
    catch (_error) { return { valid: false, active: false }; }
  }
  if (type === "user") {
    if (!Array.isArray(condition.users) || condition.users.length === 0 || !hass?.user?.id) return { valid: false, active: false };
    return { valid: true, active: condition.users.includes(hass.user.id) };
  }
  if (["and", "or", "not"].includes(type)) {
    if (!Array.isArray(condition.conditions) || condition.conditions.length === 0) return { valid: false, active: false };
    const nested = condition.conditions.map((item) => evaluateAdaptiveImageCondition(item, hass, now, matchMedia));
    if (nested.some((result) => !result.valid)) return { valid: false, active: false };
    if (type === "and") return { valid: true, active: nested.every((result) => result.active) };
    if (type === "or") return { valid: true, active: nested.some((result) => result.active) };
    return { valid: true, active: nested.every((result) => !result.active) };
  }
  return { valid: false, active: false };
};

const evaluateAdaptiveImageConditions = (conditions, hass, now, matchMedia) => {
  if (!Array.isArray(conditions) || conditions.length === 0) return { valid: false, active: false };
  const results = conditions.map((condition) => evaluateAdaptiveImageCondition(condition, hass, now, matchMedia));
  return { valid: results.every((result) => result.valid), active: results.every((result) => result.valid && result.active) };
};

const getConditionEntityDependencies = (conditions) => {
  const ids = new Set();
  const visit = (condition) => {
    if (!condition || typeof condition !== "object") return;
    if (typeof condition.entity === "string" && condition.entity.trim()) ids.add(condition.entity.trim());
    [condition.above, condition.below].forEach((value) => {
      if (typeof value === "string" && /^[a-z0-9_]+\.[a-z0-9_]+$/i.test(value.trim())) ids.add(value.trim());
    });
    if (Array.isArray(condition.conditions)) condition.conditions.forEach(visit);
  };
  (Array.isArray(conditions) ? conditions : [conditions]).forEach(visit);
  return Array.from(ids);
};

const evaluateRoomModeCondition = (condition, hass) => {
  if (!condition || typeof condition !== "object") return { valid: false, active: false };
  const type = condition.condition;
  if (type === "state") {
    const entity = trimStr(condition.entity);
    const expected = (Array.isArray(condition.state) ? condition.state : [condition.state])
      .filter((value) => value !== undefined && trimStr(String(value)) !== "")
      .map(String);
    if (!entity || expected.length === 0) return { valid: false, active: false };
    const stateObj = hass?.states?.[entity];
    if (!stateObj || isEntityOffline(stateObj)) return { valid: false, active: false };
    return { valid: true, active: expected.includes(String(stateObj.state ?? "")) };
  }
  if (type === "numeric_state") {
    const entity = trimStr(condition.entity);
    const hasAbove = condition.above !== undefined && trimStr(String(condition.above)) !== "" && Number.isFinite(Number(condition.above));
    const hasBelow = condition.below !== undefined && trimStr(String(condition.below)) !== "" && Number.isFinite(Number(condition.below));
    if (!entity || (!hasAbove && !hasBelow)) return { valid: false, active: false };
    const stateObj = hass?.states?.[entity];
    if (!stateObj || isEntityOffline(stateObj)) return { valid: false, active: false };
    const value = Number(stateObj.state);
    if (!Number.isFinite(value)) return { valid: false, active: false };
    return {
      valid: true,
      active: (!hasAbove || value > Number(condition.above)) && (!hasBelow || value < Number(condition.below))
    };
  }
  if (["and", "or", "not"].includes(type)) {
    if (!Array.isArray(condition.conditions) || condition.conditions.length === 0) return { valid: false, active: false };
    const nested = condition.conditions.map((item) => evaluateRoomModeCondition(item, hass));
    if (nested.some((result) => !result.valid)) return { valid: false, active: false };
    if (type === "and") return { valid: true, active: nested.every((result) => result.active) };
    if (type === "or") return { valid: true, active: nested.some((result) => result.active) };
    return { valid: true, active: nested.every((result) => !result.active) };
  }
  return { valid: false, active: false };
};

const evaluateRoomModeActiveWhen = (activeWhen, hass) => {
  const conditions = Array.isArray(activeWhen) ? activeWhen : (activeWhen ? [activeWhen] : []);
  if (conditions.length === 0) return { valid: false, active: false };
  const results = conditions.map((condition) => evaluateRoomModeCondition(condition, hass));
  return {
    valid: results.every((result) => result.valid),
    active: results.every((result) => result.valid && result.active)
  };
};

const evaluateVisibilityCondition = (c, h, matchMedia, checkCondition = (condition) => evaluateVisibilityCondition(condition, h, matchMedia)) => {
  if (!c || !c.condition) return true;
  const type = c.condition;

  if (type === "state") {
    if (!c.entity) return true; // Incomplete condition — treat as always visible
    const st = h.states[c.entity]?.state;
    if (c.state_not !== undefined) return st !== c.state_not;
    return st === c.state;
  }

  if (type === "numeric_state") {
    if (!c.entity) return true; // Incomplete condition
    const val = parseFloat(h.states[c.entity]?.state);
    if (isNaN(val)) return false;
    if (c.above !== undefined && val <= parseFloat(c.above)) return false;
    if (c.below !== undefined && val >= parseFloat(c.below)) return false;
    return true;
  }

  if (type === "screen") {
    if (!c.media_query) return true;
    return matchMedia(c.media_query).matches;
  }

  if (type === "user") {
    if (!Array.isArray(c.users) || !h.user) return true;
    return c.users.includes(h.user.id);
  }

  if (type === "and") {
    if (!Array.isArray(c.conditions)) return true;
    return c.conditions.every(cond => checkCondition(cond));
  }

  if (type === "or") {
    if (!Array.isArray(c.conditions)) return true;
    return c.conditions.some(cond => checkCondition(cond));
  }

  if (type === "not") {
    if (!Array.isArray(c.conditions)) return true;
    return c.conditions.every(cond => !checkCondition(cond));
  }

  return true;
};

export { parseTimeOfDay, evaluateAdaptiveImageConditions, getConditionEntityDependencies, evaluateRoomModeActiveWhen, evaluateVisibilityCondition };
