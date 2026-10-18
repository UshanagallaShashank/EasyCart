// Catches an unexpected error anywhere in the app and shows a friendly screen instead of a blank page.
// This also covers the case where a new version was deployed and an old page file no longer exists.
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('The app hit an unexpected error:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-slate-50 px-6 text-center">
        <h1 className="font-heading text-2xl font-bold text-slate-900">Something went wrong</h1>
        <p className="max-w-sm text-sm text-slate-500">
          The page hit an unexpected problem. Reloading usually fixes it, especially right after an update.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-500/20 transition-colors hover:bg-sky-700"
        >
          <RefreshCw className="size-4" /> Reload page
        </button>
      </div>
    );
  }
}
