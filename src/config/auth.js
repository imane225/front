const getKeycloak = () => {
  return window.keycloak;
};

export const getAuthToken = () => {
  const keycloak = getKeycloak();
  return keycloak?.token || null;
};

export const setAuthToken = () => {
  console.warn('setAuthToken est déprécié avec Keycloak - Token géré automatiquement');
};

export const isTokenValid = () => {
  const keycloak = getKeycloak();
  if (!keycloak) return false;
  return keycloak.authenticated && !keycloak.isTokenExpired();
};

export const clearAuthToken = () => {
  console.warn('clearAuthToken est déprécié - Utilisez keycloak.logout()');
  const keycloak = getKeycloak();
  if (keycloak) {
    keycloak.logout({
      redirectUri: 'http://localhost:5173/'  
    });
  }
};

export const getUserInfoFromToken = () => {
  const keycloak = getKeycloak();
  if (!keycloak?.tokenParsed) return null;
  
  return {
    id: keycloak.tokenParsed.sub,
    username: keycloak.tokenParsed.preferred_username,
    email: keycloak.tokenParsed.email,
    firstName: keycloak.tokenParsed.given_name,
    lastName: keycloak.tokenParsed.family_name,
    fullName: `${keycloak.tokenParsed.given_name || ''} ${keycloak.tokenParsed.family_name || ''}`.trim(),
    realmRoles: keycloak.realmAccess?.roles || [],
    clientRoles: keycloak.resourceAccess?.['rma-web-client']?.roles || [],
    isRH: (keycloak.realmAccess?.roles || []).includes('RH'),
    isAssure: (keycloak.realmAccess?.roles || []).includes('ASSURE')
  };
};

export const hasRole = (role, checkClientRoles = false) => {
  const keycloak = getKeycloak();
  if (!keycloak?.tokenParsed) return false;
  
  if (checkClientRoles) {
    const clientRoles = keycloak.resourceAccess?.['rma-web-client']?.roles || [];
    return clientRoles.includes(role);
  }
  
  const realmRoles = keycloak.realmAccess?.roles || [];
  return realmRoles.includes(role);
};

export const isRH = () => hasRole('RH');
export const isAssure = () => hasRole('ASSURE');

export const keycloakConfig = {
  url: 'http://localhost:8080',     
  realm: 'rma-assurance',          
  clientId: 'rma-web-client'       
};

export const keycloakInitOptions = {
  onLoad: 'login-required',
  checkLoginIframe: false,
  pkceMethod: 'S256',
  redirectUri: 'http://localhost:5173/',  
  silentCheckSsoRedirectUri: 'http://localhost:5173/silent-check-sso.html'
};