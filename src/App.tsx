
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { Marketplace } from './pages/Marketplace';
import { Cart } from './pages/Cart';
import { Inventory } from './pages/Inventory';
import { Reports } from './pages/Reports';
import { Vendors } from './pages/Vendors';
import { Profile } from './pages/Profile';
import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';
import { Transfers } from './pages/Transfers';
import { LocationMap } from './pages/LocationMap';
import { UserManagement } from './pages/UserManagement';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AppProvider } from './context/AppContext';
import { UserProvider } from './context/UserContext';

function App() {
  return (
    <AppProvider>
      <UserProvider>
        <AuthProvider>
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
                  <Route
                    path="reports"
                    element={
                      <ProtectedRoute requirePermission="reports">
                        <Reports />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="profile" element={<Profile />} />
                  <Route path="transfers" element={<Transfers />} />
                  <Route path="locations" element={<LocationMap />} />
                  <Route
                    path="users"
                    element={
                      <ProtectedRoute requirePermission="dashboard">
                        <UserManagement />
                      </ProtectedRoute>
                    }
                  />
                </Route>
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </UserProvider>
    </AppProvider>
  );
}

export default App;
