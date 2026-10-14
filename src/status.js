// What the window shows about the monitor's state. The app used to show
// only the camera, so nobody could tell whether it was still calibrating,
// how close it was to redirecting, or that a break was running: visibility
// of system status is the first of Nielsen's usability heuristics.

// Source rectangle that crops a video to fill a box without stretching,
// like CSS object-fit: cover. The canvas drew the frame stretched to the
// window, so faces looked squashed on wide or tall windows.
export function coverRect(srcW, srcH, boxW, boxH) {
  if (!(srcW > 0 && srcH > 0 && boxW > 0 && boxH > 0)) return { sx: 0, sy: 0, sw: srcW || 0, sh: srcH || 0 };
  const scale = Math.max(boxW / srcW, boxH / srcH);
  const sw = boxW / scale;
  const sh = boxH / scale;
  return { sx: (srcW - sw) / 2, sy: (srcH - sh) / 2, sw, sh };
}

const REASONS = {
  look_away: "looking away",
  phone_like_down: "looking down at a phone",
  face_absent: "face out of view",
  torso_absent: "out of the chair",
  left_seat_like: "out of the chair",
  no_signal: "camera lost you",
};

export function statusLine({ machine, eyeBreak, openAfterMs = 8000 }) {
  const cal = machine?.calibration || {};
  if (!cal.complete) {
    const secs = Math.ceil((cal.remainingMs ?? 0) / 1000);
    return { tone: "info", text: secs > 0 ? `Sit as you study and look at the screen: ${secs}s` : "Hold still, nearly ready" };
  }
  if (eyeBreak?.phase === "break") {
    return { tone: "calm", text: `Eye break: look at something far away, ${Math.ceil(eyeBreak.remainingMs / 1000)}s` };
  }
  if (machine.redirectOpen) {
    return { tone: "alert", text: "Back to work to close the tab" };
  }
  if (machine.phase === "off_focus_pending" && machine.offFocusMs > 0) {
    const left = Math.max(0, Math.ceil((openAfterMs - machine.offFocusMs) / 1000));
    const why = REASONS[machine.lastReason] || "drifting";
    return { tone: "warn", text: `Drifting (${why}): ${left}s`, progress: Math.min(1, machine.offFocusMs / openAfterMs) };
  }
  const nextBreak = Math.max(0, Math.ceil((20 * 60 * 1000 - (eyeBreak?.workedMs || 0)) / 60000));
  return { tone: "ok", text: `Focused · eye break in ${nextBreak} min · B for one now` };
}
