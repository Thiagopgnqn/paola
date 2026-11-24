import React from 'react';
import { FiAlertTriangle, FiRefreshCw, FiHome } from 'react-icons/fi';
import { resetDemoState, isDemoMode } from '../../api/demo/demoAdapter';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, showDetails: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Error capturado en render:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    resetDemoState();
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const demo = isDemoMode();
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 text-content bg-canvas">
          <div className="max-w-lg w-full bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-lifted space-y-5 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-status-error-bg text-status-error flex items-center justify-center border border-status-error-border">
              <FiAlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-xl font-bold font-display text-content">
                Algo salió mal en esta sección
              </h2>
              <p className="text-xs sm:text-sm text-content-secondary mt-2 leading-relaxed">
                {demo
                  ? 'Si estás navegando en el Modo Demo con datos antiguos de una versión previa, podés restablecer el estado inicial para resolver incompatibilidades de almacenamiento.'
                  : 'Ocurrió un error inesperado al procesar la vista. Intentá recargar la página o volver a la portada.'}
              </p>
            </div>

            {this.state.error && (
              <div className="text-left bg-status-error-bg border border-status-error-border rounded-xl p-3 text-xs font-mono text-status-error select-all overflow-x-auto">
                <div className="font-semibold mb-1">
                  {this.state.error.name}: {this.state.error.message}
                </div>
                {this.state.errorInfo?.componentStack && (
                  <details className="mt-2 text-[10px] text-content-secondary">
                    <summary className="cursor-pointer hover:text-content select-none">
                      Ver detalle de componentes
                    </summary>
                    <pre className="mt-1 whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              {demo && (
                <button
                  type="button"
                  onClick={this.handleReset}
                  className="w-full sm:w-auto px-5 py-2.5 bg-brand hover:bg-brand-deep text-white font-semibold text-xs rounded-xl transition shadow-soft flex items-center justify-center gap-2"
                >
                  <FiRefreshCw className="w-4 h-4" />
                  <span>Restablecer Demo</span>
                </button>
              )}

              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-2.5 bg-surface-elevated hover:bg-surface-hover border border-border-strong text-content font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2"
              >
                <FiRefreshCw className="w-4 h-4" />
                <span>Recargar</span>
              </button>

              <button
                type="button"
                onClick={() => (window.location.href = '/')}
                className="w-full sm:w-auto px-5 py-2.5 bg-surface hover:bg-surface-elevated border border-border-strong text-content font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2"
              >
                <FiHome className="w-4 h-4" />
                <span>Ir al Inicio</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
