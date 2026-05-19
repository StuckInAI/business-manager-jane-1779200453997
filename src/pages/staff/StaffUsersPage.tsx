import { useApp } from '@/lib/context';
import { formatDate } from '@/lib/utils';
import { Users, UserCircle } from 'lucide-react';

export default function StaffUsersPage() {
  const { state } = useApp();
  const customers = state.users.filter(u => u.role === 'customer');

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-sm text-gray-500 mt-1">All registered customer accounts</p>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-gray-400" />
          <span className="font-semibold text-gray-700">{customers.length} customers</span>
        </div>
        <div className="space-y-3">
          {customers.map(user => {
            const apps = state.applications.filter(a => a.userId === user.id);
            return (
              <div key={user.id} className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <UserCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Joined {formatDate(user.createdAt)}</p>
                  <p className="text-xs text-gray-400">{apps.length} application{apps.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
            );
          })}
          {customers.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">No customers registered yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
