import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight,
  FileText,
  Calendar
} from 'lucide-react';

import lotService from '../services/lotService';
import './ConsultationSinistres.css';

const ConsultationLots = ({ sidebarCollapsed }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('numeroLot');
  const [searchParams, setSearchParams] = useState({
    numeroLot: '',
    numeroPolice: '',
    dateDebut: '',
    dateFin: '',
    gestionnaire: '', // <== ajouté
    typeRecherche: 'EXACTE'
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      let response;
      if (activeTab === 'numeroLot') {
        response = await lotService.rechercherParNumeroLot(
          searchParams.numeroLot,
          searchParams.typeRecherche
        );
      } else if (activeTab === 'by-police') {
        response = await lotService.rechercherParNumeroPoliceEtPeriode(
          searchParams.numeroPolice,
          searchParams.dateDebut,
          searchParams.dateFin
        );
        } else if (activeTab === 'by-gestionnaire') {
        response = await lotService.rechercherParGestionnaire(
        searchParams.gestionnaire);
      } else if (activeTab === 'combinee') {
        response = await lotService.rechercherCombinee({
          numeroLot: searchParams.numeroLot || null,
          numeroPolice: searchParams.numeroPolice || null,
          dateDebut: searchParams.dateDebut || null,
          dateFin: searchParams.dateFin || null,
          typeRecherche: searchParams.typeRecherche || 'EXACTE'
        });
      }

      const { data, message } = response;
      setResults(data);
      setTotalResults(data.length);
      setTotalPages(Math.ceil(data.length / 10));
      setCurrentPage(1);
      setSuccessMessage(message || 'Recherche terminée');

    } catch (e) {
      setError(lotService.handleAPIError(e));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchParams({
      numeroLot: '',
      numeroPolice: '',
      dateDebut: '',
      dateFin: '',
      typeRecherche: 'EXACTE'
    });
    setResults([]);
    setError('');
    setSuccessMessage('');
    setCurrentPage(1);
    setTotalPages(1);
    setTotalResults(0);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const getCurrentPageResults = () => {
    const startIndex = (currentPage - 1) * 10;
    return results.slice(startIndex, startIndex + 10);
  };

  return (
    <div className={`consultation-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="page-header">
        <h1 className="page-title">Consultation des Lots</h1>
        <nav className="breadcrumb">
          <span>Lots</span>
          <span className="separator">›</span>
          <span className="current">Consultation</span>
        </nav>
      </div>

      <div className="tabs-container">
        <div className="tabs-wrapper">
          <button className={`tab-button ${activeTab === 'numeroLot' ? 'active' : ''}`} onClick={() => setActiveTab('numeroLot')}>
            <Search className="tab-icon" /> Par Numéro
          </button>
          <button className={`tab-button ${activeTab === 'by-gestionnaire' ? 'active' : ''}`} onClick={() => setActiveTab('by-gestionnaire')}>
            <Search className="tab-icon" /> Par Gestionnaire
          </button>

          <button className={`tab-button ${activeTab === 'by-police' ? 'active' : ''}`} onClick={() => setActiveTab('by-police')}>
            <Calendar className="tab-icon" /> Par Police + Période
          </button>
          <button className={`tab-button ${activeTab === 'combinee' ? 'active' : ''}`} onClick={() => setActiveTab('combinee')}>
            <Search className="tab-icon" /> Recherche Combinée
          </button>
        </div>
      </div>

      <div className="form-container">
        {error && <div className="alert alert-error">{error}</div>}
        {successMessage && <div className="alert alert-success">{successMessage}</div>}

        <div className="form-grid form-grid-3">
          {activeTab === 'numeroLot' && (
            <>
              <div className="form-group span-2">
                <label className="form-label required">Numéro de Lot</label>
                <input
                  type="text"
                  value={searchParams.numeroLot}
                  onChange={(e) => setSearchParams({ ...searchParams, numeroLot: e.target.value })}
                  placeholder="Saisir numéro de lot"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Type de correspondance</label>
                <select
                  className="form-input"
                  value={searchParams.typeRecherche}
                  onChange={(e) => setSearchParams({ ...searchParams, typeRecherche: e.target.value })}
                >
                  <option value="EXACTE">EXACTE</option>
                  <option value="CONTIENT">CONTIENT</option>
                  <option value="COMMENCE_PAR">COMMENCE PAR</option>
                  <option value="SE_TERMINE_PAR">SE TERMINE PAR</option>
                </select>
              </div>
            </>
          )}
            {activeTab === 'by-gestionnaire' && (
              <div className="form-group span-2">
                <label className="form-label required">Nom du Gestionnaire</label>
                <input
                  type="text"
                  value={searchParams.gestionnaire || ''}
                  onChange={(e) => setSearchParams({ ...searchParams, gestionnaire: e.target.value })}
                  placeholder="Saisir le nom du gestionnaire"
                  className="form-input"
                />
              </div>
            )}

          {activeTab === 'by-police' && (
            <>
              <div className="form-group">
                <label className="form-label required">Numéro de Police</label>
                <input
                  type="text"
                  value={searchParams.numeroPolice}
                  onChange={(e) => setSearchParams({ ...searchParams, numeroPolice: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Date Début</label>
                <input
                  type="date"
                  value={searchParams.dateDebut}
                  onChange={(e) => setSearchParams({ ...searchParams, dateDebut: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Date Fin</label>
                <input
                  type="date"
                  value={searchParams.dateFin}
                  onChange={(e) => setSearchParams({ ...searchParams, dateFin: e.target.value })}
                  className="form-input"
                />
              </div>
            </>
          )}

          {activeTab === 'combinee' && (
            <>
              <div className="form-group">
                <label className="form-label">Numéro de Lot</label>
                <input
                  type="text"
                  value={searchParams.numeroLot}
                  onChange={(e) => setSearchParams({ ...searchParams, numeroLot: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Numéro de Police</label>
                <input
                  type="text"
                  value={searchParams.numeroPolice}
                  onChange={(e) => setSearchParams({ ...searchParams, numeroPolice: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Date Début</label>
                <input
                  type="date"
                  value={searchParams.dateDebut}
                  onChange={(e) => setSearchParams({ ...searchParams, dateDebut: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Date Fin</label>
                <input
                  type="date"
                  value={searchParams.dateFin}
                  onChange={(e) => setSearchParams({ ...searchParams, dateFin: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group span-2">
                <label className="form-label">Type de Recherche</label>
                <select
                  className="form-input"
                  value={searchParams.typeRecherche}
                  onChange={(e) => setSearchParams({ ...searchParams, typeRecherche: e.target.value })}
                >
                  <option value="EXACTE">EXACTE</option>
                  <option value="CONTIENT">CONTIENT</option>
                  <option value="COMMENCE_PAR">COMMENCE PAR</option>
                  <option value="SE_TERMINE_PAR">SE TERMINE PAR</option>
                </select>
              </div>
            </>
          )}
        </div>

        <div className="form-actions">
          <button onClick={handleSearch} disabled={loading} className="btn btn-primary">
            {loading ? <RefreshCw className="btn-icon animate-spin" /> : <Search className="btn-icon" />}
            Rechercher
          </button>
          <button onClick={handleReset} className="btn btn-secondary">
            <RefreshCw className="btn-icon" />
            Réinitialiser
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="results-container">
          <div className="table-wrapper">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Numéro Lot</th>
                  <th>Police</th>
                  <th>Client</th>
                  <th>Date Réception</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getCurrentPageResults().map((lot, index) => (
                  <tr key={index}>
                    <td>{lot.numeroLot}</td>
                    <td>{lot.numeroPolice}</td>
                    <td>{lot.raisonSocialeClient || '—'}</td>
                    <td>{lot.dateReception || '—'}</td>
                    <td>
                      <button className="btn btn-small btn-outline" onClick={() => navigate(`/lots/details/${lot.id}`)}>
                        <Eye className="btn-icon" /> Détails
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
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="pagination-btn">
                  <ChevronLeft className="pagination-icon" />
                </button>
                {[...Array(totalPages).keys()].map(num => (
                  <button
                    key={num + 1}
                    onClick={() => handlePageChange(num + 1)}
                    className={`pagination-btn ${currentPage === num + 1 ? 'active' : ''}`}
                  >
                    {num + 1}
                  </button>
                ))}
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="pagination-btn">
                  <ChevronRight className="pagination-icon" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {!loading && results.length === 0 && !error && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Search />
          </div>
          <div className="empty-state-content">
            <h3>Aucun résultat trouvé</h3>
            <p>Effectuez une recherche pour consulter les lots selon vos critères.</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="loading-state">
          <RefreshCw className="loading-spinner" />
          <div className="loading-content">
            <h3>Recherche en cours...</h3>
            <p>Veuillez patienter pendant que nous recherchons les lots.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultationLots;
