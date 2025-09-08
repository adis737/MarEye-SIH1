# Gene Sequence Prediction Model

This directory contains the machine learning model for predicting species from ATGC gene sequences.

## Structure

- `models/` - Trained model files (.pkl, .h5, .joblib)
- `data/` - Training and reference datasets (.csv, .json)
- `notebooks/` - Jupyter notebooks for model training and analysis (.ipynb)
- `scripts/` - Python scripts for preprocessing and inference
- `config/` - Configuration files for model parameters

## Integration

The model integrates with the main application through the API endpoint:
`/api/ml/gene-prediction`

## Requirements

- Python 3.8+
- TensorFlow/PyTorch
- Pandas, NumPy
- Scikit-learn
- Biopython

## Usage

1. Place your trained model files in the `models/` directory
2. Add reference datasets to the `data/` directory  
3. Update configuration in `config/model_config.json`
4. The API will automatically detect and load the model

## Model Expected Interface

The model should accept:
- Input: DNA sequence string (ATGC format)
- Output: Species prediction with confidence score
