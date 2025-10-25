import { Navigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { ROUTES } from '../constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isConnected } = useWallet();

  if (!isConnected) {
    return <Navigate to={ROUTES.CONNECT_WALLET} replace />;
  }

  return <>{children}</>;
}
