import React from 'react';
import './DashboardRMA.css';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, DollarSign, Activity, FileText, Users, Calendar } from 'lucide-react';

const dataSinistres = [
  { year: '2018', value: 6000 },
  { year: '2019', value: 5800 },
  { year: '2020', value: 3000 },
  { year: '2021', value: 1200 },
  { year: '2022', value: 900 },
  { year: '2023', value: 800 },
];

const recentActivities = [
  { user: 'S0001494', action: 'Création du sinistre N° 20250500001', date: '20 mai 2025', statut: 'Info' },
  { user: 'S0001494', action: 'Mise à jour de l\'avatar utilisateur', date: '12 juin 2025', statut: 'Info' },
  { user: 'S0001494', action: 'Déclaration sinistre pour Num 132', date: '15 mai 2025', statut: 'Info' },
];

const DashboardRMA = ({ sidebarCollapsed }) => {
  return (
    <div className={`dashboard-container ${sidebarCollapsed ? 'collapsed' : 'open'}`}>
      {/* Header avec titre principal */}
      <div className="dashboard-header">
        <h1 className="main-title">Vue d'ensemble</h1>
        <p className="subtitle">Tableau de bord des sinistres et indicateurs clés</p>
      </div>

      {/* Cartes de statistiques principales */}
      <div className="stats-section">
        <div className="dashboard-cards">
          <div className="card stats-card">
            <div className="card-icon">
              <FileText size={24} />
            </div>
            <div className="card-content">
              <h3 className="card-title">Sinistres reçus</h3>
              <p className="card-value">13 127 738</p>
              <span className="card-trend positive">+2.5% ce mois</span>
            </div>
          </div>
          
          <div className="card stats-card">
            <div className="card-icon">
              <Users size={24} />
            </div>
            <div className="card-content">
              <h3 className="card-title">Total lot</h3>
              <p className="card-value">2 164 750</p>
              <span className="card-trend positive">+1.2% ce mois</span>
            </div>
          </div>
          
          <div className="card stats-card">
            <div className="card-icon">
              <Activity size={24} />
            </div>
            <div className="card-content">
              <h3 className="card-title">Taux d'activité</h3>
              <p className="card-value">41%</p>
              <span className="card-trend neutral">Stable</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section Indicateurs Financiers */}
      <div className="section">
        <h2 className="section-title">Indicateurs Financiers</h2>
        <div className="dashboard-cards">
          <div className="card financial-card">
            <div className="card-icon financial">
              <DollarSign size={24} />
            </div>
            <div className="card-content">
              <h3 className="card-title">Capital Net de Contribution</h3>
              <p className="card-value">7030.5M MAD</p>
              <span className="card-change">+3.8% vs mois précédent</span>
            </div>
          </div>
          
          <div className="card financial-card">
            <div className="card-icon financial">
              <TrendingUp size={24} />
            </div>
            <div className="card-content">
              <h3 className="card-title">Montant Brut Total</h3>
              <p className="card-value">7221.0M MAD</p>
              <span className="card-change">+2.1% vs mois précédent</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section Analyse des Sinistres */}
      <div className="section">
        <h2 className="section-title">Analyse des Sinistres</h2>
        <div className="chart-container">
          <div className="chart-header">
            <h3 className="chart-title">Évolution des sinistres par année</h3>
            <p className="chart-subtitle">Nombre de sinistres traités de 2018 à 2023</p>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={dataSinistres} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#234585" />
                  <stop offset="100%" stopColor="#1a3660" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="year" 
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="value" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Section Activités Récentes */}
      <div className="section">
        <h2 className="section-title">Activités Récentes</h2>
        <div className="table-container">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>
                  <div className="th-content">
                    <Users size={16} />
                    Utilisateur
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    <Activity size={16} />
                    Action
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    <Calendar size={16} />
                    Date
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    <FileText size={16} />
                    Statut
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {recentActivities.map((row, i) => (
                <tr key={i}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar">{row.user.charAt(0)}</div>
                      <span>{row.user}</span>
                    </div>
                  </td>
                  <td className="action-cell">{row.action}</td>
                  <td className="date-cell">{row.date}</td>
                  <td>
                    <span className="badge">{row.statut}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardRMA;