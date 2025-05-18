let video;
let facemesh;
let predictions = [];
let warnings = 0;
let lookingAwayTimer = 0;
let eyesClosedTimer = 0;
let multipleFacesTimer = 0;

// Face landmark indices
const leftEyeIndices = [33, 160, 159, 158, 133, 153, 145, 144]; // More detailed left eye contour
const rightEyeIndices = [263, 387, 386, 385, 362, 380, 374, 373]; // More detailed right eye contour
const noseIndices = [4, 6, 168, 197]; // Nose tip and bridge points

function setup() {
    createCanvas(640, 480);

    // Create webcam capture
    video = createCapture(VIDEO);
    video.size(640, 480);
    video.hide();

    // Initialize Facemesh
    facemesh = ml5.facemesh(video, modelLoaded);
    facemesh.on("face", results => {
        predictions = results;
    });

    // Set up cheating detection intervals
    setInterval(checkForCheating, 1000);
    
    // Prevent right click
    // document.addEventListener('contextmenu', event => event.preventDefault());
}

function modelLoaded() {
    console.log("Facemesh Model Loaded!");
    document.getElementById('warning').textContent = "Camera monitoring started";
    setTimeout(() => {
        document.getElementById('warning').textContent = "";
    }, 2000);
}

function draw() {
    image(video, 0, 0, width, height);
    
    if (predictions.length > 0 && predictions[0].scaledMesh) {
        let keypoints = predictions[0].scaledMesh;
        
        // Draw eye contours
        drawEyeContour(keypoints, leftEyeIndices);
        drawEyeContour(keypoints, rightEyeIndices);
        
        // Get key eye points
        let [lx, ly] = keypoints[33];    // Left eye outer corner
        let [rx, ry] = keypoints[263];   // Right eye outer corner
        let [lxu, lyu] = keypoints[159]; // Left eye upper
        let [lxd, lyd] = keypoints[145]; // Left eye lower
        let [rxu, ryu] = keypoints[386]; // Right eye upper
        let [rxd, ryd] = keypoints[374]; // Right eye lower
        let [nx, ny] = keypoints[4];     // Nose tip
        
        // Calculate important metrics
        let outerDistance = dist(lx, ly, rx, ry);
        let leftEyeOpenness = dist(lxu, lyu, lxd, lyd);
        let rightEyeOpenness = dist(rxu, ryu, rxd, ryd);
        let avgEyeOpenness = (leftEyeOpenness + rightEyeOpenness) / 2;

        //calculate face angle
        let faceAngle = calculateFaceAngle(lx, ly, rx, ry, nx, ny);
        
        // Display stats
        let stats = `Faces Detected: ${predictions.length}<br>
                    Eye Distance: ${outerDistance.toFixed(1)}px<br>
                    Face Angle: ${faceAngle.toFixed(1)}°<br>
                    Eye Openness: ${avgEyeOpenness.toFixed(1)}px`;
        document.getElementById('stats').innerHTML = stats;
        
        // Visual indicators
        stroke(0, 255, 0);
        strokeWeight(0.6);
        line(lx, ly, rx, ry); // Line between eyes
        line((lx+rx)/2, (ly+ry)/2, nx, ny); // Nose line
        
        stroke(255, 0, 0);
        line(lxu, lyu, lxd, lyd); // Left eye vertical
        line(rxu, ryu, rxd, ryd); // Right eye vertical
    }
}

function drawEyeContour(keypoints, indices) {
    noFill();
    stroke(0, 255, 255);
    strokeWeight(0.6);
    beginShape();
    for (let i = 0; i < indices.length; i++) {
        let [x, y] = keypoints[indices[i]];
        vertex(x, y);
    }
    endShape(CLOSE);
}

function calculateFaceAngle(lx, ly, rx, ry, nx, ny) {
    // Calculate midpoint between eyes
    let eyeMidX = (lx + rx) / 2;
    let eyeMidY = (ly + ry) / 2;
    
    // Calculate vector from eye midpoint to nose
    let vecX = nx - eyeMidX;
    let vecY = ny - eyeMidY;
    
    // Calculate angle (in degrees)
    let angle = atan2(vecY, vecX) * 180 / PI;
    
    // Normalize angle to be between -90 and 90
    angle = angle - 90;
    if (angle < -90) angle += 180;
    if (angle > 90) angle -= 180;
    
    return angle;
}

function checkForCheating() {
    let warningElement = document.getElementById('warning');
    
    
    // Check for multiple faces
    if (predictions.length > 1) {
        multipleFacesTimer++;
        if (multipleFacesTimer > 2) { // Only warn after 3 seconds
            warningElement.textContent = "WARNING: Multiple faces detected!";
            warnings++;
            console.log(warnings);
            multipleFacesTimer = 0;
        }
    } else {
        multipleFacesTimer = 0;
    }

    
    
    // Check for looking away
    if (predictions.length > 0 && predictions[0].scaledMesh) {
        let keypoints = predictions[0].scaledMesh;
        let [lx, ly] = keypoints[33];
        let [rx, ry] = keypoints[263];
        let [nx, ny] = keypoints[4];
        
        // Calculate face angle
        let faceAngle = calculateFaceAngle(lx, ly, rx, ry, nx, ny);
        
        // Check for significant head rotation
        if (abs(faceAngle) > 30) { // More than 30 degrees rotation
            lookingAwayTimer++;
            if (lookingAwayTimer > 2) {
                warningElement.textContent = "WARNING: Looking away from screen!";
                warnings++;
                lookingAwayTimer = 0;
            }
        } else {
            lookingAwayTimer = 0;
        }

        let outerDistance = dist(lx, ly, rx, ry);
        
        if (outerDistance < 100) { // Threshold for looking away
            lookingAwayTimer++;
            if (lookingAwayTimer > 2) {
                warningElement.textContent = "WARNING: Looking away from screen!";
                warnings++;
                console.log(warnings);
                lookingAwayTimer = 0;
            }
        } else {
            lookingAwayTimer = 0;
        }
        
        // Check for closed eyes
        let [lxu, lyu] = keypoints[159];
        let [lxd, lyd] = keypoints[145];
        let [rxu, ryu] = keypoints[386];
        let [rxd, ryd] = keypoints[374];
        let leftEyeOpenness = dist(lxu, lyu, lxd, lyd);
        let rightEyeOpenness = dist(rxu, ryu, rxd, ryd);
        
        if (leftEyeOpenness < 5 && rightEyeOpenness < 5) {
            eyesClosedTimer++;
            if (eyesClosedTimer > 2) { // Eyes closed for 3+ seconds
                warningElement.textContent = "WARNING: Eyes closed for too long!";
                warnings++;
                console.log(warnings);
                eyesClosedTimer = 0;
            }
        } else {
            eyesClosedTimer = 0;
        }
    }
    
    // Clear warning after 3 seconds if no new issues
    if (warningElement.textContent && !warningElement.timeout) {
        warningElement.timeout = setTimeout(() => {
            warningElement.textContent = "";
            warningElement.timeout = null;
        }, 3000);
    }
    
    // Final warning if too many violations
    if (warnings >= 3) {
        warningElement.textContent = "FINAL WARNING: Exam may be terminated!";
        warnings=0;
    }
}

// Tab switching detection
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        warnings++;
        console.log(warnings);
        document.getElementById('warning').textContent = "WARNING: Tab switching detected!";
    }
});
