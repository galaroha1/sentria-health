import torch
import torch.nn as nn
import torch.nn.functional as F

class ClinicalNetwork(nn.Module):
    def __init__(self, input_size, num_classes):
        super(ClinicalNetwork, self).__init__()
        # Architecture Design:
        # Input Layer -> Hidden (128) -> Hidden (64) -> Hidden (32) -> Output (Softmax)
        # Shared Layers
        self.fc1 = nn.Linear(input_size, 128)
        self.fc2 = nn.Linear(128, 64)
        self.fc3 = nn.Linear(64, 32)
        self.dropout = nn.Dropout(0.2)
        
        # HEAD A: Classification (Drug ID)
        self.output_class = nn.Linear(32, num_classes)
        
        # HEAD B: Regression (Quantity)
        self.output_qty = nn.Linear(32, 1)

    def forward(self, x):
        x = F.relu(self.fc1(x))
        x = self.dropout(x)
        x = F.relu(self.fc2(x))
        x = self.dropout(x)
        x = F.relu(self.fc3(x))
        
        # Branching
        logits_class = self.output_class(x)
        pred_qty = F.relu(self.output_qty(x)) # Quantity must be positive
        
        return logits_class, pred_qty
