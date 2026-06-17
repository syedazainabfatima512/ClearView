"""
============================================
POSE ANALYSIS SERVICE
============================================

This service uses Google's MediaPipe Pose (FREE!) to analyze body posture.
It detects:
- Posture stability (are you sitting straight?)
- Movement/fidgeting (are you moving too much?)

MediaPipe Pose provides 33 body landmarks including shoulders,
elbows, wrists, hips, and more!
"""

import mediapipe as mp
import cv2
import numpy as np
from collections import deque

# Initialize MediaPipe Pose
mp_pose = mp.solutions.pose


class PoseAnalyzer:
    """
    PoseAnalyzer - Analyzes body posture for confidence metrics
    
    Uses MediaPipe Pose to detect:
    1. Posture quality - Sitting straight or slouching?
    2. Stability - Staying still or fidgeting?
    """
    
    def __init__(self, history_size=10):
        """
        Initialize the pose analyzer.
        
        Args:
            history_size: Number of frames to remember for stability calculation
        """
        # Create the Pose detector
        self.pose = mp_pose.Pose(
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5,
            model_complexity=1  # 0=lite, 1=full, 2=heavy
        )
        
        # Store previous positions to calculate stability
        # deque is like a list but automatically removes old items
        self.position_history = deque(maxlen=history_size)
        self.history_size = history_size
        
        # Key landmark indices we care about
        # These are from MediaPipe's 33-point body model
        self.LANDMARKS = {
            'nose': mp_pose.PoseLandmark.NOSE,
            'left_shoulder': mp_pose.PoseLandmark.LEFT_SHOULDER,
            'right_shoulder': mp_pose.PoseLandmark.RIGHT_SHOULDER,
            'left_ear': mp_pose.PoseLandmark.LEFT_EAR,
            'right_ear': mp_pose.PoseLandmark.RIGHT_EAR,
            'left_hip': mp_pose.PoseLandmark.LEFT_HIP,
            'right_hip': mp_pose.PoseLandmark.RIGHT_HIP
        }
    
    def analyze_frame(self, image):
        """
        Analyze a single video frame for posture and stability.
        
        Args:
            image: The image/frame to analyze (BGR format)
        
        Returns:
            dict: {
                'posture': 0-100 (100 = perfect posture),
                'body_detected': True/False
            }
        """
        # Convert BGR to RGB for MediaPipe
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Process the image
        results = self.pose.process(rgb_image)
        
        # If no body detected
        if not results.pose_landmarks:
            return {
                "posture": 50,  # Neutral score
                "body_detected": False
            }
        
        landmarks = results.pose_landmarks.landmark
        
        # Calculate posture quality
        posture_score = self._calculate_posture(landmarks)
        
        # Calculate stability (movement over time)
        stability_score = self._calculate_stability(landmarks)
        
        # Combined score (60% posture, 40% stability)
        final_score = (posture_score * 0.6) + (stability_score * 0.4)
        
        return {
            "posture": round(final_score),
            "body_detected": True
        }
    
    def _calculate_posture(self, landmarks):
        """
        Calculate posture quality score.
        
        Checks:
        1. Are shoulders level? (not tilted)
        2. Is head straight? (not tilted)
        3. Is spine straight? (shoulders above hips)
        
        Returns: 0-100 score
        """
        # Get landmark positions
        left_shoulder = landmarks[self.LANDMARKS['left_shoulder']]
        right_shoulder = landmarks[self.LANDMARKS['right_shoulder']]
        left_ear = landmarks[self.LANDMARKS['left_ear']]
        right_ear = landmarks[self.LANDMARKS['right_ear']]
        nose = landmarks[self.LANDMARKS['nose']]
        
        # ===== SHOULDER ALIGNMENT =====
        # Perfect: both shoulders at same height
        # Bad: one shoulder higher than other (tilted)
        shoulder_diff = abs(left_shoulder.y - right_shoulder.y)
        
        # Convert to score (0 diff = 100 score)
        # Max expected diff is about 0.1
        shoulder_score = max(0, 100 - (shoulder_diff * 1000))
        
        # ===== HEAD ALIGNMENT =====
        # Perfect: ears at same height (head not tilted)
        ear_diff = abs(left_ear.y - right_ear.y)
        head_score = max(0, 100 - (ear_diff * 1000))
        
        # ===== FORWARD LEAN =====
        # Check if person is leaning too forward or back
        # Compare nose position to shoulder midpoint
        shoulder_mid_x = (left_shoulder.x + right_shoulder.x) / 2
        forward_lean = abs(nose.x - shoulder_mid_x)
        
        lean_score = max(0, 100 - (forward_lean * 500))
        
        # ===== SLOUCHING =====
        # Check vertical alignment: nose should be well above shoulders
        nose_shoulder_dist = (left_shoulder.y + right_shoulder.y) / 2 - nose.y
        
        # Slouching = nose closer to shoulder level
        if nose_shoulder_dist < 0.1:  # Too close = slouching
            slouch_penalty = 30
        elif nose_shoulder_dist < 0.15:
            slouch_penalty = 15
        else:
            slouch_penalty = 0
        
        # Combined posture score
        posture_score = (
            (shoulder_score * 0.35) +
            (head_score * 0.35) +
            (lean_score * 0.30)
        ) - slouch_penalty
        
        return max(0, min(100, posture_score))
    
    def _calculate_stability(self, landmarks):
        """
        Calculate stability based on movement over time.
        
        Compares current position to previous frames.
        Less movement = higher stability score.
        
        Returns: 0-100 score
        """
        # Extract key positions for tracking
        current_position = {
            'nose': (
                landmarks[self.LANDMARKS['nose']].x,
                landmarks[self.LANDMARKS['nose']].y
            ),
            'left_shoulder': (
                landmarks[self.LANDMARKS['left_shoulder']].x,
                landmarks[self.LANDMARKS['left_shoulder']].y
            ),
            'right_shoulder': (
                landmarks[self.LANDMARKS['right_shoulder']].x,
                landmarks[self.LANDMARKS['right_shoulder']].y
            )
        }
        
        # Add to history
        self.position_history.append(current_position)
        
        # Need at least 2 frames to calculate movement
        if len(self.position_history) < 2:
            return 100  # Not enough data, assume stable
        
        # Calculate total movement across all frames
        movements = []
        
        for i in range(1, len(self.position_history)):
            prev = self.position_history[i - 1]
            curr = self.position_history[i]
            
            # Calculate movement for each tracked point
            for key in prev:
                dx = abs(curr[key][0] - prev[key][0])
                dy = abs(curr[key][1] - prev[key][1])
                movement = dx + dy
                movements.append(movement)
        
        # Average movement
        avg_movement = sum(movements) / len(movements) if movements else 0
        
        # Convert to score
        # Threshold: 0.02 = acceptable small movement
        # Higher movement = lower score
        stability = max(0, 100 - (avg_movement / 0.02 * 100))
        
        return min(100, stability)
    
    def reset_history(self):
        """Clear the position history (start fresh)."""
        self.position_history.clear()
    
    def release(self):
        """Clean up resources."""
        self.pose.close()


# Quick test if run directly
if __name__ == "__main__":
    print("Pose Analysis Service loaded successfully!")
    analyzer = PoseAnalyzer()
    print("✅ MediaPipe Pose initialized")
    analyzer.release()
