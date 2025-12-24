from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import torch
import numpy as np
from backend.model import ClinicalNetwork
import os

app = FastAPI()
# Trigger Reload: New Model Available

# Input Schema
class PatientData(BaseModel):
    age: int
    gender: str
    diagnosis: str
    vitals: dict

# Load Model (Lazy Loading)
model = None
device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")

def load_model():
    global model
    try:
        model_path = "backend/clinical_model_final.pth"
        if not os.path.exists(model_path):
             print(f"⚠️ Model not found at {model_path}. Running in Stub Mode.")
             return

        # Initialize same architecture
        model = ClinicalNetwork(input_size=10, num_classes=50).to(device)
        model.load_state_dict(torch.load(model_path, map_location=device))
        model.eval()
        print(f"✅ Model Loaded from {model_path}")
    except Exception as e:
        print(f"❌ Failed to load model: {e}")

@app.on_event("startup")
async def startup_event():
    load_model()
    print("Sentria AI Server Started.")

@app.post("/predict")
async def predict_drug(patient: PatientData):
    if not model:
         # Fallback for Demo before Models are trained
         return {
            "recommended_drug": "Metformin (Fallback - Model Not Trained)",
            "confidence": 0.0,
            "source": "Python-Backend-Stub"
        }

    # 1. Vectorize (Mock Logic for Demo - Production needs ValidationService)
    # [AgeNorm, Gender, DiagEnc...]
    features = np.zeros(10, dtype=np.float32) 
    features[0] = patient.age / 100.0
    
    inputs = torch.tensor(features).unsqueeze(0).to(device)
    
    with torch.no_grad():
        out_class, out_qty = model(inputs)
        
        # Class Prediction
        probs = torch.softmax(out_class, dim=1)
        score, idx = torch.max(probs, 1)
        
        # Quantity Prediction
        qty = out_qty.item()
        
    return {
        "recommended_drug": f"Drug_Class_{idx.item()}", 
        "recommended_quantity": int(qty),
        "confidence": float(score.item()),
        "source": "Python-Backend-Inference-MultiHead"
    }

@app.get("/health")
def health_check():
    return {"status": "active", "device": str(device)}

# RLHF: Doctor Feedback Endpoint
class FeedbackData(BaseModel):
    patient_features: dict
    predicted_drug: str
    actual_drug: str
    comments: str

@app.post("/feedback")
def log_feedback(feedback: FeedbackData):
    """
    Saves doctor corrections (RLHF) to a CSV for retraining.
    """
    feedback_file = "backend/doctor_feedback.csv"
    
    # Check if header needed
    write_header = not os.path.exists(feedback_file)
    
    with open(feedback_file, "a") as f:
        if write_header:
            f.write("age,diagnosis,predicted,actual,comments\n")
        
        # Simple logging
        age = feedback.patient_features.get("age", 0)
        diag = feedback.patient_features.get("diagnosis", "Unknown")
        f.write(f"{age},{diag},{feedback.predicted_drug},{feedback.actual_drug},{feedback.comments}\n")
        
    print(f"📝 RLHF Feedback saved: {feedback.actual_drug} (Predicted: {feedback.predicted_drug})")
    return {"status": "saved", "message": "Feedback recorded for next training cycle."}
