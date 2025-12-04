/**
 * Service to handle geocoding (Address -> Coordinates)
 * Uses OpenStreetMap Nominatim API (Free, no key required for demo usage)
 */

interface GeocodingResult {
    lat: number;
    lng: number;
    displayName: string;
}

export class GeocodingService {
    private static readonly BASE_URL = 'https://nominatim.openstreetmap.org/search';

    /**
     * Search for an address and return coordinates
     * @param query Address or place name (e.g. "Mount Sinai Hospital, NYC")
     */
    static async searchAddress(query: string): Promise<GeocodingResult | null> {
        try {
            const params = new URLSearchParams({
                q: query,
                format: 'json',
                limit: '1',
                addressdetails: '1'
            });

            const response = await fetch(`${this.BASE_URL}?${params.toString()}`, {
                headers: {
                    // Nominatim requires a User-Agent
                    'User-Agent': 'SentriaHealthDemo/1.0'
                }
            });

            if (!response.ok) {
                throw new Error('Geocoding failed');
            }

            const data = await response.json();

            if (data && data.length > 0) {
                return {
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon),
                    displayName: data[0].display_name
                };
            }

            return null;
        } catch (error) {
            console.error('Geocoding error:', error);
            return null;
        }
    }
}
