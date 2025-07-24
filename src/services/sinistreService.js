// 📁 src/services/sinistreService.js
import { getAuthToken, setAuthToken, isTokenValid, clearAuthToken } from '../config/auth';

const API_BASE_URL = 'http://localhost:8089/rest/api/v1/consultation/sinistres';

class SinistreService {
  
  constructor() {
    // ✅ Utilisation de la fonction centralisée au lieu de stocker le token localement
    this.token = getAuthToken();
    console.log('🚀 SinistreService initialisé avec token centralisé');
  }

  /**
   * Définit le token d'authentification
   * ✅ Utilise maintenant la configuration centralisée
   * @param {string} token - Token JWT à définir
   */
  setToken(token) {
    this.token = token;
    setAuthToken(token); // ✅ Fonction centralisée
    console.log('🔑 Token défini:', token ? 'Oui' : 'Non');
  }
async getEtatsSinistre() {
  try {
    console.log('📊 Récupération des états de sinistre...');
    
    const url = `${API_BASE_URL}/etats-sinistre`;
    const response = await this.apiCall(url);
    
    console.log('✅ États de sinistre récupérés:', response.data);
    
    return response;
  } catch (error) {
    console.error('❌ Erreur récupération états de sinistre:', error);
    
    // Fallback en cas d'erreur - mêmes données que le backend
    console.log('🔄 Utilisation des états de fallback');
    return {
      data: [
        { code: '3', libelle: 'Rejeté' },
        { code: '4', libelle: 'Réglé' },
        { code: '6', libelle: 'En attente de complement d\'information' },
        { code: '8', libelle: 'En attente de contre visite' },
        { code: '11', libelle: 'En attente facture définitive' }
      ],
      message: 'États de sinistre (mode hors ligne)',
      success: true
    };
  }
}
  /**
   * Récupère un token depuis Keycloak
   * ✅ Mise à jour pour utiliser la configuration centralisée
   * @param {string} username - Nom d'utilisateur
   * @param {string} password - Mot de passe
   * @returns {Promise<string>} Token d'accès
   */
  async getTokenFromKeycloak(username, password) {
    try {
      const tokenUrl = 'https://access-dy.rmaassurance.com/auth/realms/rma-ad/protocol/openid-connect/token';
      
      // Validation des paramètres
      if (!username || !password) {
        throw new Error('Nom d\'utilisateur et mot de passe requis');
      }

      const formData = new URLSearchParams();
      formData.append('grant_type', 'password');
      formData.append('client_id', 'novas');
      formData.append('username', username.trim());
      formData.append('password', password);
      
      console.log('🔐 Tentative d\'authentification pour:', username);
      
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        
        // ✅ Validation du token reçu
        if (!data.access_token) {
          throw new Error('Token d\'accès manquant dans la réponse');
        }
        
        // ✅ Utilisation de la configuration centralisée
        this.setToken(data.access_token);
        console.log('✅ Authentification réussie');
        
        return data.access_token;
      } else {
        let errorMessage = 'Authentification échouée';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error_description || errorData.error || errorMessage;
        } catch {
          errorMessage = `Erreur ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('❌ Erreur d\'authentification:', error);
      throw error;
    }
  }

  /**
   * Effectue un appel API avec gestion centralisée de l'authentification
   * ✅ Mis à jour pour utiliser la configuration centralisée
   * @param {string} url - URL de l'API
   * @param {object} options - Options de la requête
   * @returns {Promise<object>} Réponse de l'API
   */
  async apiCall(url, options = {}) {
    try {
      console.log('🌐 Appel API:', url);
      console.log('📤 Options:', options);
      
      const currentToken = getAuthToken(); // ✅ Toujours le plus récent
      
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
      };

      // ✅ Validation et ajout du token avec gestion centralisée
      if (currentToken && isTokenValid(currentToken)) {
        headers['Authorization'] = `Bearer ${currentToken}`;
        console.log('🔑 Token valide ajouté aux headers (sinistres)');
      } else if (currentToken) {
        console.warn('⚠️ Token expiré détecté (sinistres) - Suppression');
        clearAuthToken();
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      } else {
        console.warn('⚠️ Aucun token disponible pour l\'authentification');
        throw new Error('Authentification requise. Veuillez vous connecter.');
      }
      
      const response = await fetch(url, {
        headers,
        credentials: 'include',
        ...options
      });

      console.log('📥 Réponse API status:', response.status);

      // ✅ Gestion spécifique des erreurs d'authentification
      if (response.status === 401) {
        console.error('🚫 Erreur 401 - Token invalide ou expiré');
        clearAuthToken();
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }

      if (response.status === 403) {
        console.error('🚫 Erreur 403 - Accès interdit');
        throw new Error('Vous n\'avez pas les permissions nécessaires pour cette opération.');
      }

      if (!response.ok) {
        let errorMessage = `Erreur ${response.status}`;
        
        try {
          const errorData = await response.json();
          console.log('❌ Données d\'erreur:', errorData);
          
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.details) {
            errorMessage = errorData.details;
          }
        } catch {
          errorMessage = `Erreur ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const apiResponse = await response.json();
      console.log('✅ ApiResponse reçue:', apiResponse);
      
      // ✅ Validation de la réponse
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
      
      // ✅ Gestion spécifique des erreurs réseau
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Impossible de se connecter au serveur. Vérifiez que le backend est démarré.');
      }
      
      throw error;
    }
  }

  /**
   * Formate une date pour le backend (DD/MM/YYYY)
   * ✅ Amélioré avec plus de validations
   * @param {string} dateStr - Date à formater
   * @returns {string} Date formatée
   */
  formatDateForBackend(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return '';
    
    try {
      const trimmedDate = dateStr.trim();
      
      // Format YYYY-MM-DD vers DD/MM/YYYY
      if (trimmedDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = trimmedDate.split('-');
        return `${day}/${month}/${year}`;
      }
      
      // Déjà au bon format DD/MM/YYYY
      if (trimmedDate.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        // Validation supplémentaire : vérifier que c'est une date valide
        const [day, month, year] = trimmedDate.split('/');
        const date = new Date(year, month - 1, day);
        if (date.getFullYear() == year && 
            date.getMonth() == month - 1 && 
            date.getDate() == day) {
          return trimmedDate;
        }
      }
      
      // Tentative avec constructeur Date
      const date = new Date(trimmedDate);
      if (!isNaN(date.getTime())) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      }
      
      console.warn('⚠️ Format de date non reconnu:', dateStr);
      return trimmedDate;
    } catch (error) {
      console.warn('⚠️ Erreur formatage date pour backend:', error);
      return dateStr;
    }
  }

  /**
   * Formate une date pour le frontend (YYYY-MM-DD)
   * ✅ Amélioré avec plus de validations
   * @param {string} dateStr - Date à formater
   * @returns {string} Date formatée
   */
  formatDateForFrontend(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return '';
    
    try {
      const trimmedDate = dateStr.trim();
      
      // Format DD/MM/YYYY vers YYYY-MM-DD
      if (trimmedDate.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        const [day, month, year] = trimmedDate.split('/');
        // Validation de la date
        const date = new Date(year, month - 1, day);
        if (date.getFullYear() == year && 
            date.getMonth() == month - 1 && 
            date.getDate() == day) {
          return `${year}-${month}-${day}`;
        }
      }
      
      // Déjà au bon format YYYY-MM-DD
      if (trimmedDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return trimmedDate;
      }
      
      console.warn('⚠️ Format de date non reconnu pour frontend:', dateStr);
      return trimmedDate;
    } catch (error) {
      console.warn('⚠️ Erreur formatage date pour frontend:', error);
      return dateStr;
    }
  }

  /**
   * Teste la connexion à l'API
   * ✅ Mis à jour pour utiliser la configuration centralisée
   * @returns {Promise<object>} Résultat du test
   */
  async testConnection() {
    try {
      console.log('🔧 Test de connexion...');
      
      const currentToken = getAuthToken();
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (currentToken && isTokenValid(currentToken)) {
        headers['Authorization'] = `Bearer ${currentToken}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/nom-prenom?nom=TEST`, {
        method: 'GET',
        headers,
        credentials: 'include',
      });
      
      console.log('📡 Status de test:', response.status);
      
      return { 
        success: response.status < 500, 
        status: response.status, 
        hasToken: !!currentToken,
        tokenValid: currentToken ? isTokenValid(currentToken) : false
      };
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
      return { 
        success: false, 
        error: error.message, 
        hasToken: !!getAuthToken(),
        tokenValid: false
      };
    }
  }

  // ✅ Validation d'entrée pour éviter les injections
  validateInput(input, fieldName, maxLength = 255) {
    if (!input || typeof input !== 'string') {
      throw new Error(`${fieldName} est obligatoire`);
    }
    
    const trimmedInput = input.trim();
    if (trimmedInput.length === 0) {
      throw new Error(`${fieldName} ne peut pas être vide`);
    }
    
    if (trimmedInput.length > maxLength) {
      throw new Error(`${fieldName} ne peut pas dépasser ${maxLength} caractères`);
    }
    
    // Vérification des caractères dangereux
    const dangerousChars = /[<>'";&\\]/;
    if (dangerousChars.test(trimmedInput)) {
      throw new Error(`${fieldName} contient des caractères non autorisés`);
    }
    
    return trimmedInput;
  }

  async rechercherParNumero(numSinistre, typeRecherche = 'EXACTE') {
    const validatedNumSinistre = this.validateInput(numSinistre, 'Le numéro de sinistre', 50);
    
    // ✅ Validation du type de recherche
    const validTypes = ['EXACTE', 'CONTIENT', 'COMMENCE_PAR', 'SE_TERMINE_PAR'];
    if (!validTypes.includes(typeRecherche)) {
      typeRecherche = 'EXACTE';
    }
    
    const url = `${API_BASE_URL}/${encodeURIComponent(validatedNumSinistre)}?typeRecherche=${typeRecherche}`;
    const response = await this.apiCall(url);
    
    return {
      ...response,
      data: Array.isArray(response.data) ? response.data : [response.data]
    };
  }

  async rechercherParNomPrenom(nom, prenom, typeRecherche = 'CONTIENT') {
    // ✅ Validation : au moins un des deux champs doit être renseigné
    const nomTrimmed = nom ? nom.trim() : '';
    const prenomTrimmed = prenom ? prenom.trim() : '';
    
    if (!nomTrimmed && !prenomTrimmed) {
      throw new Error('Au moins le nom ou le prénom doit être renseigné');
    }

    const params = new URLSearchParams();
    if (nomTrimmed) {
      this.validateInput(nomTrimmed, 'Le nom', 100);
      params.append('nom', nomTrimmed);
    }
    if (prenomTrimmed) {
      this.validateInput(prenomTrimmed, 'Le prénom', 100);
      params.append('prenom', prenomTrimmed);
    }
    
    // ✅ Validation du type de recherche
    const validTypes = ['EXACTE', 'CONTIENT', 'COMMENCE_PAR', 'SE_TERMINE_PAR'];
    if (!validTypes.includes(typeRecherche)) {
      typeRecherche = 'CONTIENT';
    }
    params.append('typeRecherche', typeRecherche);

    const url = `${API_BASE_URL}/nom-prenom?${params}`;
    return await this.apiCall(url);
  }

  async rechercherParNatureMaladie(natureMaladie, typeRecherche = 'CONTIENT', limit = 50) {
    const validatedNatureMaladie = this.validateInput(natureMaladie, 'La nature de maladie', 200);
    
    // ✅ Validation de la limite
    const validatedLimit = Math.max(1, Math.min(parseInt(limit) || 50, 100));
    
    // ✅ Validation du type de recherche
    const validTypes = ['EXACTE', 'CONTIENT', 'COMMENCE_PAR', 'SE_TERMINE_PAR'];
    if (!validTypes.includes(typeRecherche)) {
      typeRecherche = 'CONTIENT';
    }

    const params = new URLSearchParams({
      natureMaladie: validatedNatureMaladie,
      typeRecherche: typeRecherche,
      limit: validatedLimit.toString()
    });

    const url = `${API_BASE_URL}/maladie?${params}`;
    return await this.apiCall(url);
  }

  async rechercherParEtat(etatSinistre, typeRecherche = 'EXACTE') {
    const validatedEtat = this.validateInput(etatSinistre, 'L\'état du sinistre', 50);
    
    // ✅ Validation du type de recherche
    const validTypes = ['EXACTE', 'CONTIENT', 'COMMENCE_PAR', 'SE_TERMINE_PAR'];
    if (!validTypes.includes(typeRecherche)) {
      typeRecherche = 'EXACTE';
    }

    const params = new URLSearchParams({
      etatSinistre: validatedEtat,
      typeRecherche: typeRecherche
    });

    const url = `${API_BASE_URL}/etat?${params}`;
    return await this.apiCall(url);
  }

  async rechercherCombine(criteres, typeRecherche = 'CONTIENT', limit = 50) {
    // ✅ Validation et nettoyage des critères
    const criteresNettoyes = {};
    let hasValidCriteria = false;

    if (criteres.numSinistre && criteres.numSinistre.trim()) {
      criteresNettoyes.numSinistre = this.validateInput(criteres.numSinistre, 'Le numéro de sinistre', 50);
      hasValidCriteria = true;
    }
    
    if (criteres.nom && criteres.nom.trim()) {
      criteresNettoyes.nom = this.validateInput(criteres.nom, 'Le nom', 100);
      hasValidCriteria = true;
    }
    
    if (criteres.prenom && criteres.prenom.trim()) {
      criteresNettoyes.prenom = this.validateInput(criteres.prenom, 'Le prénom', 100);
      hasValidCriteria = true;
    }
    
    if (criteres.natureMaladie && criteres.natureMaladie.trim()) {
      criteresNettoyes.natureMaladie = this.validateInput(criteres.natureMaladie, 'La nature de maladie', 200);
      hasValidCriteria = true;
    }
    
    if (criteres.etatSinistre && criteres.etatSinistre.trim()) {
      criteresNettoyes.etatSinistre = this.validateInput(criteres.etatSinistre, 'L\'état du sinistre', 50);
      hasValidCriteria = true;
    }

    if (!hasValidCriteria) {
      throw new Error('Au moins un critère de recherche doit être renseigné');
    }

    // ✅ Validation de la limite
    const validatedLimit = Math.max(1, Math.min(parseInt(limit) || 50, 100));
    
    // ✅ Validation du type de recherche
    const validTypes = ['EXACTE', 'CONTIENT', 'COMMENCE_PAR', 'SE_TERMINE_PAR'];
    const validatedTypeRecherche = validTypes.includes(typeRecherche) ? typeRecherche : 'CONTIENT';

    const params = new URLSearchParams();
    
    // Ajout des critères validés
    Object.entries(criteresNettoyes).forEach(([key, value]) => {
      params.append(key, value);
    });
    
    params.append('typeRecherche', validatedTypeRecherche);
    params.append('limit', validatedLimit.toString());

    const url = `${API_BASE_URL}/recherche-combinee?${params}`;
    return await this.apiCall(url);
  }

  async creerSinistreSansLot(sinistreData) {
    // ✅ Validation complète des données obligatoires
    const validatedData = {
      numPolice: this.validateInput(sinistreData.numPolice, 'Le numéro de police', 50),
      numAffiliation: this.validateInput(sinistreData.numAffiliation, 'Le numéro d\'affiliation', 50),
      codeDecl: this.validateInput(sinistreData.codeDecl, 'Le type de déclaration', 10),
      dateSurv: this.validateInput(sinistreData.dateSurv, 'La date de survenance', 10)
    };

    // ✅ Validation et formatage de la date de survenance
    const formattedDateSurv = this.formatDateForBackend(validatedData.dateSurv);
    if (!formattedDateSurv) {
      throw new Error('Format de date de survenance invalide');
    }

    const dataToSend = {
      ...sinistreData,
      numPolice: validatedData.numPolice,
      numAffiliation: validatedData.numAffiliation,
      codeDecl: validatedData.codeDecl,
      dateSurv: formattedDateSurv,
      dateDecl: sinistreData.dateDecl ? this.formatDateForBackend(sinistreData.dateDecl) : null
    };

    console.log('📝 Création d\'un sinistre sans lot:', dataToSend);

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
    // ✅ Validation des données obligatoires
    const validatedNumeroSinistre = this.validateInput(numeroSinistre, 'Le numéro de sinistre', 50);
    const validatedCodeDecl = this.validateInput(sinistreData.codeDecl, 'Le type de déclaration', 10);
    const validatedDateSurv = this.validateInput(sinistreData.dateSurv, 'La date de survenance', 10);

    console.log('💾 Modification du sinistre - données reçues:', sinistreData);

    // ✅ Formatage et validation des données optionnelles
    const dataToSend = {
      codeDecl: validatedCodeDecl,
      dateSurv: this.formatDateForBackend(validatedDateSurv),
      dateDecl: sinistreData.dateDecl ? this.formatDateForBackend(sinistreData.dateDecl) : null,
      montoFe: sinistreData.montoFe && sinistreData.montoFe.trim() ? 
        this.validateInput(sinistreData.montoFe, 'Le montant des frais engagés', 20) : null,
      refExtSi: sinistreData.refExtSi && sinistreData.refExtSi.trim() ? 
        this.validateInput(sinistreData.refExtSi, 'La référence externe', 50) : null,
      natuMala: sinistreData.natuMala && sinistreData.natuMala.trim() ? 
        this.validateInput(sinistreData.natuMala, 'La nature de maladie', 200) : null
    };

    console.log('💾 Données formatées pour le backend:', dataToSend);

    const url = `${API_BASE_URL}/modifier/${encodeURIComponent(validatedNumeroSinistre)}`;
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
    const validatedNumSinistre = this.validateInput(numSinistre, 'Le numéro de sinistre', 50);

    console.log('🔍 Récupération des détails pour:', validatedNumSinistre);
    
    // ✅ Tentative avec endpoint dédié
    try {
      const urlDetails = `${API_BASE_URL}/${encodeURIComponent(validatedNumSinistre)}/details`;
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
    
    // ✅ Fallback vers recherche par numéro
    try {
      console.log('🔄 Fallback vers recherche par numéro');
      const fallbackResponse = await this.rechercherParNumero(validatedNumSinistre, 'EXACTE');
      
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
/**
 * Récupère tous les types de déclaration disponibles
 * @returns {Promise<object>} Liste des types de déclaration avec codes et libellés
 */
async getTypesDeclaration() {
  try {
    console.log('📋 Récupération des types de déclaration...');
    
    const url = `${API_BASE_URL}/types-declaration`;
    const response = await this.apiCall(url);
    
    console.log('✅ Types de déclaration récupérés:', response.data);
    
    return response;
  } catch (error) {
    console.error('❌ Erreur récupération types de déclaration:', error);
    
    // Fallback en cas d'erreur - mêmes données que le backend
    console.log('🔄 Utilisation des types de fallback');
    return {
      data: [
        { code: '21', libelle: 'Déclaration de maladie' },
        { code: '22', libelle: 'Déclaration de maternité' },
        { code: '23', libelle: 'Déclaration d\'optique' },
        { code: '29', libelle: 'Déclaration clinique hors convention' },
        { code: '30', libelle: 'PEC Prestataire Santé' },
        { code: '36', libelle: 'Déclaration Soins Dentaires' },
        { code: '38', libelle: 'Devis SPD' }
      ],
      message: 'Types de déclaration (mode hors ligne)',
      success: true
    };
  }
}
  async genererDocumentSinistre(numPolice, numFiliale, numAffiliation, numSinistre) {
    // ✅ Validation de tous les paramètres
    const validatedParams = {
      numPolice: this.validateInput(numPolice, 'Le numéro de police', 50),
      numFiliale: this.validateInput(numFiliale, 'Le numéro de filiale', 50),
      numAffiliation: this.validateInput(numAffiliation, 'Le numéro d\'affiliation', 50),
      numSinistre: this.validateInput(numSinistre, 'Le numéro de sinistre', 50)
    };

    console.log('📄 Génération de document PDF pour:', validatedParams);

    try {
      const url = `${API_BASE_URL}/${encodeURIComponent(validatedParams.numPolice)}/${encodeURIComponent(validatedParams.numFiliale)}/${encodeURIComponent(validatedParams.numAffiliation)}/${encodeURIComponent(validatedParams.numSinistre)}/document`;
      console.log('🌐 URL de génération:', url);

      // ✅ Utilisation de la configuration centralisée pour l'authentification
      const currentToken = getAuthToken();
      if (!currentToken || !isTokenValid(currentToken)) {
        throw new Error('Authentification requise pour générer le document');
      }

      const headers = {
        'Accept': 'application/pdf',
        'Authorization': `Bearer ${currentToken}`
      };

      console.log('🔑 Token ajouté pour la génération PDF');

      const response = await fetch(url, {
        method: 'GET',
        headers,
        credentials: 'include'
      });

      console.log('📥 Réponse génération PDF status:', response.status);

      // ✅ Gestion spécifique des erreurs d'authentification
      if (response.status === 401) {
        clearAuthToken();
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }

      if (!response.ok) {
        let errorMessage = `Erreur ${response.status}`;
        
        try {
          const errorData = await response.json();
          console.log('❌ Données d\'erreur PDF:', errorData);
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

      const blob = await response.blob();
      console.log('📦 Taille du blob PDF:', blob.size, 'bytes');
      
      if (blob.size === 0) {
        throw new Error('Le document généré est vide');
      }

      // ✅ Validation du type MIME
      if (blob.type && !blob.type.includes('pdf')) {
        console.warn('⚠️ Type MIME inattendu:', blob.type);
      }

      return {
        blob,
        filename: `document_sinistre_${validatedParams.numSinistre}.pdf`,
        success: true,
        message: 'Document généré avec succès'
      };

    } catch (error) {
      console.error('❌ Erreur génération PDF:', error);
      throw error;
    }
  }

  /**
   * Télécharge un blob en tant que fichier
   * ✅ Amélioré avec gestion d'erreurs
   * @param {Blob} blob - Blob à télécharger
   * @param {string} filename - Nom du fichier
   */
  downloadBlob(blob, filename) {
    try {
      // ✅ Validation des paramètres
      if (!blob || !(blob instanceof Blob)) {
        throw new Error('Blob invalide pour le téléchargement');
      }
      
      if (!filename || typeof filename !== 'string') {
        filename = 'document.pdf';
      }
      
      // ✅ Nettoyage du nom de fichier
      const cleanFilename = filename.replace(/[<>:"/\\|?*]/g, '_');
      
      // ✅ Vérification de la taille du blob
      if (blob.size === 0) {
        throw new Error('Le fichier est vide');
      }
      
      console.log('💾 Téléchargement du fichier:', cleanFilename, `(${blob.size} bytes)`);
      
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = cleanFilename;
      link.style.display = 'none'; // ✅ Cacher le lien
      
      document.body.appendChild(link);
      link.click();
      
      // ✅ Nettoyage après téléchargement
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      }, 100);
      
      console.log('✅ Téléchargement initié pour:', cleanFilename);
    } catch (error) {
      console.error('❌ Erreur téléchargement:', error);
      throw new Error('Erreur lors du téléchargement du fichier: ' + error.message);
    }
  }

  /**
   * Gère les erreurs API avec messages contextuels
   * ✅ Amélioré avec plus de cas d'erreurs
   * @param {Error} error - Erreur à traiter
   * @returns {string} Message d'erreur formaté
   */
  handleAPIError(error) {
    const message = error?.message || '';
    
    console.log('🚨 Gestion de l\'erreur:', message);
    
    // ✅ Erreurs de validation des champs
    if (message.includes('contient des caractères non autorisés')) {
      return 'Caractères spéciaux non autorisés dans les champs de saisie';
    }
    if (message.includes('ne peut pas dépasser') && message.includes('caractères')) {
      return message;
    }
    if (message.includes('ne peut pas être vide')) {
      return message;
    }
    
    // ✅ Erreurs d'authentification
    if (message.includes('Session expirée') || message.includes('Authentification requise')) {
      return message;
    }
    if (message.includes('Non autorisé') || message.includes('401')) {
      return 'Session expirée - Veuillez vous reconnecter';
    }
    if (message.includes('Accès interdit') || message.includes('403')) {
      return 'Vous n\'avez pas les permissions nécessaires pour cette opération';
    }
    
    // ✅ Erreurs de modification de sinistre
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
    
    // ✅ Erreurs de génération de documents
    if (message.includes('Aucune édition disponible pour l\'état du sinistre')) {
      return 'Aucun document disponible pour cet état de sinistre. États supportés: REGLE, REJETE, EN_ATTENTE_FACTURE_DEFINITIVE, EN_ATTENTE_COMPLEMENT_INFORMATION, EN_ATTENTE_CONTRE_VISITE';
    }
    if (message.includes('Impossible de générer le document')) {
      return message;
    }
    if (message.includes('Le document généré est vide')) {
      return 'Le document généré est vide. Vérifiez les paramètres et réessayez.';
    }
    if (message.includes('Blob invalide')) {
      return 'Erreur lors de la génération du document. Veuillez réessayer.';
    }
    
    // ✅ Erreurs de recherche
    if (message.includes('Sinistre non trouvé')) {
      return 'Sinistre non trouvé. Vérifiez les paramètres (police, filiale, affiliation, numéro sinistre)';
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
    if (message.includes('Assuré non trouvé')) {
      return 'Assuré non trouvé avec ce numéro d\'affiliation';
    }
    
    // ✅ Erreurs de validation obligatoire
    if (message.includes('obligatoire')) {
      return message; 
    }
    if (message.includes('Format de date') && message.includes('invalide')) {
      return 'Format de date invalide. Utilisez le format DD/MM/YYYY ou YYYY-MM-DD';
    }
    
    // ✅ Erreurs techniques
    if (message.includes('Erreur technique')) {
      return message; 
    }
    if (message.includes('Erreur lors de')) {
      return message; 
    }
    if (message.includes('Token d\'accès manquant')) {
      return 'Erreur d\'authentification. Veuillez vous reconnecter.';
    }
    
    // ✅ Erreurs réseau et de connectivité
    if (message.includes('CORS')) {
      return 'Erreur de connexion au serveur. Vérifiez la configuration CORS.';
    }
    if (message.includes('Impossible de se connecter au serveur')) {
      return message;
    }
    if (message.includes('fetch') || message.includes('NetworkError') || message.includes('TypeError')) {
      return 'Impossible de se connecter au serveur. Vérifiez que le backend est démarré et accessible.';
    }
    if (message.includes('timeout') || message.includes('Timeout')) {
      return 'Délai d\'attente dépassé. Le serveur met trop de temps à répondre.';
    }
    
    // ✅ Erreurs de fichier et téléchargement
    if (message.includes('Erreur lors du téléchargement')) {
      return message;
    }
    if (message.includes('Le fichier est vide')) {
      return 'Le fichier généré est vide';
    }
    
    // ✅ Erreurs Keycloak spécifiques
    if (message.includes('invalid_grant')) {
      return 'Nom d\'utilisateur ou mot de passe incorrect';
    }
    if (message.includes('unauthorized_client')) {
      return 'Client non autorisé pour cette opération';
    }
    if (message.includes('Authentification échouée')) {
      return 'Échec de l\'authentification. Vérifiez vos identifiants.';
    }
    
    // ✅ Message par défaut avec plus de contexte
    if (message.length > 0) {
      return message;
    }
    
    return 'Une erreur inattendue s\'est produite. Veuillez réessayer ou contacter le support technique.';
  }

  /**
   * Récupère des statistiques sur l'état du service
   * ✅ Nouvelle méthode utilitaire
   * @returns {object} Statistiques du service
   */
  getServiceStats() {
    const currentToken = getAuthToken();
    return {
      hasToken: !!currentToken,
      tokenValid: currentToken ? isTokenValid(currentToken) : false,
      apiBaseUrl: API_BASE_URL,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Nettoie les ressources du service
   * ✅ Nouvelle méthode pour le nettoyage
   */
  cleanup() {
    console.log('🧹 Nettoyage du SinistreService');
    this.token = null;
    // Pas de clearAuthToken() ici car d'autres services peuvent l'utiliser
  }
}

// ✅ Export d'une instance singleton
export default new SinistreService();