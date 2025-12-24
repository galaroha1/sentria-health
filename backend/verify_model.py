import torch
from model import ClinicalNetwork
import numpy as np
import os

MODEL_PATH = "backend/clinical_model_final.pth"

def verify():
    print("--- MODEL FORENSICS & VERIFICATION ---")
    
    # 1. Check File Existence
    if not os.path.exists(MODEL_PATH):
        print(f"❌ Model file not found at {MODEL_PATH}")
        return

    file_size = os.path.getsize(MODEL_PATH)
    print(f"✅ Model File Found: {file_size / 1024:.2f} KB")

    # 2. Load Weights
    device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")
    model = ClinicalNetwork(input_size=10, num_classes=50).to(device)
    try:
        model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
        print("✅ Weights Loaded Successfully")
    except Exception as e:
        print(f"❌ Failed to load weights: {e}")
        return

    # 3. Analyze Weights (The "Fugazi" Check)
    print("\n--- WEIGHT ANALYSIS ---")
    total_params = 0
    non_zero_params = 0
    
    for name, param in model.named_parameters():
        if "weight" in name:
            weights = param.data.cpu().numpy()
            mean = np.mean(weights)
            std = np.std(weights)
            min_w = np.min(weights)
            max_w = np.max(weights)
            
            print(f"Layer: {name:<20} | Mean: {mean:.5f} | Std: {std:.5f} | Range: [{min_w:.3f}, {max_w:.3f}]")
            
            # Check for "Dead" neurons (all zeros) or uninitialized (uniform small values)
            if std < 0.0001:
                print(f"   ⚠️ WARNING: Suspiciously low variance (Did this layer learn?)")
            else:
                print(f"   ✅ Variance detected (Layer has learned patterns)")
                
        total_params += param.numel()

    print(f"\nTotal Parameters: {total_params}")

    # 4. Deterministic Inference Test
    print("\n--- CONSISTENCY TEST ---")
    model.eval()
    
    # Create two identical inputs
    input1 = torch.rand(1, 10).to(device)
    input2 = input1.detach().clone()
    
    with torch.no_grad():
        out1_class, out1_qty = model(input1)
        out2_class, out2_qty = model(input2)
        
    # Check if identical inputs give identical outputs
    diff = torch.sum(torch.abs(out1_class - out2_class)).item()
    if diff == 0:
        print("✅ Deterministic Check Passed: Identical inputs produce identical outputs.")
    else:
        print(f"❌ Deterministic Check Failed: Difference {diff}")

    # 5. Sanity Check (Predictions)
    print("\n--- SANITY CHECK (Dummy Patient) ---")
    # Simulate a "Diabetes" profile (Older age)
    # Feature 0 is Age (0.6 = 60 years old)
    dummy_input = torch.zeros(1, 10).to(device)
    dummy_input[0, 0] = 0.6 # Age 60
    
    with torch.no_grad():
        pred_class, pred_qty = model(dummy_input)
        probs = torch.softmax(pred_class, dim=1)
        score, idx = torch.max(probs, 1)
        
    print(f"Input: Age 60 (Normalized 0.6)")
    print(f"Predicted Drug Class: {idx.item()}")
    print(f"Confidence: {score.item():.4f}")
    print(f"Predicted Quantity: {pred_qty.item():.2f}")
    
    if score.item() > 1.0/50.0:
        print("✅ Prediction is better than random guessing (1/50 = 0.02)")
    else:
        print("⚠️ Prediction is close to random guessing.")

if __name__ == "__main__":
    verify()
