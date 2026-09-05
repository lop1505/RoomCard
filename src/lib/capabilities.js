const MEDIA_PLAYER_FEATURES = Object.freeze({
  PAUSE: 1,
  VOLUME_SET: 4,
  VOLUME_MUTE: 8,
  PREVIOUS_TRACK: 16,
  NEXT_TRACK: 32,
  PLAY: 16384
});

const getSliderCapabilities = (domain, st, ctrl, unavailable) => {
  let supported = false, min = 0, max = 100, step = 1, value = 0, pct = 0, action = null;
  if (!st || unavailable) return { supported };

  if (domain === "light") {
    const supp = st.attributes?.supported_color_modes || [];
    const hasColorTemp = supp.includes("color_temp") || st.attributes?.color_temp !== undefined || st.attributes?.color_temp_kelvin !== undefined;
    const isColorTemp = ctrl.slider_mode === "color_temp" && hasColorTemp;
    supported = true;
    if (isColorTemp) {
      if (st.attributes?.min_color_temp_kelvin !== undefined) {
        min = st.attributes.min_color_temp_kelvin;
        max = st.attributes.max_color_temp_kelvin;
        value = st.attributes.color_temp_kelvin ?? min;
        action = "color_temp_kelvin";
      } else {
        min = st.attributes?.min_mireds ?? 153;
        max = st.attributes?.max_mireds ?? 500;
        value = st.attributes?.color_temp ?? min;
        action = "color_temp";
      }
    } else {
      value = st.attributes?.brightness != null ? Math.round((st.attributes.brightness / 255) * 100) : 0;
      min = 0; max = 100; step = 1;
      action = "brightness";
    }
  } else if (domain === "cover") {
    supported = true;
    value = st.attributes?.current_position ?? 0;
    action = "position";
  } else if (domain === "climate") {
    supported = true;
    min = st.attributes?.min_temp ?? 5;
    max = st.attributes?.max_temp ?? 35;
    step = 0.5;
    value = st.attributes?.temperature ?? min;
    action = "temperature";
  } else if (domain === "fan") {
    supported = true;
    step = parseInt(st.attributes?.percentage_step ?? 1);
    value = st.attributes?.percentage ?? 0;
    action = "percentage";
  } else if (domain === "media_player") {
    supported = true;
    value = st.attributes?.volume_level != null ? Math.round(st.attributes.volume_level * 100) : 0;
    action = "volume_level";
  } else if (domain === "number" || domain === "input_number") {
    supported = true;
    min = parseFloat(st.attributes?.min ?? 0);
    max = parseFloat(st.attributes?.max ?? 100);
    step = parseFloat(st.attributes?.step ?? 1);
    value = parseFloat(st.state) || min;
    action = "value";
  }
  pct = ((Math.max(min, Math.min(max, value)) - min) / (max - min)) * 100;
  return { supported, min, max, step, value, pct, action };
};

const getInlineButtons = (domain) => {
  if (domain === "cover") return [
    { icon: "mdi:arrow-up-bold", action: "service", service: "cover.open_cover" },
    { icon: "mdi:stop", action: "service", service: "cover.stop_cover" },
    { icon: "mdi:arrow-down-bold", action: "service", service: "cover.close_cover" }
  ];
  if (domain === "climate") return [
    { icon: "mdi:minus", action: "custom", custom: "temp_down" },
    { icon: "mdi:power", action: "custom", custom: "toggle_hvac" },
    { icon: "mdi:plus", action: "custom", custom: "temp_up" }
  ];
  if (domain === "light") return [
    { icon: "mdi:brightness-5", action: "custom", custom: "dim_down" },
    { icon: "mdi:power", action: "service", service: "light.toggle" },
    { icon: "mdi:brightness-7", action: "custom", custom: "dim_up" }
  ];
  if (domain === "fan") return [
    { icon: "mdi:minus", action: "service", service: "fan.decrease_speed" },
    { icon: "mdi:power", action: "service", service: "fan.toggle" },
    { icon: "mdi:plus", action: "service", service: "fan.increase_speed" }
  ];
  if (domain === "media_player") return [
    { icon: "mdi:skip-previous", action: "service", service: "media_player.media_previous_track" },
    { icon: "mdi:play-pause", action: "service", service: "media_player.media_play_pause" },
    { icon: "mdi:skip-next", action: "service", service: "media_player.media_next_track" }
  ];
  if (domain === "select" || domain === "input_select") return [
    { icon: "mdi:chevron-left", action: "custom", custom: "select_prev" },
    { icon: "mdi:chevron-right", action: "custom", custom: "select_next" }
  ];
  return [];
};

const supportsMediaFeature = (stateObj, feature) => {
  const supported = stateObj?.attributes?.supported_features;
  if (!Number.isFinite(Number(supported))) return true;
  return (Number(supported) & feature) !== 0;
};

export { MEDIA_PLAYER_FEATURES, getSliderCapabilities, getInlineButtons, supportsMediaFeature };
