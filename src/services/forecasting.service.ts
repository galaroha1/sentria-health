import type { DemandForecast } from '../types/procurement';

export class ForecastingService {
    /**
     * Generates a probabilistic demand forecast for a given SKU at a location.
     * Uses a mock Negative Binomial / Normal approximation based on historical "volatility".
     */
    static generateForecast(
        ndc: string,
        drugName: string,
        siteId: string,
        period: string, // '2025-01'
        historyFactor: number = 1.0 // 1.0 = stable, >1.0 = volatile
    ): DemandForecast {
        // MOCK LOGIC: Base demand on randomness + criticality
        // Real implementation would use ARIMA or Bayesian State-Space models

        // 1. Determine Base Parameters (µ)
        // High volume for common drugs, low for specialty
        const isSpecialty = ['Keytruda', 'Biologic', 'Oncology'].some(k => drugName.includes(k));
        const baseMean = isSpecialty ? 15 : 150;

        // 2. Introduce Variability (σ²)
        // High variance for specialty drugs (sporadic demand)
        const cv = isSpecialty ? 0.8 : 0.2; // Coefficient of Variation (σ / µ)
        const mean = Math.round(baseMean * historyFactor);
        const stdDev = mean * cv;
        const variance = stdDev * stdDev;

        return {
            drugName,
            ndc,
            locationId: siteId,
            period,
            mean,
            variance,
            distribution: isSpecialty ? 'negative_binomial' : 'normal',
            confidenceInterval: [
                Math.max(0, mean - (1.96 * stdDev)), // 95% Lower
                mean + (1.96 * stdDev)               // 95% Upper
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
