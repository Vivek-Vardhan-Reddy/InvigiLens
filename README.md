<div align="center">
  
  <!-- Animated header effect -->
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=28&duration=3000&pause=1000&color=FF0000&center=true&vCenter=true&width=435&lines=InvigiLens;AI+Exam+Proctoring+System" alt="InvigiLens" />

  <p align="center">
    <strong>👁️ ensuring academic integrity through artificial intelligence 👁️</strong>
  </p>

  <!-- Tech stack badges -->
  <p>
    <img src="https://img.shields.io/badge/p5.js-ED225D?style=for-the-badge&logo=p5.js&logoColor=white" alt="p5.js" />
    <img src="https://img.shields.io/badge/ml5.js-1A4D8C?style=for-the-badge&logo=ml5&logoColor=white" alt="ml5.js" />
    <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
    <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
    <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" />
    <img src="https://img.shields.io/badge/Facemesh-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Facemesh" />
  </p>

  <!-- Cool line break -->
  <img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="80%">
</div>

<br>

## 📋 **Table of Contents**

- [Features](#-features)
- [Demo](#-demo)
- [Technologies Used](#-technologies-used)
- [Installation](#-installation)
- [How It Works](#-how-it-works)
- [Configuration](#-configuration)
- [Usage Guide](#-usage-guide)
- [Detection Parameters](#-detection-parameters)
- [Limitations](#-limitations)
- [Future Enhancements](#-future-enhancements)


---

## 🌟 **Features**

### 👤 Face Detection & Tracking
| Feature | Description |
|---------|-------------|
| **Multi-face Detection** | Identifies and alerts when multiple faces are present in the frame |
| **Face Orientation Monitoring** | Tracks head rotation to detect when candidates look away from screen |
| **Facial Landmark Visualization** | Draws eye contours and measurement lines on the video feed |
| **368-point 3D Face Geometry** | Using Google's Facemesh model for accurate tracking |

### 👁️ Eye Tracking & Analysis
| Feature | Description |
|---------|-------------|
| **Eye Openness Calculation** | Detects prolonged eye closure using vertical eye distance |
| **Inter-pupillary Distance** | Tracks face proximity to screen |
| **Eye Contour Drawing** | Visual feedback of detected eye landmarks |
| **Sensitivity Thresholds** | Configurable eye closure limits (default: 5px) |

### 🚨 Cheating Detection
| Feature | Description |
|---------|-------------|
| **Tab Switching Detection** | Immediate alert when user switches browser tabs |
| **Head Pose Estimation** | Calculates face angle to detect looking away (>30°) |
| **Distance Monitoring** | Detects if candidate moves away from camera |
| **Violation Logging** | Escalating warnings after multiple offenses |
| **Final Warning** | Exam termination threat after 3 violations |

### 📊 Real-Time Dashboard
| Feature | Description |
|---------|-------------|
| **Live Stats Display** | Shows faces detected, eye distance, face angle, eye openness |
| **Color-coded Warnings** | Prominent red alerts at screen top |
| **Visual Measurement Lines** | Eye distance, nose orientation, eye verticals |
| **Persistent Camera Feed** | Live video with overlaid graphics |

---

## 🎥 **Demo**

```javascript
// Sample console output
console.log("Faces Detected: 1");
console.log("Eye Distance: 98.3px");
console.log("Face Angle: -2.4°");
console.log("Eye Openness: 12.7px");
