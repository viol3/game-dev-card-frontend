import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { LogOut, Wallet, Copy, Check } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { useState } from 'react';

interface WalletHeaderProps {
  showBackButton?: boolean;
  onBack?: () => void;
}

const WalletHeader = ({ showBackButton = false, onBack }: WalletHeaderProps) => {
  const { address, disconnect } = useWallet();
  const navigate = useNavigate();
  const [copiedAddress, setCopiedAddress] = useState(false);

  const handleDisconnect = () => {
    disconnect();
    navigate('/');
  };

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!address) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b-4 border-cyan-500">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left side - Back button or Logo */}
        <div className="flex items-center gap-4">
          {showBackButton && onBack ? (
            <Button
              onClick={onBack}
              variant="ghost"
              size="sm"
              className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
            >
              ← Back
            </Button>
          ) : (
            <img 
              src="/logo.png" 
              alt="GameDev Cards Logo" 
              className="w-12 h-12 object-contain"
            />
          )}
        </div>

        {/* Right side - Wallet info and disconnect */}
        <div className="flex items-center gap-3">
          {/* Wallet Address */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-800 border-2 border-cyan-500 px-3 py-2 rounded-lg">
            <Wallet className="w-4 h-4 text-cyan-400" />
            <span className="font-mono text-sm text-cyan-300">
              {truncateAddress(address)}
            </span>
            <button
              onClick={handleCopyAddress}
              className="ml-1 p-1 hover:bg-slate-700 rounded transition-colors"
              title="Copy address"
            >
              {copiedAddress ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-slate-400 hover:text-cyan-400" />
              )}
            </button>
          </div>

          {/* Mobile wallet indicator */}
          <div className="sm:hidden">
            <Button
              onClick={handleCopyAddress}
              variant="outline"
              size="sm"
              className="border-cyan-500 text-cyan-400"
            >
              <Wallet className="w-4 h-4" />
            </Button>
          </div>

          {/* Disconnect Button */}
          <Button
            onClick={handleDisconnect}
            variant="destructive"
            size="sm"
            className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 border-2 border-red-400 font-bold"
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WalletHeader;
