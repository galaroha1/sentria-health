import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { Marketplace } from './pages/Marketplace';
import { Cart } from './pages/Cart';
import { Inventory } from './pages/Inventory';

import { Vendors } from './pages/Vendors';
import { Profile } from './pages/Profile';
import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';
import { Transfers } from './pages/Transfers';
import { LocationMap } from './pages/LocationMap';
import { UserManagement } from './pages/UserManagement';
import { Admin } from './pages/Admin';
import { Decisions } from './pages/Decisions';

import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AppProvider } from './context/AppContext';
import { UserProvider } from './context/UserContext';

import { SimulationProvider } from './context/SimulationContext';

import { initializationError } from './config/firebase';

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
                    <Route index element={<Dashboard />} />
                    <Route
                      path="marketplace"
                      element={
                        <ProtectedRoute requirePermission="marketplace">
                          <Marketplace />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="cart" element={<Cart />} />
                    <Route
                      path="inventory"
                      element={
                        <ProtectedRoute requirePermission="inventory">
                          <Inventory />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="vendors"
                      element={
                        <ProtectedRoute requirePermission="vendors">
                          <Vendors />
                        </ProtectedRoute>
                      }
                    />

                    <Route path="profile" element={<Profile />} />
                    <Route path="transfers" element={<Transfers />} />
                    <Route path="transfers" element={<Transfers />} />
                    <Route path="locations" element={<LocationMap />} />
                    <Route path="decisions" element={<Decisions />} />
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
