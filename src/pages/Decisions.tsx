import { DecisionsTab } from '../components/inventory/DecisionsTab';

export function Decisions() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Decisions Control Tower</h1>
                    <p className="text-slate-500">Centralized management for approvals, optimization, and alerts.</p>
                </div>
            </div>
            <DecisionsTab />
        </div>
    );
}
