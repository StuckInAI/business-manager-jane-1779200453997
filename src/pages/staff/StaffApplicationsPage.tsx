import { useState } from 'react';
import { useApp } from '@/lib/context';
import { formatCurrency, loanStatusLabel, loanStatusColor, loanTypeLabel, formatDate } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import { Link } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { LoanStatus } from '@/types';

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: 'All', value: 'all' },
  { label: 'Submitted', value: 'submitted' },
  { label: 'Doc Review', value: 'document_review' },
  { label: 'Credit Check', value: 'credit_check' },
  { label: 'Compliance', value: 'compliance' },
  { label: 'Offer Ready', value: 'offer_generated' },
  { label: 'Accepted', value: 'offer_accepted' },
  { label: 'Disbursed', value: 'disbursed' },
  { label: 'Rejected', value: 'rejected' },
];

export default function StaffApplicationsPage() {
  const { state } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = state.applications.filter(app => {
    const matchSearch = search === '' ||
      `${app.firstName} ${app.lastName} ${app.email}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">All Applications</h1>
        <p className="text-gray-500 text-sm mt-1">Manage and process loan applications</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === f.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Applicant', 'Loan Type', 'Amount', 'Status', 'Applied', 'Updated', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400 text-sm">No applications found</td>
                </tr>
              ) : filtered.map(app => (
                <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">{app.firstName} {app.lastName}</p>
                    <p className="text-xs text-gray-400">{app.email}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{loanTypeLabel(app.type)}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(app.requestedAmount)}</td>
                  <td className="px-4 py-3">
                    <Badge className={loanStatusColor(app.status as LoanStatus)}>{loanStatusLabel(app.status as LoanStatus)}</Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{formatDate(app.createdAt)}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{formatDate(app.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <Link to={`/staff/applications/${app.id}`} className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                      View <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
