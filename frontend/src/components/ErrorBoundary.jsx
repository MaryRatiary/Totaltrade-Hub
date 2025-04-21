import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    // Vous pouvez aussi envoyer l'erreur à un service de reporting
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary p-4 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-red-600 text-lg font-semibold mb-2">Une erreur est survenue</h2>
          <p className="text-red-500 mb-4">Nous nous excusons pour ce problème. Veuillez réessayer.</p>
          <button
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            onClick={() => window.location.reload()}
          >
            Réessayer
          </button>
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4">
              <summary className="text-red-600 cursor-pointer">Détails de l'erreur</summary>
              <pre className="mt-2 p-4 bg-red-100 rounded overflow-auto">
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;