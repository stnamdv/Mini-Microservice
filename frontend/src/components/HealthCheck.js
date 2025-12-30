import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const HealthCheck = () => {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHealthStatus();
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchHealthStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchHealthStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/health');
      const data = await response.json();
      setHealthData(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch health status');
      console.error('Health check error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return '#27ae60';
      case 'unhealthy':
        return '#e74c3c';
      case 'error':
        return '#f39c12';
      default:
        return '#95a5a6';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return '✅';
      case 'unhealthy':
        return '❌';
      case 'error':
        return '⚠️';
      default:
        return '❓';
    }
  };

  if (loading && !healthData) {
    return (
      <div className="loading">
        <h2>Loading health status...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <h2>Error</h2>
        <p>{error}</p>
        <button className="btn" onClick={fetchHealthStatus}>Try Again</button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 className="page-title" style={{ margin: 0 }}>System Health Check</h1>
        <button className="btn" onClick={fetchHealthStatus} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {healthData && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3 style={{ marginTop: 0 }}>
            Overall Status: {getStatusIcon(healthData.status)}
            <span style={{
              color: getStatusColor(healthData.status),
              marginLeft: '10px',
              fontWeight: 'bold'
            }}>
              {healthData.status.toUpperCase()}
            </span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginTop: '15px' }}>
            <div><strong>Response Time:</strong> {healthData.responseTime}</div>
            <div><strong>Uptime:</strong> {Math.floor(healthData.uptime / 3600)}h {Math.floor((healthData.uptime % 3600) / 60)}m</div>
            <div><strong>Last Check:</strong> {new Date(healthData.timestamp).toLocaleString()}</div>
            <div><strong>Version:</strong> {healthData.version}</div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Services Health */}
        <div className="card">
          <h3>Services</h3>
          {healthData?.services?.filter(service => !service.name.includes('DB') && !service.name.includes('Kafka'))?.map((service, index) => (
            <div key={index} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px',
              margin: '5px 0',
              borderRadius: '4px',
              backgroundColor: service.status === 'healthy' ? '#d5f4e6' : '#f8d7da'
            }}>
              <span>{service.name}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {service.responseTime && <small>{service.responseTime}ms</small>}
                <span style={{
                  color: getStatusColor(service.status),
                  fontWeight: 'bold'
                }}>
                  {getStatusIcon(service.status)} {service.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Databases Health */}
        <div className="card">
          <h3>Databases & Message Queue</h3>
          {healthData?.services?.filter(service => service.name.includes('DB') || service.name.includes('Kafka'))?.map((service, index) => (
            <div key={index} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px',
              margin: '5px 0',
              borderRadius: '4px',
              backgroundColor: service.status === 'healthy' ? '#d5f4e6' : '#f8d7da'
            }}>
              <span>{service.name}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {service.details && (
                  <small>
                    {service.details.collections !== undefined && `${service.details.collections} collections, `}
                    {service.details.brokers !== undefined && `${service.details.brokers} brokers, `}
                    {service.details.topics !== undefined && `${service.details.topics} topics`}
                  </small>
                )}
                <span style={{
                  color: getStatusColor(service.status),
                  fontWeight: 'bold'
                }}>
                  {getStatusIcon(service.status)} {service.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Error Details */}
      {healthData?.services?.some(service => service.error) && (
        <div className="card" style={{ marginTop: '20px', border: '1px solid #e74c3c' }}>
          <h3 style={{ color: '#e74c3c', marginTop: 0 }}>⚠️ Error Details</h3>
          {healthData.services.filter(service => service.error).map((service, index) => (
            <div key={index} style={{
              padding: '10px',
              margin: '5px 0',
              backgroundColor: '#f8d7da',
              borderRadius: '4px',
              border: '1px solid #e74c3c'
            }}>
              <strong>{service.name}:</strong> {service.error}
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <Link to="/" className="btn btn-secondary">← Back to Products</Link>
      </div>
    </div>
  );
};

export default HealthCheck;
