"""
============================================
CLEARVIEW AI SERVICE - Flask API Server
============================================

This is the main entry point for the Python AI service.
It provides REST API endpoints for analyzing video frames
using MediaPipe for confidence scoring.

Endpoints:
    GET  /health          - Check if service is running
    POST /analyze-frame   - Analyze a single video frame
    POST /reset           - Reset analyzer state

This service runs on port 5001 (Node.js backend runs on 5000)
"""

import os
import base64
import cv2
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Import our services
from services.face_analysis import FaceAnalyzer
from services.pose_analysis import PoseAnalyzer
from services.confidence_engine import ConfidenceEngine

# Load environment variables from .env file
load_dotenv()

# ============================================
# CREATE FLASK APP
# ============================================
app = Flask(__name__)

# Enable CORS (Cross-Origin Resource Sharing)
# This allows the frontend to communicate with us
allowed_origins = os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000').split(',')
CORS(app, resources={r"/*": {"origins": allowed_origins}})

# ============================================
# INITIALIZE ANALYZERS
# ============================================
# Create instances of our analyzers
# These are reused for every request (efficient!)
face_analyzer = FaceAnalyzer()
pose_analyzer = PoseAnalyzer()
confidence_engine = ConfidenceEngine()

print("✅ All analyzers initialized successfully!")


# ============================================
# HELPER FUNCTIONS
# ============================================

def decode_base64_image(base64_string):
    """
    Convert a base64 string to an OpenCV image.
    
    Base64 is a way to send binary data (like images) as text.
    The frontend sends frames this way.
    
    Args:
        base64_string: The base64 encoded image (may include data URL prefix)
    
    Returns:
        numpy array: OpenCV image in BGR format
    """
    try:
        # Remove data URL prefix if present
        # "data:image/jpeg;base64,/9j/4AAQ..." -> "/9j/4AAQ..."
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        
        # Decode base64 to bytes
        image_bytes = base64.b64decode(base64_string)
        
        # Convert bytes to numpy array
        nparr = np.frombuffer(image_bytes, np.uint8)
        
        # Decode as image
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        return image
    except Exception as e:
        print(f"Error decoding image: {e}")
        return None


# ============================================
# API ENDPOINTS
# ============================================

@app.route('/health', methods=['GET'])
def health_check():
    """
    Health Check Endpoint
    
    Used to verify the service is running.
    The Node.js backend or frontend can ping this to check.
    
    Returns:
        JSON: { status: "healthy", message: "..." }
    """
    return jsonify({
        "status": "healthy",
        "message": "ClearView AI Service is running",
        "services": {
            "face_analyzer": "active",
            "pose_analyzer": "active",
            "confidence_engine": "active"
        }
    })


@app.route('/analyze-frame', methods=['POST'])
def analyze_frame():
    """
    Analyze Frame Endpoint
    
    This is the main endpoint! It receives a video frame,
    analyzes it for confidence metrics, and returns scores.
    
    Request Body:
        {
            "frame": "data:image/jpeg;base64,..." (or just base64 string)
        }
    
    Response:
        {
            "success": true,
            "confidence_score": 0-100,
            "eye_contact": 0-100,
            "posture": 0-100,
            "facial_calmness": 0-100,
            "face_detected": true/false,
            "body_detected": true/false
        }
    """
    try:
        # Get the request data
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "error": "No data provided"
            }), 400
        
        # Get the frame data
        frame_data = data.get('frame')
        
        if not frame_data:
            return jsonify({
                "success": False,
                "error": "No frame provided"
            }), 400
        
        # Decode the base64 image
        image = decode_base64_image(frame_data)
        
        if image is None:
            return jsonify({
                "success": False,
                "error": "Could not decode image"
            }), 400
        
        # ===== ANALYZE THE FRAME =====
        
        # 1. Face Analysis (eye contact, facial tension)
        face_results = face_analyzer.analyze_frame(image)
        
        # 2. Pose Analysis (posture, stability)
        pose_results = pose_analyzer.analyze_frame(image)
        
        # 3. Combine into confidence score
        confidence_results = confidence_engine.calculate_confidence(
            face_results,
            pose_results
        )
        
        # ===== RETURN RESULTS =====
        return jsonify({
            "success": True,
            "confidence_score": confidence_results['confidence_score'],
            "eye_contact": confidence_results['eye_contact'],
            "posture": confidence_results['posture'],
            "facial_calmness": confidence_results['facial_calmness'],
            "face_detected": confidence_results['face_detected'],
            "body_detected": confidence_results['body_detected'],
            "breakdown": confidence_results['breakdown']
        })
        
    except Exception as e:
        print(f"Error analyzing frame: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/analyze-frame-simple', methods=['POST'])
def analyze_frame_simple():
    """
    Simplified Frame Analysis
    
    Same as /analyze-frame but returns only the essential data
    that the Node.js backend needs.
    
    Response:
        {
            "eyeContact": 0-100,
            "posture": 0-100,
            "facialTension": 0-100
        }
    """
    try:
        data = request.get_json()
        frame_data = data.get('frame')
        
        if not frame_data:
            return jsonify({
                "eyeContact": 50,
                "posture": 50,
                "facialTension": 50
            })
        
        image = decode_base64_image(frame_data)
        
        if image is None:
            return jsonify({
                "eyeContact": 50,
                "posture": 50,
                "facialTension": 50
            })
        
        # Analyze
        face_results = face_analyzer.analyze_frame(image)
        pose_results = pose_analyzer.analyze_frame(image)
        
        # Return simple format matching Node.js expectations
        return jsonify({
            "eyeContact": face_results.get('eye_contact', 50),
            "posture": pose_results.get('posture', 50),
            "facialTension": face_results.get('facial_tension', 50)
        })
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({
            "eyeContact": 50,
            "posture": 50,
            "facialTension": 50
        })


@app.route('/reset', methods=['POST'])
def reset_analyzers():
    """
    Reset Endpoint
    
    Clears the history/state of all analyzers.
    Call this when starting a new interview session.
    
    Returns:
        JSON: { success: true, message: "..." }
    """
    try:
        # Reset pose analyzer history (for stability calculation)
        pose_analyzer.reset_history()
        
        # Reset confidence engine history (for smoothing)
        confidence_engine.reset()
        
        return jsonify({
            "success": True,
            "message": "Analyzers reset successfully"
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/feedback', methods=['POST'])
def get_feedback():
    """
    Get Feedback Endpoint
    
    Returns human-readable feedback based on provided scores.
    
    Request Body:
        {
            "confidence_score": 75,
            "eye_contact": 80,
            "posture": 70,
            "facial_calmness": 75
        }
    
    Returns:
        JSON: Feedback messages for each metric
    """
    try:
        data = request.get_json()
        
        # Create a mock confidence_data structure
        confidence_data = {
            'confidence_score': data.get('confidence_score', 50),
            'eye_contact': data.get('eye_contact', 50),
            'posture': data.get('posture', 50),
            'facial_calmness': data.get('facial_calmness', 50)
        }
        
        feedback = confidence_engine.get_feedback(confidence_data)
        
        return jsonify({
            "success": True,
            "feedback": feedback
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ============================================
# ERROR HANDLERS
# ============================================

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return jsonify({
        "success": False,
        "error": "Endpoint not found"
    }), 404


@app.errorhandler(500)
def server_error(error):
    """Handle 500 errors."""
    return jsonify({
        "success": False,
        "error": "Internal server error"
    }), 500


# ============================================
# RUN THE SERVER
# ============================================

if __name__ == '__main__':
    # Get configuration from environment
    port = int(os.getenv('PORT', 5001))
    debug = os.getenv('DEBUG', 'True').lower() == 'true'
    
    print("")
    print("╔════════════════════════════════════════════════╗")
    print("║                                                ║")
    print("║      🧠 ClearView AI Service (MediaPipe)      ║")
    print("║                                                ║")
    print("╠════════════════════════════════════════════════╣")
    print(f"║  🚀 Running on port: {port}                      ║")
    print(f"║  🔧 Debug mode: {debug}                          ║")
    print("║                                                ║")
    print("║  Endpoints:                                    ║")
    print("║  • GET  /health         - Health check         ║")
    print("║  • POST /analyze-frame  - Analyze video frame  ║")
    print("║  • POST /reset          - Reset analyzers      ║")
    print("║  • POST /feedback       - Get feedback text    ║")
    print("║                                                ║")
    print("║  Using: MediaPipe Face Mesh + Pose             ║")
    print("║  Cost: $0 (100% FREE!)                         ║")
    print("║                                                ║")
    print("╚════════════════════════════════════════════════╝")
    print("")
    
    # Run the Flask app
    app.run(
        host='0.0.0.0',   # Allow external connections
        port=port,
        debug=debug
    )
