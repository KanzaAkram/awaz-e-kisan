from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import joblib
import pickle
import numpy as np

app = FastAPI(title="Awaz-e-Kisan ML API", version="1.0.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model and encoders on startup
try:
    model = joblib.load('models/fertilizer_model.pkl')
    crop_encoder = pickle.load(open('models/crop_encoder.pkl', 'rb'))
    soil_encoder = pickle.load(open('models/soil_encoder.pkl', 'rb'))
    fertilizer_encoder = pickle.load(open('models/fertilizer_encoder.pkl', 'rb'))
    print("✓ Model and encoders loaded successfully!")
except Exception as e:
    print(f"✗ Error loading model: {e}")

# Request models
class FertilizerRequest(BaseModel):
    crop_type: str
    soil_type: str
    nitrogen: Optional[float] = 40
    phosphorous: Optional[float] = 20
    potassium: Optional[float] = 150
    temperature: Optional[float] = 25
    humidity: Optional[float] = 70
    moisture: Optional[float] = 50

class FertilizerResponse(BaseModel):
    recommended_fertilizer: str
    confidence: float
    alternatives: List[dict]
    input_summary: dict

# Routes
@app.get("/")
def read_root():
    return {
        "message": "Awaz-e-Kisan ML API",
        "status": "running",
        "endpoints": ["/predict", "/supported-crops", "/supported-soils"]
    }

@app.post("/predict", response_model=FertilizerResponse)
def predict_fertilizer(request: FertilizerRequest):
    try:
        # Encode categorical variables
        soil_encoded = soil_encoder.transform([request.soil_type])[0]
        crop_encoded = crop_encoder.transform([request.crop_type])[0]
        
        # Prepare features
        features = np.array([[
            request.temperature,
            request.humidity,
            request.moisture,
            soil_encoded,
            crop_encoded,
            request.nitrogen,
            request.potassium,
            request.phosphorous
        ]])
        
        # Predict
        prediction = model.predict(features)[0]
        prediction_proba = model.predict_proba(features)[0]
        
        # Get recommended fertilizer
        fertilizer_name = fertilizer_encoder.inverse_transform([prediction])[0]
        confidence = float(max(prediction_proba) * 100)
        
        # Get top 3 alternatives
        top_3_indices = np.argsort(prediction_proba)[-3:][::-1]
        top_3_fertilizers = fertilizer_encoder.inverse_transform(top_3_indices)
        top_3_confidence = prediction_proba[top_3_indices] * 100
        
        alternatives = [
            {"name": fert, "confidence": round(float(conf), 2)}
            for fert, conf in zip(top_3_fertilizers[1:], top_3_confidence[1:])
        ]
        
        return {
            "recommended_fertilizer": fertilizer_name,
            "confidence": round(confidence, 2),
            "alternatives": alternatives,
            "input_summary": {
                "crop": request.crop_type,
                "soil": request.soil_type,
                "N": request.nitrogen,
                "P": request.phosphorous,
                "K": request.potassium
            }
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid input: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.get("/supported-crops")
def get_supported_crops():
    crops = crop_encoder.classes_.tolist()
    return {"crops": crops, "count": len(crops)}

@app.get("/supported-soils")
def get_supported_soils():
    soils = soil_encoder.classes_.tolist()
    return {"soils": soils, "count": len(soils)}

@app.get("/health")
def health_check():
    return {"status": "healthy", "model_loaded": model is not None}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)