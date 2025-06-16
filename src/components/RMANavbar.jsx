import React, { useState } from 'react';
import { ChevronDown, User, Bell } from 'lucide-react';
import './RMANavbar.css';

const RMANavbar = ({ isSidebarCollapsed = false }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleImageError = (e) => {
    e.target.style.display = 'none';
    const fallback = e.target.nextElementSibling;
    if (fallback) {
      fallback.classList.add('show');
    }
  };

  return (
    <nav className={`rma-navbar ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="rma-navbar-container">
        <div className="rma-navbar-content">
          
          <div className="rma-navbar-logo">
            <a href="/dashboard">
              <img 
                src="/src/assets/RMALogo.png" 
                alt="RMA Logo"
                onError={handleImageError}
              />
             
              <div className="rma-navbar-logo-fallback">
                <div className="rma-navbar-logo-circle">
                  <span>RMA</span>
                </div>
                <div className="rma-navbar-logo-text">
                  <div className="rma-navbar-logo-title">RMA</div>
                  <div className="rma-navbar-logo-subtitle">ROYALE MAROCAINE D'ASSURANCE</div>
                </div>
              </div>
            </a>
          </div>

         
          <div className="rma-navbar-actions">
            
            <button className="rma-navbar-button">
              <Bell size={20} />
            </button>
            
            
            <div className="rma-navbar-user-menu">
              <button 
                className="rma-navbar-user-button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <User size={20} />
                <ChevronDown size={16} />
              </button>
              
              
              {userMenuOpen && (
                <div className="rma-navbar-dropdown">
                  <a href="#">Mon Profil</a>
                  <a href="#">Paramètres</a>
                  <a href="#">Aide</a>
                  <div className="rma-navbar-dropdown-divider"></div>
                  <a href="#" className="danger">Se déconnecter</a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      
      {userMenuOpen && (
        <div 
          className="rma-navbar-overlay" 
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </nav>
  );
};

export default RMANavbar;