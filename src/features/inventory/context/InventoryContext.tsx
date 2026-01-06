import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Site, SiteInventory } from '../../../types/location';
import { sites as initialSites, siteInventories as initialInventories } from '../../../data/location/mockData';
import { FirestoreService } from '../../../core/services/firebase.service';
import { db } from '../../../core/config/firebase';
import { doc } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext';
import type { AuditLogEntry } from '../../../types/audit';

interface InventoryContextType {
    sites: Site[];
    inventories: SiteInventory[];
    loading: boolean;
    addSite: (site: Site) => Promise<void>;
    updateInventory: (siteId: string, ndc: string, quantityChange: number, reason: string, userId: string, userName: string) => Promise<void>;
    resetInventoryData: () => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [sites, setSites] = useState<Site[]>([]);
    const [inventories, setInventories] = useState<SiteInventory[]>([]);
    const [loading, setLoading] = useState(true);

    // Subscribe to Sites and Inventories
    useEffect(() => {
        if (!user) {
            // setSites([]); // Keep sites visible? Secure app says no, but let's stick to AppContext behavior
            // setInventories([]);
            return;
        }

        const unsubscribeSites = FirestoreService.subscribe<Site>('sites', (data) => {
            if (data.length === 0 && initialSites.length > 0) {
                console.log('Seeding sites...');
                initialSites.forEach(s => FirestoreService.set('sites', s.id, s));
            } else {
                const validIds = new Set(initialSites.map(s => s.id));
                setSites(data.filter(s => validIds.has(s.id)));
            }
        });

        const unsubscribeInventories = FirestoreService.subscribe<SiteInventory>('inventoryItems', (data) => {
            if (data.length === 0 && initialInventories.length > 0) {
                console.log('Seeding inventory data...');
                initialInventories.forEach(inv => FirestoreService.set('inventoryItems', inv.siteId, inv));
            } else {
                const validIds = new Set(initialSites.map(s => s.id));
                setInventories(data.filter(inv => validIds.has(inv.siteId)));
            }
            setLoading(false);
        });

        return () => {
            unsubscribeSites();
            unsubscribeInventories();
        };
    }, [user]);

    const addSite = async (site: Site) => {
        // Optimistic
        setSites(prev => [...prev, site]);
        await FirestoreService.set('sites', site.id, site);

        // Init Inventory
        const newInventory: SiteInventory = {
            siteId: site.id,
            lastUpdated: new Date().toISOString(),
            drugs: []
        };
        await FirestoreService.set('inventoryItems', site.id, newInventory);
    };

    const updateInventory = async (siteId: string, ndc: string, quantityChange: number, reason: string, userId: string, userName: string) => {
        try {
            await FirestoreService.runTransaction(async (transaction) => {
                const invRef = doc(db, 'inventoryItems', siteId);
                const invDoc = await transaction.get(invRef);

                if (!invDoc.exists()) throw new Error("Inventory site not found");

                const inventory = invDoc.data() as SiteInventory;
                let updatedDrugName = '';
                let newQuantity = 0;

                const updatedDrugs = inventory.drugs.map(drug => {
                    if (drug.ndc !== ndc) return drug;
                    updatedDrugName = drug.drugName;
                    newQuantity = Math.max(0, drug.quantity + quantityChange);

                    let status: 'well_stocked' | 'low' | 'critical' | 'overstocked' = 'well_stocked';
                    if (newQuantity <= drug.minLevel / 2) status = 'critical';
                    else if (newQuantity <= drug.minLevel) status = 'low';
                    else if (newQuantity >= drug.maxLevel * 1.2) status = 'overstocked';

                    return { ...drug, quantity: newQuantity, status };
                });

                const updatedInventory = {
                    ...inventory,
                    lastUpdated: new Date().toISOString(),
                    drugs: updatedDrugs
                };

                transaction.set(invRef, updatedInventory);

                // Audit Log (Atomic)
                const logId = `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                const logRef = doc(db, 'auditLogs', logId);
                const logEntry: AuditLogEntry = {
                    id: logId,
                    action: quantityChange > 0 ? 'add' : 'remove',
                    drugName: updatedDrugName,
                    ndc,
                    quantityChange,
                    newQuantity,
                    siteId,
                    siteName: 'Resolved by ID lookup',
                    userId,
                    userName,
                    timestamp: new Date().toISOString(),
                    reason
                };
                transaction.set(logRef, logEntry);
            });
            console.log("Transaction Committed: Inventory Update + Audit Log");
        } catch (e) {
            console.error("Transaction Failed:", e);
            throw e;
        }
    };

    const resetInventoryData = async () => {
        setLoading(true);
        try {
            console.log("Resetting simulation data...");

            // 1. Reset Inventory
            await FirestoreService.deleteAllDocuments('inventoryItems');

            // 2. Re-seed Inventory Data Only
            const { siteInventories } = await import('../../../data/location/mockData');

            // Re-seed Inventory
            const inventoryPromises = siteInventories.map(inv => FirestoreService.set('inventoryItems', inv.siteId, inv));
            await Promise.all(inventoryPromises);

            console.log("Inventory Data Reset Complete.");
        } catch (error) {
            console.error("Failed to reset inventory:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <InventoryContext.Provider value={{ sites, inventories, loading, addSite, updateInventory, resetInventoryData }}>
            {children}
        </InventoryContext.Provider>
    );
}

export function useInventory() {
    const context = useContext(InventoryContext);
    if (context === undefined) {
        throw new Error('useInventory must be used within an InventoryProvider');
    }
    return context;
}
