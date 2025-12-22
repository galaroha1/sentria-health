import { BrowserRouter, Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';

import { Dashboard } from './pages/Dashboard';
import { InventoryHub } from './pages/InventoryHub';
import { LogisticsHub } from './pages/LogisticsHub';
import { Cart } from './pages/Cart';
import { Marketplace } from './pages/Marketplace';

import { Profile } from './pages/Profile';
import { Compliance } from './pages/Compliance';
import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';
import { UserManagement } from './pages/UserManagement';
import { Admin } from './pages/Admin';
import { Decisions } from './pages/Decisions';
import { Analytics } from './pages/AnalyticsPage';
import { Settings } from './pages/SettingsPage';
import { ClinicalHub } from './pages/ClinicalHub';
import { NetworkHub } from './pages/NetworkHub';
import { DataGeneration } from './pages/DataGeneration';
import { Vendors } from './pages/Vendors';
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
import { Header } from './components/layout/Header';
// import { FullScreenLoader } from './components/layout/FullScreenLoader';
import { PageTransition } from './components/layout/PageTransition';
import { useState } from 'react';

function DashboardLayout() {
  const [, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex bg-slate-50 overflow-hidden h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-20 transition-all duration-300 min-h-screen overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-8 pb-24 md:pb-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}

function AppContent() {
  // const { isLoading } = useApp();

  // Show Global Loader during initial sync
  // Show Global Loader during initial sync
  // if (isLoading) {
  //   return <FullScreenLoader />;
  // }

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Toaster position="top-right" />
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
          <Route path="marketplace" element={<Marketplace />} />
          <Route path="profile" element={<Profile />} />
          <Route path="decisions" element={<Decisions />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
          <Route path="clinical" element={<ClinicalHub />} />

          <Route path="network" element={<NetworkHub />} />
          <Route path="command-center" element={<CommandCenter />} />

          <Route path="compliance" element={<Compliance />} />
          <Route
            path="data-generation"
            element={
              <ProtectedRoute requirePermission="inventory">
                <DataGeneration />
              </ProtectedRoute>
            }
          />

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
          <Route path="vendors" element={<Vendors />} />
          <Route path="transfers" element={<Navigate to="/logistics" replace />} />
          <Route path="locations" element={<Navigate to="/logistics" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  if (initializationError) {
    return (
      // ... existing error UI ...
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
    <UserProvider>
      <AuthProvider>
        <AppProvider>
          <SimulationProvider>
            <CartProvider>
              <AppContent />
            </CartProvider>
          </SimulationProvider>
        </AppProvider>
      </AuthProvider>
    </UserProvider>
  );
}

export default App;
