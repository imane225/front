import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  Home, 
  Users, 
  FileText, 
  Search,
  UserPlus,
  ChevronDown,
  ChevronRight,
  Plus 
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom'; 
import './RMASidebar.css';

const RMASidebar = ({ isCollapsed: externalIsCollapsed, onToggle }) => {
  const [isCollapsed, setIsCollapsed] = useState(externalIsCollapsed || false);
  const [activeItem, setActiveItem] = useState('search-sinistre');
  const [expandedMenus, setExpandedMenus] = useState(['sinistre']);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (typeof externalIsCollapsed === 'boolean') {
      setIsCollapsed(externalIsCollapsed);
    }
  }, [externalIsCollapsed]);

  useEffect(() => {
    const pathname = location.pathname;
    if (pathname.includes('/consultation/sinistres/creer')) {
      setActiveItem('creer-sinistre');
      setExpandedMenus(prev => prev.includes('sinistre') ? prev : [...prev, 'sinistre']);
    } else if (pathname.includes('/consultation/sinistres')) {
      setActiveItem('search-sinistre');
      setExpandedMenus(prev => prev.includes('sinistre') ? prev : [...prev, 'sinistre']);
    }
  }, [location.pathname]);

  const menuItems = [
    {
      id: 'home',
      label: 'Accueil',
      icon: Home,
      href: '/dashboard'
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
      id: 'documents',
      label: 'Documents',
      icon: FileText,
      href: '/documents'
    }
  ];

  const toggleSidebar = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    
    if (onToggle) {
      onToggle(newCollapsed);
    }
  };

  const handleItemClick = (itemId, href) => {
    if (menuItems.find(item => item.id === itemId && item.isExpandable)) {
      setExpandedMenus(prev => 
        prev.includes(itemId) 
          ? prev.filter(id => id !== itemId)
          : [...prev, itemId]
      );
    } else {
      setActiveItem(itemId);
      if (href) {
        navigate(href);
      }
    }
  };

  const handleSubItemClick = (subItemId, href) => {
    setActiveItem(subItemId);
    if (href) {
      navigate(href);
    }
  };

  const isMenuExpanded = (menuId) => expandedMenus.includes(menuId);

  return (
    <div className={`rma-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      
      <div className="rma-sidebar-header">
        <button 
          className="rma-sidebar-toggle"
          onClick={toggleSidebar}
        >
          <Menu size={20} />
        </button>
      </div>

     
      <nav className="rma-sidebar-nav">
        <ul className="rma-sidebar-menu">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isExpanded = isMenuExpanded(item.id);
            
            return (
              <li key={item.id} className="rma-sidebar-item">
                <a
                  href={item.href || '#'}
                  className={`rma-sidebar-link ${activeItem === item.id ? 'active' : ''}`}
                  onClick={(e) => {
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
                    {item.subItems.map((subItem) => {
                      const SubIconComponent = subItem.icon;
                      return (
                        <li key={subItem.id} className="rma-sidebar-subitem">
                          <a
                            href={subItem.href}
                            className={`rma-sidebar-sublink ${activeItem === subItem.id ? 'active' : ''}`}
                            onClick={(e) => {
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