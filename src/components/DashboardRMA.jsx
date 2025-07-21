import React from 'react';
import './DashboardRMA.css';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const dataSinistres = [
  { year: '2018', value: 6000 },
  { year: '2019', value: 5800 },
  { year: '2020', value: 3000 },
  { year: '2021', value: 1200 },
  { year: '2022', value: 900 },
  { year: '2023', value: 800 },
];

const recentActivities = [
  { user: 'R0013787', action: 'Création du sinstre N° 20250500001', date: '20 mai 2025', statut: 'Info' },
  { user: 'R0013787', action: 'Mise à jour de l\'avatar utilisateur', date: '12 juin 2025', statut: 'Info' },
  { user: 'R0013787', action: 'Déclaration sinistre pour Num 132', date: '15 mai 2025', statut: 'Info' },
];

const DashboardRMA = ({ sidebarCollapsed }) => {
  return (
    <div className={`dashboard-container ${sidebarCollapsed ? 'collapsed' : 'open'}`}>
      <h2>Vue d'ensemble</h2>
      <div className="dashboard-cards">
        <div className="card">Sinistre  recus <br /><strong>13 127 738</strong></div>
        <div className="card">Total lot<br /><strong>2 164 750</strong></div>
        <div className="card">Taux d'activité<br /><strong>41%</strong></div>
      </div>

      <h2>Indicateurs Financiers</h2>
      <div className="dashboard-cards">
        <div className="card">Capital Net de Contribution<br /><strong>7030.5M MAD</strong></div>
        <div className="card">Montant Brut Total<br /><strong>7221.0M MAD</strong></div>
      </div>

      <h2>Analyse des Sinistres</h2>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dataSinistres}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <h2>Activités Récentes</h2>
      <table className="dashboard-table">
        <thead>
          <tr>
            <th>Utilisateur</th>
            <th>Action</th>
            <th>Date</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          {recentActivities.map((row, i) => (
            <tr key={i}>
              <td>{row.user}</td>
              <td>{row.action}</td>
              <td>{row.date}</td>
              <td><span className="badge">{row.statut}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DashboardRMA;
