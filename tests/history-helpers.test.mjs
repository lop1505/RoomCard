import assert from "node:assert/strict";
import test from "node:test";
import { fetchHistorySamples } from "../src/lib/history.js";

test("history service sends the existing HA request and parses legacy/compact sample shapes", async () => {
  const requests = [];
  const data = await fetchHistorySamples(async message => {
    requests.push(message);
    return { "sensor.temp": [
      { s: "2.5", lu: 2 },
      ["1.5", "1970-01-01T00:00:01.000Z"],
      { state: "3 W", last_changed: "1970-01-01T00:00:03.000Z" },
      null, { state: "unknown", lc: 4 }, { state: "5", lc: "invalid" }
    ] };
  }, "sensor.temp", 6);
  assert.deepEqual(data, { samples: [
    { timestamp: 1000, value: 1.5 }, { timestamp: 2000, value: 2.5 }, { timestamp: 3000, value: 3 }
  ], error: null });
  assert.equal(requests.length, 1);
  assert.equal(requests[0].type, "history/history_during_period");
  assert.deepEqual(requests[0].entity_ids, ["sensor.temp"]);
  assert.equal(requests[0].minimal_response, true);
  assert.equal(requests[0].no_attributes, true);
  const range = Date.parse(requests[0].end_time) - Date.parse(requests[0].start_time);
  assert.ok(range >= 6 * 3600000 && range < 6 * 3600000 + 1000);
});

test("history service distinguishes empty results, legacy array results and errors", async () => {
  assert.deepEqual(await fetchHistorySamples(async () => ({}), "sensor.temp", 24), { samples: [], error: null });
  assert.deepEqual(await fetchHistorySamples(async () => [[{ s: "0", lc: 0 }]], "sensor.temp", 24), { samples: [{ timestamp: 0, value: 0 }], error: null });
  assert.deepEqual(await fetchHistorySamples(async () => { throw Error("offline"); }, "sensor.temp", 24), { samples: [], error: "offline" });
});
