import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Moon, Sun, LogOut } from 'lucide-react';
import { useAuth } from '../auth/useAuth';

const ROLE_LABEL: Record<string, string> = {
  Manager: 'Quản Lý',
  Staff: 'Nhân Viên',
  Kitchen: 'Bếp',
  Cashier: 'Thu Ngân',
};

export function AdminLayout() {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    document.body.classList.add('light-theme');
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.body.classList.toggle('dark-theme', next === 'dark');
    document.body.classList.toggle('light-theme', next === 'light');
  };

  return (
    <div className={`admin-app ${theme}`}>
      <header className="admin-header">
        <div className="header-brand">
          <img src="/logo.png" alt="TV FOOD" className="header-logo" />
          <span className="header-title">TV FOOD Admin</span>
        </div>
        <div className="header-user-info">
          <span className="header-role-badge">{ROLE_LABEL[user?.role ?? ''] ?? user?.role}</span>
          <span className="header-username">{user?.fullName}</span>
        </div>
        <div className="header-action-buttons">
          <button className="btn-icon-circle theme-toggle" onClick={toggleTheme} title="Đổi giao diện">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button className="btn-logout" onClick={logout} title="Đăng xuất">
            <LogOut size={16} /> <span>Đăng xuất</span>
          </button>
        </div>
      </header>
      <main className="admin-workspace container">
        <Outlet />
      </main>
    </div>
  );
}
