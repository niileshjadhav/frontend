import React, { useState } from 'react';
import { apiService } from '../services/api';
import type { LoginRequest } from '../services/api';
import './Login.css';

interface LoginProps {
  onLogin: (userInfo: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [credentials, setCredentials] = useState<LoginRequest>({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiService.login(credentials);
      // Get the full user info including permissions
      const userInfo = await apiService.getCurrentUser();
      onLogin(userInfo);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="logo-section">
          <div className="logo-container">
            <img src="/DSI_logo.png" alt="Logo" className="logo" />
          </div>
        </div>
        
        <div className="form-section">
          <div className="login-header">
            <h1>☁️ Cloud Inventory</h1>
            <h2>Log Management</h2>
            <p>Database Operation System</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={credentials.username}
                onChange={handleInputChange}
                required
                disabled={loading}
                placeholder="Admin"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleInputChange}
                required
                disabled={loading}
                placeholder="••••••••"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" disabled={loading} className="login-button">
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;