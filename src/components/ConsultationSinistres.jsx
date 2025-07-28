import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  RefreshCw, 
  Eye, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  User,
  FileText,
  AlertCircle,
  Calendar,
  ClipboardList  
} from 'lucide-react';
import { getAuthToken, getUserInfoFromToken } from '../config/auth';
import SinistreService from '../services/sinistreService';
import './ConsultationSinistres.css';

const ConsultationSinistres = ({ sidebarCollapsed = false }) => {
  
  const [userInfo, setUserInfo] = useState(null);
  const [etatsSinistre, setEtatsSinistre] = useState([]);
  const [loadingEtats, setLoadingEtats] = useState(true);
  
  useEffect(() => {
    const currentToken = getAuthToken();
    if (currentToken) {
      SinistreService.setToken(currentToken);
      
      const userData = getUserInfoFromToken(currentToken);
      if (userData) {
        setUserInfo(userData);
        console.log('👤 Utilisateur connecté:', userData.name || userData.username);
      }
      
      console.log('🔑 Token centralisé chargé pour les sinistres');
    } else {
      console.warn('⚠️ Aucun token disponible pour l\'authentification');
    }
  }, []); 

  useEffect(() => {
    const loadEtatsSinistre = async () => {
      try {
        setLoadingEtats(true);
        const response = await SinistreService.getEtatsSinistre();
        setEtatsSinistre(response.data);
        console.log('✅ États de sinistre chargés:', response.data);
      } catch (error) {
        console.error('Erreur chargement états:', error);
      } finally {
        setLoadingEtats(false);
      }
    };

    loadEtatsSinistre();
  }, []);

  const [activeTab, setActiveTab] = useState('recherche-sinistre');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [results, setResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const [searchParams, setSearchParams] = useState({
    numSinistre: '',
    nom: '',
    prenom: '',
    natureMaladie: '',
    etatSinistre: '',
    typeRecherche: 'EXACTE'
  });

  const navigate = useNavigate();

  const formatEtatForDisplay = (etatLibelle) => {
    if (!etatLibelle || typeof etatLibelle !== 'string') return etatLibelle;

    const mappingEtats = {
      "Ouvert": "Ouvert",
      "En cours de chiffrage": "En cours de chiffrage", 
      "En attente de traitement": "En attente de traitement",
      "Rejeté": "Rejeté",
      "Réglé": "Réglé",
      "En attente de complément d'information": "En attente de complément d'information",
      "En attente de complément d'information interne": "En attente de complément d'information interne",
      "Sans suite": "Sans suite",
      "En attente de contrôle médical": "En attente de contrôle médical",
      "En attente de contre visite": "En attente de contre visite",
      "En attente d'établissement de décompte": "En attente d'établissement de décompte",
      "Établissement de décompte en cours": "Établissement de décompte en cours",
      "En attente facture définitive": "En attente facture définitive",
      "En attente de contrôle médical systématique": "En attente de contrôle médical systématique",
      "Annulé": "Annulé",
      "Accord réglé partiellement": "Accord réglé partiellement",
      "Règlement annulé": "Règlement annulé",
      "En attente MAJ RIB Adhérent": "En attente MAJ RIB Adhérent",
      "En attente MAJ RIB Société": "En attente MAJ RIB Société",
      "En attente MAJ Carte": "En attente MAJ Carte",
      "Migré (à réouvrir)": "Migré (à réouvrir)"
    };

    const etatFormate = mappingEtats[etatLibelle];
    if (etatFormate) {
      console.log(`🔄 Format état: "${etatLibelle}" → "${etatFormate}"`);
      return etatFormate;
    }

    console.log(`⚠️ État non mappé: "${etatLibelle}"`);
    return etatLibelle;
  };

  const handleApiError = (error, operation = 'opération') => {
    console.error(`❌ Erreur lors de ${operation}:`, error);
    
    const message = error?.message || '';
    
    if (message.includes('complement') || message.includes('complément')) {
      setError('Erreur de recherche avec "complément". La recherche fonctionne automatiquement avec ou sans accent.');
      return;
    }
    
    if (message.includes('accent') || message.includes('caractère spécial')) {
      setError('Erreur de caractères spéciaux. La recherche supporte automatiquement les accents.');
      return;
    }
    
    if (error.response?.status === 401) {
      setError('Session expirée. Veuillez vous reconnecter.');
      return;
    }
    
    const errorMsg = SinistreService.handleAPIError(error);
    setError(errorMsg);
  };

  const validateSearchInput = (input, fieldName) => {
    if (!input || typeof input !== 'string') return false;
    
    const trimmedInput = input.trim();
    if (trimmedInput.length === 0) return false;
    
    if (fieldName.includes('état') || fieldName.includes('sinistre')) {
      const etatSafeChars = /[<>";&\\]/; 
      if (etatSafeChars.test(trimmedInput)) {
        setError(`Caractères non autorisés dans ${fieldName}`);
        return false;
      }
      return true;  
    }
    
    const dangerousChars = /[<>";&\\]/;
    if (dangerousChars.test(trimmedInput)) {
      setError(`Caractères non autorisés dans ${fieldName}`);
      return false;
    }
    
    return true;
  };

  const rechercherParNumero = async () => {
    if (!validateSearchInput(searchParams.numSinistre, 'le numéro de sinistre')) {
      if (!searchParams.numSinistre.trim()) {
        setError('Le numéro de sinistre est obligatoire');
      }
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      console.log('🔍 Recherche par numéro:', searchParams.numSinistre);
      
      const response = await SinistreService.rechercherParNumero(
        searchParams.numSinistre.trim(), 
        searchParams.typeRecherche
      );
      
      const resultData = response.data || [];
      
      setResults(resultData);
      setTotalResults(resultData.length);
      setTotalPages(Math.ceil(resultData.length / 10));
      setCurrentPage(1);
      
      const message = resultData.length === 1 
        ? 'Sinistre trouvé avec succès' 
        : `${resultData.length} sinistre(s) trouvé(s)`;
      setSuccessMessage(response.message || message);
      
      console.log('✅ Recherche terminée:', resultData.length, 'résultat(s)');
    } catch (error) {
      handleApiError(error, 'la recherche par numéro');
      setResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  const rechercherParNomPrenom = async () => {
    const nomValid = validateSearchInput(searchParams.nom, 'le nom');
    const prenomValid = validateSearchInput(searchParams.prenom, 'le prénom');
    
    if (!nomValid && !prenomValid) {
      setError('Au moins le nom ou le prénom doit être renseigné');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      console.log('🔍 Recherche par nom/prénom:', {
        nom: searchParams.nom.trim(),
        prenom: searchParams.prenom.trim()
      });
      
      const response = await SinistreService.rechercherParNomPrenom(
        searchParams.nom.trim(), 
        searchParams.prenom.trim(),
        searchParams.typeRecherche
      );
      
      const resultData = response.data || [];
      setResults(resultData);
      setTotalResults(resultData.length);
      setTotalPages(Math.ceil(resultData.length / 10));
      setCurrentPage(1);
      setSuccessMessage(response.message || `${resultData.length} sinistre(s) trouvé(s)`);
      
      console.log('✅ Recherche terminée:', resultData.length, 'résultat(s)');
    } catch (error) {
      handleApiError(error, 'la recherche par nom/prénom');
      setResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  const rechercherParNatureMaladie = async () => {
    if (!validateSearchInput(searchParams.natureMaladie, 'la nature de maladie')) {
      if (!searchParams.natureMaladie.trim()) {
        setError('La nature de maladie est obligatoire');
      }
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      console.log('🔍 Recherche par nature de maladie:', searchParams.natureMaladie);
      
      const response = await SinistreService.rechercherParNatureMaladie(
        searchParams.natureMaladie.trim(),
        searchParams.typeRecherche,
        50 
      );
      
      const resultData = response.data || [];
      setResults(resultData);
      setTotalResults(resultData.length);
      setTotalPages(Math.ceil(resultData.length / 10));
      setCurrentPage(1);
      setSuccessMessage(response.message || `${resultData.length} sinistre(s) trouvé(s)`);
      
      console.log('✅ Recherche terminée:', resultData.length, 'résultat(s)');
    } catch (error) {
      handleApiError(error, 'la recherche par nature de maladie');
      setResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  const rechercherParEtat = async () => {
    const etatTrimmed = searchParams.etatSinistre.trim();
    
    if (!etatTrimmed) {
      setError('L\'état du sinistre est obligatoire');
      return;
    }

    const etatSafeChars = /[<>";&\\]/; 
    if (etatSafeChars.test(etatTrimmed)) {
      setError('Caractères non autorisés dans l\'état du sinistre');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      console.log('🔍 rechercherParEtat - DÉBUT DEBUG');
      console.log('🔍 État brut depuis searchParams:', `"${searchParams.etatSinistre}"`);
      console.log('🔍 État après trim:', `"${etatTrimmed}"`);
      console.log('🔍 Longueur après trim:', etatTrimmed.length);
      console.log('🔍 Caractères détaillés:', [...etatTrimmed].map(c => `${c}(${c.charCodeAt(0)})`));
      console.log('🔍 Type de recherche:', searchParams.typeRecherche);
      console.log('🔍 rechercherParEtat - FIN DEBUG');
      
      const response = await SinistreService.rechercherParEtat(
        etatTrimmed,
        searchParams.typeRecherche
      );
      
      const resultData = response.data || [];
      setResults(resultData);
      setTotalResults(resultData.length);
      setTotalPages(Math.ceil(resultData.length / 10));
      setCurrentPage(1);
      setSuccessMessage(response.message || `${resultData.length} sinistre(s) trouvé(s)`);
      
      console.log('✅ Recherche par état terminée:', resultData.length, 'résultat(s)');
    } catch (error) {
      console.error('❌ Erreur dans rechercherParEtat:', error);
      handleApiError(error, 'la recherche par état');
      setResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  const rechercherCombine = async () => {
    const { numSinistre, nom, prenom, natureMaladie, etatSinistre } = searchParams;
    
    const hasValidCriteria = [
      numSinistre.trim(),
      nom.trim(),
      prenom.trim(),
      natureMaladie.trim(),
      etatSinistre.trim()
    ].some(criteria => criteria.length > 0);
    
    if (!hasValidCriteria) {
      setError('Au moins un critère de recherche doit être renseigné');
      return;
    }

    const fieldsToValidate = [
      { value: numSinistre, name: 'le numéro de sinistre' },
      { value: nom, name: 'le nom' },
      { value: prenom, name: 'le prénom' },
      { value: natureMaladie, name: 'la nature de maladie' }
    ];

    for (const field of fieldsToValidate) {
      if (field.value.trim() && !validateSearchInput(field.value, field.name)) {
        return; 
      }
    }

    if (etatSinistre.trim()) {
      const etatTrimmed = etatSinistre.trim();
      const etatSafeChars = /[<>";&\\]/; 
      if (etatSafeChars.test(etatTrimmed)) {
        setError('Caractères non autorisés dans l\'état du sinistre');
        return;
      }
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const searchCriteria = {
        numSinistre: numSinistre.trim() || null,
        nom: nom.trim() || null, 
        prenom: prenom.trim() || null,
        natureMaladie: natureMaladie.trim() || null,
        etatSinistre: etatSinistre.trim() || null
      };
      
      console.log('🔍 Recherche combinée:', searchCriteria);
      
      if (searchCriteria.etatSinistre) {
        console.log('🔍 rechercherCombine - État sélectionné:', `"${searchCriteria.etatSinistre}"`);
        console.log('🔍 rechercherCombine - Longueur état:', searchCriteria.etatSinistre.length);
        console.log('🔍 rechercherCombine - Caractères état:', [...searchCriteria.etatSinistre].map(c => `${c}(${c.charCodeAt(0)})`));
      }
      
      const response = await SinistreService.rechercherCombine(
        searchCriteria,
        searchParams.typeRecherche,
        50 
      );
      
      const resultData = response.data || [];
      setResults(resultData);
      setTotalResults(resultData.length);
      setTotalPages(Math.ceil(resultData.length / 10));
      setCurrentPage(1);
      setSuccessMessage(response.message || `${resultData.length} sinistre(s) trouvé(s)`);
      
      console.log('✅ Recherche terminée:', resultData.length, 'résultat(s)');
    } catch (error) {
      handleApiError(error, 'la recherche combinée');
      setResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setError('');
    setSuccessMessage('');
    
    const currentToken = getAuthToken();
    if (!currentToken) {
      setError('Session expirée. Veuillez vous reconnecter.');
      return;
    }
    
    console.log(`🔍 Démarrage de la recherche - Onglet: ${activeTab}`);
    
    switch (activeTab) {
      case 'recherche-sinistre':
        rechercherParNumero();
        break;
      case 'etat-sinistre':
        rechercherParEtat();
        break;
      case 'assure-nom-prenom':
        rechercherParNomPrenom();
        break;
      case 'nature-maladie':
        rechercherParNatureMaladie();
        break;
      case 'recherche-combinee':
        rechercherCombine();
        break;
      default:
        setError('Type de recherche non reconnu');
        break;
    }
  };

  const handleReset = () => {
    console.log('🔄 Réinitialisation des critères de recherche');
    
    setSearchParams({
      numSinistre: '',
      nom: '',
      prenom: '',
      natureMaladie: '',
      etatSinistre: '',
      typeRecherche: 'EXACTE'
    });
    setResults([]);
    setError('');
    setSuccessMessage('');
    setCurrentPage(1);
    setTotalPages(1);
    setTotalResults(0);
  };

  const handleTabChange = (tabId) => {
    console.log(`📑 Changement d'onglet: ${tabId}`);
    setActiveTab(tabId);
    handleReset();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      if (dateStr.includes('/')) return dateStr;
      if (dateStr.includes('-')) {
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
      }
      return dateStr;
    } catch (error) {
      console.warn('⚠️ Erreur formatage date:', dateStr, error);
      return dateStr;
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      console.log(`📄 Changement de page: ${currentPage} → ${page}`);
      setCurrentPage(page);
    }
  };

  const handleViewDetails = (sinistre) => {
    if (!sinistre?.numSinistre) {
      setError('Impossible d\'accéder aux détails : numéro de sinistre manquant');
      return;
    }
    
    console.log('🔍 Navigation vers détails du sinistre:', sinistre.numSinistre);
    navigate(`/consultation/sinistres/${sinistre.numSinistre}/details`, {
      state: { sinistre }
    });
  };

  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        setError('');
        setSuccessMessage('');
      }, 5000); 
      
      return () => clearTimeout(timer);
    }
  }, [error, successMessage]);

  const tabs = [
    { 
      id: 'recherche-sinistre', 
      label: 'Recherche Sinistre', 
      icon: Search
    },
    { 
      id: 'etat-sinistre', 
      label: 'État Sinistre', 
      icon: FileText
    },
    { 
      id: 'assure-nom-prenom', 
      label: 'Assuré (Nom/Prénom)', 
      icon: User
    },
    { 
      id: 'nature-maladie', 
      label: 'Nature Maladie', 
      icon: AlertCircle
    },
    { 
      id: 'recherche-combinee', 
      label: 'Recherche Combinée', 
      icon: Calendar
    }
  ];

  const getCurrentPageResults = () => {
    const startIndex = (currentPage - 1) * 10;
    const endIndex = startIndex + 10;
    return results.slice(startIndex, endIndex);
  };

  const renderSearchForm = () => {
    switch (activeTab) {
      case 'recherche-sinistre':
        return (
          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label className="form-label required">
                Numéro de Sinistre
              </label>
              <input
                type="text"
                value={searchParams.numSinistre}
                onChange={(e) => setSearchParams({...searchParams, numSinistre: e.target.value})}
                placeholder="Saisir le numéro complet (ex: SIN202400001)"
                className="form-input"
                maxLength={50}
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                Type de correspondance
              </label>
              <div className="select-wrapper">
                <select
                  value={searchParams.typeRecherche}
                  onChange={(e) => setSearchParams({...searchParams, typeRecherche: e.target.value})}
                  className="form-select"
                >
                  <option value="EXACTE">EXACTE</option>
                  <option value="CONTIENT">CONTIENT</option>
                  <option value="COMMENCE_PAR">COMMENCE PAR</option>
                  <option value="SE_TERMINE_PAR">SE TERMINE PAR</option>
                </select>
                <ChevronDown className="select-icon" />
              </div>
            </div>
          </div>
        );

      case 'etat-sinistre':
        return (
          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label className="form-label required">
                État du sinistre
              </label>
              <div className="select-wrapper">
                <select
                  value={searchParams.etatSinistre}
                  onChange={(e) => {
                    const selectedValue = e.target.value;
                    console.log('🔍 Select État - Valeur sélectionnée:', `"${selectedValue}"`);
                    console.log('🔍 Select État - Longueur:', selectedValue.length);
                    console.log('🔍 Select État - Caractères détaillés:', [...selectedValue].map(c => `${c}(${c.charCodeAt(0)})`));
                    
                    setSearchParams({...searchParams, etatSinistre: selectedValue});
                    
                    console.log('✅ État stocké dans searchParams:', selectedValue);
                  }}
                  className="form-select"
                  disabled={loadingEtats}
                >
                  <option value="">-- Sélectionner un état --</option>
                  {etatsSinistre.map(etat => (
                    <option key={etat.code} value={etat.libelle}>
                      {formatEtatForDisplay(etat.libelle)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="select-icon" />
              </div>
              {loadingEtats && (
                <span className="help-text">Chargement des états...</span>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">
                Type de correspondance
              </label>
              <div className="select-wrapper">
                <select
                  value={searchParams.typeRecherche}
                  onChange={(e) => setSearchParams({...searchParams, typeRecherche: e.target.value})}
                  className="form-select"
                >
                  <option value="EXACTE">EXACTE</option>
                  <option value="CONTIENT">CONTIENT</option>
                  <option value="COMMENCE_PAR">COMMENCE PAR</option>
                  <option value="SE_TERMINE_PAR">SE TERMINE PAR</option>
                </select>
                <ChevronDown className="select-icon" />
              </div>
            </div>
          </div>
        );

      case 'assure-nom-prenom':
        return (
          <>
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">
                  Nom de l'assuré
                </label>
                <input
                  type="text"
                  value={searchParams.nom}
                  onChange={(e) => setSearchParams({...searchParams, nom: e.target.value})}
                  placeholder="Nom de famille"
                  className="form-input"
                  maxLength={100}
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Prénom de l'assuré
                </label>
                <input
                  type="text"
                  value={searchParams.prenom}
                  onChange={(e) => setSearchParams({...searchParams, prenom: e.target.value})}
                  placeholder="Prénom"
                  className="form-input"
                  maxLength={100}
                />
              </div>
            </div>
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">
                  Type de correspondance
                </label>
                <div className="select-wrapper">
                  <select
                    value={searchParams.typeRecherche}
                    onChange={(e) => setSearchParams({...searchParams, typeRecherche: e.target.value})}
                    className="form-select"
                  >
                    <option value="EXACTE">EXACTE</option>
                    <option value="CONTIENT">CONTIENT</option>
                    <option value="COMMENCE_PAR">COMMENCE PAR</option>
                    <option value="SE_TERMINE_PAR">SE TERMINE PAR</option>
                  </select>
                  <ChevronDown className="select-icon" />
                </div>
              </div>
              <div className="form-group">
              </div>
            </div>
            <div className="form-info">
              <strong>*</strong> Au moins le nom ou le prénom doit être renseigné
            </div>
          </>
        );

      case 'nature-maladie':
        return (
          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label className="form-label required">
                Nature de maladie
              </label>
              <input
                type="text"
                value={searchParams.natureMaladie}
                onChange={(e) => setSearchParams({...searchParams, natureMaladie: e.target.value})}
                placeholder="Ex: Grippe, Soins dentaires, Consultation médicale..."
                className="form-input"
                maxLength={200}
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                Type de correspondance
              </label>
              <div className="select-wrapper">
                <select
                  value={searchParams.typeRecherche}
                  onChange={(e) => setSearchParams({...searchParams, typeRecherche: e.target.value})}
                  className="form-select"
                >
                  <option value="EXACTE">EXACTE</option>
                  <option value="CONTIENT">CONTIENT</option>
                  <option value="COMMENCE_PAR">COMMENCE PAR</option>
                  <option value="SE_TERMINE_PAR">SE TERMINE PAR</option>
                </select>
                <ChevronDown className="select-icon" />
              </div>
            </div>
          </div>
        );

      case 'recherche-combinee':
        return (
          <>
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">
                  Numéro de Sinistre
                </label>
                <input
                  type="text"
                  value={searchParams.numSinistre}
                  onChange={(e) => setSearchParams({...searchParams, numSinistre: e.target.value})}
                  placeholder="Numéro de sinistre"
                  className="form-input"
                  maxLength={50}
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Nom de l'assuré
                </label>
                <input
                  type="text"
                  value={searchParams.nom}
                  onChange={(e) => setSearchParams({...searchParams, nom: e.target.value})}
                  placeholder="Nom de famille"
                  className="form-input"
                  maxLength={100}
                />
              </div>
            </div>
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">
                  Prénom de l'assuré
                </label>
                <input
                  type="text"
                  value={searchParams.prenom}
                  onChange={(e) => setSearchParams({...searchParams, prenom: e.target.value})}
                  placeholder="Prénom"
                  className="form-input"
                  maxLength={100}
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Nature de maladie
                </label>
                <input
                  type="text"
                  value={searchParams.natureMaladie}
                  onChange={(e) => setSearchParams({...searchParams, natureMaladie: e.target.value})}
                  placeholder="Type de maladie"
                  className="form-input"
                  maxLength={200}
                />
              </div>
            </div>
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">
                  État du sinistre
                </label>
                <div className="select-wrapper">
                  <select
                    value={searchParams.etatSinistre}
                    onChange={(e) => {
                      const selectedValue = e.target.value;
                      console.log('🔍 Select Combiné - Valeur sélectionnée:', `"${selectedValue}"`);
                      console.log('🔍 Select Combiné - Longueur:', selectedValue.length);
                      console.log('🔍 Select Combiné - Caractères détaillés:', [...selectedValue].map(c => `${c}(${c.charCodeAt(0)})`));
                      
                      setSearchParams({...searchParams, etatSinistre: selectedValue});
                      
                      console.log('✅ État stocké dans searchParams (combiné):', selectedValue);
                    }}
                    className="form-select"
                    disabled={loadingEtats}
                  >
                    <option value="">-- Sélectionner un état --</option>
                    {etatsSinistre.map(etat => (
                      <option key={etat.code} value={etat.libelle}>
                        {formatEtatForDisplay(etat.libelle)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="select-icon" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">
                  Type de recherche
                </label>
                <div className="select-wrapper">
                  <select
                    value={searchParams.typeRecherche}
                    onChange={(e) => setSearchParams({...searchParams, typeRecherche: e.target.value})}
                    className="form-select"
                  >
                    <option value="EXACTE">EXACTE</option>
                    <option value="CONTIENT">CONTIENT</option>
                    <option value="COMMENCE_PAR">COMMENCE PAR</option>
                    <option value="SE_TERMINE_PAR">SE TERMINE PAR</option>
                  </select>
                  <ChevronDown className="select-icon" />
                </div>
              </div>
            </div>
            <div className="form-info">
              <strong>Info :</strong> Au moins un critère de recherche doit être renseigné pour effectuer une recherche combinée.
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`consultation-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="page-header">
        <div className="page-header-main">
          <h1 className="page-title">Consultation des Sinistres</h1>
          {userInfo && (
            <div className="user-info">
              <span className="user-welcome">
                Connecté en tant que <strong>{userInfo.name || userInfo.username}</strong>
              </span>
            </div>
          )}
        </div>
        <nav className="breadcrumb">
          <span>Sinistres</span>
          <span className="separator">›</span>
          <span className="current">Consultation</span>
        </nav>
      </div>

      <div className="tabs-container">
        <div className="tabs-wrapper">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`tab-button ${isActive ? 'active' : ''}`}
                aria-selected={isActive}
                role="tab"
              >
                <IconComponent className="tab-icon" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="form-container">
        {error && (
          <div className="alert alert-error" role="alert">
            <AlertCircle className="alert-icon" />
            {error}
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success" role="alert">
            <Search className="alert-icon" />
            {successMessage}
          </div>
        )}

        <h3 className="form-title">
          {activeTab === 'recherche-sinistre' && 'Recherche par Numéro de Sinistre'}
          {activeTab === 'etat-sinistre' && 'Recherche par État du Sinistre'}
          {activeTab === 'assure-nom-prenom' && 'Recherche par Nom et Prénom de l\'Assuré'}
          {activeTab === 'nature-maladie' && 'Recherche par Nature de Maladie'}
          {activeTab === 'recherche-combinee' && 'Recherche Combinée'}
        </h3>

        <div className="form-content">
          {renderSearchForm()}
        </div>

        <div className="form-actions">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="btn btn-primary"
            aria-label="Lancer la recherche"
          >
            {loading ? (
              <RefreshCw className="btn-icon animate-spin" />
            ) : (
              <Search className="btn-icon" />
            )}
            {loading ? 'Recherche...' : 'Rechercher'}
          </button>
          
          <button
            onClick={handleReset}
            disabled={loading}
            className="btn btn-secondary"
            aria-label="Effacer les critères de recherche"
          >
            <RefreshCw className="btn-icon" />
            Effacer
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="results-container">
          <div className="results-header">
            <h4 className="results-title">
              Résultats de la recherche ({totalResults} trouvé{totalResults > 1 ? 's' : ''})
            </h4>
            {userInfo && (
              <div className="results-info">
                <span className="results-timestamp">
                  Recherche effectuée le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}
                </span>
              </div>
            )}
          </div>
          
          <div className="table-wrapper">
            <table className="results-table" role="table" aria-label="Résultats des sinistres">
              <thead>
                <tr role="row">
                  <th scope="col">N° Sinistre</th>
                  <th scope="col">Assuré</th>
                  <th scope="col">Date Survenance</th>
                  <th scope="col">État</th>
                  <th scope="col">Nature Maladie</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {getCurrentPageResults().map((sinistre, index) => (
                  <tr key={sinistre.numSinistre || `sinistre-${index}`} role="row">
                    <td>
                      <div className="cell-primary">
                        {sinistre.numSinistreReduit || sinistre.numSinistre || 'N/A'}
                      </div>
                      {sinistre.numPolice && (
                        <div className="cell-secondary">
                          Police: {sinistre.numPolice}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="cell-primary">
                        {sinistre.nomCompletAssure || 'N/A'}
                      </div>
                      {sinistre.numAffiliation && (
                        <div className="cell-secondary">
                          Affiliation: {sinistre.numAffiliation}
                        </div>
                      )}
                    </td>
                    <td>
                      <time dateTime={sinistre.dateSurv}>
                        {formatDate(sinistre.dateSurv)}
                      </time>
                    </td>
                    <td>
                      <span className={`status-badge ${
                        sinistre.etatSinistreLibelle === 'OUVERT' 
                          ? 'status-open' 
                          : sinistre.etatSinistreLibelle === 'CLÔTURÉ' || sinistre.etatSinistreLibelle === 'CLOTURE'
                          ? 'status-closed'
                          : sinistre.etatSinistreLibelle === 'EN COURS'
                          ? 'status-progress'
                          : 'status-default'
                      }`}>
                        {formatEtatForDisplay(sinistre.etatSinistreLibelle || 'N/A')}
                      </span>
                    </td>
                    <td>
                      <div className="cell-truncate" title={sinistre.natuMala || sinistre.refSpecialiteMaladieLibelle || 'N/A'}>
                        {sinistre.natuMala || sinistre.refSpecialiteMaladieLibelle || 'N/A'}
                      </div>
                    </td>
                    <td>
                      <button 
                        onClick={() => handleViewDetails(sinistre)}
                        className="btn btn-small btn-outline"
                        aria-label={`Voir les détails du sinistre ${sinistre.numSinistre || 'N/A'}`}
                        disabled={!sinistre.numSinistre}
                      >
                        <Eye className="btn-icon" />
                        Détails
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Affichage de <span className="pagination-highlight">{((currentPage - 1) * 10) + 1}</span> à{' '}
                <span className="pagination-highlight">{Math.min(currentPage * 10, totalResults)}</span> sur{' '}
                <span className="pagination-highlight">{totalResults}</span> résultat{totalResults > 1 ? 's' : ''}
              </div>
              
              <div className="pagination-controls" role="navigation" aria-label="Pagination">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                  aria-label="Page précédente"
                >
                  <ChevronLeft className="pagination-icon" />
                  Précédent
                </button>
                
                {(() => {
                  const maxVisiblePages = 5;
                  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                  
                  if (endPage - startPage + 1 < maxVisiblePages) {
                    startPage = Math.max(1, endPage - maxVisiblePages + 1);
                  }
                  
                  const pages = [];
                  
                  if (startPage > 1) {
                    pages.push(
                      <button
                        key={1}
                        onClick={() => handlePageChange(1)}
                        className="pagination-btn"
                        aria-label="Aller à la page 1"
                      >
                        1
                      </button>
                    );
                    
                    if (startPage > 2) {
                      pages.push(
                        <span key="start-ellipsis" className="pagination-ellipsis">
                          ...
                        </span>
                      );
                    }
                  }
                  
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => handlePageChange(i)}
                        className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
                        aria-label={`${currentPage === i ? 'Page actuelle, ' : ''}Page ${i}`}
                        aria-current={currentPage === i ? 'page' : undefined}
                      >
                        {i}
                      </button>
                    );
                  }
                  
                  if (endPage < totalPages) {
                    if (endPage < totalPages - 1) {
                      pages.push(
                        <span key="end-ellipsis" className="pagination-ellipsis">
                          ...
                        </span>
                      );
                    }
                    
                    pages.push(
                      <button
                        key={totalPages}
                        onClick={() => handlePageChange(totalPages)}
                        className="pagination-btn"
                        aria-label={`Aller à la page ${totalPages}`}
                      >
                        {totalPages}
                      </button>
                    );
                  }
                  
                  return pages;
                })()}
                
                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                  aria-label="Page suivante"
                >
                  Suivant
                  <ChevronRight className="pagination-icon" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {!loading && results.length === 0 && !error && (totalResults === 0) && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Search />
          </div>
          <div className="empty-state-content">
            <h3>Aucun résultat trouvé</h3>
            <p>
              {activeTab === 'recherche-sinistre' && 'Aucun sinistre ne correspond au numéro recherché.'}
              {activeTab === 'etat-sinistre' && 'Aucun sinistre ne correspond à l\'état recherché.'}
              {activeTab === 'assure-nom-prenom' && 'Aucun sinistre ne correspond au nom/prénom recherché.'}
              {activeTab === 'nature-maladie' && 'Aucune sinistre ne correspond à la nature de maladie recherchée.'}
              {activeTab === 'recherche-combinee' && 'Aucun sinistre ne correspond aux critères de recherche combinés.'}
            </p>
            <div className="empty-state-suggestions">
              <h4>Suggestions :</h4>
              <ul>
                <li>Vérifiez l'orthographe des termes de recherche</li>
                <li>Essayez une recherche moins spécifique</li>
                <li>Utilisez le type de correspondance "CONTIENT" pour élargir la recherche</li>
                {activeTab !== 'recherche-combinee' && (
                  <li>Essayez la recherche combinée pour plus de flexibilité</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="loading-state" role="status" aria-live="polite">
          <div className="loading-spinner-container">
            <RefreshCw className="loading-spinner" />
          </div>
          <div className="loading-content">
            <h3>Recherche en cours...</h3>
            <p>
              {activeTab === 'recherche-sinistre' && 'Recherche du sinistre par numéro...'}
              {activeTab === 'etat-sinistre' && 'Recherche des sinistres par état...'}
              {activeTab === 'assure-nom-prenom' && 'Recherche des sinistres par nom/prénom...'}
              {activeTab === 'nature-maladie' && 'Recherche des sinistres par nature de maladie...'}
              {activeTab === 'recherche-combinee' && 'Recherche combinée en cours...'}
            </p>
            <div className="loading-progress">
              <div className="loading-bar"></div>
            </div>
          </div>
        </div>
      )}

      {!loading && results.length === 0 && !error && (
        <div className="help-section">
          <div className="help-content">
            <h4>
              <ClipboardList className="help-icon" />
              Guide de recherche
            </h4>
            <div className="help-grid">
              <div className="help-item">
                <strong>Recherche exacte :</strong>
                <p>Le terme doit correspondre exactement</p>
              </div>
              <div className="help-item">
                <strong>Contient :</strong>
                <p>Le terme peut apparaître n'importe où dans le champ</p>
              </div>
              <div className="help-item">
                <strong>Commence par :</strong>
                <p>Le champ doit commencer par le terme recherché</p>
              </div>
              <div className="help-item">
                <strong>Se termine par :</strong>
                <p>Le champ doit se terminer par le terme recherché</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultationSinistres;