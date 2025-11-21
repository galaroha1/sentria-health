export interface Drug {
    name: string;
    ndc: string;
    category: 'IV Antibiotic' | 'Chemotherapy' | 'Biologic' | 'IV Fluid/Electrolyte' | 'Anticoagulant' | 'Immunosuppressant' | 'Monoclonal Antibody' | 'IV Corticosteroid' | 'IV Antifungal' | 'Pain Management';
    conditions: string[]; // Indicated for
    contraindications: string[];
    commonAllergies: string[];
    typicalDosage: string;
    administrationRoute: 'IV' | 'IM' | 'Subcutaneous' | 'IV Infusion';
}

export const DRUG_DATABASE: Drug[] = [
    // IV Antibiotics
    {
        name: 'Vancomycin (IV)',
        ndc: '0409-4095-01',
        category: 'IV Antibiotic',
        conditions: ['MRSA Infection', 'Severe Bacterial Infection', 'Sepsis', 'Endocarditis'],
        contraindications: ['Vancomycin Allergy'],
        commonAllergies: ['Vancomycin Allergy', 'Glycopeptide Allergy'],
        typicalDosage: '15-20 mg/kg IV every 8-12 hours',
        administrationRoute: 'IV Infusion'
    },
    {
        name: 'Piperacillin-Tazobactam (Zosyn)',
        ndc: '0206-8862-01',
        category: 'IV Antibiotic',
        conditions: ['Severe Bacterial Infection', 'Pneumonia', 'Sepsis', 'Intra-abdominal Infection'],
        contraindications: ['Penicillin Allergy', 'Beta-lactam Allergy'],
        commonAllergies: ['Penicillin Allergy'],
        typicalDosage: '3.375g IV every 6 hours or 4.5g IV every 6-8 hours',
        administrationRoute: 'IV Infusion'
    },
    {
        name: 'Ceftriaxone (IV)',
        ndc: '0143-9924-01',
        category: 'IV Antibiotic',
        conditions: ['Bacterial Infection', 'Pneumonia', 'Meningitis', 'Gonorrhea'],
        contraindications: ['Cephalosporin Allergy'],
        commonAllergies: ['Cephalosporin Allergy', 'Penicillin Allergy'],
        typicalDosage: '1-2g IV daily',
        administrationRoute: 'IV'
    },
    {
        name: 'Meropenem (IV)',
        ndc: '0206-3895-01',
        category: 'IV Antibiotic',
        conditions: ['Severe Bacterial Infection', 'Sepsis', 'Meningitis', 'Multi-drug Resistant Infection'],
        contraindications: ['Carbapenem Allergy'],
        commonAllergies: ['Carbapenem Allergy', 'Beta-lactam Allergy'],
        typicalDosage: '1-2g IV every 8 hours',
        administrationRoute: 'IV Infusion'
    },

    // Chemotherapy
    {
        name: 'Pembrolizumab (Keytruda)',
        ndc: '0006-3026-02',
        category: 'Chemotherapy',
        conditions: ['Non-Small Cell Lung Cancer', 'Melanoma', 'Head and Neck Cancer', 'Renal Cell Carcinoma'],
        contraindications: ['Severe Immune-Related Adverse Events'],
        commonAllergies: [],
        typicalDosage: '200mg IV every 3 weeks or 400mg IV every 6 weeks',
        administrationRoute: 'IV Infusion'
    },
    {
        name: 'Carboplatin',
        ndc: '0703-5748-01',
        category: 'Chemotherapy',
        conditions: ['Ovarian Cancer', 'Lung Cancer', 'Bladder Cancer'],
        contraindications: ['Severe Myelosuppression', 'Platinum Allergy'],
        commonAllergies: ['Platinum Allergy'],
        typicalDosage: 'AUC 5-7.5 IV every 3-4 weeks',
        administrationRoute: 'IV Infusion'
    },
    {
        name: 'Paclitaxel (Taxol)',
        ndc: '0703-4759-01',
        category: 'Chemotherapy',
        conditions: ['Breast Cancer', 'Ovarian Cancer', 'Lung Cancer', 'Pancreatic Cancer'],
        contraindications: ['Severe Hypersensitivity', 'Neutropenia'],
        commonAllergies: ['Taxane Allergy'],
        typicalDosage: '175mg/m² IV every 3 weeks or 80mg/m² weekly',
        administrationRoute: 'IV Infusion'
    },

    // Biologics & Monoclonal Antibodies
    {
        name: 'Infliximab (Remicade)',
        ndc: '0006-3356-20',
        category: 'Biologic',
        conditions: ['Crohn\'s Disease', 'Ulcerative Colitis', 'Rheumatoid Arthritis', 'Ankylosing Spondylitis'],
        contraindications: ['Active Tuberculosis', 'Severe Infection', 'Heart Failure'],
        commonAllergies: ['Murine Protein Allergy'],
        typicalDosage: '5mg/kg IV at weeks 0, 2, 6, then every 8 weeks',
        administrationRoute: 'IV Infusion'
    },
    {
        name: 'Rituximab (Rituxan)',
        ndc: '0004-1973-01',
        category: 'Monoclonal Antibody',
        conditions: ['Non-Hodgkin Lymphoma', 'Chronic Lymphocytic Leukemia', 'Rheumatoid Arthritis'],
        contraindications: ['Active Severe Infection'],
        commonAllergies: ['Murine Protein Allergy'],
        typicalDosage: '375mg/m² IV weekly for 4-8 doses',
        administrationRoute: 'IV Infusion'
    },
    {
        name: 'Tocilizumab (Actemra)',
        ndc: '0004-0234-02',
        category: 'Biologic',
        conditions: ['Rheumatoid Arthritis', 'Giant Cell Arteritis', 'Systemic Sclerosis'],
        contraindications: ['Active Infection', 'Severe Hepatic Impairment'],
        commonAllergies: [],
        typicalDosage: '4-8mg/kg IV every 4 weeks',
        administrationRoute: 'IV Infusion'
    },

    // Anticoagulants (IV)
    {
        name: 'Heparin (IV)',
        ndc: '0409-2720-01',
        category: 'Anticoagulant',
        conditions: ['Deep Vein Thrombosis', 'Pulmonary Embolism', 'Atrial Fibrillation', 'Acute Coronary Syndrome'],
        contraindications: ['Active Bleeding', 'Severe Thrombocytopenia', 'Heparin-Induced Thrombocytopenia'],
        commonAllergies: ['Heparin Allergy'],
        typicalDosage: '80 units/kg bolus, then 18 units/kg/hr infusion',
        administrationRoute: 'IV Infusion'
    },
    {
        name: 'Enoxaparin (Lovenox)',
        ndc: '0075-0610-40',
        category: 'Anticoagulant',
        conditions: ['Deep Vein Thrombosis', 'Pulmonary Embolism', 'Acute Coronary Syndrome'],
        contraindications: ['Active Bleeding', 'Severe Renal Impairment'],
        commonAllergies: ['Heparin Allergy', 'Pork Allergy'],
        typicalDosage: '1mg/kg subcutaneous every 12 hours',
        administrationRoute: 'Subcutaneous'
    },

    // IV Corticosteroids
    {
        name: 'Methylprednisolone (Solu-Medrol)',
        ndc: '0009-0115-01',
        category: 'IV Corticosteroid',
        conditions: ['Severe Asthma', 'COPD Exacerbation', 'Autoimmune Disease', 'Inflammatory Conditions', 'Spinal Cord Injury'],
        contraindications: ['Systemic Fungal Infection'],
        commonAllergies: [],
        typicalDosage: '40-125mg IV every 6 hours',
        administrationRoute: 'IV'
    },
    {
        name: 'Dexamethasone (IV)',
        ndc: '0641-0376-25',
        category: 'IV Corticosteroid',
        conditions: ['Cerebral Edema', 'Severe Inflammation', 'Nausea from Chemotherapy', 'COVID-19 (severe)'],
        contraindications: ['Systemic Fungal Infection'],
        commonAllergies: [],
        typicalDosage: '4-20mg IV daily',
        administrationRoute: 'IV'
    },

    // IV Antifungals
    {
        name: 'Micafungin (Mycamine)',
        ndc: '0469-0300-50',
        category: 'IV Antifungal',
        conditions: ['Candidemia', 'Invasive Candidiasis', 'Esophageal Candidiasis'],
        contraindications: ['Echinocandin Allergy'],
        commonAllergies: [],
        typicalDosage: '100-150mg IV daily',
        administrationRoute: 'IV Infusion'
    },
    {
        name: 'Amphotericin B Liposomal',
        ndc: '0469-3017-30',
        category: 'IV Antifungal',
        conditions: ['Invasive Fungal Infection', 'Aspergillosis', 'Cryptococcal Meningitis'],
        contraindications: ['Amphotericin Allergy'],
        commonAllergies: ['Amphotericin Allergy'],
        typicalDosage: '3-5mg/kg IV daily',
        administrationRoute: 'IV Infusion'
    },

    // IV Fluids & Electrolytes
    {
        name: 'Normal Saline (0.9% NaCl)',
        ndc: '0338-0048-04',
        category: 'IV Fluid/Electrolyte',
        conditions: ['Dehydration', 'Hypovolemia', 'Fluid Resuscitation', 'Medication Dilution'],
        contraindications: ['Hypernatremia', 'Fluid Overload'],
        commonAllergies: [],
        typicalDosage: '1000mL IV bolus or continuous infusion',
        administrationRoute: 'IV Infusion'
    },
    {
        name: 'Potassium Chloride (IV)',
        ndc: '0409-6629-02',
        category: 'IV Fluid/Electrolyte',
        conditions: ['Hypokalemia', 'Electrolyte Replacement'],
        contraindications: ['Hyperkalemia', 'Severe Renal Impairment'],
        commonAllergies: [],
        typicalDosage: '10-40 mEq IV over 2-4 hours (max 10 mEq/hr)',
        administrationRoute: 'IV Infusion'
    },

    // Pain Management (IV)
    {
        name: 'Morphine Sulfate (IV)',
        ndc: '0409-1234-01',
        category: 'Pain Management',
        conditions: ['Severe Pain', 'Post-Operative Pain', 'Cancer Pain', 'Acute MI Pain'],
        contraindications: ['Respiratory Depression', 'Paralytic Ileus', 'Opioid Allergy'],
        commonAllergies: ['Opioid Allergy'],
        typicalDosage: '2-10mg IV every 2-4 hours as needed',
        administrationRoute: 'IV'
    },
    {
        name: 'Fentanyl (IV)',
        ndc: '0409-1314-01',
        category: 'Pain Management',
        conditions: ['Severe Pain', 'Procedural Sedation', 'Anesthesia'],
        contraindications: ['Respiratory Depression', 'Opioid Allergy'],
        commonAllergies: ['Opioid Allergy'],
        typicalDosage: '25-100mcg IV every 1-2 hours',
        administrationRoute: 'IV'
    }
];

export function getDrugByName(name: string): Drug | undefined {
    return DRUG_DATABASE.find(drug => drug.name.toLowerCase() === name.toLowerCase());
}

export function getDrugsByCategory(category: Drug['category']): Drug[] {
    return DRUG_DATABASE.filter(drug => drug.category === category);
}

export function getDrugsByCondition(condition: string): Drug[] {
    return DRUG_DATABASE.filter(drug =>
        drug.conditions.some(c => c.toLowerCase().includes(condition.toLowerCase()))
    );
}
