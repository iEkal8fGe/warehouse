import React, { useState } from 'react';
import { Mail, Lock, LogIn } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

interface LoginProps {
  onLogin: (token: string) => void;
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
    setTimeout(() => {
      // Моковая проверка
      if (formData.username === 'admin' && formData.password === 'admin') {
        onLogin('mock-token-12345');
      } else {
        setErrors({ general: 'Неверное имя пользователя или пароль' });
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-left">
          <div className="brand">
            <h1>Warehouse MS</h1>
            <p>Система управления складом</p>
          </div>

          <div className="features">
            <div className="feature-item">
              <div className="feature-icon">📦</div>
              <div>
                <h3>Управление складом</h3>
                <p>Полный контроль над товарами и поставками</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">👥</div>
              <div>
                <h3>Командная работа</h3>
                <p>Распределение прав между сотрудниками</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📊</div>
              <div>
                <h3>Аналитика</h3>
                <p>Детальные отчеты и статистика</p>
              </div>
            </div>
          </div>
        </div>

        <div className="login-right">
          <Card className="login-card">
            <h2 className="login-title">Добро пожаловать!</h2>
            <p className="login-subtitle">Войдите в систему, чтобы продолжить</p>

            <form onSubmit={handleSubmit} className="login-form">
              {errors.general && (
                <div className="error-message">{errors.general}</div>
              )}

              <Input
                label="Имя пользователя"
                type="text"
                placeholder="Введите имя пользователя"
                icon={<Mail size={18} />}
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                error={errors.username}
                disabled={loading}
              />

              <Input
                label="Пароль"
                type="password"
                placeholder="Введите пароль"
                icon={<Lock size={18} />}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                error={errors.password}
                disabled={loading}
              />

              <div className="form-options">
                <label className="remember">
                  <input type="checkbox" /> Запомнить меня
                </label>
                <a href="#" className="forgot-password">Забыли пароль?</a>
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
                    <LogIn size={18} />
                    <span>Войти в систему</span>
                  </>
                )}
              </Button>
            </form>

            <div className="demo-credentials">
              <p>Демо данные: admin / admin</p>
            </div>
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
        .features {
          margin-top: 50px;
        }
        .feature-item {
          display: flex;
          gap: 20px;
          margin-bottom: 30px;
          align-items: center;
        }
        .feature-icon {
          font-size: 2.5rem;
        }
        .feature-item h3 {
          margin-bottom: 5px;
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
        .forgot-password {
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          transition: var(--transition);
        }
        .forgot-password:hover {
          color: white;
        }
        .loading {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .demo-credentials {
          margin-top: 30px;
          text-align: center;
          opacity: 0.5;
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