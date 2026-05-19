import { useApp } from '@/lib/context';
import { formatCurrency, loanStatusLabel, loanStatusColor, loanTypeLabel, formatDate } from '@/lib/utils';
import StatCard from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';
import { Link } from 'react-router-dom';
import { FileText, Gift, Clock, CheckCircle, ArrowRight, PlusCircle } from 'lucide-react';

export default function CustomerDashboard() {
  const { state } = useApp();
  const user = state.currentUser;
  const myApps = state.applications.filter(a => a.userId === user?.id);
  const activeApps = myApps.filter(a => !['disbursed', 'rejected'].includes(a.status));
  const offers = myApps.filter(a => a.offer && a.offer.status === 'pending');
  const disbursed = myApps.filter(a => a.status === 'disbursed');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.firstName}! 👋</h1>
          <p className="text-gray-500 text-sm mt-1">Here's an overview of your loan activity.</p>
        </div>
        <Link
          to="/app/onboarding"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Apply for Loan
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="My Applications" value={myApps.length} icon={<FileText className="w-5 h-5" />} color="blue" />
        <StatCard label="Active" value={activeApps.length} icon={<Clock className="w-5 h-5" />} color="orange" />
        <StatCard label="Pending Offers" value={offers.length} icon={<Gift className="w-5 h-5" />} color="purple" />
        <StatCard label="Disbursed" value={disbursed.length} icon={<CheckCircle className="w-5 h-5" />} color="green" />
      </div>

      {/* Applications list */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">My Applications</h2>
          <Link to="/app/applications" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {myApps.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No applications yet.</p>
            <Link to="/app/onboarding" className="mt-3 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
              Start your first application <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {myApps.map(app => (
              <Link
                key={app.id}
                to={`/app/applications/${app.id}`}
                className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-gray-900">{loanTypeLabel(app.type)}</span>
                    <Badge className={loanStatusColor(app.status)}>{loanStatusLabel(app.status)}</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{formatDate(app.createdAt)} · {formatCurrency(app.requestedAmount)}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Pending offers banner */}
      {offers.length > 0 && (
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">🎉 You have a loan offer!</h3>
              <p className="text-sm text-purple-100 mt-1">Review and accept your personalised offer before it expires.</p>
            </div>
            <Link
              to="/app/offers"
              className="px-4 py-2 bg-white text-purple-700 text-sm font-semibold rounded-lg hover:bg-purple-50 transition-colors"
            >
              View Offer
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
