# ClearView AI Service - Code Explained for Beginners 📚

> This document explains every line of the Python AI service.
> Written so simply that even a 7-year-old could understand!

---

## 📖 Table of Contents

1. [What Does This Service Do?](#what-does-this-service-do)
2. [How MediaPipe Works](#how-mediapipe-works)
3. [Face Analysis Explained](#face-analysis-explained)
4. [Pose Analysis Explained](#pose-analysis-explained)
5. [Confidence Engine Explained](#confidence-engine-explained)
6. [Flask API Explained](#flask-api-explained)
7. [How To Run](#how-to-run)

---

## What Does This Service Do?

This Python service is like a **smart camera** that watches you during an interview and tells you:

1. **Are you looking at the camera?** (Eye Contact)
2. **Are you sitting straight?** (Posture)
3. **Do you look calm or nervous?** (Facial Tension)

It uses **MediaPipe** - a FREE AI library from Google that can detect faces and bodies!

---

## How MediaPipe Works

MediaPipe is like giving a computer **super eyes** 👀

### Face Mesh
- Detects **468 points** on your face
- Each point has an (x, y) coordinate
- We use these points to check:
  - Where are your eyes looking?
  - Are your eyebrows raised?
  - Are your lips pressed together?

```
     Face with 468 points
         ___________
        /   . . .   \
       |  .  👁️  .   |  <- Eye landmarks
       |     👃      |  <- Nose landmarks
       |    👄     |  <- Lip landmarks
        \___________/
```

### Pose Detection
- Detects **33 points** on your body
- Includes shoulders, elbows, hips
- We use these to check:
  - Are your shoulders level?
  - Is your head tilted?
  - Are you moving too much?

```
        Body with 33 points
             O     <- Head
            /|\    <- Shoulders, arms
             |     <- Torso
            / \    <- Legs
```

---

## Face Analysis Explained

### File: `services/face_analysis.py`

```python
import mediapipe as mp
```
👆 **import**: Like saying "give me the MediaPipe tool"

```python
class FaceAnalyzer:
```
👆 **class**: A blueprint for creating face analyzers
- Like a recipe for how to make something

```python
    def __init__(self):
        self.face_mesh = mp_face_mesh.FaceMesh(
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5
        )
```
👆 **__init__**: Runs when we create a new FaceAnalyzer
- `max_num_faces=1`: Only look for one face
- `refine_landmarks=True`: Get extra detail (includes iris!)
- `min_detection_confidence=0.5`: Need 50% confidence to detect

```python
    self.LEFT_EYE = [33, 160, 158, 133, 153, 144]
```
👆 These numbers are **landmark indices**
- MediaPipe gives each face point a number
- Points 33, 160, etc. are around the left eye

### Eye Contact Calculation

```python
def _calculate_eye_contact(self, landmarks, width, height):
    # Get center of left and right iris
    left_iris = self._get_center(landmarks, self.LEFT_IRIS)
    right_iris = self._get_center(landmarks, self.RIGHT_IRIS)
```
👆 Find where the pupils are looking

```python
    # Calculate how far the iris is from eye center
    left_deviation = abs(left_iris[0] - left_eye_center[0])
```
👆 **deviation**: How far the pupil is from the center
- Small deviation = looking at camera ✅
- Large deviation = looking away ❌

```python
    eye_contact = max(0, 100 - (avg_deviation / max_deviation * 100))
```
👆 Convert deviation to a score:
- Low deviation → High score (close to 100)
- High deviation → Low score (close to 0)

### Facial Tension Calculation

```python
def _calculate_facial_tension(self, landmarks):
    tension_score = 0
```
👆 Start with 0 tension

```python
    # If eyebrows are raised significantly
    if avg_brow_dist > 0.05:
        tension_score += 25
```
👆 **Raised eyebrows** = stress → Add tension points

```python
    # Very small distance = compressed lips = anxiety
    if lip_distance < 0.015:
        tension_score += 35
```
👆 **Pressed lips** = nervousness → Add tension points

```python
    # If inner eyebrows are close together = furrowed
    if brow_distance < 0.08:
        tension_score += 20
```
👆 **Furrowed brow** (the angry/worried look) → Add tension points

---

## Pose Analysis Explained

### File: `services/pose_analysis.py`

```python
from collections import deque
```
👆 **deque**: A special list that automatically removes old items
- Like a box that only holds 10 things - when you add #11, #1 falls out

```python
self.position_history = deque(maxlen=history_size)
```
👆 We store the last 10 positions to check for movement

### Posture Calculation

```python
# SHOULDER ALIGNMENT
shoulder_diff = abs(left_shoulder.y - right_shoulder.y)
shoulder_score = max(0, 100 - (shoulder_diff * 1000))
```
👆 **Shoulder alignment**:
- If both shoulders at same height → difference is small → high score
- If one shoulder higher → difference is big → low score

```python
# HEAD ALIGNMENT
ear_diff = abs(left_ear.y - right_ear.y)
head_score = max(0, 100 - (ear_diff * 1000))
```
👆 **Head tilt**:
- If head is straight → ears at same height → high score
- If head is tilted → ears at different heights → low score

### Stability Calculation

```python
# Store current position
self.position_history.append(current_position)
```
👆 Remember where the person is now

```python
# Calculate movement between frames
for i in range(1, len(self.position_history)):
    dx = abs(curr[key][0] - prev[key][0])
    dy = abs(curr[key][1] - prev[key][1])
    movement = dx + dy
```
👆 Compare each frame to the previous:
- How much did they move in X direction?
- How much did they move in Y direction?
- Add them up = total movement

```python
stability = max(0, 100 - (avg_movement / 0.02 * 100))
```
👆 Convert movement to score:
- Less movement → Higher stability score
- More movement (fidgeting) → Lower score

---

## Confidence Engine Explained

### File: `services/confidence_engine.py`

This takes all the scores and combines them!

```python
WEIGHTS = {
    'eye_contact': 0.30,      # 30%
    'posture': 0.35,          # 35%
    'facial_calmness': 0.35   # 35%
}
```
👆 **Weights**: How important each factor is
- These add up to 1.0 (100%)
- Posture and calmness are slightly more important than eye contact

```python
confidence_score = (
    (eye_contact * self.WEIGHTS['eye_contact']) +
    (posture * self.WEIGHTS['posture']) +
    (facial_calmness * self.WEIGHTS['facial_calmness'])
)
```
👆 **Weighted average formula**:

Example:
- Eye contact: 80 × 0.30 = 24
- Posture: 70 × 0.35 = 24.5
- Facial calmness: 90 × 0.35 = 31.5
- **Total: 80**

### Score Smoothing

```python
self.score_history.append(confidence_score)
smoothed_score = sum(self.score_history) / len(self.score_history)
```
👆 **Smoothing**: Average the last few scores
- Prevents jumpy scores
- If one frame has a weird result, it doesn't ruin everything

---

## Flask API Explained

### File: `app.py`

Flask is a tiny web server that listens for requests.

```python
app = Flask(__name__)
```
👆 Create the Flask application

```python
CORS(app, resources={r"/*": {"origins": allowed_origins}})
```
👆 **CORS**: Allow the frontend to connect
- Without this, browsers block requests from other websites

### Health Endpoint

```python
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy"
    })
```
👆 **@app.route**: This runs when someone visits `/health`
- `methods=['GET']`: Only respond to GET requests
- `jsonify`: Convert Python dict to JSON

### Analyze Frame Endpoint

```python
@app.route('/analyze-frame', methods=['POST'])
def analyze_frame():
```
👆 This is the main endpoint that analyzes video frames

```python
    data = request.get_json()
    frame_data = data.get('frame')
```
👆 Get the image data from the request

```python
    image = decode_base64_image(frame_data)
```
👆 Convert from text (base64) to actual image

```python
    face_results = face_analyzer.analyze_frame(image)
    pose_results = pose_analyzer.analyze_frame(image)
```
👆 Analyze the image with both analyzers

```python
    confidence_results = confidence_engine.calculate_confidence(
        face_results,
        pose_results
    )
```
👆 Combine the results into one confidence score

```python
    return jsonify({
        "success": True,
        "confidence_score": confidence_results['confidence_score'],
        ...
    })
```
👆 Send the results back to whoever asked

### Running the Server

```python
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=port, debug=debug)
```
👆 Start listening for requests
- `host='0.0.0.0'`: Accept connections from anywhere
- `port=5001`: Listen on port 5001
- `debug=True`: Show helpful error messages

---

## How To Run

### Step 1: Create Virtual Environment
```bash
cd ai-service
python -m venv venv
```
👆 Creates an isolated Python environment

### Step 2: Activate Virtual Environment
```bash
# On Linux/Mac:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```
👆 Enter the virtual environment

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```
👆 Install all required libraries

### Step 4: Run the Server
```bash
python app.py
```
👆 Start the AI service!

You should see:
```
╔════════════════════════════════════════════════╗
║      🧠 ClearView AI Service (MediaPipe)      ║
╠════════════════════════════════════════════════╣
║  🚀 Running on port: 5001                      ║
╚════════════════════════════════════════════════╝
```

---

## Quick Reference 🎯

### Scoring Weights
| Metric | Weight | What It Measures |
|--------|--------|------------------|
| Eye Contact | 30% | Looking at camera |
| Posture | 35% | Sitting straight, stable |
| Facial Calmness | 35% | Relaxed face, not tense |

### Score Interpretation
| Score | Meaning |
|-------|---------|
| 80-100 | Excellent confidence! |
| 60-79 | Good, minor improvements needed |
| 40-59 | Fair, needs practice |
| 0-39 | Needs significant work |

### API Endpoints
| Method | Path | Purpose |
|--------|------|---------|
| GET | /health | Check if service is running |
| POST | /analyze-frame | Analyze video frame |
| POST | /reset | Reset analyzer state |
| POST | /feedback | Get human-readable feedback |

---

## Common Issues 🔧

**"No module named mediapipe"**
→ Run: `pip install mediapipe`

**"Camera not working"**
→ MediaPipe doesn't need camera access - it analyzes images sent to it

**"Score always 50"**
→ Face or body might not be detected. Check lighting and camera angle.

---

**Congratulations!** 🎉 You now understand how AI can analyze video!

This is real computer vision used by companies like Google, Apple, and Meta.
You're learning professional-level technology! 💪
