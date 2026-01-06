import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import type { ReactNode } from 'react';
import type { NetworkRequest, Site, SiteInventory } from '../types/location';
import type { Notification } from '../types/notification';
import type { AuditLogEntry } from '../types/audit';
import type { ProcurementProposal } from '../types/procurement';
import { FirestoreService, orderBy, limit } from '../core/services/firebase.service';
import { SystemMemoryService } from '../services/memory.service';
import { PatientService } from '../features/clinical/services/patient.service';
import { SecureLogger } from '../services/logger.service';


// Modular Contexts
import { useInventory } from '../features/inventory/context/InventoryContext';
import { useLogistics } from '../features/logistics/context/LogisticsContext';

interface AppContextType {
    // Location & Requests (Delegated)
    requests: NetworkRequest[];
    sites: Site[];
    inventories: SiteInventory[];
    /**
     * Adds a new physical location (Hospital/Clinic) to the network.
     * Delegated to `InventoryContext`.
     */
    addSite: (site: Site) => void;

    addRequest: (request: NetworkRequest) => void;
    updateRequestStatus: (id: string, status: NetworkRequest['status'], approvedBy?: string) => void;
    updateInventory: (siteId: string, ndc: string, quantityChange: number, reason: string, userId: string, userName: string) => Promise<void>;

    // Patients (Kept Here)
    patients: any[];
    addPatient: (patient: any) => void;

    // Notifications (Kept Here)
    notifications: Notification[];
    addNotification: (notification: Notification) => void;
    markNotificationAsRead: (id: string) => void;
    markAllNotificationsAsRead: () => void;

    // Audit Logs (Kept Here)
    auditLogs: AuditLogEntry[];

    // Metrics (Aggregated)
    metrics: {
        potentialSavings: number;
        realizedSavings: number;
        optimizationCount: number;
        activeTransfers: number;
    };

    // Optimization State (Persisted)
    currentProposals: ProcurementProposal[];
    // setCurrentProposals: React.Dispatch<React.SetStateAction<ProcurementProposal[]>>;
    setCurrentProposals: (proposals: ProcurementProposal[]) => Promise<void>;


    // Loading State
    isLoading: boolean;

    // Simulation Control
    resetSimulation: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();

    // Delegate to Modular Contexts
    const {
        sites,
        inventories,
        addSite: inventoryAddSite,
        updateInventory: inventoryUpdate,
        resetInventoryData,
        loading: inventoryLoading
    } = useInventory();

    const {
        requests,
        addRequest: logisticsAddRequest,
        updateRequestStatus: logisticsUpdateStatus
    } = useLogistics();

    // Local State
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
    const [patients, setPatients] = useState<any[]>([]);
    const [currentProposals, _setProposalsLocal] = useState<ProcurementProposal[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load System Memory (Proposals)
    // Load System Memory (Proposals)
    // Strategy: Try Backend (Primary) -> LocalStorage (Backup)
    useEffect(() => {
        if (!user) return;
        const loadMemory = async () => {
            let saved = await SystemMemoryService.load<ProcurementProposal[]>('currentProposals');

            // Backup: Try LocalStorage if Backend missed
            if (!saved || saved.length === 0) {
                const localBackup = localStorage.getItem('sentria_proposals_backup');
                if (localBackup) {
                    try {
                        saved = JSON.parse(localBackup);
                        console.log('Using LocalStorage Backup for Proposals');
                    } catch (e) {
                        console.error('Failed to parse local backup', e);
                    }
                }
            }

            if (saved && saved.length > 0) {
                _setProposalsLocal(saved);
                console.log(`🧠 Loaded ${saved.length} proposals from Memory`);
                // toast.success(`Restored ${saved.length} active proposals`);
            }
        };
        loadMemory();
    }, [user]);

    const setCurrentProposals = async (proposals: ProcurementProposal[]) => {
        _setProposalsLocal(proposals);
        // 1. Sync to Backend (Secure)
        await SystemMemoryService.save('currentProposals', proposals);
        // 2. Sync to LocalStorage (Redundancy)
        if (proposals.length > 0) {
            localStorage.setItem('sentria_proposals_backup', JSON.stringify(proposals));
        } else {
            localStorage.removeItem('sentria_proposals_backup');
        }
    };


    // Sync Loading State
    useEffect(() => {
        setIsLoading(inventoryLoading);
    }, [inventoryLoading]);

    // ------------------------------------------------------------------
    // PATIENT SYNC (Legacy Logic)
    // ------------------------------------------------------------------
    useEffect(() => {
        if (!user) {
            setPatients([]);
            return;
        }
        const unsubscribePatients = FirestoreService.subscribe<any>(`users/${user.id}/simulations`, async (data) => {
            if (data.length === 0) {
                setPatients([]);
                return;
            }




            const mappedPatients = data.map(sim => {
                const fallbackLoc = !sim.assignedSiteId ? PatientService.assignLocation(sim.condition) : null;
                const siteId = sim.assignedSiteId || fallbackLoc?.siteId;
                const deptId = sim.assignedDepartmentId || fallbackLoc?.assignedDepartmentId;

                return {
                    id: sim.id,
                    mrn: sim.mrn || `MRN-${Math.floor(10000 + Math.random() * 90000)}`,
                    name: sim.patientName,
                    dateOfBirth: sim.profile?.age ? new Date(new Date().getFullYear() - sim.profile.age, 0, 1).toISOString().split('T')[0] : '1980-01-01',
                    gender: sim.profile?.gender.toLowerCase() || 'male',
                    diagnosis: sim.condition,
                    type: 'adult',
                    attendingPhysician: 'Dr. Auto',
                    treatmentSchedule: PatientService.generateSchedule(sim.condition),
                    assignedSiteId: siteId,
                    assignedDepartmentId: deptId,
                    biometrics: sim.biometrics || { weight: 70, height: 175, bsa: 1.73 }
                };
            });
            SecureLogger.log(`AppContext: Synced ${mappedPatients.length} patients from Firestore.`);
            setPatients(mappedPatients);
        });
        return () => unsubscribePatients();
    }, [user]);

    const addPatient = (patient: any) => {
        setPatients(prev => [patient, ...prev]);
    };

    // ------------------------------------------------------------------
    // NOTIFICATIONS & AUDIT LOGS
    // ------------------------------------------------------------------
    useEffect(() => {
        if (!user) {
            setNotifications([]);
            setAuditLogs([]);
            return;
        }

        const unsubscribeNotifications = FirestoreService.subscribe<Notification>(
            'notifications',
            (data) => { setNotifications(data); },
            orderBy('timestamp', 'desc'),
            limit(50)
        );

        const unsubscribeAuditLogs = FirestoreService.subscribe<AuditLogEntry>(
            'auditLogs',
            (data) => { setAuditLogs(data); },
            orderBy('timestamp', 'desc'),
            limit(50)
        );

        return () => {
            unsubscribeNotifications();
            unsubscribeAuditLogs();
        };
    }, [user]);

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

    // ------------------------------------------------------------------
    // METRICS
    // ------------------------------------------------------------------
    const [metrics, setMetrics] = useState({
        potentialSavings: 0,
        realizedSavings: 0,
        optimizationCount: 0,
        activeTransfers: 0
    });

    useEffect(() => {
        const realized = requests
            .filter(r => r.status === 'approved' || r.status === 'in_transit' || r.status === 'completed')
            .reduce((sum, r) => sum + (r.savings || 0), 0);

        setMetrics(prev => ({
            ...prev,
            realizedSavings: realized,
            activeTransfers: requests.filter(r => ['pending', 'approved', 'in_transit'].includes(r.status) && r.type !== 'procurement').length
        }));
    }, [requests]);

    // ------------------------------------------------------------------
    // WRAPPERS / FACADE METHODS
    // ------------------------------------------------------------------
    const resetSimulation = async () => {
        setIsLoading(true);
        try {
            console.log("🔥 RESETTING SIMULATION (Scoped)...");

            // 1. Reset Inventory (Delegated)
            await resetInventoryData();

            // 2. Clear Patients (Simulations)
            if (user?.id) {
                console.log("Clearing Patients...");
                await FirestoreService.deleteAllDocuments(`users/${user.id}/simulations`);
                setPatients([]);
            }

            // 3. Clear System Memory (Proposals)
            console.log("Clearing Proposals...");
            await SystemMemoryService.save('currentProposals', []);
            localStorage.removeItem('sentria_proposals_backup');
            _setProposalsLocal([]);

            // NOTE: We deliberately DO NOT clear:
            // - Transfers
            // - Notifications
            // - Audit Logs
            // Per user request to keep history but reset state.

            console.log("✅ RESET COMPLETE. Reloading...");
            window.location.reload();
        } catch (error) {
            console.error("Failed to reset simulation:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Sync Storage (Legacy support for other tabs updates?) 
    // New modular contexts don't have this. If we want it, we should add it there.
    // For now, removing to cleaner code, assuming Firestore realtime is sufficient.

    return (
        <AppContext.Provider value={{
            requests,
            sites,
            inventories,
            addSite: inventoryAddSite,
            addRequest: logisticsAddRequest,
            updateRequestStatus: logisticsUpdateStatus,
            updateInventory: inventoryUpdate,

            patients,
            addPatient,

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

export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}
