
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import AccessDenied from './AccessDenied';


export const ProtectedRoute = ({ 
  children, 
  roles = [], 
  showMessage = true,
  fallback = null 
}) => {
  const { authenticated, hasRole, user, initialized } = useAuth();

  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800">Chargement...</h2>
          <p className="text-gray-600">Vérification des permissions</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return showMessage ? (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg border">
          <div className="text-red-600 text-4xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Authentification requise</h2>
          <p className="text-gray-600 mb-4">Vous devez être connecté pour accéder à cette page.</p>
          <p className="text-sm text-gray-500">Redirection automatique vers la page de connexion...</p>
        </div>
      </div>
    ) : (fallback || null);
  }

  if (roles.length > 0) {
    const hasRequiredRole = roles.some(role => hasRole(role));
    
    if (!hasRequiredRole) {
      return showMessage ? (
        <AccessDenied 
          requiredRoles={roles}
          userRoles={user ? [hasRole('RH') ? 'RH' : 'ASSURE'] : []}
          username={user?.username}
        />
      ) : (fallback || null);
    }
  }

  return children;
};
export const RoleBasedComponent = ({ 
  roles = [], 
  children, 
  fallback = null,
  requireAll = false,
  showDebug = false 
}) => {
  const { hasRole, user, authenticated } = useAuth();

  if (!authenticated) {
    return fallback;
  }

  if (roles.length === 0) {
    return children;
  }

  const hasAccess = requireAll 
    ? roles.every(role => hasRole(role))  
    : roles.some(role => hasRole(role));  

  if (showDebug && typeof window !== 'undefined' && window?.location?.hostname === 'localhost') {
    console.log('🔍 RoleBasedComponent Debug:', {
      requiredRoles: roles,
      userRoles: user ? [hasRole('RH') ? 'RH' : 'ASSURE'] : [],
      requireAll,
      hasAccess,
      username: user?.username
    });
  }

  return hasAccess ? children : fallback;
};


export const RHOnly = ({ children, fallback = null }) => (
  <RoleBasedComponent roles={['RH']} fallback={fallback}>
    {children}
  </RoleBasedComponent>
);

export const AssureOnly = ({ children, fallback = null }) => (
  <RoleBasedComponent roles={['ASSURE']} fallback={fallback}>
    {children}
  </RoleBasedComponent>
);

export const RHAndAssure = ({ children, fallback = null }) => (
  <RoleBasedComponent roles={['RH', 'ASSURE']} fallback={fallback}>
    {children}
  </RoleBasedComponent>
);

export const GestionnaireOnly = ({ children, fallback = null }) => (
  <RoleBasedComponent roles={['GESTIONNAIRE']} fallback={fallback}>
    {children}
  </RoleBasedComponent>
);

export const AdminOnly = ({ children, fallback = null }) => (
  <RoleBasedComponent roles={['ADMIN']} fallback={fallback}>
    {children}
  </RoleBasedComponent>
);

export const useRoleGuards = () => {
  const { hasRole, isRH, isAssure, user } = useAuth();

  return {
    canViewAll: () => isRH(),
    canEdit: () => isRH(),
    canDelete: () => isRH(),
    canCreate: () => isRH(),
    
    canAccessAdmin: () => hasRole('ADMIN') || isRH(),
    canViewReports: () => isRH() || hasRole('GESTIONNAIRE'),
    canManageUsers: () => hasRole('ADMIN'),
    
    canViewSinistre: (sinistre) => {
      if (isRH()) return true;
      if (isAssure()) return sinistre?.userId === user?.id;
      return false;
    },
    
    canModifySinistre: () => {
      return isRH();
    }
  };
};

export const RoleDebugger = () => {
  const { user, roles, authenticated, isRH, isAssure } = useAuth();

  const isDevelopment = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  if (!isDevelopment) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs z-50">
      <div className="font-bold mb-2">🔧 Debug Rôles</div>
      <div>Authentifié: {authenticated ? '✅' : '❌'}</div>
      <div>Utilisateur: {user?.username || 'N/A'}</div>
      <div>Rôles: {roles.join(', ') || 'Aucun'}</div>
      <div>RH: {isRH() ? '✅' : '❌'}</div>
      <div>Assuré: {isAssure() ? '✅' : '❌'}</div>
    </div>
  );
};

export const createProtectedPage = (Component, roles = []) => {
  const ProtectedPageComponent = (props) => (
    <ProtectedRoute roles={roles}>
      <Component {...props} />
    </ProtectedRoute>
  );
  
  ProtectedPageComponent.displayName = `ProtectedPage(${Component.displayName || Component.name || 'Component'})`;
  
  return ProtectedPageComponent;
};


const AccessControl = {
  ProtectedRoute,
  RoleBasedComponent,
  RHOnly,
  AssureOnly,
  RHAndAssure,
  GestionnaireOnly,
  AdminOnly,
  useRoleGuards,
  RoleDebugger,
  createProtectedPage
};

export default AccessControl;

export {
  ProtectedRoute as Route,
  RoleBasedComponent as Show,
  RHOnly as ForRH,
  AssureOnly as ForAssure,
  RHAndAssure as ForBoth
};