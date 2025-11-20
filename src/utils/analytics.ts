import { AuditLogEntry } from '../types/audit';
import { DrugInventoryItem } from '../types/location';

export interface StockoutPrediction {
    drugName: string;
    ndc: string;
    currentStock: number;
    dailyConsumption: number;
    daysUntilStockout: number;
    severity: 'critical' | 'warning' | 'stable';
    recommendedAction: string;
}

export interface ConsumptionTrend {
    date: string;
    actual: number;
    predicted: number;
}

/**
 * Calculates the average daily consumption of a drug over a specified period (default 30 days).
 */
export function calculateConsumptionRate(
    logs: AuditLogEntry[],
    drugName: string,
    days: number = 30
): number {
    const now = new Date();
    const cutoffDate = new Date(now.setDate(now.getDate() - days));

    const relevantLogs = logs.filter(log =>
        log.drugName === drugName &&
        log.action === 'remove' && // Only count removals (usage)
        new Date(log.timestamp) >= cutoffDate
    );

    const totalConsumed = relevantLogs.reduce((sum, log) => sum + Math.abs(log.quantityChange), 0);

    // Avoid division by zero if calculating for very short periods, but generally we average over 'days'
    return totalConsumed / days;
}

/**
 * Predicts stockouts for a list of inventory items based on historical consumption.
 */
export function predictStockouts(
    inventory: DrugInventoryItem[],
    logs: AuditLogEntry[]
): StockoutPrediction[] {
    return inventory.map(item => {
        const dailyRate = calculateConsumptionRate(logs, item.drugName);

        // If no consumption history, assume stable (or use a default heuristic if needed)
        if (dailyRate === 0) {
            return {
                drugName: item.drugName,
                ndc: item.ndc,
                currentStock: item.quantity,
                dailyConsumption: 0,
                daysUntilStockout: Infinity,
                severity: 'stable',
                recommendedAction: 'Monitor usage'
            };
        }

        const daysUntilStockout = item.quantity / dailyRate;
        let severity: 'critical' | 'warning' | 'stable' = 'stable';
        let recommendedAction = 'Stock levels healthy';

        if (daysUntilStockout <= 3) {
            severity = 'critical';
            recommendedAction = 'Emergency order recommended';
        } else if (daysUntilStockout <= 7) {
            severity = 'warning';
            recommendedAction = 'Plan replenishment soon';
        }

        return {
            drugName: item.drugName,
            ndc: item.ndc,
            currentStock: item.quantity,
            dailyConsumption: dailyRate,
            daysUntilStockout: Math.round(daysUntilStockout),
            severity,
            recommendedAction
        };
    }).filter(p => p.severity !== 'stable'); // Only return items that need attention
}

/**
 * Generates trend data for charts.
 * Simple linear regression or moving average could be used here.
 * For now, we'll aggregate daily usage.
 */
export function generateConsumptionTrend(
    logs: AuditLogEntry[],
    days: number = 30
): ConsumptionTrend[] {
    const trends: ConsumptionTrend[] = [];
    const now = new Date();

    for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(now.getDate() - i);
        const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD

        // Calculate actual usage for this day
        const dailyUsage = logs
            .filter(log =>
                log.action === 'remove' &&
                log.timestamp.startsWith(dateStr)
            )
            .reduce((sum, log) => sum + Math.abs(log.quantityChange), 0);

        // Simple prediction: moving average of previous 3 days (mock logic for now)
        // In a real app, this would be more sophisticated
        const predicted = dailyUsage * 1.1; // Mock prediction logic

        trends.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            actual: dailyUsage,
            predicted: parseFloat(predicted.toFixed(1))
        });
    }

    return trends;
}
