import joblib
import pickle
import numpy as np

class MLFertilizerService:
    def __init__(self):
        # Load model and encoders
        self.model = joblib.load('models/fertilizer_model.pkl')
        self.crop_encoder = pickle.load(open('models/crop_encoder.pkl', 'rb'))
        self.soil_encoder = pickle.load(open('models/soil_encoder.pkl', 'rb'))
        self.fertilizer_encoder = pickle.load(open('models/fertilizer_encoder.pkl', 'rb'))
    
    def predict_fertilizer(self, temperature, humidity, moisture, 
                          soil_type, crop_type, nitrogen, phosphorous, potassium):
        """
        Predict optimal fertilizer based on input parameters
        """
        # Encode categorical variables
        try:
            soil_encoded = self.soil_encoder.transform([soil_type])[0]
            crop_encoded = self.crop_encoder.transform([crop_type])[0]
        except ValueError as e:
            return {"error": f"Invalid crop or soil type: {str(e)}"}
        
        # Prepare input features
        features = np.array([[
            temperature, humidity, moisture, soil_encoded,
            crop_encoded, nitrogen, potassium, phosphorous
        ]])
        
        # Predict
        prediction = self.model.predict(features)[0]
        prediction_proba = self.model.predict_proba(features)[0]
        
        # Decode fertilizer name
        fertilizer_name = self.fertilizer_encoder.inverse_transform([prediction])[0]
        confidence = max(prediction_proba) * 100
        
        # Get top 3 recommendations
        top_3_indices = np.argsort(prediction_proba)[-3:][::-1]
        top_3_fertilizers = self.fertilizer_encoder.inverse_transform(top_3_indices)
        top_3_confidence = prediction_proba[top_3_indices] * 100
        
        return {
            "recommended_fertilizer": fertilizer_name,
            "confidence": round(confidence, 2),
            "alternatives": [
                {"name": fert, "confidence": round(conf, 2)}
                for fert, conf in zip(top_3_fertilizers[1:], top_3_confidence[1:])
            ]
        }
    
    def get_supported_crops(self):
        return list(self.crop_encoder.classes_)
    
    def get_supported_soils(self):
        return list(self.soil_encoder.classes_)