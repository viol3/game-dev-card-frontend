import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { getProfile, deleteProfile } from '../services/profileService';
import { getGames, addGame, updateGame, getWalletAddressByProfileId  } from '../services/gameService';
import { useWallet } from '../contexts/WalletContext';
import InventoryPanel from './InventoryPanel';
import DetailsPanel from './DetailsPanel';
import SpaceExplorer from './SpaceExplorer';
import WalletHeader from './WalletHeader';
import { Share2, User, Rocket, Gamepad2 } from 'lucide-react';
import { PACKAGE } from '../constants';
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { toast } from '../hooks/use-toast';

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const navigate = useNavigate();
  const { address, disconnect } = useWallet();
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  useEffect(() => 
  {
    if (!address) 
    {
      navigate('/');
      return;
    }
    const checkSavedProfile = async () => 
    {
      const savedProfile = await getProfile(address);
      if (!savedProfile) 
      {
        navigate('/create-profile');
        return;
      }
      setProfile(savedProfile);
      const fetchedGames = await getGames(address);
      setGames([...fetchedGames]); // Yeni array referansı oluştur
    }
    checkSavedProfile();
  }, [navigate, address]);

  const handleAddGame = () => {
    setIsAddingNew(true);
    setSelectedGame(null);
  };

  const handleSaveGame = async (gameData) => 
  {
    if (!address) return;
    
    try {
      if (selectedGame) 
      {
        // Update existing game
        const updated = await updateGame(selectedGame.id, gameData, address);
        
        // Oyunları yeniden çek ve state'i güncelle
        const updatedGames = await getGames(address);
        setGames([...updatedGames]); // Yeni array referansı oluştur
        setSelectedGame(updated);
        
        toast({
          title: 'Game Updated!',
          description: 'Your game has been successfully updated.',
        });
      } 
      else 
      {
        // Add new game
        const newGame = await addGame(gameData, address);
        
        // Oyunları yeniden çek ve state'i güncelle
        const updatedGames = await getGames(address);
        setGames([...updatedGames]); // Yeni array referansı oluştur
        setSelectedGame(newGame);
        
        toast(
        {
          title: 'New Game Added!',
          description: 'Your game has been added to your inventory.',
        });
      }
      setIsAddingNew(false);
    } catch (error) {
      console.error('Error saving game:', error);
      toast({
        title: 'Error!',
        description: 'Failed to save game. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteGame = async (id) => 
  {
    console.log("Removing => " + id)
    console.log("Profile id => " + profile.id)
    if (!address) return;
    
    try {
      // Transaction oluştur
      const tx = new Transaction();
      
      tx.moveCall(
      {
        target: `${PACKAGE.PACKAGEID}::${PACKAGE.MODULENAME}::${PACKAGE.DELETEGAMEFUNC}`,
        arguments: 
        [
          tx.object(profile.id),
          tx.object(id),
        ],
      });

      // Transaction'ı imzala ve gönder
      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: async (result) => 
          {
            console.log('Game deleted successfully:', result);
            
            // Seçili oyun siliniyorsa seçimi temizle
            if (selectedGame?.id === id) 
            {
              setSelectedGame(null);
            }
            
            // Oyunları yeniden çek ve state'i güncelle
            try {
              const updatedGames = await getGames(address);
              setGames([...updatedGames]); // Yeni array referansı oluştur
              console.log("Games updated after deletion, count:", updatedGames.length);
            } catch (error) {
              console.error('Error refreshing games:', error);
            }
            
            toast(
            {
              title: 'Game Removed',
              description: 'Game has been removed from your inventory.',
            });
          },
          onError: (error) => 
          {
            console.error('Error deleting game:', error);
            
            toast({
              title: 'Failed to Remove Game!',
              description: error.message || 'An error occurred. Please try again.',
              variant: 'destructive',
            });
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
    }
  };

  const handleSelectGame = (game) => 
  {
    setSelectedGame(game);
    setIsAddingNew(false);
  };

  const handleShare = () => 
  {
    if (profile) {
      const username = profile.name;
      const shareUrl = `${window.location.origin}/${username}`;
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: 'Link Copied!',
        description: 'Share your portfolio with the world!',
      });
    }
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Wallet Header */}
      <WalletHeader />
      
      {/* Profile Header */}
      <div className="bg-slate-800/80 border-b-4 border-cyan-500 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-pink-500 rounded-lg flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold pixel-text text-yellow-300">{profile.name}</h1>
              <p className="text-sm font-mono text-cyan-300">Level {games.length + 1} Developer</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={handleShare}
              className="pixel-button bg-green-600 hover:bg-green-500 text-white border-2 border-green-400 font-mono"
            >
              <Share2 className="w-4 h-4 mr-2" />
              SHARE
            </Button>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content with Tabs */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="inventory" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6 bg-slate-800/80 border-2 border-cyan-500 p-1">
            <TabsTrigger 
              value="inventory" 
              className="pixel-button data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-pink-600 data-[state=active]:text-white font-mono"
            >
              <Gamepad2 className="w-4 h-4 mr-2" />
              MY GAMES
            </TabsTrigger>
            <TabsTrigger 
              value="explore" 
              className="pixel-button data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white font-mono"
            >
              <Rocket className="w-4 h-4 mr-2" />
              EXPLORE SPACE
            </TabsTrigger>
          </TabsList>

          {/* My Games Tab */}
          <TabsContent value="inventory" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column - Inventory Panel */}
              <div className="lg:col-span-5">
                <InventoryPanel
                  games={games}
                  selectedGame={selectedGame}
                  onSelectGame={handleSelectGame}
                  onAddGame={handleAddGame}
                  onDeleteGame={handleDeleteGame}
                />
              </div>

              {/* Right Column - Details Panel */}
              <div className="lg:col-span-7">
                <DetailsPanel
                  game={selectedGame}
                  isAddingNew={isAddingNew}
                  onSave={handleSaveGame}
                  onCancel={() => {
                    setIsAddingNew(false);
                    setSelectedGame(null);
                  }}
                />
              </div>
            </div>
          </TabsContent>

          {/* Explore Space Tab */}
          <TabsContent value="explore" className="mt-0">
            <div className="bg-slate-800/80 border-4 border-purple-500 pixel-border backdrop-blur-sm" style={{ height: 'calc(100vh - 250px)' }}>
              <SpaceExplorer />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;