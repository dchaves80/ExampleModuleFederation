import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

// Lazy load remote components
const RemoteApp1 = React.lazy(() => import('remoteApp1/App'));
const RemoteApp2 = React.lazy(() => import('remoteApp2/App'));

// Navbar Component (Shared)
const Navbar = () => (
  <nav className="navbar">
    <div className="nav-container">
      <h1 className="nav-logo">🏠 MicroFrontend App</h1>
      <ul className="nav-menu">
        <li className="nav-item">
          <Link to="/" className="nav-link">Home</Link>
        </li>
        <li className="nav-item">
          <Link to="/app1" className="nav-link">App 1</Link>
        </li>
        <li className="nav-item">
          <Link to="/app2" className="nav-link">App 2</Link>
        </li>
      </ul>
    </div>
  </nav>
);

// Home Component
const Home = () => (
  <div className="home">
    <h2>🎯 Bienvenido a Module Federation</h2>
    <p>Esta es la aplicación shell que integra múltiples microfrontends.</p>
    <div className="cards">
      <div className="card">
        <h3>⚛️ Remote App 1</h3>
        <p>Primera aplicación independiente</p>
        <Link to="/app1" className="btn">Visitar App 1</Link>
      </div>
      <div className="card">
        <h3>⚛️ Remote App 2</h3>
        <p>Segunda aplicación independiente</p>
        <Link to="/app2" className="btn">Visitar App 2</Link>
      </div>
    </div>
  </div>
);

// Error Boundary for remote apps
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Remote app error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error">
          <h2>⚠️ Error cargando aplicación remota</h2>
          <p>La aplicación remota no está disponible en este momento.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

const App = () => {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/app1" 
              element={
                <ErrorBoundary>
                  <Suspense fallback={<div className="loading">Cargando App 1...</div>}>
                    <RemoteApp1 />
                  </Suspense>
                </ErrorBoundary>
              } 
            />
            <Route 
              path="/app2" 
              element={
                <ErrorBoundary>
                  <Suspense fallback={<div className="loading">Cargando App 2...</div>}>
                    <RemoteApp2 />
                  </Suspense>
                </ErrorBoundary>
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App; 