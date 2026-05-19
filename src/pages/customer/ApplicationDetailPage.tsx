import { useParams, Link } from 'react-router-dom';
import { useApp } from '@/lib/context';
import { formatCurrency, loanStatusLabel, loanStatusColor, loanTypeLabel, formatDate } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import Timeline from '@/components/ui/Timeline';
import { ArrowLeft, FileCheck, FileX, FileClock } from 'lucide-react';

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { state } = useApp();
  const app = state.applications.find(a => a.id === id);

  if (!app) return (
    <div className="p-6">
      <p className="text-gray-500">Application not found.</p>
      <Link to="/app/applications" className="text-blue-600 hover:underline text-sm mt-2 inline-block">← Back</Link>
    </div>
  );

  const docIcon = (status: string) => {
    if (status === 'approved') return <FileCheck className="w-4 h-4 text-green-600" />;
    if (status === 'rejected') return <FileX className="w-4 h-4 text-red-500" />;
    return <FileClock className="w-4 h-4 text-yellow-500" />;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/app/applications" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{loanTypeLabel(app.type)}</h1>
          <p className="text-sm text-gray-500">Application #{app.id}</p>
        </div>
        <Badge className={loanStatusColor(app.status)}>{loanStatusLabel(app.status)}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-2 space-y-4">
          {/* Summary */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Loan Summary</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'Requested Amount', value: formatCurrency(app.requestedAmount) },
                { label: 'Loan Type', value: loanTypeLabel(app.type) },
                { label: 'Purpose', value: app.purpose },
                { label: 'Annual Income', value: formatCurrency(app.annualIncome) },
                { label: 'Credit Score', value: app.creditScore },
                { label: 'Applied On', value: formatDate(app.createdAt) },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-xs text-gray-400">{item.label}</p>
                  <p className="text-sm font-semibold text-gray-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Documents */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Documents</h2>
            {app.documents.length === 0 ? (
              <p className="text-sm text-gray-400">No documents uploaded.</p>
            ) : (
              <div className="space-y-2">
                {app.documents.map(doc => (
                  <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                    {docIcon(doc.status)}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{doc.name}</p>
                      <p className="text-xs text-gray-500">{doc.type.replace('_', ' ')} · {formatDate(doc.uploadedAt)}</p>
                    </div>
                    <Badge className={
                      doc.status === 'approved' ? 'bg-green-100 text-green-700' :
                      doc.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }>{doc.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Offer */}
          {app.offer && (
            <div className="card border-l-4 border-l-purple-500">
              <h2 className="font-semibold text-gray-900 mb-4">Your Loan Offer</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Offer Amount', value: formatCurrency(app.offer.amount) },
                  { label: 'Interest Rate', value: `${app.offer.interestRate}% p.a.` },
                  { label: 'Term', value: `${app.offer.termMonths} months` },
                  { label: 'Monthly Payment', value: formatCurrency(app.offer.monthlyPayment) },
                  { label: 'Total Repayable', value: formatCurrency(app.offer.totalRepayable) },
                  { label: 'Expires', value: formatDate(app.offer.expiresAt) },
                ].map(item => (
                  <div key={item.label}>
                    <p className="text-xs text-gray-400">{item.label}</p>
                    <p className="text-sm font-semibold text-gray-900">{item.value}</p>
                  </div>
                ))}
              </div>
              {app.offer.status === 'pending' && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Link to="/app/offers" className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors">
                    Review & Accept Offer
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right — Timeline */}
        <div className="card h-fit">
          <h2 className="font-semibold text-gray-900 mb-4">Application Progress</h2>
          <Timeline steps={app.timeline} />
        </div>
      </div>
    </div>
  );
}
