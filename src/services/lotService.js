// 📁 src/services/lot/lotService.js
import api from './axiosLot';

/**
 * 🔍 Rechercher un lot par numéro avec critère de recherche
 */
const rechercherParNumeroLot = async (numeroLot) => {
  const response = await api.get(`/${numeroLot}`);
  return { data: [response.data] }; // le backend retourne un seul objet, on le met en tableau
};

/**
 * 🔍 Rechercher un lot par ID
 */
const rechercherParIdLot = async (id) => {
  const response = await api.get(`/details/${id}`);
  return { data: [response.data] };
};

/**
 * 🔍 Rechercher les lots par numéro de police et période
 */
const rechercherParNumeroPoliceEtPeriode = async (numeroPolice, dateDebut, dateFin) => {
  const response = await api.get(`/by-police/${numeroPolice}`, {
    params: { dateDebut, dateFin }
  });
  return { data: response.data };
};

/**
 * ✅ Créer un nouveau lot interne
 */
const createLotInterne = async (lotDto) => {
  const response = await api.post(`/interne`, lotDto);
  return { data: response.data };
};

/**
 * ✅ Créer un nouveau lot externe
 */
const createLotExterne = async (lotDto) => {
  const response = await api.post(`/externe`, lotDto);
  return { data: response.data };
};

/**
 * 🔎 Infos contrat/police
 */
const fetchInfosPolice = async (numeroPolice) => {
  const response = await api.get(`/info-police/${numeroPolice}`);
  return response.data;
};

/**
 * ✏️ Modifier un lot unique
 */
const modifierLot = async (id, lotDto) => {
  const response = await api.put(`/${id}`, lotDto); 
  return { data: response.data };
};

/**
 * ✏️ Modifier plusieurs lots
 */
const modifierLotsBatch = async (lotList) => {
  const response = await api.put(`/batch`, lotList);
  return { data: response.data };
};

/**
 * 🔄 Récupérer tous les lots (utilisé par le dashboard)
 */
const getAllLots = async () => {
  // ⚠️ Si tu n'as pas d'endpoint dédié, on utilise celui de recherche par police avec champs vides
  const response = await api.get(`/by-police/`, {
    params: {
      numeroPolice: '',  // vide pour tout récupérer
      dateDebut: '2000-01-01',
      dateFin: '2100-01-01'
    }
  });
  return { data: response.data };
};

/**
 * 📊 Récupérer les lots par police et date (version alternative)
 */
const getLotsByPoliceAndDate = async (numeroPolice, dateDebut, dateFin) => {
  const response = await api.get(`/by-police/${numeroPolice}`, {
    params: { dateDebut, dateFin }
  });
  return response.data;
};

/**
 * ⚠️ Gestion centralisée des erreurs
 */
const handleAPIError = (error) => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.status === 401) return 'Non autorisé - Token expiré ou manquant';
  if (error.response?.status === 403) return 'Accès interdit';
  if (error.message?.includes('Network Error')) return 'Impossible de contacter le serveur';
  return error.message || 'Erreur inconnue';
};

export default {
  getAllLots,
  rechercherParNumeroLot,
  rechercherParIdLot,
  rechercherParNumeroPoliceEtPeriode,
  createLotExterne,
  createLotInterne,
  modifierLot,
  modifierLotsBatch,
  handleAPIError,
  fetchInfosPolice,
  getLotsByPoliceAndDate,
};