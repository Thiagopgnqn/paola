import React from 'react';
import { Link } from 'react-router-dom';
import { FiAlertTriangle, FiRefreshCw, FiHome } from 'react-icons/fi';
import Button from '../ui/Button';
import { isDemoMode, resetDemoState } from '../../api/demo/demoAdapter';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Error capturado en la vista:', error, errorInfo);
  }

  componentDidUpdate(prevProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, error: null });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleResetDemo = () => {
    resetDemoState();
  };

  render() {
    if (this.state.hasError) {
      const demo = isDemoMode();
      return (
        <div
          role="alert"
          className="min-h-[65vh] flex flex-col items-center justify-center px-4 py-16 text-center bg-canvas text-content"
        >
          <div className="max-w-md w-full bg-surface border border-border rounded-2xl p-8 shadow-lifted">
            <div className="w-12 h-12 rounded-full bg-surface-elevated border border-border flex items-center justify-center mx-auto mb-4 text-brand-deep">
              <FiAlertTriangle size={22} />
            </div>
            <span className="text-[10px] uppercase tracking-[0.22em] text-brand-deep font-semibold">
              Aviso del Sistema
            </span>
            <h2 className="font-display text-xl font-bold text-content mt-1 mb-2">
              Ocurrió un inconveniente al cargar esta sección
            </h2>
            <p className="text-xs text-content-secondary leading-relaxed mb-6">
              {demo
                ? 'Si estás en Modo Demo con datos antiguos de una versión anterior, podés restablecer el estado inicial con el botón a continuación.'
                : 'No pudimos mostrar esta vista en este momento. Podés intentar recargar la sección o volver al inicio de la tienda.'}
            </p>
            {this.state.error?.message && (
              <p className="text-[11px] font-mono text-status-error bg-status-error-bg border border-status-error-border rounded px-3 py-2 mb-6 break-words select-all">
                {this.state.error.message}
              </p>
            )}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {demo && (
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={this.handleResetDemo}
                  className="w-full sm:w-auto"
                >
                  <FiRefreshCw className="mr-2 text-xs" />
                  <span>Restablecer Demo</span>
                </Button>
              )}
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={this.handleReset}
                className="w-full sm:w-auto"
              >
                <FiRefreshCw className="mr-2 text-xs" />
                <span>Reintentar</span>
              </Button>
              <Link to="/" onClick={this.handleReset} className="w-full sm:w-auto">
                <Button type="button" variant="outline" size="md" className="w-full">
                  <FiHome className="mr-2 text-xs" />
                  <span>Inicio</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
