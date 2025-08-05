import Keycloak from 'keycloak-js';

const keycloakConfig = {
  url: 'http://localhost:8080',     
  realm: 'rma-assurance',          
  clientId: 'rma-web-client'       
};

const keycloak = new Keycloak(keycloakConfig);

export const getToken = () => keycloak?.token;

export const getUserInfo = () => {
  if (!keycloak?.tokenParsed) return null;
  
  return {
    id: keycloak.tokenParsed.sub,
    username: keycloak.tokenParsed.preferred_username,
    email: keycloak.tokenParsed.email,
    firstName: keycloak.tokenParsed.given_name,
    lastName: keycloak.tokenParsed.family_name,
    realmRoles: keycloak.realmAccess?.roles || [],
    clientRoles: keycloak.resourceAccess?.[keycloakConfig.clientId]?.roles || [],
    isRH: (keycloak.realmAccess?.roles || []).includes('RH'),
    isAssure: (keycloak.realmAccess?.roles || []).includes('ASSURE'),
    fullName: `${keycloak.tokenParsed.given_name || ''} ${keycloak.tokenParsed.family_name || ''}`.trim()
  };
};

export const hasRole = (role) => {
  return keycloak?.realmAccess?.roles?.includes(role) || false;
};

export const isRH = () => hasRole('RH');
export const isAssure = () => hasRole('ASSURE');

export const logout = () => {
  keycloak?.logout({
    redirectUri: 'http://localhost:5173/'
  });
};

export const isAuthenticated = () => {
  return keycloak?.authenticated === true;
};

export default keycloak;