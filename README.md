# Face Mesh Frenzy (Study Focus Redirector)

A desktop study monitor. It watches your head, eyes and posture through the webcam while you study, and if you keep drifting off (looking away, looking down at a phone, leaving the chair) it opens the McDonald's careers page in a window of its own. Get back to work for a few seconds and the window closes again.

## How it works

- **Tracking.** MediaPipe Face Landmarker (478 points, irises included) and Pose Landmarker run on every camera frame in the Electron window.
- **Signals.** Head yaw comes from the nose against the eye centres, gaze from each iris inside its eye corners, phone-like looking down from head pitch plus gaze plus torso drop, and leaving the seat from the face and torso disappearing or shrinking. Blinks are ignored: gaze only counts while the eyes are open.
- **Calibration.** For the first 5 seconds you sit as you normally study. Thresholds come from your own wobble (median absolute deviation), so a fidgety sitter isn't flagged for nothing.
- **Evidence, not single frames.** Drifting adds up over time (faster when you leave the chair than when you glance away) and fades when you come back. 8 seconds of evidence opens the redirect; 3 seconds of solid focus closes it.
- **Eye breaks.** Every 20 focused minutes you get 20 seconds to look at something far away, the American Academy of Ophthalmology's 20-20-20 rule. The monitor pauses while it runs, so a healthy break doesn't count as drifting. Press **B** to take one early.
- **Status.** A pill in the corner shows the calibration countdown, how close drifting is to the redirect (with a bar), the break timer, and when the next break is due. Screen readers hear the same.

## Run

```bash
npm install
npm start
```

Windows, macOS and Linux. The redirect opens in Chrome, Edge or Chromium as an app window; on Windows it is closed with `taskkill`, elsewhere with a SIGTERM. Without one of those browsers it falls back to your default browser.

## Test

```bash
npm test
```

Covers the signal maths, the focus state machine, eye breaks, the status line and the redirect controller.
