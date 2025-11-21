export interface PatientData {
    age: number; // Normalized 0-1 (e.g., age / 100)
    hasCondition: number; // 0 or 1
    geneticMarker: number; // 0 or 1
    lifestyleFactor: number; // 0-1 (1 = healthy, 0 = unhealthy)
    demand: number; // 0 or 1 (Target)
}

export const generatePatientData = (count: number): PatientData[] => {
    const data: PatientData[] = [];

    for (let i = 0; i < count; i++) {
        const age = Math.random(); // Normalized age
        const hasCondition = Math.random() > 0.7 ? 1 : 0; // 30% chance
        const geneticMarker = Math.random() > 0.8 ? 1 : 0; // 20% chance
        const lifestyleFactor = Math.random();

        // Hidden "Ground Truth" Formula
        // Demand is higher if:
        // - Older (age * 0.3)
        // - Has condition (condition * 0.5)
        // - Has genetic marker (marker * 0.4)
        // - Poor lifestyle ( (1 - lifestyle) * 0.2 )
        const score =
            (age * 0.3) +
            (hasCondition * 0.5) +
            (geneticMarker * 0.4) +
            ((1 - lifestyleFactor) * 0.2) +
            (Math.random() * 0.1 - 0.05); // Small noise

        // Threshold for demand
        const demand = score > 0.5 ? 1 : 0;

        data.push({
            age,
            hasCondition,
            geneticMarker,
            lifestyleFactor,
            demand
        });
    }

    return data;
};
