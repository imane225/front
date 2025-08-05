import React, { useState } from 'react';
import { ChevronDown, User, Bell, FolderOpen, Shield, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';
import { getUserInfo, logout, isRH, isAssure } from '../config/keycloak';
import './RMANavbar.css';

const RMANavbar = ({ isSidebarCollapsed = false }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { initialized } = useKeycloak();

  const userInfo = getUserInfo();

  const handleImageError = (e) => {
    e.target.style.display = 'none';
    const fallback = e.target.nextElementSibling;
    if (fallback) {
      fallback.classList.add('show');
    }
  };

  const handleOverlayClick = () => {
    setUserMenuOpen(false);
  };

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
  };

  const getRoleInfo = () => {
    if (isRH()) {
      return {
        icon: <Shield size={12} className="text-blue-600" />,
        text: 'Ressources Humaines',
        badge: 'RH'
      };
    } else if (isAssure()) {
      return {
        icon: <UserCheck size={12} className="text-green-600" />,
        text: 'Assuré',
        badge: 'ASSURÉ'
      };
    }
    return {
      icon: <User size={12} className="text-gray-600" />,
      text: 'Utilisateur',
      badge: 'USER'
    };
  };

  if (!initialized) {
    return (
      <nav className={`rma-navbar ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="rma-navbar-container">
          <div className="rma-navbar-content">
            <div className="rma-navbar-logo">
              <a href="/">
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
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  const roleInfo = getRoleInfo();

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
              <button className="rma-navbar-button" title="Notifications">
                <Bell size={18} />
                <div className="rma-navbar-button-badge"></div>
              </button>

              <div className="rma-navbar-user-menu">
                <button 
                  className="rma-navbar-user-button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  title="Menu utilisateur"
                >
                  <div className="rma-navbar-user-icon">
                    <User size={14} />
                  </div>
                  <span className="rma-navbar-user-name">
                    {userInfo?.firstName || userInfo?.username || 'Utilisateur'}
                  </span>
                  <span className="rma-navbar-user-chevron">
                    <ChevronDown size={14} />
                  </span>
                </button>

                {userMenuOpen && (
                  <div className="rma-navbar-dropdown">
                    <div className="rma-navbar-dropdown-header">
                      <div className="rma-navbar-dropdown-user-info">
                        <div className="rma-navbar-dropdown-user-name">
                          {userInfo?.fullName || userInfo?.username || 'Utilisateur'}
                        </div>
                        <div className="rma-navbar-dropdown-user-email">
                          {userInfo?.email || 'email@rma.ma'}
                        </div>
                        <div className="rma-navbar-dropdown-user-role">
                          {roleInfo.icon}
                          <span>{roleInfo.text}</span>
                          <span className="rma-navbar-role-badge">{roleInfo.badge}</span>
                        </div>
                      </div>
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
                    
                    {isRH() && (
                      <a href="#" onClick={(e) => e.preventDefault()}>
                        <Shield className="rma-navbar-dropdown-icon" />
                        Gestion RH
                      </a>
                    )}
                    
                    {isAssure() && (
                      <a href="#" onClick={(e) => e.preventDefault()}>
                        <UserCheck className="rma-navbar-dropdown-icon" />
                        Mes Assurances
                      </a>
                    )}
                    
                    <div className="rma-navbar-dropdown-divider"></div>
                    
                    <button 
                      onClick={handleLogout}
                      className="rma-navbar-dropdown-logout"
                    >
                      <svg className="rma-navbar-dropdown-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Se déconnecter
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

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