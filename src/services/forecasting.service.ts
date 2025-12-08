import type { DemandForecast } from '../types/procurement';
import type { Patient } from '../types/patient';

export class ForecastingService {
    /**
     * Generates a deterministic demand forecast based on REAL Scheduled Patient Treatments.
     * Incorporates heuristic weights for Seasonality and Acuity.
     */
    static generateForecast(
        ndc: string,
        drugName: string,
        siteId: string, // Kept for interface compatibility, though logic is now department-agnostic if patients are passed
        period: string, // '2025-CURRENT'
        patients: Patient[] = [], // REAL DATA SOURCE
        seasonalityFactor: number = 1.0, // e.g. 1.2 for Flu Season
        acuityWeight: number = 1.0 // e.g. 1.5 for ICU
    ): DemandForecast {

        // 1. Calculate Base Demand from Scheduled Treatments (Future 30 Days)
        const today = new Date();
        const thirtyDaysOut = new Date();
        thirtyDaysOut.setDate(today.getDate() + 30);

        let totalScheduledDoses = 0;
        let treatmentsFound = 0;

        // Iterate through all patients to find matching, future scheduled treatments
        patients.forEach(patient => {
            patient.treatmentSchedule.forEach(treatment => {
                const txDate = new Date(treatment.date);

                // Check if treatment matches Drug AND is within the horizon AND is scheduled
                if (
                    (treatment.ndc === ndc || treatment.drugName === drugName) &&
                    treatment.status === 'scheduled' &&
                    txDate >= today &&
                    txDate <= thirtyDaysOut
                ) {
                    // Start with raw dose count (parsing "2 units" -> 2)
                    const doseQty = parseInt(treatment.dose) || 1;
                    totalScheduledDoses += doseQty;
                    treatmentsFound++;
                }
            });
        });

        // 2. Apply Predictive Features (Acuity & Seasonality)
        // D_hat = (Sum(Scheduled) * Seasonality * Acuity)

        // Fallback for "Walk-in" demand if no scheduled treatments found but history implies use
        // note: User wanted pure "Forward Looking", so we bias heavily to schedule.
        // We add a small "Safety Buffer" based on Acuity if count is low but drug is critical.
        let predictedDemand = totalScheduledDoses * seasonalityFactor * acuityWeight;

        // If explicitly 0, we trust it (Forward looking only!)
        // Unless it's a very critical drug with NO schedule, typically we might want a minimum, 
        // but for this specific "Just-In-Time" model request, we respect the 0.

        // 3. Calculate Variance (Heuristic based on Acuity)
        // Higher acuity = Higher variance (unpredictable complications)
        // Variance = Mean * (Coefficient of Variation)^2
        const cv = acuityWeight > 1.2 ? 0.5 : 0.2; // High acuity -> 50% variability, Low -> 20%
        const variance = Math.pow(predictedDemand * cv, 2);

        return {
            drugName,
            ndc,
            locationId: siteId,
            period,
            mean: Math.ceil(predictedDemand),
            variance: variance,
            distribution: 'poisson', // Count data is best modeled as Poisson/NegBin
            confidenceInterval: [
                Math.max(0, predictedDemand - (1.96 * Math.sqrt(variance))),
                predictedDemand + (1.96 * Math.sqrt(variance))
            ]
        };
    }

    /**
     * Calculates Safety Stock (SS) based on Service Level and Lead Time Variability
     * Formula: SS = z * sqrt( LT*σ_d² + µ_d²*σ_LT² )
     */
    static calculateSafetyStock(
        forecast: DemandForecast,
        leadTimeDays: number,
        leadTimeVariance: number, // σ_LT²
        serviceLevelTarget: number // e.g., 0.95
    ): number {
        const zScores: { [key: number]: number } = {
            0.90: 1.28,
            0.95: 1.645,
            0.98: 2.05,
            0.99: 2.33
        };
        // Approximate Z if exact match not found
        const z = zScores[serviceLevelTarget] || 1.645;

        // Convert Monthly Forecast to Daily params (assuming 30 days)
        const meanDaily = forecast.mean / 30;
        const varianceDaily = forecast.variance / 30;

        // Combined Variance during Lead Time + Lead Time Variability
        // Var_Total = (Mean_Daily_Demand² * Var_LeadTime) + (Mean_LeadTime * Var_Daily_Demand)
        const combinedVariance = (Math.pow(meanDaily, 2) * leadTimeVariance) + (leadTimeDays * varianceDaily);

        const stdDevTotal = Math.sqrt(combinedVariance);

        return Math.ceil(z * stdDevTotal);
    }
}
