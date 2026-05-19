import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { useApp } from '@/lib/context';
import { formatCurrency, loanStatusLabel, loanStatusColor, loanTypeLabel, formatDate, calculateMonthlyPayment, generateId } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import Timeline from '@/components/ui/Timeline';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { ArrowLeft, FileCheck, FileX, FileClock, Zap } from 'lucide-react';
import { LoanOffer } from '@/types';

export default function StaffApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { state, advanceStatus, rejectApplication, updateApp } = useApp();
  const app = state.applications.find(a => a.id === id);

  const [offerForm, setOfferForm] = useState({ amount: '', rate: '', months: '' });
  const [showOfferForm, setShowOfferForm] = useState(false);

  if (!app) return (
    <div className="p-6">
      <p className="text-gray-500">Application not found.</p>
      <Link to="/staff/applications" className="text-blue-600 hover:underline text-sm mt-2 inline-block">← Back</Link>
    </div>
  );

  const docIcon = (status: string) => {
    if (status === 'approved') return <FileCheck className="w-4 h-4 text-green-600" />;
    if (status === 'rejected') return <FileX className="w-4 h-4 text-red-500" />;
    return <FileClock className="w-4 h-4 text-yellow-500" />;
  };

  const approveDoc = (docId: string) => {
    const updated = {
      ...app,
      documents: app.documents.map(d => d.id === docId ? { ...d, status: 'approved' as const } : d),
    };
    updateApp(updated);
  };

  const rejectDoc = (docId: string) => {
    const updated = {
      ...app,
      documents: app.documents.map(d => d.id === docId ? { ...d, status: 'rejected' as const } : d),
    };
    updateApp(updated);
  };

  const generateOffer = () => {
    const amount = parseFloat(offerForm.amount) || app.requestedAmount;
    const rate = parseFloat(offerForm.rate) || 8.5;
    const months = parseInt(offerForm.months) || 60;
    const monthly = calculateMonthlyPayment(amount, rate, months);
    const offer: LoanOffer = {
      id: generateId(),
      applicationId: app.id,
      amount,
      interestRate: rate,
      termMonths: months,
      monthlyPayment: monthly,
      totalRepayable: monthly * months,
      generatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      customizedByStaff: true,
      status: 'pending',
    };
    const updated = { ...app, offer, status: 'offer_generated' as const, updatedAt: new Date().toISOString() };
    updateApp(updated);
    setShowOfferForm(false);
    advanceStatus(app.id);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <Link to="/staff/applications" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{app.firstName} {app.lastName}</h1>
          <p className="text-sm text-gray-500">{loanTypeLabel(app.type)} · #{app.id}</p>
        </div>
        <Badge className={loanStatusColor(app.status)}>{loanStatusLabel(app.status)}</Badge>
      </div>

      {/* Action bar */}
      {!['disbursed', 'rejected'].includes(app.status) && (
        <div className="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <Button variant="primary" size="sm" onClick={() => advanceStatus(app.id)}>
            <Zap className="w-4 h-4" /> Advance Stage
          </Button>
          {app.status !== 'offer_generated' && app.status !== 'offer_accepted' && (
            <Button variant="secondary" size="sm" onClick={() => setShowOfferForm(!showOfferForm)}>
              Generate Offer
            </Button>
          )}
          <Button variant="danger" size="sm" onClick={() => rejectApplication(app.id)}>
            Reject Application
          </Button>
        </div>
      )}

      {/* Offer form */}
      {showOfferForm && (
        <div className="card border border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-4">Generate Custom Offer</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Offer Amount ($)"
              type="number"
              value={offerForm.amount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOfferForm(p => ({ ...p, amount: e.target.value }))}
              placeholder={String(app.requestedAmount)}
            />
            <Input
              label="Interest Rate (%)"
              type="number"
              value={offerForm.rate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOfferForm(p => ({ ...p, rate: e.target.value }))}
              placeholder="8.5"
              step="0.1"
            />
            <Input
              label="Term (months)"
              type="number"
              value={offerForm.months}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOfferForm(p => ({ ...p, months: e.target.value }))}
              placeholder="60"
            />
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={generateOffer}>Create Offer</Button>
            <Button variant="secondary" onClick={() => setShowOfferForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-2 space-y-4">
          {/* Applicant info */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Applicant Details</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'Full Name', value: `${app.firstName} ${app.lastName}` },
                { label: 'Email', value: app.email },
                { label: 'Phone', value: app.phone },
                { label: 'Date of Birth', value: app.dateOfBirth },
                { label: 'Address', value: app.address },
                { label: 'Employment', value: app.employmentStatus?.replace('_', ' ') },
                { label: 'Annual Income', value: formatCurrency(app.annualIncome) },
                { label: 'Monthly Expenses', value: formatCurrency(app.monthlyExpenses) },
                { label: 'Credit Score', value: app.creditScore },
                { label: 'Existing Debts', value: formatCurrency(app.existingDebts) },
                { label: 'Requested Amount', value: formatCurrency(app.requestedAmount) },
                { label: 'Purpose', value: app.purpose },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-xs text-gray-400">{item.label}</p>
                  <p className="text-sm font-semibold text-gray-900">{item.value || '—'}</p>
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
                    {doc.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => approveDoc(doc.id)} className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors">Approve</button>
                        <button onClick={() => rejectDoc(doc.id)} className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors">Reject</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Offer */}
          {app.offer && (
            <div className="card border-l-4 border-l-purple-500">
              <h2 className="font-semibold text-gray-900 mb-4">Loan Offer</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Offer Amount', value: formatCurrency(app.offer.amount) },
                  { label: 'Interest Rate', value: `${app.offer.interestRate}% p.a.` },
                  { label: 'Term', value: `${app.offer.termMonths} months` },
                  { label: 'Monthly Payment', value: formatCurrency(app.offer.monthlyPayment) },
                  { label: 'Total Repayable', value: formatCurrency(app.offer.totalRepayable) },
                  { label: 'Customer Response', value: app.offer.status },
                ].map(item => (
                  <div key={item.label}>
                    <p className="text-xs text-gray-400">{item.label}</p>
                    <p className="text-sm font-semibold text-gray-900">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="card h-fit">
          <h2 className="font-semibold text-gray-900 mb-4">Application Timeline</h2>
          <Timeline steps={app.timeline} />
        </div>
      </div>
    </div>
  );
}
