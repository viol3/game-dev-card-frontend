import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, Users, Gamepad2, Star } from 'lucide-react';
import { getMockUsers } from '../services/userService';

const SpaceExplorer = () => {
  const [planets, setPlanets] = useState([]);
  const [hoveredPlanet, setHoveredPlanet] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get mock users and generate planet positions
    const users = getMockUsers();
    const generatedPlanets = users.map((user, index) => ({
      ...user,
      x: Math.random() * 80 + 10, // 10-90%
      y: Math.random() * 80 + 10, // 10-90%
      size: 40 + Math.random() * 30, // 40-70px
      color: getPlanetColor(index),
      rotation: Math.random() * 360,
      animationDelay: Math.random() * 3,
    }));
    setPlanets(generatedPlanets);
  }, []);

  const getPlanetColor = (index) => {
    const colors = [
      'from-cyan-400 to-blue-600',
      'from-pink-400 to-rose-600',
      'from-yellow-400 to-orange-600',
      'from-green-400 to-emerald-600',
      'from-purple-400 to-indigo-600',
      'from-red-400 to-pink-600',
      'from-teal-400 to-cyan-600',
      'from-amber-400 to-yellow-600',
    ];
    return colors[index % colors.length];
  };

  const handlePlanetClick = (username) => {
    navigate(`/portfolio/${username}`);
  };

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden">
      {/* Animated starfield background */}
      <div className="absolute inset-0">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.7 + 0.3,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Shooting stars */}
      {[...Array(3)].map((_, i) => (
        <div
          key={`star-${i}`}
          className="absolute w-1 h-1 bg-yellow-300"
          style={{
            top: `${Math.random() * 50}%`,
            left: '-10px',
            animation: `shootingStar ${5 + Math.random() * 5}s linear infinite`,
            animationDelay: `${i * 3}s`,
          }}
        />
      ))}

      {/* Header Stats */}
      <div className="relative z-10 p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-cyan-500 to-pink-500 rounded-lg">
            <Rocket className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold pixel-text text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-pink-300">
              SPACE EXPLORER
            </h2>
            <p className="text-sm font-mono text-slate-400">Discover game developers across the galaxy</p>
          </div>
        </div>
        <div className="flex gap-6">
          <div className="text-center">
            <div className="flex items-center gap-2 text-cyan-400">
              <Users className="w-5 h-5" />
              <span className="text-2xl font-bold">{planets.length}</span>
            </div>
            <p className="text-xs font-mono text-slate-400">Developers</p>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-2 text-yellow-400">
              <Gamepad2 className="w-5 h-5" />
              <span className="text-2xl font-bold">
                {planets.reduce((sum, p) => sum + p.gameCount, 0)}
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400">Games</p>
          </div>
        </div>
      </div>

      {/* Space with planets */}
      <div className="relative w-full h-[calc(100%-120px)]">
        {planets.map((planet) => (
          <div
            key={planet.id}
            className="absolute cursor-pointer group"
            style={{
              left: `${planet.x}%`,
              top: `${planet.y}%`,
              transform: 'translate(-50%, -50%)',
              animation: `float ${3 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${planet.animationDelay}s`,
            }}
            onClick={() => handlePlanetClick(planet.username)}
            onMouseEnter={() => setHoveredPlanet(planet)}
            onMouseLeave={() => setHoveredPlanet(null)}
          >
            {/* Planet glow effect */}
            <div
              className={`absolute inset-0 bg-gradient-to-r ${planet.color} rounded-full blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-300`}
              style={{
                width: planet.size * 1.5,
                height: planet.size * 1.5,
                transform: 'translate(-16.66%, -16.66%)',
              }}
            />

            {/* Planet body */}
            <div
              className={`relative bg-gradient-to-br ${planet.color} rounded-full border-4 border-white/20 shadow-2xl group-hover:scale-110 transition-transform duration-300`}
              style={{
                width: planet.size,
                height: planet.size,
              }}
            >
              {/* Planet texture */}
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 50%)`,
                  }}
                />
                {/* Craters */}
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute bg-black/20 rounded-full"
                    style={{
                      width: `${15 + Math.random() * 15}%`,
                      height: `${15 + Math.random() * 15}%`,
                      top: `${Math.random() * 70}%`,
                      left: `${Math.random() * 70}%`,
                    }}
                  />
                ))}
              </div>

              {/* Game count badge */}
              <div className="absolute -top-2 -right-2 bg-yellow-500 border-2 border-yellow-300 rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                <span className="text-xs font-bold text-slate-900">{planet.gameCount}</span>
              </div>
            </div>

            {/* Planet name label */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
              <div className="bg-slate-800/90 border-2 border-cyan-500 px-3 py-1 rounded backdrop-blur-sm">
                <p className="text-xs font-bold font-mono text-cyan-300 truncate max-w-[120px]">
                  {planet.name}
                </p>
              </div>
            </div>

            {/* Orbit ring on hover */}
            {hoveredPlanet?.id === planet.id && (
              <div
                className="absolute border-2 border-cyan-400/50 rounded-full animate-spin"
                style={{
                  width: planet.size * 1.8,
                  height: planet.size * 1.8,
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  animationDuration: '10s',
                }}
              >
                <div className="absolute top-0 left-1/2 w-2 h-2 bg-cyan-400 rounded-full -translate-x-1/2 -translate-y-1/2" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Hover info panel */}
      {hoveredPlanet && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-slate-800/95 border-4 border-cyan-500 pixel-border p-4 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 bg-gradient-to-br ${hoveredPlanet.color} rounded-full border-2 border-white/30`}
              />
              <div>
                <h3 className="text-xl font-bold pixel-text text-cyan-300">{hoveredPlanet.name}</h3>
                <p className="text-sm font-mono text-slate-300 mt-1">{hoveredPlanet.bio}</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Gamepad2 className="w-4 h-4" />
                    <span className="text-sm font-mono font-bold">{hoveredPlanet.gameCount} Games</span>
                  </div>
                  <div className="flex items-center gap-1 text-green-400">
                    <Star className="w-4 h-4" />
                    <span className="text-sm font-mono font-bold">Lvl {hoveredPlanet.level}</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs font-mono text-cyan-400 mt-3 text-center">
              Click planet to explore portfolio →
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shootingStar {
          0% {
            transform: translateX(0) translateY(0);
            opacity: 1;
          }
          70% {
            opacity: 1;
          }
          100% {
            transform: translateX(1000px) translateY(500px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default SpaceExplorer;