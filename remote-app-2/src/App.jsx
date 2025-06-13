import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Mock user data
  useEffect(() => {
    const mockUsers = [
      { id: 1, name: 'Ana García', email: 'ana@example.com', role: 'Admin', status: 'active', avatar: '👩‍💼' },
      { id: 2, name: 'Carlos López', email: 'carlos@example.com', role: 'Editor', status: 'active', avatar: '👨‍💻' },
      { id: 3, name: 'María Rodríguez', email: 'maria@example.com', role: 'Viewer', status: 'inactive', avatar: '👩‍🎨' },
      { id: 4, name: 'José Martínez', email: 'jose@example.com', role: 'Editor', status: 'active', avatar: '👨‍🔬' },
      { id: 5, name: 'Laura Sánchez', email: 'laura@example.com', role: 'Admin', status: 'active', avatar: '👩‍⚖️' },
      { id: 6, name: 'Pedro Hernández', email: 'pedro@example.com', role: 'Viewer', status: 'inactive', avatar: '👨‍🏫' }
    ];
    setUsers(mockUsers);
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || user.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin': return '#e53e3e';
      case 'Editor': return '#3182ce';
      case 'Viewer': return '#38a169';
      default: return '#718096';
    }
  };

  return (
    <div className="remote-app-2">
      <div className="app-header">
        <h1>👥 Gestión de Usuarios - Remote App 2</h1>
        <p>Sistema de administración y control de usuarios</p>
      </div>

      <div className="controls-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-box">
          <select 
            value={selectedFilter} 
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Todos los usuarios</option>
            <option value="active">Usuarios activos</option>
            <option value="inactive">Usuarios inactivos</option>
          </select>
        </div>
      </div>

      <div className="users-grid">
        {filteredUsers.map(user => (
          <div key={user.id} className={`user-card ${user.status}`}>
            <div className="user-avatar">
              {user.avatar}
            </div>
            <div className="user-info">
              <h3 className="user-name">{user.name}</h3>
              <p className="user-email">{user.email}</p>
              <div className="user-meta">
                <span 
                  className="user-role" 
                  style={{ backgroundColor: getRoleColor(user.role) }}
                >
                  {user.role}
                </span>
                <span className={`user-status ${user.status}`}>
                  {user.status === 'active' ? '🟢 Activo' : '🔴 Inactivo'}
                </span>
              </div>
            </div>
            <div className="user-actions">
              <button className="action-btn edit">✏️</button>
              <button className="action-btn delete">🗑️</button>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="no-results">
          <h3>🔍 No se encontraron usuarios</h3>
          <p>Intenta ajustar tus criterios de búsqueda</p>
        </div>
      )}

      <div className="stats-summary">
        <div className="summary-card">
          <h4>📊 Resumen</h4>
          <p><strong>Total:</strong> {users.length} usuarios</p>
          <p><strong>Activos:</strong> {users.filter(u => u.status === 'active').length}</p>
          <p><strong>Inactivos:</strong> {users.filter(u => u.status === 'inactive').length}</p>
        </div>
      </div>

      <div className="app-footer">
        <p>Sistema de gestión de usuarios desarrollado como microfrontend independiente</p>
      </div>
    </div>
  );
};

export default App; 