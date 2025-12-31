import { ModelTraining } from '../../admin/components/ModelTraining';

export function AdvancedTab() {
    return (
        <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-1">
                {/* AI Simulation Control */}
                <div className="w-full">
                    <ModelTraining />
                </div>
            </div>
        </div>
    );
}
