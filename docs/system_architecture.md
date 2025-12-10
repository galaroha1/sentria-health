# System Architecture & Data Flow

## Core Philosophy
The application follows a **Single Source of Truth** architecture using **Google Firebase Firestore**.
All application state (Patients, Inventory, Logistics) is derived directly from the database.

## Data Flow Pipeline

```mermaid
graph TD
    A[Data Generator / Simulation] -->|Writes| B(Firestore Database)
    B -->|Real-time Subscription| C[AppContext (Global State)]
    C -->|Propagates| D[Clinical Hub]
    C -->|Propagates| E[Logistics Hub]
    C -->|Propagates| F[Inventory System]
```

### 1. Data Generation (Source)
-   **Component**: `SimulationContext` (Data Generation Tab)
-   **Action**: Generates synthetic patient data, including conditions, demographics, and *Treatment Schedules*.
-   **Storage**: Writes directly to `users/{userId}/simulations` collection in Firestore.

### 2. State Synchronization (The Bridge)
-   **Component**: `AppContext`
-   **Mechanism**: Maintains an active `onSnapshot` listener (subscription) to the `simulations` collection.
-   **Mapping**: Converts raw Firestore documents into standardized `Patient` objects.
-   **Reactivity**:
    -   **New Data**: Automatically added to `patients` array.
    -   **Deleted Data**: "Clear Data" action in settings wipes the database -> Listener fires -> `patients` array becomes empty -> UI resets instantly.

### 3. UI Consumption (The View)
-   **Clinical Hub**: Consumes `patients` from `AppContext`. Maps `patient.treatmentSchedule` to Calendar Events.
-   **Logistics Hub**: (Future) Derives demand forecasts based on `patient.treatmentSchedule`.

## Data Models

### Patient Object (Derived)
Derived from `SimulationResult` in DB.
```typescript
interface Patient {
  id: string;
  name: string;
  diagnosis: string;
  treatmentSchedule: Treatment[]; // Critical for Schedule View
  // ...
}
```

### Reset Flow
1. User clicks "Delete All Data".
2. `SimulationContext` calls `deleteCollection('simulations')`.
3. Firestore notifies `AppContext` listener.
4. `AppContext` sets `patients = []`.
5. `ClinicalHub` re-renders with empty schedule.
**No Page Reload Required.**
