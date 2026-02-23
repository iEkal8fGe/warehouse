import React, { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
// UI
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
// API
import { authAPI } from '../lib/api';

interface LoginProps {
  onLogin: (token: string) => void; //, role: 'admin' | 'employee') => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // TODO: Заменить на реальный API запрос
    try {
      const response = await authAPI.login(formData.username, formData.password);
      const { access_token } = response.data;
      onLogin(access_token);
    } catch (e: any) {
      console.error('Login error: ', e);

      if (e.response?.status === 400) {
        setErrors({ general: 'Incorrect username or password' });
      } else if (e.response?.status === 401) {
        setErrors({ general: 'Unauthorized' });
      } else {
        setErrors({ general: 'Connection error. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
    //
    // setTimeout(() => {
    //   if (formData.username === 'admin' && formData.password === 'admin') {
    //     onLogin('admin-mock-token', 'admin');
    //   } else if (formData.username === 'employee' && formData.password === 'employee') {
    //     onLogin('employee-mock-token', 'employee');
    //   } else {
    //     setErrors({ general: 'Incorrect username or password' });
    //   }
    //   setLoading(false);
    // }, 1000);
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-left">
          <div className="brand">
            <h1>Warehouse</h1>
            <p>System of wh management</p>
          </div>
        </div>

        <div className="login-right">
          <Card className="login-card">
            <h2 className="login-title">Welcome</h2>
            <p className="login-subtitle">Authorize to continue</p>

            <form onSubmit={handleSubmit} className="login-form">
              {errors.general && (
                <div className="error-message">{errors.general}</div>
              )}

              <Input
                label="Username"
                type="text"
                placeholder="Enter username"
                icon={<Mail size={18} />}
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                error={errors.username}
                disabled={loading}
              />

              <Input
                label="Password"
                type="password"
                placeholder="Enter the password"
                icon={<Lock size={18} />}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                error={errors.password}
                disabled={loading}
              />

              <div className="form-options">
                <label className="remember">
                  <input type="checkbox" /> Remember me
                </label>
              </div>

              <Button
                type="submit"
                fullWidth
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <span className="loading">Вход...</span>
                ) : (
                  <>
                    <span>Log in</span>
                  </>
                )}
              </Button>
            </form>
          </Card>
        </div>
      </div>

      <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .login-wrapper {
          width: 90%;
          max-width: 1200px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          padding: 20px;
        }
        .login-left {
          color: white;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .brand h1 {
          font-size: 3rem;
          margin-bottom: 10px;
        }
        .brand p {
          font-size: 1.2rem;
          opacity: 0.9;
        }
        .login-card {
          width: 100%;
        }
        .login-title {
          text-align: center;
          margin-bottom: 10px;
        }
        .login-subtitle {
          text-align: center;
          opacity: 0.7;
          margin-bottom: 30px;
        }
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .error-message {
          padding: 12px;
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid var(--danger);
          border-radius: var(--radius-sm);
          color: white;
          text-align: center;
        }
        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: rgba(255, 255, 255, 0.7);
        }
        .remember {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .loading {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        @media (max-width: 768px) {
          .login-wrapper {
            grid-template-columns: 1fr;
          }
          .login-left {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;