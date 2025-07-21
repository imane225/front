import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import lotService from '../services/lotService';
import './ConsultationSinistres.css';

const EditLot = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    numeroLot: '',
    numeroPolice: '',
    typeLotId: '',
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

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchLot();
  }, []);

  const fetchLot = async () => {
    try {
      const res = await lotService.rechercherParIdLot(id);
      const lot = res.data[0];

      setFormData({
        numeroLot: lot.numeroLot || '',
        numeroPolice: lot.numeroPolice || '',
        typeLotId: lot.typeLotId || '',
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
        nombreReactivation: lot.nombreReactivation || 0
      });
    } catch (err) {
      setError(lotService.handleAPIError(err));
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const lotToSend = {
      id: Number(id),
      numeroLot: formData.numeroLot,
      numeroPolice: formData.numeroPolice,
      typeLotId: formData.typeLotId,
      nombreSinistresRecu: parseInt(formData.nombreSinistresRecu || '0'),
      nombreSinistresDeclare: formData.typeLotId === '2' ? parseInt(formData.nombreSinistresDeclare || '0') : null,
      dateReception: formData.dateReception,
      raisonSocialeClient: formData.raisonSocialeClient || '',
      codeApporteur: formData.codeApporteur || '',
      raisonSocialeApporteur: formData.raisonSocialeApporteur || '',
      refEtatPoliceLibelle: formData.refEtatPoliceLibelle || '',
      dateEtatPolice: formData.dateEtatPolice || '',
      refEtatLibelle: formData.refEtatLibelle || '',
      dateEtat: formData.dateEtat || '' ,
      motifModifAnnul: formData.motifModifAnnul || '' 
    };

    console.log('📦 Payload envoyé pour modification:', lotToSend);

    try {
      await lotService.modifierLot(id, lotToSend);
      setSuccess('✅ Lot mis à jour avec succès');
      setTimeout(() => navigate(`/lots/details/${id}`), 1500);
    } catch (err) {
      setError(lotService.handleAPIError(err));
    }
  };

  return (
    <div className="details-container">
      <div className="page-header">
        <h1 className="page-title">Modifier le Lot</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="form-grid form-grid-2">
        <div className="form-group">
  <label>Motif de modification</label>
  <input
    type="text"
    name="motifModifAnnul"
    value={formData.motifModifAnnul}
    onChange={handleChange}
    className="form-input"
    placeholder="Saisir un motif"
    required
  />
</div>
        <div className="form-group">
          <label>Numéro police</label>
          <input
            type="text"
            name="numeroPolice"
            value={formData.numeroPolice}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Nombre de sinistres reçus</label>
          <input
            type="number"
            name="nombreSinistresRecu"
            value={formData.nombreSinistresRecu}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Nombre de sinistres ouverts</label>
          <input
            type="number"
            name="nombreOuverture"
            value={formData.nombreOuverture}
            readOnly
            className="form-input read-only"
          />
        </div>

        <div className="form-group">
          <label>Nombre de sinistres réactivés</label>
          <input
            type="number"
            name="nombreReactivation"
            value={formData.nombreReactivation}
            readOnly
            className="form-input read-only"
          />
        </div>
      </div>

      <div className="form-actions">
        <button className="btn btn-primary" onClick={handleSubmit}>
          ✅ Valider
        </button>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          ❌ Annuler
        </button>
      </div>
    </div>
  );
};

export default EditLot;
