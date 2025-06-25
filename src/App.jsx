import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RMANavbar from './components/RMANavbar.jsx';
import RMASidebar from './components/RMASidebar.jsx';
import ConsultationSinistres from './components/ConsultationSinistres.jsx';
import DetailsSinistre from './components/DetailsSinistre';
import ModifierSinistre from './components/ModifierSinistre';
import CreerSinistre from './components/CreerSinistre';

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-white">
        <RMANavbar isSidebarCollapsed={isSidebarCollapsed} />
        
        <div className="flex">
          <RMASidebar 
            isCollapsed={isSidebarCollapsed} 
            onToggle={setIsSidebarCollapsed} 
          />
          <div className={`flex-1 transition-all duration-300 ${
            isSidebarCollapsed ? 'ml-16' : 'ml-64'
          }`}>
            <Routes>
             
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
              
              <Route 
                path="/" 
                element={<ConsultationSinistres sidebarCollapsed={isSidebarCollapsed} />} 
              />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;