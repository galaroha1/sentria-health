import type { Site } from '../types/location';

export interface RouteMetrics {
    distanceKm: number;
    durationMinutes: number;
    trafficLevel: 'low' | 'moderate' | 'heavy' | 'unknown';
    source: 'google' | 'osrm' | 'fallback';
}

export class RoutingService {
    // Safe access to environment variable for both Browser and Node.js contexts
    private static readonly GOOGLE_API_KEY = (import.meta?.env?.VITE_GOOGLE_MAPS_API_KEY) || '';

    // Tortuosity Factor: Real roads are roughly 1.3x to 1.4x the straight-line distance
    private static readonly TORTUOSITY_FACTOR = 1.35;

    // Average speeds (km/h)
    private static readonly AVG_SPEED_CITY = 30; // 30 km/h in city
    private static readonly AVG_SPEED_HIGHWAY = 90; // 90 km/h on highway

    /**
     * Calculate route metrics between two sites.
     * Tries Google API first (if key exists), then falls back to Haversine with simulation.
     */
    static async getRouteMetrics(source: Site, target: Site): Promise<RouteMetrics> {
        // 1. Try Google Maps API if Key exists
        if (this.GOOGLE_API_KEY) {
            try {
                return await this.fetchGoogleRoute(source, target);
            } catch (error) {
                console.warn('Google Maps Route API failed, falling back to simulation:', error);
            }
        }

        // 2. Fallback to Simulated Realism
        return this.calculateFallbackMetrics(source, target);
    }

    /**
     * Enhanced Haversine Calculation with "Realism" factors
     */
    private static calculateFallbackMetrics(source: Site, target: Site): RouteMetrics {
        const straightLineKm = this.calculateHaversine(source, target);

        // Apply tortuosity to estimate road distance
        const estimatedRoadKm = straightLineKm * this.TORTUOSITY_FACTOR;

        // Estimate time:
        // Distances < 15km treated as "City Driving" (slower)
        // Distances > 15km treated as "Highway" (faster)
        const isCity = estimatedRoadKm < 15;
        const avgSpeed = isCity ? this.AVG_SPEED_CITY : this.AVG_SPEED_HIGHWAY;

        // Base time in hours
        let durationHours = estimatedRoadKm / avgSpeed;

        // Add "Traffic" simulation based on time of day (Mock)
        // Check current hour: 8-9am or 5-6pm = Heavy Traffic (+30%)
        const currentHour = new Date().getHours();
        const isRushHour = (currentHour >= 8 && currentHour <= 9) || (currentHour >= 17 && currentHour <= 18);

        // Random variance +/- 10%
        const randomVariance = 0.9 + (Math.random() * 0.2);

        if (isRushHour) {
            durationHours *= 1.3; // +30% duration
        }

        durationHours *= randomVariance;

        let trafficLevel: 'low' | 'moderate' | 'heavy' = 'low';
        if (isRushHour) trafficLevel = 'heavy';
        else if (randomVariance > 1.05) trafficLevel = 'moderate';

        return {
            distanceKm: Number(estimatedRoadKm.toFixed(1)),
            durationMinutes: Math.round(durationHours * 60),
            trafficLevel,
            source: 'fallback'
        };
    }

    /**
     * Standard Great-Circle Distance
     */
    private static calculateHaversine(siteA: Site, siteB: Site): number {
        const R = 6371; // Earth radius in km
        const dLat = this.deg2rad(siteB.coordinates.lat - siteA.coordinates.lat);
        const dLon = this.deg2rad(siteB.coordinates.lng - siteA.coordinates.lng);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(siteA.coordinates.lat)) * Math.cos(this.deg2rad(siteB.coordinates.lat)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private static deg2rad(deg: number): number {
        return deg * (Math.PI / 180);
    }

    /**
     * [Placeholder] Real Google Maps Routes API Call
     * Requires "Routes API" enabled in Google Cloud Console
     */
    private static async fetchGoogleRoute(source: Site, target: Site): Promise<RouteMetrics> {
        // Construct the Request for REST API
        // POST https://routes.googleapis.com/directions/v2:computeRoutes

        const url = 'https://routes.googleapis.com/directions/v2:computeRoutes';

        const body = {
            origin: {
                location: { latLng: { latitude: source.coordinates.lat, longitude: source.coordinates.lng } }
            },
            destination: {
                location: { latLng: { latitude: target.coordinates.lat, longitude: target.coordinates.lng } }
            },
            travelMode: "DRIVE",
            routingPreference: "TRAFFIC_AWARE",
            computeAlternativeRoutes: false,
            routeModifiers: {
                avoidTolls: false,
                avoidHighways: false,
                avoidFerries: false
            },
            languageCode: "en-US",
            units: "METRIC"
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': this.GOOGLE_API_KEY,
                'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.staticDuration'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error(`Google Routes API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.routes || data.routes.length === 0) {
            throw new Error('No routes found');
        }

        const route = data.routes[0];

        // Format: "1234s" (seconds)
        const durationSeconds = parseInt(route.duration.replace('s', ''));
        const distanceMeters = route.distanceMeters;

        // Heuristic for traffic level
        // Compare normal duration vs traffic duration (if available)
        // For 'TRAFFIC_AWARE', route.duration is the traffic time. 
        // staticDuration is usually the base time.

        let traffic: 'low' | 'moderate' | 'heavy' = 'moderate';
        if (route.staticDuration) {
            const staticSeconds = parseInt(route.staticDuration.replace('s', ''));
            const delayRatio = durationSeconds / staticSeconds;
            if (delayRatio > 1.25) traffic = 'heavy';
            else if (delayRatio < 1.1) traffic = 'low';
        }

        return {
            distanceKm: Number((distanceMeters / 1000).toFixed(1)),
            durationMinutes: Math.round(durationSeconds / 60),
            trafficLevel: traffic,
            source: 'google'
        };
    }
}
