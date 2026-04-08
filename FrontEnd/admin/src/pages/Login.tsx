import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ShieldAlert, LogIn, AlertCircle } from 'lucide-react';
import { authApi } from '../api/api';

const Login: React.FC = () => {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await authApi.login(email, password);
      
      if (res.success) {
        const user = res.data.user;
        // Check if role is ADMIN (usually role comes as an object or string)
        const isAdmin = user.role === 'ROLE_ADMIN' || (user.role && user.role.name === 'ROLE_ADMIN');
        
        if (isAdmin) {
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user', JSON.stringify(user));
          navigate('/');
        } else {
          setError('Tài khoản của bạn không có quyền truy cập Admin.');
        }
      } else {
        setError(res.message || 'Đăng nhập thất bại.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Email hoặc mật khẩu không đúng.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">MF</div>
          <h1>MemoFlow Admin</h1>
          <p>Đăng nhập vào hệ thống quản trị</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          {error && (
            <div className="error-alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="input-field">
            <label>Email</label>
            <div className="input-wrapper">
              <Mail size={18} className="field-icon" />
              <input 
                type="email" 
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-field">
            <label>Mật khẩu</label>
            <div className="input-wrapper">
              <Lock size={18} className="field-icon" />
              <input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <div className="spinner"></div>
            ) : (
              <>
                <LogIn size={20} />
                <span>Đăng nhập</span>
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <ShieldAlert size={16} />
          <span>Hệ thống bảo mật nội bộ</span>
        </div>
      </div>

      <style>{`
        .login-page {
          height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        }

        .login-card {
          width: 100%;
          max-width: 400px;
          background: rgba(30, 41, 59, 0.7);
          backdrop-filter: blur(20px);
          padding: 48px;
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .login-logo {
          width: 48px;
          height: 48px;
          background: var(--primary);
          color: white;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.5rem;
          margin: 0 auto 16px;
          box-shadow: 0 8px 16px rgba(99, 102, 241, 0.3);
        }

        .login-header h1 {
          font-size: 1.5rem;
          margin-bottom: 8px;
        }

        .login-header p {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .error-alert {
          background-color: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #ef4444;
          padding: 12px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
          font-size: 0.85rem;
        }

        .input-field {
          margin-bottom: 20px;
        }

        .input-field label {
          display: block;
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: 8px;
          font-weight: 600;
        }

        .input-wrapper {
          position: relative;
        }

        .field-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-secondary);
        }

        .input-wrapper input {
          width: 100%;
          padding: 12px 14px 12px 40px;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: white;
          font-size: 1rem;
          transition: all 0.2s;
        }

        .input-wrapper input:focus {
          border-color: var(--primary);
          outline: none;
          background: rgba(0, 0, 0, 0.3);
        }

        .login-btn {
          width: 100%;
          height: 48px;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 1rem;
          margin-top: 12px;
        }

        .login-btn:hover {
          background-color: var(--primary-hover);
          transform: translateY(-2px);
        }

        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .login-footer {
          margin-top: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: var(--text-secondary);
          font-size: 0.75rem;
          opacity: 0.6;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Login;
