import assert from "node:assert/strict";
import test from "node:test";

import { createHass, importRoomCard, installDomEnvironment, wait } from "./support/dom-env.mjs";

installDomEnvironment();
const {
  getTemplateEntityDependencies,
  templateNeedsEveryHassUpdate,
  SHARED_SPARKLINE_CACHE,
  SHARED_SPARKLINE_PENDING,
  pruneSharedSparklineCache
} = await importRoomCard();

const createRenderedCard = (config, hass) => {
  const card = document.createElement("oneline-room-card");
  document.body.appendChild(card);
  card.setConfig(config);
  card.hass = hass;
  return card;
};

test("template dependencies are inferred or declared and avoid unrelated reevaluation", () => {
  const inferred = getTemplateEntityDependencies({
    type: "template",
    content: "${entity('sensor.temperature')?.state}",
    state: '${hass.states["binary_sensor.window"]?.state}',
    color: "${attr('light.ceiling', 'rgb_color')}"
  });
  assert.deepEqual(inferred.sort(), ["binary_sensor.window", "light.ceiling", "sensor.temperature"]);
  assert.deepEqual(getTemplateEntityDependencies({ template_entities: "sensor.one, sensor.two" }), ["sensor.one", "sensor.two"]);
  assert.equal(templateNeedsEveryHassUpdate({ content: "Static text" }), false);
  assert.equal(templateNeedsEveryHassUpdate({ content: "${Date.now()}" }), true);

  window.__templateEvalCount = 0;
  const config = {
    controls: [{
      type: "template",
      content: '${(window.__templateEvalCount += 1, Number(entity("sensor.dependency")?.state) > 0 ? "Positive" : "Negative")}'
    }]
  };
  const card = createRenderedCard(config, createHass({
    states: { "sensor.dependency": { state: "1", attributes: {} } }
  }));
  const initialName = card.shadowRoot.querySelector(".btn-name");
  const initialEvaluations = window.__templateEvalCount;

  card.hass = createHass({
    states: {
      "sensor.dependency": { state: "1", attributes: {} },
      "sensor.unrelated": { state: "changed", attributes: {} }
    }
  });
  assert.equal(window.__templateEvalCount, initialEvaluations);

  card.hass = createHass({ states: { "sensor.dependency": { state: "2", attributes: {} } } });
  assert.equal(window.__templateEvalCount, initialEvaluations + 1);
  assert.equal(card.shadowRoot.querySelector(".btn-name"), initialName);

  card.hass = createHass({ states: { "sensor.dependency": { state: "-1", attributes: {} } } });
  assert.equal(card.shadowRoot.querySelector(".btn-name").textContent, "Negative");
  assert.notEqual(card.shadowRoot.querySelector(".btn-name"), initialName);
  card.remove();
  delete window.__templateEvalCount;
});

test("template dependencies react to arbitrary attribute changes", () => {
  const config = {
    controls: [
      {
        type: "template",
        content: '${attr("weather.home", "forecast")?.[0]?.condition}'
      },
      {
        type: "template",
        weather_entity: "weather.remote",
        content: '${attr(ctrl.weather_entity, "forecast")?.[0]?.condition}',
        template_entities: ["weather.remote"]
      }
    ]
  };
  const card = createRenderedCard(config, createHass({
    states: {
      "weather.home": {
        state: "sunny",
        attributes: { forecast: [{ condition: "sunny" }] }
      },
      "weather.remote": {
        state: "cloudy",
        attributes: { forecast: [{ condition: "cloudy" }] }
      }
    }
  }));
  assert.deepEqual(
    Array.from(card.shadowRoot.querySelectorAll(".btn-name"), (element) => element.textContent),
    ["sunny", "cloudy"]
  );

  card.hass = createHass({
    states: {
      "weather.home": {
        state: "sunny",
        attributes: { forecast: [{ condition: "rainy" }] }
      },
      "weather.remote": {
        state: "cloudy",
        attributes: { forecast: [{ condition: "snowy" }] }
      }
    }
  });
  assert.deepEqual(
    Array.from(card.shadowRoot.querySelectorAll(".btn-name"), (element) => element.textContent),
    ["rainy", "snowy"]
  );
  card.remove();
});

test("template controls refresh sub-chips even when template output is unchanged", () => {
  const config = {
    controls: [{
      type: "template",
      content: "Static",
      sub_chips: [{ entity: "sensor.sub_chip", attribute: "custom_status", label: "Value {state}" }]
    }]
  };
  const card = createRenderedCard(config, createHass({
    states: { "sensor.sub_chip": { state: "unchanged", attributes: { custom_status: "one" } } }
  }));
  assert.equal(card.shadowRoot.querySelector(".btn-chip span").textContent, "Value one");

  card.hass = createHass({
    states: { "sensor.sub_chip": { state: "unchanged", attributes: { custom_status: "two" } } }
  });
  assert.equal(card.shadowRoot.querySelector(".btn-chip span").textContent, "Value two");
  card.remove();
});

test("multiple cards share concurrent sparkline history requests", async () => {
  SHARED_SPARKLINE_CACHE.clear();
  SHARED_SPARKLINE_PENDING.clear();
  let historyCalls = 0;
  const entity = "sensor.shared_history";
  const hass = createHass({
    states: { [entity]: { state: "2", attributes: {} } },
    callWS: async () => {
      historyCalls += 1;
      await wait(5);
      return {
        [entity]: [
          { state: "1", last_changed: "2026-08-20T12:00:00Z" },
          { state: "2", last_changed: "2026-08-20T13:00:00Z" }
        ]
      };
    }
  });
  const config = { controls: [{ entity, show_sparkline: true, sparkline_hours: 24 }] };
  const first = createRenderedCard(config, hass);
  const second = createRenderedCard(config, hass);

  await wait(20);
  assert.equal(historyCalls, 1);
  assert.equal(first._sparklineCache.get(`${entity}|24`).samples.length, 2);
  assert.equal(second._sparklineCache.get(`${entity}|24`).samples.length, 2);
  first.remove();
  second.remove();
});

test("off-screen cards pause polling, refresh stale data on return, and clean observers", async () => {
  SHARED_SPARKLINE_CACHE.clear();
  SHARED_SPARKLINE_PENDING.clear();
  const observers = [];
  const previousObserver = globalThis.IntersectionObserver;
  class FakeIntersectionObserver {
    constructor(callback) { this.callback = callback; this.disconnected = false; observers.push(this); }
    observe(target) { this.target = target; }
    disconnect() { this.disconnected = true; }
    trigger(isIntersecting) {
      this.callback([{ target: this.target, isIntersecting, intersectionRatio: isIntersecting ? 1 : 0 }]);
    }
  }
  globalThis.IntersectionObserver = FakeIntersectionObserver;
  let historyCalls = 0;
  const entity = "sensor.offscreen_history";
  const hass = createHass({
    states: { [entity]: { state: "1", attributes: {} } },
    callWS: async () => {
      historyCalls += 1;
      return { [entity]: [{ state: "1", last_changed: "2026-08-20T12:00:00Z" }] };
    }
  });

  try {
    const card = createRenderedCard({ controls: [{ entity, show_sparkline: true }] }, hass);
    const observer = observers.at(-1);
    assert.ok(observer);
    assert.equal(historyCalls, 0);
    assert.equal(card._sparklineInterval, null);

    observer.trigger(true);
    await wait(5);
    assert.equal(historyCalls, 1);
    assert.ok(card._sparklineInterval);

    observer.trigger(false);
    assert.equal(card._sparklineInterval, null);
    SHARED_SPARKLINE_CACHE.get(`${entity}|24`).fetchedAt = 0;
    observer.trigger(true);
    await wait(5);
    assert.equal(historyCalls, 2);

    card.remove();
    assert.equal(observer.disconnected, true);
    assert.equal(card._sparklineInterval, null);
  } finally {
    globalThis.IntersectionObserver = previousObserver;
  }
});

test("the shared sparkline cache remains bounded", () => {
  SHARED_SPARKLINE_CACHE.clear();
  const now = Date.now();
  for (let index = 0; index < 105; index += 1) {
    SHARED_SPARKLINE_CACHE.set(`sensor.${index}|24`, { data: [], fetchedAt: now, lastAccess: now });
  }
  pruneSharedSparklineCache(now);
  assert.equal(SHARED_SPARKLINE_CACHE.size, 100);
});
