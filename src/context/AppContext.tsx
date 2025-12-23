import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import type { ReactNode } from 'react';
import type { NetworkRequest, Site, SiteInventory } from '../types/location';
import type { Notification } from '../types/notification';
import type { AuditLogEntry } from '../types/audit';
import type { ProcurementProposal } from '../types/procurement';
import { sites as initialSites, siteInventories as initialInventories } from '../data/location/mockData';
import { FirestoreService } from '../services/firebase.service';
import { OptimizationService } from '../services/optimization.service';

import { PatientService } from '../services/patient.service';

interface AppContextType {
    // Location & Requests
    requests: NetworkRequest[];
    sites: Site[];
    patients: any[]; // Using any to avoid circular deps or complex type imports for now, ideally 'Patient[]'
    addPatient: (patient: any) => void;
    addSite: (site: Site) => void;
    inventories: SiteInventory[];
    addRequest: (request: NetworkRequest) => void;
    updateRequestStatus: (id: string, status: NetworkRequest['status'], approvedBy?: string) => void;

    // Inventory Management
    updateInventory: (siteId: string, ndc: string, quantityChange: number, reason: string, userId: string, userName: string) => void;

    // Notifications
    notifications: Notification[];
    addNotification: (notification: Notification) => void;
    markNotificationAsRead: (id: string) => void;
    markAllNotificationsAsRead: () => void;

    // Audit Logs
    auditLogs: AuditLogEntry[];

    // Metrics
    metrics: {
        potentialSavings: number;
        realizedSavings: number;
        optimizationCount: number;
        activeTransfers: number;
    };

    // Optimization State (Persisted)
    currentProposals: ProcurementProposal[];
    setCurrentProposals: React.Dispatch<React.SetStateAction<ProcurementProposal[]>>;

    // Loading State
    isLoading: boolean;

    // Simulation Control
    resetSimulation: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper function inlined to avoid import issues in CI



export function AppProvider({ children }: { children: ReactNode }) {
    // Initialize with localStorage or mock data
    const [requests, setRequests] = useState<NetworkRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Persisted Optimization State
    const [currentProposals, setCurrentProposals] = useState<ProcurementProposal[]>([]);

    const [notifications, setNotifications] = useState<Notification[]>([]);

    const [sites, setSites] = useState<Site[]>([]);
    const [inventories, setInventories] = useState<SiteInventory[]>([]);

    // Global Patient State (Unified Source of Truth)
    const [patients, setPatients] = useState<any[]>([]);

    const { user } = useAuth(); // Now accessible because AppProvider is inside AuthProvider



    const addPatient = (patient: any) => {
        setPatients(prev => [patient, ...prev]);
    };

    // SYNC PATIENTS FROM SIMULATION DATABASE (Single Source of Truth)
    useEffect(() => {
        if (!user) {
            setPatients([]);
            return;
        }

        // Subscribe to the simulation results
        const unsubscribePatients = FirestoreService.subscribe<any>(`users/${user.id}/simulations`, async (data) => {
            if (data.length === 0) {
                // Database cleared -> Clear local state
                setPatients([]);
                return;
            }

            const mappedPatients = data.map(sim => {
                const age = sim.profile?.age || 45;
                const birthYear = new Date().getFullYear() - age;

                return {
                    id: sim.id,
                    mrn: `MRN-${sim.id.substring(0, 6).toUpperCase()}`,
                    name: sim.patientName,
                    dateOfBirth: new Date(birthYear, 0, 1).toISOString().split('T')[0],
                    gender: sim.profile?.gender.toLowerCase() || 'male',
                    diagnosis: sim.condition,
                    type: 'adult', // Could infer from age
                    attendingPhysician: 'Dr. Auto',
                    // Generate schedule on the fly based on the prescribed drug
                    // Use the Service to ensure exact Drug Name/NDC alignment
                    treatmentSchedule: PatientService.generateSchedule(sim.condition),
                    ...PatientService.assignLocation(sim.condition),
                    biometrics: sim.biometrics || { // Fallback if old data
                        weight: 70,
                        height: 175,
                        bsa: 1.73
                    }
                };
            });

            console.log(`AppContext: Synced ${mappedPatients.length} patients from Firestore.`);
            setPatients(mappedPatients);
        });

        return () => unsubscribePatients();
    }, [user]);

    // Legacy manual seed removed - we strictly follow DB now.


    const addSite = async (site: Site) => {
        // Optimistic update
        setSites(prev => [...prev, site]);

        // Persist Site
        await FirestoreService.set('sites', site.id, site);

        // Also initialize empty inventory for the new site
        const newInventory: SiteInventory = {
            siteId: site.id,
            lastUpdated: new Date().toISOString(),
            drugs: []
        };
        // Persist Inventory
        await FirestoreService.set('inventoryItems', site.id, newInventory);
    };

    const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

    const resetSimulation = async () => {
        setIsLoading(true);
        try {
            // 1. Clear Existing Data
            console.log("Resetting simulation data...");
            // We could clear existing collections here if we wanted a truly clean slate
            // await FirestoreService.deleteAllDocuments('inventoryItems');

            // 2. Reseed from Mock Data
            const { siteInventories } = await import('../data/location/mockData');
            for (const inv of siteInventories) {
                await FirestoreService.set('inventoryItems', inv.siteId, inv);
            }
            console.log("Simulation Data Reset Complete.");
            window.location.reload(); // Refresh to reflect changes
        } catch (error) {
            console.error("Failed to reset simulation:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Subscribe to Firestore collections
    useEffect(() => {
        // 1. SITES Subscription
        // 1. SITES Subscription
        const unsubscribeSites = FirestoreService.subscribe<Site>('sites', (data) => {
            if (data.length === 0 && initialSites.length > 0) {
                // Seed Sites if Firestore is empty
                console.log('Seeding sites...');
                initialSites.forEach(s => {
                    FirestoreService.set('sites', s.id, s);
                });
            } else {
                // STRICTLY FILTER: Only allow known Penn System sites (Purge legacy/zombie data)
                // This ensures that even if Firestore has old "Regional" sites, they are ignored.
                const validIds = new Set(initialSites.map(s => s.id));
                const cleanSites = data.filter(s => validIds.has(s.id));

                if (cleanSites.length !== data.length) {
                    console.log(`Purged ${data.length - cleanSites.length} non-Penn sites from state.`);
                }
                setSites(cleanSites);
            }
        });

        // 2. REQUESTS Subscription
        const unsubscribeRequests = FirestoreService.subscribe<NetworkRequest>('transfers', (data) => {
            setRequests(data);
        });

        // 3. INVENTORY Subscription
        const unsubscribeInventories = FirestoreService.subscribe<SiteInventory>('inventoryItems', (data) => {
            if (data.length === 0 && initialInventories.length > 0) {
                // Seed inventory if Firestore is empty
                console.log('Seeding inventory data...');
                initialInventories.forEach(inv => {
                    FirestoreService.set('inventoryItems', inv.siteId, inv);
                });
            } else {
                // STRICTLY FILTER: Only trust inventories for valid sites
                const validIds = new Set(initialSites.map(s => s.id));
                const cleanInventories = data.filter(inv => validIds.has(inv.siteId));

                if (cleanInventories.length !== data.length) {
                    console.log(`Purged ${data.length - cleanInventories.length} orphaned inventories.`);
                }
                setInventories(cleanInventories);
            }
            setIsLoading(false); // Data loaded
        });

        // 4. NOTIFICATIONS Subscription
        const unsubscribeNotifications = FirestoreService.subscribe<Notification>('notifications', (data) => {
            setNotifications(data);
        });

        // 5. AUDIT LOGS Subscription
        const unsubscribeAuditLogs = FirestoreService.subscribe<AuditLogEntry>('auditLogs', (data) => {
            setAuditLogs(data);
        });

        return () => {
            unsubscribeSites();
            unsubscribeRequests();
            unsubscribeInventories();
            unsubscribeNotifications();
            unsubscribeAuditLogs();
        };
    }, []);

    // ------------------------------------------------------------------
    // AMIOP METRICS ENGINE
    // ------------------------------------------------------------------
    const [metrics, setMetrics] = useState({
        potentialSavings: 0,
        realizedSavings: 0,
        optimizationCount: 0,
        activeTransfers: 0
    });

    // Recalculate metrics whenever Inventories or Requests change
    useEffect(() => {
        if (sites.length === 0 || inventories.length === 0) return;

        // Run the optimization algorithm to find solutions for low stock
        const runOptimization = async () => {
            const proposals = await OptimizationService.generateProposals(sites, inventories, patients);
            const potentialSavings = proposals.reduce((sum, p) => sum + (p.costAnalysis.savings || 0), 0);

            // 2. Calculate Realized Savings (Completed/Approved Transfers)
            // We assume "savings" is stored on the request, or we re-calculate.
            const realized = requests
                .filter(r => r.status === 'approved' || r.status === 'in_transit' || r.status === 'completed')
                .reduce((sum, _r) => sum + 4250, 0); // Mock avg savings per transfer

            setMetrics({
                potentialSavings,
                realizedSavings: realized,
                optimizationCount: proposals.length,
                activeTransfers: requests.filter(r => ['pending', 'approved', 'in_transit'].includes(r.status)).length
            });
            setCurrentProposals(proposals); // Update global state
        };

        runOptimization();
    }, [inventories, sites, requests, patients]);

    // Sync across tabs
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'sentria_requests' && e.newValue) {
                setRequests(JSON.parse(e.newValue));
            }
            if (e.key === 'sentria_notifications' && e.newValue) {
                setNotifications(JSON.parse(e.newValue));
            }
            if (e.key === 'sentria_inventories' && e.newValue) {
                setInventories(JSON.parse(e.newValue));
            }
            if (e.key === 'sentria_audit_logs' && e.newValue) {
                setAuditLogs(JSON.parse(e.newValue));
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Check inventory levels and generate alerts using Optimization Service
    useEffect(() => {
        if (sites.length === 0 || inventories.length === 0) return;

        // Run the optimization algorithm to find solutions for low stock
        const checkAlerts = async () => {
            const proposals = await OptimizationService.generateProposals(sites, inventories, patients);

            proposals.forEach(proposal => {
                setNotifications(prevNotifications => {
                    // Check if we already have an active notification for this item today
                    const today = new Date().toISOString().split('T')[0];
                    const hasNotification = prevNotifications.some(n =>
                        n.title.includes(proposal.drugName) &&
                        n.message.includes(proposal.targetSiteName) &&
                        n.timestamp.startsWith(today)
                    );

                    if (!hasNotification) {
                        const isTransfer = proposal.type === 'transfer';
                        const title = isTransfer
                            ? `Optimization: Transfer Available for ${proposal.drugName}`
                            : `Low Stock: ${proposal.drugName}`;

                        const message = isTransfer
                            ? `${proposal.targetSiteName} needs ${proposal.quantity} units. ${proposal.reason}`
                            : `${proposal.targetSiteName} is low on ${proposal.drugName}. ${proposal.reason}`;

                        const actionUrl = isTransfer
                            ? `/transfers?source=${proposal.sourceSiteId}&target=${proposal.targetSiteId}&drug=${proposal.ndc}&qty=${proposal.quantity}`
                            : `/inventory`; // Or procurement tab

                        return [{
                            id: `opt-${proposal.id}`,
                            type: isTransfer ? 'success' : 'warning', // Green for solution, Orange for warning
                            category: 'alert',
                            title,
                            message,
                            timestamp: new Date().toISOString(),
                            read: false,
                            link: '/inventory',
                            actionUrl
                        }, ...prevNotifications];
                    }
                    return prevNotifications;

                });
            });
        };

        checkAlerts();
    }, [inventories, sites, patients]); // Run when inventories change

    // Inventory Management
    const updateInventory = async (siteId: string, ndc: string, quantityChange: number, reason: string, userId: string, userName: string) => {
        const inventory = inventories.find(inv => inv.siteId === siteId);
        if (!inventory) return;

        let updatedDrugName = '';
        let newQuantity = 0;

        const updatedDrugs = inventory.drugs.map(drug => {
            if (drug.ndc !== ndc) return drug;

            updatedDrugName = drug.drugName;
            newQuantity = Math.max(0, drug.quantity + quantityChange);

            // Recalculate status
            let status: 'well_stocked' | 'low' | 'critical' | 'overstocked' = 'well_stocked';
            if (newQuantity <= drug.minLevel / 2) status = 'critical';
            else if (newQuantity <= drug.minLevel) status = 'low';
            else if (newQuantity >= drug.maxLevel * 1.2) status = 'overstocked';

            return {
                ...drug,
                quantity: newQuantity,
                status
            };
        });

        const updatedInventory = {
            ...inventory,
            lastUpdated: new Date().toISOString(),
            drugs: updatedDrugs
        };

        // Save to Firestore
        await FirestoreService.set('inventoryItems', siteId, updatedInventory);

        // Create Audit Log
        const site = sites.find(s => s.id === siteId);
        const logEntry: AuditLogEntry = {
            id: `audit-${Date.now()}`,
            action: quantityChange > 0 ? 'add' : 'remove',
            drugName: updatedDrugName,
            ndc,
            quantityChange,
            newQuantity,
            siteId,
            siteName: site?.name || 'Unknown Site',
            userId,
            userName,
            timestamp: new Date().toISOString(),
            reason
        };

        await FirestoreService.set('auditLogs', logEntry.id, logEntry);
    };

    // Request Handlers
    const addRequest = async (request: NetworkRequest) => {
        // Optimistic update
        setRequests(prev => [...prev, request]);

        await FirestoreService.set('transfers', request.id, request);

        // Add corresponding notification
        const newNotification: Notification = {
            id: `notif-${Date.now()}`,
            type: 'info',
            category: 'alert',
            title: 'New Transfer Request',
            message: `${request.requestedBySite.name} requested ${request.drug.quantity} units of ${request.drug.name}`,
            timestamp: new Date().toISOString(),
            read: false,
            link: '/transfers'
        };

        await FirestoreService.set('notifications', newNotification.id, newNotification);
    };

    const updateRequestStatus = async (id: string, status: NetworkRequest['status'], approvedBy?: string) => {
        const updates: Partial<NetworkRequest> = { status };
        if (approvedBy) {
            updates.approvedBy = approvedBy;
            updates.approvedAt = new Date().toISOString();
        }
        if (status === 'in_transit') updates.inTransitAt = new Date().toISOString();
        if (status === 'completed') updates.completedAt = new Date().toISOString();

        await FirestoreService.update('transfers', id, updates);

        const request = requests.find(r => r.id === id);
        if (!request) return;

        const title = status === 'in_transit' ? 'Transfer Approved' :
            status === 'denied' ? 'Request Denied' : 'Status Updated';

        const newNotification: Notification = {
            id: `notif-${Date.now()}`,
            type: status === 'denied' ? 'warning' : 'success',
            category: 'approval',
            title,
            message: `Request for ${request.drug.name} has been ${status === 'in_transit' ? 'approved' : status}`,
            timestamp: new Date().toISOString(),
            read: false,
            link: '/transfers'
        };
        await FirestoreService.set('notifications', newNotification.id, newNotification);

        if (status === 'completed') {
            // 1. Add to Requesting Site (Receiver)
            await updateInventory(
                request.requestedBySite.id,
                request.drug.ndc,
                request.drug.quantity, // ADD
                `Transfer received from ${request.targetSite.name}`,
                'System',
                'System'
            );

            // 2. Remove from Target Site (Sender)
            await updateInventory(
                request.targetSite.id,
                request.drug.ndc,
                -request.drug.quantity, // REMOVE
                `Transfer sent to ${request.requestedBySite.name}`,
                'System',
                'System'
            );
        }
    };

    // Notification Handlers
    const addNotification = async (notification: Notification) => {
        await FirestoreService.set('notifications', notification.id, notification);
    };

    const markNotificationAsRead = async (id: string) => {
        await FirestoreService.update('notifications', id, { read: true });
    };

    const markAllNotificationsAsRead = async () => {
        const batch = notifications.map(n => FirestoreService.update('notifications', n.id, { read: true }));
        await Promise.all(batch);
    };

    return (
        <AppContext.Provider value={{
            requests,
            sites,
            patients,
            addPatient,
            addSite,
            inventories,
            addRequest,
            updateRequestStatus,
            updateInventory,
            notifications,
            addNotification,
            markNotificationAsRead,
            markAllNotificationsAsRead,
            auditLogs,
            metrics,
            currentProposals,
            setCurrentProposals,
            resetSimulation,
            isLoading
        }}>
            {children}
        </AppContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}

