"""
============================================
CONFIDENCE ENGINE
============================================

This is the main brain that combines face and pose analysis
to calculate an overall confidence score.

It takes data from:
- Face Analysis (eye contact, facial tension)
- Pose Analysis (posture, stability)

And calculates a final confidence score!

Scoring Weights (as per project requirements):
- Eye Contact: 30%
- Posture Stability: 35%
- Facial Calmness: 35%
"""


class ConfidenceEngine:
    """
    ConfidenceEngine - Combines all metrics into confidence score
    
    This class doesn't do the actual detection - it takes scores
    from FaceAnalyzer and PoseAnalyzer and combines them.
    """
    
    # Scoring weights from project requirements
    WEIGHTS = {
        'eye_contact': 0.30,      # 30%
        'posture': 0.35,          # 35%
        'facial_calmness': 0.35   # 35%
    }
    
    def __init__(self):
        """Initialize the confidence engine."""
        # Track scores over time for smoothing
        self.score_history = []
        self.max_history = 30  # Keep last 30 frames (~1 second at 30fps)
    
    def calculate_confidence(self, face_data, pose_data):
        """
        Calculate overall confidence score from face and pose data.
        
        Args:
            face_data: dict from FaceAnalyzer with 'eye_contact' and 'facial_tension'
            pose_data: dict from PoseAnalyzer with 'posture'
        
        Returns:
            dict: {
                'confidence_score': 0-100,
                'eye_contact': 0-100,
                'posture': 0-100,
                'facial_calmness': 0-100,
                'breakdown': detailed scores
            }
        """
        # Extract individual scores (default to 50 if not provided)
        eye_contact = face_data.get('eye_contact', 50)
        facial_calmness = face_data.get('facial_tension', 50)  # Already inverted in face_analysis
        posture = pose_data.get('posture', 50)
        
        # Calculate weighted confidence score
        confidence_score = (
            (eye_contact * self.WEIGHTS['eye_contact']) +
            (posture * self.WEIGHTS['posture']) +
            (facial_calmness * self.WEIGHTS['facial_calmness'])
        )
        
        # Add to history for smoothing
        self.score_history.append(confidence_score)
        if len(self.score_history) > self.max_history:
            self.score_history.pop(0)
        
        # Smoothed score (average of recent scores)
        smoothed_score = sum(self.score_history) / len(self.score_history)
        
        return {
            'confidence_score': round(smoothed_score, 1),
            'raw_score': round(confidence_score, 1),
            'eye_contact': round(eye_contact),
            'posture': round(posture),
            'facial_calmness': round(facial_calmness),
            'face_detected': face_data.get('face_detected', False),
            'body_detected': pose_data.get('body_detected', False),
            'breakdown': {
                'eye_contact_weighted': round(eye_contact * self.WEIGHTS['eye_contact'], 1),
                'posture_weighted': round(posture * self.WEIGHTS['posture'], 1),
                'facial_calmness_weighted': round(facial_calmness * self.WEIGHTS['facial_calmness'], 1)
            }
        }
    
    def get_feedback(self, confidence_data):
        """
        Generate human-readable feedback based on scores.
        
        Args:
            confidence_data: Output from calculate_confidence()
        
        Returns:
            dict: Feedback messages for each metric
        """
        feedback = {
            'overall': '',
            'eye_contact': '',
            'posture': '',
            'facial_calmness': ''
        }
        
        score = confidence_data['confidence_score']
        
        # Overall feedback
        if score >= 80:
            feedback['overall'] = "Excellent! You appear very confident and composed."
        elif score >= 60:
            feedback['overall'] = "Good! You're showing reasonable confidence."
        elif score >= 40:
            feedback['overall'] = "Fair. There's room for improvement in your body language."
        else:
            feedback['overall'] = "You seem nervous. Try to relax and maintain composure."
        
        # Eye contact feedback
        ec = confidence_data['eye_contact']
        if ec >= 80:
            feedback['eye_contact'] = "Great eye contact! You're engaging well with the camera."
        elif ec >= 60:
            feedback['eye_contact'] = "Good eye contact. Try to look at the camera more consistently."
        elif ec >= 40:
            feedback['eye_contact'] = "Your eye contact could improve. Focus on the camera lens."
        else:
            feedback['eye_contact'] = "Work on maintaining eye contact with the camera."
        
        # Posture feedback
        p = confidence_data['posture']
        if p >= 80:
            feedback['posture'] = "Excellent posture! You look professional and confident."
        elif p >= 60:
            feedback['posture'] = "Good posture. Try to sit up a bit straighter."
        elif p >= 40:
            feedback['posture'] = "Your posture needs work. Sit upright and avoid slouching."
        else:
            feedback['posture'] = "Focus on sitting straight with shoulders back."
        
        # Facial calmness feedback
        fc = confidence_data['facial_calmness']
        if fc >= 80:
            feedback['facial_calmness'] = "You appear calm and relaxed. Great job!"
        elif fc >= 60:
            feedback['facial_calmness'] = "You seem fairly relaxed. Try to ease any tension."
        elif fc >= 40:
            feedback['facial_calmness'] = "You appear somewhat tense. Take deep breaths."
        else:
            feedback['facial_calmness'] = "You seem stressed. Relax your facial muscles."
        
        return feedback
    
    def reset(self):
        """Reset the score history."""
        self.score_history.clear()


# Quick test if run directly
if __name__ == "__main__":
    print("Confidence Engine loaded successfully!")
    engine = ConfidenceEngine()
    
    # Test with sample data
    sample_face = {'eye_contact': 75, 'facial_tension': 80, 'face_detected': True}
    sample_pose = {'posture': 85, 'body_detected': True}
    
    result = engine.calculate_confidence(sample_face, sample_pose)
    print(f"✅ Sample confidence score: {result['confidence_score']}")
    
    feedback = engine.get_feedback(result)
    print(f"📝 Feedback: {feedback['overall']}")
