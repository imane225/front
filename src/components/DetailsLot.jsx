import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import lotService from '../services/lotService';
import './ConsultationSinistres.css';
import './DetailsLot.css';

const DetailsLot = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lot, setLot] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDetails();
  }, []);

  const fetchDetails = async () => {
    try {
      const res = await lotService.rechercherParIdLot(id);
      setLot(res.data[0]);
    } catch (err) {
      setError(lotService.handleAPIError(err));
    }
  };

  const handlePrintPDF = () => {
    window.print(); // ✅ utilise la fenêtre d'impression native
  };

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!lot) return <div>Chargement des détails...</div>;

  return (
    <div className="details-container">
      <div className="page-header">
        <h1 className="page-title">Détails du Lot</h1>
      </div>

      <div className="details-actions">
        <button className="btn btn-outline" onClick={handlePrintPDF}>🖨️ Imprimer</button>
        <button className="btn btn-secondary" onClick={() => navigate(`/lots/edit/${lot.id}`)}>✏️ Modifier</button>
      </div>

      <div className="details-grid">
        <div className="card">
          <div className="card-title">Informations Lot</div>
          <div className="card-field"><span className="card-label">Numéro Lot :</span><span className="card-value">{lot.numeroLot}</span></div>
          <div className="card-field"><span className="card-label">Type :</span><span className="card-value">{lot.typeLotId === "1" ? "Interne" : "Externe"}</span></div>
          <div className="card-field"><span className="card-label">Date réception :</span><span className="card-value">{lot.dateReception || "—"}</span></div>
          <div className="card-field"><span className="card-label">Nombre sinistres reçus :</span><span className="card-value">{lot.nombreSinistresRecu}</span></div>
          {lot.typeLotId === "2" && (
            <div className="card-field"><span className="card-label">Nombre sinistres déclarés :</span><span className="card-value">{lot.nombreSinistresDeclare}</span></div>
          )}
        </div>

        <div className="card">
          <div className="card-title">Informations Police</div>
          <div className="card-field"><span className="card-label">Numéro police :</span><span className="card-value">{lot.numeroPolice}</span></div>
          <div className="card-field"><span className="card-label">État police :</span><span className="card-value">{lot.refEtatPoliceLibelle || "—"}</span></div>
          <div className="card-field"><span className="card-label">Date état police :</span><span className="card-value">{lot.dateEtatPolice || "—"}</span></div>
        </div>

        <div className="card">
          <div className="card-title">Informations Client / Apporteur</div>
          <div className="card-field"><span className="card-label">Client :</span><span className="card-value">{lot.raisonSocialeClient}</span></div>
          <div className="card-field"><span className="card-label">Code apporteur :</span><span className="card-value">{lot.codeApporteur || "—"}</span></div>
          <div className="card-field"><span className="card-label">Raison sociale apporteur :</span><span className="card-value">{lot.raisonSocialeApporteur || "—"}</span></div>
          <div className="card-field"><span className="card-label">État du lot :</span><span className="card-value">{lot.refEtatLibelle || "—"}</span></div>
          <div className="card-field"><span className="card-label">Date état lot :</span><span className="card-value">{lot.dateEtat || "—"}</span></div>
        </div>
      </div>
    </div>
  );
};

export default DetailsLot;
