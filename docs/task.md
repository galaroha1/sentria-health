# Transition to Real APIs

- [x] Analysis & Configuration <!-- id: 0 -->
    - [x] Check `.env` for API credentials
    - [x] Identify public vs private API opportunities
- [x] Implement Real Public Data Sources <!-- id: 1 -->
    - [x] Connect to **RxNav** (NLM) for interaction/clinical data
    - [x] Connect to **NADAC** (Open Data Socrata) for real pricing benchmarks
    - [x] Enhance **openFDA** integration
- [x] Implement Real Distributor Integrations <!-- id: 2 -->
    - [x] Refactor `McKessonService` to use real endpoints (with config for keys)
    - [x] Refactor `CardinalService` to use real endpoints (with config for keys)
    - [x] Remove random number generators
- [x] Verify Connectivity <!-- id: 3 -->
- [x] Restore Simulation Fallback <!-- id: 5 -->
- [x] Debug & Enhance AutoLogistics <!-- id: 6 -->
- [x] **Full Backend Persistence** (Firestore) <!-- id: 7 -->
    - [x] Integrate `sites` collection
- [x] **System-Wide UI Connectivity Audit** <!-- id: 8 -->
    - [x] Audit `Dashboard` actions (Quick Transfer, New Order)
    - [x] Audit `Procurement` actions (Add to Cart, Checkout)
- [x] **Restore & Persist Cart** <!-- id: 9 -->
    - [x] Audit `CartContext` and persist to Firestore
    - [x] Ensure `Cart` route and navigation are visible
    - [x] Verify Add-to-Cart flow from Marketplace
    - [x] Verified Checkout flow
    - [x] Implemented Real Checkout persistence in Firestore `users/{uid}/orders`
- [x] **Final Polish & Refactor** <!-- id: 10 -->
    - [x] Fix Critical Transfer Logic Bug (Inverted quantities)
    - [x] Audit `Settings` & `Profile` persistence
    - [x] Audit `StockTab` operations
    - [x] Refactor `ReorderingTab` to use real inventory data
- [x] **Compliance & Regulatory Module** <!-- id: 11 -->
    - [x] Create `Compliance.tsx` with PAD Resource Data
    - [x] Add Compliance route to `App.tsx` and `Sidebar.tsx`
    - [x] Populated `Compliance` page with MACPAC, Medi-Cal, eMedNY, and CMS data
- [x] **Scale Drug Database** <!-- id: 12 -->
    - [x] Create `DrugGenerator` service to algorithmically generate 1,000+ SKU variations
    - [x] Update `mockData.ts` to use generated large-scale inventory
    - [x] Ensure Marketplace handles pagination/virtualization or efficient rendering for large lists
    - [x] Integrated `DrugGenerator` with `Marketplace.tsx` (250+ items) and `Site Inventories` (50+ items).
- [x] **Real Drug Data Integration** <!-- id: 13 -->
    - [x] Create `fetch-drugs.js` script to source from openFDA
    - [x] Generate `real-drug-catalog.json` (500+ items)
    - [x] Integrate real data into `Marketplace` and `Inventories`
    - [x] Remove `DrugGenerator` service
    - [x] Restore `Header` component with Cart and Profile in top right
    - [x] Ensure `Header` is visible on all main pages
- [x] **Regional Network Expansion** <!-- id: 15 -->
    - [x] Generate dense network of 50+ sites within 1000 miles of Philadelphia
    - [x] Update `mockData.ts` with new sites (NY, DC, Boston, Pittsburgh, etc.)
    - [x] Verify `AutoLogisticsService` includes these new sites in calculations (Integrated via `allSites`)
    - [x] Ensure `InteractiveMap` handles the expanded view correctly (Zoom adjusted to 6)
- [x] **Enhance AI Optimization UI** <!-- id: 16 -->
    - [x] Refactor `DecisionsTab` scanning UI
    - [x] Add "Terminal mode" or detailed technical logs during scan
    - [x] Display real-time processed metrics (SKUs scanned, API latencies)
    - [x] Make the "Optimization Complete" state look more data-heavy
- [x] **Consolidate Navigation** <!-- id: 17 -->
    - [x] Analyze `Sidebar.tsx` structure
    - [x] Group related items (e.g., Logistics/Network, Clinical/Compliance)
    - [x] Remove redundant items (e.g., Cart if already in Header)
    - [x] Create collapsible sections or clearer hierarchy
- [x] **Visual Polish & Redesign** <!-- id: 18 -->
    - [x] Update Sidebar background to `bg-slate-50` (Light Blue/Grey)
    - [x] Add glassmorphic hover effects to navigation items
    - [x] Refine spacing and border aesthetics
    - [x] FIX: Add padding to main layout to prevent overlap with fixed sidebar
    - [x] FIX: Refactored Global Layout to use Native Window Scrolling (Removed `h-screen` lock)
- [x] **Restore Header Features** <!-- id: 14 -->
    - [x] Locate/Restore `Header` component with Cart and Profile in top right
    - [x] Ensure `Header` is visible on all main pages
    - [x] Create `SystemSettingsService` for key management
    - [x] Refactor distributor services to use dynamic keys
    - [x] Build `ApiManager` UI for Super Admins
    - [x] Integrate into `SettingsPage`
- [ ] **Fix Broken Features** <!-- id: 19 -->
    - [x] **Fix Connected Systems (NetworkHub)**
    - [x] Integrate `InteractiveMap` component into `NetworkHub.tsx`
    - [x] Implement `PartnerProfileModal` for "View Profile" action
- [x] **Restore Super Admin Access**
    - [x] Verify `Sidebar.tsx` permission logic
    - [x] Check `useAuth` hook and role assignment
- [x] **Real-Time Interactive Analytics**
    - [x] Install `recharts`
    - [x] Replace static `AnalyticsPage.tsx` with dynamic charts
- [x] **Global Command Center (War Room)**
    - [x] Polish UI and visual effects
    - [x] Ensure real-time data connectivity (or simulation)
- [x] **Fix Clinical Operations Interactivity**
    - [x] Create `CaseCartModal`
    - [x] Implement `PreferenceCardView` (or enhance existing view)
    - [x] UI Consistency Audit & Fixes
    - [x] Audit Dashboard & Navigation Buttons
    - [x] Audit Status Indicators (Green/Red Dots)
    - [x] Standardize Button Shadings & Gradients
    - [x] Fix Data Generation Tab Visuals
- [ ] Advanced Optimization Engine- [x] **Implement Advanced AI Forecasting (Eq 1.1)**
    - [x] Probabilistic Demand (Poisson/NegBin) in `ForecastingService`
    - [x] Exogenous Factors (Seasonality/Flu)
- [x] **Implement Stochastic Optimization (Eq 3)**
    - [x] Cost Function Z Minimization in `OptimizationService`
    - [x] Risk-Adjusted Supplier Selectiongic
    - [ ] Implement Cost Matrix (Buy vs Internal vs External)
    - [ ] Wire `AppContext` with Patient Data
- [x] Implement Patient Search & Highlight in Clinical Hub
    - [x] Add Search Input to `ClinicalHub`
    - [x] Implement Search Logic (Filter Appointments)
    - [x] Update `CalendarGrid` to accept and display highlights
    - [x] Implement Enter key navigation to appointment month
    - [x] Improve Appointment Visibility
        - [x] Reduce schedule deviation to 90 days (increase density)
        - [x] Add "Total Upcoming Events" counter to Clinical Hub
- [x] Restrict Network to Penn System
    - [x] Rename/Filter mock sites in `AppContext` to be Penn-specific (HUP, Penn Presbyterian, Pennsylvania Hospital)
    - [x] Remove generic external sites
- [x] **Implement Monthly Clinical Schedule**
    - [x] Create `CalendarGrid` component
    - [x] Update `ClinicalHub` to harvest data from `PatientService`
    - [x] Replace daily list with monthly calendar view
- [x] **Unify Patient Data**
    - [x] Add `patients` state to `AppContext`
    - [x] Seed `patients` from `PatientService` on app load
    - [x] Unify `SimulationContext` and `AppContext` patient data
- [x] Add "Add Patient" button to Inventory Patient Data tab
- [x] Verify sync between Inventory and Clinical Hub using Browser Tool
- [x] Push changes to remote repository
- [x] Fix build errors (CI failure resolution)

# New User Requests (Session 2)

## Authentication & Accounts
- [x] **Enforce 30-min Session Persistence**
    - [x] Implement session timeout logic in `AuthContext`
    - [x] Ensure login page redirect if session expired or missing
- [x] **Fix Account Creation Process**
    - [x] Debug `SignUp`/`Register` component and `AuthContext` registration logic
    - [x] Enabled Open Registration
- [x] **Implement Advanced AI Framework**
    - [x] Forecast Model (Eq 1.1)
    - [x] Safety Stock (Eq 2)
    - [x] Stochastic Optimization (Eq 3)
- [x] **Verify & Deploy AI Engine**
    - [x] Force Scarcity in Mock Data (0-15 units)
    - [x] Align Patient/Inventory Data (Fix "0 Proposals" Bug)
    - [x] Consolidate UI (AI Tab in Inventory, Remove Fake Widgets)
    - [x] Final Verification of "Auto-Logistics" Flow
    - [x] Audit Optimization Realism (Confirmed Real Patient/Inventory usage)

## Logistics Optimization (Advanced)
- [ ] **Comprehensive Logistics Engine**
    - [x] **Advanced Logistics Engine**
    - [x] Integrate `Patient` context (Condition, Weight, Schedule) <!-- id: 4 -->
    - [x] Implement `Buy vs Transfer` logic in `AutoLogisticsService` <!-- id: 5 -->
    - [x] Integrate `MarketplaceService` for real-time pricing <!-- id: 6 -->
    - [x] Update UI (`LogisticsHub`) to show reasoning and "Buy" options <!-- id: 7 -->

## Logistics & Data Refinement [NEW]
- [x] **Data Model Enhancement**
    - [x] Update `mockData.ts` to include realistic departments for all sites (UPenn, etc.).
    - [x] Ensure inventory is associable with departments (or mock it to appear so).
- [x] **Logic Debugging**
    - [x] Investigate why internal transfers are missing (Buy vs. Transfer scoring).
    - [x] Tune `AutoLogisticsService` to prioritize or surface internal transfers.
    - [x] Ensure "Department" level visibility in UI suggestions.
    - [x] Fix "Network Site (External)" naming to use real site names (e.g., "Penn Presbyterian").

## Data Generation & Navigation Refactor [NEW]
- [x] **Navigation Refactor**
    - [x] Create "Data Generation" tab/page.
    - [x] Move "Patient Data" and "Advanced" tabs from Inventory to "Data Generation".
- [x] **UI Fixes**
    - [x] Change Patient Generation banner from sticky to fading notification (Confirmed: Toasts used).
- [x] **Clinical Data Integration**
    - [x] Connect `ClinicalHub` calendar to global `patients` context (remove local mock).
- [x] **Critical Logic Fix**
    - [x] Ensure `PatientService` generates strictly future appointments.
    - [x] **Data Flow Architecture**
        - [x] Implement "Single Source of Truth" via Firestore Subscription in `AppContext`.
        - [x] Reorder `App.tsx` providers to allow `AppContext` accessing `AuthContext`.
        - [x] Verified `delete user logic` cascades correctly.
- [x] **Documentation**
    - [x] Explicitly document the `Auto Logistics Equation` in `AutoLogisticsService.ts`.
    - [x] Create `system_architecture.md` detailing data flow.

## Logic Refinement & Network Dormancy [NEW]
- [x] **Disable Network Logic (Dormant)**
    - [x] Hide "Network" from `Sidebar.tsx` navigation.
    - [x] Hide "Network" from `MobileNav.tsx` navigation.
- [x] **Fix Patient Generation**
    - [x] Update `src/services/patient.service.ts` to ensure `nextVisit` dates are strictly in the future.
- [x] **Documentation**
    - [x] Explicitly document the `Auto Logistics Equation` in `AutoLogisticsService.ts`.

## Advanced Procurement Engine (MILP/Heuristic Implementation)
**Goal**: Implement `SelectOrderPlan(t)` to minimize total network cost + risk.

### 1. Data Model Enhancements
- [x] Define interfaces for `SupplierCatalog`, `DemandForecast`, `OptimizationParams`.
- [x] Update `DrugInventoryItem` to include `criticality`, `substitutability`, `shelfLife`.

### 2. Core Logic Components
- [x] **Forecasting Engine**: Implement probabilistic demand forecasting (Mocked/Heuristic).
- [x] **Safety Stock Calculator**: Implement `SS = z * sqrt(LT*σ² + µ²*σ_LT²)`.
- [x] **Supplier Scoring**: Implement weighted multi-criteria scoring (`price`, `reliability`, `leadTime`, `risk`).

### 3. Optimization Solver (Heuristic Approach)
- [x] Implement `OptimizationService.selectOrderPlan()`:
    -   **Tiering**: Identify Critical (A) vs Routine (B) items.
    -   **Objective Function**: Minimize Expected Cost (Purchase + Holding + Stockout + Risk).
    -   **Solver**: Greedy heuristic + Local search (since client-side JS limitations prevent full MILP).

### 4. Integration
- [x] Expose results in `DecisionsTab` or new `ProcurementDashboard`.
- [x] Generate detailed `ProcurementProposal` based on solver output.
    - [x] **Presentation**:
        - [x] Show detailed reasoning in the suggestions (e.g., "Buying is 20% cheaper than transferring").

## UI/UX Refinement
- [x] **Fix Map Overlay Z-Index**
    - [x] Adjust z-index of interactive map relative to sidebar/menu
- [x] **Remove Double Scrollbars**
    - [x] Audit global layout and page containers for overflow issues
    - [x] Unify scrolling to the main window or specific container logic
