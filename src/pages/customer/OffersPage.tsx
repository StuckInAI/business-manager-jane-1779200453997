import { useApp } from '@/lib/context';
import { formatCurrency, loanTypeLabel, formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { Gift, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useState } from 'react';

export default function OffersPage() {
  const { state, updateApp } = useApp();
  const user = state.currentUser;
  const [confirming, setConfirming] = useState<string | null>(null);

  const appsWithOffers = state.applications.filter(a => a.userId === user?.id && a.offer);

  const handleAccept = (appId: string) => {
    const app = state.applications.find(a => a.id === appId);
    if (!app || !app.offer) return;
    const updated = {
      ...app,
      status: 'offer_accepted' as const,
      offer: { ...app.offer, status: 'accepted' as const },
      updatedAt: new Date().toISOString(),
    };
    updateApp(updated);
    setConfirming(null);
  };

  const handleDecline = (appId: string) => {
    const app = state.applications.find(a => a.id === appId);
    if (!app || !app.offer) return;
    const updated = {
      ...app,
      offer: { ...app.offer, status: 'declined' as const },
      updatedAt: new Date().toISOString(),
    };
    updateApp(updated);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Offers</h1>
        <p className="text-gray-500 text-sm mt-1">Review and respond to your loan offers</p>
      </div>

      {appsWithOffers.length === 0 ? (
        <div className="card text-center py-16">
          <Gift className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h3 className="text-gray-700 font-medium">No offers yet</h3>
          <p className="text-gray-400 text-sm mt-1">Offers will appear here once generated for your applications.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appsWithOffers.map(app => {
            const offer = app.offer!;
            return (
              <div key={app.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{loanTypeLabel(app.type)}</h3>
                    <p className="text-sm text-gray-500">{app.purpose}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {offer.status === 'pending' && <Clock className="w-4 h-4 text-yellow-500" />}
                    {offer.status === 'accepted' && <CheckCircle className="w-4 h-4 text-green-500" />}
                    {offer.status === 'declined' && <XCircle className="w-4 h-4 text-red-500" />}
                    <span className={`text-sm font-medium ${
                      offer.status === 'pending' ? 'text-yellow-600' :
                      offer.status === 'accepted' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {offer.status === 'pending' ? 'Awaiting Response' :
                       offer.status === 'accepted' ? 'Accepted' : 'Declined'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl mb-4">
                  <div>
                    <p className="text-xs text-gray-400">Approved Amount</p>
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(offer.amount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Interest Rate</p>
                    <p className="text-lg font-bold text-blue-600">{offer.interestRate}% p.a.</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Term</p>
                    <p className="text-lg font-bold text-gray-900">{offer.termMonths} months</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Monthly Payment</p>
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(offer.monthlyPayment)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Total Repayable</p>
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(offer.totalRepayable)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Offer Expires</p>
                    <p className="text-sm font-semibold text-gray-900">{formatDate(offer.expiresAt)}</p>
                  </div>
                </div>

                {offer.customizedByStaff && (
                  <p className="text-xs text-blue-600 mb-3">✦ This offer has been customized by a loan officer.</p>
                )}

                {offer.status === 'pending' && (
                  confirming === app.id ? (
                    <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-sm text-yellow-800 flex-1">Are you sure you want to accept this offer?</p>
                      <Button variant="primary" size="sm" onClick={() => handleAccept(app.id)}>Confirm Accept</Button>
                      <Button variant="secondary" size="sm" onClick={() => setConfirming(null)}>Cancel</Button>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <Button variant="primary" onClick={() => setConfirming(app.id)}>
                        <CheckCircle className="w-4 h-4" /> Accept Offer
                      </Button>
                      <Button variant="danger" onClick={() => handleDecline(app.id)}>
                        <XCircle className="w-4 h-4" /> Decline
                      </Button>
                    </div>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
