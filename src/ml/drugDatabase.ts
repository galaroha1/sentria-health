export interface Drug {
    name: string;
    ndc: string;
    category: 'Oncology' | 'Rheumatology' | 'Gastroenterology' | 'Neurology' | 'Hematology' | 'Cardiology' | 'Infectious Disease' | 'Pain Management' | 'IV Fluid/Electrolyte' | 'Immunology';
    conditions: string[]; // Indicated for
    contraindications: string[];
    commonAllergies: string[];
    typicalDosage: string;
    administrationRoute: 'IV Infusion' | 'Subcutaneous' | 'IM' | 'Intravitreal';
}

export const DRUG_DATABASE: Drug[] = [
    // I. Oncology (Chemotherapy & Immunotherapy)
    {
        name: 'Paclitaxel (Taxol)',
        ndc: '0703-4759-01',
        category: 'Oncology',
        conditions: ['Breast Cancer', 'Ovarian Cancer', 'Lung Cancer', 'Pancreatic Cancer'],
        contraindications: ['Severe Hypersensitivity', 'Neutropenia', 'Baseline neutrophil count <1500/mm³'],
        commonAllergies: ['Taxane Allergy', 'Castor Oil Allergy'],
        typicalDosage: '175mg/m² IV every 3 weeks or 80mg/m² weekly',
        administrationRoute: 'IV Infusion'
    },
    {
        name: 'Carboplatin',
        ndc: '0703-5748-01',
        category: 'Oncology',
        conditions: ['Ovarian Cancer', 'Lung Cancer', 'Bladder Cancer', 'Head and Neck Cancer'],
        contraindications: ['Severe Myelosuppression', 'Platinum Allergy', 'Severe Bleeding'],
        commonAllergies: ['Platinum Allergy'],
        typicalDosage: 'AUC 5-7.5 IV every 3-4 weeks',
        administrationRoute: 'IV Infusion'
    },
    {
        name: 'Pembrolizumab (Keytruda)',
        ndc: '0006-3026-02',
        category: 'Oncology',
        conditions: ['Non-Small Cell Lung Cancer', 'Melanoma', 'Head and Neck Cancer', 'Renal Cell Carcinoma', 'Urothelial Carcinoma'],
        contraindications: ['Severe Immune-Related Adverse Events'],
        commonAllergies: [],
        typicalDosage: '200mg IV every 3 weeks or 400mg IV every 6 weeks',
        administrationRoute: 'IV Infusion'
    },
    {
        name: 'Rituximab (Rituxan)',
        ndc: '0004-1973-01',
        category: 'Oncology',
        conditions: ['Non-Hodgkin Lymphoma', 'Chronic Lymphocytic Leukemia', 'Rheumatoid Arthritis'],
        contraindications: ['Active Severe Infection', 'Severe Hypersensitivity'],
        commonAllergies: ['Murine Protein Allergy'],
        typicalDosage: '375mg/m² IV weekly for 4-8 doses',
        administrationRoute: 'IV Infusion'
    },
    {
        name: 'Trastuzumab (Herceptin)',
        ndc: '0004-7470-01',
        category: 'Oncology',
        conditions: ['HER2+ Breast Cancer', 'HER2+ Gastric Cancer'],
        contraindications: ['Cardiomyopathy', 'Severe Hypersensitivity'],
        commonAllergies: [],
        typicalDosage: '8mg/kg loading, then 6mg/kg IV every 3 weeks',
        administrationRoute: 'IV Infusion'
    },
    {
        name: 'Nivolumab (Opdivo)',
        ndc: '0003-3772-11',
        category: 'Oncology',
        conditions: ['Melanoma', 'Non-Small Cell Lung Cancer', 'Renal Cell Carcinoma', 'Hodgkin Lymphoma'],
        contraindications: ['Severe Immune-Related Adverse Events'],
        commonAllergies: [],
        typicalDosage: '240mg IV every 2 weeks or 480mg IV every 4 weeks',
        administrationRoute: 'IV Infusion'
    },
    {
        name: 'Bevacizumab (Avastin)',
        ndc: '0004-1998-01',
        category: 'Oncology',
        conditions: ['Colorectal Cancer', 'Lung Cancer', 'Glioblastoma', 'Ovarian Cancer'],
        contraindications: ['Recent Surgery', 'GI Perforation', 'Severe Bleeding'],
        commonAllergies: [],
        typicalDosage: '5-15mg/kg IV every 2-3 weeks',
        administrationRoute: 'IV Infusion'
    },

    // II. Rheumatology / Immunology Biologics
    {
        name: 'Infliximab (Remicade)',
        ndc: '0006-3356-20',
        category: 'Rheumatology',
        conditions: ['Rheumatoid Arthritis', 'Crohn\'s Disease', 'Ulcerative Colitis', 'Ankylosing Spondylitis', 'Psoriatic Arthritis'],
        contraindications: ['Active Tuberculosis', 'Severe Infection', 'Heart Failure (NYHA Class III/IV)'],
        commonAllergies: ['Murine Protein Allergy'],
        typicalDosage: '3-5mg/kg IV at weeks 0, 2, 6, then every 8 weeks',
        administrationRoute: 'IV Infusion'
    },
    {
        name: 'Tocilizumab (Actemra)',
        ndc: '0004-0234-02',
        category: 'Rheumatology',
        conditions: ['Rheumatoid Arthritis', 'Giant Cell Arteritis', 'Systemic Juvenile Idiopathic Arthritis'],
        contraindications: ['Active Infection', 'Severe Hepatic Impairment', 'Platelet count <50,000/mm³'],
        commonAllergies: [],
        typicalDosage: '4-8mg/kg IV every 4 weeks',
        administrationRoute: 'IV Infusion'
    },
    {
        name: 'Abatacept (Orencia)',
        ndc: '0003-2189-11',
        category: 'Rheumatology',
        conditions: ['Rheumatoid Arthritis', 'Psoriatic Arthritis', 'Juvenile Idiopathic Arthritis'],
        contraindications: ['Active Serious Infection'],
        commonAllergies: [],
        typicalDosage: '500-1000mg IV on days 1, 15, 29, then every 4 weeks',
        administrationRoute: 'IV Infusion'
    },

    // III. Gastroenterology (IBD Biologics)
    {
        name: 'Vedolizumab (Entyvio)',
        ndc: '0300-3736-11',
        category: 'Gastroenterology',
        conditions: ['Ulcerative Colitis', 'Crohn\'s Disease'],
        contraindications: ['Active Severe Infection'],
        commonAllergies: [],
        typicalDosage: '300mg IV at weeks 0, 2, 6, then every 8 weeks',
        administrationRoute: 'IV Infusion'
    },
    {
        name: 'Ustekinumab (Stelara)',
        ndc: '0006-0537-02',
        category: 'Gastroenterology',
        conditions: ['Crohn\'s Disease', 'Ulcerative Colitis', 'Psoriasis', 'Psoriatic Arthritis'],
        contraindications: ['Active Serious Infection', 'Active Tuberculosis'],
        commonAllergies: [],
        typicalDosage: '260-520mg IV loading dose, then 90mg SQ every 8-12 weeks',
        administrationRoute: 'IV Infusion'
    },

    // IV. Neurology (Infusion Therapies)
    {
        name: 'Ocrelizumab (Ocrevus)',
        ndc: '0004-0440-01',
        category: 'Neurology',
        conditions: ['Multiple Sclerosis (Relapsing and Primary Progressive)'],
        contraindications: ['Active Hepatitis B', 'Severe Active Infection'],
        commonAllergies: [],
        typicalDosage: '300mg IV x2 doses (2 weeks apart), then 600mg IV every 6 months',
        administrationRoute: 'IV Infusion'
    },
    {
        name: 'Natalizumab (Tysabri)',
        ndc: '0004-5514-01',
        category: 'Neurology',
        conditions: ['Multiple Sclerosis (Relapsing)', 'Crohn\'s Disease'],
        contraindications: ['PML Risk', 'Active Infection', 'Immunocompromised'],
        commonAllergies: [],
        typicalDosage: '300mg IV every 4 weeks',
        administrationRoute: 'IV Infusion'
    },
    {
        name: 'IVIG (Gamunex-C)',
        ndc: '0944-2700-02',
        category: 'Neurology',
        conditions: ['CIDP', 'Guillain-Barré Syndrome', 'Myasthenia Gravis', 'Immune Thrombocytopenia'],
        contraindications: ['IgA Deficiency with Anti-IgA Antibodies', 'Severe IgA Deficiency'],
        commonAllergies: ['IgA Allergy'],
        typicalDosage: '1-2g/kg IV over 2-5 days',
        administrationRoute: 'IV Infusion'
    },

    // V. Hematology (Infusions & Injections)
    {
        name: 'Epoetin alfa (Procrit)',
        ndc: '0006-4720-09',
        category: 'Hematology',
        conditions: ['Anemia of Chronic Kidney Disease', 'Chemotherapy-Induced Anemia'],
        contraindications: ['Uncontrolled Hypertension', 'Pure Red Cell Aplasia'],
        commonAllergies: [],
        typicalDosage: '50-100 units/kg SQ 3 times weekly',
        administrationRoute: 'Subcutaneous'
    },
    {
        name: 'Ferric Carboxymaltose (Injectafer)',
        ndc: '0517-2202-01',
        category: 'Hematology',
        conditions: ['Iron Deficiency Anemia', 'Cardiorenal Anemia'],
        contraindications: ['Iron Overload', 'Hemochromatosis', 'Hypersensitivity'],
        commonAllergies: ['Iron Product Allergy'],
        typicalDosage: '750mg IV x2 doses (7 days apart)',
        administrationRoute: 'IV Infusion'
    },
    {
        name: 'Iron Sucrose (Venofer)',
        ndc: '0517-2202-05',
        category: 'Hematology',
        conditions: ['Iron Deficiency Anemia in CKD', 'Dialysis Anemia'],
        contraindications: ['Iron Overload', 'Hemochromatosis'],
        commonAllergies: ['Iron Product Allergy'],
        typicalDosage: '100-200mg IV per dialysis session',
        administrationRoute: 'IV Infusion'
    },

    // VI. Infectious Disease
    {
        name: 'Vancomycin (IV)',
        ndc: '0409-4095-01',
        category: 'Infectious Disease',
        conditions: ['MRSA Infection', 'Severe Bacterial Infection', 'Sepsis', 'Endocarditis', 'C. difficile'],
        contraindications: ['Vancomycin Allergy'],
        commonAllergies: ['Vancomycin Allergy', 'Glycopeptide Allergy'],
        typicalDosage: '15-20mg/kg IV every 8-12 hours',
        administrationRoute: 'IV Infusion'
    },
    {
        name: 'Daptomycin (Cubicin)',
        ndc: '0469-1100-01',
        category: 'Infectious Disease',
        conditions: ['Bacteremia', 'Endocarditis', 'Skin and Soft Tissue Infections'],
        contraindications: ['Pneumonia (inactivated by surfactant)'],
        commonAllergies: [],
        typicalDosage: '6-10mg/kg IV daily',
        administrationRoute: 'IV Infusion'
    },
    {
        name: 'Ceftriaxone (IV)',
        ndc: '0143-9924-01',
        category: 'Infectious Disease',
        conditions: ['Pneumonia', 'Meningitis', 'Gonorrhea', 'Bacterial Infection'],
        contraindications: ['Cephalosporin Allergy', 'Hyperbilirubinemic Neonates'],
        commonAllergies: ['Cephalosporin Allergy', 'Penicillin Allergy'],
        typicalDosage: '1-2g IV daily',
        administrationRoute: 'IV Infusion'
    },
    {
        name: 'Micafungin (Mycamine)',
        ndc: '0469-0300-50',
        category: 'Infectious Disease',
        conditions: ['Candidemia', 'Invasive Candidiasis', 'Esophageal Candidiasis'],
        contraindications: ['Echinocandin Allergy'],
        commonAllergies: [],
        typicalDosage: '100-150mg IV daily',
        administrationRoute: 'IV Infusion'
    },

    // VII. Cardiology
    {
        name: 'Heparin (IV)',
        ndc: '0409-2720-01',
        category: 'Cardiology',
        conditions: ['Deep Vein Thrombosis', 'Pulmonary Embolism', 'Atrial Fibrillation', 'Acute Coronary Syndrome'],
        contraindications: ['Active Bleeding', 'Severe Thrombocytopenia', 'Heparin-Induced Thrombocytopenia'],
        commonAllergies: ['Heparin Allergy'],
        typicalDosage: '80 units/kg bolus, then 18 units/kg/hr infusion',
        administrationRoute: 'IV Infusion'
    },

    // VIII. Pain Management
    {
        name: 'Morphine Sulfate (IV)',
        ndc: '0409-1234-01',
        category: 'Pain Management',
        conditions: ['Severe Pain', 'Post-Operative Pain', 'Cancer Pain', 'Acute MI Pain'],
        contraindications: ['Respiratory Depression', 'Paralytic Ileus', 'Opioid Allergy'],
        commonAllergies: ['Opioid Allergy'],
        typicalDosage: '2-10mg IV every 2-4 hours PRN',
        administrationRoute: 'IV Infusion'
    },
    {
        name: 'Ketamine (IV)',
        ndc: '0409-1895-01',
        category: 'Pain Management',
        conditions: ['Chronic Pain', 'Complex Regional Pain Syndrome', 'Treatment-Resistant Depression'],
        contraindications: ['Uncontrolled Hypertension', 'Severe Cardiac Disease', 'Psychosis'],
        commonAllergies: [],
        typicalDosage: '0.5mg/kg IV infusion over 40 minutes',
        administrationRoute: 'IV Infusion'
    },

    // IX. Immunology
    {
        name: 'Omalizumab (Xolair)',
        ndc: '0004-0276-01',
        category: 'Immunology',
        conditions: ['Moderate-to-Severe Asthma', 'Chronic Spontaneous Urticaria'],
        contraindications: ['Severe Hypersensitivity to Omalizumab'],
        commonAllergies: [],
        typicalDosage: '150-375mg SQ every 2-4 weeks',
        administrationRoute: 'Subcutaneous'
    },

    // X. IV Fluids
    {
        name: 'Normal Saline (0.9% NaCl)',
        ndc: '0338-0048-04',
        category: 'IV Fluid/Electrolyte',
        conditions: ['Dehydration', 'Hypovolemia', 'Fluid Resuscitation', 'Medication Dilution'],
        contraindications: ['Hypernatremia', 'Fluid Overload'],
        commonAllergies: [],
        typicalDosage: '1000mL IV bolus or continuous infusion',
        administrationRoute: 'IV Infusion'
    }
];

export function getDrugByName(name: string): Drug | undefined {
    return DRUG_DATABASE.find(drug => drug.name.toLowerCase().includes(name.toLowerCase()));
}

export function getDrugsByCategory(category: Drug['category']): Drug[] {
    return DRUG_DATABASE.filter(drug => drug.category === category);
}

export function getDrugsByCondition(condition: string): Drug[] {
    return DRUG_DATABASE.filter(drug =>
        drug.conditions.some(c => c.toLowerCase().includes(condition.toLowerCase()))
    );
}
