<div align="center">

  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=28&duration=3000&pause=1000&color=0F62FE&center=true&vCenter=true&width=560&lines=InvigiLens;AI+Exam+Proctoring+System;Real-Time+Integrity+Monitoring" alt="InvigiLens animated title" />

  <p align="center">
    <strong>AI-assisted proctoring telemetry for live attention and session integrity monitoring.</strong>
  </p>

  <p>
    <img src="https://img.shields.io/badge/p5.js-ED225D?style=for-the-badge&logo=p5.js&logoColor=white" alt="p5.js" />
    <img src="https://img.shields.io/badge/ml5.js-1A4D8C?style=for-the-badge&logoColor=white" alt="ml5.js" />
    <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
    <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
    <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" />
    <img src="https://img.shields.io/badge/Facemesh-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Facemesh" />
  </p>

  <img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="80%" alt="divider" />

</div>

<br>

## Table Of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [How It Works](#how-it-works)
- [Detection Parameters](#detection-parameters)
- [Performance Metrics](#performance-metrics)
- [Risk Score Formula](#risk-score-formula)
- [Usage Guide](#usage-guide)
- [Limitations](#limitations)
- [Future Enhancements](#future-enhancements)

---

## Overview

**InvigiLens** is a browser-based AI exam proctoring prototype that uses webcam-based facial landmark detection to monitor candidate presence, head movement, eye activity, browser tab switching, and live session risk.

The project runs fully in the browser using **p5.js** for webcam rendering and **ml5.js Facemesh** for face landmark tracking.

---

## Features

### Face Detection And Tracking

| Feature | Description |
| --- | --- |
| Multi-face detection | Alerts when more than one face is detected in the camera frame |
| Candidate presence monitoring | Detects when no face is visible after monitoring begins |
| Face orientation tracking | Estimates head-pose deviation using eye and nose landmarks |
| Facial landmark visualization | Draws eye contours, eye-distance lines, and nose orientation lines |

### Eye And Attention Analysis

| Feature | Description |
| --- | --- |
| Eye openness calculation | Measures vertical eye distance to detect prolonged closure |
| Face alignment signal | Uses eye distance as a proxy for camera alignment and face proximity |
| Attention state | Displays whether the candidate is focused, looking away, or missing |
| Configurable thresholds | Detection limits are centralized in `DETECTION_POLICY` |

### Integrity Monitoring

| Feature | Description |
| --- | --- |
| Tab-switch detection | Records a critical event when the browser tab becomes hidden |
| Looking-away detection | Flags head-pose deviation above the configured angle threshold |
| Eye-closure detection | Warns when both eyes remain below the openness threshold |
| Debounced alerts | Requires repeated samples before logging most warnings |
| Event timeline | Shows recent monitoring events in the dashboard |

### Real-Time Dashboard

| Feature | Description |
| --- | --- |
| Live camera feed | Displays webcam video with visual telemetry overlays |
| System health panel | Shows model, camera, and attention status |
| Risk badge | Displays Normal, Review, or Critical session state |
| Performance metrics | Calculates runtime, FPS, face coverage, alert rate, and risk score |

---

## Technology Stack

| Technology | Purpose |
| --- | --- |
| HTML5 | Application structure |
| CSS3 | Professional responsive dashboard styling |
| JavaScript | Monitoring logic and browser events |
| p5.js | Webcam capture and canvas rendering |
| ml5.js Facemesh | Browser-side face landmark detection |

---

## Project Structure

```text
InvigiLens/
|-- index.html   # Dashboard layout, styling, and CDN dependencies
|-- sketch.js    # Vision pipeline, telemetry calculations, and alert policy
`-- README.md    # Project documentation
```

---

## Installation

Clone or download the project, then open the folder.

For best results, serve it using a local static server.

### Windows

```powershell
py -m http.server 8000
```

### macOS Or Linux

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

Allow camera access when the browser asks for permission.

---

## How It Works

1. The browser captures the webcam stream using p5.js.
2. ml5.js Facemesh detects facial landmarks from the video.
3. InvigiLens extracts eye, nose, and face geometry signals.
4. The system calculates head pose, eye openness, face count, and face coverage.
5. Alerts are debounced to reduce false positives.
6. The dashboard updates telemetry, events, and risk metrics in real time.

---

## Detection Parameters

The main detection thresholds are defined in `sketch.js`.

| Parameter | Default | Meaning |
| --- | ---: | --- |
| `sampleIntervalMs` | `1000` | Integrity checks run once per second |
| `debounceSamples` | `3` | Number of repeated samples required before warning |
| `headPoseLimitDeg` | `30` | Maximum allowed head-pose deviation |
| `minEyeDistancePx` | `100` | Minimum eye distance before face alignment is considered low |
| `closedEyeLimitPx` | `5` | Eye openness threshold for closed-eye detection |
| `maxEventsVisible` | `5` | Number of recent events shown in the timeline |

---

## Performance Metrics

InvigiLens calculates live performance metrics during each monitoring session.

| Metric | Calculation | Purpose |
| --- | --- | --- |
| Runtime | `current time - monitoring start time` | Measures active session duration |
| FPS | p5.js `frameRate()` | Shows rendering and processing responsiveness |
| Face Coverage | `(face detected frames / total monitored frames) * 100` | Shows how consistently the candidate is visible |
| Alert Rate | `total alerts / runtime minutes` | Measures violation frequency |
| Critical Events | Count of critical events | Tracks high-risk anomalies |
| Risk Score | Weighted score from alerts, critical events, coverage, and alert rate | Produces a `0-100` session risk indicator |

---

## Risk Score Formula

```text
riskScore = min(
  100,
  alertCountPenalty + criticalEventPenalty + faceCoveragePenalty + alertRatePenalty
)
```

Where:

| Component | Formula |
| --- | --- |
| Alert count penalty | `min(totalAlerts * 12, 48)` |
| Critical event penalty | `min(criticalEvents * 20, 40)` |
| Face coverage penalty | `max(0, 95 - faceCoveragePercent) * 0.8` |
| Alert rate penalty | `min(alertsPerMinute * 8, 28)` |

### Example Calculation

```text
totalAlerts = 2
criticalEvents = 1
faceCoveragePercent = 88
alertsPerMinute = 1.5

alertCountPenalty = min(2 * 12, 48) = 24
criticalEventPenalty = min(1 * 20, 40) = 20
faceCoveragePenalty = max(0, 95 - 88) * 0.8 = 5.6
alertRatePenalty = min(1.5 * 8, 28) = 12

riskScore = min(100, 24 + 20 + 5.6 + 12)
riskScore = 62
```

---

## Usage Guide

1. Start the local server.
2. Open `http://localhost:8000`.
3. Allow webcam permission.
4. Keep the candidate face centered in the camera frame.
5. Watch the dashboard for live telemetry and event alerts.
6. Review risk score, alert rate, face coverage, and event timeline.

---

## Limitations

- This is a technical prototype, not a production proctoring system.
- Lighting, camera angle, hardware quality, and network-loaded CDN models may affect accuracy.
- Face geometry heuristics can produce false positives.
- The system does not verify candidate identity.
- It does not store evidence, session recordings, or audit logs.
- High-stakes use requires consent, privacy controls, accessibility review, bias testing, and human review.

---

## Future Enhancements

- Candidate identity verification
- Secure exam session backend
- Persistent event logs
- Screenshot or video evidence capture with consent
- Calibration step before the exam begins
- Configurable instructor dashboard
- Model confidence scoring
- Exportable proctoring report

---

<div align="center">

  <strong>InvigiLens</strong>
  <br>
  AI-assisted monitoring for modern digital assessments.

</div>
