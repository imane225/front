import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  User, 
  FileText, 
  Calendar, 
  MapPin,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  Download,
  Plus,
  Minus,
  Building,
  CreditCard,
  Stethoscope,
  Users,
  Hash,
  Info,
  Edit,
  FileCheck,
  FileX,
  FileQuestion,
  Loader
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import SinistreService from '../services/sinistreService';
import './DetailsSinistre.css';

const DetailsSinistre = ({ sidebarCollapsed = false }) => {
  const { numSinistre } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sinistreDetails, setSinistreDetails] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    general: true,
    assure: true,
    medical: true,
    financier: false,
    technique: false,
    dates: false
  });
  const [isGeneratingDocument, setIsGeneratingDocument] = useState(false);

 const DOCUMENT_BUTTONS = {
  "3": { 
    label: "Lettre de rejet", 
    icon: FileX, 
    color: "bg-[#D32F2F]", 
    hoverColor: "bg-[#B71C1C]", 
    type: "REJET" 
  },
  "4": { 
    label: "Décompte", 
    icon: FileCheck, 
    color: "bg-[#388E3C]", 
    hoverColor: "bg-[#2E7D32]", 
    type: "DECOMPTE" 
  },
  "6": { 
    label: "Lettre complement", 
    icon: FileQuestion, 
    color: "bg-[#FB8C00]", 
    hoverColor: "bg-[#F57C00]", 
    type: "COMPLEMENT" 
  },
  "8": { 
    label: "Convocation CV", 
    icon: Stethoscope, 
    color: "bg-[#7B1FA2]", 
    hoverColor: "bg-[#6A1B9A]", 
    type: "CONTRE_VISITE" 
  },
  "11": { 
    label: "Lettre d'accord", 
    icon: CheckCircle, 
    color: "bg-[#1976D2]", 
    hoverColor: "bg-[#1565C0]", 
    type: "ACCORD" 
  }
};

  useEffect(() => {
    const loadSinistreDetails = async () => {
      try {
        setLoading(true);
        setError('');
        
        console.log('🔍 Chargement des détails pour:', numSinistre);
        
        const response = await SinistreService.getDetailsSinistre(numSinistre);
        console.log('📋 Données reçues:', response.data);
        setSinistreDetails(response.data);
        
      } catch (error) {
        console.error('❌ Erreur lors du chargement des détails:', error);
        setError(SinistreService.handleAPIError(error));
      } finally {
        setLoading(false);
      }
    };

    if (numSinistre) {
      loadSinistreDetails();
    }
  }, [numSinistre]);

  const handleBack = () => {
    navigate('/consultation/sinistres');
  };

  const handleModifier = () => {
    navigate(`/consultation/sinistres/${numSinistre}/modifier`);
  };

  const handleGenerateDocument = async () => {
    if (!sinistreDetails) return;

    const etatCode = sinistreDetails.etatSinistre;
    const buttonConfig = DOCUMENT_BUTTONS[etatCode];

    if (!buttonConfig) {
      setError('Aucun document disponible pour cet état de sinistre');
      return;
    }

    try {
      setIsGeneratingDocument(true);
      setError('');

      console.log('🔄 Génération du document pour le sinistre:', numSinistre);
      console.log('📄 Type de document:', buttonConfig.type);

      const result = await SinistreService.genererDocumentSinistre(
        sinistreDetails.numPolice,
        sinistreDetails.numFiliale,
        sinistreDetails.numAffiliation,
        numSinistre
      );

      SinistreService.downloadBlob(result.blob, result.filename);

      console.log('✅ Document téléchargé avec succès');

    } catch (error) {
      console.error('❌ Erreur génération document:', error);
      setError(`Erreur lors de la génération du document: ${error.message}`);
    } finally {
      setIsGeneratingDocument(false);
    }
  };

  const toggleSection = (sectionName) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
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

  const formatMontant = (montant) => {
    if (!montant) return 'N/A';
    return `${montant} DH`;
  };

  const getStatusIcon = (etat) => {
    switch (etat?.toLowerCase()) {
      case 'ouvert':
      case 'en cours':
        return <Clock className="status-icon" />;
      case 'clôturé':
      case 'cloture':
      case 'reglé':
        return <CheckCircle className="status-icon" />;
      case 'rejeté':
      case 'annulé':
        return <AlertCircle className="status-icon" />;
      default:
        return <FileText className="status-icon" />;
    }
  };

  const getDocumentButton = () => {
    if (!sinistreDetails) return null;

    const etatCode = sinistreDetails.etatSinistre;
    const buttonConfig = DOCUMENT_BUTTONS[etatCode];

    if (!buttonConfig) {
      return null;
    }

    const IconComponent = buttonConfig.icon;

    return (
      <button
        onClick={handleGenerateDocument}
        disabled={isGeneratingDocument}
        className={`document-btn ${buttonConfig.color}`}
      >
        {isGeneratingDocument ? (
          <Loader className="w-4 h-4 loading-icon" />
        ) : (
          <IconComponent className="w-4 h-4" />
        )}
        <span>
          {isGeneratingDocument ? 'Génération...' : buttonConfig.label}
        </span>
        <Download className="w-4 h-4" />
      </button>
    );
  };

  const InfoItem = ({ label, value, important = false }) => (
    <div className="info-item">
      <label>{label}</label>
      <span className={`info-value ${important ? 'primary' : ''}`}>
        {value || 'N/A'}
      </span>
    </div>
  );

  const ExpandableCard = ({ title, icon, children, sectionKey, badgeText = null }) => {
    const IconElement = icon;
    
    return (
      <div className="details-card">
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

  if (loading) {
    return (
      <div className={`details-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <div className="loading-content">
            <h3>Chargement des détails...</h3>
            <p>Veuillez patienter pendant que nous récupérons les informations du sinistre.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`details-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="page-header">
          <button onClick={handleBack} className="btn btn-secondary">
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

  if (!sinistreDetails) {
    return (
      <div className={`details-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="empty-state">
          <h3>Sinistre non trouvé</h3>
          <p>Le sinistre demandé n'existe pas ou n'est pas accessible.</p>
          <button onClick={handleBack} className="btn btn-primary">
            <ArrowLeft className="btn-icon" />
            Retour à la consultation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`details-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <nav className="breadcrumb">
        <span onClick={handleBack} className="breadcrumb-link">Accueil</span>
        <span className="separator">›</span>
        <span onClick={handleBack} className="breadcrumb-link">Consulter</span>
        <span className="separator">›</span>
        <span className="current">Détails Sinistre</span>
      </nav>

      <div className="details-header">
        <div className="header-main">
          <h1 className="page-title">
            Sinistre {sinistreDetails.numSinistreReduit || sinistreDetails.numSinistre}
          </h1>
          <div className="status-container">
            {getStatusIcon(sinistreDetails.etatSinistreLibelle)}
            <span className={`status-badge ${
              sinistreDetails.etatSinistreLibelle === 'OUVERT' 
                ? 'status-open' 
                : sinistreDetails.etatSinistreLibelle === 'CLÔTURÉ' || sinistreDetails.etatSinistreLibelle === 'CLOTURE'
                ? 'status-closed'
                : sinistreDetails.etatSinistreLibelle === 'EN COURS'
                ? 'status-progress'
                : 'status-default'
            }`}>
              {sinistreDetails.etatSinistreLibelle || 'N/A'}
            </span>
          </div>
        </div>
        
        <div className="header-summary">
          <div className="summary-item">
            <span className="summary-label">Assuré</span>
            <span className="summary-value">{sinistreDetails.nomCompletAssure}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Date Survenance</span>
            <span className="summary-value">{formatDate(sinistreDetails.dateSurv)}</span>
          </div>
          {sinistreDetails.montoFe && (
            <div className="summary-item">
              <span className="summary-label">Montant</span>
              <span className="summary-value amount">{formatMontant(sinistreDetails.montoFe)}</span>
            </div>
          )}
        </div>

        <div className="header-actions">
          {getDocumentButton()}
          
          <button onClick={handleModifier} className="btn btn-primary">
            <Edit className="btn-icon" />
            Modifier
          </button>
          
          <button onClick={handleBack} className="btn btn-secondary">
            <ArrowLeft className="btn-icon" />
            Retour à la consultation
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <div>
              <h4 className="text-red-800 font-semibold">Erreur</h4>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="details-grid">
        
        <ExpandableCard 
          title="Informations Générales" 
          icon={FileText} 
          sectionKey="general"
          badgeText={sinistreDetails.typeDeclarationLibelle}
        >
          <div className="info-grid">
            <InfoItem label="N° SINISTRE COMPLET" value={sinistreDetails.numSinistre} important />
            <InfoItem label="N° SINISTRE RÉDUIT" value={sinistreDetails.numSinistreReduit} />
            <InfoItem label="N° POLICE" value={sinistreDetails.numPolice} important />
            <InfoItem label="N° FILIALE" value={sinistreDetails.numFiliale} />
            <InfoItem label="N° complement" value={sinistreDetails.numCompl} />
            <InfoItem label="N° ORDRE" value={sinistreDetails.numOrdre} />
            <InfoItem label="CODE DÉCLARATION" value={sinistreDetails.codeDecl} />
            <InfoItem label="TYPE DÉCLARATION" value={sinistreDetails.typeDeclarationLibelle} />
            <InfoItem label="ÉTAT SINISTRE" value={sinistreDetails.etatSinistreLibelle} />
            <InfoItem label="LIEN PARBE" value={sinistreDetails.lieParbe} />
            <InfoItem label="SINISTRE ARCHIVÉ" value={sinistreDetails.siniArch} />
            <InfoItem label="FAUSSE DÉCLARATION" value={sinistreDetails.fausDecl} />
          </div>
        </ExpandableCard>

        <ExpandableCard 
          title="Informations Assuré" 
          icon={User} 
          sectionKey="assure"
          badgeText={sinistreDetails.numAffiliation}
        >
          <div className="info-grid">
            <InfoItem label="NOM COMPLET" value={sinistreDetails.nomCompletAssure} important />
            <InfoItem label="N° AFFILIATION" value={sinistreDetails.numAffiliation} important />
            <InfoItem label="ADRESSE" value={sinistreDetails.adresseAssure} />
            <InfoItem label="DATE AFFILIATION" value={formatDate(sinistreDetails.dateAffiliation)} />
            <InfoItem label="BÉNÉFICIAIRE" value={sinistreDetails.beneficiaireNom} />
          </div>
        </ExpandableCard>

        <ExpandableCard 
          title="Informations Médicales" 
          icon={Stethoscope} 
          sectionKey="medical"
          badgeText={sinistreDetails.natuMala ? "Pathologie déclarée" : ""}
        >
          <div className="info-grid">
            <InfoItem label="NATURE MALADIE" value={sinistreDetails.natuMala} important />
            <InfoItem label="SPÉCIALITÉ MALADIE" value={sinistreDetails.refSpecialiteMaladieLibelle} />
            <InfoItem label="CODE SPÉCIALITÉ" value={sinistreDetails.codeSpeMa} />
            <InfoItem label="CODE CLINIQUE" value={sinistreDetails.codeClin} />
            <InfoItem label="CODE MÉDECIN" value={sinistreDetails.codeMede} />
            <InfoItem label="RÉFÉRENCE EXTERNE" value={sinistreDetails.refExtSi} />
            <InfoItem label="DOSSIER TRANSFERT" value={sinistreDetails.dossTran} />
          </div>
        </ExpandableCard>

        <ExpandableCard 
          title="Informations Financières" 
          icon={DollarSign} 
          sectionKey="financier"
          badgeText={sinistreDetails.montoFe ? formatMontant(sinistreDetails.montoFe) : ""}
        >
          <div className="info-grid">
            <InfoItem label="FRAIS ENGAGÉS" value={formatMontant(sinistreDetails.montoFe)} important />
            <InfoItem label="MONTANT AVANT SINISTRE" value={formatMontant(sinistreDetails.monAvaSi)} />
            <InfoItem label="ÉTAT RÈGLEMENT" value={sinistreDetails.etatSinistreLibelle} />
          </div>
        </ExpandableCard>

        <ExpandableCard 
          title="Chronologie des Dates" 
          icon={Calendar} 
          sectionKey="dates"
        >
          <div className="info-grid">
            <InfoItem label="DATE SURVENANCE" value={formatDate(sinistreDetails.dateSurv)} important />
            <InfoItem label="DATE DÉCLARATION" value={formatDate(sinistreDetails.dateDecl)} />
            <InfoItem label="DATE OUVERTURE" value={formatDate(sinistreDetails.dateOuve)} />
            <InfoItem label="DATE ENREGISTREMENT" value={formatDate(sinistreDetails.datEnr)} />
          </div>
        </ExpandableCard>

        <ExpandableCard 
          title="Informations Techniques" 
          icon={Info} 
          sectionKey="technique"
        >
          <div className="info-grid">
            <InfoItem label="OBSERVATIONS" value={sinistreDetails.obbseSini} />
            <InfoItem label="TYPE DÉCLARATION (CODE)" value={sinistreDetails.codeDecl} />
            <InfoItem label="RÉFÉRENCE EXTERNE" value={sinistreDetails.refExtSi} />
          </div>
          
          <details className="debug-section">
            <summary>🔍 Données brutes (Debug)</summary>
            <pre className="debug-data">
              {JSON.stringify(sinistreDetails, null, 2)}
            </pre>
          </details>
        </ExpandableCard>
      </div>
    </div>
  );
};

export default DetailsSinistre;