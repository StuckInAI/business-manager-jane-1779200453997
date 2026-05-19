import { useApp } from '@/lib/context';
import { formatCurrency } from '@/lib/utils';
import { BarChart3, TrendingUp, DollarSign, FileText, CheckCircle } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';

export default function StaffReportsPage() {
  const { state } = useApp();
  const apps = state.applications;

  const totalApps = apps.length;
  const approved = apps.filter(a => ['offer_generated','offer_accepted','disbursed'].includes(a.status)).length;
  const disbursed = apps.filter(a => a.status === 'disbursed').length;
  const totalDisbursedAmount = apps
    .filter(a => a.status === 'disbursed' && a.offer)
    .reduce((sum, a) => sum + (a.offer?.amount ?? 0), 0);
  const rejectedCount = apps.filter(a => a.status === 'rejected').length;
  const approvalRate = totalApps > 0 ? Math.round((approved / totalApps) * 100) : 0;

  const byType: Record<string, number> = {};
  apps.forEach(a => { byType[a.type] = (byType[a.type] || 0) + 1; });

  const byStatus: Record<string, number> = {};
  apps.forEach(a => { byStatus[a.status] = (byStatus[a.status] || 0) + 1; });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of loan portfolio performance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Applications"
          value={totalApps}
          icon={<FileText className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          label="Approval Rate"
          value={`${approvalRate}%`}
          icon={<TrendingUp className="w-5 h-5" />}
          color="green"
        />
        <StatCard
          label="Disbursed Loans"
          value={disbursed}
          icon={<CheckCircle className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          label="Total Disbursed"
          value={formatCurrency(totalDisbursedAmount)}
          icon={<DollarSign className="w-5 h-5" />}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-gray-400" />
            <h2 className="font-semibold text-gray-900">Applications by Type</h2>
          </div>
          <div className="space-y-3">
            {Object.entries(byType).map(([type, count]) => (
              <div key={type} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 capitalize w-32">{type.replace('_', ' ')}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${totalApps > 0 ? (count / totalApps) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-700 w-6 text-right">{count}</span>
              </div>
            ))}
            {Object.keys(byType).length === 0 && <p className="text-sm text-gray-400">No data yet.</p>}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-gray-400" />
            <h2 className="font-semibold text-gray-900">Applications by Status</h2>
          </div>
          <div className="space-y-3">
            {Object.entries(byStatus).map(([status, count]) => (
              <div key={status} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-36 truncate">{status.replace(/_/g, ' ')}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: `${totalApps > 0 ? (count / totalApps) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-700 w-6 text-right">{count}</span>
              </div>
            ))}
            {Object.keys(byStatus).length === 0 && <p className="text-sm text-gray-400">No data yet.</p>}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-2">Summary</h2>
        <p className="text-sm text-gray-500">
          Total rejected: <span className="font-semibold text-red-600">{rejectedCount}</span> &nbsp;|&nbsp;
          Pending review: <span className="font-semibold text-yellow-600">{apps.filter(a => !['disbursed','rejected','offer_accepted'].includes(a.status)).length}</span>
        </p>
      </div>
    </div>
  );
}
