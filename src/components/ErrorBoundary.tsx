import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                    <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                            <AlertTriangle className="h-8 w-8 text-red-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h1>
                        <p className="text-slate-600 mb-6">
                            The application encountered an unexpected error.
                        </p>

                        <div className="bg-slate-100 rounded-lg p-4 mb-6 text-left overflow-auto max-h-48">
                            <p className="font-mono text-xs text-red-600 break-all">
                                {this.state.error?.message || 'Unknown error'}
                            </p>
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors w-full"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Reload Application
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
