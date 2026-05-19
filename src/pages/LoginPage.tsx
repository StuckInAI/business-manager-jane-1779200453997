import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '@/lib/context';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { ChevronRight, Lock } from 'lucide-react';

export default function LoginPage() {
  const { login, state } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const ok = login(email, password);
      setLoading(false);
      if (!ok) {
        setError('Invalid email or password. Please try again.');
      } else {
        const user = state.users.find(u => u.email === email);
        navigate(user?.role === 'staff' ? '/staff' : '/app');
      }
    }, 600);
  };

  const demoAccounts = [
    { label: 'Staff (Admin)', email: 'admin@loanflow.com', password: 'admin123' },
    { label: 'Customer (John)', email: 'john@example.com', password: 'password123' },
    { label: 'Customer (Emma)', email: 'emma@example.com', password: 'password123' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <ChevronRight className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">LoanFlow</span>
          </div>
          <p className="text-gray-500 text-sm">Sign in to your account</p>
        </div>

        <div className="card shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                <Lock className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            <Button type="submit" loading={loading} className="w-full justify-center">
              Sign In
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:underline font-medium">Register</Link>
            </p>
          </div>
        </div>

        {/* Demo accounts */}
        <div className="mt-4">
          <p className="text-xs text-gray-400 text-center mb-2">Demo accounts</p>
          <div className="space-y-2">
            {demoAccounts.map(acc => (
              <button
                key={acc.email}
                type="button"
                onClick={() => { setEmail(acc.email); setPassword(acc.password); }}
                className="w-full text-left px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-700">{acc.label}</span>
                <span className="text-gray-400 ml-2">{acc.email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
