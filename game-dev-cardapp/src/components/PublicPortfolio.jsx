import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { getProfile, getProfileIdFromUsername, getWalletAddressByProfileId } from '../services/profileService';
import { getGames  } from '../services/gameService';
import { ExternalLink, ArrowLeft, Gamepad2, Calendar, Tag } from 'lucide-react';
import WalletHeader from './WalletHeader';
import { useWallet } from '../contexts/WalletContext';

const PublicPortfolio = () => 
  {
  const { username } = useParams();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(false);
  const [games, setGames] = useState([]);
  const { address } = useWallet();

  useEffect( () => 
  {
    const asyncChecks = async () => 
    {
      const profileId = await getProfileIdFromUsername(username);
      if(profileId == "")
      {
        setProfile(false);
        setLoading(false);
        return
      }
      const walletAddress = await getWalletAddressByProfileId(profileId)
      if(walletAddress == "")
      {
        setProfile(false);
        setLoading(false);
        return
      }
      console.log("settings games with wallet address => " + walletAddress)
      setGames(await getGames(walletAddress));
      setLoading(false);
      setProfile(true);
    }
    asyncChecks();
    
  }, [username, profile]);

  if (loading) 
  {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <p className="text-cyan-300 font-mono text-xl">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center p-12">
          <div className="text-8xl mb-6">🕵️</div>
          <h1 className="text-4xl font-bold pixel-text text-red-400 mb-4">USER NOT FOUND</h1>
          <p className="text-xl font-mono text-slate-400 mb-8">This portfolio doesn't exist</p>
          <Button
            onClick={() => navigate('/')}
            className="pixel-button bg-gradient-to-r from-cyan-500 to-pink-500 text-white font-bold px-8 py-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            GO BACK HOME
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      {/* Wallet Header - only show if user is logged in */}
      {address && <WalletHeader showBackButton onBack={() => navigate('/dashboard')} />}
      
      {/* Hero Section */}
      <div className={`relative overflow-hidden ${address ? 'pt-20' : ''}`}>
        {/* Animated background */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 animate-pulse"
              style={
              {
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 container mx-auto px-4 py-20 text-center">
          <div className="inline-block p-6 bg-gradient-to-br from-cyan-500 to-pink-500 rounded-full mb-6 animate-bounce">
            <Gamepad2 className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold pixel-text text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-pink-300 to-yellow-300 mb-4">
            {profile.name}
          </h1>
          <p className="text-2xl font-mono text-green-400 mb-8">Level {games.length + 1} Game Developer</p>
          <div className="flex items-center justify-center gap-6 text-lg font-mono text-slate-300">
            <div>
              <span className="text-yellow-400 font-bold text-3xl">{games.length}</span>
              <span className="ml-2">Games</span>
            </div>
            <div className="w-2 h-2 bg-cyan-400 rounded-full" />
            <div>
              <span className="text-cyan-400 font-bold text-3xl">100</span>
              <span className="ml-2">HP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Games Grid */}
      <div className="container mx-auto px-4 py-16">
        {games.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-8xl mb-6">🎮</div>
            <p className="text-2xl font-mono text-slate-400">No games yet!</p>
            <p className="text-lg font-mono text-slate-500 mt-4">Check back later for awesome games</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {games.map((game) => (
              <div
                key={game.id}
                className="group bg-slate-800/80 border-4 border-cyan-500 pixel-border backdrop-blur-sm hover:border-pink-500 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(236,72,153,0.5)]"
              >
                {/* Game Image */}
                {game.image && (
                  <div className="w-full h-56 overflow-hidden border-b-4 border-slate-700 bg-slate-950">
                    <img
                      src={game.image}
                      alt={game.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 pixel-image"
                    />
                  </div>
                )}

                {/* Game Info */}
                <div className="p-6 space-y-4">
                  <h3 className="text-2xl font-bold pixel-text text-cyan-300">{game.name}</h3>
                  
                  {game.description && (
                    <p className="text-slate-300 font-mono text-sm leading-relaxed">
                      {game.description}
                    </p>
                  )}

                  {/* Meta Info */}
                  <div className="space-y-2">
                    {game.platform && (
                      <div className="flex items-center gap-2 text-sm">
                        <Gamepad2 className="w-4 h-4 text-yellow-400" />
                        <span className="font-mono text-slate-400">{game.platform}</span>
                      </div>
                    )}
                  </div>

                  {/* Link Button */}
                  {game.link && (
                    <a
                      href={game.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button className="w-full pixel-button bg-gradient-to-r from-cyan-600 to-pink-600 hover:from-cyan-500 hover:to-pink-500 text-white border-4 border-white font-bold py-4 shadow-[0_4px_0_rgba(0,0,0,0.3)] hover:shadow-[0_2px_0_rgba(0,0,0,0.3)] active:shadow-[0_1px_0_rgba(0,0,0,0.3)] hover:-translate-y-1 active:translate-y-1 transition-all duration-150">
                        <ExternalLink className="w-5 h-5 mr-2" />
                        PLAY GAME
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-slate-800/80 border-t-4 border-cyan-500 py-8 mt-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg font-mono text-slate-400">
            Powered by <span className="text-cyan-400 font-bold">Cosgame.fun</span>
          </p>
          <Button
            onClick={() => navigate('/')}
            className="mt-4 pixel-button bg-green-600 hover:bg-green-500 text-white font-mono"
          >
            CREATE YOUR OWN GAME DEV PORTFOLIO
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default PublicPortfolio;