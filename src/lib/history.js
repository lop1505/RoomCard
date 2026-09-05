const SHARED_SPARKLINE_CACHE = new Map();
const SHARED_SPARKLINE_PENDING = new Map();
const SHARED_SPARKLINE_CACHE_LIMIT = 100;
const SHARED_SPARKLINE_MAX_AGE_MS = 4 * 60 * 60 * 1000;

const normalizeSparklineSamples = (samples) => {
  const valid = (Array.isArray(samples) ? samples : [])
    .filter((sample) => Number.isFinite(sample?.timestamp) && Number.isFinite(sample?.value))
    .sort((a, b) => a.timestamp - b.timestamp);
  if (valid.length === 0) return [];
  if (valid.length === 1) return [{ x: 0, y: valid[0].value }, { x: 1, y: valid[0].value }];
  const startTime = valid[0].timestamp;
  const endTime = Math.max(valid[valid.length - 1].timestamp, startTime + 1);
  return valid.map((sample) => ({
    x: (sample.timestamp - startTime) / (endTime - startTime),
    y: sample.value
  }));
};

const getSparklineStats = (samples) => {
  const values = (Array.isArray(samples) ? samples : [])
    .map((sample) => sample?.value)
    .filter(Number.isFinite);
  if (values.length === 0) return null;
  return {
    min: Math.min(...values),
    max: Math.max(...values),
    average: values.reduce((sum, value) => sum + value, 0) / values.length
  };
};

const pruneSharedSparklineCache = (now = Date.now()) => {
  for (const [key, entry] of SHARED_SPARKLINE_CACHE.entries()) {
    if (!entry || now - entry.lastAccess > SHARED_SPARKLINE_MAX_AGE_MS) SHARED_SPARKLINE_CACHE.delete(key);
  }
  while (SHARED_SPARKLINE_CACHE.size > SHARED_SPARKLINE_CACHE_LIMIT) {
    SHARED_SPARKLINE_CACHE.delete(SHARED_SPARKLINE_CACHE.keys().next().value);
  }
};

const fetchHistorySamples = async (callWS, entity, hours) => {
  try {
    const start = new Date(Date.now() - hours * 3600000);
    const result = await callWS({
      type: "history/history_during_period",
      entity_ids: [entity],
      start_time: start.toISOString(),
      end_time: new Date().toISOString(),
      minimal_response: true,
      no_attributes: true
    });
    const raw = result[entity] || (Array.isArray(result) && result.length > 0 ? result[0] : []);
    const samples = [];
    for (const item of raw) {
      if (!item) continue;
      let state; let ts;
      if (Array.isArray(item)) {
        state = item[0];
        ts = item[1] ? new Date(item[1]) : null;
      } else if (typeof item === "object") {
        state = item.state ?? item.s;
        const timeVal = item.last_changed ?? item.last_updated ?? item.lu ?? item.lc;
        if (typeof timeVal === "number") ts = new Date(timeVal * 1000);
        else if (timeVal) ts = new Date(timeVal);
      }
      if (!ts || state == null) continue;
      const value = parseFloat(String(state));
      if (Number.isNaN(value)) continue;
      const timestamp = ts.getTime();
      if (!Number.isFinite(timestamp)) continue;
      samples.push({ timestamp, value });
    }
    samples.sort((a, b) => a.timestamp - b.timestamp);
    return { samples, error: null };
  } catch (err) {
    return { samples: [], error: String(err?.message || err || "history_error") };
  }
};

export { SHARED_SPARKLINE_CACHE, SHARED_SPARKLINE_PENDING, SHARED_SPARKLINE_CACHE_LIMIT, SHARED_SPARKLINE_MAX_AGE_MS, normalizeSparklineSamples, getSparklineStats, pruneSharedSparklineCache, fetchHistorySamples };
