# Gene Sequence Model Integration

This document explains how to integrate and use the gene sequence prediction model with the AI Biodiversity Platform.

## 🧬 Model Overview

The model is a stacked ensemble classifier that combines:
- **LightGBM models** for base predictions
- **XGBoost models** for additional predictions  
- **Meta classifier** for final ensemble prediction
- **Label encoder** for species name mapping

## 📁 Model Files

The model files are located in the `Model/` directory:

```
Model/
├── stack_meta_clf.pkl          # Meta classifier
├── stack_label_encoder.pkl     # Species label encoder
├── lgb_models_list.pkl         # LightGBM models
├── xgb_models_list.pkl         # XGBoost models
├── novel_candidates_isoforest.csv  # Novel species candidates
├── stack_oof_predictions.csv   # Out-of-fold predictions
├── X_full.npy                  # Full feature matrix
└── infer_helper.py             # Inference helper functions
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install Python dependencies
cd ml-models
pip install -r requirements.txt
```

### 2. Start the Model Server

```bash
# Option 1: Use the startup script (recommended)
python scripts/start-model-server.py

# Option 2: Start manually
cd ml-models
python scripts/model_wrapper.py
```

The server will start on `http://localhost:5000`

### 3. Start the Next.js Application

```bash
# In a new terminal
npm run dev
```

The web application will be available at `http://localhost:3000`

## 🔧 API Endpoints

### Model Server (Python Flask API)

- `GET /health` - Health check and model status
- `GET /model-info` - Model information and capabilities
- `POST /predict` - Predict species from DNA sequences

### Next.js API Routes

- `GET /api/ml/gene-prediction` - Check model status
- `POST /api/ml/gene-prediction` - Predict species (proxies to Python API)

## 📊 Usage Examples

### 1. Using the Web Interface

1. Navigate to `/solutions/ai-processing`
2. Scroll down to "Try Our AI Model" section
3. Add DNA sequences (A, T, G, C only)
4. Click "Analyze Sequences"
5. View results with confidence scores

### 2. Direct API Usage

```bash
# Check model status
curl http://localhost:5000/health

# Predict species
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{"sequences": ["ATGCGATCGATCGATCG"]}'
```

### 3. JavaScript/TypeScript Integration

```typescript
const response = await fetch('/api/ml/gene-prediction', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sequences: ['ATGCGATCGATCGATCG'],
    sequenceType: 'COI'
  })
});

const result = await response.json();
console.log(result.predictions);
```

## 🧪 Supported Sequence Types

- **COI** (Cytochrome c oxidase subunit I)
- **16S rRNA**
- **18S rRNA** 
- **ITS** (Internal Transcribed Spacer)
- **General DNA sequences**

## 📈 Model Performance

- **Accuracy**: High accuracy on trained species
- **Confidence Scoring**: Provides probability distributions
- **Novel Species Detection**: Identifies potentially new species
- **Processing Speed**: < 2.3 seconds per sequence

## 🔍 Features

### Gene Sequence Analyzer Component

The `GeneSequenceAnalyzer` component provides:

- **Sequence Input**: Manual entry or file upload
- **Batch Processing**: Multiple sequences at once
- **Real-time Validation**: Ensures valid DNA sequences
- **Results Display**: Species predictions with confidence scores
- **Export Functionality**: Download results as CSV
- **Error Handling**: Graceful handling of invalid inputs

### Integration Points

1. **AI Processing Page** (`/solutions/ai-processing`)
   - Interactive model demonstration
   - Real-time species identification

2. **Population Trends Page** (`/solutions/population-trends`)
   - Population analysis through gene sequencing
   - Biodiversity assessment tools

## 🛠️ Troubleshooting

### Model Server Not Starting

```bash
# Check Python version (3.8+ required)
python --version

# Install dependencies
pip install -r ml-models/requirements.txt

# Check model files exist
ls Model/*.pkl
```

### API Connection Issues

```bash
# Test model server
curl http://localhost:5000/health

# Check Next.js API
curl http://localhost:3000/api/ml/gene-prediction
```

### Common Errors

1. **"Model files not found"**
   - Ensure all `.pkl` files are in the `Model/` directory

2. **"Model service unavailable"**
   - Start the Python server: `python scripts/start-model-server.py`

3. **"Invalid sequence"**
   - Sequences must contain only A, T, G, C characters
   - No spaces or special characters allowed

## 🔄 Development Workflow

1. **Model Updates**: Replace files in `Model/` directory
2. **API Changes**: Modify `ml-models/scripts/model_wrapper.py`
3. **Frontend Updates**: Update components in `components/`
4. **Testing**: Use the web interface to test changes

## 📝 Environment Variables

```bash
# Optional: Custom Python API URL
PYTHON_API_URL=http://localhost:5000
```

## 🤝 Contributing

1. Test your changes with the web interface
2. Ensure all model files are present
3. Update documentation if needed
4. Test both single and batch sequence processing

## 📞 Support

For issues with the model integration:

1. Check the console logs in both terminals
2. Verify all model files are present
3. Test the Python API directly
4. Check the browser network tab for API calls
