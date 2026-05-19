import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '@/lib/context';
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  LogOut,
  UserCircle,
  ChevronRight,
  Shield,
} from 'lucide-react';
import clsx from 'clsx';

export default function StaffLayout() {
  const { state, logout } = useApp();
  const navigate = useNavigate();
  const user = state.currentUser;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/staff', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/staff/applications', label: 'Applications', icon: FileText, end: false },
    { to: '/staff/users', label: 'Users', icon: Users, end: false },
    { to: '/staff/reports', label: 'Reports', icon: BarChart3, end: false },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 flex flex-col shrink-0">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
              <ChevronRight className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">LoanFlow</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <Shield className="w-3 h-3 text-blue-400" />
            <span className="text-xs text-blue-400 font-medium">Staff Portal</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                )
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center">
              <UserCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-slate-400 truncate">Staff</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
