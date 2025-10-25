import { createContext, useContext, ReactNode } from 'react';
import { useCurrentAccount, useDisconnectWallet } from '@mysten/dapp-kit';

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const account = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();

  const value: WalletContextType = {
    address: account?.address || null,
    isConnected: !!account,
    disconnect,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
