import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import type { Site, SiteInventory } from '../../../../types/location';
import { Package, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../../../context/AppContext';
import './location.css';

interface InteractiveMapProps {
    sites: Site[];
    inventories: SiteInventory[];
    onSiteClick?: (site: Site, departmentId?: string) => void;
}

// Helper to animate marker along a path
function MovingTruck({ start, end }: { start: [number, number], end: [number, number] }) {
    const [position, setPosition] = useState(start);

    useEffect(() => {
        let startTime: number;
        const duration = 5000; // 5 seconds to travel

        const animate = (time: number) => {
            if (!startTime) startTime = time;
            const progress = (time - startTime) / duration;

            if (progress < 1) {
                const lat = start[0] + (end[0] - start[0]) * progress;
                const lng = start[1] + (end[1] - start[1]) * progress;
                setPosition([lat, lng]);
                requestAnimationFrame(animate);
            } else {
                // Loop animation
                startTime = time;
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [start, end]);

    const icon = L.divIcon({
        html: `<div class="truck-marker"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5"/><path d="M14 17h1"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg></div>`,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    });

    return <Marker position={position} icon={icon} zIndexOffset={1000} />;
}

function SitePopup({ site, summary, onAction }: { site: Site, summary: { criticalCount: number; lowCount: number; totalDrugs: number; } | null, onAction: (site: Site, deptId?: string) => void }) {
    const [selectedDept, setSelectedDept] = useState(site.departments?.[0]?.id || '');

    return (
        <div className="p-4 min-w-[200px]">
            <h3 className="font-bold text-slate-900">{site.name}</h3>
            <p className="mt-1 text-xs text-slate-500">{site.type.toUpperCase()}</p>
            <p className="mt-2 text-xs text-slate-600">{site.address}</p>
            <p className="mt-1 text-xs text-slate-600">Manager: {site.manager}</p>

            {site.departments && site.departments.length > 0 && (
                <div className="mt-3">
                    <label className="block text-xs font-medium text-slate-700 mb-1">Department</label>
                    <select
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                        className="w-full rounded border border-slate-200 px-2 py-1 text-xs outline-none focus:border-slate-900"
                        onClick={(e) => e.stopPropagation()} // Prevent map click
                    >
                        {site.departments.map(dept => (
                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                    </select>
                </div>
            )}

            {summary && (
                <div className="mt-3 space-y-2 border-t border-slate-200 pt-3">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">Total Medications:</span>
                        <span className="font-medium text-slate-900">{summary.totalDrugs}</span>
                    </div>
                    {summary.criticalCount > 0 && (
                        <div className="flex items-center gap-1 text-xs text-red-600">
                            <AlertTriangle className="h-3 w-3" />
                            <span>{summary.criticalCount} critical low</span>
                        </div>
                    )}
                    {summary.lowCount > 0 && (
                        <div className="flex items-center gap-1 text-xs text-amber-600">
                            <Package className="h-3 w-3" />
                            <span>{summary.lowCount} low stock</span>
                        </div>
                    )}
                    {summary.criticalCount === 0 && summary.lowCount === 0 && (
                        <div className="flex items-center gap-1 text-xs text-emerald-600">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>All stock levels good</span>
                        </div>
                    )}
                </div>
            )}

            <button
                onClick={() => onAction(site, selectedDept)}
                className="mt-3 w-full rounded bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
            >
                View Details
            </button>
        </div>
    );
}

export function InteractiveMap({ sites, inventories, onSiteClick }: InteractiveMapProps) {
    const { requests } = useApp();

    const getSiteStatus = (siteId: string): 'well_stocked' | 'low' | 'critical' | 'overstocked' => {
        const inventory = inventories.find(inv => inv.siteId === siteId);
        if (!inventory || inventory.drugs.length === 0) return 'well_stocked';

        const statuses = inventory.drugs.map(d => d.status);
        if (statuses.includes('critical')) return 'critical';
        if (statuses.includes('low')) return 'low';
        if (statuses.includes('overstocked')) return 'overstocked';
        return 'well_stocked';
    };

    const createCustomIcon = (site: Site) => {
        const status = getSiteStatus(site.id);
        const iconHtml = `
            <div class="custom-marker marker-${status}">
                ${site.type === 'hospital' ? '🏥' : site.type === 'warehouse' ? '📦' : site.type === 'pharmacy' ? '💊' : '🏨'}
            </div>
        `;

        return L.divIcon({
            html: iconHtml,
            className: '',
            iconSize: [40, 40] as [number, number],
            iconAnchor: [20, 20] as [number, number],
            popupAnchor: [0, -20] as [number, number],
        });
    };

    const getInventorySummary = (siteId: string) => {
        const inventory = inventories.find(inv => inv.siteId === siteId);
        if (!inventory) return null;

        const criticalCount = inventory.drugs.filter(d => d.status === 'critical').length;
        const lowCount = inventory.drugs.filter(d => d.status === 'low').length;
        const totalDrugs = inventory.drugs.length;

        return { criticalCount, lowCount, totalDrugs };
    };

    // Calculate active routes
    const activeRoutes = requests
        .filter(r => r.status === 'in_transit')
        .map(r => {
            const source = r.targetSite; // From (Source)
            const target = r.requestedBySite; // To (Requester)
            if (!source || !target) return null;
            return {
                id: r.id,
                start: [source.coordinates.lat, source.coordinates.lng] as [number, number],
                end: [target.coordinates.lat, target.coordinates.lng] as [number, number]
            };
        })
        .filter((r): r is { id: string; start: [number, number]; end: [number, number] } => r !== null);

    return (
        <MapContainer
            center={[40.5, -77.0] as [number, number]} // Centered between Philly/Pitt/DC/NY
            zoom={6}
            className="location-map-container"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {activeRoutes.map(route => (
                <div key={route.id}>
                    <Polyline
                        positions={[route.start, route.end]}
                        pathOptions={{ color: '#6366f1', weight: 3, dashArray: '10, 10', opacity: 0.6 }}
                    />
                    <MovingTruck start={route.start} end={route.end} />
                </div>
            ))}

            {sites.map((site) => {
                const summary = getInventorySummary(site.id);

                return (
                    <Marker
                        key={site.id}
                        position={[site.coordinates.lat, site.coordinates.lng] as [number, number]}
                        icon={createCustomIcon(site)}
                    >
                        <Popup>
                            <SitePopup
                                site={site}
                                summary={summary}
                                onAction={(s, d) => onSiteClick?.(s, d)}
                            />
                        </Popup>
                    </Marker>
                );
            })}
        </MapContainer>
    );
}
