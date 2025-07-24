import React, { useState } from 'react';
import { ChevronDown, User, Bell, FolderOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
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

  // Fermer le menu utilisateur quand on clique ailleurs
  const handleOverlayClick = () => {
    setUserMenuOpen(false);
  };

  return (
    <>
      <nav className={`rma-navbar ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="rma-navbar-container">
          <div className="rma-navbar-content">
            <div className="rma-navbar-logo">
              <a href="/">
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
              {/* Cloche notification */}
              <button className="rma-navbar-button" title="Notifications">
                <Bell size={18} />
                {/* Badge de notification (optionnel) */}
                <div className="rma-navbar-button-badge"></div>
              </button>

              {/* Menu utilisateur */}
              <div className="rma-navbar-user-menu">
                <button 
                  className="rma-navbar-user-button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  title="Menu utilisateur"
                >
                  <div className="rma-navbar-user-icon">
                    <User size={14} />
                  </div>
                  <span className="rma-navbar-user-chevron">
                    <ChevronDown size={14} />
                  </span>
                </button>

                {userMenuOpen && (
                  <div className="rma-navbar-dropdown">
                    <div className="rma-navbar-dropdown-header">
                      <div className="rma-navbar-dropdown-user-name">Utilisateur</div>
                      <div className="rma-navbar-dropdown-user-email">user@rma.ma</div>
                    </div>
                    
                    <a href="#" onClick={(e) => e.preventDefault()}>
                      <User className="rma-navbar-dropdown-icon" />
                      Mon Profil
                    </a>
                    <a href="#" onClick={(e) => e.preventDefault()}>
                      <FolderOpen className="rma-navbar-dropdown-icon" />
                      Mes Documents
                    </a>
                    <a href="#" onClick={(e) => e.preventDefault()}>
                      <Bell className="rma-navbar-dropdown-icon" />
                      Notifications
                    </a>
                    
                    <div className="rma-navbar-dropdown-divider"></div>
                    
                    <a href="#" className="danger" onClick={(e) => e.preventDefault()}>
                      <svg className="rma-navbar-dropdown-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Se déconnecter
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Overlay pour fermer le menu en cliquant ailleurs */}
      {userMenuOpen && (
        <div 
          className={`rma-navbar-overlay ${userMenuOpen ? 'show' : ''}`}
          onClick={handleOverlayClick}
        />
      )}
    </>
  );
};

export default RMANavbar;