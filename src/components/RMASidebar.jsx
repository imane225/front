import React, { useState, useEffect } from 'react';
import {
  Menu,
  Home,
  Users,
  FileText,
  Search,
  ChevronDown,
  ChevronRight,
  Layers,
  Plus
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import './RMASidebar.css'; // Importe le fichier CSS

const LOCAL_STORAGE_KEY = 'rma-sidebar-collapsed';

const RMASidebar = ({ isCollapsed: externalIsCollapsed, onToggle }) => {
  // Important : useState DOIT être à l’intérieur du composant
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    // Si localStorage présent, convertit string en booléen
    if (stored !== null) return stored === 'true';
    // Sinon, sidebar fermée par défaut
    return true;
  });

  const [activeItem, setActiveItem] = useState('search-sinistre');
  const [expandedMenus, setExpandedMenus] = useState(['sinistre']);
  const navigate = useNavigate();
  const location = useLocation();

  // Synchronise avec la prop externe si fournie
  useEffect(() => {
    if (typeof externalIsCollapsed === 'boolean') {
      setIsCollapsed(externalIsCollapsed);
      localStorage.setItem(LOCAL_STORAGE_KEY, externalIsCollapsed);
    }
  }, [externalIsCollapsed]);

  // Met à jour l'item actif et menus ouverts selon URL
  useEffect(() => {
    const pathname = location.pathname;

    if (pathname.includes('/consultation/sinistres/creer')) {
      setActiveItem('creer-sinistre');
      if (!expandedMenus.includes('sinistre')) {
        setExpandedMenus(prev => [...prev, 'sinistre']);
      }
    } else if (pathname.includes('/consultation/sinistres')) {
      setActiveItem('search-sinistre');
      if (!expandedMenus.includes('sinistre')) {
        setExpandedMenus(prev => [...prev, 'sinistre']);
      }
    } else if (pathname.includes('/lots/creation')) {
      setActiveItem('create-lot');
      if (!expandedMenus.includes('lot')) {
        setExpandedMenus(prev => [...prev, 'lot']);
      }
    } else if (pathname.includes('/lots')) {
      setActiveItem('search-lot');
      if (!expandedMenus.includes('lot')) {
        setExpandedMenus(prev => [...prev, 'lot']);
      }
    }
  }, [location.pathname, expandedMenus]);

  const menuItems = [
    {
      id: 'home',
      label: 'Accueil',
      icon: Home,
      href: '/sante'
    },
    {
      id: 'sinistre',
      label: 'Sinistre',
      icon: Users,
      isExpandable: true,
      subItems: [
        {
          id: 'search-sinistre',
          label: 'Rechercher sinistre',
          icon: Search,
          href: '/consultation/sinistres'
        },
        {
          id: 'creer-sinistre',
          label: 'Créer sinistre',
          icon: Plus,
          href: '/consultation/sinistres/creer'
        }
      ]
    },
    {
      id: 'lot',
      label: 'Lots',
      icon: Layers,
      isExpandable: true,
      subItems: [
        {
          id: 'search-lot',
          label: 'Rechercher lot',
          icon: Search,
          href: '/lots'
        },
        {
          id: 'create-lot',
          label: 'Créer lot',
          icon: FileText,
          href: '/lots/creation'
        }
      ]
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: FileText,
      href: '/documents'
    }
  ];

  const toggleSidebar = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    localStorage.setItem(LOCAL_STORAGE_KEY, newCollapsed);
    if (onToggle) onToggle(newCollapsed);
  };

  const handleItemClick = (itemId, href) => {
    const menu = menuItems.find(item => item.id === itemId);

    if (menu?.isExpandable) {
      setExpandedMenus(prev =>
        prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
      );
    } else {
      setActiveItem(itemId);
      if (href) navigate(href);
    }
  };

  const handleSubItemClick = (subItemId, href) => {
    setActiveItem(subItemId);
    if (href) navigate(href);
  };

  const isMenuExpanded = menuId => expandedMenus.includes(menuId);

  return (
    <div className={`rma-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="rma-sidebar-header">
        <button className="rma-sidebar-toggle" onClick={toggleSidebar}>
          <Menu size={20} />
        </button>
      </div>

      <nav className="rma-sidebar-nav">
        <ul className="rma-sidebar-menu">
          {menuItems.map(item => {
            const IconComponent = item.icon;
            const isExpanded = isMenuExpanded(item.id);

            return (
              <li key={item.id} className="rma-sidebar-item">
                <a
                  href={item.href || '#'}
                  className={`rma-sidebar-link ${activeItem === item.id ? 'active' : ''}`}
                  onClick={e => {
                    e.preventDefault();
                    handleItemClick(item.id, item.href);
                  }}
                  title={isCollapsed ? item.label : ''}
                >
                  <IconComponent size={20} />
                  {!isCollapsed && (
                    <>
                      <span className="rma-sidebar-label">{item.label}</span>
                      {item.isExpandable && (
                        <div className="rma-sidebar-arrow">
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </div>
                      )}
                    </>
                  )}
                </a>

                {item.subItems && isExpanded && !isCollapsed && (
                  <ul className="rma-sidebar-submenu">
                    {item.subItems.map(subItem => {
                      const SubIconComponent = subItem.icon;
                      return (
                        <li key={subItem.id} className="rma-sidebar-subitem">
                          <a
                            href={subItem.href}
                            className={`rma-sidebar-sublink ${activeItem === subItem.id ? 'active' : ''}`}
                            onClick={e => {
                              e.preventDefault();
                              handleSubItemClick(subItem.id, subItem.href);
                            }}
                          >
                            <SubIconComponent size={16} />
                            <span className="rma-sidebar-sublabel">{subItem.label}</span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default RMASidebar;
