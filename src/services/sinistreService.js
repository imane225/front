import { getAuthToken, setAuthToken, isTokenValid, clearAuthToken } from '../config/auth';

const API_BASE_URL = 'http://localhost:8089/rest/api/v1/consultation/sinistres';

class SinistreService {
  
  constructor() {
    this.token = getAuthToken();
    console.log('🚀 SinistreService initialisé avec token centralisé');
  }

  
  setToken(token) {
    this.token = token;
    setAuthToken(token);
    console.log('🔑 Token défini:', token ? 'Oui' : 'Non');
  }

  
  async getEtatsSinistre() {
    try {
      console.log('📊 Récupération des états de sinistre avec gestion des accents...');
      
      const url = `${API_BASE_URL}/etats-sinistre`;
      const response = await this.apiCall(url);
      
      console.log('✅ États de sinistre récupérés du backend:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        response.data.forEach(etat => {
          if (etat.libelle && etat.libelle.includes('complement')) {
            console.log('🔍 État SANS accent trouvé:', etat);
          }
          if (etat.libelle && etat.libelle.includes('complément')) {
            console.log('🔍 État AVEC accent trouvé:', etat);
          }
        });
      }
      
      return response;
    } catch (error) {
      console.error('❌ Erreur récupération états de sinistre:', error);
      
      console.log('🔄 Utilisation des états de fallback (libellés exacts BDD)');
      return {
        data: [
          { code: '1', libelle: 'En cours de traitement' },
          { code: '2', libelle: 'En attente de traitement' },
          { code: '3', libelle: 'Rejeté' },
          { code: '4', libelle: 'Réglé' },
          { code: '5', libelle: 'Sans suite' },
          { code: '6', libelle: 'En attente de complément d\'information' }, 
          { code: '7', libelle: 'En attente de contrôle médical' },
          { code: '8', libelle: 'En attente de contre visite' },
          { code: '9', libelle: 'Réglé' },
          { code: '10', libelle: 'Établissement de décompte en cours' },
          { code: '11', libelle: 'En attente facture définitive' },
          { code: '12', libelle: 'En attente de complément d\'information interne' }, 
          { code: '13', libelle: 'En attente de contrôle médical systématique' },
          { code: '14', libelle: 'Annulé' },
          { code: '15', libelle: 'Accord réglé partiellement' },
          { code: '16', libelle: 'Règlement annulé' },
          { code: '17', libelle: 'En attente MAJ RIB Adhérent' },
          { code: '18', libelle: 'En attente MAJ RIB Société' },
          { code: '19', libelle: 'En attente MAJ Carte' },
          { code: '20', libelle: 'Migré (à réouvrir)' }
        ],
        message: 'États de sinistre (mode hors ligne avec libellés exacts BDD)',
        success: true
      };
    }
  }

 
  async getTypesDeclaration() {
    try {
      console.log('📋 Récupération des types de déclaration...');
      
      const url = `${API_BASE_URL}/types-declaration`;
      const response = await this.apiCall(url);
      
      console.log('✅ Types de déclaration récupérés:', response.data);
      
      return response;
    } catch (error) {
      console.error('❌ Erreur récupération types de déclaration:', error);
      
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

  
  async getTokenFromKeycloak(username, password) {
    try {
      const tokenUrl = 'https://access-dy.rmaassurance.com/auth/realms/rma-ad/protocol/openid-connect/token';
      
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
        
        if (!data.access_token) {
          throw new Error('Token d\'accès manquant dans la réponse');
        }
        
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

  async apiCall(url, options = {}) {
    try {
      console.log('🌐 Appel API:', url);
      console.log('📤 Options:', options);
      
      const currentToken = getAuthToken();
      
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
      };

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
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Impossible de se connecter au serveur. Vérifiez que le backend est démarré.');
      }
      
      throw error;
    }
  }

  
  formatDateForBackend(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return '';
    
    try {
      const trimmedDate = dateStr.trim();
      
      if (trimmedDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = trimmedDate.split('-');
        return `${day}/${month}/${year}`;
      }
      
      if (trimmedDate.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        const [day, month, year] = trimmedDate.split('/');
        const date = new Date(year, month - 1, day);
        if (date.getFullYear() == year && 
            date.getMonth() == month - 1 && 
            date.getDate() == day) {
          return trimmedDate;
        }
      }
      
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

  
  formatDateForFrontend(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return '';
    
    try {
      const trimmedDate = dateStr.trim();
      
      if (trimmedDate.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        const [day, month, year] = trimmedDate.split('/');
        const date = new Date(year, month - 1, day);
        if (date.getFullYear() == year && 
            date.getMonth() == month - 1 && 
            date.getDate() == day) {
          return `${year}-${month}-${day}`;
        }
      }
      
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
  
  if (fieldName.toLowerCase().includes('état') || 
      fieldName.toLowerCase().includes('sinistre') ||
      fieldName.toLowerCase().includes('etat')) {
    
    console.log(`🔍 Validation spéciale pour état: "${trimmedInput}" (${fieldName})`);
    
    const etatSafeChars = /[<>";&\\]/; 
    if (etatSafeChars.test(trimmedInput)) {
      throw new Error(`${fieldName} contient des caractères non autorisés`);
    }
    
    console.log(`✅ Validation état réussie pour: "${trimmedInput}"`);
    return trimmedInput;
  }
  
  const dangerousChars = /[<>'";&\\]/; 
  if (dangerousChars.test(trimmedInput)) {
    throw new Error(`${fieldName} contient des caractères non autorisés`);
  }
  
  return trimmedInput;
}
  async rechercherParNumero(numSinistre, typeRecherche = 'EXACTE') {
    const validatedNumSinistre = this.validateInput(numSinistre, 'Le numéro de sinistre', 50);
    
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
    
    const validatedLimit = Math.max(1, Math.min(parseInt(limit) || 50, 100));
    
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
    const validatedEtat = this.validateInput(etatSinistre, 'L\'état du sinistre', 100);
    
    console.log('🔍 rechercherParEtat - État reçu:', `"${validatedEtat}"`);
    console.log('🔍 rechercherParEtat - Longueur:', validatedEtat.length);
    console.log('🔍 rechercherParEtat - Caractères détaillés:', [...validatedEtat].map(c => `${c}(${c.charCodeAt(0)})`));
    console.log('🔍 rechercherParEtat - Type recherche:', typeRecherche);
    
    const hasAccents = /[àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]/i.test(validatedEtat);
    if (hasAccents) {
      console.log('🔍 État avec accents détecté, le backend gérera automatiquement la normalisation');
    } else {
      console.log('🔍 État sans accents détecté, recherche directe');
    }
    
    const validTypes = ['EXACTE', 'CONTIENT', 'COMMENCE_PAR', 'SE_TERMINE_PAR'];
    if (!validTypes.includes(typeRecherche)) {
      typeRecherche = 'EXACTE';
    }

    const params = new URLSearchParams({
      etatSinistre: validatedEtat,
      typeRecherche: typeRecherche
    });

    const url = `${API_BASE_URL}/etat?${params}`;
    console.log('🔍 rechercherParEtat - URL finale:', url);
    
    try {
      const response = await this.apiCall(url);
      console.log('✅ rechercherParEtat - Résultats trouvés:', response.data?.length || 0);
      return response;
    } catch (error) {
      console.error('❌ rechercherParEtat - Erreur:', error.message);
      throw error;
    }
  }

  
  async rechercherCombine(criteres, typeRecherche = 'CONTIENT', limit = 50) {
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
      criteresNettoyes.etatSinistre = this.validateInput(criteres.etatSinistre, 'L\'état du sinistre', 100);
      hasValidCriteria = true;
      
      console.log('🔍 rechercherCombine - État reçu:', `"${criteresNettoyes.etatSinistre}"`);
      console.log('🔍 rechercherCombine - Longueur état:', criteresNettoyes.etatSinistre.length);
      console.log('🔍 rechercherCombine - Caractères état:', [...criteresNettoyes.etatSinistre].map(c => `${c}(${c.charCodeAt(0)})`));
      
      const hasAccents = /[àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]/i.test(criteresNettoyes.etatSinistre);
      if (hasAccents) {
        console.log('🔍 État avec accents détecté dans recherche combinée, gestion automatique');
      } else {
        console.log('🔍 État sans accents détecté dans recherche combinée');
      }
    }

    if (!hasValidCriteria) {
      throw new Error('Au moins un critère de recherche doit être renseigné');
    }

    const validatedLimit = Math.max(1, Math.min(parseInt(limit) || 50, 100));
    
    const validTypes = ['EXACTE', 'CONTIENT', 'COMMENCE_PAR', 'SE_TERMINE_PAR'];
    const validatedTypeRecherche = validTypes.includes(typeRecherche) ? typeRecherche : 'CONTIENT';

    const params = new URLSearchParams();
    
    Object.entries(criteresNettoyes).forEach(([key, value]) => {
      params.append(key, value);
    });
    
    params.append('typeRecherche', validatedTypeRecherche);
    params.append('limit', validatedLimit.toString());

    const url = `${API_BASE_URL}/recherche-combinee?${params}`;
    console.log('🔍 rechercherCombine - URL finale:', url);
    
    try {
      const response = await this.apiCall(url);
      console.log('✅ rechercherCombine - Résultats trouvés:', response.data?.length || 0);
      return response;
    } catch (error) {
      console.error('❌ rechercherCombine - Erreur:', error.message);
      throw error;
    }
  }

  async creerSinistreSansLot(sinistreData) {
    const validatedData = {
      numPolice: this.validateInput(sinistreData.numPolice, 'Le numéro de police', 50),
      numAffiliation: this.validateInput(sinistreData.numAffiliation, 'Le numéro d\'affiliation', 50),
      codeDecl: this.validateInput(sinistreData.codeDecl, 'Le type de déclaration', 10),
      dateSurv: this.validateInput(sinistreData.dateSurv, 'La date de survenance', 10)
    };

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
    const validatedNumeroSinistre = this.validateInput(numeroSinistre, 'Le numéro de sinistre', 50);
    const validatedCodeDecl = this.validateInput(sinistreData.codeDecl, 'Le type de déclaration', 10);
    const validatedDateSurv = this.validateInput(sinistreData.dateSurv, 'La date de survenance', 10);

    console.log('💾 Modification du sinistre - données reçues:', sinistreData);

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

  async genererDocumentSinistre(numPolice, numFiliale, numAffiliation, numSinistre) {
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

  
  downloadBlob(blob, filename) {
    try {
      if (!blob || !(blob instanceof Blob)) {
        throw new Error('Blob invalide pour le téléchargement');
      }
      
      if (!filename || typeof filename !== 'string') {
        filename = 'document.pdf';
      }
      
      const cleanFilename = filename.replace(/[<>:"/\\|?*]/g, '_');
      
      if (blob.size === 0) {
        throw new Error('Le fichier est vide');
      }
      
      console.log('💾 Téléchargement du fichier:', cleanFilename, `(${blob.size} bytes)`);
      
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = cleanFilename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      
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

  
  handleAPIError(error) {
    const message = error?.message || '';
    
    console.log('🚨 Gestion de l\'erreur:', message);
    
    if (message.includes('accent') || message.includes('caractère spécial')) {
      return 'Erreur de traitement des caractères spéciaux. La recherche supporte les accents automatiquement.';
    }
    if (message.includes('complement') || message.includes('complément')) {
      return 'Erreur lors de la recherche avec le terme "complément". La recherche fonctionne avec ou sans accent.';
    }
    if (message.includes('normalisation') || message.includes('encoding')) {
      return 'Erreur d\'encodage des caractères. Réessayez avec des termes plus simples.';
    }
    
    if (message.includes('contient des caractères non autorisés')) {
      return 'Caractères spéciaux non autorisés dans les champs de saisie';
    }
    if (message.includes('ne peut pas dépasser') && message.includes('caractères')) {
      return message;
    }
    if (message.includes('ne peut pas être vide')) {
      return message;
    }
    
    if (message.includes('Session expirée') || message.includes('Authentification requise')) {
      return message;
    }
    if (message.includes('Non autorisé') || message.includes('401')) {
      return 'Session expirée - Veuillez vous reconnecter';
    }
    if (message.includes('Accès interdit') || message.includes('403')) {
      return 'Vous n\'avez pas les permissions nécessaires pour cette opération';
    }
    
    if (message.includes('Aucun sinistre trouvé') && message.includes('état')) {
      return 'Aucun sinistre trouvé pour cet état. La recherche fonctionne avec ou sans accents.';
    }
    if (message.includes('État du sinistre') && message.includes('obligatoire')) {
      return 'L\'état du sinistre est obligatoire pour cette recherche.';
    }
    
    if (message.includes('Sinistre non trouvé')) {
      return 'Sinistre non trouvé. Vérifiez les paramètres (police, filiale, affiliation, numéro sinistre)';
    }
    if (message.includes('Au moins un critère de recherche doit être renseigné')) {
      return 'Au moins un critère de recherche doit être renseigné';
    }
    if (message.includes('Aucun sinistre trouvé')) {
      return 'Aucun résultat trouvé pour les critères spécifiés. Essayez avec le type "CONTIENT" ou vérifiez l\'orthographe.';
    }
    if (message.includes('Type de recherche invalide')) {
      return 'Type de recherche invalide. Utilisez: EXACTE, CONTIENT, COMMENCE_PAR, SE_TERMINE_PAR';
    }
    if (message.includes('Assuré non trouvé')) {
      return 'Assuré non trouvé avec ce numéro d\'affiliation';
    }
    
    if (message.includes('obligatoire')) {
      return message; 
    }
    if (message.includes('Format de date') && message.includes('invalide')) {
      return 'Format de date invalide. Utilisez le format DD/MM/YYYY ou YYYY-MM-DD';
    }
    
    if (message.includes('Erreur technique')) {
      return message; 
    }
    if (message.includes('Erreur lors de')) {
      return message; 
    }
    
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
    
    if (message.includes('Aucune édition disponible pour l\'état du sinistre')) {
      return 'Aucun document disponible pour cet état de sinistre. États supportés: REGLE, REJETE, EN_ATTENTE_FACTURE_DEFINITIVE, EN_ATTENTE_COMPLEMENT_INFORMATION, EN_ATTENTE_CONTRE_VISITE';
    }
    if (message.includes('Impossible de générer le document')) {
      return message;
    }
    if (message.includes('Le document généré est vide')) {
      return 'Le document généré est vide. Vérifiez les paramètres et réessayez.';
    }
    
    if (message.includes('invalid_grant')) {
      return 'Nom d\'utilisateur ou mot de passe incorrect';
    }
    if (message.includes('unauthorized_client')) {
      return 'Client non autorisé pour cette opération';
    }
    if (message.includes('Authentification échouée')) {
      return 'Échec de l\'authentification. Vérifiez vos identifiants.';
    }
    
    if (message.length > 0) {
      return message;
    }
    
    return 'Une erreur inattendue s\'est produite. La recherche supporte automatiquement les accents. Veuillez réessayer ou contacter le support technique.';
  }

 
  getServiceStats() {
    const currentToken = getAuthToken();
    return {
      hasToken: !!currentToken,
      tokenValid: currentToken ? isTokenValid(currentToken) : false,
      apiBaseUrl: API_BASE_URL,
      supportsAccents: true, 
      accentNormalization: 'automatic', 
      timestamp: new Date().toISOString()
    };
  }

 
  cleanup() {
    console.log('🧹 Nettoyage du SinistreService');
    this.token = null;
  }
}

export default new SinistreService();