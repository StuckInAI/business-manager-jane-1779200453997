import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '@/lib/context';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { ChevronRight } from 'lucide-react';

export default function RegisterPage() {
  const { register, login } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    setTimeout(() => {
      register({
        email: form.email,
        password: form.password,
        role: 'customer',
        firstName: form.firstName,
        lastName: form.lastName,
      });
      login(form.email, form.password);
      setLoading(false);
      navigate('/app');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <ChevronRight className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">LoanFlow</span>
          </div>
          <p className="text-gray-500 text-sm">Create your account</p>
        </div>

        <div className="card shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="First name" value={form.firstName} onChange={set('firstName')} required />
              <Input label="Last name" value={form.lastName} onChange={set('lastName')} required />
            </div>
            <Input label="Email address" type="email" value={form.email} onChange={set('email')} required />
            <Input label="Password" type="password" value={form.password} onChange={set('password')} required />
            <Input label="Confirm password" type="password" value={form.confirm} onChange={set('confirm')} required />
            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            <Button type="submit" loading={loading} className="w-full justify-center">
              Create Account
            </Button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:underline font-medium">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
