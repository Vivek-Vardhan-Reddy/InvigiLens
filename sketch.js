let video;
let facemesh;
let predictions = [];
let alertCount = 0;
let modelReady = false;
let sessionStartedAt = null;

const DETECTION_POLICY = {
    sampleIntervalMs: 1000,
    debounceSamples: 3,
    headPoseLimitDeg: 30,
    minEyeDistancePx: 100,
    closedEyeLimitPx: 5,
    maxEventsVisible: 5
};

const landmarkMap = {
    leftEye: [33, 160, 159, 158, 133, 153, 145, 144],
    rightEye: [263, 387, 386, 385, 362, 380, 374, 373],
    leftOuterEye: 33,
    rightOuterEye: 263,
    leftEyeUpper: 159,
    leftEyeLower: 145,
    rightEyeUpper: 386,
    rightEyeLower: 374,
    noseTip: 4
};

const violationTimers = {
    multipleFaces: 0,
    lookingAway: 0,
    eyesClosed: 0,
    noFace: 0
};

const telemetry = {
    faces: 0,
    faceAngle: null,
    eyeOpenness: null,
    eyeDistance: null,
    attentionState: "Calibrating",
    risk: "pending"
};

const performanceMetrics = {
    totalFrames: 0,
    faceDetectedFrames: 0,
    warningEvents: 0,
    criticalEvents: 0,
    riskScore: 0
};

const ui = {};

function setup() {
    const canvas = createCanvas(640, 480);
    canvas.parent("canvas-container");

    cacheUiElements();
    setSessionState("Initializing vision model", false);

    video = createCapture(VIDEO, () => {
        ui.cameraState.textContent = "Active";
    });
    video.size(640, 480);
    video.hide();

    facemesh = ml5.facemesh(video, modelLoaded);
    facemesh.on("face", results => {
        predictions = results;
    });

    setInterval(checkSessionIntegrity, DETECTION_POLICY.sampleIntervalMs);
}

function modelLoaded() {
    modelReady = true;
    sessionStartedAt = Date.now();
    ui.modelState.textContent = "Facemesh ready";
    setSessionState("Monitoring active", true);
    registerEvent("Vision model loaded. Monitoring session started.", "info");
}

function draw() {
    background(16, 24, 40);
    image(video, 0, 0, width, height);
    drawOverlayFrame();

    if (predictions.length > 0 && predictions[0].scaledMesh) {
        trackFramePerformance(true);
        const metrics = calculateFaceMetrics(predictions[0].scaledMesh);
        Object.assign(telemetry, metrics, {
            faces: predictions.length,
            attentionState: getAttentionState(metrics)
        });

        drawFaceTelemetry(predictions[0].scaledMesh, metrics);
    } else {
        trackFramePerformance(false);
        Object.assign(telemetry, {
            faces: predictions.length,
            faceAngle: null,
            eyeOpenness: null,
            eyeDistance: null,
            attentionState: predictions.length > 1 ? "Multiple faces" : "No face detected"
        });
    }

    updateDashboard();
}

function cacheUiElements() {
    ui.warning = document.getElementById("warning");
    ui.sessionDot = document.getElementById("session-dot");
    ui.sessionStatus = document.getElementById("session-status");
    ui.riskLevel = document.getElementById("risk-level");
    ui.faceCount = document.getElementById("face-count");
    ui.faceAngle = document.getElementById("face-angle");
    ui.eyeOpenness = document.getElementById("eye-openness");
    ui.alertCount = document.getElementById("alert-count");
    ui.modelState = document.getElementById("model-state");
    ui.cameraState = document.getElementById("camera-state");
    ui.attentionState = document.getElementById("attention-state");
    ui.runtimeMetric = document.getElementById("runtime-metric");
    ui.fpsMetric = document.getElementById("fps-metric");
    ui.coverageMetric = document.getElementById("coverage-metric");
    ui.alertRateMetric = document.getElementById("alert-rate-metric");
    ui.riskScoreMetric = document.getElementById("risk-score-metric");
    ui.criticalEventsMetric = document.getElementById("critical-events-metric");
    ui.eventLog = document.getElementById("event-log");
}

function setSessionState(label, active) {
    ui.sessionStatus.textContent = label;
    ui.sessionDot.classList.toggle("active", active);
}

function calculateFaceMetrics(keypoints) {
    const [lx, ly] = keypoints[landmarkMap.leftOuterEye];
    const [rx, ry] = keypoints[landmarkMap.rightOuterEye];
    const [nx, ny] = keypoints[landmarkMap.noseTip];
    const [lxu, lyu] = keypoints[landmarkMap.leftEyeUpper];
    const [lxd, lyd] = keypoints[landmarkMap.leftEyeLower];
    const [rxu, ryu] = keypoints[landmarkMap.rightEyeUpper];
    const [rxd, ryd] = keypoints[landmarkMap.rightEyeLower];

    const eyeDistance = dist(lx, ly, rx, ry);
    const leftEyeOpenness = dist(lxu, lyu, lxd, lyd);
    const rightEyeOpenness = dist(rxu, ryu, rxd, ryd);

    return {
        eyeDistance,
        eyeOpenness: (leftEyeOpenness + rightEyeOpenness) / 2,
        faceAngle: calculateFaceAngle(lx, ly, rx, ry, nx, ny)
    };
}

function getAttentionState(metrics) {
    if (Math.abs(metrics.faceAngle) > DETECTION_POLICY.headPoseLimitDeg) {
        return "Head pose deviation";
    }

    if (metrics.eyeDistance < DETECTION_POLICY.minEyeDistancePx) {
        return "Face alignment low";
    }

    if (metrics.eyeOpenness < DETECTION_POLICY.closedEyeLimitPx) {
        return "Eye closure detected";
    }

    return "Focused";
}

function drawFaceTelemetry(keypoints, metrics) {
    drawEyeContour(keypoints, landmarkMap.leftEye);
    drawEyeContour(keypoints, landmarkMap.rightEye);

    const [lx, ly] = keypoints[landmarkMap.leftOuterEye];
    const [rx, ry] = keypoints[landmarkMap.rightOuterEye];
    const [nx, ny] = keypoints[landmarkMap.noseTip];
    const [lxu, lyu] = keypoints[landmarkMap.leftEyeUpper];
    const [lxd, lyd] = keypoints[landmarkMap.leftEyeLower];
    const [rxu, ryu] = keypoints[landmarkMap.rightEyeUpper];
    const [rxd, ryd] = keypoints[landmarkMap.rightEyeLower];

    stroke(44, 255, 158);
    strokeWeight(1.4);
    line(lx, ly, rx, ry);
    line((lx + rx) / 2, (ly + ry) / 2, nx, ny);

    stroke(255, 193, 7);
    line(lxu, lyu, lxd, lyd);
    line(rxu, ryu, rxd, ryd);

    noStroke();
    fill(255);
    textSize(13);
    text(`Head pose: ${metrics.faceAngle.toFixed(1)} deg`, 18, 28);
    text(`Eye signal: ${metrics.eyeOpenness.toFixed(1)} px`, 18, 48);
}

function drawEyeContour(keypoints, indices) {
    noFill();
    stroke(63, 213, 255);
    strokeWeight(1.2);
    beginShape();
    indices.forEach(index => {
        const [x, y] = keypoints[index];
        vertex(x, y);
    });
    endShape(CLOSE);
}

function drawOverlayFrame() {
    noFill();
    stroke(255, 255, 255, 46);
    strokeWeight(1);
    rect(12, 12, width - 24, height - 24, 8);
}

function calculateFaceAngle(lx, ly, rx, ry, nx, ny) {
    const eyeMidX = (lx + rx) / 2;
    const eyeMidY = (ly + ry) / 2;
    const vecX = nx - eyeMidX;
    const vecY = ny - eyeMidY;
    let angle = atan2(vecY, vecX) * 180 / PI - 90;

    if (angle < -90) angle += 180;
    if (angle > 90) angle -= 180;

    return angle;
}

function checkSessionIntegrity() {
    if (!modelReady) {
        return;
    }

    const hasFace = predictions.length > 0 && predictions[0].scaledMesh;
    let activeRisk = alertCount >= 3 ? "critical" : "safe";

    if (predictions.length > 1) {
        activeRisk = "critical";
        advanceViolation("multipleFaces", "Multiple faces detected", "critical");
    } else {
        resetViolation("multipleFaces");
    }

    if (hasFace) {
        resetViolation("noFace");
        const metrics = calculateFaceMetrics(predictions[0].scaledMesh);
        const lookingAway = Math.abs(metrics.faceAngle) > DETECTION_POLICY.headPoseLimitDeg ||
            metrics.eyeDistance < DETECTION_POLICY.minEyeDistancePx;
        const eyesClosed = metrics.eyeOpenness < DETECTION_POLICY.closedEyeLimitPx;

        if (lookingAway) {
            activeRisk = activeRisk === "critical" ? activeRisk : "warn";
            advanceViolation("lookingAway", "Candidate is looking away from the screen", "warning");
        } else {
            resetViolation("lookingAway");
        }

        if (eyesClosed) {
            activeRisk = activeRisk === "critical" ? activeRisk : "warn";
            advanceViolation("eyesClosed", "Eyes closed beyond accepted threshold", "warning");
        } else {
            resetViolation("eyesClosed");
        }
    } else {
        activeRisk = activeRisk === "critical" ? activeRisk : "warn";
        advanceViolation("noFace", "No candidate face detected in the camera frame", "warning");
        resetViolation("lookingAway");
        resetViolation("eyesClosed");
    }

    updateRisk(activeRisk);
}

function trackFramePerformance(faceDetected) {
    if (!modelReady) {
        return;
    }

    performanceMetrics.totalFrames += 1;

    if (faceDetected) {
        performanceMetrics.faceDetectedFrames += 1;
    }
}

function advanceViolation(key, message, severity) {
    violationTimers[key] += 1;

    if (violationTimers[key] >= DETECTION_POLICY.debounceSamples) {
        alertCount += 1;
        showWarning(message);
        registerEvent(message, severity);
        updateRisk(severity === "critical" || alertCount >= 3 ? "critical" : "warn");
        violationTimers[key] = 0;
    }
}

function resetViolation(key) {
    violationTimers[key] = 0;
}

function updateDashboard() {
    ui.faceCount.textContent = telemetry.faces;
    ui.faceAngle.textContent = telemetry.faceAngle === null ? "--" : `${telemetry.faceAngle.toFixed(1)} deg`;
    ui.eyeOpenness.textContent = telemetry.eyeOpenness === null ? "--" : `${telemetry.eyeOpenness.toFixed(1)} px`;
    ui.alertCount.textContent = alertCount;
    ui.attentionState.textContent = telemetry.attentionState;
    updatePerformanceMetrics();
}

function updatePerformanceMetrics() {
    const runtimeSeconds = getRuntimeSeconds();
    const runtimeMinutes = Math.max(runtimeSeconds / 60, 1 / 60);
    const coverage = performanceMetrics.totalFrames === 0
        ? 0
        : (performanceMetrics.faceDetectedFrames / performanceMetrics.totalFrames) * 100;
    const alertRate = alertCount / runtimeMinutes;

    performanceMetrics.riskScore = calculateRiskScore(coverage, alertRate);

    ui.runtimeMetric.textContent = formatDuration(runtimeSeconds);
    ui.fpsMetric.textContent = modelReady ? frameRate().toFixed(1) : "--";
    ui.coverageMetric.textContent = performanceMetrics.totalFrames === 0 ? "--" : `${coverage.toFixed(1)}%`;
    ui.alertRateMetric.textContent = `${alertRate.toFixed(1)}/min`;
    ui.riskScoreMetric.textContent = `${performanceMetrics.riskScore}/100`;
    ui.criticalEventsMetric.textContent = performanceMetrics.criticalEvents;
}

function calculateRiskScore(coverage, alertRate) {
    const alertPenalty = Math.min(alertCount * 12, 48);
    const criticalPenalty = Math.min(performanceMetrics.criticalEvents * 20, 40);
    const coveragePenalty = Math.max(0, 95 - coverage) * 0.8;
    const ratePenalty = Math.min(alertRate * 8, 28);

    return Math.round(Math.min(100, alertPenalty + criticalPenalty + coveragePenalty + ratePenalty));
}

function getRuntimeSeconds() {
    if (!sessionStartedAt) {
        return 0;
    }

    return Math.floor((Date.now() - sessionStartedAt) / 1000);
}

function formatDuration(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, "0");

    return `${minutes}:${seconds}`;
}

function updateRisk(risk) {
    telemetry.risk = risk;
    ui.riskLevel.className = `risk-pill ${risk}`;
    ui.riskLevel.textContent = risk === "safe" ? "Normal" : risk === "warn" ? "Review" : "Critical";
}

function showWarning(message) {
    ui.warning.textContent = message;
    ui.warning.classList.add("visible");

    window.clearTimeout(ui.warning.hideTimer);
    ui.warning.hideTimer = window.setTimeout(() => {
        ui.warning.classList.remove("visible");
    }, 3600);
}

function registerEvent(message, severity = "info") {
    if (severity === "warning") {
        performanceMetrics.warningEvents += 1;
    }

    if (severity === "critical") {
        performanceMetrics.criticalEvents += 1;
    }

    const emptyState = ui.eventLog.querySelector(".empty-state");
    if (emptyState) {
        emptyState.remove();
    }

    const eventItem = document.createElement("div");
    eventItem.className = `event-item ${severity}`;
    eventItem.innerHTML = `<span class="event-time">${new Date().toLocaleTimeString()}</span>${message}`;
    ui.eventLog.prepend(eventItem);

    const events = ui.eventLog.querySelectorAll(".event-item");
    events.forEach((event, index) => {
        if (index >= DETECTION_POLICY.maxEventsVisible) {
            event.remove();
        }
    });
}

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        alertCount += 1;
        showWarning("Browser tab switch detected");
        registerEvent("Browser tab switch detected", "critical");
        updateRisk("critical");
    }
});
