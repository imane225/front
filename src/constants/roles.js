export const ROLES = {
  RH: 'RH',           
  ASSURE: 'ASSURE',   
  ADMIN: 'ADMIN',     
  GESTIONNAIRE: 'GESTIONNAIRE' 
};

export const ROLE_LABELS = {
  [ROLES.RH]: 'Ressources Humaines',
  [ROLES.ASSURE]: 'Assuré',
  [ROLES.GESTIONNAIRE]: 'Gestionnaire',
  [ROLES.ADMIN]: 'Administrateur'
};

export const ROLE_COLORS = {
  [ROLES.RH]: 'bg-blue-100 text-blue-800 border-blue-200',
  [ROLES.ASSURE]: 'bg-green-100 text-green-800 border-green-200',
  [ROLES.GESTIONNAIRE]: 'bg-purple-100 text-purple-800 border-purple-200',
  [ROLES.ADMIN]: 'bg-red-100 text-red-800 border-red-200',
  DEFAULT: 'bg-gray-100 text-gray-800 border-gray-200'
};

export const ROLE_HIERARCHY = [ROLES.ADMIN, ROLES.RH, ROLES.GESTIONNAIRE, ROLES.ASSURE];

export const ROLE_DEFAULT_ROUTES = {
  [ROLES.RH]: '/dashboard/rh',
  [ROLES.ASSURE]: '/mes-sinistres',
  [ROLES.GESTIONNAIRE]: '/gestion/dashboard',
  [ROLES.ADMIN]: '/admin/dashboard'
};



export const PERMISSIONS = {
  VIEW_ALL_SINISTRES: 'view_all_sinistres',
  VIEW_OWN_SINISTRES: 'view_own_sinistres',
  CREATE_SINISTRE: 'create_sinistre',
  MODIFY_SINISTRE: 'modify_sinistre',
  DELETE_SINISTRE: 'delete_sinistre',
  
  MANAGE_ASSURES: 'manage_assures',
  VIEW_ALL_ASSURES: 'view_all_assures',
  CREATE_ASSURE: 'create_assure',
  MODIFY_ASSURE: 'modify_assure',
  
  VIEW_REPORTS: 'view_reports',
  EXPORT_DATA: 'export_data',
  VIEW_STATISTICS: 'view_statistics',
  
  ACCESS_ADMIN: 'access_admin',
  MANAGE_USERS: 'manage_users',
  SYSTEM_CONFIG: 'system_config'
};

export const ROLE_PERMISSIONS = {
  [ROLES.RH]: [
    PERMISSIONS.VIEW_ALL_SINISTRES,
    PERMISSIONS.VIEW_OWN_SINISTRES,
    PERMISSIONS.CREATE_SINISTRE,
    PERMISSIONS.MODIFY_SINISTRE,
    PERMISSIONS.DELETE_SINISTRE,
    PERMISSIONS.MANAGE_ASSURES,
    PERMISSIONS.VIEW_ALL_ASSURES,
    PERMISSIONS.CREATE_ASSURE,
    PERMISSIONS.MODIFY_ASSURE,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.VIEW_STATISTICS,
    PERMISSIONS.ACCESS_ADMIN
  ],
  
  [ROLES.ASSURE]: [
    PERMISSIONS.VIEW_OWN_SINISTRES
  ],
  
  [ROLES.GESTIONNAIRE]: [
    PERMISSIONS.VIEW_ALL_SINISTRES,
    PERMISSIONS.CREATE_SINISTRE,
    PERMISSIONS.MODIFY_SINISTRE,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.VIEW_STATISTICS
  ],
  
  [ROLES.ADMIN]: [
    ...Object.values(PERMISSIONS)
  ]
};



export const TABLE_COLUMNS = {
  sinistres: {
    [ROLES.RH]: ['numero', 'date', 'assure', 'montant', 'etat', 'typeAssurance', 'commentaires', 'actions'],
    [ROLES.ASSURE]: ['numero', 'date', 'description', 'etat', 'montantRembourse', 'dateRemboursement'],
    [ROLES.GESTIONNAIRE]: ['numero', 'date', 'assure', 'montant', 'etat', 'actions'],
    [ROLES.ADMIN]: ['numero', 'date', 'assure', 'montant', 'etat', 'typeAssurance', 'gestionnaire', 'commentaires', 'actions']
  },
  
  assures: {
    [ROLES.RH]: ['id', 'nom', 'email', 'dateInscription', 'nombreSinistres', 'statut', 'actions'],
    [ROLES.ASSURE]: ['nom', 'email', 'dateInscription', 'nombreSinistres'],
    [ROLES.GESTIONNAIRE]: ['id', 'nom', 'email', 'nombreSinistres', 'statut'],
    [ROLES.ADMIN]: ['id', 'nom', 'email', 'dateInscription', 'nombreSinistres', 'statut', 'lastLogin', 'actions']
  }
};


export const keycloakRoleUtils = {
  extractRealmRoles: (keycloak) => {
    const roles = keycloak?.realmAccess?.roles || [];
    console.log('🏰 Rôles realm extraits:', roles);
    return roles;
  },
  
  extractClientRoles: (keycloak, clientId = 'rma-web-client') => {
    const roles = keycloak?.resourceAccess?.[clientId]?.roles || [];
    console.log('👥 Rôles client extraits:', roles);
    return roles;
  },
  
  extractBusinessRoles: (keycloak) => {
    const realmRoles = keycloakRoleUtils.extractRealmRoles(keycloak);
    const businessRoles = realmRoles.filter(role => ['RH', 'ASSURE', 'ADMIN', 'GESTIONNAIRE'].includes(role));
    
    console.log('🎯 Rôles métier détectés:', businessRoles);
    
    if (businessRoles.length === 0) {
      console.warn('⚠️ Aucun rôle métier trouvé, assignation du rôle ASSURE par défaut');
      return [ROLES.ASSURE]; 
    }
    
    return businessRoles;
  },
  
  validateRolesFromKeycloak: (keycloak, clientId = 'rma-web-client') => {
    try {
      if (!keycloak || !keycloak.authenticated) {
        return {
          success: false,
          error: 'Keycloak non authentifié',
          keycloakRoles: [],
          applicationRoles: [],
          primaryRole: null,
          isRH: false,
          isAssure: false
        };
      }
      
      const realmRoles = keycloakRoleUtils.extractRealmRoles(keycloak);
      const clientRoles = keycloakRoleUtils.extractClientRoles(keycloak, clientId);
      const businessRoles = keycloakRoleUtils.extractBusinessRoles(keycloak);
      
      const isRH = businessRoles.includes(ROLES.RH);
      const isAssure = businessRoles.includes(ROLES.ASSURE);
      const primaryRole = roleUtils.getPrimaryRole(businessRoles);
      
      console.log('✅ Validation des rôles Keycloak réussie:', {
        primaryRole,
        isRH,
        isAssure,
        businessRoles
      });
      
      return {
        success: true,
        keycloakRoles: realmRoles,
        clientRoles,
        applicationRoles: businessRoles,
        primaryRole,
        isRH,
        isAssure,
        hasAnyRole: businessRoles.length > 0
      };
    } catch (error) {
      console.error('❌ Erreur lors de la validation des rôles:', error);
      return {
        success: false,
        error: error.message,
        keycloakRoles: [],
        applicationRoles: [ROLES.ASSURE], 
        primaryRole: ROLES.ASSURE,
        isRH: false,
        isAssure: true
      };
    }
  },
  
  detectUserType: (keycloak) => {
    const validation = keycloakRoleUtils.validateRolesFromKeycloak(keycloak);
    
    if (validation.isRH) {
      return {
        type: 'RH',
        description: 'Employé des Ressources Humaines',
        capabilities: ['Gestion complète des sinistres', 'Gestion des assurés', 'Rapports et statistiques'],
        defaultRoute: ROLE_DEFAULT_ROUTES[ROLES.RH]
      };
    }
    
    if (validation.isAssure) {
      return {
        type: 'ASSURE',
        description: 'Assuré de la compagnie',
        capabilities: ['Consultation de ses sinistres', 'Suivi des remboursements'],
        defaultRoute: ROLE_DEFAULT_ROUTES[ROLES.ASSURE]
      };
    }
    
    return {
      type: 'UNKNOWN',
      description: 'Type d\'utilisateur non déterminé',
      capabilities: [],
      defaultRoute: '/dashboard'
    };
  }
};



export const roleUtils = {
  hasRole: (userRoles, role) => {
    if (!Array.isArray(userRoles)) {
      console.warn('⚠️ userRoles doit être un tableau:', userRoles);
      return false;
    }
    const hasRole = userRoles.includes(role);
    console.log(`🔍 Vérification rôle "${role}":`, hasRole ? '✅' : '❌');
    return hasRole;
  },
  
  hasAnyRole: (userRoles, roles) => {
    if (!Array.isArray(userRoles) || !Array.isArray(roles)) {
      console.warn('⚠️ Paramètres invalides pour hasAnyRole:', { userRoles, roles });
      return false;
    }
    const hasAny = roles.some(role => userRoles.includes(role));
    console.log(`🔍 Vérification rôles [${roles.join(', ')}]:`, hasAny ? '✅' : '❌');
    return hasAny;
  },
  
  getPrimaryRole: (userRoles) => {
    if (!Array.isArray(userRoles) || userRoles.length === 0) {
      console.warn('⚠️ Aucun rôle, assignation ASSURE par défaut');
      return ROLES.ASSURE;
    }
    
    for (const role of ROLE_HIERARCHY) {
      if (userRoles.includes(role)) {
        console.log('🎭 Rôle principal détecté:', role);
        return role;
      }
    }
    
    const fallbackRole = userRoles[0];
    console.warn('⚠️ Rôle hors hiérarchie, utilisation du premier rôle:', fallbackRole);
    return fallbackRole;
  },
  
  isRH: (userRoles) => {
    const result = roleUtils.hasRole(userRoles, ROLES.RH);
    if (result) console.log('🏢 Utilisateur RH confirmé');
    return result;
  },
  
  isAssure: (userRoles) => {
    const result = roleUtils.hasRole(userRoles, ROLES.ASSURE);
    if (result) console.log('👤 Utilisateur ASSURE confirmé');
    return result;
  },
  
  isAdmin: (userRoles) => {
    const result = roleUtils.hasRole(userRoles, ROLES.ADMIN);
    if (result) console.log('⚡ Utilisateur ADMIN confirmé');
    return result;
  },
  
  _permissionCache: new Map(),
  
  hasPermission: (userRoles, permission) => {
    const cacheKey = `${JSON.stringify(userRoles.sort())}-${permission}`;
    
    if (roleUtils._permissionCache.has(cacheKey)) {
      return roleUtils._permissionCache.get(cacheKey);
    }
    
    const primaryRole = roleUtils.getPrimaryRole(userRoles);
    const rolePermissions = ROLE_PERMISSIONS[primaryRole] || [];
    const hasPermission = rolePermissions.includes(permission);
    
    roleUtils._permissionCache.set(cacheKey, hasPermission);
    console.log(`🔐 Permission "${permission}" pour ${primaryRole}:`, hasPermission ? '✅' : '❌');
    
    return hasPermission;
  },
  
  getUserPermissions: (userRoles) => {
    const primaryRole = roleUtils.getPrimaryRole(userRoles);
    const permissions = ROLE_PERMISSIONS[primaryRole] || [];
    console.log(`📋 Permissions pour ${primaryRole}:`, permissions.length, 'permissions');
    return permissions;
  },
  
  filterDataByRole: (data, userRoles, userId, userField = 'userId') => {
    if (!Array.isArray(data)) {
      console.warn('⚠️ Données invalides pour le filtrage:', data);
      return [];
    }
    
    const primaryRole = roleUtils.getPrimaryRole(userRoles);
    
    if (roleUtils.isRH(userRoles) || roleUtils.isAdmin(userRoles)) {
      console.log(`✅ ${primaryRole} accès complet (${data.length} éléments)`);
      return data;
    }
    
    if (roleUtils.isAssure(userRoles)) {
      const filteredData = data.filter(item => {
        const itemUserId = item[userField];
        return itemUserId === userId;
      });
      console.log(`🔒 ASSURE - données filtrées: ${filteredData.length}/${data.length} éléments`);
      return filteredData;
    }
    
    if (roleUtils.hasRole(userRoles, ROLES.GESTIONNAIRE)) {
      console.log(`👥 GESTIONNAIRE accès complet (${data.length} éléments)`);
      return data;
    }
    
    console.warn('⚠️ Rôle non reconnu, accès restreint');
    return [];
  },
  
  canPerformAction: (userRoles, action, context = {}) => {
    const primaryRole = roleUtils.getPrimaryRole(userRoles);
    
    if (roleUtils.isAdmin(userRoles)) {
      console.log(`🔓 ADMIN - Action "${action}" autorisée`);
      return true;
    }
    
    let canPerform = false;
    
    switch (action) {
      case 'view_all_sinistres':
        canPerform = roleUtils.isRH(userRoles);
        break;
      
      case 'create_sinistre':
        canPerform = roleUtils.isRH(userRoles);
        break;
      
      case 'modify_sinistre':
        if (roleUtils.isRH(userRoles)) {
          canPerform = true;
        } else if (roleUtils.isAssure(userRoles) && context.sinistre) {
          canPerform = context.sinistre.userId === context.currentUserId;
        }
        break;
      
      case 'delete_sinistre':
        canPerform = roleUtils.isRH(userRoles); 
        break;
      
      case 'view_own_sinistres':
        canPerform = true; 
        break;
      
      case 'manage_assures':
        canPerform = roleUtils.isRH(userRoles); 
        break;
      
      case 'export_data':
        canPerform = roleUtils.isRH(userRoles);
        break;
      
      case 'view_reports':
        canPerform = roleUtils.isRH(userRoles);
        break;
      
      default:
        console.warn(`⚠️ Action inconnue: ${action}`);
        canPerform = false;
    }
    
    console.log(`🎯 Action "${action}" pour ${primaryRole}:`, canPerform ? '✅ Autorisée' : '❌ Refusée');
    return canPerform;
  },
  
  getAccessDeniedMessage: (userRoles, requiredRoles = []) => {
    const primaryRole = roleUtils.getPrimaryRole(userRoles);
    
    if (requiredRoles.includes(ROLES.RH) && !roleUtils.isRH(userRoles)) {
      return 'Cette fonctionnalité est réservée aux Ressources Humaines.';
    }
    
    if (roleUtils.isAssure(userRoles)) {
      return 'En tant qu\'assuré, vous n\'avez accès qu\'à vos propres données.';
    }
    
    return `Accès refusé. Votre rôle (${primaryRole}) ne permet pas cette action.`;
  },
  
  getRoleLabel: (role) => ROLE_LABELS[role] || role,
  getRoleColor: (role) => ROLE_COLORS[role] || ROLE_COLORS.DEFAULT,
  getDefaultRoute: (userRoles) => {
    const primaryRole = roleUtils.getPrimaryRole(userRoles);
    return ROLE_DEFAULT_ROUTES[primaryRole] || '/dashboard';
  },
  
  getVisibleColumns: (tableType, userRoles) => {
    const primaryRole = roleUtils.getPrimaryRole(userRoles);
    return TABLE_COLUMNS[tableType]?.[primaryRole] || [];
  },
  
  clearPermissionCache: () => {
    roleUtils._permissionCache.clear();
    console.log('🧹 Cache des permissions nettoyé');
  }
};



export const createRoleHooks = (useAuth) => ({
  useRoleGuards: () => {
    const { user, keycloak } = useAuth();
    
    const rolesInfo = keycloakRoleUtils.validateRolesFromKeycloak(keycloak);
    const roles = rolesInfo.applicationRoles;
    const userType = keycloakRoleUtils.detectUserType(keycloak);
    
    return {
      roles,
      primaryRole: rolesInfo.primaryRole,
      userType,
      isRH: rolesInfo.isRH,
      isAssure: rolesInfo.isAssure,
      
      canManageSinistres: () => roleUtils.canPerformAction(roles, 'view_all_sinistres'),
      canCreateSinistre: () => roleUtils.canPerformAction(roles, 'create_sinistre'),
      canManageAssures: () => roleUtils.canPerformAction(roles, 'manage_assures'),
      canViewReports: () => roleUtils.canPerformAction(roles, 'view_reports'),
      canExportData: () => roleUtils.canPerformAction(roles, 'export_data'),
      
      canViewSinistre: (sinistre) => {
        if (roleUtils.isRH(roles)) return true;
        if (roleUtils.isAssure(roles)) return sinistre?.userId === user?.id;
        return false;
      },
      
      canModifySinistre: (sinistre) => {
        return roleUtils.canPerformAction(roles, 'modify_sinistre', {
          sinistre,
          currentUserId: user?.id
        });
      },
      
      filterSinistres: (sinistres) => {
        return roleUtils.filterDataByRole(sinistres, roles, user?.id, 'userId');
      },
      
      getSinistreColumns: () => roleUtils.getVisibleColumns('sinistres', roles),
      getAssureColumns: () => roleUtils.getVisibleColumns('assures', roles),
      
      getDefaultRoute: () => roleUtils.getDefaultRoute(roles),
      
      debugInfo: () => ({
        keycloakAuth: keycloak?.authenticated,
        userId: user?.id,
        userType,
        roles,
        primaryRole: rolesInfo.primaryRole,
        permissions: roleUtils.getUserPermissions(roles)
      })
    };
  }
});



export const validateUserAccess = (userRoles, requiredRoles, resource = null, keycloak = null) => {
  if (keycloak && !keycloak.authenticated) {
    return {
      allowed: false,
      reason: 'not_authenticated',
      message: 'Authentification Keycloak requise'
    };
  }
  
  if (requiredRoles.length > 0 && !roleUtils.hasAnyRole(userRoles, requiredRoles)) {
    return {
      allowed: false,
      reason: 'insufficient_roles',
      message: roleUtils.getAccessDeniedMessage(userRoles, requiredRoles)
    };
  }
  
  if (resource && resource.type === 'sinistre' && roleUtils.isAssure(userRoles)) {
    if (resource.userId !== resource.currentUserId) {
      return {
        allowed: false,
        reason: 'not_owner',
        message: 'Vous pouvez uniquement accéder à vos propres sinistres.'
      };
    }
  }
  
  return {
    allowed: true,
    reason: 'authorized',
    message: 'Accès autorisé'
  };
};


export const RoleGuard = ({ 
  requiredRoles = [], 
  fallback = null, 
  children, 
  resource = null,
  useAuth 
}) => {
  const { user, keycloak } = useAuth();
  const rolesInfo = keycloakRoleUtils.validateRolesFromKeycloak(keycloak);
  
  const validation = validateUserAccess(
    rolesInfo.applicationRoles, 
    requiredRoles, 
    resource ? { ...resource, currentUserId: user?.id } : null,
    keycloak
  );
  
  if (!validation.allowed) {
    console.warn('🚫 Accès refusé par RoleGuard:', validation);
    
    if (fallback) return fallback;
    
    return (
      <div className="flex items-center justify-center min-h-64 bg-red-50 border border-red-200 rounded-lg">
        <div className="text-center p-6">
          <div className="text-red-600 text-4xl mb-4">🚫</div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Accès refusé</h3>
          <p className="text-red-600">{validation.message}</p>
          {rolesInfo.isAssure && (
            <p className="text-sm text-red-500 mt-2">
              En tant qu'assuré, vous avez accès uniquement à vos données personnelles.
            </p>
          )}
        </div>
      </div>
    );
  }
  
  return children;
};



export default {
  ROLES,
  ROLE_LABELS,
  ROLE_COLORS,
  ROLE_HIERARCHY,
  ROLE_DEFAULT_ROUTES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  TABLE_COLUMNS,
  roleUtils,
  keycloakRoleUtils,
  createRoleHooks,
  validateUserAccess,
  RoleGuard
};