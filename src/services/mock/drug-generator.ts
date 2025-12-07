
export interface MockDrug {
    id: string;
    name: string;
    genericName: string;
    ndc: string;
    manufacturer: string;
    dosage: string;
    form: string;
    price: number;
    category: 'Oncology' | 'Immunology' | 'Cardiology' | 'Neurology' | 'Infectious Disease';
    temperature: 'Ambient' | 'Refrigerated' | 'Frozen';
}

export class DrugGenerator {
    private static BRANDS = [
        { name: 'Keytruda', generic: 'Pembrolizumab', manufacturer: 'Merck', category: 'Oncology', temp: 'Refrigerated' },
        { name: 'Humira', generic: 'Adalimumab', manufacturer: 'AbbVie', category: 'Immunology', temp: 'Refrigerated' },
        { name: 'Eliquis', generic: 'Apixaban', manufacturer: 'Bristol Myers Squibb', category: 'Cardiology', temp: 'Ambient' },
        { name: 'Revlimid', generic: 'Lenalidomide', manufacturer: 'Celgene', category: 'Oncology', temp: 'Ambient' },
        { name: 'Imbruvica', generic: 'Ibrutinib', manufacturer: 'AbbVie', category: 'Oncology', temp: 'Ambient' },
        { name: 'Biktarvy', generic: 'Bictegravir/Emtricitabine/Tenofovir', manufacturer: 'Gilead', category: 'Infectious Disease', temp: 'Ambient' },
        { name: 'Dupixent', generic: 'Dupilumab', manufacturer: 'Regeneron', category: 'Immunology', temp: 'Refrigerated' },
        { name: 'Stelara', generic: 'Ustekinumab', manufacturer: 'Janssen', category: 'Immunology', temp: 'Refrigerated' },
        { name: 'Opdivo', generic: 'Nivolumab', manufacturer: 'Bristol Myers Squibb', category: 'Oncology', temp: 'Refrigerated' },
        { name: 'Ozempic', generic: 'Semaglutide', manufacturer: 'Novo Nordisk', category: 'Endocrinology', temp: 'Refrigerated' }, // Added pseudo-category
        { name: 'Trulicity', generic: 'Dulaglutide', manufacturer: 'Lilly', category: 'Endocrinology', temp: 'Refrigerated' },
        { name: 'Mounjaro', generic: 'Tirzepatide', manufacturer: 'Lilly', category: 'Endocrinology', temp: 'Refrigerated' },
        { name: 'Remicade', generic: 'Infliximab', manufacturer: 'Janssen', category: 'Immunology', temp: 'Refrigerated' },
        { name: 'Enbrel', generic: 'Etanercept', manufacturer: 'Amgen', category: 'Immunology', temp: 'Refrigerated' },
        { name: 'Rituxan', generic: 'Rituximab', manufacturer: 'Genentech', category: 'Oncology', temp: 'Refrigerated' },
        { name: 'Avastin', generic: 'Bevacizumab', manufacturer: 'Amgen', category: 'Oncology', temp: 'Refrigerated' },
        { name: 'Herceptin', generic: 'Trastuzumab', manufacturer: 'Genentech', category: 'Oncology', temp: 'Refrigerated' },
        { name: 'Prevnar 13', generic: 'Pneumococcal 13-valent Conjugate Vaccine', manufacturer: 'Pfizer', category: 'Infectious Disease', temp: 'Refrigerated' },
        { name: 'Gardasil 9', generic: 'Human Papillomavirus 9-valent Vaccine', manufacturer: 'Merck', category: 'Infectious Disease', temp: 'Refrigerated' },
        { name: 'Ocrevus', generic: 'Ocrelizumab', manufacturer: 'Genentech', category: 'Neurology', temp: 'Refrigerated' }
    ] as const;

    private static DOSAGES = ['10mg', '20mg', '50mg', '100mg', '200mg', '500mg', '1g'];
    private static FORMS = ['Vial', 'Tablet', 'Capsule', 'Prefilled Syringe', 'Auto-Injector'];

    private static generateNDC(): string {
        const seg1 = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
        const seg2 = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
        const seg3 = Math.floor(Math.random() * 99).toString().padStart(2, '0');
        return `${seg1}-${seg2}-${seg3}`;
    }

    static generateCatalog(count: number): MockDrug[] {
        const catalog: MockDrug[] = [];

        for (let i = 0; i < count; i++) {
            const baseDrug = this.BRANDS[Math.floor(Math.random() * this.BRANDS.length)];
            const dosage = this.DOSAGES[Math.floor(Math.random() * this.DOSAGES.length)];
            const form = this.FORMS[Math.floor(Math.random() * this.FORMS.length)];

            // Adjust form/dosage realism slightly
            const finalForm = baseDrug.temp === 'Refrigerated' && (form === 'Tablet' || form === 'Capsule')
                ? 'Vial' // Default to vial if refrigerated and picked oral form
                : form;

            const priceBase = 500 + Math.random() * 9500; // $500 - $10,000

            catalog.push({
                id: `drug-${i}`,
                name: `${baseDrug.name} ${dosage}`,
                genericName: baseDrug.generic,
                ndc: this.generateNDC(),
                manufacturer: baseDrug.manufacturer,
                dosage: dosage,
                form: finalForm,
                price: parseFloat(priceBase.toFixed(2)),
                category: baseDrug.category as any,
                temperature: baseDrug.temp as any
            });
        }
        return catalog;
    }

    static generateMarketplaceListings(count: number) {
        const catalog = this.generateCatalog(count);
        const sellers = [
            'Mercy General Hospital', 'St. Mary\'s Medical Center', 'Northwest Oncology',
            'City Hope Hospital', 'Regional Cancer Center', 'Community Health Network',
            'Penn Medicine', 'Cleveland Clinic', 'Mayo Clinic Supply'
        ];

        return catalog.map((drug, index) => ({
            id: index + 1, // Number ID for compatibility with existing code
            name: `${drug.name} (${drug.genericName})`,
            manufacturer: drug.manufacturer,
            ndc: drug.ndc,
            expiryDate: new Date(Date.now() + Math.random() * 31536000000).toISOString().split('T')[0], // Next 365 days
            quantity: Math.floor(Math.random() * 50) + 1,
            price: drug.price * 0.8, // Market price is usually lower
            originalPrice: drug.price,
            seller: sellers[Math.floor(Math.random() * sellers.length)],
            verified: true,
            category: drug.category
        }));
    }
}
