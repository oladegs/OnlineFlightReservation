import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import ProtectedRoute from './components/layout/ProtectedRoute.jsx';
import RoleGate from './components/layout/RoleGate.jsx';
import AppLayout from './components/layout/AppLayout.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import ServiceExplorer from './pages/customer/ServiceExplorer.jsx';
import BookingFlow from './pages/customer/BookingFlow.jsx';
import ConfirmationPage from './pages/customer/ConfirmationPage.jsx';
import MyAppointments from './pages/customer/MyAppointments.jsx';
import AvailabilityManager from './pages/provider/AvailabilityManager.jsx';
import BookingRequests from './pages/provider/BookingRequests.jsx';
import ClientHistory from './pages/provider/ClientHistory.jsx';
import SupportDesk from './pages/support/SupportDesk.jsx';
import ManageData from './pages/owner/ManageData.jsx';
import AnalyticsDashboard from './pages/owner/AnalyticsDashboard.jsx';
import RevenueReports from './pages/owner/RevenueReports.jsx';
import UnauthorizedPage from './pages/common/UnauthorizedPage.jsx';
import NotFoundPage from './pages/common/NotFoundPage.jsx';
import './App.css';

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/customer/services" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route
              path="/customer/services"
              element={
                <RoleGate roles={['customer']}>
                  <ServiceExplorer />
                </RoleGate>
              }
            />
            <Route
              path="/customer/services/:serviceId/book"
              element={
                <RoleGate roles={['customer']}>
                  <BookingFlow />
                </RoleGate>
              }
            />
            <Route
              path="/customer/confirmation/:appointmentId"
              element={
                <RoleGate roles={['customer']}>
                  <ConfirmationPage />
                </RoleGate>
              }
            />
            <Route
              path="/customer/appointments"
              element={
                <RoleGate roles={['customer']}>
                  <MyAppointments />
                </RoleGate>
              }
            />

            <Route
              path="/provider/availability"
              element={
                <RoleGate roles={['provider']}>
                  <AvailabilityManager />
                </RoleGate>
              }
            />
            <Route
              path="/provider/requests"
              element={
                <RoleGate roles={['provider']}>
                  <BookingRequests />
                </RoleGate>
              }
            />
            <Route
              path="/provider/history"
              element={
                <RoleGate roles={['provider']}>
                  <ClientHistory />
                </RoleGate>
              }
            />

            <Route
              path="/support"
              element={
                <RoleGate roles={['support', 'owner']}>
                  <SupportDesk />
                </RoleGate>
              }
            />
            <Route
              path="/support/tickets"
              element={
                <RoleGate roles={['support', 'owner']}>
                  <SupportDesk focus="tickets" />
                </RoleGate>
              }
            />

            <Route
              path="/owner/manage"
              element={
                <RoleGate roles={['owner']}>
                  <ManageData />
                </RoleGate>
              }
            />
            <Route
              path="/owner/analytics"
              element={
                <RoleGate roles={['owner']}>
                  <AnalyticsDashboard />
                </RoleGate>
              }
            />
            <Route
              path="/owner/reports"
              element={
                <RoleGate roles={['owner']}>
                  <RevenueReports />
                </RoleGate>
              }
            />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;

