
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_PATH = path.join(__dirname, '../src/data/regional-sites.json');

// Cities with approx coordinates (Lat, Lng) relative to Philly (40.0, -75.1)
// We will generate clusters around these hubs
const HUBS = [
    { name: 'New York City, NY', lat: 40.7128, lng: -74.0060, count: 20 },
    { name: 'Boston, MA', lat: 42.3601, lng: -71.0589, count: 12 },
    { name: 'Washington, DC', lat: 38.9072, lng: -77.0369, count: 15 },
    { name: 'Baltimore, MD', lat: 39.2904, lng: -76.6122, count: 10 },
    { name: 'Pittsburgh, PA', lat: 40.4406, lng: -79.9959, count: 12 },
    { name: 'Cleveland, OH', lat: 41.4993, lng: -81.6944, count: 8 },
    { name: 'Richmond, VA', lat: 37.5407, lng: -77.4360, count: 8 },
    { name: 'Charlotte, NC', lat: 35.2271, lng: -80.8431, count: 10 },
    { name: 'Buffalo, NY', lat: 42.8864, lng: -78.8784, count: 6 },
    { name: 'Columbus, OH', lat: 39.9612, lng: -82.9988, count: 8 },
    { name: 'Detroit, MI', lat: 42.3314, lng: -83.0458, count: 10 },
    { name: 'Indianapolis, IN', lat: 39.7684, lng: -86.1581, count: 8 }, // Stretching the 1000 miles
];

const SITE_TYPES = ['hospital', 'clinic', 'pharmacy', 'warehouse'];

function generateSites() {
    const sites = [];
    let siteIdCounter = 100; // Start ID

    HUBS.forEach(hub => {
        for (let i = 0; i < hub.count; i++) {
            // Random scatter around hub (approx +/- 0.5 degrees ~ 35 miles)
            const lat = hub.lat + (Math.random() - 0.5) * 1.0;
            const lng = hub.lng + (Math.random() - 0.5) * 1.0;

            const type = SITE_TYPES[Math.floor(Math.random() * SITE_TYPES.length)];
            let name = `${hub.name.split(',')[0]} `;

            if (type === 'hospital') name += ['General', 'Medical Center', 'Memorial', 'University Hospital'].sort(() => 0.5 - Math.random())[0];
            else if (type === 'clinic') name += ['Health Clinic', 'Family Practice', 'Urgent Care', 'Specialty Center'].sort(() => 0.5 - Math.random())[0];
            else if (type === 'pharmacy') name += ['Pharmacy', 'Rx Center', 'Apothecary', 'Drug Store'].sort(() => 0.5 - Math.random())[0];
            else name += ['Distribution Center', 'Logistics Hub', 'Depot'].sort(() => 0.5 - Math.random())[0];

            sites.push({
                id: `site-region-${siteIdCounter++}`,
                name: `${name} #${i + 1}`,
                type: type,
                regulatoryAvatar: 'Regional',
                classOfTrade: type === 'hospital' ? 'acute' : 'non_acute',
                parentEntity: 'Regional Partner Network',
                departments: [
                    { id: `dept-${siteIdCounter}-1`, name: 'Main Inventory', type: 'logistics' }
                ],
                coordinates: { lat, lng },
                address: `${Math.floor(Math.random() * 9999) + 1} Main St, Near ${hub.name}`,
                phone: `(555) ${Math.floor(Math.random() * 899) + 100}-${Math.floor(Math.random() * 8999) + 1000}`,
                manager: 'Regional Manager',
                status: 'operational',
                capacity: Math.floor(Math.random() * 5000) + 1000,
                currentUtilization: Math.floor(Math.random() * 60) + 20
            });
        }
    });

    return sites;
}

const allSites = generateSites();
fs.writeFileSync(OUTPUT_PATH, JSON.stringify(allSites, null, 2));
console.log(`Generated ${allSites.length} regional sites.`);
