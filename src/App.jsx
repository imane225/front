import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// Import des composants
import Accueil from './components/Accueil';
import DashboardRMA from './components/DashboardRMA';
import RMANavbar from './components/RMANavbar.jsx';
import RMASidebar from './components/RMASidebar.jsx';
import ConsultationSinistres from './components/ConsultationSinistres.jsx';
import ConsultationLots from './components/ConsultationLots.jsx'; 
import CreationLot from './components/CreationLot.jsx';
import DetailsLot from './components/DetailsLot';
import EditLot from './components/EditLot';
import DetailsSinistre from './components/DetailsSinistre';
import ModifierSinistre from './components/ModifierSinistre';
import CreerSinistre from './components/CreerSinistre';

function AppContent() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();

  // Déterminer si la sidebar doit être affichée selon la route
  const showSidebar =
    location.pathname.startsWith('/sante') ||
    location.pathname.startsWith('/DashboardRMA') ||
    location.pathname.startsWith('/sinistres') ||
    location.pathname.startsWith('/lots') ||
    location.pathname.startsWith('/consultation');

  return (
    <div className="min-h-screen bg-white">
      <RMANavbar isSidebarCollapsed={isSidebarCollapsed} />

      <div className="flex">
        {showSidebar && (
          <RMASidebar
            isCollapsed={isSidebarCollapsed}
            onToggle={setIsSidebarCollapsed}
          />
        )}

        <div className={`flex-1 transition-all duration-300 ${
          showSidebar ? (isSidebarCollapsed ? 'ml-16' : 'ml-64') : ''
        }`}>
          <Routes>
            {/* Route d'accueil */}
            <Route path="/" element={<Accueil />} />
            
            {/* Routes pour le dashboard santé */}
            <Route 
              path="/sante" 
              element={<DashboardRMA sidebarCollapsed={isSidebarCollapsed} />} 
            />
            
            {/* Routes pour les sinistres */}
            <Route 
              path="/sinistres" 
              element={<ConsultationSinistres sidebarCollapsed={isSidebarCollapsed} />} 
            />
            
            <Route 
              path="/consultation/sinistres" 
              element={<ConsultationSinistres sidebarCollapsed={isSidebarCollapsed} />} 
            />
            
            <Route 
              path="/consultation/sinistres/creer" 
              element={<CreerSinistre sidebarCollapsed={isSidebarCollapsed} />} 
            />
            
            <Route 
              path="/consultation/sinistres/:numSinistre/details" 
              element={<DetailsSinistre sidebarCollapsed={isSidebarCollapsed} />} 
            />
            
            <Route 
              path="/consultation/sinistres/:numSinistre/modifier" 
              element={<ModifierSinistre sidebarCollapsed={isSidebarCollapsed} />} 
            />
            
            {/* Routes pour les lots */}
            <Route 
              path="/lots" 
              element={<ConsultationLots sidebarCollapsed={isSidebarCollapsed} />} 
            />
            
            <Route 
              path="/lots/creation" 
              element={<CreationLot sidebarCollapsed={isSidebarCollapsed} />} 
            />
            
            <Route 
              path="/lots/details/:id" 
              element={<DetailsLot sidebarCollapsed={isSidebarCollapsed} />} 
            />
            
            <Route 
              path="/lots/edit/:id" 
              element={<EditLot sidebarCollapsed={isSidebarCollapsed} />} 
            />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;