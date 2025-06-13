# 🚀 Guía Paso a Paso: Crear Host-App desde Cero

**👨‍💻 Autor:** David Leonardo Chaves  
**📅 Creado:** 2025  
**🎯 Objetivo:** Crear aplicación host con Module Federation desde cero

---

Esta guía te ayudará a crear una aplicación **Host (Shell)** con **Module Federation** desde cero, incluyendo todos los comandos y configuraciones necesarias.

## 📋 Prerequisitos

- **Node.js** v16 o superior
- **npm** v8 o superior
- **Git** (opcional, para control de versiones)
- Editor de código (VS Code recomendado)

## 🛠️ Paso 1: Configuración Inicial del Proyecto

### 1.1 Crear directorio del proyecto
```bash
mkdir my-microfrontend-app
cd my-microfrontend-app
```

### 1.2 Inicializar proyecto principal
```bash
npm init -y
```

### 1.3 Instalar herramienta para ejecutar apps en paralelo
```bash
npm install --save-dev concurrently
```

### 1.4 Crear estructura de directorios
```bash
mkdir host-app
mkdir remote-app-1
mkdir remote-app-2
```

## 🏠 Paso 2: Crear Host App (Shell)

### 2.1 Navegar al directorio host-app
```bash
cd host-app
```

### 2.2 Inicializar package.json
```bash
npm init -y
```

### 2.3 Instalar dependencias de React
```bash
npm install react react-dom react-router-dom
```

### 2.4 Instalar dependencias de desarrollo
```bash
npm install --save-dev @babel/core @babel/preset-react babel-loader css-loader html-webpack-plugin style-loader webpack webpack-cli webpack-dev-server
```

### 2.5 Crear estructura de directorios
```bash
mkdir src public
```

### 2.6 Crear archivo public/index.html
```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Module Federation - Host App</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      background-color: #f5f5f5;
    }
  </style>
</head>
<body>
  <div id="root"></div>
</body>
</html>
```

### 2.7 Crear webpack.config.js
```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  mode: 'development',
  devServer: {
    port: 3000,
    historyApiFallback: true,
    hot: true,
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          presets: ['@babel/preset-react'],
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'host',
      remotes: {
        remoteApp1: 'remoteApp1@http://localhost:3001/remoteEntry.js',
        remoteApp2: 'remoteApp2@http://localhost:3002/remoteEntry.js',
      },
      shared: {
        react: { 
          singleton: true,
          requiredVersion: '^18.2.0'
        },
        'react-dom': { 
          singleton: true,
          requiredVersion: '^18.2.0'
        },
        'react-router-dom': {
          singleton: true,
          requiredVersion: '^6.8.0'
        }
      },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
};
```

### 2.8 Crear src/index.js
```javascript
import('./bootstrap');
```

### 2.9 Crear src/bootstrap.js
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
```

### 2.10 Crear src/App.jsx
```javascript
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
```

### 2.11 Crear src/App.css
```css
/* Host App Styles */
.app {
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* Navbar Styles */
.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem 0;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
}

.nav-logo {
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
}

.nav-menu {
  display: flex;
  list-style: none;
  gap: 2rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: background-color 0.3s ease;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

/* Main Content */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* Home Styles */
.home {
  text-align: center;
  padding: 2rem 0;
}

.home h2 {
  color: #333;
  margin-bottom: 1rem;
  font-size: 2.5rem;
}

.home p {
  color: #666;
  font-size: 1.2rem;
  margin-bottom: 3rem;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.card {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.card h3 {
  color: #667eea;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.card p {
  color: #666;
  margin-bottom: 1.5rem;
}

.btn {
  display: inline-block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.8rem 2rem;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  transition: transform 0.3s ease;
}

.btn:hover {
  transform: scale(1.05);
}

/* Loading and Error States */
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.2rem;
  color: #667eea;
}

.error {
  text-align: center;
  padding: 2rem;
  background: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 8px;
  color: #c53030;
}

.error h2 {
  margin-bottom: 1rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    gap: 1rem;
    padding: 0 1rem;
  }
  
  .nav-menu {
    gap: 1rem;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .home h2 {
    font-size: 2rem;
  }
  
  .cards {
    grid-template-columns: 1fr;
  }
}
```

### 2.12 Agregar scripts al package.json
```json
{
  "name": "host-app",
  "scripts": {
    "start": "webpack serve --config webpack.config.js",
    "build": "webpack --mode production",
    "dev": "webpack serve --config webpack.config.js --mode development"
  }
}
```

### 2.13 Volver al directorio raíz
```bash
cd ..
```

## 📦 Paso 3: Configuración del Proyecto Principal

### 3.1 Actualizar package.json del proyecto raíz
```json
{
  "name": "module-federation-app",
  "version": "1.0.0",
  "description": "Aplicación de microfrontends con Module Federation",
  "scripts": {
    "install:all": "cd host-app && npm install && cd ../remote-app-1 && npm install && cd ../remote-app-2 && npm install",
    "dev": "concurrently \"npm run dev:host\" \"npm run dev:remote1\" \"npm run dev:remote2\"",
    "dev:host": "cd host-app && npm run dev",
    "dev:remote1": "cd remote-app-1 && npm run dev",
    "dev:remote2": "cd remote-app-2 && npm run dev",
    "build:all": "cd remote-app-1 && npm run build && cd ../remote-app-2 && npm run build && cd ../host-app && npm run build"
  },
  "devDependencies": {
    "concurrently": "^7.6.0"
  }
}
```

## 🧪 Paso 4: Probar la Host App

### 4.1 Instalar dependencias
```bash
cd host-app
npm install
cd ..
```

### 4.2 Ejecutar la host app
```bash
cd host-app
npm run dev
```

### 4.3 Abrir navegador
Visita: `http://localhost:3000`

## 🎯 Paso 5: Scripts de Automatización

### 5.1 Crear install-deps.bat (Windows)
```batch
@echo off
echo Instalando dependencias para todos los modulos...
echo.

echo [1/3] Instalando dependencias del proyecto raiz...
call npm install

echo [2/3] Instalando dependencias del Host App...
cd host-app
call npm install
cd ..

echo [3/3] Instalando dependencias de Remote Apps...
cd remote-app-1
call npm install
cd ..

cd remote-app-2
call npm install
cd ..

echo.
echo ✅ Todas las dependencias instaladas correctamente!
pause
```

### 5.2 Crear start-dev.bat (Windows)
```batch
@echo off
echo Iniciando servidores de desarrollo...
echo.
echo Host App: http://localhost:3000
echo Remote App 1: http://localhost:3001  
echo Remote App 2: http://localhost:3002
echo.

start "Host App" cmd /k "cd host-app && npm run dev"
timeout /t 2 /nobreak >nul
start "Remote App 1" cmd /k "cd remote-app-1 && npm run dev"
timeout /t 2 /nobreak >nul
start "Remote App 2" cmd /k "cd remote-app-2 && npm run dev"

echo Todos los servidores iniciados!
pause
```

## 🔧 Paso 6: Solución de Problemas Comunes

### 6.1 Error de Module Federation
**Problema**: `ModuleFederationPlugin is not a constructor`
**Solución**: Usar `require('webpack').container.ModuleFederationPlugin`

### 6.2 Error de CORS
**Problema**: Errores de CORS al cargar remotes
**Solución**: Configurar `headers` en devServer:
```javascript
devServer: {
  headers: {
    "Access-Control-Allow-Origin": "*",
  },
}
```

### 6.3 Error de shared dependencies
**Problema**: Versiones conflictivas de React
**Solución**: Configurar `singleton: true` en shared

## ✅ Verificación Final

### Checklist de completitud:
- [ ] Host app ejecutándose en puerto 3000
- [ ] Navegación funcionando correctamente
- [ ] Error boundaries implementados
- [ ] Lazy loading configurado
- [ ] Estilos responsive aplicados
- [ ] Scripts de automatización funcionando

## 🚀 Siguientes Pasos

1. **Crear Remote Apps**: Ver **[Guía para Crear Aplicaciones Remotas](./REMOTE-APP-GUIDE.md)**
2. **Implementar Tests**: Agregar testing con Jest/React Testing Library
3. **CI/CD**: Configurar pipelines de deployment
4. **Monitoreo**: Implementar logging y error tracking
5. **Performance**: Optimizar bundles y carga de assets

---

¡Felicidades! 🎉 Ahora tienes una **Host App** completamente funcional con **Module Federation**. Esta aplicación puede cargar dinámicamente otros microfrontends y proporciona una base sólida para una arquitectura de microfrontends escalable. 