
import { useKeycloak } from '@react-keycloak/web';
import { useState, useEffect, useCallback } from 'react';

export const useAuth = () => {
  const { keycloak, initialized } = useKeycloak();
  
  
  const [preferences, setPreferences] = useState({
    itemsPerPage: 25,
    dateFormat: 'dd/MM/yyyy',
    theme: 'light',
    notifications: true,
    language: 'fr'
  });

  
  const [userStats, setUserStats] = useState({
    connectionCount: 0,
    consultationCount: 0,
    creationCount: 0,
    lastLogin: null,
    accountAge: 0,
    activeHours: 0
  });

  
  const getRoles = useCallback(() => {
    if (!keycloak.tokenParsed) return [];
    return keycloak.tokenParsed?.resource_access?.['rma-web-client']?.roles || [];
  }, [keycloak.tokenParsed]);

  
  const getUser = useCallback(() => {
    if (!keycloak.tokenParsed) return null;
    return {
      id: keycloak.tokenParsed.sub,
      username: keycloak.tokenParsed.preferred_username,
      email: keycloak.tokenParsed.email,
      firstName: keycloak.tokenParsed.given_name,
      lastName: keycloak.tokenParsed.family_name,
      fullName: `${keycloak.tokenParsed.given_name || ''} ${keycloak.tokenParsed.family_name || ''}`.trim()
    };
  }, [keycloak.tokenParsed]);

 

  const hasRole = useCallback((role) => getRoles().includes(role), [getRoles]);
  const isRH = useCallback(() => hasRole('RH'), [hasRole]);
  const isAssure = useCallback(() => hasRole('ASSURE'), [hasRole]);
  const isGestionnaire = useCallback(() => hasRole('GESTIONNAIRE'), [hasRole]);
  const isAdmin = useCallback(() => hasRole('ADMIN'), [hasRole]);

  
  const getPrimaryRole = useCallback(() => {
    const roles = getRoles();
    if (roles.includes('ADMIN')) return 'ADMIN';
    if (roles.includes('RH')) return 'RH';
    if (roles.includes('GESTIONNAIRE')) return 'GESTIONNAIRE';
    if (roles.includes('ASSURE')) return 'ASSURE';
    return null;
  }, [getRoles]);


  useEffect(() => {
    const user = getUser();
    if (user?.id) {
      const savedPrefs = localStorage.getItem(`user-preferences-${user.id}`);
      if (savedPrefs) {
        try {
          const parsed = JSON.parse(savedPrefs);
          setPreferences(prev => ({ ...prev, ...parsed }));
        } catch (error) {
          console.warn('Erreur chargement préférences:', error);
        }
      }
    }
  }, [getUser]); 

 
  const updatePreference = useCallback((key, value) => {
    const user = getUser();
    if (user?.id) {
      const newPrefs = { ...preferences, [key]: value };
      setPreferences(newPrefs);
      localStorage.setItem(`user-preferences-${user.id}`, JSON.stringify(newPrefs));
    }
  }, [getUser, preferences]);

 
  const updatePreferences = useCallback((newPrefs) => {
    const user = getUser();
    if (user?.id) {
      const mergedPrefs = { ...preferences, ...newPrefs };
      setPreferences(mergedPrefs);
      localStorage.setItem(`user-preferences-${user.id}`, JSON.stringify(mergedPrefs));
    }
  }, [getUser, preferences]);

 
  const resetPreferences = useCallback(() => {
    const user = getUser();
    if (user?.id) {
      const defaultPrefs = {
        itemsPerPage: 25,
        dateFormat: 'dd/MM/yyyy',
        theme: 'light',
        notifications: true,
        language: 'fr'
      };
      setPreferences(defaultPrefs);
      localStorage.setItem(`user-preferences-${user.id}`, JSON.stringify(defaultPrefs));
    }
  }, [getUser]);

 
  useEffect(() => {
    if (initialized && keycloak.authenticated) {
     
      const mockStats = {
        connectionCount: Math.floor(Math.random() * 100) + 20,
        consultationCount: Math.floor(Math.random() * 500) + 50,
        creationCount: isRH() ? Math.floor(Math.random() * 50) + 5 : 0,
        lastLogin: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        accountAge: Math.floor(Math.random() * 365) + 30,
        activeHours: Math.random() * 200 + 20
      };
      setUserStats(mockStats);
    }
  }, [initialized, keycloak.authenticated, isRH]); 

 
  const incrementStat = useCallback((statName, increment = 1) => {
    setUserStats(prev => ({
      ...prev,
      [statName]: (prev[statName] || 0) + increment
    }));
  }, []);

  
  const logout = useCallback(() => {
    
    const user = getUser();
    if (user?.id) {
     
      localStorage.removeItem(`temp-data-${user.id}`);
    }
    
    keycloak.logout({
      redirectUri: window.location.origin
    });
  }, [getUser, keycloak]);

 
  const isTokenValid = useCallback(() => {
    return keycloak.authenticated && !keycloak.isTokenExpired();
  }, [keycloak]);

 
  const getToken = useCallback(() => {
    return keycloak.token;
  }, [keycloak.token]);


  const refreshToken = useCallback(async () => {
    try {
      await keycloak.updateToken(30);
      return true;
    } catch (error) {
      console.error('Erreur refresh token:', error);
      return false;
    }
  }, [keycloak]);

  
  const canPerformAction = useCallback((action) => {
    switch (action) {
      case 'view_all_sinistres':
        return isRH() || isGestionnaire();
      
      case 'create_sinistre':
        return isRH();
      
      case 'modify_sinistre':
        return isRH();
      
      case 'delete_sinistre':
        return isRH();
      
      case 'view_own_sinistres':
        return isAssure() || isRH() || isGestionnaire();
      
      case 'access_admin':
        return isAdmin() || isRH();
      
      case 'manage_users':
        return isAdmin();
      
      case 'view_reports':
        return isRH() || isGestionnaire();
      
      default:
        return false;
    }
  }, [isRH, isGestionnaire, isAssure, isAdmin]);


  const filterDataByRole = useCallback((data) => {
    if (!Array.isArray(data)) return [];
    
    const user = getUser();
    
    
    if (isRH() || isAdmin()) {
      return data;
    }
    
   
    if (isAssure()) {
      return data.filter(item => 
        item.userId === user?.id || 
        item.assureId === user?.id ||
        item.proprietaireId === user?.id
      );
    }
    
   
    if (isGestionnaire()) {
      return data; 
    }
    
    return [];
  }, [getUser, isRH, isAdmin, isAssure, isGestionnaire]);

  
  const getDefaultRoute = useCallback(() => {
    if (isAdmin()) return '/admin/dashboard';
    if (isRH()) return '/dashboard';
    if (isGestionnaire()) return '/gestion/dashboard';
    if (isAssure()) return '/mes-sinistres';
    return '/dashboard';
  }, [isAdmin, isRH, isGestionnaire, isAssure]);

 
  const getRoleColors = useCallback(() => {
    const primaryRole = getPrimaryRole();
    const colors = {
      ADMIN: 'bg-red-100 text-red-800 border-red-200',
      RH: 'bg-blue-100 text-blue-800 border-blue-200',
      GESTIONNAIRE: 'bg-purple-100 text-purple-800 border-purple-200',
      ASSURE: 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[primaryRole] || 'bg-gray-100 text-gray-800 border-gray-200';
  }, [getPrimaryRole]);


  const getRoleLabel = useCallback(() => {
    const primaryRole = getPrimaryRole();
    const labels = {
      ADMIN: 'Administrateur',
      RH: 'Ressources Humaines',
      GESTIONNAIRE: 'Gestionnaire',
      ASSURE: 'Assuré'
    };
    return labels[primaryRole] || 'Utilisateur';
  }, [getPrimaryRole]);

  

  return {
    
    keycloak,
    initialized,
    authenticated: keycloak.authenticated,
    
    
    user: getUser(),
    roles: getRoles(),
    primaryRole: getPrimaryRole(),
    
   
    hasRole,
    isRH,
    isAssure,
    isGestionnaire,
    isAdmin,
    
  
    preferences,
    updatePreference,
    updatePreferences,
    resetPreferences,
    
    
    userStats,
    incrementStat,
    
    
    logout,
    refreshToken,
    
    
    token: getToken(),
    isTokenValid,
    
  
    canPerformAction,
    filterDataByRole,
    
   
    getDefaultRoute,
    getRoleColors,
    getRoleLabel,
    
    
    tokenParsed: keycloak.tokenParsed,
    
    
    utils: {
      formatDate: (date) => {
        const d = new Date(date);
        return preferences.dateFormat === 'MM/dd/yyyy' 
          ? d.toLocaleDateString('en-US')
          : d.toLocaleDateString('fr-FR');
      },
      
      getItemsPerPage: () => preferences.itemsPerPage,
      
      isDarkMode: () => preferences.theme === 'dark',
      
      shouldShowNotifications: () => preferences.notifications
    }
  };
};