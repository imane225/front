import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useAuthenticatedApi } from '../../hooks/useAuthenticatedApi';
import { formatRelativeDate, formatDuration } from '../../utils/formatters';

const ConnectionHistory = ({ userId, limit = 5, withStats = false }) => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { get } = useAuthenticatedApi();

  const generateMockData = useCallback(() => {
    return Array.from({ length: limit }, (_, i) => ({
      id: i,
      date: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)),
      ip: `192.168.1.${Math.floor(Math.random() * 100)}`,
      device: i % 2 === 0 ? 'Desktop' : 'Mobile',
      success: Math.random() > 0.2,
      duration: Math.floor(Math.random() * 120)
    }));
  }, [limit]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await get(`/users/${userId}/connections?limit=${limit}`);
        
        if (response.ok) {
          const data = await response.json();
          setConnections(data.connections);
        } else {
          throw new Error('Failed to load connection history');
        }
      } catch (err) {
        setError(err.message);
        setConnections(generateMockData());
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchData();
  }, [userId, limit, get, generateMockData]);

  const successRate = connections.length 
    ? Math.round((connections.filter(c => c.success).length / connections.length) * 100)
    : 0;

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(limit)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Historique des connexions</h3>
        {error && (
          <span className="text-xs text-orange-500">Données simulées</span>
        )}
      </div>

      <div className="space-y-3">
        {connections.map((conn, index) => (
          <div 
            key={conn.id} 
            className={`p-3 rounded border ${
              index === 0 ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">
                  {formatRelativeDate(conn.date)}
                  {index === 0 && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      Actuelle
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-600">
                  {conn.ip} • {conn.device}
                </p>
              </div>
              <div className="text-right">
                <span className={`font-medium ${
                  conn.success ? 'text-green-600' : 'text-red-600'
                }`}>
                  {conn.success ? 'Réussie' : 'Échouée'}
                </span>
                {conn.success && (
                  <p className="text-xs text-gray-500">
                    {formatDuration(conn.duration)}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {withStats && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm">
            Taux de réussite : <span className="font-medium">{successRate}%</span>
          </p>
          <p className="text-sm">
            Moyenne de session :{' '}
            <span className="font-medium">
              {formatDuration(
                connections.reduce((acc, curr) => acc + (curr.duration || 0), 0) / 
                Math.max(connections.length, 1)
              )}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

ConnectionHistory.propTypes = {
  userId: PropTypes.string.isRequired,
  limit: PropTypes.number,
  withStats: PropTypes.bool
};

export default ConnectionHistory;