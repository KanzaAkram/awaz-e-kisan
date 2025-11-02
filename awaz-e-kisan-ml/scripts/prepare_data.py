import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import pickle
import os

# Create models directory if it doesn't exist
os.makedirs('../models', exist_ok=True)

print("Loading dataset...")
df = pd.read_csv('../data/Fertilizer_Prediction.csv')

# Display basic information
print("\n" + "="*50)
print("DATASET INFORMATION")
print("="*50)
print(f"\nTotal samples: {len(df)}")
print(f"\nColumns: {df.columns.tolist()}")
print(f"\nFirst 5 rows:")
print(df.head())

print(f"\n\nData types:")
print(df.dtypes)

print(f"\n\nMissing values:")
print(df.isnull().sum())

print(f"\n\nUnique values:")
print(f"Crops: {df['Crop Type'].nunique()} types")
print(f"Soil Types: {df['Soil Type'].nunique()} types")
print(f"Fertilizers: {df['Fertilizer Name'].nunique()} types")

print(f"\n\nCrop Types: {df['Crop Type'].unique()}")
print(f"Soil Types: {df['Soil Type'].unique()}")
print(f"Fertilizers: {df['Fertilizer Name'].unique()}")

# Encode categorical variables
print("\n" + "="*50)
print("ENCODING CATEGORICAL VARIABLES")
print("="*50)

le_crop = LabelEncoder()
le_soil = LabelEncoder()
le_fertilizer = LabelEncoder()

df['Crop_Type_Encoded'] = le_crop.fit_transform(df['Crop Type'])
df['Soil_Type_Encoded'] = le_soil.fit_transform(df['Soil Type'])
df['Fertilizer_Encoded'] = le_fertilizer.fit_transform(df['Fertilizer Name'])

print("\nEncoding completed!")

# Save encoders
pickle.dump(le_crop, open('../models/crop_encoder.pkl', 'wb'))
pickle.dump(le_soil, open('../models/soil_encoder.pkl', 'wb'))
pickle.dump(le_fertilizer, open('../models/fertilizer_encoder.pkl', 'wb'))
print("Encoders saved to models/ directory")

# Prepare features and target
print("\n" + "="*50)
print("PREPARING TRAINING DATA")
print("="*50)

X = df[['Temparature', 'Humidity ', 'Moisture', 'Soil_Type_Encoded', 
        'Crop_Type_Encoded', 'Nitrogen', 'Potassium', 'Phosphorous']]
y = df['Fertilizer_Encoded']

# Split data (80% train, 20% test)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print(f"\nTraining samples: {len(X_train)}")
print(f"Testing samples: {len(X_test)}")

# Save processed data
X_train.to_csv('../data/X_train.csv', index=False)
X_test.to_csv('../data/X_test.csv', index=False)
y_train.to_csv('../data/y_train.csv', index=False)
y_test.to_csv('../data/y_test.csv', index=False)

print("\nProcessed data saved!")
print("\n" + "="*50)
print("DATA PREPARATION COMPLETED SUCCESSFULLY!")
print("="*50)
print("\nNext step: Run train_model.py to train the ML model")