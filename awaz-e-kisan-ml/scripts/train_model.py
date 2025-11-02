import pandas as pd
import pickle
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib
import time

print("="*50)
print("FERTILIZER RECOMMENDATION MODEL TRAINING")
print("="*50)

# Load prepared data
print("\nLoading training data...")
X_train = pd.read_csv('../data/X_train.csv')
X_test = pd.read_csv('../data/X_test.csv')
y_train = pd.read_csv('../data/y_train.csv').values.ravel()
y_test = pd.read_csv('../data/y_test.csv').values.ravel()

print(f"Training samples: {len(X_train)}")
print(f"Testing samples: {len(X_test)}")
print(f"Features: {X_train.columns.tolist()}")

# Train Random Forest model
print("\n" + "="*50)
print("TRAINING MODEL...")
print("="*50)

start_time = time.time()

model = RandomForestClassifier(
    n_estimators=100,        # Number of trees
    max_depth=20,            # Maximum depth of trees
    min_samples_split=5,     # Minimum samples to split
    min_samples_leaf=2,      # Minimum samples in leaf
    random_state=42,
    n_jobs=-1,               # Use all CPU cores
    verbose=1
)

model.fit(X_train, y_train)

training_time = time.time() - start_time
print(f"\nTraining completed in {training_time:.2f} seconds")

# Evaluate model
print("\n" + "="*50)
print("MODEL EVALUATION")
print("="*50)

# Training accuracy
y_train_pred = model.predict(X_train)
train_accuracy = accuracy_score(y_train, y_train_pred)
print(f"\nTraining Accuracy: {train_accuracy * 100:.2f}%")

# Testing accuracy
y_test_pred = model.predict(X_test)
test_accuracy = accuracy_score(y_test, y_test_pred)
print(f"Testing Accuracy: {test_accuracy * 100:.2f}%")

# Detailed classification report
print("\n" + "-"*50)
print("Classification Report:")
print("-"*50)

# Load fertilizer encoder to show actual names
fertilizer_encoder = pickle.load(open('../models/fertilizer_encoder.pkl', 'rb'))
target_names = fertilizer_encoder.classes_

print(classification_report(y_test, y_test_pred, target_names=target_names))

# Feature importance
print("\n" + "-"*50)
print("Feature Importance:")
print("-"*50)

feature_names = ['Temperature', 'Humidity', 'Moisture', 'Soil Type', 
                 'Crop Type', 'Nitrogen', 'Potassium', 'Phosphorous']
importances = model.feature_importances_

for name, importance in sorted(zip(feature_names, importances), 
                               key=lambda x: x[1], reverse=True):
    print(f"{name:15s}: {importance:.4f} {'█' * int(importance * 50)}")

# Save model
print("\n" + "="*50)
print("SAVING MODEL")
print("="*50)

joblib.dump(model, '../models/fertilizer_model.pkl')
print("Model saved to: models/fertilizer_model.pkl")

# Model info
import os
model_size = os.path.getsize('../models/fertilizer_model.pkl') / (1024 * 1024)
print(f"Model size: {model_size:.2f} MB")

print("\n" + "="*50)
print("MODEL TRAINING COMPLETED SUCCESSFULLY!")
print("="*50)
print(f"\nFinal Test Accuracy: {test_accuracy * 100:.2f}%")
print("\nYou can now use this model in your Flask API!")