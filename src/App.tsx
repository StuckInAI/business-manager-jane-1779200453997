import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppState } from '@/hooks/useAppState';
import { AppContext } from '@/lib/context';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import CustomerLayout from '@/components/layout/CustomerLayout';
import StaffLayout from '@/components/layout/StaffLayout';
import CustomerDashboard from '@/pages/customer/CustomerDashboard';
import OnboardingPage from '@/pages/customer/OnboardingPage';
import ApplicationsPage from '@/pages/customer/ApplicationsPage';
import ApplicationDetailPage from '@/pages/customer/ApplicationDetailPage';
import OffersPage from '@/pages/customer/OffersPage';
import StaffDashboard from '@/pages/staff/StaffDashboard';
import StaffApplicationsPage from '@/pages/staff/StaffApplicationsPage';
import StaffApplicationDetailPage from '@/pages/staff/StaffApplicationDetailPage';
import StaffUsersPage from '@/pages/staff/StaffUsersPage';
import StaffReportsPage from '@/pages/staff/StaffReportsPage';

export default function App() {
  const appState = useAppState();
  const { state } = appState;
  const user = state.currentUser;

  return (
    <AppContext.Provider value={appState}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to={user.role === 'staff' ? '/staff' : '/app'} />} />
          <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/app" />} />

          {/* Customer routes */}
          <Route path="/app" element={user && user.role === 'customer' ? <CustomerLayout /> : <Navigate to="/login" />}>
            <Route index element={<CustomerDashboard />} />
            <Route path="onboarding" element={<OnboardingPage />} />
            <Route path="applications" element={<ApplicationsPage />} />
            <Route path="applications/:id" element={<ApplicationDetailPage />} />
            <Route path="offers" element={<OffersPage />} />
          </Route>

          {/* Staff routes */}
          <Route path="/staff" element={user && user.role === 'staff' ? <StaffLayout /> : <Navigate to="/login" />}>
            <Route index element={<StaffDashboard />} />
            <Route path="applications" element={<StaffApplicationsPage />} />
            <Route path="applications/:id" element={<StaffApplicationDetailPage />} />
            <Route path="users" element={<StaffUsersPage />} />
            <Route path="reports" element={<StaffReportsPage />} />
          </Route>

          <Route path="*" element={<Navigate to={user ? (user.role === 'staff' ? '/staff' : '/app') : '/login'} />} />
        </Routes>
      </BrowserRouter>
    </AppContext.Provider>
  );
}
