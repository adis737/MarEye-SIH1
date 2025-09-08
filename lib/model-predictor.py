#!/usr/bin/env python3
"""
Direct model predictor for Next.js API integration.
This script can be called directly from Node.js without needing a separate Flask server.
"""

import os
import sys
import json
import traceback
from typing import Dict, List, Any

# Add the Model directory to the path
model_dir = os.path.join(os.path.dirname(__file__), '..', 'Model')
sys.path.insert(0, model_dir)

try:
    from infer_helper import predict_sequences
except ImportError as e:
    print(f"Warning: Could not import infer_helper: {e}")
    predict_sequences = None

def is_model_available() -> bool:
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

def predict_species(sequences: List[str]) -> Dict[str, Any]:
    """Predict species from gene sequences."""
    if not is_model_available():
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
            "model_info": {
                "name": "Gene Sequence Species Classifier",
                "version": "1.0.0",
                "description": "Stacked ensemble model for species identification from gene sequences",
                "supported_genes": ["COI", "16S", "18S", "ITS", "General"],
                "model_type": "Stacked Ensemble (LightGBM + XGBoost + Meta Classifier)"
            },
            "total_sequences": len(results)
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "Prediction failed",
            "traceback": traceback.format_exc()
        }

def get_model_info() -> Dict[str, Any]:
    """Get model information."""
    return {
        "model_info": {
            "name": "Gene Sequence Species Classifier",
            "version": "1.0.0",
            "description": "Stacked ensemble model for species identification from gene sequences",
            "supported_genes": ["COI", "16S", "18S", "ITS", "General"],
            "model_type": "Stacked Ensemble (LightGBM + XGBoost + Meta Classifier)"
        },
        "model_available": is_model_available(),
        "required_files": [
            'stack_meta_clf.pkl',
            'stack_label_encoder.pkl',
            'lgb_models_list.pkl', 
            'xgb_models_list.pkl'
        ]
    }

if __name__ == "__main__":
    # Command line interface for testing
    import argparse
    
    parser = argparse.ArgumentParser(description="Gene Sequence Predictor")
    parser.add_argument("--test", action="store_true", help="Test with sample sequence")
    parser.add_argument("--info", action="store_true", help="Show model info")
    parser.add_argument("--sequences", nargs="+", help="DNA sequences to predict")
    
    args = parser.parse_args()
    
    if args.info:
        info = get_model_info()
        print(json.dumps(info, indent=2))
    elif args.test:
        result = predict_species(["ATGCGATCGATCGATCGATCGATCGATCGATCGATCGATCG"])
        print(json.dumps(result, indent=2))
    elif args.sequences:
        result = predict_species(args.sequences)
        print(json.dumps(result, indent=2))
    else:
        print("Use --help for usage information")
