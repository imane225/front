import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  Calendar, 
  Building,
  Hash,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  Save,
  RefreshCw,
  Info,
  Eye,
  AlertTriangle,
  Package
} from 'lucide-react';
import lotService from '../services/lotService';
import './ModifierSinistre.css'; 

const EditLot = ({ sidebarCollapsed = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [lotOriginal, setLotOriginal] = useState(null);
  
  const [formData, setFormData] = useState({
    numeroLot: '',
    numeroPolice: '',
    typeLotId: '1',
    dateReception: '',
    nombreSinistresRecu: '',
    nombreSinistresDeclare: '',
    raisonSocialeClient: '',
    codeApporteur: '',
    raisonSocialeApporteur: '',
    refEtatPoliceLibelle: '',
    dateEtatPolice: '',
    refEtatLibelle: '',
    dateEtat: '',
    nombreOuverture: 0,
    motifModifAnnul: '',
    nombreReactivation: 0
  });

  const [validation, setValidation] = useState({});

  useEffect(() => {
    const fetchLot = async () => {
      try {
        setLoading(true);
        setError('');
        
        console.log('🔍 Chargement du lot pour modification:', id);
        
        const res = await lotService.rechercherParIdLot(id);
        const lot = res.data[0];
        
        console.log('📄 Lot chargé:', lot);
        setLotOriginal(lot);
        
        setFormData({
          numeroLot: lot.numeroLot || '',
          numeroPolice: lot.numeroPolice || '',
          typeLotId: lot.typeLotId || '1',
          dateReception: lot.dateReception || '',
          nombreSinistresRecu: lot.nombreSinistresRecu || '',
          nombreSinistresDeclare: lot.nombreSinistresDeclare || '',
          raisonSocialeClient: lot.raisonSocialeClient || '',
          codeApporteur: lot.codeApporteur || '',
          raisonSocialeApporteur: lot.raisonSocialeApporteur || '',
          refEtatPoliceLibelle: lot.refEtatPoliceLibelle || '',
          dateEtatPolice: lot.dateEtatPolice || '',
          refEtatLibelle: lot.refEtatLibelle || '',
          dateEtat: lot.dateEtat || '',
          nombreOuverture: lot.nombreOuverture || 0,
          motifModifAnnul: '',
          nombreReactivation: lot.nombreReactivation || 0
        });
        
      } catch (err) {
        console.error('❌ Erreur lors du chargement:', err);
        setError(lotService.handleAPIError(err));
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchLot();
    }
  }, [id]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (validation[field]) {
      setValidation(prev => ({
        ...prev,
        [field]: ''
      }));
    }
    
    setError('');
    setSuccessMessage('');
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.motifModifAnnul || !formData.motifModifAnnul.trim()) {
      errors.motifModifAnnul = 'Le motif de modification est obligatoire';
    } else if (formData.motifModifAnnul.trim().length < 5) {
      errors.motifModifAnnul = 'Le motif doit contenir au moins 5 caractères';
    }
    
    if (!formData.numeroPolice || !formData.numeroPolice.trim()) {
      errors.numeroPolice = 'Le numéro de police est obligatoire';
    }
    
    if (!formData.nombreSinistresRecu || formData.nombreSinistresRecu === '') {
      errors.nombreSinistresRecu = 'Le nombre de sinistres reçus est obligatoire';
    } else {
      const nombre = parseInt(formData.nombreSinistresRecu);
      if (isNaN(nombre) || nombre < 0) {
        errors.nombreSinistresRecu = 'Le nombre doit être un entier positif';
      }
    }
    
    if (formData.typeLotId === '2') {
      if (!formData.nombreSinistresDeclare || formData.nombreSinistresDeclare === '') {
        errors.nombreSinistresDeclare = 'Le nombre de sinistres déclarés est obligatoire pour les lots externes';
      } else {
        const nombre = parseInt(formData.nombreSinistresDeclare);
        if (isNaN(nombre) || nombre < 0) {
          errors.nombreSinistresDeclare = 'Le nombre doit être un entier positif';
        }
      }
    }
    
    if (formData.dateReception) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(formData.dateReception)) {
        errors.dateReception = 'Format de date invalide (AAAA-MM-JJ)';
      } else {
        const dateReception = new Date(formData.dateReception);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        
        if (dateReception > today) {
          errors.dateReception = 'La date de réception ne peut pas être dans le futur';
        }
      }
    }
    
    setValidation(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Veuillez corriger les erreurs dans le formulaire');
      return;
    }
    
    setSaving(true);
    setError('');
    setSuccessMessage('');
    
    try {
      const lotToSend = {
        id: Number(id),
        numeroLot: formData.numeroLot,
        numeroPolice: formData.numeroPolice.trim(),
        typeLotId: formData.typeLotId,
        nombreSinistresRecu: parseInt(formData.nombreSinistresRecu || '0'),
        nombreSinistresDeclare: formData.typeLotId === '2' ? parseInt(formData.nombreSinistresDeclare || '0') : null,
        dateReception: formData.dateReception || null,
        raisonSocialeClient: formData.raisonSocialeClient.trim() || '',
        codeApporteur: formData.codeApporteur.trim() || '',
        raisonSocialeApporteur: formData.raisonSocialeApporteur.trim() || '',
        refEtatPoliceLibelle: formData.refEtatPoliceLibelle.trim() || '',
        dateEtatPolice: formData.dateEtatPolice || '',
        refEtatLibelle: formData.refEtatLibelle.trim() || '',
        dateEtat: formData.dateEtat || '',
        motifModifAnnul: formData.motifModifAnnul.trim()
      };

      console.log('📦 Payload envoyé pour modification:', lotToSend);
      
      const response = await lotService.modifierLot(id, lotToSend);
      
      console.log('✅ Réponse de modification:', response);
      
      setSuccessMessage('Lot modifié avec succès !');
      
      setTimeout(() => {
        navigate(`/lots/details/${id}`);
      }, 2000);
      
    } catch (err) {
      console.error('❌ Erreur lors de la modification:', err);
      setError(lotService.handleAPIError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/lots/details/${id}`);
  };

  const handleViewDetails = () => {
    navigate(`/lots/details/${id}`);
  };

  const hasChanges = () => {
    if (!lotOriginal) return false;
    
    return (
      formData.numeroPolice !== (lotOriginal.numeroPolice || '') ||
      formData.nombreSinistresRecu !== (lotOriginal.nombreSinistresRecu || '') ||
      formData.nombreSinistresDeclare !== (lotOriginal.nombreSinistresDeclare || '') ||
      formData.dateReception !== (lotOriginal.dateReception || '') ||
      formData.raisonSocialeClient !== (lotOriginal.raisonSocialeClient || '') ||
      formData.codeApporteur !== (lotOriginal.codeApporteur || '') ||
      formData.raisonSocialeApporteur !== (lotOriginal.raisonSocialeApporteur || '') ||
      formData.refEtatPoliceLibelle !== (lotOriginal.refEtatPoliceLibelle || '') ||
      formData.dateEtatPolice !== (lotOriginal.dateEtatPolice || '') ||
      formData.refEtatLibelle !== (lotOriginal.refEtatLibelle || '') ||
      formData.dateEtat !== (lotOriginal.dateEtat || '') ||
      (formData.motifModifAnnul && formData.motifModifAnnul.trim())
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      if (dateStr.includes('/')) {
        const [day, month, year] = dateStr.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className={`modifier-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="loading-state">
          <RefreshCw className="loading-spinner" />
          <div className="loading-content">
            <h3>Chargement du lot...</h3>
            <p>Veuillez patienter pendant que nous récupérons les informations.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !lotOriginal) {
    return (
      <div className={`modifier-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="page-header">
          <button onClick={() => navigate('/consultation/lots')} className="btn btn-secondary">
            <ArrowLeft className="btn-icon" />
            Retour
          </button>
        </div>
        
        <div className="error-state">
          <div className="error-icon">
            <AlertCircle />
          </div>
          <div className="error-content">
            <h3>Erreur lors du chargement</h3>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="btn btn-primary">
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`modifier-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <nav className="breadcrumb">
        <span onClick={() => navigate('/consultation/lots')} className="breadcrumb-link">Accueil</span>
        <span className="separator">›</span>
        <span onClick={() => navigate('/consultation/lots')} className="breadcrumb-link">Consulter</span>
        <span className="separator">›</span>
        <span onClick={handleViewDetails} className="breadcrumb-link">Détails</span>
        <span className="separator">›</span>
        <span className="current">Modifier</span>
      </nav>

      <div className="modifier-header">
        <div className="header-main">
          <h1 className="page-title">
            <Package className="title-icon" />
            Modifier Lot
          </h1>
          <div className="status-container">
            <Clock className="status-icon" />
            <span className="status-badge status-default">
              {formData.refEtatLibelle || 'En cours'}
            </span>
          </div>
        </div>
        
        <div className="header-summary">
          <div className="summary-item">
            <span className="summary-label">N° Lot</span>
            <span className="summary-value">{formData.numeroLot}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Police</span>
            <span className="summary-value">{formData.numeroPolice}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Type</span>
            <span className="summary-value">{formData.typeLotId === '1' ? 'Interne' : 'Externe'}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Client</span>
            <span className="summary-value">{formData.raisonSocialeClient}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle className="alert-icon" />
          {error}
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success">
          <CheckCircle className="alert-icon" />
          {successMessage}
        </div>
      )}

      {hasChanges() && !saving && !successMessage && (
        <div className="alert alert-warning">
          <Info className="alert-icon" />
          Des modifications non sauvegardées sont en cours. N'oubliez pas de sauvegarder.
        </div>
      )}

      <form onSubmit={handleSubmit} className="modifier-form">
        <div className="form-grid">
          
          <div className="form-section">
            <div className="section-header">
              <FileText className="section-icon" />
              <h3>Modification Obligatoire</h3>
            </div>
            
            <div className="form-row">
              <div className="form-group full-width">
                <label className="form-label required">
                  Motif de modification *
                  <AlertTriangle className="warning-icon" title="Champ obligatoire pour toute modification" />
                </label>
                <textarea
                  value={formData.motifModifAnnul}
                  onChange={(e) => handleInputChange('motifModifAnnul', e.target.value)}
                  className={`form-textarea ${validation.motifModifAnnul ? 'error' : ''} warning`}
                  placeholder="Décrivez la raison de cette modification (minimum 5 caractères)..."
                  rows="3"
                  maxLength="500"
                />
                {validation.motifModifAnnul && (
                  <span className="error-message">{validation.motifModifAnnul}</span>
                )}
                <div className="char-counter">
                  {formData.motifModifAnnul ? formData.motifModifAnnul.length : 0}/500
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <Building className="section-icon" />
              <h3>Informations Police</h3>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label required">Numéro Police *</label>
                <input
                  type="text"
                  value={formData.numeroPolice}
                  onChange={(e) => handleInputChange('numeroPolice', e.target.value)}
                  className={`form-input ${validation.numeroPolice ? 'error' : ''}`}
                  placeholder="Numéro de police"
                  maxLength="50"
                />
                {validation.numeroPolice && (
                  <span className="error-message">{validation.numeroPolice}</span>
                )}
              </div>
              
              <div className="form-group">
                <label className="form-label">État Police</label>
                <input
                  type="text"
                  value={formData.refEtatPoliceLibelle}
                  onChange={(e) => handleInputChange('refEtatPoliceLibelle', e.target.value)}
                  className="form-input"
                  placeholder="État de la police"
                  maxLength="100"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date État Police</label>
                <input
                  type="date"
                  value={formatDate(formData.dateEtatPolice)}
                  onChange={(e) => handleInputChange('dateEtatPolice', e.target.value)}
                  className="form-input"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Date Réception</label>
                <input
                  type="date"
                  value={formatDate(formData.dateReception)}
                  onChange={(e) => handleInputChange('dateReception', e.target.value)}
                  className={`form-input ${validation.dateReception ? 'error' : ''}`}
                  max={new Date().toISOString().split('T')[0]}
                />
                {validation.dateReception && (
                  <span className="error-message">{validation.dateReception}</span>
                )}
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <Hash className="section-icon" />
              <h3>Informations Sinistres</h3>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label required">Nombre Sinistres Reçus *</label>
                <input
                  type="number"
                  min="0"
                  value={formData.nombreSinistresRecu}
                  onChange={(e) => handleInputChange('nombreSinistresRecu', e.target.value)}
                  className={`form-input ${validation.nombreSinistresRecu ? 'error' : ''}`}
                  placeholder="0"
                />
                {validation.nombreSinistresRecu && (
                  <span className="error-message">{validation.nombreSinistresRecu}</span>
                )}
              </div>
              
              {formData.typeLotId === '2' && (
                <div className="form-group">
                  <label className="form-label required">Nombre Sinistres Déclarés *</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.nombreSinistresDeclare}
                    onChange={(e) => handleInputChange('nombreSinistresDeclare', e.target.value)}
                    className={`form-input ${validation.nombreSinistresDeclare ? 'error' : ''}`}
                    placeholder="0"
                  />
                  {validation.nombreSinistresDeclare && (
                    <span className="error-message">{validation.nombreSinistresDeclare}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <Users className="section-icon" />
              <h3>Informations Client / Apporteur</h3>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Raison Sociale Client</label>
                <input
                  type="text"
                  value={formData.raisonSocialeClient}
                  onChange={(e) => handleInputChange('raisonSocialeClient', e.target.value)}
                  className="form-input"
                  placeholder="Nom du client"
                  maxLength="200"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Code Apporteur</label>
                <input
                  type="text"
                  value={formData.codeApporteur}
                  onChange={(e) => handleInputChange('codeApporteur', e.target.value)}
                  className="form-input"
                  placeholder="Code apporteur"
                  maxLength="50"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Raison Sociale Apporteur</label>
                <input
                  type="text"
                  value={formData.raisonSocialeApporteur}
                  onChange={(e) => handleInputChange('raisonSocialeApporteur', e.target.value)}
                  className="form-input"
                  placeholder="Nom de l'apporteur"
                  maxLength="200"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">État du Lot</label>
                <input
                  type="text"
                  value={formData.refEtatLibelle}
                  onChange={(e) => handleInputChange('refEtatLibelle', e.target.value)}
                  className="form-input"
                  placeholder="État du lot"
                  maxLength="100"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date État Lot</label>
                <input
                  type="date"
                  value={formatDate(formData.dateEtat)}
                  onChange={(e) => handleInputChange('dateEtat', e.target.value)}
                  className="form-input"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </div>

          <div className="form-section readonly">
            <div className="section-header">
              <Info className="section-icon" />
              <h3>Informations Consultation</h3>
            </div>
            
            <div className="readonly-grid">
              <div className="readonly-item">
                <label>N° Lot</label>
                <span>{formData.numeroLot || 'N/A'}</span>
              </div>
              <div className="readonly-item">
                <label>Type de Lot</label>
                <span>{formData.typeLotId === '1' ? 'Interne' : 'Externe'}</span>
              </div>
              <div className="readonly-item">
                <label>Nombre Ouvertures</label>
                <span>{formData.nombreOuverture || 0}</span>
              </div>
              <div className="readonly-item">
                <label>Nombre Réactivations</label>
                <span>{formData.nombreReactivation || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={handleViewDetails}
            className="btn btn-outline"
          >
            <Eye className="btn-icon" />
            Voir Détails
          </button>
          
          <button
            type="button"
            onClick={handleCancel}
            className="btn btn-secondary"
          >
            <ArrowLeft className="btn-icon" />
            Annuler
          </button>
          
          <button
            type="submit"
            disabled={saving || !hasChanges()}
            className="btn btn-primary"
            title={!hasChanges() ? 'Aucune modification à sauvegarder' : ''}
          >
            {saving ? (
              <RefreshCw className="btn-icon animate-spin" />
            ) : (
              <Save className="btn-icon" />
            )}
            {saving ? 'Modification...' : 'Sauvegarder'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditLot;