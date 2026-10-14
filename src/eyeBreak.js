// 20-20-20 eye breaks. The American Academy of Ophthalmology's advice for
// screen work is to look at something about 20 feet away for 20 seconds
// every 20 minutes. Without this, the monitor punished exactly that: a
// long look away from the screen counted as drifting off and opened the
// redirect. During a break the focus machine is paused.
export const DEFAULT_EYE_BREAK = {
  everyMs: 20 * 60 * 1000,
  lengthMs: 20 * 1000,
};

export function createEyeBreak() {
  return { phase: "work", workedMs: 0, remainingMs: 0 };
}

// Only time spent focused counts towards the next break, so a session that
// keeps drifting doesn't earn one early. `request` starts a break now.
export function stepEyeBreak(prev, { dtMs = 0, focused = false, request = false } = {}, config = DEFAULT_EYE_BREAK) {
  const cfg = { ...DEFAULT_EYE_BREAK, ...(config || {}) };
  const dt = Math.max(0, Math.min(1000, Number(dtMs) || 0));
  const state = { ...createEyeBreak(), ...(prev || {}) };
  let event = null;

  if (state.phase === "work") {
    if (focused) state.workedMs += dt;
    if (request || state.workedMs >= cfg.everyMs) {
      state.phase = "break";
      state.remainingMs = cfg.lengthMs;
      state.workedMs = 0;
      event = "break_started";
    }
  } else {
    state.remainingMs = Math.max(0, state.remainingMs - dt);
    if (state.remainingMs === 0) {
      state.phase = "work";
      event = "break_ended";
    }
  }

  return { state, event };
}
