import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [stats, setStats] = useState({
    users: 0,
    sales: 0,
    orders: 0,
    revenue: 0
  });

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setStats({
        users: 1234,
        sales: 5678,
        orders: 234,
        revenue: 98765
      });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="remote-app-1">
      <div className="app-header">
        <h1>📊 Dashboard - Remote App 1</h1>
        <p>Sistema de métricas y análisis empresarial</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card users">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Usuarios Activos</h3>
            <p className="stat-number">{stats.users.toLocaleString()}</p>
            <span className="stat-change positive">+12% este mes</span>
          </div>
        </div>

        <div className="stat-card sales">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Ventas Totales</h3>
            <p className="stat-number">{stats.sales.toLocaleString()}</p>
            <span className="stat-change positive">+8% este mes</span>
          </div>
        </div>

        <div className="stat-card orders">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Pedidos</h3>
            <p className="stat-number">{stats.orders.toLocaleString()}</p>
            <span className="stat-change negative">-2% este mes</span>
          </div>
        </div>

        <div className="stat-card revenue">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>Ingresos</h3>
            <p className="stat-number">${stats.revenue.toLocaleString()}</p>
            <span className="stat-change positive">+15% este mes</span>
          </div>
        </div>
      </div>

      <div className="features-section">
        <h2>🚀 Características Principales</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>📊 Análisis en Tiempo Real</h3>
            <p>Monitorea métricas importantes de tu negocio en tiempo real</p>
          </div>
          <div className="feature-card">
            <h3>📱 Responsive Design</h3>
            <p>Accede a tu dashboard desde cualquier dispositivo</p>
          </div>
          <div className="feature-card">
            <h3>🔒 Seguridad Avanzada</h3>
            <p>Tus datos están protegidos con encriptación de última generación</p>
          </div>
        </div>
      </div>

      <div className="app-footer">
        <p>Esta es una aplicación remota independiente desarrollada con Module Federation</p>
      </div>
    </div>
  );
};

export default App; 