import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const AccessDenied = ({ 
  requiredRoles = [], 
  username = 'Utilisateur',
  customMessage = null 
}) => {
  const navigate = useNavigate();
  const { isRH, isAssure, roles } = useAuth();

  const handleGoBack = () => {
    navigate(-1); 
  };

  const handleGoHome = () => {
    if (isRH()) {
      navigate('/dashboard');
    } else if (isAssure()) {
      navigate('/consultation/sinistres');
    } else {
      navigate('/');
    }
  };

  const getCurrentRoleLabel = () => {
    if (isRH()) return 'Ressources Humaines';
    if (isAssure()) return 'Assuré';
    return 'Utilisateur';
  };

  const getCurrentRoleColor = () => {
    if (isRH()) return 'bg-blue-100 text-blue-800';
    if (isAssure()) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  const formatRequiredRole = (role) => {
    switch (role) {
      case 'RH': return 'Ressources Humaines';
      case 'ASSURE': return 'Assuré';
      case 'GESTIONNAIRE': return 'Gestionnaire';
      case 'ADMIN': return 'Administrateur';
      default: return role;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-100 mb-6">
            <svg className="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>

          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            Accès refusé
          </h2>

          <p className="text-lg text-gray-600 mb-6">
            {customMessage || 'Vous n\'avez pas les permissions nécessaires pour accéder à cette page.'}
          </p>

          <div className="bg-gray-100 rounded-lg p-4 mb-6 text-left">
            <div className="text-sm text-gray-700 space-y-2">
              <div>
                <span className="font-medium">Utilisateur :</span> {username}
              </div>
              <div>
                <span className="font-medium">Votre rôle :</span> 
                <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getCurrentRoleColor()}`}>
                  {getCurrentRoleLabel()}
                </span>
              </div>
              {roles.length > 0 && (
                <div>
                  <span className="font-medium">Rôles actuels :</span>
                  <div className="mt-1">
                    {roles.map(role => (
                      <span key={role} className={`inline-block ml-2 px-2 py-1 rounded text-xs font-medium mr-1 ${getCurrentRoleColor()}`}>
                        {formatRequiredRole(role)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {requiredRoles.length > 0 && (
                <div>
                  <span className="font-medium">Rôles requis :</span>
                  <div className="mt-1">
                    {requiredRoles.map(role => (
                      <span key={role} className="inline-block ml-2 px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium mr-1">
                        {formatRequiredRole(role)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleGoBack}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour
            </button>
            
            <button
              onClick={handleGoHome}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Accueil
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-6">
            Si vous pensez que c'est une erreur, contactez votre administrateur système.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;