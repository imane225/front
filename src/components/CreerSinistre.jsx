import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  User, 
  FileText, 
  Calendar, 
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  Minus,
  Building,
  CreditCard,
  Stethoscope,
  Hash,
  Info,
  Save,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SinistreService from '../services/sinistreService';
import './CreerSinistre.css';

const CreerSinistre = ({ sidebarCollapsed = false }) => {
  const navigate = useNavigate();
  const [typesDeclaration, setTypesDeclaration] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    obligatoires: true,
    optionnels: false,
    avances: false
  });

  const [formData, setFormData] = useState({
    numPolice: '',
    numAffiliation: '',
    codeDecl: '',
    dateSurv: '',
    
    dateDecl: '',
    montoFe: '',
    refExtSi: '',
    natuMala: '',
    
    numFiliale: '',
    numCompl: '',
    lieParbe: '',
    numOrdre: '',
    codeSpeMa: '',
    codeClin: '',
    codeMede: '',
    dateOuve: '',
    monAvaSi: '',
    dossTran: '',
    fausDecl: 'false',
    siniArch: 'false',
    obbseSini: ''
  });

  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const loadTypesDeclaration = async () => {
      try {
        setLoadingTypes(true);
        const response = await SinistreService.getTypesDeclaration();
        setTypesDeclaration(response.data);
      } catch (error) {
        console.error('Erreur chargement types:', error);
      } finally {
        setLoadingTypes(false);
      }
    };

    loadTypesDeclaration();
  }, []);

  const handleBack = () => {
    navigate('/consultation/sinistres');
  };

  const toggleSection = (sectionName) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (validationErrors[field] && value.trim()) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.numPolice.trim()) {
      errors.numPolice = 'Le numéro de police est obligatoire';
    }
    if (!formData.numAffiliation.trim()) {
      errors.numAffiliation = 'Le numéro d\'affiliation est obligatoire';
    }
    if (!formData.codeDecl.trim()) {
      errors.codeDecl = 'Le type de déclaration est obligatoire';
    }
    if (!formData.dateSurv.trim()) {
      errors.dateSurv = 'La date de survenance est obligatoire';
    }

    if (formData.dateDecl && !formData.dateDecl.match(/^\d{4}-\d{2}-\d{2}$/)) {
      errors.dateDecl = 'Format de date invalide (YYYY-MM-DD)';
    }
    if (formData.dateSurv && !formData.dateSurv.match(/^\d{4}-\d{2}-\d{2}$/)) {
      errors.dateSurv = 'Format de date invalide (YYYY-MM-DD)';
    }
    if (formData.dateOuve && !formData.dateOuve.match(/^\d{4}-\d{2}-\d{2}$/)) {
      errors.dateOuve = 'Format de date invalide (YYYY-MM-DD)';
    }

    if (formData.montoFe && formData.montoFe.trim()) {
      const montant = parseFloat(formData.montoFe);
      if (isNaN(montant)) {
        errors.montoFe = 'Le montant doit être un nombre valide';
      } else if (montant < 0) {
        errors.montoFe = 'Le montant ne peut pas être négatif';
      } else if (montant > 1000000) {
        errors.montoFe = 'Le montant semble trop élevé (max 1,000,000)';
      }
    }
    if (formData.monAvaSi && formData.monAvaSi.trim()) {
      const montant = parseFloat(formData.monAvaSi);
      if (isNaN(montant)) {
        errors.monAvaSi = 'Le montant doit être un nombre valide';
      } else if (montant < 0) {
        errors.monAvaSi = 'Le montant ne peut pas être négatif';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      console.log('🚀 Création du sinistre avec:', formData);
      
      const dataToSend = {};
      
      dataToSend.numPolice = formData.numPolice.trim();
      dataToSend.numAffiliation = formData.numAffiliation.trim();
      dataToSend.codeDecl = formData.codeDecl.trim();
      dataToSend.dateSurv = formData.dateSurv.trim();
      
      if (formData.dateDecl.trim()) dataToSend.dateDecl = formData.dateDecl.trim();
      if (formData.montoFe.trim()) dataToSend.montoFe = formData.montoFe.trim();
      if (formData.refExtSi.trim()) dataToSend.refExtSi = formData.refExtSi.trim();
      if (formData.natuMala.trim()) dataToSend.natuMala = formData.natuMala.trim();
      
      if (formData.numFiliale.trim()) dataToSend.numFiliale = formData.numFiliale.trim();
      if (formData.numCompl.trim()) dataToSend.numCompl = formData.numCompl.trim();
      if (formData.lieParbe.trim()) dataToSend.lieParbe = formData.lieParbe.trim();
      if (formData.numOrdre.trim()) dataToSend.numOrdre = formData.numOrdre.trim();
      if (formData.codeSpeMa.trim()) dataToSend.codeSpeMa = formData.codeSpeMa.trim();
      if (formData.codeClin.trim()) dataToSend.codeClin = formData.codeClin.trim();
      if (formData.codeMede.trim()) dataToSend.codeMede = formData.codeMede.trim();
      if (formData.dateOuve.trim()) dataToSend.dateOuve = formData.dateOuve.trim();
      if (formData.monAvaSi.trim()) dataToSend.monAvaSi = formData.monAvaSi.trim();
      if (formData.dossTran.trim()) dataToSend.dossTran = formData.dossTran.trim();
      if (formData.obbseSini.trim()) dataToSend.obbseSini = formData.obbseSini.trim();
      
      if (formData.fausDecl !== 'false') dataToSend.fausDecl = formData.fausDecl;
      if (formData.siniArch !== 'false') dataToSend.siniArch = formData.siniArch;
      
      console.log('📤 Données envoyées au backend:', dataToSend);
      
      console.log('🔍 DEBUGGING DÉTAILLÉ:');
      console.log('- Numéro Police:', `"${dataToSend.numPolice}"`);
      console.log('- Numéro Affiliation:', `"${dataToSend.numAffiliation}"`);
      console.log('- Code Déclaration:', `"${dataToSend.codeDecl}"`);
      console.log('- Date Survenance:', `"${dataToSend.dateSurv}"`);
      if (dataToSend.montoFe) console.log('- Montant FE:', `"${dataToSend.montoFe}"`);
      
      const response = await SinistreService.creerSinistreSansLot(dataToSend);
      
      console.log('✅ Sinistre créé:', response);
      
      setSuccess(`Sinistre créé avec succès ! Numéro: ${response.data[0]?.numSinistre || 'N/A'}`);
      
      setTimeout(() => {
        if (response.data[0]?.numSinistre) {
          navigate(`/consultation/sinistres/${response.data[0].numSinistre}/details`);
        } else {
          navigate('/consultation/sinistres');
        }
      }, 2000);
      
    } catch (error) {
      console.error('❌ Erreur lors de la création:', error);
      setError(SinistreService.handleAPIError(error));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      numPolice: '',
      numAffiliation: '',
      codeDecl: '',
      dateSurv: '',
      dateDecl: '',
      montoFe: '',
      refExtSi: '',
      natuMala: '',
      numFiliale: '',
      numCompl: '',
      lieParbe: '',
      numOrdre: '',
      codeSpeMa: '',
      codeClin: '',
      codeMede: '',
      dateOuve: '',
      monAvaSi: '',
      dossTran: '',
      fausDecl: 'false',
      siniArch: 'false',
      obbseSini: ''
    });
    setValidationErrors({});
    setError('');
    setSuccess('');
  };

  const InputField = ({ label, value, onChange, error, required = false, type = 'text', placeholder = '', maxLength = null }) => (
    <div className="input-field">
      <label className={`input-label ${required ? 'required' : ''}`}>
        {label}
        {required && <span className="required-star">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`input-control ${error ? 'error' : ''}`}
        placeholder={placeholder}
        maxLength={maxLength}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );

  const SelectField = ({ label, value, onChange, options, error, required = false }) => (
    <div className="input-field">
      <label className={`input-label ${required ? 'required' : ''}`}>
        {label}
        {required && <span className="required-star">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`input-control ${error ? 'error' : ''}`}
      >
        <option value="">-- Sélectionner --</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="error-message">{error}</span>}
    </div>
  );

  const TextAreaField = ({ label, value, onChange, error, placeholder = '', rows = 3 }) => (
    <div className="input-field full-width">
      <label className="input-label">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`input-control ${error ? 'error' : ''}`}
        placeholder={placeholder}
        rows={rows}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );

  const ExpandableCard = ({ title, icon, children, sectionKey, badgeText = null }) => {
    const IconElement = icon;
    
    return (
      <div className="form-card">
        <div 
          className="card-header clickable" 
          onClick={() => toggleSection(sectionKey)}
        >
          <div className="card-title">
            <IconElement className="card-icon" />
            <span>{title}</span>
            {badgeText && (
              <span className="section-badge">{badgeText}</span>
            )}
          </div>
          <div className="expand-controls">
            {expandedSections[sectionKey] ? (
              <Minus className="expand-icon" />
            ) : (
              <Plus className="expand-icon" />
            )}
          </div>
        </div>
        
        {expandedSections[sectionKey] && (
          <div className="card-content">
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`create-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <nav className="breadcrumb">
        <span onClick={handleBack} className="breadcrumb-link">Accueil</span>
        <span className="separator">›</span>
        <span onClick={handleBack} className="breadcrumb-link">Consulter</span>
        <span className="separator">›</span>
        <span className="current">Créer Sinistre</span>
      </nav>

      <div className="create-header">
        <div className="header-main">
          <h1 className="page-title">Créer un Sinistre Sans Lot</h1>
          <div className="status-container">
            <FileText className="status-icon" />
            <span className="status-badge status-new">Nouveau</span>
          </div>
        </div>
        
        <div className="header-summary">
          <div className="summary-item">
            <span className="summary-label">Type</span>
            <span className="summary-value">Sinistre sans lot</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Statut</span>
            <span className="summary-value">En cours de création</span>
          </div>
          {formData.codeDecl && (
            <div className="summary-item">
              <span className="summary-label">Type déclaration</span>
              <span className="summary-value">
                {typesDeclaration.find(t => t.code === formData.codeDecl)?.libelle || formData.codeDecl}
              </span>
            </div>
          )}
        </div>

        <div className="header-actions">
          <button 
            type="button"
            onClick={resetForm} 
            className="btn btn-outline"
            disabled={loading}
          >
            <RefreshCw className="btn-icon" />
            Réinitialiser
          </button>
          
          <button onClick={handleBack} className="btn btn-secondary">
            <ArrowLeft className="btn-icon" />
            Retour à la consultation
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle className="alert-icon" />
          <div className="alert-content">
            <strong>Erreur :</strong> {error}
            {error.includes('Assuré non trouvé') && (
              <div className="alert-help">
                💡 <strong>Aide :</strong> Utilisez des données d'un assuré existant. 
                Consultez la page "Rechercher sinistre" pour obtenir des numéros de police et d'affiliation valides.
              </div>
            )}
            {error.includes('TYPE.DECLARATION.ERREUR') && (
              <div className="alert-help">
                💡 <strong>Aide :</strong> Essayez les codes: 24, 30, 38, CON, HOS, ou PHA
              </div>
            )}
            {error.includes('ASSURE.ETAT.ERREUR') && (
              <div className="alert-help">
                💡 <strong>État assuré invalide :</strong><br/>
                • L'assuré existe mais son état ne permet pas la création de sinistre<br/>
                • <strong>Solution :</strong> Utilisez un assuré d'un sinistre plus récent
              </div>
            )}
            {error.includes('FRAIS.ENGAGES.ERREUR') && (
              <div className="alert-help">
                💡 <strong>Aide :</strong> Problème avec le montant des frais. 
                Vérifiez le format (ex: 1500.50) et les limites autorisées.
              </div>
            )}
          </div>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <CheckCircle className="alert-icon" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="create-form">
        <div className="form-grid">
          
          <ExpandableCard 
            title="Informations Obligatoires" 
            icon={AlertCircle} 
            sectionKey="obligatoires"
            badgeText="Requis"
          >
            <div className="input-grid">
              <InputField
                label="Numéro de Police"
                value={formData.numPolice}
                onChange={(value) => handleInputChange('numPolice', value)}
                error={validationErrors.numPolice}
                required
                placeholder="Ex: 123456789"
                maxLength={20}
              />
              
              <InputField
                label="Numéro d'Affiliation"
                value={formData.numAffiliation}
                onChange={(value) => handleInputChange('numAffiliation', value)}
                error={validationErrors.numAffiliation}
                required
                placeholder="Ex: 987654"
                maxLength={20}
              />
              
              <div className="input-field">
                <label className="input-label required">
                  Type de Déclaration
                  <span className="required-star">*</span>
                </label>
                <select
                  value={formData.codeDecl}
                  onChange={(e) => handleInputChange('codeDecl', e.target.value)}
                  className={`input-control ${validationErrors.codeDecl ? 'error' : ''}`}
                  disabled={loadingTypes}
                >
                  <option value="">
                    {loadingTypes ? '-- Chargement des types...' : '-- Sélectionner --'}
                  </option>
                  {typesDeclaration.map(type => (
                    <option key={type.code} value={type.code}>
                      {type.code} - {type.libelle}
                    </option>
                  ))}
                </select>
                {validationErrors.codeDecl && (
                  <span className="error-message">{validationErrors.codeDecl}</span>
                )}
              </div>
              
              <InputField
                label="Date de Survenance"
                value={formData.dateSurv}
                onChange={(value) => handleInputChange('dateSurv', value)}
                error={validationErrors.dateSurv}
                required
                type="date"
              />
            </div>
          </ExpandableCard>

          <ExpandableCard 
            title="Informations Optionnelles" 
            icon={Info} 
            sectionKey="optionnels"
            badgeText="Recommandées"
          >
            <div className="input-grid">
              <InputField
                label="Date de Déclaration"
                value={formData.dateDecl}
                onChange={(value) => handleInputChange('dateDecl', value)}
                error={validationErrors.dateDecl}
                type="date"
                placeholder="Auto si vide"
              />
              
              <InputField
                label="Montant Frais Engagés (DH)"
                value={formData.montoFe}
                onChange={(value) => handleInputChange('montoFe', value)}
                error={validationErrors.montoFe}
                type="number"
                placeholder="Ex: 1500.50"
              />
              
              <InputField
                label="Référence Externe"
                value={formData.refExtSi}
                onChange={(value) => handleInputChange('refExtSi', value)}
                error={validationErrors.refExtSi}
                placeholder="Référence du sinistre"
                maxLength={50}
              />
              
              <InputField
                label="Nature de la Maladie"
                value={formData.natuMala}
                onChange={(value) => handleInputChange('natuMala', value)}
                error={validationErrors.natuMala}
                placeholder="Description de la pathologie"
                maxLength={200}
              />
            </div>
          </ExpandableCard>

          <ExpandableCard 
            title="Informations Avancées" 
            icon={Building} 
            sectionKey="avances"
            badgeText="Optionnel"
          >
            <div className="input-grid">
              <InputField
                label="Numéro Filiale"
                value={formData.numFiliale}
                onChange={(value) => handleInputChange('numFiliale', value)}
                placeholder="Code filiale"
                maxLength={10}
              />
              
              <InputField
                label="Numéro complement"
                value={formData.numCompl}
                onChange={(value) => handleInputChange('numCompl', value)}
                placeholder="complement"
                maxLength={10}
              />
              
              <InputField
                label="Lieu (Parbe)"
                value={formData.lieParbe}
                onChange={(value) => handleInputChange('lieParbe', value)}
                placeholder="Lieu du sinistre"
                maxLength={50}
              />
              
              <InputField
                label="Numéro d'Ordre"
                value={formData.numOrdre}
                onChange={(value) => handleInputChange('numOrdre', value)}
                placeholder="Numéro d'ordre"
                maxLength={10}
              />
              
              <InputField
                label="Code Spécialité Maladie"
                value={formData.codeSpeMa}
                onChange={(value) => handleInputChange('codeSpeMa', value)}
                placeholder="Code spécialité"
                maxLength={10}
              />
              
              <InputField
                label="Code Clinique"
                value={formData.codeClin}
                onChange={(value) => handleInputChange('codeClin', value)}
                placeholder="Code établissement"
                maxLength={10}
              />
              
              <InputField
                label="Code Médecin"
                value={formData.codeMede}
                onChange={(value) => handleInputChange('codeMede', value)}
                placeholder="Code praticien"
                maxLength={10}
              />
              
              <InputField
                label="Date d'Ouverture"
                value={formData.dateOuve}
                onChange={(value) => handleInputChange('dateOuve', value)}
                error={validationErrors.dateOuve}
                type="date"
              />
              
              <InputField
                label="Montant Avance Sinistre (DH)"
                value={formData.monAvaSi}
                onChange={(value) => handleInputChange('monAvaSi', value)}
                error={validationErrors.monAvaSi}
                type="number"
                placeholder="Montant d'avance"
              />
              
              <InputField
                label="Dossier Transfert"
                value={formData.dossTran}
                onChange={(value) => handleInputChange('dossTran', value)}
                placeholder="Référence transfert"
                maxLength={50}
              />
              
              <SelectField
                label="Fausse Déclaration"
                value={formData.fausDecl}
                onChange={(value) => handleInputChange('fausDecl', value)}
                options={[
                  { value: 'false', label: 'Non' },
                  { value: 'true', label: 'Oui' }
                ]}
              />
              
              <SelectField
                label="Sinistre Archivé"
                value={formData.siniArch}
                onChange={(value) => handleInputChange('siniArch', value)}
                options={[
                  { value: 'false', label: 'Non' },
                  { value: 'true', label: 'Oui' }
                ]}
              />
            </div>
            
            <TextAreaField
              label="Observations"
              value={formData.obbseSini}
              onChange={(value) => handleInputChange('obbseSini', value)}
              placeholder="Commentaires ou observations sur le sinistre..."
              rows={4}
            />
          </ExpandableCard>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary btn-large"
            disabled={loading}
          >
            {loading ? (
              <>
                <Clock className="btn-icon spinning" />
                Création en cours...
              </>
            ) : (
              <>
                <Save className="btn-icon" />
                Créer le Sinistre
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreerSinistre;