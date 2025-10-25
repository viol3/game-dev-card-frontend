import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { getProfile, deleteProfile } from '../services/profileService';
import { getGames, addGame, updateGame, deleteGame } from '../services/gameService';
import { useWallet } from '../contexts/WalletContext';
import InventoryPanel from './InventoryPanel';
import DetailsPanel from './DetailsPanel';
import SpaceExplorer from './SpaceExplorer';
import { LogOut, Share2, User, Rocket, Gamepad2, Copy, Check } from 'lucide-react';
import { toast } from '../hooks/use-toast';

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const navigate = useNavigate();
  const { address, disconnect } = useWallet();

  useEffect(() => {
    if (!address) {
      navigate('/');
      return;
    }
    
    const savedProfile = getProfile(address);
    if (!savedProfile) {
      navigate('/create-profile');
      return;
    }
    setProfile(savedProfile);
    setGames(getGames(address));
  }, [navigate, address]);

  const handleAddGame = () => {
    setIsAddingNew(true);
    setSelectedGame(null);
  };

  const handleSaveGame = (gameData) => {
    if (!address) return;
    
    if (selectedGame) {
      // Update existing game
      const updated = updateGame(selectedGame.id, gameData, address);
      setGames(getGames(address));
      setSelectedGame(updated);
      toast({
        title: 'Quest Updated!',
        description: 'Your game has been successfully updated.',
      });
    } else {
      // Add new game
      const newGame = addGame(gameData, address);
      setGames(getGames(address));
      setSelectedGame(newGame);
      toast({
        title: 'New Quest Added!',
        description: 'Your game has been added to your inventory.',
      });
    }
    setIsAddingNew(false);
  };

  const handleDeleteGame = (id) => {
    if (!address) return;
    
    deleteGame(id, address);
    setGames(getGames(address));
    if (selectedGame?.id === id) {
      setSelectedGame(null);
    }
    toast({
      title: 'Quest Removed',
      description: 'Game has been removed from your inventory.',
    });
  };

  const handleSelectGame = (game) => {
    setSelectedGame(game);
    setIsAddingNew(false);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to disconnect your wallet?')) {
      disconnect();
      navigate('/');
    }
  };

  const handleShare = () => {
    if (profile) {
      const username = profile.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const shareUrl = `${window.location.origin}/portfolio/${username}`;
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: 'Link Copied!',
        description: 'Share your portfolio with the world!',
      });
    }
  };

  const handleCopyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(true);
      toast({
        title: 'Address Copied!',
        description: 'Wallet address copied to clipboard.',
      });
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/80 border-b-4 border-cyan-500 backdrop-blur-sm sticky top-0 z-50">
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
            {/* Wallet Address Display */}
            <div 
              onClick={handleCopyAddress}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-900/50 border-2 border-cyan-500/50 rounded-lg cursor-pointer hover:border-cyan-400 transition-all group"
              title="Click to copy wallet address"
            >
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="font-mono text-cyan-300 text-sm">
                {formatAddress(address)}
              </span>
              {copiedAddress ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
              )}
            </div>

            <Button
              onClick={handleShare}
              className="pixel-button bg-green-600 hover:bg-green-500 text-white border-2 border-green-400 font-mono"
            >
              <Share2 className="w-4 h-4 mr-2" />
              SHARE
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="pixel-button border-2 border-red-500 text-red-400 hover:bg-red-500 hover:text-white font-mono"
            >
              <LogOut className="w-4 h-4 mr-2" />
              LOGOUT
            </Button>
          </div>
        </div>
      </header>

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