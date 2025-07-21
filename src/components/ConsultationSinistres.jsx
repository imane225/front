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
import SinistreService from '../services/sinistreService';
import './ConsultationSinistres.css';

const ConsultationSinistres = ({ sidebarCollapsed = false }) => {
  
  useEffect(() => {
    const token = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJUUll0aUpNY2c1aUF1UV9YUG9tZ3ZnWVBBeTc0dDJoalBUa09pUDY2X053In0.eyJleHAiOjE3NTI4NTA3NDgsImlhdCI6MTc1Mjg1MDQ0OCwianRpIjoiOGIxZmQyMTctMGNmOC00ODlmLWJhNDQtZmYxMDViOWEyODQ1IiwiaXNzIjoiaHR0cHM6Ly9hY2Nlc3MtZHkucm1hYXNzdXJhbmNlLmNvbS9hdXRoL3JlYWxtcy9ybWEtYWQiLCJhdWQiOlsicmVhbG0tbWFuYWdlbWVudCIsImFjY291bnQiXSwic3ViIjoiNDI2NzdmOTctODdkNy00NTVlLWI1ODktMDEzOGZjZDQyZWFjIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoibm92YXMiLCJzZXNzaW9uX3N0YXRlIjoiOTBkMjkzMGYtMWRlNy00YzBmLTlkOGItMjY2MjY4ZmQyNzAxIiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyIqIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJkZWZhdWx0LXJvbGVzLXJtYS1hZCIsIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJyZWFsbS1tYW5hZ2VtZW50Ijp7InJvbGVzIjpbInZpZXctdXNlcnMiLCJxdWVyeS1ncm91cHMiLCJxdWVyeS11c2VycyJdfSwiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJlbWFpbCBwcm9maWxlIiwic2lkIjoiOTBkMjkzMGYtMWRlNy00YzBmLTlkOGItMjY2MjY4ZmQyNzAxIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJuYW1lIjoiSW1hbmUgRUwgQUxKSSIsInByZWZlcnJlZF91c2VybmFtZSI6InMwMDAxNDk0IiwiZ2l2ZW5fbmFtZSI6IkltYW5lIiwiZmFtaWx5X25hbWUiOiJFTCBBTEpJIiwiZW1haWwiOiJpLmVsYWxqaUBybWFhc3N1cmFuY2UuY29tIn0.hcZgRbFRVpedynQqlii1ZJUrcEokdmAk3TYohss_m00J6xsdnSLZP7V8rtjXU6nRmdK7RhsgbtWPWPh3eGn2HEH2GWgdTd91MPtY2eCQpn7A0vA5EgX7qR2N2KUXUZFCQdReA1nvdNMObApsUYbVy7fMLAdecFJOyIcYPWuSHtPx5OiD9cW_tczxybxd5IIhTCJwEQqU4zUvMloEUdQ2BiVL60rno88y2gJzX7ewVvsk4RxhNgXtNkCWTbgS2fFAYxGdyzASRb3o5I82NOKJtQsXFBLOYcMHipiw02sdE2B8MzH5pd-J9GUGBtZxO3QwndH4rznm83_dntMzim_nGg'; 
    SinistreService.setToken(token);
    console.log('🔑 Token défini pour les API calls');
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

  const rechercherParNumero = async () => {
    if (!searchParams.numSinistre.trim()) {
      setError('Le numéro de sinistre est obligatoire');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await SinistreService.rechercherParNumero(
        searchParams.numSinistre, 
        searchParams.typeRecherche
      );
      
      const resultData = response.data || [];
      
      setResults(resultData);
      setTotalResults(resultData.length);
      setTotalPages(Math.ceil(resultData.length / 10));
      setCurrentPage(1);
      setSuccessMessage(response.message || 'Sinistre trouvé avec succès');
    } catch (error) {
      const errorMsg = SinistreService.handleAPIError(error);
      setError(errorMsg);
      setResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  const rechercherParNomPrenom = async () => {
    if (!searchParams.nom.trim() && !searchParams.prenom.trim()) {
      setError('Au moins le nom ou le prénom doit être renseigné');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await SinistreService.rechercherParNomPrenom(
        searchParams.nom, 
        searchParams.prenom,
        searchParams.typeRecherche
      );
      
      const resultData = response.data || [];
      setResults(resultData);
      setTotalResults(resultData.length);
      setTotalPages(Math.ceil(resultData.length / 10));
      setCurrentPage(1);
      setSuccessMessage(response.message || `${resultData.length} sinistre(s) trouvé(s)`);
    } catch (error) {
      const errorMsg = SinistreService.handleAPIError(error);
      setError(errorMsg);
      setResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  const rechercherParNatureMaladie = async () => {
    if (!searchParams.natureMaladie.trim()) {
      setError('La nature de maladie est obligatoire');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await SinistreService.rechercherParNatureMaladie(
        searchParams.natureMaladie,
        searchParams.typeRecherche,
        50
      );
      
      const resultData = response.data || [];
      setResults(resultData);
      setTotalResults(resultData.length);
      setTotalPages(Math.ceil(resultData.length / 10));
      setCurrentPage(1);
      setSuccessMessage(response.message || `${resultData.length} sinistre(s) trouvé(s)`);
    } catch (error) {
      const errorMsg = SinistreService.handleAPIError(error);
      setError(errorMsg);
      setResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  const rechercherParEtat = async () => {
    if (!searchParams.etatSinistre.trim()) {
      setError('L\'état du sinistre est obligatoire');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await SinistreService.rechercherParEtat(
        searchParams.etatSinistre,
        searchParams.typeRecherche
      );
      
      const resultData = response.data || [];
      setResults(resultData);
      setTotalResults(resultData.length);
      setTotalPages(Math.ceil(resultData.length / 10));
      setCurrentPage(1);
      setSuccessMessage(response.message || `${resultData.length} sinistre(s) trouvé(s)`);
    } catch (error) {
      const errorMsg = SinistreService.handleAPIError(error);
      setError(errorMsg);
      setResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  const rechercherCombine = async () => {
    const { numSinistre, nom, prenom, natureMaladie, etatSinistre } = searchParams;
    
    if (!numSinistre.trim() && !nom.trim() && !prenom.trim() && 
        !natureMaladie.trim() && !etatSinistre.trim()) {
      setError('Au moins un critère de recherche doit être renseigné');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await SinistreService.rechercherCombine(
        {
          numSinistre: numSinistre.trim() || null,
          nom: nom.trim() || null, 
          prenom: prenom.trim() || null,
          natureMaladie: natureMaladie.trim() || null,
          etatSinistre: etatSinistre.trim() || null
        },
        searchParams.typeRecherche,
        50
      );
      
      const resultData = response.data || [];
      setResults(resultData);
      setTotalResults(resultData.length);
      setTotalPages(Math.ceil(resultData.length / 10));
      setCurrentPage(1);
      setSuccessMessage(response.message || `${resultData.length} sinistre(s) trouvé(s)`);
    } catch (error) {
      const errorMsg = SinistreService.handleAPIError(error);
      setError(errorMsg);
      setResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setError('');
    setSuccessMessage('');
    
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
        break;
    }
  };

  const handleReset = () => {
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
    } catch {
      return dateStr;
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleViewDetails = (sinistre) => {
    console.log('🔍 Navigation vers détails du sinistre:', sinistre.numSinistre);
    navigate(`/consultation/sinistres/${sinistre.numSinistre}/details`, {
      state: { sinistre }
    });
  };

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
              <input
                type="text"
                value={searchParams.etatSinistre}
                onChange={(e) => setSearchParams({...searchParams, etatSinistre: e.target.value})}
                placeholder="Ex: Ouvert, Clôturé, En cours..."
                className="form-input"
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
                />
              </div>
            </div>
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">
                  État du sinistre
                </label>
                <input
                  type="text"
                  value={searchParams.etatSinistre}
                  onChange={(e) => setSearchParams({...searchParams, etatSinistre: e.target.value})}
                  placeholder="État"
                  className="form-input"
                />
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
        <h1 className="page-title">Consultation des Sinistres</h1>
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
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success">
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
          >
            {loading ? (
              <RefreshCw className="btn-icon animate-spin" />
            ) : (
              <Search className="btn-icon" />
            )}
            Rechercher
          </button>
          
          <button
            onClick={handleReset}
            className="btn btn-secondary"
          >
            <RefreshCw className="btn-icon" />
            Effacer
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="results-container">
          <div className="table-wrapper">
            <table className="results-table">
              <thead>
                <tr>
                  <th>N° Sinistre</th>
                  <th>Assuré</th>
                  <th>Date Survenance</th>
                  <th>État</th>
                  <th>Nature Maladie</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getCurrentPageResults().map((sinistre, index) => (
                  <tr key={sinistre.numSinistre || index}>
                    <td>
                      <div className="cell-primary">
                        {sinistre.numSinistreReduit || sinistre.numSinistre}
                      </div>
                      <div className="cell-secondary">
                        {sinistre.numPolice}
                      </div>
                    </td>
                    <td>
                      <div className="cell-primary">
                        {sinistre.nomCompletAssure}
                      </div>
                      <div className="cell-secondary">
                        {sinistre.numAffiliation}
                      </div>
                    </td>
                    <td>
                      {formatDate(sinistre.dateSurv)}
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
                        {sinistre.etatSinistreLibelle}
                      </span>
                    </td>
                    <td>
                      {sinistre.natuMala || sinistre.refSpecialiteMaladieLibelle || 'N/A'}
                    </td>
                    <td>
                      <button 
                        onClick={() => handleViewDetails(sinistre)}
                        className="btn btn-small btn-outline"
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
                <span className="pagination-highlight">{totalResults}</span> résultats
              </div>
              
              <div className="pagination-controls">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  <ChevronLeft className="pagination-icon" />
                </button>
                
                {[...Array(Math.min(5, totalPages))].map((_, index) => {
                  const pageNum = index + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
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
            <p>Effectuez une recherche pour consulter les sinistres selon vos critères.</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="loading-state">
          <RefreshCw className="loading-spinner" />
          <div className="loading-content">
            <h3>Recherche en cours...</h3>
            <p>Veuillez patienter pendant que nous recherchons les sinistres.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultationSinistres;