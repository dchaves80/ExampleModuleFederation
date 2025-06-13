# 🔗 Guía de Integración: Conectar Remote Apps a Host

**👨‍💻 Autor:** David Leonardo Chaves  
**📅 Creado:** 2025  
**🎯 Objetivo:** Integrar aplicaciones remotas con aplicación host

---

Esta guía te enseña **cómo conectar aplicaciones remotas existentes a una aplicación host** utilizando **Module Federation**, cubriendo todos los aspectos de configuración, consumo y solución de problemas.

## 📋 Prerequisitos

- ✅ **Host App funcionando** (ver [SETUP-GUIDE.md](./SETUP-GUIDE.md))
- ✅ **Remote App desarrollada** (ver [REMOTE-APP-GUIDE.md](./REMOTE-APP-GUIDE.md))
- ✅ Conocimientos básicos de **Module Federation**
- ✅ **Webpack 5** configurado en ambas aplicaciones

## 🎯 ¿Qué aprenderás?

Esta guía cubre el **proceso completo de integración**:

1. **🔧 Configurar la Remote App** para ser consumible
2. **🏠 Configurar la Host App** para consumir remotes
3. **📡 Establecer la comunicación** entre aplicaciones
4. **🧪 Probar la integración** paso a paso
5. **🔍 Depurar problemas** comunes
6. **⚡ Optimizar el rendimiento** de la integración

---

## 🔧 Parte 1: Configurar la Remote App (Producer)

### 📤 Paso 1.1: Exposer Módulos

#### 1.1.1 Configurar webpack.config.js de la Remote App

```javascript
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  mode: 'development',
  devServer: {
    port: 3001, // Puerto específico para la remote app
    historyApiFallback: true,
    hot: true,
    headers: {
      "Access-Control-Allow-Origin": "*", // Permitir CORS
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    }
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'remoteApp1', // ⚠️ IMPORTANTE: Nombre único de la remote app
      filename: 'remoteEntry.js', // ⚠️ IMPORTANTE: Archivo de entrada
      exposes: {
        './App': './src/App', // Exponer el componente principal
        './Button': './src/components/Button', // Exponer componentes específicos
        './Utils': './src/utils/index', // Exponer utilidades
      },
      shared: {
        react: { 
          singleton: true, // ⚠️ CRÍTICO: Una sola instancia de React
          requiredVersion: '^18.2.0',
          eager: false // Cargar bajo demanda
        },
        'react-dom': { 
          singleton: true, // ⚠️ CRÍTICO: Una sola instancia de React-DOM
          requiredVersion: '^18.2.0',
          eager: false
        },
      },
    }),
  ],
};
```

#### 1.1.2 Estructura de archivos para exposición

```
remote-app/
├── src/
│   ├── App.jsx              # 🎯 Componente principal expuesto
│   ├── components/
│   │   ├── Button.jsx       # 🎯 Componente específico expuesto
│   │   └── Header.jsx       # Componente interno
│   ├── utils/
│   │   └── index.js         # 🎯 Utilidades expuestas
│   └── index.js             # Bootstrap de la app
├── webpack.config.js        # 🔧 Configuración de Module Federation
└── package.json
```

#### 1.1.3 Ejemplo de componente expuesto

```javascript
// src/App.jsx - Componente principal
import React from 'react';
import './App.css';

const RemoteApp = ({ 
  // Props que pueden venir del host
  theme = 'default',
  config = {},
  onAction = () => {} 
}) => {
  return (
    <div className={`remote-app remote-app--${theme}`}>
      <h2>🎯 Remote App Component</h2>
      <p>Esta aplicación remota está siendo consumida por el host</p>
      
      {/* Usar props del host */}
      <div className="config-display">
        <pre>{JSON.stringify(config, null, 2)}</pre>
      </div>
      
      {/* Comunicar con el host */}
      <button onClick={() => onAction('remote-action')}>
        Enviar Acción al Host
      </button>
    </div>
  );
};

export default RemoteApp;
```

#### 1.1.4 Verificar exposición

```bash
# Ejecutar la remote app
cd remote-app
npm run dev

# Verificar que remoteEntry.js está disponible
# Abrir: http://localhost:3001/remoteEntry.js
```

---

## 🏠 Parte 2: Configurar la Host App (Consumer)

### 📥 Paso 2.1: Consumir Remote Apps

#### 2.1.1 Configurar webpack.config.js de la Host App

```javascript
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  mode: 'development',
  devServer: {
    port: 3000,
    historyApiFallback: true,
    hot: true,
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'host',
      remotes: {
        // Mapeo: alias_local: 'nombre_remoto@url_remoteEntry'
        remoteApp1: 'remoteApp1@http://localhost:3001/remoteEntry.js',
        remoteApp2: 'remoteApp2@http://localhost:3002/remoteEntry.js',
        
        // Para producción:
        // remoteApp1: 'remoteApp1@https://mi-app-remota.com/remoteEntry.js',
      },
      shared: {
        react: { 
          singleton: true,
          requiredVersion: '^18.2.0',
          eager: false
        },
        'react-dom': { 
          singleton: true,
          requiredVersion: '^18.2.0',
          eager: false
        },
        'react-router-dom': {
          singleton: true,
          requiredVersion: '^6.8.0',
          eager: false
        }
      },
    }),
  ],
};
```

#### 2.1.2 Importar y usar componentes remotos

```javascript
// src/App.jsx - Host App
import React, { Suspense, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// ⚠️ IMPORTANTE: Lazy loading de componentes remotos
const RemoteApp1 = React.lazy(() => import('remoteApp1/App'));
const RemoteButton = React.lazy(() => import('remoteApp1/Button'));
const RemoteUtils = React.lazy(() => import('remoteApp1/Utils'));

const App = () => {
  const [hostConfig, setHostConfig] = useState({
    theme: 'dark',
    user: 'admin',
    permissions: ['read', 'write']
  });

  const handleRemoteAction = (action) => {
    console.log('Acción recibida desde remote:', action);
    // Manejar acciones desde la remote app
  };

  return (
    <Router>
      <div className="host-app">
        <nav className="host-nav">
          {/* Navegación del host */}
        </nav>
        
        <main className="host-content">
          <Routes>
            <Route 
              path="/remote1" 
              element={
                <Suspense fallback={
                  <div className="loading">
                    🔄 Cargando Remote App 1...
                  </div>
                }>
                  <RemoteApp1 
                    theme={hostConfig.theme}
                    config={hostConfig}
                    onAction={handleRemoteAction}
                  />
                </Suspense>
              } 
            />
            
            <Route 
              path="/remote-components" 
              element={
                <div>
                  <h2>Componentes Remotos Individuales</h2>
                  
                  <Suspense fallback={<div>Cargando botón...</div>}>
                    <RemoteButton 
                      variant="primary" 
                      onClick={() => console.log('Remote button clicked')}
                    >
                      Botón Remoto
                    </RemoteButton>
                  </Suspense>
                </div>
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

#### 2.1.3 Manejo avanzado de errores

```javascript
// src/components/RemoteErrorBoundary.jsx
import React from 'react';

class RemoteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log del error para debugging
    console.error('Remote App Error:', error, errorInfo);
    
    // Enviar error a servicio de monitoreo
    // errorTrackingService.logError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="remote-error">
          <h2>⚠️ Error en Aplicación Remota</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            <summary>Detalles del error</summary>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo.componentStack}
          </details>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="retry-btn"
          >
            🔄 Reintentar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default RemoteErrorBoundary;
```

---

## 📡 Parte 3: Comunicación entre Apps

### 🔄 Paso 3.1: Estrategias de Comunicación

#### 3.1.1 Props y Callbacks (Recomendado)

```javascript
// Host App
const HostApp = () => {
  const [sharedState, setSharedState] = useState({
    user: { id: 1, name: 'Juan' },
    theme: 'dark'
  });

  const handleRemoteEvent = (eventType, data) => {
    switch(eventType) {
      case 'USER_UPDATED':
        setSharedState(prev => ({ 
          ...prev, 
          user: { ...prev.user, ...data } 
        }));
        break;
      case 'THEME_CHANGED':
        setSharedState(prev => ({ ...prev, theme: data }));
        break;
      default:
        console.log('Evento no manejado:', eventType, data);
    }
  };

  return (
    <RemoteApp1 
      user={sharedState.user}
      theme={sharedState.theme}
      onEvent={handleRemoteEvent}
    />
  );
};

// Remote App
const RemoteApp = ({ user, theme, onEvent }) => {
  const updateUser = (newData) => {
    onEvent('USER_UPDATED', newData);
  };

  const changeTheme = (newTheme) => {
    onEvent('THEME_CHANGED', newTheme);
  };

  return (
    <div className={`remote-app theme-${theme}`}>
      <h3>Hola, {user.name}!</h3>
      <button onClick={() => updateUser({ name: 'Juan Actualizado' })}>
        Actualizar Usuario
      </button>
      <button onClick={() => changeTheme('light')}>
        Cambiar Tema
      </button>
    </div>
  );
};
```

#### 3.1.2 Event Bus Global (Para casos avanzados)

```javascript
// src/utils/eventBus.js
class EventBus {
  constructor() {
    this.events = {};
  }

  subscribe(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    
    // Retornar función de cleanup
    return () => {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    };
  }

  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }
}

// Instancia global compartida
window.globalEventBus = window.globalEventBus || new EventBus();
export default window.globalEventBus;

// Uso en Host App
import eventBus from './utils/eventBus';

const HostApp = () => {
  useEffect(() => {
    const unsubscribe = eventBus.subscribe('REMOTE_ACTION', (data) => {
      console.log('Acción desde remote:', data);
    });

    return unsubscribe;
  }, []);

  return <RemoteApp1 />;
};

// Uso en Remote App
import eventBus from './utils/eventBus';

const RemoteApp = () => {
  const sendAction = () => {
    eventBus.emit('REMOTE_ACTION', { type: 'button_click', timestamp: Date.now() });
  };

  return <button onClick={sendAction}>Enviar Acción</button>;
};
```

#### 3.1.3 Shared State con Context

```javascript
// src/context/SharedContext.js
import React, { createContext, useContext, useState } from 'react';

const SharedContext = createContext();

export const SharedProvider = ({ children }) => {
  const [sharedData, setSharedData] = useState({
    user: null,
    theme: 'light',
    notifications: []
  });

  const updateSharedData = (updates) => {
    setSharedData(prev => ({ ...prev, ...updates }));
  };

  return (
    <SharedContext.Provider value={{ sharedData, updateSharedData }}>
      {children}
    </SharedContext.Provider>
  );
};

export const useSharedContext = () => {
  const context = useContext(SharedContext);
  if (!context) {
    throw new Error('useSharedContext debe usarse dentro de SharedProvider');
  }
  return context;
};

// Host App
import { SharedProvider } from './context/SharedContext';

const App = () => (
  <SharedProvider>
    <Router>
      <Routes>
        <Route path="/remote1" element={<RemoteApp1 />} />
      </Routes>
    </Router>
  </SharedProvider>
);

// Remote App
import { useSharedContext } from './context/SharedContext';

const RemoteApp = () => {
  const { sharedData, updateSharedData } = useSharedContext();

  return (
    <div>
      <p>Usuario: {sharedData.user?.name}</p>
      <button onClick={() => updateSharedData({ theme: 'dark' })}>
        Cambiar Tema
      </button>
    </div>
  );
};
```

---

## 🧪 Parte 4: Probar la Integración

### ✅ Paso 4.1: Lista de Verificación

#### 4.1.1 Verificaciones Básicas

```bash
# 1. Verificar que las apps se ejecutan independientemente
cd remote-app && npm run dev  # Puerto 3001
cd host-app && npm run dev    # Puerto 3000

# 2. Verificar remoteEntry.js
curl http://localhost:3001/remoteEntry.js
# Debe retornar contenido JavaScript

# 3. Verificar integración
# Abrir http://localhost:3000 y navegar a la ruta con remote app
```

#### 4.1.2 Debugging en Developer Tools

```javascript
// Agregar logs para debugging
const RemoteApp = (props) => {
  useEffect(() => {
    console.log('Remote App montada con props:', props);
    console.log('Module Federation Info:', {
      isRemote: window.__webpack_require__?.federation,
      remotes: window.__webpack_require__?.federation?.remotes
    });
  }, [props]);

  return <div>Remote App Content</div>;
};
```

#### 4.1.3 Network Analysis

**En Developer Tools > Network:**
- ✅ Verificar carga de `remoteEntry.js`
- ✅ Confirmar lazy loading de chunks
- ✅ Revisar tiempos de carga
- ✅ Verificar códigos de respuesta HTTP

#### 4.1.4 Console Monitoring

```javascript
// Host App - Monitoreo de errores
window.addEventListener('unhandledrejection', event => {
  if (event.reason?.message?.includes('Loading')) {
    console.error('Error cargando módulo remoto:', event.reason);
    // Mostrar fallback UI
  }
});

// Verificar estado de Module Federation
console.log('Federation State:', {
  remotes: __webpack_require__.federation?.remotes,
  shared: __webpack_require__.federation?.shared
});
```

---

## 🔍 Parte 5: Solución de Problemas

### ❌ Problema 1: "Module not found: Can't resolve 'remoteApp1/App'"

#### Causas Posibles:
- Remote app no está ejecutándose
- URL incorrecta en remotes config
- Nombre de la remote app no coincide

#### Soluciones:

```javascript
// 1. Verificar que la remote app esté ejecutándose
// http://localhost:3001/remoteEntry.js debe ser accesible

// 2. Verificar configuración en host
remotes: {
  remoteApp1: 'remoteApp1@http://localhost:3001/remoteEntry.js',
  //         ↑ Debe coincidir con el name en la remote app
}

// 3. Agregar fallback de desarrollo
const RemoteApp1 = React.lazy(() => 
  import('remoteApp1/App').catch(() => 
    import('./fallbacks/RemoteApp1Fallback')
  )
);
```

### ❌ Problema 2: "React version mismatch"

#### Causa:
Diferentes versiones de React entre host y remote

#### Solución:

```javascript
// En AMBAS aplicaciones (host y remote)
shared: {
  react: { 
    singleton: true,        // ⚠️ CRÍTICO
    strictVersion: true,    // Forzar versión exacta
    requiredVersion: '^18.2.0'
  },
  'react-dom': { 
    singleton: true,        // ⚠️ CRÍTICO
    strictVersion: true,
    requiredVersion: '^18.2.0'
  }
}

// Verificar versiones en package.json
// Ambas apps deben usar la misma versión de React
```

### ❌ Problema 3: "Loading chunk failed"

#### Causas y Soluciones:

```javascript
// 1. Error de CORS
// Agregar headers en remote app
devServer: {
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
  }
}

// 2. Red lenta o timeout
// Implementar retry logic
const RetryableRemote = ({ maxRetries = 3, delay = 1000 }) => {
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState(null);

  const RemoteComponent = React.lazy(() => 
    import('remoteApp1/App').catch(err => {
      if (retryCount < maxRetries) {
        setTimeout(() => setRetryCount(prev => prev + 1), delay);
      } else {
        setError(err);
      }
      throw err;
    })
  );

  if (error && retryCount >= maxRetries) {
    return <div>Error: No se pudo cargar la aplicación remota</div>;
  }

  return (
    <Suspense fallback={<div>Cargando... (intento {retryCount + 1})</div>}>
      <RemoteComponent />
    </Suspense>
  );
};
```

### ❌ Problema 4: "CSS conflicts"

#### Causa:
Estilos CSS conflictivos entre host y remote

#### Soluciones:

```css
/* 1. Usar prefijos únicos en remote app */
.remote-app-1 {
  /* Todos los estilos con prefijo */
}

.remote-app-1 .button {
  /* Estilos específicos */
}

/* 2. CSS Modules en remote app */
/* Button.module.css */
.button {
  composes: base from './base.module.css';
  /* estilos específicos */
}
```

```javascript
// 3. CSS-in-JS para aislamiento completo
import styled from 'styled-components';

const RemoteContainer = styled.div`
  /* Estilos aislados */
  all: initial; /* Reset de estilos */
  font-family: Arial, sans-serif;
  
  * {
    box-sizing: border-box;
  }
`;

const RemoteApp = () => (
  <RemoteContainer>
    {/* Contenido de la remote app */}
  </RemoteContainer>
);
```

---

## ⚡ Parte 6: Optimización de Rendimiento

### 🚀 Paso 6.1: Lazy Loading Optimizado

```javascript
// 1. Preloading de módulos críticos
const preloadRemote = () => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = 'http://localhost:3001/remoteEntry.js';
  document.head.appendChild(link);
};

// Precargar en el useEffect del host
useEffect(() => {
  preloadRemote();
}, []);

// 2. Code splitting inteligente
const RemoteApp1 = React.lazy(() => 
  import(
    /* webpackChunkName: "remote-app-1" */
    /* webpackPreload: true */
    'remoteApp1/App'
  )
);

// 3. Suspense boundaries granulares
const RemoteSection = () => (
  <div>
    <Suspense fallback={<HeaderSkeleton />}>
      <RemoteHeader />
    </Suspense>
    
    <Suspense fallback={<ContentSkeleton />}>
      <RemoteContent />
    </Suspense>
    
    <Suspense fallback={<FooterSkeleton />}>
      <RemoteFooter />
    </Suspense>
  </div>
);
```

### 📊 Paso 6.2: Monitoreo de Performance

```javascript
// src/utils/performanceMonitor.js
export const measureRemoteLoadTime = (remoteName) => {
  const startTime = performance.now();
  
  return import(`${remoteName}/App`).then(module => {
    const endTime = performance.now();
    const loadTime = endTime - startTime;
    
    console.log(`${remoteName} loaded in ${loadTime}ms`);
    
    // Enviar métricas a servicio de analytics
    // analytics.track('remote_load_time', { 
    //   remote: remoteName, 
    //   duration: loadTime 
    // });
    
    return module;
  });
};

// Uso en componentes
const RemoteApp1 = React.lazy(() => measureRemoteLoadTime('remoteApp1'));
```

### 🔧 Paso 6.3: Webpack Optimizations

```javascript
// webpack.config.js optimizado para production
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        shared: {
          name: 'shared',
          minChunks: 2,
          chunks: 'all',
          enforce: true
        }
      }
    }
  },
  plugins: [
    new ModuleFederationPlugin({
      // configuración optimizada
      shared: {
        react: { 
          singleton: true,
          eager: false,           // Lazy loading
          requiredVersion: '^18.2.0',
          import: 'react',        // Específico import
          shareScope: 'default'   // Scope compartido
        }
      }
    })
  ]
};
```

---

## 📋 Checklist Final de Integración

### ✅ Remote App Configurada:
- [ ] **ModuleFederationPlugin** configurado correctamente
- [ ] **Componentes expuestos** en la configuración
- [ ] **Puerto específico** asignado (3001, 3002, etc.)
- [ ] **CORS habilitado** para cross-origin requests
- [ ] **remoteEntry.js** accesible vía HTTP
- [ ] **Shared dependencies** configuradas

### ✅ Host App Configurada:
- [ ] **Remotes** mapeadas correctamente en configuración
- [ ] **Lazy loading** implementado con React.lazy()
- [ ] **Suspense boundaries** en lugares apropiados
- [ ] **Error boundaries** para manejo de fallos
- [ ] **Fallback UI** para estados de carga
- [ ] **Props y callbacks** para comunicación

### ✅ Integración Funcionando:
- [ ] **Navegación** entre host y remotes funciona
- [ ] **Props** se pasan correctamente a remotes
- [ ] **Callbacks** permiten comunicación host ← remote
- [ ] **Estilos CSS** no entran en conflicto
- [ ] **Performance** es aceptable (<3s carga inicial)
- [ ] **Errores** se manejan gracefully

### ✅ Production Ready:
- [ ] **URLs de producción** configuradas
- [ ] **Error tracking** implementado
- [ ] **Performance monitoring** activo
- [ ] **Tests de integración** pasando
- [ ] **CI/CD** configurado para deploys independientes

---

## 🚀 Próximos Pasos Avanzados

### 1. **Autenticación Compartida**
```javascript
// Compartir tokens entre apps
const AuthenticatedRemote = ({ authToken }) => (
  <RemoteApp1 
    authToken={authToken}
    onAuthRequired={() => redirectToLogin()}
  />
);
```

### 2. **State Management Global**
```javascript
// Redux/Zustand compartido entre apps
import { createStore } from './shared-store';

const globalStore = createStore();
window.__GLOBAL_STORE__ = globalStore;
```

### 3. **Routing Avanzado**
```javascript
// Routing coordinado entre host y remotes
const RemoteRoute = ({ remoteName, path, ...props }) => (
  <Route path={path} element={
    <Suspense fallback={<Loading />}>
      <LazyRemote remoteName={remoteName} {...props} />
    </Suspense>
  } />
);
```

### 4. **Deployment Strategies**
- **Independent Deployments**: Cada app se despliega por separado
- **Canary Releases**: Probar nuevas versiones gradualmente
- **Blue-Green Deployments**: Switch instantáneo entre versiones

---

¡Felicidades! 🎉 Ahora dominas completamente **cómo integrar aplicaciones remotas con hosts** usando **Module Federation**. Esta guía te proporciona todo lo necesario para crear, conectar y mantener arquitecturas de microfrontends robustas y escalables. 