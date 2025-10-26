import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConnectButton, useCurrentAccount, useSuiClient  } from '@mysten/dapp-kit';
import { Wallet, Shield, Zap } from 'lucide-react';
import { ROUTES, PACKAGE } from '../constants';



const ConnectWalletPage = () =>
{
  const navigate = useNavigate();
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  useEffect(() => 
  {
    const checkProfileAndNavigate = async () => 
      {
      if (!account?.address) return;
      
      try 
      {
        // Profile objesini kontrol et
        const ownedObjects = await suiClient.getOwnedObjects(
        {
          owner: account.address,
          filter: 
          {
            StructType: PACKAGE.PROFILETYPE
          },
          options: 
          {
            showType: true,
            showContent: true,
          },
        });

        // If profile exists, redirect to DASHBOARD, otherwise to HOME
        if (ownedObjects.data.length > 0) 
        {
          console.log('Profile bulundu, DASHBOARD\'a yönlendiriliyor...');
          navigate(ROUTES.DASHBOARD);
        } 
        else 
        {
          console.log('Profile bulunamadı, HOME\'a yönlendiriliyor...');
          navigate(ROUTES.HOME);
        }
      } 
      catch (error) 
      {
        console.error('Profile kontrolü başarısız:', error);
        // On error, redirect to HOME
        navigate(ROUTES.HOME);
      } 
      finally 
      {

      }
    };
    // When wallet is connected, redirect to home page
    if (account) 
    {
      checkProfileAndNavigate();
      //navigate(ROUTES.HOME);
    }
  }, [account, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Floating icons */}
      <div className="absolute top-20 left-20 animate-bounce" style={{ animationDuration: '3s' }}>
        <Wallet className="w-12 h-12 text-cyan-400" />
      </div>
      <div className="absolute top-40 right-32 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
        <Shield className="w-10 h-10 text-green-400" />
      </div>
      <div className="absolute bottom-32 left-40 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>
        <Zap className="w-14 h-14 text-yellow-400" />
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-2xl w-full">
        <div className="bg-slate-800/50 backdrop-blur-xl border-4 border-slate-700 rounded-lg p-8 md:p-12 shadow-2xl">
          {/* Header */}
          <div className="text-center space-y-6 mb-8">
            <div className="inline-block">
              <img 
                src="/logo.png" 
                alt="GameDev Cards Logo" 
                className="w-32 h-32 object-contain mx-auto"
              />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300">
              Connect Your Wallet
            </h1>
            
            <p className="text-lg text-slate-300 font-mono">
              Secure your portfolio with blockchain technology
            </p>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              { icon: Shield, title: 'Secure', desc: 'Blockchain security' },
              { icon: Zap, title: 'Fast', desc: 'Instant verification' },
              { icon: Wallet, title: 'Decentralized', desc: 'You own your data' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-900/50 border-2 border-slate-600 rounded-lg p-4 text-center hover:border-cyan-400 transition-all duration-300"
              >
                <item.icon className="w-8 h-8 mx-auto mb-2 text-cyan-400" />
                <h3 className="font-bold text-white mb-1">{item.title}</h3>
                <p className="text-xs text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Connect Button */}
          <div className="space-y-4">
            <div className="flex justify-center">
              
              <ConnectButton
                connectText="Connect Wallet"
                className="w-full md:w-auto"
              />
            </div>

            <div className="text-center">
              <p className="text-sm text-slate-400 mb-2">
                Don't have a wallet?{' '}
                <a
                  href="https://suiwallet.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 underline"
                >
                  Get Sui Wallet
                </a>
              </p>
            </div>

            {/* Info box */}
            <div className="bg-cyan-950/30 border border-cyan-700/50 rounded-lg p-4 mt-6">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-cyan-200">
                  <p className="font-semibold mb-1">Why do I need to connect?</p>
                  <p className="text-cyan-300/80">
                    Your wallet acts as your secure digital identity. It ensures that only you can manage your game portfolio
                    and proves ownership of your creations on the blockchain.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectWalletPage;
