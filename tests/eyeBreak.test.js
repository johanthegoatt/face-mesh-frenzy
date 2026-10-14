import test from "node:test";
import assert from "node:assert/strict";
import { createEyeBreak, stepEyeBreak } from "../src/eyeBreak.js";
import { PHASES, createFocusState, stepFocusState } from "../src/focusStateMachine.js";

function run(state, steps, input) {
  let events = [];
  for (let i = 0; i < steps; i += 1) {
    const next = stepEyeBreak(state, input);
    state = next.state;
    if (next.event) events.push(next.event);
  }
  return { state, events };
}

test("a break starts after 20 focused minutes and lasts 20 seconds", () => {
  let { state, events } = run(createEyeBreak(), 1200, { dtMs: 1000, focused: true });
  assert.deepEqual(events, ["break_started"]);
  assert.equal(state.phase, "break");
  ({ state, events } = run(state, 20, { dtMs: 1000 }));
  assert.deepEqual(events, ["break_ended"]);
  assert.equal(state.phase, "work");
});

test("time spent drifting does not count towards the next break", () => {
  const { state } = run(createEyeBreak(), 1500, { dtMs: 1000, focused: false });
  assert.equal(state.phase, "work");
  assert.equal(state.workedMs, 0);
});

test("a break can be started early", () => {
  const next = stepEyeBreak(createEyeBreak(), { dtMs: 16, request: true });
  assert.equal(next.event, "break_started");
  assert.equal(next.state.remainingMs, 20000);
});

test("looking away during a break never opens the redirect", () => {
  let state = createFocusState();
  state.calibration.complete = true;
  const away = { facePresent: true, torsoPresent: true, lookAway: true, phoneLikeDown: false, leftSeatLike: false };
  let nowMs = 0;
  for (let i = 0; i < 300; i += 1) {
    nowMs += 100;
    const next = stepFocusState(state, { nowMs, dtMs: 100, signals: away, paused: true });
    state = next.state;
    assert.equal(next.action, null);
  }
  assert.equal(state.phase, PHASES.PAUSED);
  assert.equal(state.offFocusMs, 0);
});
