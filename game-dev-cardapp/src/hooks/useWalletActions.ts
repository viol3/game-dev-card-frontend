import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';

export const useWalletActions = () => {
  const [copiedAddress, setCopiedAddress] = useState(false);
  const navigate = useNavigate();
  const { address, disconnect } = useWallet();

  const truncateAddress = (addr: string): string => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    navigate('/');
  };

  return {
    address,
    copiedAddress,
    truncateAddress,
    handleCopyAddress,
    handleDisconnect,
  };
};
