#!/usr/bin/env python3
"""
Model wrapper for integrating the gene sequence prediction model with the Next.js API.
This script provides a REST API interface for the model predictions.
"""

import os
import sys
import json
import traceback
from typing import Dict, List, Any
from flask import Flask, request, jsonify
from flask_cors import CORS

# Add the Model directory to the path
model_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'Model')
sys.path.insert(0, model_dir)

try:
    from infer_helper import predict_sequences
except ImportError as e:
    print(f"Warning: Could not import infer_helper: {e}")
    predict_sequences = None

app = Flask(__name__)
CORS(app)

class ModelWrapper:
    """Wrapper class for the gene sequence prediction model."""
    
    def __init__(self):
        self.model_loaded = False
        self.model_info = {
            "name": "Gene Sequence Species Classifier",
            "version": "1.0.0",
            "description": "Stacked ensemble model for species identification from gene sequences",
            "supported_genes": ["COI", "16S", "18S", "ITS", "General"],
            "model_type": "Stacked Ensemble (LightGBM + XGBoost + Meta Classifier)"
        }
    
    def is_model_available(self) -> bool:
        """Check if the model files are available."""
        required_files = [
            'stack_meta_clf.pkl',
            'stack_label_encoder.pkl', 
            'lgb_models_list.pkl',
            'xgb_models_list.pkl'
        ]
        
        for file in required_files:
            file_path = os.path.join(model_dir, file)
            if not os.path.exists(file_path):
                return False
        return True
    
    def predict_species(self, sequences: List[str]) -> Dict[str, Any]:
        """Predict species from gene sequences."""
        if not self.is_model_available():
            return {
                "success": False,
                "error": "Model files not found",
                "message": "Please ensure all model files are in the Model directory"
            }
        
        if not predict_sequences:
            return {
                "success": False,
                "error": "Model inference function not available",
                "message": "Could not import predict_sequences function"
            }
        
        try:
            # Validate sequences
            valid_sequences = []
            for seq in sequences:
                if seq and isinstance(seq, str) and len(seq.strip()) > 0:
                    # Basic validation - should contain only ATGC characters
                    seq_clean = seq.strip().upper()
                    if all(c in 'ATGC' for c in seq_clean):
                        valid_sequences.append(seq_clean)
            
            if not valid_sequences:
                return {
                    "success": False,
                    "error": "No valid sequences provided",
                    "message": "Sequences must contain only A, T, G, C characters"
                }
            
            # Make predictions
            predictions = predict_sequences(valid_sequences)
            
            # Format results
            results = []
            for i, pred in enumerate(predictions):
                result = {
                    "sequence_id": f"seq_{i+1}",
                    "sequence_length": len(valid_sequences[i]),
                    "predicted_species": pred.get('pred_label', 'Unknown'),
                    "confidence": max(pred.get('prob_vector', [0.0])),
                    "probability_distribution": pred.get('prob_vector', []),
                    "sequence_preview": valid_sequences[i][:50] + "..." if len(valid_sequences[i]) > 50 else valid_sequences[i]
                }
                results.append(result)
            
            return {
                "success": True,
                "predictions": results,
                "model_info": self.model_info,
                "total_sequences": len(results)
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "Prediction failed",
                "traceback": traceback.format_exc()
            }

# Global model wrapper instance
model_wrapper = ModelWrapper()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy",
        "model_available": model_wrapper.is_model_available(),
        "model_info": model_wrapper.model_info
    })

@app.route('/predict', methods=['POST'])
def predict():
    """Main prediction endpoint."""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "error": "No JSON data provided"
            }), 400
        
        sequences = data.get('sequences', [])
        if not sequences:
            return jsonify({
                "success": False,
                "error": "No sequences provided"
            }), 400
        
        if isinstance(sequences, str):
            sequences = [sequences]
        
        result = model_wrapper.predict_species(sequences)
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 500
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Internal server error"
        }), 500

@app.route('/model-info', methods=['GET'])
def model_info():
    """Get model information."""
    return jsonify({
        "model_info": model_wrapper.model_info,
        "model_available": model_wrapper.is_model_available(),
        "required_files": [
            'stack_meta_clf.pkl',
            'stack_label_encoder.pkl',
            'lgb_models_list.pkl', 
            'xgb_models_list.pkl'
        ]
    })

if __name__ == '__main__':
    print("Starting Gene Sequence Prediction API...")
    print(f"Model directory: {model_dir}")
    print(f"Model available: {model_wrapper.is_model_available()}")
    
    # Run the Flask app
    app.run(host='0.0.0.0', port=5000, debug=True)
