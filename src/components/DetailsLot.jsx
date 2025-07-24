import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  Calendar, 
  Building,
  Users,
  Hash,
  Info,
  Edit,
  Printer,
  AlertCircle,
  Loader,
  Plus,
  Minus
} from 'lucide-react';
import lotService from '../services/lotService';
import './ConsultationSinistres.css';
import './DetailsLot.css';

const DetailsLot = ({ sidebarCollapsed = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lot, setLot] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    general: true,
    police: true,
    client: true
  });

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError('');
        
        console.log('🔍 Chargement des détails pour le lot:', id);
        
        const res = await lotService.rechercherParIdLot(id);
        console.log('📋 Données reçues:', res.data);
        setLot(res.data[0]);
        
      } catch (err) {
        console.error('❌ Erreur lors du chargement des détails:', err);
        setError(lotService.handleAPIError(err));
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDetails();
    }
  }, [id]);

  const handleBack = () => {
    navigate('/lots');
  };

  const handleModifier = () => {
    navigate(`/lots/edit/${lot.id}`);
  };

  const handlePrintPDF = () => {
    window.print();
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
            <p>Veuillez patienter pendant que nous récupérons les informations du lot.</p>
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

  if (!lot) {
    return (
      <div className={`details-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="empty-state">
          <h3>Lot non trouvé</h3>
          <p>Le lot demandé n'existe pas ou n'est pas accessible.</p>
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
        <span className="current">Détails Lot</span>
      </nav>

      <div className="details-header">
        <div className="header-main">
          <h1 className="page-title">
            Lot {lot.numeroLot}
          </h1>
          <div className="status-container">
            <span className="status-badge status-default">
              {lot.refEtatLibelle || 'N/A'}
            </span>
          </div>
        </div>
        
        <div className="header-summary">
          <div className="summary-item">
            <span className="summary-label">Client</span>
            <span className="summary-value">{lot.raisonSocialeClient}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Date Réception</span>
            <span className="summary-value">{formatDate(lot.dateReception)}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Type</span>
            <span className="summary-value">{lot.typeLotId === "1" ? "Interne" : "Externe"}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Sinistres Reçus</span>
            <span className="summary-value">{lot.nombreSinistresRecu}</span>
          </div>
        </div>

        <div className="header-actions">
          <button onClick={handlePrintPDF} className="btn btn-outline">
            <Printer className="btn-icon" />
            Imprimer
          </button>
          
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
          badgeText={lot.typeLotId === "1" ? "Interne" : "Externe"}
        >
          <div className="info-grid">
            <InfoItem label="NUMÉRO LOT" value={lot.numeroLot} important />
            <InfoItem label="TYPE LOT" value={lot.typeLotId === "1" ? "Interne" : "Externe"} />
            <InfoItem label="DATE RÉCEPTION" value={formatDate(lot.dateReception)} important />
            <InfoItem label="NOMBRE SINISTRES REÇUS" value={lot.nombreSinistresRecu} />
            {lot.typeLotId === "2" && (
              <InfoItem label="NOMBRE SINISTRES DÉCLARÉS" value={lot.nombreSinistresDeclare} />
            )}
            <InfoItem label="ÉTAT DU LOT" value={lot.refEtatLibelle} />
            <InfoItem label="DATE ÉTAT LOT" value={formatDate(lot.dateEtat)} />
          </div>
        </ExpandableCard>

        <ExpandableCard 
          title="Informations Police" 
          icon={Building} 
          sectionKey="police"
          badgeText={lot.numeroPolice}
        >
          <div className="info-grid">
            <InfoItem label="NUMÉRO POLICE" value={lot.numeroPolice} important />
            <InfoItem label="ÉTAT POLICE" value={lot.refEtatPoliceLibelle} />
            <InfoItem label="DATE ÉTAT POLICE" value={formatDate(lot.dateEtatPolice)} />
          </div>
        </ExpandableCard>

        <ExpandableCard 
          title="Informations Client / Apporteur" 
          icon={Users} 
          sectionKey="client"
          badgeText={lot.raisonSocialeClient}
        >
          <div className="info-grid">
            <InfoItem label="CLIENT" value={lot.raisonSocialeClient} important />
            <InfoItem label="CODE APPORTEUR" value={lot.codeApporteur} />
            <InfoItem label="RAISON SOCIALE APPORTEUR" value={lot.raisonSocialeApporteur} />
          </div>
          
          <details className="debug-section">
            <summary>🔍 Données brutes (Debug)</summary>
            <pre className="debug-data">
              {JSON.stringify(lot, null, 2)}
            </pre>
          </details>
        </ExpandableCard>
      </div>
    </div>
  );
};

export default DetailsLot;