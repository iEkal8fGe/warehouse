import React, { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

interface LoginProps {
  onLogin: (token: string, role: 'admin' | 'employee') => void;
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

      try {
        const formDataObj = new FormData();
        formDataObj.append('username', formData.username);
        formDataObj.append('password', formData.password);

        // Указываем полный URL
        const response = await fetch('http://127.0.0.1:8000/api/v1/auth/login', {
          method: 'POST',
          body: formDataObj,
        });

        // Сначала проверим статус ответа
        if (!response.ok) {
          const errorText = await response.text(); // Получаем текст ошибки
          console.error('Server error response:', errorText);

          try {
            const errorData = JSON.parse(errorText);
            setErrors({ general: errorData.detail || 'Ошибка сервера' });
          } catch {
            setErrors({ general: `Ошибка ${response.status}: ${response.statusText}` });
          }
          return;
        }

        // Проверяем, есть ли контент в ответе
        const responseText = await response.text();
        console.log('Raw response:', responseText);

        if (!responseText) {
          setErrors({ general: 'Пустой ответ от сервера' });
          return;
        }

        const data = JSON.parse(responseText);
        onLogin(data.access_token, data.role);

      } catch (error) {
        console.error('Login error:', error);
        setErrors({ general: 'Ошибка соединения с сервером' });
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-left">
          <div className="brand">
            <h1>Warehouse</h1>
            <p>Management System</p>
          </div>
        </div>

        <div className="login-right">
          <Card className="login-card">
            <h2 className="login-title">Welcome</h2>
            <p className="login-subtitle">Authorize to keep</p>

            <form onSubmit={handleSubmit} className="login-form">
              {errors.general && (
                <div className="error-message">{errors.general}</div>
              )}

              <Input
                label="Username"
                type="text"
                placeholder="Enter the username"
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
                  <span className="loading">Logining</span>
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