"""
============================================
FACE ANALYSIS SERVICE
============================================

This service uses Google's MediaPipe (FREE!) to analyze faces.
It detects:
- Eye contact (are you looking at the camera?)
- Facial tension (are you stressed or calm?)

MediaPipe provides 468 face landmarks - tiny points on your face
that it tracks in real-time!
"""

import mediapipe as mp
import cv2
import numpy as np

# Initialize MediaPipe Face Mesh
mp_face_mesh = mp.solutions.face_mesh


class FaceAnalyzer:
    """
    FaceAnalyzer - Analyzes faces for confidence metrics
    
    Uses MediaPipe Face Mesh to detect:
    1. Eye contact - Looking at camera or away?
    2. Facial tension - Calm or stressed?
    """
    
    def __init__(self):
        """
        Initialize the face analyzer with MediaPipe.
        This runs once when we create a FaceAnalyzer object.
        """
        # Create the Face Mesh detector
        self.face_mesh = mp_face_mesh.FaceMesh(
            max_num_faces=1,           # Only detect one face
            refine_landmarks=True,     # Get more detailed landmarks (includes iris)
            min_detection_confidence=0.5,  # How sure it needs to be (0-1)
            min_tracking_confidence=0.5    # How well it needs to track
        )
        
        # ============ LANDMARK INDICES ============
        # These numbers correspond to specific points on the face
        # MediaPipe uses 468 points to map the face
        
        # Left eye corners and edges
        self.LEFT_EYE = [33, 160, 158, 133, 153, 144]
        
        # Right eye corners and edges
        self.RIGHT_EYE = [362, 385, 387, 263, 373, 380]
        
        # Left iris (pupil area) - landmarks 468-472
        self.LEFT_IRIS = [468, 469, 470, 471, 472]
        
        # Right iris (pupil area) - landmarks 473-477
        self.RIGHT_IRIS = [473, 474, 475, 476, 477]
        
        # Lip landmarks for detecting tension
        self.LIPS = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308]
        
        # Eyebrow landmarks for detecting raised eyebrows
        self.LEFT_EYEBROW = [70, 63, 105, 66, 107]
        self.RIGHT_EYEBROW = [336, 296, 334, 293, 300]
        
        # Nose tip for head position reference
        self.NOSE_TIP = 4
    
    def analyze_frame(self, image):
        """
        Analyze a single video frame for eye contact and facial tension.
        
        Args:
            image: The image/frame to analyze (BGR format from OpenCV)
        
        Returns:
            dict: {
                'eye_contact': 0-100 (100 = perfect eye contact),
                'facial_tension': 0-100 (100 = very calm, 0 = very tense)
            }
        """
        # Convert BGR to RGB (MediaPipe expects RGB)
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Process the image with Face Mesh
        results = self.face_mesh.process(rgb_image)
        
        # If no face detected, return default values
        if not results.multi_face_landmarks:
            return {
                "eye_contact": 0,
                "facial_tension": 50,  # Neutral
                "face_detected": False
            }
        
        # Get the first (and only) face's landmarks
        landmarks = results.multi_face_landmarks[0].landmark
        
        # Get image dimensions for calculations
        h, w, _ = image.shape
        
        # Calculate eye contact score
        eye_contact = self._calculate_eye_contact(landmarks, w, h)
        
        # Calculate facial tension (and convert to calmness)
        tension = self._calculate_facial_tension(landmarks)
        facial_calmness = 100 - tension  # Invert: high tension = low calmness
        
        return {
            "eye_contact": round(eye_contact),
            "facial_tension": round(facial_calmness),
            "face_detected": True
        }
    
    def _calculate_eye_contact(self, landmarks, width, height):
        """
        Calculate eye contact score based on iris position.
        
        When looking at camera (center), score is high.
        When looking away, score is low.
        
        Returns: 0-100 score
        """
        # Get center of left and right iris
        left_iris = self._get_center(landmarks, self.LEFT_IRIS)
        right_iris = self._get_center(landmarks, self.RIGHT_IRIS)
        
        # Get center of left and right eye (reference point)
        left_eye_center = self._get_center(landmarks, self.LEFT_EYE)
        right_eye_center = self._get_center(landmarks, self.RIGHT_EYE)
        
        # Calculate how far the iris is from the eye center
        # Small deviation = looking at camera
        # Large deviation = looking away
        left_deviation = abs(left_iris[0] - left_eye_center[0])
        right_deviation = abs(right_iris[0] - right_eye_center[0])
        
        # Average deviation
        avg_deviation = (left_deviation + right_deviation) / 2
        
        # Convert to score (0-100)
        # Maximum expected deviation is about 0.03 (3% of face width)
        max_deviation = 0.03
        eye_contact = max(0, 100 - (avg_deviation / max_deviation * 100))
        
        # Also check vertical head tilt using nose position
        nose = landmarks[self.NOSE_TIP]
        
        # If head is turned too much, reduce score
        if nose.x < 0.35 or nose.x > 0.65:  # Looking left or right
            eye_contact *= 0.7  # Reduce by 30%
        
        return min(100, eye_contact)
    
    def _calculate_facial_tension(self, landmarks):
        """
        Calculate facial tension based on muscle indicators.
        
        Checks for:
        - Raised eyebrows (stress)
        - Compressed lips (anxiety)
        - Furrowed brow (concentration/stress)
        
        Returns: 0-100 (100 = very tense, 0 = relaxed)
        """
        tension_score = 0
        
        # ===== CHECK EYEBROW RAISE =====
        # Get eyebrow and eye positions
        left_brow = self._get_center(landmarks, self.LEFT_EYEBROW)
        right_brow = self._get_center(landmarks, self.RIGHT_EYEBROW)
        left_eye = self._get_center(landmarks, self.LEFT_EYE)
        right_eye = self._get_center(landmarks, self.RIGHT_EYE)
        
        # Calculate distance between eyebrow and eye
        # Larger distance = raised eyebrows = tension
        left_brow_dist = left_eye[1] - left_brow[1]  # Y distance
        right_brow_dist = right_eye[1] - right_brow[1]
        avg_brow_dist = (left_brow_dist + right_brow_dist) / 2
        
        # If eyebrows are raised significantly
        if avg_brow_dist > 0.05:  # Threshold for raised eyebrows
            tension_score += 25  # Add tension points
        
        # ===== CHECK LIP COMPRESSION =====
        # Get upper and lower lip positions
        upper_lip = landmarks[13]  # Upper lip center
        lower_lip = landmarks[14]  # Lower lip center
        
        # Distance between lips
        lip_distance = abs(upper_lip.y - lower_lip.y)
        
        # Very small distance = compressed lips = anxiety
        if lip_distance < 0.015:
            tension_score += 35
        elif lip_distance < 0.025:
            tension_score += 20
        
        # ===== CHECK BROW FURROW =====
        # Get inner eyebrow points (between the eyes)
        inner_left_brow = landmarks[107]
        inner_right_brow = landmarks[336]
        
        # If inner eyebrows are close together = furrowed
        brow_distance = abs(inner_right_brow.x - inner_left_brow.x)
        if brow_distance < 0.08:
            tension_score += 20
        
        # ===== CHECK JAW CLENCH =====
        # This is approximated by chin position and face width
        jaw_left = landmarks[234]
        jaw_right = landmarks[454]
        jaw_width = abs(jaw_right.x - jaw_left.x)
        
        # Wide jaw (clenched) adds tension
        if jaw_width > 0.35:
            tension_score += 10
        
        return min(100, tension_score)
    
    def _get_center(self, landmarks, indices):
        """
        Calculate the center point of multiple landmarks.
        
        Args:
            landmarks: All face landmarks
            indices: List of landmark indices to average
        
        Returns:
            tuple: (x, y) center coordinates (normalized 0-1)
        """
        points = [(landmarks[i].x, landmarks[i].y) for i in indices]
        x = sum(p[0] for p in points) / len(points)
        y = sum(p[1] for p in points) / len(points)
        return (x, y)
    
    def release(self):
        """Clean up resources."""
        self.face_mesh.close()


# Quick test if run directly
if __name__ == "__main__":
    print("Face Analysis Service loaded successfully!")
    analyzer = FaceAnalyzer()
    print("✅ MediaPipe Face Mesh initialized")
    analyzer.release()
