import { useState, useCallback } from 'react';

export const useAuthenticatedApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getKeycloak = () => window.keycloak;

  const apiCall = useCallback(async (url, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const keycloak = getKeycloak();
      
      if (!keycloak || !keycloak.authenticated) {
        throw new Error('Utilisateur non authentifié');
      }

      await ensureValidToken(keycloak);

      const headers = buildHeaders(keycloak, options.headers);

      const baseURL = 'http://localhost:8089';
      const fullUrl = url.startsWith('http') ? url : `${baseURL}${url}`;

      console.log(`📡 API Call: ${options.method || 'GET'} ${fullUrl}`);
      
      const response = await fetch(fullUrl, {
        ...options,
        headers
      });

      await handleHttpErrors(response, keycloak);

      if (response.ok) {
        console.log(`✅ API Success: ${response.status} ${fullUrl}`);
      }

      return response;

    } catch (error) {
      console.error('🔴 Erreur API:', error);
      setError(error.message);
      
      if (error.name === 'AuthenticationError') {
        const keycloak = getKeycloak();
        keycloak?.login();
        return;
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const ensureValidToken = async (keycloak) => {
    if (keycloak.isTokenExpired(30)) {
      console.log('🔄 Token expirant, refresh automatique...');
      try {
        await keycloak.updateToken(30);
        console.log('✅ Token refreshé avec succès');
      } catch (refreshError) {
        console.error('❌ Échec du refresh token:', refreshError);
        const error = new Error('Token expiré');
        error.name = 'AuthenticationError';
        throw error;
      }
    }
  };

  const buildHeaders = (keycloak, customHeaders = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders
    };

    if (keycloak.token) {
      headers.Authorization = `Bearer ${keycloak.token}`;
      console.log('🔐 Token ajouté automatiquement aux headers');
    }

    return headers;
  };

  const handleHttpErrors = async (response, keycloak) => {
    if (response.status === 401) {
      console.warn('❌ Token invalide (401), redirection vers login');
      const error = new Error('Token invalide');
      error.name = 'AuthenticationError';
      throw error;
    }

    if (response.status === 403) {
      console.warn('⛔ Accès refusé (403) - Permissions insuffisantes');
      
      const userRoles = keycloak.realmAccess?.roles || [];
      
      let errorMessage = 'Accès refusé - Vous n\'avez pas les permissions nécessaires';
      
      if (!userRoles.includes('RH') && !userRoles.includes('ASSURE')) {
        errorMessage += '. Vous devez avoir un rôle RH ou ASSURE pour accéder à cette ressource.';
      }
      
      throw new Error(errorMessage);
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
    }
  };

  const apiGet = useCallback((endpoint, options = {}) => {
    return apiCall(endpoint, { ...options, method: 'GET' });
  }, [apiCall]);

  const apiPost = useCallback((endpoint, data, options = {}) => {
    return apiCall(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    });
  }, [apiCall]);

  const apiPut = useCallback((endpoint, data, options = {}) => {
    return apiCall(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }, [apiCall]);

  const apiDelete = useCallback((endpoint, options = {}) => {
    return apiCall(endpoint, { ...options, method: 'DELETE' });
  }, [apiCall]);

  const getJson = useCallback(async (endpoint, options = {}) => {
    const response = await apiGet(endpoint, options);
    return response.json();
  }, [apiGet]);

  const postJson = useCallback(async (endpoint, data, options = {}) => {
    const response = await apiPost(endpoint, data, options);
    return response.json();
  }, [apiPost]);

  const putJson = useCallback(async (endpoint, data, options = {}) => {
    const response = await apiPut(endpoint, data, options);
    return response.json();
  }, [apiPut]);

  return {
    apiCall,
    get: apiGet,
    post: apiPost,
    put: apiPut,
    delete: apiDelete,
    
    getJson,
    postJson,
    putJson,
    
    loading,
    error,
    
    clearError: () => setError(null)
  };
};