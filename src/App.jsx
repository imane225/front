import React, { useState } from 'react';
import RMANavbar from './components/RMANavbar.jsx';
import RMASidebar from './components/RMASidebar.jsx';
import ConsultationSinistres from './components/ConsultationSinistres.jsx';

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
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
          <ConsultationSinistres />
        </div>
      </div>
    </div>
  );
}

export default App;