import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import type { Site, SiteInventory } from '../../types/location';
import { Package, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import './location.css';

interface InteractiveMapProps {
    sites: Site[];
    inventories: SiteInventory[];
    onSiteClick?: (site: Site, departmentId?: string) => void;
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
            const source = r.targetSite;
            const target = r.requestedBySite;
            if (!source || !target) return null;
            return {
                id: r.id,
                positions: [
                    [source.coordinates.lat, source.coordinates.lng],
                    [target.coordinates.lat, target.coordinates.lng]
                ] as [number, number][]
            };
        })
        .filter((r): r is { id: string; positions: [number, number][] } => r !== null);

    return (
        <MapContainer
            center={[39.9526, -75.1652] as [number, number]}
            zoom={11}
            className="location-map-container"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {activeRoutes.map(route => (
                <Polyline
                    key={route.id}
                    positions={route.positions}
                    pathOptions={{ color: '#6366f1', weight: 3, dashArray: '10, 10', opacity: 0.6 }}
                />
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
