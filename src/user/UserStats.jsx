import React from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../hooks/useAuth';


const UserStats = ({ size = 'md', showName = false, user: customUser }) => {
  const { user: authUser } = useAuth();
  const user = customUser || authUser;

  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg'
  };

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.username?.substring(0, 2).toUpperCase() || 'US';
  };

  return (
    <div className="flex items-center space-x-2">
      <div
        className={`${sizeClasses[size]} bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium shadow-sm`}
        aria-label="Avatar utilisateur"
      >
        {getInitials()}
      </div>
      {showName && (
        <span className="font-medium text-gray-700">
          {user?.firstName || user?.username || 'Utilisateur'}
        </span>
      )}
    </div>
  );
};

UserStats.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  showName: PropTypes.bool,
  user: PropTypes.shape({
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    username: PropTypes.string
  })
};

export default UserStats;