import test from "node:test";
import assert from "node:assert/strict";
import { coverRect, statusLine } from "../src/status.js";

test("cover crop keeps the aspect ratio and centres the frame", () => {
  // 16:9 camera in a square window: crop the sides.
  const r = coverRect(1280, 720, 800, 800);
  assert.equal(r.sh, 720);
  assert.equal(r.sw, 720);
  assert.equal(r.sx, 280);
  assert.equal(r.sy, 0);
  // Same shape: no crop.
  assert.deepEqual(coverRect(1280, 720, 640, 360), { sx: 0, sy: 0, sw: 1280, sh: 720 });
});

test("status says what is happening and how long is left", () => {
  const base = { calibration: { complete: true }, phase: "focused", offFocusMs: 0, redirectOpen: false };
  assert.match(statusLine({ machine: { calibration: { complete: false, remainingMs: 3200 } } }).text, /4s/);
  assert.equal(statusLine({ machine: base, eyeBreak: { phase: "work", workedMs: 0 } }).tone, "ok");
  const drift = statusLine({ machine: { ...base, phase: "off_focus_pending", offFocusMs: 6000, lastReason: "phone_like_down" } });
  assert.equal(drift.text, "Drifting (looking down at a phone): 2s");
  assert.equal(drift.progress, 0.75);
  assert.match(statusLine({ machine: base, eyeBreak: { phase: "break", remainingMs: 12500 } }).text, /13s/);
  assert.equal(statusLine({ machine: { ...base, redirectOpen: true } }).tone, "alert");
});
