import { Component, type ErrorInfo, type ReactNode } from 'react';
import * as Sentry from '@sentry/react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: unknown): State {
    const message = error instanceof Error ? error.message : 'Error inesperado';
    return { hasError: true, message };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
    Sentry.captureException(error, { extra: { componentStack: info.componentStack } });
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className='flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 p-6 text-center'>
        <span className='text-5xl'>⚠️</span>
        <h1 className='text-xl font-bold text-slate-800'>Algo salió mal</h1>
        <p className='max-w-sm text-sm text-slate-500'>
          Ocurrió un error inesperado. Intenta recargar la página.
        </p>
        {import.meta.env.DEV && this.state.message && (
          <code className='mt-1 max-w-md break-words rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-600'>
            {this.state.message}
          </code>
        )}
        <button
          type='button'
          onClick={() => window.location.reload()}
          className='mt-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90'
        >
          Recargar página
        </button>
      </div>
    );
  }
}
