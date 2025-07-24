// 📁 src/services/axiosLot.js
import axios from 'axios';
import { getAuthToken, isTokenValid, clearAuthToken } from '../config/auth';

/**
 * Instance Axios configurée pour l'API des lots
 */
const api = axios.create({
  baseURL: 'http://localhost:9999/rest/api/lots',
  timeout: 1000000, // Timeout de 10 secondes
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

/**
 * Intercepteur de requête pour ajouter automatiquement le token d'authentification
 */
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    
    if (token && isTokenValid(token)) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('🔑 Token valide ajouté à la requête (lots)');
    } else if (token) {
      console.warn('⚠️ Token expiré détecté (lots) - Suppression du localStorage');
      clearAuthToken();
      // Note: Dans un vrai système, vous pourriez rediriger vers la page de login ici
    } else {
      console.warn('⚠️ Aucun token disponible pour la requête (lots)');
    }
    
    // Assurer que Content-Type est défini
    config.headers['Content-Type'] = 'application/json';
    
    console.log(`🌐 Requête ${config.method?.toUpperCase()} vers: ${config.url}`);
    
    return config;
  },
  (error) => {
    console.error('❌ Erreur dans l\'intercepteur de requête (lots):', error);
    return Promise.reject(error);
  }
);

/**
 * Intercepteur de réponse pour gérer les erreurs d'authentification
 */
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Réponse reçue (lots): ${response.status}`);
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          console.error('🚫 Erreur d\'authentification (lots) - Token invalide ou expiré');
          clearAuthToken();
          // Vous pourriez déclencher une redirection vers la page de login ici
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

/**
 * Fonctions utilitaires pour les opérations sur les lots
 */

/**
 * Récupère tous les lots
 * @param {object} params - Paramètres de requête (pagination, filtres, etc.)
 * @returns {Promise} Promesse résolue avec les données des lots
 */
export const getAllLots = async (params = {}) => {
  try {
    const response = await api.get('/', { params });
    return response.data;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des lots:', error);
    throw error;
  }
};

/**
 * Récupère un lot spécifique par son ID
 * @param {string|number} lotId - ID du lot
 * @returns {Promise} Promesse résolue avec les données du lot
 */
export const getLotById = async (lotId) => {
  try {
    const response = await api.get(`/${lotId}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Erreur lors de la récupération du lot ${lotId}:`, error);
    throw error;
  }
};

/**
 * Crée un nouveau lot
 * @param {object} lotData - Données du lot à créer
 * @returns {Promise} Promesse résolue avec les données du lot créé
 */
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
/**
 * Récupère les lots associés à un gestionnaire
 * @param {string} gestionnaire - Nom ou identifiant du gestionnaire
 * @returns {Promise} Liste des lots
 */
export const getLotsByGestionnaire = async (gestionnaire) => {
  try {
    const response = await api.get(`/by-gestionnaire/${gestionnaire}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Erreur lors de la récupération des lots du gestionnaire "${gestionnaire}":`, error);
    throw error;
  }
};

/**
 * Met à jour un lot existant
 * @param {string|number} lotId - ID du lot à mettre à jour
 * @param {object} lotData - Nouvelles données du lot
 * @returns {Promise} Promesse résolue avec les données du lot mis à jour
 */
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

/**
 * Supprime un lot
 * @param {string|number} lotId - ID du lot à supprimer
 * @returns {Promise} Promesse résolue une fois le lot supprimé
 */
export const deleteLot = async (lotId) => {
  try {
    await api.delete(`/${lotId}`);
    console.log(`✅ Lot ${lotId} supprimé avec succès`);
  } catch (error) {
    console.error(`❌ Erreur lors de la suppression du lot ${lotId}:`, error);
    throw error;
  }
};

// Export de l'instance axios par défaut pour des utilisations personnalisées
export default api;