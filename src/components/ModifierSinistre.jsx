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
  Save,
  RefreshCw,
  Stethoscope,
  Building,
  Hash,
  Info,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import SinistreService from '../services/sinistreService';
import './ModifierSinistre.css';

const ModifierSinistre = ({ sidebarCollapsed = false }) => {
  const { numSinistre } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [sinistreOriginal, setSinistreOriginal] = useState(null);
  const [typesDeclaration, setTypesDeclaration] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  
  const [formData, setFormData] = useState({
    codeDecl: '',
    dateSurv: '',
    dateDecl: '',
    montoFe: '',
    refExtSi: '',
    natuMala: '',
    numSinistre: '',
    numPolice: '',
    numAffiliation: '',
    nomCompletAssure: '',
    etatSinistreLibelle: ''
  });

  const [validation, setValidation] = useState({});

  // Chargement des types de déclaration
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

  const getFieldPermissions = (etatSinistre) => {
    const etat = etatSinistre?.toUpperCase();
    
    const etatsAbsolumentInterdits = ['REGLE', 'REJETE', 'ANNULE', 'SANS_SUITE', 'MIGRE', 'RÉGLÉ', 'REJETÉ', 'ANNULÉ'];
    
    if (etatsAbsolumentInterdits.some(etatInterdit => etat?.includes(etatInterdit))) {
      return {
        codeDecl: { allowed: false, warning: false },
        dateSurv: { allowed: false, warning: false },
        dateDecl: { allowed: false, warning: false },
        montoFe: { allowed: false, warning: false },
        refExtSi: { allowed: false, warning: false },
        natuMala: { allowed: false, warning: false },
        actions: etat?.includes('MIGR') ? 'Consultation' : 'Réouverture'
      };
    }
    
    const permissions = {
      OUVERT: {
        codeDecl: { allowed: true, warning: false },
        dateSurv: { allowed: true, warning: false },
        dateDecl: { allowed: true, warning: false },
        montoFe: { allowed: true, warning: false },
        refExtSi: { allowed: true, warning: false },
        natuMala: { allowed: true, warning: false },
        actions: 'Toutes'
      },
      
      EN_ATTENTE_COMPLEMENT: {
        codeDecl: { allowed: true, warning: false },
        dateSurv: { allowed: true, warning: false },
        dateDecl: { allowed: true, warning: false },
        montoFe: { allowed: true, warning: false },
        refExtSi: { allowed: true, warning: false },
        natuMala: { allowed: true, warning: false },
        actions: 'Toutes'
      },
      
      EN_COURS_CHIFFRAGE: {
        codeDecl: { allowed: true, warning: true },
        dateSurv: { allowed: true, warning: false },
        dateDecl: { allowed: true, warning: false },
        montoFe: { allowed: true, warning: false },
        refExtSi: { allowed: true, warning: false },
        natuMala: { allowed: true, warning: false },
        actions: 'Limitées'
      },
      
      EN_ATTENTE_FACTURE: {
        codeDecl: { allowed: false, warning: false },
        dateSurv: { allowed: false, warning: false },
        dateDecl: { allowed: true, warning: false },
        montoFe: { allowed: false, warning: false },
        refExtSi: { allowed: true, warning: false },
        natuMala: { allowed: true, warning: false },
        actions: 'Admin seul'
      },
      
      EN_ATTENTE_CM: {
        codeDecl: { allowed: false, warning: false },
        dateSurv: { allowed: false, warning: false },
        dateDecl: { allowed: true, warning: false },
        montoFe: { allowed: false, warning: false },
        refExtSi: { allowed: true, warning: false },
        natuMala: { allowed: true, warning: true },
        actions: 'Admin seul'
      }
    };

    return permissions[etat] || permissions.OUVERT;
  };

  const canModifySinistre = (etatSinistre) => {
    const etat = etatSinistre?.toUpperCase();
    
    const etatsNonModifiables = ['REGLE', 'REJETE', 'ANNULE', 'SANS_SUITE', 'MIGRE', 'RÉGLÉ', 'REJETÉ', 'ANNULÉ'];
    
    const estInterdit = etatsNonModifiables.some(etatInterdit => 
      etat?.includes(etatInterdit) || etat === etatInterdit
    );
    
    if (estInterdit) {
      console.log('🚨 État non modifiable détecté:', etat);
      return false;
    }
    
    return true;
  };

  const isFieldDisabled = (fieldName) => {
    const permissions = getFieldPermissions(formData.etatSinistreLibelle);
    return !permissions[fieldName]?.allowed;
  };

  const hasFieldWarning = (fieldName) => {
    const permissions = getFieldPermissions(formData.etatSinistreLibelle);
    return permissions[fieldName]?.warning || false;
  };

  useEffect(() => {
    const loadSinistreDetails = async () => {
      try {
        setLoading(true);
        setError('');
        
        console.log('🔍 Chargement du sinistre pour modification:', numSinistre);
        
        const response = await SinistreService.getDetailsSinistre(numSinistre);
        const sinistre = response.data;
        
        console.log('📄 Sinistre chargé:', sinistre);
        setSinistreOriginal(sinistre);
        
        setFormData({
          codeDecl: sinistre.codeDecl || '',
          dateSurv: sinistre.dateSurv || '',
          dateDecl: sinistre.dateDecl || '',
          montoFe: sinistre.montoFe || '',
          refExtSi: sinistre.refExtSi || '',
          natuMala: sinistre.natuMala || '',
          numSinistre: sinistre.numSinistre || '',
          numPolice: sinistre.numPolice || '',
          numAffiliation: sinistre.numAffiliation || '',
          nomCompletAssure: sinistre.nomCompletAssure || '',
          etatSinistreLibelle: sinistre.etatSinistreLibelle || ''
        });
        
        if (!canModifySinistre(sinistre.etatSinistreLibelle)) {
          const etat = sinistre.etatSinistreLibelle?.toUpperCase();
          let message = '';
          
          if (['REGLE', 'RÉGLÉ'].some(e => etat?.includes(e))) {
            message = `Vous n'avez pas le droit de modifier ce sinistre car il est à l'état '${sinistre.etatSinistreLibelle}'. Seule la réouverture du sinistre est possible.`;
          } else if (['REJETE', 'REJETÉ'].some(e => etat?.includes(e))) {
            message = `Vous n'avez pas le droit de modifier ce sinistre car il est à l'état '${sinistre.etatSinistreLibelle}'. Seule la réouverture du sinistre est possible.`;
          } else if (['ANNULE', 'ANNULÉ'].some(e => etat?.includes(e))) {
            message = `Vous n'avez pas le droit de modifier ce sinistre car il est à l'état '${sinistre.etatSinistreLibelle}'. Seule la réouverture du sinistre est possible.`;
          } else if (etat?.includes('SANS_SUITE')) {
            message = `Vous n'avez pas le droit de modifier ce sinistre car il est à l'état '${sinistre.etatSinistreLibelle}'. Seule la réouverture du sinistre est possible.`;
          } else if (etat?.includes('MIGR')) {
            message = `Vous n'avez pas le droit de modifier ce sinistre car il est migré. Consultation uniquement autorisée.`;
          } else {
            message = `Ce sinistre ne peut pas être modifié car il est à l'état "${sinistre.etatSinistreLibelle}".`;
          }
          
          setError(message);
        }
        
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
        setError(SinistreService.handleAPIError(error));
      } finally {
        setLoading(false);
      }
    };

    if (numSinistre) {
      loadSinistreDetails();
    }
  }, [numSinistre]);

  const handleInputChange = (field, value) => {
    if (isFieldDisabled(field)) {
      return; 
    }

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
    
    if (!canModifySinistre(formData.etatSinistreLibelle)) {
      const etat = formData.etatSinistreLibelle?.toUpperCase();
      
      let message = '';
      if (['REGLE', 'RÉGLÉ'].some(e => etat?.includes(e))) {
        message = `Vous n'avez pas le droit de modifier ce sinistre car il est à l'état '${formData.etatSinistreLibelle}'. Seule la réouverture du sinistre est possible.`;
      } else if (['REJETE', 'REJETÉ'].some(e => etat?.includes(e))) {
        message = `Vous n'avez pas le droit de modifier ce sinistre car il est à l'état '${formData.etatSinistreLibelle}'. Seule la réouverture du sinistre est possible.`;
      } else if (['ANNULE', 'ANNULÉ'].some(e => etat?.includes(e))) {
        message = `Vous n'avez pas le droit de modifier ce sinistre car il est à l'état '${formData.etatSinistreLibelle}'. Seule la réouverture du sinistre est possible.`;
      } else if (etat?.includes('SANS_SUITE')) {
        message = `Vous n'avez pas le droit de modifier ce sinistre car il est à l'état '${formData.etatSinistreLibelle}'. Seule la réouverture du sinistre est possible.`;
      } else if (etat?.includes('MIGR')) {
        message = `Vous n'avez pas le droit de modifier ce sinistre car il est migré. Consultation uniquement autorisée.`;
      } else {
        message = `Ce sinistre ne peut pas être modifié car il est à l'état "${formData.etatSinistreLibelle}".`;
      }
      
      errors.global = message;
      setValidation(errors);
      return false;
    }
    
    const permissions = getFieldPermissions(formData.etatSinistreLibelle);
    
    if (!permissions.codeDecl.allowed) {
      if (formData.codeDecl !== (sinistreOriginal?.codeDecl || '')) {
        if (formData.etatSinistreLibelle?.toLowerCase().includes('facture')) {
          errors.codeDecl = `Vous n'avez pas le droit de modifier le type de déclaration car le sinistre est en attente de facture.`;
        } else if (formData.etatSinistreLibelle?.toLowerCase().includes('cm')) {
          errors.codeDecl = `Vous n'avez pas le droit de modifier le type de déclaration car le sinistre est en attente de commission médicale.`;
        } else {
          errors.codeDecl = `Vous n'avez pas le droit de modifier le type de déclaration car le sinistre est ${formData.etatSinistreLibelle.toLowerCase()}.`;
        }
      }
    } else {
      if (!formData.codeDecl || !formData.codeDecl.trim()) {
        errors.codeDecl = 'Le type de déclaration est obligatoire';
      }
    }
    
    if (!permissions.dateSurv.allowed) {
      if (formData.dateSurv !== (sinistreOriginal?.dateSurv || '')) {
        if (formData.etatSinistreLibelle?.toLowerCase().includes('facture')) {
          errors.dateSurv = `Vous n'avez pas le droit de modifier la date de survenance car le sinistre est en attente de facture.`;
        } else if (formData.etatSinistreLibelle?.toLowerCase().includes('cm')) {
          errors.dateSurv = `Vous n'avez pas le droit de modifier la date de survenance car le sinistre est en attente de commission médicale.`;
        } else {
          errors.dateSurv = `Vous n'avez pas le droit de modifier la date de survenance car le sinistre est ${formData.etatSinistreLibelle.toLowerCase()}.`;
        }
      }
    } else {
      if (!formData.dateSurv || !formData.dateSurv.trim()) {
        errors.dateSurv = 'La date de survenance est obligatoire';
      }
      
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (formData.dateSurv && !dateRegex.test(formData.dateSurv)) {
        errors.dateSurv = 'Format de date invalide (AAAA-MM-JJ)';
      }
      
      if (formData.dateSurv) {
        const dateSurv = new Date(formData.dateSurv);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        
        if (dateSurv > today) {
          errors.dateSurv = 'La date de survenance ne peut pas être dans le futur';
        }
      }
    }
    
    if (!permissions.dateDecl.allowed) {
      if (formData.dateDecl !== (sinistreOriginal?.dateDecl || '')) {
        errors.dateDecl = `Vous n'avez pas le droit de modifier la date de déclaration car le sinistre est ${formData.etatSinistreLibelle.toLowerCase()}.`;
      }
    } else {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (formData.dateDecl && formData.dateDecl.trim() && !dateRegex.test(formData.dateDecl)) {
        errors.dateDecl = 'Format de date invalide (AAAA-MM-JJ)';
      }
      
      if (formData.dateSurv && formData.dateDecl) {
        const dateSurv = new Date(formData.dateSurv);
        const dateDecl = new Date(formData.dateDecl);
        
        if (dateDecl < dateSurv) {
          errors.dateDecl = 'La date de déclaration ne peut pas être antérieure à la date de survenance';
        }
      }
    }
    
    if (!permissions.montoFe.allowed) {
      if (formData.montoFe !== (sinistreOriginal?.montoFe || '')) {
        if (formData.etatSinistreLibelle?.toLowerCase().includes('facture')) {
          errors.montoFe = `Vous n'avez pas le droit de modifier les frais engagés car le sinistre est en attente de facture.`;
        } else if (formData.etatSinistreLibelle?.toLowerCase().includes('cm')) {
          errors.montoFe = `Vous n'avez pas le droit de modifier les frais engagés car le sinistre est en attente de commission médicale.`;
        } else {
          errors.montoFe = `Vous n'avez pas le droit de modifier les frais engagés car le sinistre est ${formData.etatSinistreLibelle.toLowerCase()}.`;
        }
      }
    } else {
      if (formData.montoFe && formData.montoFe.trim()) {
        const montant = parseFloat(formData.montoFe);
        if (isNaN(montant) || montant < 0) {
          errors.montoFe = 'Le montant doit être un nombre positif';
        }
      }
    }
    
    if (!permissions.refExtSi.allowed) {
      if (formData.refExtSi !== (sinistreOriginal?.refExtSi || '')) {
        errors.refExtSi = `Vous n'avez pas le droit de modifier la référence externe car le sinistre est ${formData.etatSinistreLibelle.toLowerCase()}.`;
      }
    }
    
    if (!permissions.natuMala.allowed) {
      if (formData.natuMala !== (sinistreOriginal?.natuMala || '')) {
        errors.natuMala = `Vous n'avez pas le droit de modifier la nature de la maladie car le sinistre est ${formData.etatSinistreLibelle.toLowerCase()}.`;
      }
    }
    
    setValidation(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!canModifySinistre(formData.etatSinistreLibelle)) {
      const etat = formData.etatSinistreLibelle?.toUpperCase();
      let message = '';
      
      if (['REGLE', 'RÉGLÉ'].some(e => etat?.includes(e))) {
        message = `Vous n'avez pas le droit de modifier ce sinistre car il est à l'état '${formData.etatSinistreLibelle}'. Seule la réouverture du sinistre est possible.`;
      } else if (['REJETE', 'REJETÉ'].some(e => etat?.includes(e))) {
        message = `Vous n'avez pas le droit de modifier ce sinistre car il est à l'état '${formData.etatSinistreLibelle}'. Seule la réouverture du sinistre est possible.`;
      } else if (['ANNULE', 'ANNULÉ'].some(e => etat?.includes(e))) {
        message = `Vous n'avez pas le droit de modifier ce sinistre car il est à l'état '${formData.etatSinistreLibelle}'. Seule la réouverture du sinistre est possible.`;
      } else if (etat?.includes('SANS_SUITE')) {
        message = `Vous n'avez pas le droit de modifier ce sinistre car il est à l'état '${formData.etatSinistreLibelle}'. Seule la réouverture du sinistre est possible.`;
      } else if (etat?.includes('MIGR')) {
        message = `Vous n'avez pas le droit de modifier ce sinistre car il est migré. Consultation uniquement autorisée.`;
      } else {
        message = `Ce sinistre à l'état "${formData.etatSinistreLibelle}" ne peut pas être modifié.`;
      }
      
      setError(message);
      console.log('🚨 TENTATIVE DE MODIFICATION BLOQUÉE:', message);
      return;
    }
    
    if (!validateForm()) {
      setError(validation.global || 'Veuillez corriger les erreurs dans le formulaire');
      return;
    }
    
    setSaving(true);
    setError('');
    setSuccessMessage('');
    
    try {
      console.log('💾 Modification du sinistre:', numSinistre, formData);
      
      const modificationData = {
        codeDecl: formData.codeDecl.trim(),
        dateSurv: formData.dateSurv.trim(),
        dateDecl: formData.dateDecl && formData.dateDecl.trim() ? formData.dateDecl.trim() : null,
        montoFe: formData.montoFe && formData.montoFe.trim() ? formData.montoFe.trim() : null,
        refExtSi: formData.refExtSi && formData.refExtSi.trim() ? formData.refExtSi.trim() : null,
        natuMala: formData.natuMala && formData.natuMala.trim() ? formData.natuMala.trim() : null
      };
      
      console.log('📤 Données à envoyer:', modificationData);
      
      const response = await SinistreService.modifierSinistre(numSinistre, modificationData);
      
      console.log('✅ Réponse de modification:', response);
      
      if (response.data && response.data.etatSinistreLibelle) {
        const etatOriginal = formData.etatSinistreLibelle?.toUpperCase();
        const nouvelEtat = response.data.etatSinistreLibelle?.toUpperCase();
        
        if (etatOriginal !== nouvelEtat) {
          console.log('🚨 ALERTE : État changé de', etatOriginal, 'vers', nouvelEtat);
          
          const etatsInterdits = ['REGLE', 'REJETE', 'ANNULE', 'SANS_SUITE', 'MIGRE', 'RÉGLÉ', 'REJETÉ', 'ANNULÉ'];
          if (etatsInterdits.some(e => etatOriginal?.includes(e)) && nouvelEtat?.includes('OUVERT')) {
            setError(`ERREUR CRITIQUE : Le sinistre a changé d'état de "${formData.etatSinistreLibelle}" vers "${response.data.etatSinistreLibelle}". Cette opération est interdite.`);
            return;
          }
        }
      }
      
      setSuccessMessage(response.message || 'Sinistre modifié avec succès !');
      
      if (response.data) {
        setSinistreOriginal(response.data);
        
        setFormData(prev => ({
          ...prev,
          ...response.data
        }));
      }
      
      setTimeout(() => {
        navigate(`/consultation/sinistres/${numSinistre}/details`);
      }, 2000);
      
    } catch (error) {
      console.error('❌ Erreur lors de la modification:', error);
      const errorMessage = SinistreService.handleAPIError(error);
      setError(errorMessage);
      
      if (errorMessage.includes('ne peut pas être modifié') || 
          errorMessage.includes('réouverture est possible') ||
          errorMessage.includes('consultation uniquement')) {
        setTimeout(() => {
          navigate(`/consultation/sinistres/${numSinistre}/details`);
        }, 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/consultation/sinistres/${numSinistre}/details`);
  };

  const handleViewDetails = () => {
    navigate(`/consultation/sinistres/${numSinistre}/details`);
  };

  const hasChanges = () => {
    if (!sinistreOriginal || !canModifySinistre(formData.etatSinistreLibelle)) return false;
    
    return (
      formData.codeDecl !== (sinistreOriginal.codeDecl || '') ||
      formData.dateSurv !== (sinistreOriginal.dateSurv || '') ||
      formData.dateDecl !== (sinistreOriginal.dateDecl || '') ||
      formData.montoFe !== (sinistreOriginal.montoFe || '') ||
      formData.refExtSi !== (sinistreOriginal.refExtSi || '') ||
      formData.natuMala !== (sinistreOriginal.natuMala || '')
    );
  };

  const getStatusIcon = (etat) => {
    switch (etat?.toLowerCase()) {
      case 'ouvert':
      case 'en cours':
        return <Clock className="status-icon" />;
      case 'clôturé':
      case 'cloture':
      case 'reglé':
      case 'réglé':
        return <CheckCircle className="status-icon" />;
      case 'rejeté':
      case 'rejete':
      case 'annulé':
      case 'annule':
        return <AlertCircle className="status-icon" />;
      default:
        return <FileText className="status-icon" />;
    }
  };

  const formatMontant = (montant) => {
    if (!montant) return '';
    const num = parseFloat(montant);
    return isNaN(num) ? montant : num.toFixed(2);
  };

  if (loading) {
    return (
      <div className={`modifier-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="loading-state">
          <RefreshCw className="loading-spinner" />
          <div className="loading-content">
            <h3>Chargement du sinistre...</h3>
            <p>Veuillez patienter pendant que nous récupérons les informations.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !sinistreOriginal) {
    return (
      <div className={`modifier-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="page-header">
          <button onClick={() => navigate('/consultation/sinistres')} className="btn btn-secondary">
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
        <span onClick={() => navigate('/consultation/sinistres')} className="breadcrumb-link">Accueil</span>
        <span className="separator">›</span>
        <span onClick={() => navigate('/consultation/sinistres')} className="breadcrumb-link">Consulter</span>
        <span className="separator">›</span>
        <span onClick={handleViewDetails} className="breadcrumb-link">Détails</span>
        <span className="separator">›</span>
        <span className="current">Modifier</span>
      </nav>

      <div className="modifier-header">
        <div className="header-main">
          <h1 className="page-title">
            <User className="title-icon" />
            Modifier Sinistre
          </h1>
          <div className="status-container">
            {getStatusIcon(formData.etatSinistreLibelle)}
            <span className={`status-badge ${
              formData.etatSinistreLibelle === 'OUVERT' 
                ? 'status-open' 
                : formData.etatSinistreLibelle === 'CLÔTURÉ' || formData.etatSinistreLibelle === 'CLOTURE'
                ? 'status-closed'
                : formData.etatSinistreLibelle === 'EN COURS'
                ? 'status-progress'
                : 'status-default'
            }`}>
              {formData.etatSinistreLibelle || 'N/A'}
            </span>
          </div>
        </div>
        
        <div className="header-summary">
          <div className="summary-item">
            <span className="summary-label">N° Sinistre</span>
            <span className="summary-value">{formData.numSinistre}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Assuré</span>
            <span className="summary-value">{formData.nomCompletAssure}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Police</span>
            <span className="summary-value">{formData.numPolice}</span>
          </div>
        </div>
      </div>

      {!canModifySinistre(formData.etatSinistreLibelle) && (
        <div className="alert alert-error">
          <AlertCircle className="alert-icon" />
          {(() => {
            const etat = formData.etatSinistreLibelle?.toUpperCase();
            if (['REGLE', 'RÉGLÉ'].some(e => etat?.includes(e))) {
              return `Vous n'avez pas le droit de modifier ce sinistre car il est à l'état '${formData.etatSinistreLibelle}'. Seule la réouverture du sinistre est possible.`;
            } else if (['REJETE', 'REJETÉ'].some(e => etat?.includes(e))) {
              return `Vous n'avez pas le droit de modifier ce sinistre car il est à l'état '${formData.etatSinistreLibelle}'. Seule la réouverture du sinistre est possible.`;
            } else if (['ANNULE', 'ANNULÉ'].some(e => etat?.includes(e))) {
              return `Vous n'avez pas le droit de modifier ce sinistre car il est à l'état '${formData.etatSinistreLibelle}'. Seule la réouverture du sinistre est possible.`;
            } else if (etat?.includes('SANS_SUITE')) {
              return `Vous n'avez pas le droit de modifier ce sinistre car il est à l'état '${formData.etatSinistreLibelle}'. Seule la réouverture du sinistre est possible.`;
            } else if (etat?.includes('MIGR')) {
              return `Vous n'avez pas le droit de modifier ce sinistre car il est migré. Consultation uniquement autorisée.`;
            } else {
              return `Ce sinistre ne peut pas être modifié car il est à l'état "${formData.etatSinistreLibelle}".`;
            }
          })()}
        </div>
      )}

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
              <h3>Informations Générales</h3>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label required">
                  Type Déclaration *
                  {hasFieldWarning('codeDecl') && (
                    <AlertTriangle className="warning-icon" title="Attention: modification limitée pour cet état" />
                  )}
                </label>
                <select
                  value={formData.codeDecl}
                  onChange={(e) => handleInputChange('codeDecl', e.target.value)}
                  className={`form-input ${validation.codeDecl ? 'error' : ''} ${
                    isFieldDisabled('codeDecl') ? 'disabled' : ''
                  } ${hasFieldWarning('codeDecl') ? 'warning' : ''}`}
                  disabled={isFieldDisabled('codeDecl') || loadingTypes}
                  title={isFieldDisabled('codeDecl') ? `Champ non modifiable pour l'état "${formData.etatSinistreLibelle}"` : ''}
                >
                  <option value="">-- Sélectionner --</option>
                  {typesDeclaration.map(type => (
                    <option key={type.code} value={type.code}>
                      {type.code} - {type.libelle}
                    </option>
                  ))}
                </select>
                {validation.codeDecl && (
                  <span className="error-message">{validation.codeDecl}</span>
                )}
                {hasFieldWarning('codeDecl') && !validation.codeDecl && (
                  <span className="warning-message">⚠️ WARNING: Modification du type de déclaration pour sinistre EN_COURS_CHIFFRAGE</span>
                )}
              </div>
              
              <div className="form-group">
                <label className="form-label required">Date Survenance *</label>
                <input
                  type="date"
                  value={formData.dateSurv}
                  onChange={(e) => handleInputChange('dateSurv', e.target.value)}
                  className={`form-input ${validation.dateSurv ? 'error' : ''} ${
                    isFieldDisabled('dateSurv') ? 'disabled' : ''
                  }`}
                  max={new Date().toISOString().split('T')[0]}
                  disabled={isFieldDisabled('dateSurv')}
                  title={isFieldDisabled('dateSurv') ? `Champ non modifiable pour l'état "${formData.etatSinistreLibelle}"` : ''}
                />
                {validation.dateSurv && (
                  <span className="error-message">{validation.dateSurv}</span>
                )}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date Déclaration</label>
                <input
                  type="date"
                  value={formData.dateDecl}
                  onChange={(e) => handleInputChange('dateDecl', e.target.value)}
                  className={`form-input ${validation.dateDecl ? 'error' : ''} ${
                    isFieldDisabled('dateDecl') ? 'disabled' : ''
                  }`}
                  max={new Date().toISOString().split('T')[0]}
                  disabled={isFieldDisabled('dateDecl')}
                  title={isFieldDisabled('dateDecl') ? `Champ non modifiable pour l'état "${formData.etatSinistreLibelle}"` : ''}
                />
                {validation.dateDecl && (
                  <span className="error-message">{validation.dateDecl}</span>
                )}
              </div>
              
              <div className="form-group">
                <label className="form-label">Référence Externe</label>
                <input
                  type="text"
                  value={formData.refExtSi}
                  onChange={(e) => handleInputChange('refExtSi', e.target.value)}
                  className={`form-input ${
                    isFieldDisabled('refExtSi') ? 'disabled' : ''
                  }`}
                  placeholder="Référence externe du sinistre"
                  maxLength="50"
                  disabled={isFieldDisabled('refExtSi')}
                  title={isFieldDisabled('refExtSi') ? `Champ non modifiable pour l'état "${formData.etatSinistreLibelle}"` : ''}
                />
                {validation.refExtSi && (
                  <span className="error-message">{validation.refExtSi}</span>
                )}
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <Stethoscope className="section-icon" />
              <h3>Informations Médicales</h3>
            </div>
            
            <div className="form-row">
              <div className="form-group full-width">
                <label className="form-label">
                  Nature de la Maladie
                  {hasFieldWarning('natuMala') && (
                    <AlertTriangle className="warning-icon" title="Attention: modification limitée pour cet état" />
                  )}
                </label>
                <textarea
                  value={formData.natuMala}
                  onChange={(e) => handleInputChange('natuMala', e.target.value)}
                  className={`form-textarea ${
                    isFieldDisabled('natuMala') ? 'disabled' : ''
                  } ${hasFieldWarning('natuMala') ? 'warning' : ''}`}
                  placeholder="Décrivez la nature de la maladie ou du traitement..."
                  rows="3"
                  maxLength="500"
                  disabled={isFieldDisabled('natuMala')}
                  title={isFieldDisabled('natuMala') ? `Champ non modifiable pour l'état "${formData.etatSinistreLibelle}"` : ''}
                />
                {validation.natuMala && (
                  <span className="error-message">{validation.natuMala}</span>
                )}
                {hasFieldWarning('natuMala') && !validation.natuMala && (
                  <span className="warning-message">⚠️ WARNING: Modification de la nature de maladie pour sinistre EN_ATTENTE_CM</span>
                )}
                <div className="char-counter">
                  {formData.natuMala ? formData.natuMala.length : 0}/500
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <DollarSign className="section-icon" />
              <h3>Informations Financières</h3>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Montant Frais Engagés (DH)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.montoFe}
                  onChange={(e) => handleInputChange('montoFe', e.target.value)}
                  className={`form-input ${validation.montoFe ? 'error' : ''} ${
                    isFieldDisabled('montoFe') ? 'disabled' : ''
                  }`}
                  placeholder="0.00"
                  disabled={isFieldDisabled('montoFe')}
                  title={isFieldDisabled('montoFe') ? `Champ non modifiable pour l'état "${formData.etatSinistreLibelle}"` : ''}
                />
                {validation.montoFe && (
                  <span className="error-message">{validation.montoFe}</span>
                )}
                {formData.montoFe && !validation.montoFe && (
                  <span className="help-text">
                    Montant: {formatMontant(formData.montoFe)} DH
                  </span>
                )}
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
                <label>N° Police</label>
                <span>{formData.numPolice || 'N/A'}</span>
              </div>
              <div className="readonly-item">
                <label>N° Affiliation</label>
                <span>{formData.numAffiliation || 'N/A'}</span>
              </div>
              <div className="readonly-item">
                <label>Nom Complet Assuré</label>
                <span>{formData.nomCompletAssure || 'N/A'}</span>
              </div>
              <div className="readonly-item">
                <label>État Sinistre</label>
                <span>{formData.etatSinistreLibelle || 'N/A'}</span>
              </div>
              <div className="readonly-item">
                <label>Type Déclaration</label>
                <span>
                  {formData.codeDecl ? 
                    `${formData.codeDecl} - ${typesDeclaration.find(t => t.code === formData.codeDecl)?.libelle || formData.codeDecl}` 
                    : 'N/A'
                  }
                </span>
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
            disabled={saving || !hasChanges() || !canModifySinistre(formData.etatSinistreLibelle)}
            className="btn btn-primary"
            title={
              !canModifySinistre(formData.etatSinistreLibelle) 
                ? `Sinistre non modifiable à l'état "${formData.etatSinistreLibelle}"` 
                : !hasChanges() 
                ? 'Aucune modification à sauvegarder' 
                : ''
            }
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

export default ModifierSinistre;