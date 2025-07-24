// 📁 src/config/auth.js
export const TOKEN_CONFIG = {
  // Token temporaire pour les tests - À CENTRALISER
  TEMP_TOKEN: "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJUUll0aUpNY2c1aUF1UV9YUG9tZ3ZnWVBBeTc0dDJoalBUa09pUDY2X053In0.eyJleHAiOjE3NTMzNDU5MDMsImlhdCI6MTc1MzM0NTYwMywianRpIjoiOWUwMDQ0NjUtNWZmMS00Y2M3LWI5OWMtNDg2NDhiOTM0ZDQzIiwiaXNzIjoiaHR0cHM6Ly9hY2Nlc3MtZHkucm1hYXNzdXJhbmNlLmNvbS9hdXRoL3JlYWxtcy9ybWEtYWQiLCJhdWQiOlsicmVhbG0tbWFuYWdlbWVudCIsImFjY291bnQiXSwic3ViIjoiNDI2NzdmOTctODdkNy00NTVlLWI1ODktMDEzOGZjZDQyZWFjIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoibm92YXMiLCJzZXNzaW9uX3N0YXRlIjoiOGEzNmI5MWMtZGVkNi00MDc0LTg5YjgtNmVjYzYzYThkMDc4IiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyIqIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJkZWZhdWx0LXJvbGVzLXJtYS1hZCIsIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJyZWFsbS1tYW5hZ2VtZW50Ijp7InJvbGVzIjpbInZpZXctdXNlcnMiLCJxdWVyeS1ncm91cHMiLCJxdWVyeS11c2VycyJdfSwiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJlbWFpbCBwcm9maWxlIiwic2lkIjoiOGEzNmI5MWMtZGVkNi00MDc0LTg5YjgtNmVjYzYzYThkMDc4IiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJuYW1lIjoiSW1hbmUgRUwgQUxKSSIsInByZWZlcnJlZF91c2VybmFtZSI6InMwMDAxNDk0IiwiZ2l2ZW5fbmFtZSI6IkltYW5lIiwiZmFtaWx5X25hbWUiOiJFTCBBTEpJIiwiZW1haWwiOiJpLmVsYWxqaUBybWFhc3N1cmFuY2UuY29tIn0.gY6Mf349EAmJqy4N16Z6iZYkwSfV6H_SGbbN7An5EGlrEeV2T0Vl9t6KoLn_fTfJ8DnCTKWUdfWR0k0KDQ1oRsHNp2bfjyQjiYAlEUjvBXg_UBAeu9wfZk4VaKQRLSlg1NP7nLiNKDb_JayseM-MXyhnLJAH8kLR4Q5CpdLWP1v70XQl1gxFm7QLZ1DZe8oNTaN6kmJ-6dYT7S_57aObriIPREYRH6c-f5u-j7Ta6XuFt75ybDAxfvEbEVcQ037eN8SLB0qdyDR5STZzNt1Q8CsBQJETY8QQTM1ZBDvMFC00zVifKbYbEH_JkvnrThOodafl0jW8ZzMjIMvlvHIHoA"
};

/**
 * Récupère le token d'authentification
 * Priorité: localStorage -> TOKEN temporaire
 * @returns {string|null} Token JWT
 */
export const getAuthToken = () => {
  // Vérifier si localStorage est disponible (environnement navigateur)
  if (typeof Storage !== "undefined") {
    const storedToken = localStorage.getItem('access_token');
    if (storedToken) {
      return storedToken;
    }
  }
  
  // Fallback sur le token temporaire
  return TOKEN_CONFIG.TEMP_TOKEN;
};

/**
 * Sauvegarde le token d'authentification
 * @param {string} token - Token JWT à sauvegarder
 */
export const setAuthToken = (token) => {
  if (token && typeof Storage !== "undefined") {
    localStorage.setItem('access_token', token);
    console.log('🔑 Token sauvegardé dans localStorage');
  } else if (token) {
    console.warn('⚠️ localStorage non disponible, token non sauvegardé');
  }
};

/**
 * Supprime le token d'authentification
 */
export const clearAuthToken = () => {
  if (typeof Storage !== "undefined") {
    localStorage.removeItem('access_token');
    console.log('🔑 Token supprimé du localStorage');
  }
};

/**
 * Vérifie si le token est valide et non expiré
 * @param {string} token - Token JWT à vérifier
 * @returns {boolean} true si le token est valide
 */
export const isTokenValid = (token) => {
  if (!token) {
    console.warn('⚠️ Token absent');
    return false;
  }
  
  try {
    // Décoder le payload du JWT (partie centrale)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    if (payload.exp && payload.exp > currentTime) {
      console.log('✅ Token valide');
      return true;
    } else {
      console.warn('⚠️ Token expiré');
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur lors de la validation du token:', error);
    return false;
  }
};

/**
 * Récupère les informations utilisateur depuis le token
 * @param {string} token - Token JWT
 * @returns {object|null} Informations utilisateur ou null
 */
export const getUserInfoFromToken = (token) => {
  if (!token || !isTokenValid(token)) {
    return null;
  }
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      username: payload.preferred_username,
      email: payload.email,
      name: payload.name,
      givenName: payload.given_name,
      familyName: payload.family_name,
      roles: payload.realm_access?.roles || []
    };
  } catch (error) {
    console.error('❌ Erreur lors de l\'extraction des infos utilisateur:', error);
    return null;
  }
};