import api from './axiosLot';



const rechercherParNumeroLot = async (numeroLot) => {
  const response = await api.get(`/${numeroLot}`);
  return { data: [response.data] };
};


const rechercherParIdLot = async (id) => {
  const response = await api.get(`/details/${id}`);
  return { data: [response.data] };
};


const rechercherParNumeroPoliceEtPeriode = async (numeroPolice, dateDebut, dateFin) => {
  const response = await api.get(`/by-police/${numeroPolice}`, {
    params: { dateDebut, dateFin }
  });
  return { data: response.data };
};


const createLotInterne = async (lotDto) => {
  const response = await api.post(`/interne`, lotDto);
  return { data: response.data };
};


const createLotExterne = async (lotDto) => {
  const response = await api.post(`/externe`, lotDto);
  return { data: response.data };
};


const fetchInfosPolice = async (numeroPolice) => {
  const response = await api.get(`/info-police/${numeroPolice}`);
  return response.data;
};


const modifierLot = async (id, lotDto) => {
  const response = await api.put(`/${id}`, lotDto); 
  return { data: response.data };
};


const modifierLotsBatch = async (lotList) => {
  const response = await api.put(`/batch`, lotList);
  return { data: response.data };
};


const getAllLots = async () => {
  const response = await api.get(`/by-police/`, {
    params: {
      numeroPolice: '',  
      dateDebut: '2000-01-01',
      dateFin: '2100-01-01'
    }
  });
  return { data: response.data };
};


const getLotsByPoliceAndDate = async (numeroPolice, dateDebut, dateFin) => {
  const response = await api.get(`/by-police/${numeroPolice}`, {
    params: { dateDebut, dateFin }
  });
  return response.data;
};
const rechercherParGestionnaire = async (gestionnaire) => {
  const response = await api.get(`/by-gestionnaire/${gestionnaire}`);
  return {
    data: Array.isArray(response.data) ? response.data : [response.data],
    message: `Lots trouvés pour le gestionnaire ${gestionnaire}`
  };
};




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
  rechercherParGestionnaire,
  modifierLot,
  modifierLotsBatch,
  handleAPIError,
  fetchInfosPolice,
  getLotsByPoliceAndDate,
};