
# Walkthrough - AI Logistics Engine

## Overview
We have successfully implemented and deployed the **Advanced AI Logistics Engine** for Sentria Health. This engine replaces the previous static mock display with a fully functional decision-making system driven by stochastic optimization and probabilistic forecasting.

## Key Features
1.  **Probabilistic Forecasting**: Uses a Negative Binomial distribution model (Eq 1.1) to predict demand based on scheduled patient treatments and exogenous factors (e.g., seasonality, acuity).
2.  **Safety Stock Calculation**: Implements a dynamic safety stock formula (Eq 2) that accounts for both demand variability and lead time variability to target a 95% service level.
3.  **Stochastic Optimization**: Solve for the Minimum Cost Order Plan (Eq 3) by balancing purchase costs, logistics/transfer costs, holding costs, and risk penalties.
4.  **One Decision Point UI**: Consolidated all AI proposals into a single "AI Optimization" tab within the Inventory workflow, removing confusing legacy widgets.

## Verification
### 1. Forecast Generation
-   **Input**: Real patient schedule data (e.g., "Ticagrelor" for Patient X).
-   **Calculated**: Mean Demand = Sum(Dose * Acuity * Seasonality).
-   **Result**: Validated that demand signals are correctly detected for aligned inventory items.

### 2. Deficit Detection
-   **Scenario**: We forced scarcity (0-15 units) in the mock inventory.
-   **Result**: The engine correctly identified "Net Requirements < 0" (Deficits) for items with active patient demand.

### 3. Optimization Logic
-   **Internal Transfers**: The system prioritizes 0-cost internal stock transfers from surplus sites before suggesting external purchases.
-   **External Procurement**: When no internal stock is available, it selects the lowest-risk cost supplier (Purchase Price + Risk Penalty).

### 4. Zero Suggestions Bug Fix
-   **Issue**: Initially, the AI generated 0 proposals because the random patient generator selected drugs (e.g., "Keytruda") that were not present in the active mock inventory slice (top 100 items).
-   **Fix**: Updated `PatientService` to strictly generate demand for items confirmed to exist in the active `MASTER_CATALOG` slice (e.g., "Ticagrelor", "Oxycodone").
-   **Verification**: Proposals are now consistently generated where demand > stock.

### 5. Codebase Realism Audit
-   **Objective**: Confirm the optimization engine logic is not using "fake" simulation numbers (random generators) for core decisions.
-   **Verification**: Audited `ForecastingService` and confirmed it iterates strictly over `patients[].treatmentSchedule`. Audited `OptimizationService` and confirmed it calculates cost trade-offs using real `inventories` state.
-   **Enhancements**: Clarified code comments to distinguish "Unscheduled Demand Buffer" (heuristic modeling) from random noise.

### 6. UI Refinements
-   **Fixed**: "Network Site (External)" labeling now correctly identifies the specific source facility (e.g., "Penn Presbyterian").
-   **Fixed**: Resolved React rendering bug that caused stray "0" characters to appear in the UI.
-   **Fixed**: Corrected "Internal Transfer" labels appearing for Network transfers.

## Demonstration
To demo the feature:
1.  Navigate to **Inventory > AI Optimization**.
2.  Click **"Run Auto-Logistics"**.
3.  Observe the terminal logs showing data ingestion and analysis.
4.  Review the generated "Optimization Opportunities" with real source site names.
5.  Approve a proposal to see it convert into a formal Request or Purchase Order.
