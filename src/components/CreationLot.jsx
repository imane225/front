import React, { useState, useEffect } from 'react';
import lotService from '../services/lotService';
import './ConsultationSinistres.css';

const CreationLot = () => {
  const [formData, setFormData] = useState({
    numeroPolice: '',
    typeLotId: '',
    nombreSinistresRecu: '',
    nombreSinistresDeclare: '',
    raisonSocialeClient: '' // champ pour affichage client
  });

  const [infosPolice, setInfosPolice] = useState(null); //  infos récupérées
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

 

  //  Récupération automatique infos police
  useEffect(() => {
    const fetchInfos = async () => {
      if (formData.numeroPolice.length === 10) {
        try {
          const data = await lotService.fetchInfosPolice(formData.numeroPolice);
          const infos = {
            raisonSocialeClient: data.refSouscripteur?.raisonSocial || '',
            codeApporteur: data.refIntermediaireAppCode || '',
            raisonApporteur: data.refIntermediaireApp?.libelleLong || '',
            etatPolice: data.lastEtatContrat?.refEtatContrat?.libelle || '',
            dateEtat: data.lastEtatContrat?.dateEtat || ''
          };
          setInfosPolice(infos);

          // Préremplissage de la raison sociale dans formData
          setFormData(prev => ({
            ...prev,
            raisonSocialeClient: infos.raisonSocialeClient
          }));
        } catch (err) {
          setInfosPolice(null);
        }
      }
    };

    fetchInfos();
  }, [formData.numeroPolice]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreate = async () => {
    setError('');
    setSuccessMessage('');

    try {
      const payload = {
        ...formData,
        nombreSinistresRecu: parseInt(formData.nombreSinistresRecu),
        nombreSinistresDeclare: formData.nombreSinistresDeclare
          ? parseInt(formData.nombreSinistresDeclare)
          : null
      };

      const res = await lotService.createLotInterne(payload);
      setSuccessMessage(` Lot créé avec succès : ${res.data.numeroLot}`);
    } catch (err) {
      setError(lotService.handleAPIError(err));
    }
  };
  return (
    <div className="consultation-container">
      <div className="page-header">
        <h1 className="page-title">Création d’un Lot Sinistre</h1>
      </div>

      <div className="form-container">
        {successMessage && <div className="alert alert-success">{successMessage}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <div className="form-grid form-grid-2">
          <div className="form-group">
            <label>Numéro de Police *</label>
            <input
              type="text"
              name="numeroPolice"
              className="form-input"
              value={formData.numeroPolice}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Type de Lot *</label>
            <select
              name="typeLotId"
              className="form-input"
              value={formData.typeLotId}
              onChange={handleChange}
              required
            >
              <option value="">-- Sélectionner --</option>
              <option value="1">Interne</option>
              <option value="2">Externe</option>
            </select>
          </div>

          <div className="form-group">
            <label>Nombre de sinistres reçus *</label>
            <input
              type="number"
              name="nombreSinistresRecu"
              className="form-input"
              value={formData.nombreSinistresRecu}
              onChange={handleChange}
              required
            />
          </div>

          {formData.typeLotId === '2' && (
            <div className="form-group">
              <label>Nombre de sinistres déclarés *</label>
              <input
                type="number"
                name="nombreSinistresDeclare"
                className="form-input"
                value={formData.nombreSinistresDeclare}
                onChange={handleChange}
              />
            </div>
          )}
        </div>

        {infosPolice && (
          <div className="form-grid form-grid-2 mt-3">
            <div className="form-group">
              <label>Client</label>
              <input className="form-input" value={infosPolice.raisonSocialeClient} disabled />
            </div>
            <div className="form-group">
              <label>Code Apporteur</label>
              <input className="form-input" value={infosPolice.codeApporteur} disabled />
            </div>
            <div className="form-group">
              <label>Raison Sociale Apporteur</label>
              <input className="form-input" value={infosPolice.raisonApporteur} disabled />
            </div>
            <div className="form-group">
              <label>État de la Police</label>
              <input className="form-input" value={infosPolice.etatPolice} disabled />
            </div>
            <div className="form-group">
              <label>Date État Police</label>
              <input className="form-input" value={infosPolice.dateEtat} disabled />
            </div>
          </div>
        )}

        <div className="form-actions">
          <button className="btn btn-primary" onClick={handleCreate}>
            Créer le lot
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreationLot;
