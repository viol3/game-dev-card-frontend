import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ROUTES } from './constants';

// Lazy load pages for better performance
const LandingPage = lazy(() => import('./components/LandingPage'));
const ConnectWalletPage = lazy(() => import('./components/ConnectWalletPage'));
const CreateProfilePage = lazy(() => import('./components/CreateProfilePage'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const PublicPortfolio = lazy(() => import('./components/PublicPortfolio'));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
    <div className="text-center space-y-4">
      <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="text-cyan-300 font-mono text-lg">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <div className="min-h-screen">
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path={ROUTES.CONNECT_WALLET} element={<ConnectWalletPage />} />
            <Route 
              path={ROUTES.HOME} 
              element={
                <ProtectedRoute>
                  <LandingPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path={ROUTES.CREATE_PROFILE} 
              element={
                <ProtectedRoute>
                  <CreateProfilePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path={ROUTES.DASHBOARD} 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path={ROUTES.PORTFOLIO} 
              element={
                <ProtectedRoute>
                  <PublicPortfolio />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;