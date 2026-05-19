import { useApp } from '@/lib/context';
import { formatCurrency, loanStatusLabel, loanStatusColor, loanTypeLabel, formatDate } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import { Link } from 'react-router-dom';
import { FileText, ArrowRight, PlusCircle } from 'lucide-react';

export default function ApplicationsPage() {
  const { state } = useApp();
  const user = state.currentUser;
  const myApps = state.applications.filter(a => a.userId === user?.id);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-500 text-sm mt-1">Track all your loan applications</p>
        </div>
        <Link
          to="/app/onboarding"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          New Application
        </Link>
      </div>

      {myApps.length === 0 ? (
        <div className="card text-center py-16">
          <FileText className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h3 className="text-gray-700 font-medium">No applications yet</h3>
          <p className="text-gray-400 text-sm mt-1">Submit your first loan application to get started.</p>
          <Link to="/app/onboarding" className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
            <PlusCircle className="w-4 h-4" /> Apply Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {myApps.map(app => (
            <div key={app.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-gray-900">{loanTypeLabel(app.type)}</h3>
                    <Badge className={loanStatusColor(app.status)}>{loanStatusLabel(app.status)}</Badge>
                  </div>
                  <p className="text-sm text-gray-500">{app.purpose}</p>
                  <div className="flex gap-4 mt-3">
                    <div>
                      <p className="text-xs text-gray-400">Requested</p>
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(app.requestedAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Applied</p>
                      <p className="text-sm font-semibold text-gray-900">{formatDate(app.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Documents</p>
                      <p className="text-sm font-semibold text-gray-900">{app.documents.length} uploaded</p>
                    </div>
                  </div>
                </div>
                <Link
                  to={`/app/applications/${app.id}`}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:underline ml-4"
                >
                  Details <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
