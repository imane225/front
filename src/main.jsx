import React from 'react';
import { createRoot } from 'react-dom/client';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import keycloak from './config/keycloak.js';
import App from './App.jsx';
import './index.css';

const initOptions = {
  onLoad: 'login-required',
  checkLoginIframe: false,
  pkceMethod: 'S256',
  redirectUri: 'http://localhost:5173/'
};

const KeycloakLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <div className="text-center p-8 bg-white rounded-lg shadow-lg">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">RMA Assurance</h2>
      <p className="text-gray-600">Connexion en cours...</p>
    </div>
  </div>
);

const KeycloakError = () => (
  <div className="flex items-center justify-center min-h-screen bg-red-50">
    <div className="text-center p-8 bg-white rounded-lg shadow-lg border-l-4 border-red-500">
      <h2 className="text-2xl font-bold text-red-600 mb-2">Erreur d'authentification</h2>
      <p className="text-gray-600 mb-4">Impossible de se connecter à Keycloak</p>
      <button 
        onClick={() => window.location.reload()} 
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Réessayer
      </button>
    </div>
  </div>
);

createRoot(document.getElementById('root')).render(
  <ReactKeycloakProvider
    authClient={keycloak}
    initOptions={initOptions}
    LoadingComponent={<KeycloakLoader />}
    onError={<KeycloakError />}
  >
    <App />
  </ReactKeycloakProvider>
);