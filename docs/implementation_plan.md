# Session 2 Implementation Plan

## Goal
Address user feedback regarding authentication persistence, account creation bugs, logistics realism, and UI/UX polish (map z-index, scrollbars).

## User Review Required
> [!IMPORTANT]
> **Logistics Equation**: I will allow you to review the specific mathematical model for the "Auto Logistics" feature before I finalize the code.

## Completed Changes

### Logistics Engine (AI Core)
#### [NEW] [ai_optimization_equation.md](file:///Users/rohangala/.gemini/antigravity/brain/98014eff-f82b-4103-9fc6-593cbf76814d/ai_optimization_equation.md) - Theoretical Framework
#### [MODIFY] [ForecastingService.ts](file:///Users/rohangala/Downloads/Sentria Health Code Base/src/services/forecasting.service.ts) - Implemented Probabilistic Forecast (Eq 1.1) & Safety Stock (Eq 2)
#### [MODIFY] [OptimizationService.ts](file:///Users/rohangala/Downloads/Sentria Health Code Base/src/services/optimization.service.ts) - Implemented Minimum Cost Supplier Selection (Eq 3)

### Data Alignment & UI Consolidation
#### [MODIFY] [mockData.ts](file:///Users/rohangala/Downloads/Sentria Health Code Base/src/data/location/mockData.ts) - Forced Scarcity (0-15 units)
#### [MODIFY] [PatientService.ts](file:///Users/rohangala/Downloads/Sentria Health Code Base/src/services/patient.service.ts) - Aligned Patient Drug Names with Catalog
#### [MODIFY] [AppContext.tsx](file:///Users/rohangala/Downloads/Sentria Health Code Base/src/context/AppContext.tsx) - Centralized Patient Data Source
#### [MODIFY] [Inventory.tsx](file:///Users/rohangala/Downloads/Sentria Health Code Base/src/pages/Inventory.tsx) - Integrated "AI Optimization" Tab
#### [MODIFY] [Dashboard.tsx](file:///Users/rohangala/Downloads/Sentria Health Code Base/src/pages/Dashboard.tsx) - Removed Legacy Widgets & Fixed Navigation Links**Goal**: Create a "Grand Unified Logic" for supply chain decisions.
- **Inputs to Add**:
  - `Patient Context`: Condition (Critical/Stable), Weight (Dosing), Visit Date (Deadline).
  - `Marketplace Data`: Current SKU price, Shipping time for new purchase.
- **New Decision Logic**:
  1.  **Patient-Driven Urgency**:
      -   If `Visit Date` < `Standard Shipping Time` -> Force **Transfer** or **Expedited Buy**.
      -   If `Patient Condition` = Critical -> Force **Fastest Route** regardless of cost.
      - [x] Update UI (`LogisticsHub`) to show reasoning and "Buy" options <!-- id: 7 -->

## Logic Refinement & Network Dormancy [NEW]
- [ ] **Disable Network Logic (Dormant)**
    - [ ] Hide "Network" from `Sidebar.tsx` navigation.
    - [ ] Hide "Network" from `MobileNav.tsx` navigation.
- [ ] **Fix Patient Generation**
    - [ ] Update `src/services/patient.service.ts` `generateMockPatients`:
        - [ ] Ensure `lastVisit` is in the past (logical).
        - [ ] Ensure `nextVisit` (appointments) are strictly in the **future** (e.g., Today + 1-30 days).
  2.  **Buy vs. Transfer Equation**:
      -   `Cost_Transfer` = (Distance * Rate) + Handling.
      -   `Cost_Buy` = (Market_Price * Qty) + Shipping.
      -   *Data Source*: `MarketplaceService.checkMarketplace(ndc)` vs internal `AutoLogisticsService.getPricing()`.
      -   **Decision**: If `Cost_Buy < Cost_Transfer` AND `Time_Buy < Deadline`, Suggest **BUY**.
  3.  **Transport Nuance**:
      -   If Patient needs immediate administration -> Drone/Courier.
      -   If heavy weight patient (high dose) -> Check volume/capacity limits for Drones.

#### [NEW] [MarketplaceService.ts](file:///Users/rohangala/Downloads/Sentria%20Health%20Code%20Base/src/services/marketplaceService.ts)
- Created simple mock service to simulate obtaining real-time SKU pricing and lead times.
- Defines `checkMarketplace(ndc)` returning price, stock status, and shipping days.

#### [MODIFY] [LogisticsHub.tsx](file:///Users/rohangala/Downloads/Sentria%20Health%20Code%20Base/src/pages/LogisticsHub.tsx) or equivalent UI
- Expose the deep logic in the UI. Show "Why we chose this":
  - "Buying Save $X vs Transfer"
  - "Transfer is 2 days faster than Buying"
  - "Patient visit is tomorrow; Standard shipping too slow"

### Authentication & Accounts
#### [MODIFY] [AuthContext.tsx](file:///Users/rohangala/Downloads/Sentria%20Health%20Code%20Base/src/context/AuthContext.tsx)
- **Fix Persistence**: Use `localStorage` to save `sessionStart` timestamp.
- **Logic**: On app load, `if (Date.now() - savedSessionStart > 30 mins) logout()`.
- **Account Creation**:
    > [!NOTE]
    > Currently, Sign Up is **Invite Only**. It checks if an admin has pre-created a user profile. I will debug why this might be failing even for valid invites, OR enable "Open Registration" if you prefer.

# Advanced Procurement Engine Implementation

## Goal
Implement a comprehensive logistics decision engine `SelectOrderPlan(t)` that minimizes total network costs (purchasing, holding, stockout, logistics, risk) while respecting constraints.

## Technical Approach
Due to client-side limitations, we will use a **Heuristic-based Solver** that approximates the MILP formulation described by the user.

### 1. Data Model Updates
-   **Inputs**:
    -   `DemandForecast`: { mean: number, variance: number, distribution: 'normal' | 'poisson' }
    -   `Supplier`: { reliability: number, leadTimeVariance: number, costFunctions: Piecewise[] }
    -   `RiskParams`: { recallProbability: number, disruptionRisk: number }
-   **Outputs**:
    -   `OrderPlan`: { sku: string, supplier: string, quantity: number, type: 'contract'|'spot' }

### 2. Logic Modules (in `OptimizationService`)
#### A. Forecasting & Safety Stock
-   Generate Mock Forecast `D ~ N(µ, σ²)`.
-   Compute Safety Stock: `SS = z * sqrt(LT*σ_d² + µ_d²*σ_LT²)`.

#### B. Supplier Scoring
-   `Score = w_p*Price + w_r*Reliability + w_l*LeadTime + w_risk*Risk`.

#### C. Heuristic Optimization (The Solver)
-   **Step 1**: Calculate `NetRequirements(t)` = Forecast + SS - OnHand - OnOrder.
-   **Step 2**: If Requirement > 0:
    -   Evaluate all valid Suppliers (Capacity, Contract).
    -   Calculate `TotalExpectedCost` for each supplier option (Purchase + Holding + RiskPenalty).
    -   Select option with `Min(TotalExpectedCost)`.
-   **Step 3**: Check Order Multiples (Pack Size) and Min Order Qty.

### 3. UI Updates
-   Update `DecisionsTab` to display the "Optimization Run" details:
    -   "Why we ordered X": Show calculations for Safety Stock, Risk Penalty, and Savings.
    -   "Supplier Scorecard": Show why Supplier A was chosen over Supplier B.

### UI/UX Polish
#### [MODIFY] [InteractiveMap.tsx](file:///Users/rohangala/Downloads/Sentria%20Health%20Code%20Base/src/components/location/InteractiveMap.tsx)
- Force `z-index: 1` on Map container to ensure it stays below the Sidebar (`z-index: 50`) and Modals (`z-index: 100`).

#### [MODIFY] [App.tsx](file:///Users/rohangala/Downloads/Sentria%20Health%20Code%20Base/src/App.tsx)
- Fix double scrollbars by ensuring `html/body` are `overflow: hidden` and only the `main` content area has `overflow-y: auto`.

## Refactoring & Data Generation Plan
### Navigation
- Move `PatientDataTab` and `AdvancedTab` out of `Inventory.tsx`.
- Create new `DataGeneration` page or tab.
- Update `Sidebar` (or `Inventory` tabs structure) to reflect this.

### UI Improvements
- Update `PatientDataTab` to use `addNotification` or a temporary toast instead of a sticky alert for generation success.

### Clinical Integration
- Refactor `ClinicalHub.tsx` to iterate over `patients` context directly for calendar events.

### Critical Logic
- Update `PatientService.generateSchedule` to ensure `date` > `Date.now()` + 1 day always.

## Logistics Data & Logic Refinement
### Data Model
- **Mock Data**: Flesh out `departments` in `src/data/location/mockData.ts` with real-world departments for UPenn (e.g., Oncology, Neurology, ED).
- **Inventory**: Verify if `SiteInventory` can support department granularity. If not, add `departmentId` to `DrugInventoryItem` or simulate it.

### Logic Tuning
- **AutoLogisticsService**: Review `calculateScore`. If `cost` is the only factor, "Buy" (if cheap) might win.
- **Goal**: Ensure that if internal stock exists, it is at least *suggested* or prioritized if time/urgency allows.
- **UI**: Update cards to show "Source: [Department] @ [Site]" instead of just "Site".

## Verification Plan
### Manual Verification
- **Auth**: Login -> Wait/Manipulate Time -> Refresh -> Verify Logout.
- **Signup**: Create new user -> Verify login success.
- **Logistics**: Run simulation -> Check calculated time against expected equation.
- **UI**: Scroll pages, Open Sidebar over Map.
## Advanced Optimization Engine Implementation

### Goal
Implement a sophisticated Supply Chain Optimization engine based on Operations Research principles (Heuristic MILP). The system will minimize Total Cost $Z$ while respecting network topology and clinical constraints.

### Core Components

#### 1. Predictive Layer (`ForecastingService.ts`)
**Input**:
- `Patient[]` (serves as ADT/Census feed).
- `TreatmentSchedule` (serves as Surgical/Procedure schedule).
- **Logic**:
    - Iterate through all future appointments (next 30d).
    - Map `condition/drug` to specific inventory SKUs (e.g. "Knee Replacement" -> "Knee Kit").
    - Calculate $\hat{D}_{i,j,t}$ (Predicted Demand).
    - **Note**: Will use heuristic seasonality/acuity weights.

#### 2. Network Topology & Cost Matrix (`OptimizationService.ts`)
**Nodes**:
- Each `SiteInventory` entry is now treated as a Department Node ($j$).
**Edges**:
- **Vendor $\to$ Node**: Cost = $P_{buy} + S_{delivery}$.
- **Node $\to$ Node (Internal)**: Cost = $0 (or negligible labor cost).
- **Node $\to$ Node (External)**: Cost = $S_{courier}$ (distance-based).

#### 3. Solver Logic (`OptimizationService.selectOrderPlan`)
**Objective Function**: Minimize $Z = \sum (C_{buy} + C_{transfer} + C_{hold} + C_{shortage})$

**Algorithm Step-by-Step**:
1.  **Net Demand Calculation**: For each Dept/Item:
    - $Net = (Stock + OnOrder) - (\hat{D} + SS)$.
    - Identify **Deficits** (Need stock) and **Surpluses** (Have excess).
2.  **Cost Matrix Construction**:
    - For each Deficit Node $B$:
        - Calculate cost to **Buy** from Vendor.
        - Calculate cost to **Transfer** from every Surplus Node $A$.
3.  **Greedy Optimization**:
    - Select the lowest cost "Arc" (Edge) to satisfy the deficit.
    - If $Cost(Internal Transfer) < Cost(Buy)$, create Transfer.
    - Else, create Purchase Order.

### Verification
- **Scenario A (Internal Transfer)**: Creating a shortage in "Surgery" and a surplus in "ER" (same location) should trigger a 0-cost transfer.
- **Scenario B (Buy)**: Creating a system-wide shortage should trigger a Vendor Purchase.
- **Scenario C (High Acuity)**: "Emergency" need (high shortage penalty) should justify higher transport costs if needed.
