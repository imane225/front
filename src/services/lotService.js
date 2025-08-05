import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8089/rest/api/lots',
  timeout: 10000000, 
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

api.interceptors.request.use(
  async (config) => {
    try {
      const keycloak = window.keycloak || (await import('../config/keycloak')).keycloak;
      
      if (keycloak && keycloak.authenticated) {
        if (keycloak.isTokenExpired(30)) {
          console.log('🔄 Token expirant, refresh automatique (lots)...');
          try {
            await keycloak.updateToken(30);
            console.log('✅ Token refreshé avec succès (lots)');
          } catch (refreshError) {
            console.error('❌ Échec du refresh token (lots):', refreshError);
            keycloak.login();
            return Promise.reject(refreshError);
          }
        }
        
        if (keycloak.token) {
          config.headers['Authorization'] = `Bearer ${keycloak.token}`;
          console.log('🔑 Token Keycloak ajouté à la requête (lots)');
        }
      } else {
        console.warn('⚠️ Utilisateur non authentifié (lots)');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du token Keycloak (lots):', error);
    }
    
    config.headers['Content-Type'] = 'application/json';
    console.log(`🌐 Requête ${config.method?.toUpperCase()} vers: ${config.url}`);
    
    return config;
  },
  (error) => {
    console.error('❌ Erreur dans l\'intercepteur de requête (lots):', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`✅ Réponse reçue (lots): ${response.status}`);
    return response;
  },
  async (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          console.error('🚫 Erreur d\'authentification (lots) - Token invalide ou expiré');
          try {
            const keycloak = window.keycloak || (await import('../config/keycloak')).keycloak;
            if (keycloak) {
              keycloak.login();
            }
          } catch (keycloakError) {
            console.error('❌ Erreur lors de la redirection vers Keycloak:', keycloakError);
          }
          break;
        case 403:
          console.error('🚫 Accès interdit (lots) - Permissions insuffisantes');
          break;
        case 404:
          console.error('🔍 Ressource non trouvée (lots)');
          break;
        case 500:
          console.error('💥 Erreur serveur interne (lots)');
          break;
        default:
          console.error(`❌ Erreur HTTP ${status} (lots):`, data);
      }
    } else if (error.request) {
      console.error('🌐 Erreur réseau (lots) - Pas de réponse du serveur');
    } else {
      console.error('❌ Erreur lors de la configuration de la requête (lots):', error.message);
    }
    
    return Promise.reject(error);
  }
);

export const getAllLots = async (params = {}) => {
  try {
    const response = await api.get('/', { params });
    return response.data;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des lots:', error);
    throw error;
  }
};

export const getLotById = async (lotId) => {
  try {
    const response = await api.get(`/${lotId}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Erreur lors de la récupération du lot ${lotId}:`, error);
    throw error;
  }
};

export const createLot = async (lotData) => {
  try {
    const response = await api.post('/', lotData);
    console.log('✅ Lot créé avec succès');
    return response.data;
  } catch (error) {
    console.error('❌ Erreur lors de la création du lot:', error);
    throw error;
  }
};

export const getLotsByGestionnaire = async (gestionnaire) => {
  try {
    const response = await api.get(`/by-gestionnaire/${gestionnaire}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Erreur lors de la récupération des lots du gestionnaire "${gestionnaire}":`, error);
    throw error;
  }
};

export const updateLot = async (lotId, lotData) => {
  try {
    const response = await api.put(`/${lotId}`, lotData);
    console.log(`✅ Lot ${lotId} mis à jour avec succès`);
    return response.data;
  } catch (error) {
    console.error(`❌ Erreur lors de la mise à jour du lot ${lotId}:`, error);
    throw error;
  }
};

export const deleteLot = async (lotId) => {
  try {
    await api.delete(`/${lotId}`);
    console.log(`✅ Lot ${lotId} supprimé avec succès`);
  } catch (error) {
    console.error(`❌ Erreur lors de la suppression du lot ${lotId}:`, error);
    throw error;
  }
};

export default api;