const API_BASE_URL = 'http://localhost:8089/rest/api/v1/consultation/sinistres';

class SinistreService {
  
  constructor() {
    this.token = null;
  }

  setToken(token) {
    this.token = token;
    console.log('🔑 Token défini:', token ? 'Oui' : 'Non');
  }

  async getTokenFromKeycloak(username, password) {
    try {
      const tokenUrl = 'https://access-dy.rmaassurance.com/auth/realms/rma-ad/protocol/openid-connect/token';
      
      const formData = new URLSearchParams();
      formData.append('grant_type', 'password');
      formData.append('client_id', 'novas');
      formData.append('username', username);
      formData.append('password', password);
      
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        this.setToken(data.access_token);
        return data.access_token;
      } else {
        throw new Error('Authentification échouée');
      }
    } catch (error) {
      console.error('❌ Erreur d\'authentification:', error);
      throw error;
    }
  }

  async apiCall(url, options = {}) {
    try {
      console.log('🌐 Appel API:', url);
      console.log('📤 Options:', options);
      
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers
      };

      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
        console.log('🔑 Token ajouté aux headers');
      } else {
        console.warn('⚠️ Aucun token disponible');
      }
      
      const response = await fetch(url, {
        headers,
        credentials: 'include',
        ...options
      });

      console.log('📥 Réponse API status:', response.status);

      if (!response.ok) {
        let errorMessage = `Erreur ${response.status}`;
        
        try {
          const errorData = await response.json();
          console.log('❌ Données d\'erreur:', errorData);
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch {
          errorMessage = `Erreur ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const apiResponse = await response.json();
      console.log('✅ ApiResponse reçue:', apiResponse);
      
      if (apiResponse.success === false) {
        throw new Error(apiResponse.message || 'Erreur inconnue');
      }

      return {
        data: apiResponse.data, 
        message: apiResponse.message || 'Opération réussie',
        success: apiResponse.success !== false,
        rawResponse: apiResponse
      };
    } catch (error) {
      console.error('❌ Erreur API:', error);
      throw error;
    }
  }

  formatDateForBackend(dateStr) {
    if (!dateStr) return '';
    
    try {
      if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
      }
      
      if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        return dateStr;
      }
      
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      }
      
      return dateStr;
    } catch (error) {
      console.warn('⚠️ Erreur formatage date:', error);
      return dateStr;
    }
  }

  formatDateForFrontend(dateStr) {
    if (!dateStr) return '';
    
    try {
      if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        const [day, month, year] = dateStr.split('/');
        return `${year}-${month}-${day}`;
      }
      
      if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateStr;
      }
      
      return dateStr;
    } catch (error) {
      console.warn('⚠️ Erreur formatage date:', error);
      return dateStr;
    }
  }

  async testConnection() {
    try {
      console.log('🔧 Test de connexion...');
      
      const response = await fetch(`${API_BASE_URL}/nom-prenom?nom=TEST`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        credentials: 'include',
      });
      
      console.log('📡 Status de test:', response.status);
      
      return { 
        success: response.status < 500, 
        status: response.status, 
        hasToken: !!this.token 
      };
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
      return { success: false, error: error.message, hasToken: !!this.token };
    }
  }

  async rechercherParNumero(numSinistre, typeRecherche = 'EXACTE') {
    if (!numSinistre || !numSinistre.trim()) {
      throw new Error('Le numéro de sinistre est obligatoire');
    }
    
    const url = `${API_BASE_URL}/${numSinistre.trim()}?typeRecherche=${typeRecherche}`;
    const response = await this.apiCall(url);
    
    return {
      ...response,
      data: Array.isArray(response.data) ? response.data : [response.data]
    };
  }

  async rechercherParNomPrenom(nom, prenom, typeRecherche = 'CONTIENT') {
    if ((!nom || !nom.trim()) && (!prenom || !prenom.trim())) {
      throw new Error('Au moins le nom ou le prénom doit être renseigné');
    }

    const params = new URLSearchParams();
    if (nom && nom.trim()) params.append('nom', nom.trim());
    if (prenom && prenom.trim()) params.append('prenom', prenom.trim());
    params.append('typeRecherche', typeRecherche);

    const url = `${API_BASE_URL}/nom-prenom?${params}`;
    return await this.apiCall(url);
  }

  async rechercherParNatureMaladie(natureMaladie, typeRecherche = 'CONTIENT', limit = 50) {
    if (!natureMaladie || !natureMaladie.trim()) {
      throw new Error('La nature de maladie est obligatoire');
    }

    const params = new URLSearchParams({
      natureMaladie: natureMaladie.trim(),
      typeRecherche: typeRecherche,
      limit: limit.toString()
    });

    const url = `${API_BASE_URL}/maladie?${params}`;
    return await this.apiCall(url);
  }

  async rechercherParEtat(etatSinistre, typeRecherche = 'EXACTE') {
    if (!etatSinistre || !etatSinistre.trim()) {
      throw new Error('L\'état du sinistre est obligatoire');
    }

    const params = new URLSearchParams({
      etatSinistre: etatSinistre.trim(),
      typeRecherche: typeRecherche
    });

    const url = `${API_BASE_URL}/etat?${params}`;
    return await this.apiCall(url);
  }

  async rechercherCombine(criteres, typeRecherche = 'CONTIENT', limit = 50) {
    const criteresValides = [
      criteres.numSinistre,
      criteres.nom,
      criteres.prenom,
      criteres.natureMaladie,
      criteres.etatSinistre
    ].some(c => c && c.trim());

    if (!criteresValides) {
      throw new Error('Au moins un critère de recherche doit être renseigné');
    }

    const params = new URLSearchParams();
    
    if (criteres.numSinistre && criteres.numSinistre.trim()) {
      params.append('numSinistre', criteres.numSinistre.trim());
    }
    if (criteres.nom && criteres.nom.trim()) {
      params.append('nom', criteres.nom.trim());
    }
    if (criteres.prenom && criteres.prenom.trim()) {
      params.append('prenom', criteres.prenom.trim());
    }
    if (criteres.natureMaladie && criteres.natureMaladie.trim()) {
      params.append('natureMaladie', criteres.natureMaladie.trim());
    }
    if (criteres.etatSinistre && criteres.etatSinistre.trim()) {
      params.append('etatSinistre', criteres.etatSinistre.trim());
    }
    
    params.append('typeRecherche', typeRecherche.toUpperCase());
    params.append('limit', limit.toString());

    const url = `${API_BASE_URL}/recherche-combinee?${params}`;
    return await this.apiCall(url);
  }

  async creerSinistreSansLot(sinistreData) {
    if (!sinistreData.numPolice || !sinistreData.numPolice.trim()) {
      throw new Error('Le numéro de police est obligatoire');
    }
    if (!sinistreData.numAffiliation || !sinistreData.numAffiliation.trim()) {
      throw new Error('Le numéro d\'affiliation est obligatoire');
    }
    if (!sinistreData.codeDecl || !sinistreData.codeDecl.trim()) {
      throw new Error('Le type de déclaration est obligatoire');
    }
    if (!sinistreData.dateSurv || !sinistreData.dateSurv.trim()) {
      throw new Error('La date de survenance est obligatoire');
    }

    const dataToSend = {
      ...sinistreData,
      dateSurv: this.formatDateForBackend(sinistreData.dateSurv),
      dateDecl: sinistreData.dateDecl ? this.formatDateForBackend(sinistreData.dateDecl) : null
    };

    const url = `${API_BASE_URL}/creer-sans-lot`;
    const response = await this.apiCall(url, {
      method: 'POST',
      body: JSON.stringify(dataToSend)
    });
    
    return {
      ...response,
      data: Array.isArray(response.data) ? response.data : [response.data]
    };
  }

  async modifierSinistre(numeroSinistre, sinistreData) {
    if (!numeroSinistre || !numeroSinistre.trim()) {
      throw new Error('Le numéro de sinistre est obligatoire');
    }
    if (!sinistreData.codeDecl || !sinistreData.codeDecl.trim()) {
      throw new Error('Le type de déclaration est obligatoire');
    }
    if (!sinistreData.dateSurv || !sinistreData.dateSurv.trim()) {
      throw new Error('La date de survenance est obligatoire');
    }

    console.log('💾 Modification du sinistre - données reçues:', sinistreData);

    const dataToSend = {
      codeDecl: sinistreData.codeDecl.trim(),
      dateSurv: this.formatDateForBackend(sinistreData.dateSurv),
      dateDecl: sinistreData.dateDecl ? this.formatDateForBackend(sinistreData.dateDecl) : null,
      montoFe: sinistreData.montoFe && sinistreData.montoFe.trim() ? sinistreData.montoFe.trim() : null,
      refExtSi: sinistreData.refExtSi && sinistreData.refExtSi.trim() ? sinistreData.refExtSi.trim() : null,
      natuMala: sinistreData.natuMala && sinistreData.natuMala.trim() ? sinistreData.natuMala.trim() : null
    };

    console.log('💾 Données formatées pour le backend:', dataToSend);

    const url = `${API_BASE_URL}/modifier/${numeroSinistre.trim()}`;
    const response = await this.apiCall(url, {
      method: 'PUT',
      body: JSON.stringify(dataToSend)
    });
    
    return {
      ...response,
      data: response.data 
    };
  }

  async getDetailsSinistre(numSinistre) {
    if (!numSinistre || !numSinistre.trim()) {
      throw new Error('Le numéro de sinistre est obligatoire');
    }

    console.log('🔍 Récupération des détails pour:', numSinistre);
    
    try {
      const urlDetails = `${API_BASE_URL}/${numSinistre.trim()}/details`;
      console.log('🎯 Tentative avec endpoint /details:', urlDetails);
      
      const response = await this.apiCall(urlDetails);
      console.log('✅ Réponse de /details:', response);
      
      let sinistreData = null;
      
      if (response.data) {
        if (Array.isArray(response.data) && response.data.length > 0) {
          sinistreData = response.data[0];
        } else if (!Array.isArray(response.data)) {
          sinistreData = response.data;
        }
      }
      
      if (sinistreData) {
        const formattedData = {
          ...sinistreData,
          dateSurv: this.formatDateForFrontend(sinistreData.dateSurv),
          dateDecl: this.formatDateForFrontend(sinistreData.dateDecl),
          dateOuve: this.formatDateForFrontend(sinistreData.dateOuve)
        };
        
        console.log('✅ Données du sinistre trouvées et formatées:', formattedData);
        return {
          ...response,
          data: formattedData
        };
      }
    } catch (error) {
      console.log('❌ Erreur avec /details:', error.message);
    }
    
    try {
      console.log('🔄 Fallback vers recherche par numéro');
      const fallbackResponse = await this.rechercherParNumero(numSinistre, 'EXACTE');
      
      if (fallbackResponse.data && fallbackResponse.data.length > 0) {
        const sinistreData = fallbackResponse.data[0];
        
        const formattedData = {
          ...sinistreData,
          dateSurv: this.formatDateForFrontend(sinistreData.dateSurv),
          dateDecl: this.formatDateForFrontend(sinistreData.dateDecl),
          dateOuve: this.formatDateForFrontend(sinistreData.dateOuve)
        };
        
        console.log('✅ Données trouvées via fallback et formatées:', formattedData);
        return {
          ...fallbackResponse,
          data: formattedData
        };
      }
    } catch (fallbackError) {
      console.log('❌ Erreur avec fallback:', fallbackError.message);
    }
    
    throw new Error('Impossible de récupérer les détails du sinistre');
  }

  handleAPIError(error) {
    const message = error.message || '';
    
    console.log('🚨 Gestion de l\'erreur:', message);
    
    if (message.includes('ne peut pas être modifié car il est dans l\'état')) {
      return message; 
    }
    if (message.includes('Seule la réouverture est possible')) {
      return message; 
    }
    if (message.includes('consultation uniquement autorisée')) {
      return message; 
    }
    if (message.includes('Le type de déclaration ne peut pas être modifié pour un sinistre')) {
      return message;
    }
    if (message.includes('La date de survenance ne peut pas être modifiée pour un sinistre')) {
      return message;
    }
    if (message.includes('Le montant des frais engagés ne peut pas être modifié pour un sinistre')) {
      return message; 
    }
    if (message.includes('La référence externe ne peut pas être modifiée pour un sinistre')) {
      return message; 
    }
    if (message.includes('La nature de la maladie ne peut pas être modifiée pour un sinistre')) {
      return message; 
    }
    
    if (message.includes('Au moins un critère de recherche doit être renseigné')) {
      return 'Au moins un critère de recherche doit être renseigné';
    }
    if (message.includes('Aucun sinistre trouvé')) {
      return 'Aucun résultat trouvé pour les critères spécifiés';
    }
    if (message.includes('Type de recherche invalide')) {
      return 'Type de recherche invalide. Utilisez: EXACTE, CONTIENT, COMMENCE_PAR, SE_TERMINE_PAR';
    }
    if (message.includes('obligatoire')) {
      return message; 
    }
    if (message.includes('Assuré non trouvé')) {
      return 'Assuré non trouvé avec ce numéro d\'affiliation';
    }
    if (message.includes('Sinistre non trouvé')) {
      return 'Sinistre non trouvé avec ce numéro';
    }
    if (message.includes('Erreur technique')) {
      return message; 
    }
    if (message.includes('Erreur lors de')) {
      return message; 
    }
    if (message.includes('Non autorisé') || message.includes('401')) {
      return 'Session expirée - Veuillez vous reconnecter';
    }
    if (message.includes('Accès interdit') || message.includes('403')) {
      return 'Vous n\'avez pas les permissions nécessaires';
    }
    if (message.includes('CORS')) {
      return 'Erreur de connexion au serveur. Vérifiez la configuration CORS.';
    }
    if (message.includes('fetch') || message.includes('NetworkError')) {
      return 'Impossible de se connecter au serveur. Vérifiez que le backend est démarré.';
    }
    
    return message || 'Erreur inconnue';
  }
}

export default new SinistreService();