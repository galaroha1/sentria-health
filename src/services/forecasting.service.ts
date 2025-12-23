import type { DemandForecast } from '../types/procurement';
import type { Patient } from '../types/patient';

export class ForecastingService {
    /**
     * Generates a deterministic demand forecast based on REAL Scheduled Patient Treatments.
     * Incorporates heuristic weights for Seasonality and Acuity.
     */
    /**
     * Advanced Multilevel Probabilistic Forecast (Eq 1.1)
     * D(h) = mu(h) + eta(h)
     */
    /**
     * Calculates specific dosage requirement for a patient based on biometrics and drug type.
     * Returns: quantity in units
     */
    public static calculateDosage(patient: Patient, drugName: string): number {
        const name = drugName.toLowerCase();
        let quantity = 1; // Default base unit

        // 1. ONCOLOGY: BSA-Based Dosing (mg/m2) -> Converted to Vials
        // Keytruda/Opdivo/Chemo typically 2mg/kg or fixed mg/m2
        if (name.includes('keytruda') || name.includes('opdivo') || name.includes('fluorouracil') || patient.type === 'oncology') {
            const bsa = patient.biometrics?.bsa || 1.73; // Fallback to average human BSA
            // Mock: 100mg/m2 required
            const mgRequired = bsa * 100; // e.g. 1.73 * 100 = 173mg
            // Vials: Comes in 100mg vials. Round up.
            quantity = Math.ceil(mgRequired / 100);
        }

        // 2. PEDIATRIC: Weight-Based Dosing (mg/kg)
        else if (patient.type === 'pediatric') {
            const weight = patient.biometrics?.weight || 20; // Fallback 20kg
            // Rule: 1 vial per 30kg of body weight
            quantity = Math.ceil(weight / 30);
        }

        // 3. STANDARD ADULT: Fixed Dosing w/ Acuity multiplier
        else {
            // High acuity diagnoses might require double dosing or more frequent admin
            if (patient.diagnosis.toLowerCase().includes('stage iv') || patient.diagnosis.toLowerCase().includes('severe')) {
                quantity = 2;
            } else {
                quantity = 1;
            }
        }

        return quantity;
    }

    /**
     * Advanced Multilevel Probabilistic Forecast (Eq 1.1)
     * D(h) = sum(PatientNeed_p) + eta(h)
     */
    static generateProbabilisticForecast(
        ndc: string,
        siteId: string,
        patients: Patient[] = [],
        // Optional params with defaults
        drugName: string = 'Unknown Drug',
        period: string = 'CURRENT',
        seasonalityFactor: number = 1.0,
        acuityWeight: number = 1.0
    ): DemandForecast & { modelComponents: any, expectedDemand: number } {

        // 1. FORECAST HORIZON: 90 Days (H)
        const today = new Date();
        const forecastHorizon = new Date();
        forecastHorizon.setDate(today.getDate() + 90);

        // 1.1 DETERMINISTIC COMPONENT (mu)
        // Sum(Scheduled * SpecificDosage * Seasonality * Risk)
        let mu_total = 0;

        // Exogenous Factors
        const isFluSeason = new Date().getMonth() > 9 || new Date().getMonth() < 2;
        const exogenousFactor = (drugName.includes('Vaccine') || drugName.includes('Tamiflu')) && isFluSeason
            ? 1.4
            : 1.0;

        patients.forEach(patient => {
            patient.treatmentSchedule.forEach(treatment => {
                const txDate = new Date(treatment.date);

                if (
                    (treatment.ndc === ndc || treatment.drugName === drugName) &&
                    treatment.status === 'scheduled' &&
                    txDate >= today &&
                    txDate <= forecastHorizon
                ) {
                    // CALCULATE TRUE PATIENT NEED
                    const specificQty = this.calculateDosage(patient, drugName);

                    // Patient Risk Factor (Adherence/No-Show)
                    // Older patients > 70 might miss appointments? Or be more compliant?
                    // Let's assume Distance is a factor (mocked as random 0.8-1.0 adherence if missing data)
                    const adherenceProb = 0.95;

                    // Time-Varying Seasonality (W(h))
                    const seasonalW = seasonalityFactor;

                    mu_total += specificQty * adherenceProb * seasonalW * exogenousFactor;
                }
            });
        });

        // 1.2 STOCHASTIC COMPONENT (eta) ~ NegBin(alpha, beta)
        // Approximated here as Poisson(lambda)
        const lambda_base = mu_total * 0.2; // 20% Unscheduled buffer
        const L = Math.exp(-lambda_base);
        let k = 0;
        let p = 1;
        do {
            k++;
            p *= Math.random();
        } while (p > L);
        const eta_stochastic = k - 1;

        // 1.3 Total Demand D(H)
        const D_total = mu_total + eta_stochastic;

        // 1.4 Variance Calculation (for Safety Stock)
        // Higher variance for Oncology (due to BSA variability and condition changes)
        // Var = Mean + (Dispersion * Mean^2)
        const dispersion = drugName.toLowerCase().includes('keytruda') || drugName.toLowerCase().includes('cancer') ? 0.8 : 0.2;
        const variance = D_total + (dispersion * Math.pow(D_total, 2));

        return {
            drugName,
            ndc,
            locationId: siteId,
            period,
            mean: Math.ceil(D_total),
            variance: variance,
            distribution: 'negative_binomial', // Upgraded from Poisson
            confidenceInterval: [
                Math.max(0, D_total - (1.96 * Math.sqrt(variance))),
                D_total + (1.96 * Math.sqrt(variance))
            ],
            modelComponents: {
                mu_deterministic: mu_total,
                eta_stochastic: eta_stochastic,
                exogenous_impact: exogenousFactor,
                acuity_impact: acuityWeight
            },
            expectedDemand: Math.ceil(D_total)
        };
    }

    // Proxy for backward compatibility if needed, but we will update caller
    static generateForecast(
        ndc: string,
        drugName: string,
        siteId: string,
        period: string,
        patients: Patient[] = [],
        seasonalityFactor: number = 1.0,
        acuityWeight: number = 1.0
    ): DemandForecast {
        const adv = this.generateProbabilisticForecast(ndc, siteId, patients, drugName, period, seasonalityFactor, acuityWeight);
        return {
            ...adv,
            mean: adv.mean,
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

        // Advanced Cumulative Variance (Eq 2)
        // SS = Z * sigma_total
        // Where sigma_total^2 = Sum(Var(D(h))) over Horizon

        // Advanced Cumulative Variance (Eq 2)
        // SS = z * sqrt( LT*σ_d² + µ_d²*σ_LT² )

        // 1. Convert Horizon stats (90 days) to Daily stats
        const horizonDays = 90;
        const meanDaily = forecast.mean / horizonDays;
        const varianceDaily = forecast.variance / horizonDays; // Assuming i.i.d. daily variance approx

        // 2. Component A: Variance from Demand fluctuations during Lead Time
        // = LT * Var_Daily
        const demandVarianceDuringLT = leadTimeDays * varianceDaily;

        // 3. Component B: Variance from Lead Time fluctuations
        // = Mean_Daily^2 * Var_LT
        const leadTimeVarianceComponent = Math.pow(meanDaily, 2) * leadTimeVariance;

        // 4. Total Combined Variance
        const totalSystemVariance = demandVarianceDuringLT + leadTimeVarianceComponent;
        const sigmaTotal = Math.sqrt(totalSystemVariance);

        return Math.ceil(z * sigmaTotal);
    }
}
