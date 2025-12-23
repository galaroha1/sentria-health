
export const FullScreenLoader = () => {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50">
            <div className="relative flex items-center justify-center">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-200 border-t-primary-600"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-primary-600"></div>
                </div>
            </div>
            <h2 className="mt-4 text-lg font-bold text-slate-900 animate-pulse">Initializing Sentria OS...</h2>
            <p className="mt-1 text-sm text-slate-500">Syncing secure data streams</p>
        </div>
    );
};
