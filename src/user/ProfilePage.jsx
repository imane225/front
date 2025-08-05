
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';


export const UserInfo = () => {
  const { user, logout, getRoleColors, getRoleLabel } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getInitials = useCallback(() => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    if (user?.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    return 'U';
  }, [user?.firstName, user?.lastName, user?.username]);

  const handleLogout = useCallback(() => {
    setDropdownOpen(false);
    logout();
  }, [logout]);

  const toggleDropdown = useCallback(() => {
    setDropdownOpen(prev => !prev);
  }, []);

  const closeDropdown = useCallback(() => {
    setDropdownOpen(false);
  }, []);

  return (
    <div className="relative">
     
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-3 px-3 py-2 rounded-lg text-white hover:bg-white hover:bg-opacity-10 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-20"
      >
        
        <div className="h-8 w-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
          <span className="text-sm font-medium text-white">
            {getInitials()}
          </span>
        </div>

        
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium">
            Bonjour, {user?.firstName || user?.username}
          </div>
          <div className="text-xs opacity-75">
            {getRoleLabel()}
          </div>
        </div>

       
        <svg 
          className={`h-4 w-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

     
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          
         
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {getInitials()}
                </span>
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {user?.fullName || user?.username}
                </div>
                <div className="text-sm text-gray-500">
                  {user?.email}
                </div>
                <div className="mt-1">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getRoleColors()}`}>
                    {getRoleLabel()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="py-2">
            <Link
              to="/profil"
              onClick={closeDropdown}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg className="mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Mon Profil
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <svg className="mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Se déconnecter
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


const ConnectionHistory = ({ maxItems = 10 }) => {
  const [connections, setConnections] = useState([]);

  const generateMockData = useCallback(() => {
    const now = new Date();
    const mockConnections = [];
    
    for (let i = 0; i < maxItems; i++) {
      const date = new Date(now - (i * 24 * 60 * 60 * 1000) - (Math.random() * 12 * 60 * 60 * 1000));
      mockConnections.push({
        id: i + 1,
        date: date.toISOString(),
        ip: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
        success: i === 0 || Math.random() > 0.1,
        duration: Math.floor(Math.random() * 120) + 15,
        location: 'Casablanca, MA'
      });
    }
    return mockConnections;
  }, [maxItems]);

  useEffect(() => {
    setConnections(generateMockData());
  }, [generateMockData]);

  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Aujourd'hui à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Hier à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return `Il y a ${diffDays} jours`;
    }
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">🕰️ Historique des connexions</h3>
      
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {connections.map((connection, index) => (
          <div 
            key={connection.id} 
            className={`flex items-center justify-between p-3 rounded-lg border ${
              index === 0 ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-lg">
                {connection.success ? '✅' : '❌'}
              </span>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {formatDate(connection.date)}
                  {index === 0 && (
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Actuelle
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  IP: {connection.ip} • {connection.location}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className={`text-sm font-medium ${connection.success ? 'text-green-600' : 'text-red-600'}`}>
                {connection.success ? 'Réussie' : 'Échec'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const UserStats = ({ stats = {}, isRH = false }) => {
  const defaultStats = useMemo(() => ({
    connectionCount: 42,
    consultationCount: 158,
    creationCount: isRH ? 23 : 0,
    activeHours: 89.5,
    ...stats
  }), [stats, isRH]);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Statistiques d'activité</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="text-2xl font-bold text-blue-600">
            {defaultStats.connectionCount}
          </div>
          <div className="text-sm text-gray-600 mt-1">Connexions</div>
        </div>

        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
          <div className="text-2xl font-bold text-green-600">
            {defaultStats.consultationCount}
          </div>
          <div className="text-sm text-gray-600 mt-1">Consultations</div>
        </div>

        {isRH && (
          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
            <div className="text-2xl font-bold text-purple-600">
              {defaultStats.creationCount}
            </div>
            <div className="text-sm text-gray-600 mt-1">Créations</div>
          </div>
        )}

        <div className="text-center p-4 bg-indigo-50 rounded-lg border border-indigo-100">
          <div className="text-2xl font-bold text-indigo-600">
            {defaultStats.activeHours.toFixed(1)}h
          </div>
          <div className="text-sm text-gray-600 mt-1">Temps actif</div>
        </div>
      </div>
    </div>
  );
};

const ProfilPage = () => {
  const { 
    user, 
    roles, 
    isRH, 
    preferences, 
    updatePreference, 
    resetPreferences,
    userStats,
    getRoleColors,
    getRoleLabel,
    tokenParsed
  } = useAuth();
  
  const [message, setMessage] = useState(null);

  const handlePreferenceChange = useCallback((key, value) => {
    updatePreference(key, value);
    setMessage({ type: 'success', text: 'Préférences sauvegardées' });
    setTimeout(() => setMessage(null), 3000);
  }, [updatePreference]);

  const handleResetPreferences = useCallback(() => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser toutes vos préférences ?')) {
      resetPreferences();
      setMessage({ type: 'success', text: 'Préférences réinitialisées' });
      setTimeout(() => setMessage(null), 3000);
    }
  }, [resetPreferences]);

  const userInitials = useMemo(() => {
    return `${user?.firstName?.charAt(0) || ''}${user?.lastName?.charAt(0) || ''}`;
  }, [user?.firstName, user?.lastName]);

  const tokenExpiration = useMemo(() => {
    return tokenParsed?.exp ? new Date(tokenParsed.exp * 1000).toLocaleString() : 'N/A';
  }, [tokenParsed?.exp]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xl font-bold">
              {userInitials}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user?.fullName || user?.username}
            </h1>
            <p className="text-gray-600">{user?.email}</p>
            <div className="flex space-x-2 mt-2">
              {roles.map(role => (
                <span key={role} className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColors()}`}>
                  {role === 'RH' ? 'Ressources Humaines' : role === 'ASSURE' ? 'Assuré' : role}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">👤 Informations personnelles</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom complet</label>
                <p className="mt-1 text-sm text-gray-900">{user?.fullName || 'Non défini'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom d'utilisateur</label>
                <p className="mt-1 text-sm text-gray-900">{user?.username}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Rôle principal</label>
                <p className="mt-1 text-sm text-gray-900">{getRoleLabel()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">⚙️ Préférences</h2>
            <button
              onClick={handleResetPreferences}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Réinitialiser
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Éléments par page
              </label>
              <select 
                value={preferences.itemsPerPage} 
                onChange={(e) => handlePreferenceChange('itemsPerPage', parseInt(e.target.value))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Format de date
              </label>
              <select 
                value={preferences.dateFormat} 
                onChange={(e) => handlePreferenceChange('dateFormat', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="dd/MM/yyyy">JJ/MM/AAAA</option>
                <option value="MM/dd/yyyy">MM/JJ/AAAA</option>
                <option value="yyyy-MM-dd">AAAA-MM-JJ</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thème
              </label>
              <select 
                value={preferences.theme} 
                onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="light">Clair</option>
                <option value="dark">Sombre</option>
                <option value="auto">Automatique</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={preferences.notifications}
                onChange={(e) => handlePreferenceChange('notifications', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Recevoir les notifications
              </label>
            </div>
          </div>
        </div>

        <UserStats stats={userStats} isRH={isRH()} />

        <ConnectionHistory />

      </div>

      {typeof window !== 'undefined' && window.location.hostname === 'localhost' && (
        <div className="bg-gray-50 rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">🔧 Informations de session (Dev)</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block font-medium text-gray-700">Token expire le</label>
              <p className="text-gray-600">{tokenExpiration}</p>
            </div>
            <div>
              <label className="block font-medium text-gray-700">Émis par</label>
              <p className="text-gray-600">{tokenParsed?.iss || 'N/A'}</p>
            </div>
            <div>
              <label className="block font-medium text-gray-700">Rôles bruts</label>
              <p className="text-gray-600 font-mono text-xs">{JSON.stringify(roles)}</p>
            </div>
            <div>
              <label className="block font-medium text-gray-700">User ID</label>
              <p className="text-gray-600 font-mono text-xs">{user?.id}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProfilPage;