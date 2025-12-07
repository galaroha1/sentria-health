import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { InventoryHub } from './pages/InventoryHub';
import { LogisticsHub } from './pages/LogisticsHub';
import { Cart } from './pages/Cart';

import { Profile } from './pages/Profile';
import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';
import { UserManagement } from './pages/UserManagement';
import { Admin } from './pages/Admin';
import { Decisions } from './pages/Decisions';
import { Analytics } from './pages/AnalyticsPage';
import { Settings } from './pages/SettingsPage';
import { ClinicalHub } from './pages/ClinicalHub';
import { CPODashboard } from './pages/CPODashboard';
import { NetworkHub } from './pages/NetworkHub';
import { CommandCenter } from './components/simulation/CommandCenter';

import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AppProvider } from './context/AppContext';
import { UserProvider } from './context/UserContext';

import { SimulationProvider } from './context/SimulationContext';

import { initializationError } from './config/firebase';
import { Sidebar } from './components/layout/Sidebar';
import { CommandPalette } from './components/common/CommandPalette';
import { MobileNav } from './components/layout/MobileNav';

function DashboardLayout() {
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto p-8 pb-24 md:pb-8">
        <Outlet />
      </main>
      <MobileNav />
    </div>
  );
}

function App() {
  if (initializationError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <span className="text-3xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Configuration Error</h1>
          <p className="text-slate-600 mb-6">
            The application failed to connect to Firebase.
          </p>
          <div className="bg-slate-100 rounded-lg p-4 mb-6 text-left">
            <p className="font-mono text-xs text-red-600 break-all">
              {initializationError}
            </p>
          </div>
          <p className="text-sm text-slate-500">
            Please check your <code>.env</code> file and ensure all Firebase variables are set correctly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AppProvider>
      <UserProvider>
        <AuthProvider>
          <SimulationProvider>
            <CartProvider>
              <BrowserRouter basename={import.meta.env.BASE_URL}>
                <CommandPalette />
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />

                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <DashboardLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route
                      path="inventory"
                      element={
                        <ProtectedRoute requirePermission="inventory">
                          <InventoryHub />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="logistics"
                      element={
                        <ProtectedRoute requirePermission="transfers">
                          <LogisticsHub />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="cart" element={<Cart />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="decisions" element={<Decisions />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="clinical" element={<ClinicalHub />} />
                    <Route path="cpo-overview" element={<CPODashboard />} />
                    <Route path="network" element={<NetworkHub />} />
                    <Route path="command-center" element={<CommandCenter />} />

                    <Route
                      path="admin"
                      element={
                        <ProtectedRoute requirePermission="manage_users">
                          <Admin />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="users"
                      element={
                        <ProtectedRoute requirePermission="manage_users">
                          <UserManagement />
                        </ProtectedRoute>
                      }
                    />

                    {/* Legacy Redirects */}
                    <Route path="marketplace" element={<Navigate to="/inventory" replace />} />
                    <Route path="vendors" element={<Navigate to="/inventory" replace />} />
                    <Route path="transfers" element={<Navigate to="/logistics" replace />} />
                    <Route path="locations" element={<Navigate to="/logistics" replace />} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </CartProvider>
          </SimulationProvider>
        </AuthProvider>
      </UserProvider>
    </AppProvider>
  );
}

export default App;
