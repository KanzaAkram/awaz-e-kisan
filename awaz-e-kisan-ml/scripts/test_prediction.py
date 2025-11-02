import sys
sys.path.append('..')
from services.ml_fertilizer_service import MLFertilizerService

# Initialize service
service = MLFertilizerService()

# Test prediction
print("Testing Fertilizer Prediction...\n")

result = service.predict_fertilizer(
    temperature=25,
    humidity=65,
    moisture=50,
    soil_type='Loamy',
    crop_type='Wheat',
    nitrogen=40,
    phosphorous=20,
    potassium=150
)

print("Prediction Result:")
print(f"Recommended: {result['recommended_fertilizer']}")
print(f"Confidence: {result['confidence']}%")
print(f"\nAlternatives:")
for alt in result['alternatives']:
    print(f"  - {alt['name']}: {alt['confidence']}%")