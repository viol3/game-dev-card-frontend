import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { saveProfile, generateUsername } from '../services/profileService';
import { useWallet } from '../contexts/WalletContext';
import { User, ArrowRight, Sparkles } from 'lucide-react';
import { toast } from '../hooks/use-toast';
import { PACKAGE } from '../constants';
import WalletHeader from './WalletHeader';

const CreateProfilePage = () => 
{
  const [characterName, setCharacterName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [validationError, setValidationError] = useState('');
  const navigate = useNavigate();
  const { address } = useWallet();
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  // Kullanıcı adı validasyon fonksiyonu
  const validateUsername = (username) => {
    // Boş kontrol
    if (!username.trim()) {
      return 'Username cannot be empty';
    }

    // Uzunluk kontrolü (3-20 karakter)
    if (username.length < 3) {
      return 'Username must be at least 3 characters';
    }
    if (username.length > 20) {
      return 'Username must be at most 20 characters';
    }

    // Büyük harf kontrolü
    if (/[A-Z]/.test(username)) {
      return 'Username must be lowercase only';
    }

    // Sadece küçük harf, rakam, alt çizgi ve tire izin ver
    const usernameRegex = /^[a-z0-9_-]+$/;
    if (!usernameRegex.test(username)) {
      return 'Username can only contain lowercase letters, numbers, underscore (_) and hyphen (-)';
    }

    // Harf veya rakamla başlamalı (özel karakter ile başlamamalı)
    if (!/^[a-z0-9]/.test(username)) {
      return 'Username must start with a letter or number';
    }

    // Harf veya rakamla bitmeli (özel karakter ile bitmemeli)
    if (!/[a-z0-9]$/.test(username)) {
      return 'Username must end with a letter or number';
    }

    // Ardışık özel karakterler olmamalı
    if (/[_-]{2,}/.test(username)) {
      return 'Username cannot have consecutive special characters';
    }

    return null; // Geçerli
  };

  // Input değişikliğini handle et
  const handleNameChange = (e) => {
    let value = e.target.value;
    
    // Büyük harfleri otomatik olarak küçük harfe çevir
    value = value.toLowerCase();
    
    setCharacterName(value);
    
    // Real-time validasyon
    if (value) {
      const error = validateUsername(value);
      setValidationError(error || '');
    } else {
      setValidationError('');
    }
  };

  const handleSubmit = async (e) => 
    {
    e.preventDefault();
    
    // Final validasyon
    const validationResult = validateUsername(characterName);
    if (validationResult) 
    {
      toast(
      {
        title: 'Invalid Username!',
        description: validationResult,
        variant: 'destructive',
      });
      setValidationError(validationResult);
      return;
    }

    if (!address) 
    {
      toast(
      {
        title: 'Wallet Not Connected!',
        description: 'Please connect your wallet first.',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);

    try {
      // Transaction oluştur
      const tx = new Transaction();
      
      tx.moveCall({
        target: `${PACKAGE.PACKAGEID}::${PACKAGE.MODULENAME}::${PACKAGE.CREATEPROFILEFUNC}`,
        arguments: [
          tx.pure.string(characterName), // name: String
          tx.object(PACKAGE.DONKEYSADDLE)
        ],
      });

      // Transaction'ı imzala ve gönder
      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: (result) => 
          {
            console.log('Profile created successfully:', result);
            
            toast({
              title: 'Character Created! 🎮',
              description: `Welcome, ${characterName}! Your quest begins now.`,
            });

            // Dashboard'a yönlendir
            setTimeout(() => 
            {
              navigate('/dashboard');
            }, 1500);
          },
          onError: (error) => 
          {
            console.error('Error creating profile:', error);
            
            toast(
            {
              title: 'Creation Failed!',
              description: error.message || 'Failed to create character. Please try again.',
              variant: 'destructive',
            });
            
            setIsCreating(false);
          },
        }
      );
    } catch (error) 
    {
      console.error('Transaction error:', error);
      
      toast(
      {
        title: 'Transaction Error!',
        description: 'An error occurred. Please try again.',
        variant: 'destructive',
      });
      
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 relative overflow-hidden">
      {/* Wallet Header */}
      <WalletHeader />
      
      {/* Main Content */}
      <div className="flex items-center justify-center p-4 pt-24">
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-cyan-400 opacity-50 animate-ping"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

      {/* Main form container */}
      <div className="relative z-10 w-full max-w-xl">
        {/* Glowing effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-pink-500 to-yellow-500 rounded-lg blur-2xl opacity-30 animate-pulse" />
        
        <div className="relative bg-slate-800/90 border-4 border-slate-600 pixel-border p-8 md:p-12 backdrop-blur-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-gradient-to-br from-cyan-500 to-pink-500 rounded-full mb-4 animate-bounce">
              <User className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold pixel-text text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-pink-300 mb-3">
              CREATE CHARACTER
            </h1>
            <p className="text-lg text-cyan-200 font-mono">
              Enter your character name to begin
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="characterName" className="text-lg font-mono text-yellow-300 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                CHARACTER NAME
              </Label>
              <Input
                id="characterName"
                type="text"
                value={characterName}
                onChange={handleNameChange}
                placeholder="awesome_gamer123"
                className={`pixel-input text-xl p-6 bg-slate-900 border-4 ${
                  validationError 
                    ? 'border-red-500 focus:border-red-400' 
                    : characterName && !validationError
                    ? 'border-green-500 focus:border-green-400'
                    : 'border-cyan-500 focus:border-pink-500'
                } text-white placeholder:text-slate-500 transition-colors font-mono`}
                maxLength={20}
                disabled={isCreating}
              />
              <div className="space-y-1">
                {validationError ? (
                  <p className="text-sm text-red-400 font-mono flex items-center gap-2">
                    <span>❌</span> {validationError}
                  </p>
                ) : characterName ? (
                  <p className="text-sm text-green-400 font-mono flex items-center gap-2">
                    <span>✓</span> Username is valid!
                  </p>
                ) : null}
                <p className="text-sm text-slate-400 font-mono">
                  {characterName.length}/20 characters
                </p>
                <div className="text-xs text-slate-500 font-mono space-y-1 mt-2">
                  <p>• 3-20 characters</p>
                  <p>• Only lowercase letters, numbers, underscore (_), hyphen (-)</p>
                  <p>• Must start and end with letter or number</p>
                  <p>• No consecutive special characters</p>
                </div>
              </div>
            </div>

            {/* <div className="space-y-3">
              <Label htmlFor="bio" className="text-lg font-mono text-yellow-300 flex items-center gap-2">
                <User className="w-5 h-5" />
                BIO (Optional)
              </Label>
              <Input
                id="bio"
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                className="pixel-input text-xl p-6 bg-slate-900 border-4 border-cyan-500 text-white placeholder:text-slate-500 focus:border-pink-500 transition-colors font-mono"
                maxLength={100}
              />
              <p className="text-sm text-slate-400 font-mono">
                {bio.length}/100 characters
              </p>
            </div> */}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                type="button"
                onClick={() => navigate('/home')}
                variant="outline"
                className="flex-1 pixel-button text-lg py-6 border-4 border-slate-500 bg-slate-700 hover:bg-slate-600 text-white font-mono"
                disabled={isCreating}
              >
                BACK
              </Button>
              <Button
                type="submit"
                disabled={isCreating || !characterName || !!validationError}
                className="flex-1 pixel-button text-lg py-6 bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-white border-4 border-white shadow-[0_6px_0_rgba(0,0,0,0.3)] hover:shadow-[0_3px_0_rgba(0,0,0,0.3)] active:shadow-[0_1px_0_rgba(0,0,0,0.3)] hover:-translate-y-1 active:translate-y-1 transition-all duration-150 font-bold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isCreating ? (
                  <>
                    <span className="animate-pulse">CREATING...</span>
                  </>
                ) : (
                  <>
                    START QUEST
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Stats display (decorative) */}
          <div className="mt-8 grid grid-cols-3 gap-4 pt-6 border-t-4 border-slate-700">
            {[
              { label: 'LVL', value: '1', color: 'cyan' },
              { label: 'XP', value: '0', color: 'yellow' },
              { label: 'HP', value: '100', color: 'green' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-xs font-mono text-slate-400">{stat.label}</p>
                <p className={`text-2xl font-bold font-mono text-${stat.color}-400`}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default CreateProfilePage;