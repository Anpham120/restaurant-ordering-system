import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';

const ROLE_ROUTES: Record<string, string> = {
  Manager: '/manager',
  Staff: '/staff',
  Kitchen: '/kitchen',
  Cashier: '/cashier',
};

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const err = await login(email.trim(), password);
    setLoading(false);

    if (err) {
      setError(err);
      return;
    }

    const storedUser = JSON.parse(sessionStorage.getItem('restaurant_user') ?? '{}');
    const role = storedUser?.role as string | undefined;
    navigate(ROLE_ROUTES[role ?? ''] ?? '/staff', { replace: true });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Restaurant Ordering System</h1>
        <h2>Đăng nhập</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="manager@restaurant.com"
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}
