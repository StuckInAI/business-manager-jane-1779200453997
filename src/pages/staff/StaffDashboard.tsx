import { useApp } from '@/lib/context';
import StatCard from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';
import { loanStatusColor, loanStatusLabel, loanTypeLabel, formatCurrency, formatDate } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { FileText, Users, Clock, CheckCircle, TrendingUp, ArrowRight, AlertCircle } from 'lucide-react';

export default function StaffDashboard() {
  const { state } = useApp();
  const apps = state.applications;
  const total = apps.length;
  const pending = apps.filter(a => !['disbursed', 'rejected'].includes(a.status)).length;
  const offersReady = apps.filter(a => a.status === 'offer_generated').length;
  const disbursed = apps.filter(a => a.status === 'disbursed').length;
  const customers = state.users.filter(u => u.role === 'customer').length;
  const totalValue = apps.reduce((s, a) => s + a.requestedAmount, 0);

  const recentApps = [...apps].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);

  const needsAction = apps.filter(a => ['document_review', 'compliance', 'credit_check'].includes(a.status));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of all loan activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Total Applications" value={total} icon={<FileText className="w-5 h-5" />} color="blue" />
        <StatCard label="Active" value={pending} icon={<Clock className="w-5 h-5" />} color="orange" />
        <StatCard label="Offers Ready" value={offersReady} icon={<AlertCircle className="w-5 h-5" />} color="purple" />
        <StatCard label="Disbursed" value={disbursed} icon={<CheckCircle className="w-5 h-5" />} color="green" />
        <StatCard label="Customers" value={customers} icon={<Users className="w-5 h-5" />} color="blue" />
        <StatCard label="Total Value" value={formatCurrency(totalValue)} icon={<TrendingUp className="w-5 h-5" />} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent activity */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Applications</h2>
            <Link to="/staff/applications" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentApps.map(app => (
              <Link
                key={app.id}
                to={`/staff/applications/${app.id}`}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{app.firstName} {app.lastName}</span>
                    <Badge className={loanStatusColor(app.status)}>{loanStatusLabel(app.status)}</Badge>
                  </div>
                  <p className="text-xs text-gray-500">{loanTypeLabel(app.type)} · {formatCurrency(app.requestedAmount)} · {formatDate(app.updatedAt)}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </Link>
            ))}
          </div>
        </div>

        {/* Needs action */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Needs Action</h2>
          {needsAction.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">All caught up!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {needsAction.map(app => (
                <Link
                  key={app.id}
                  to={`/staff/applications/${app.id}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">{app.firstName} {app.lastName}</p>
                    <Badge className={loanStatusColor(app.status)}>{loanStatusLabel(app.status)}</Badge>
                  </div>
                  <ArrowRight className="w-3 h-3 text-gray-400" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
