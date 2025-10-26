import { Button } from './ui/button';
import { Plus, Trash2, ExternalLink } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import type { Game } from '../types';

interface InventoryPanelProps
{
  games: Game[];
  selectedGame: Game | null;
  onSelectGame: (game: Game) => void;
  onAddGame: () => void;
  onDeleteGame: (id: string) => void;
}

const InventoryPanel = ({ games, selectedGame, onSelectGame, onAddGame, onDeleteGame }: InventoryPanelProps) => {
  return (
    <div className="bg-slate-800/80 border-4 border-cyan-500 pixel-border backdrop-blur-sm h-[calc(100vh-200px)]">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-pink-600 p-4 border-b-4 border-cyan-400">
        <h2 className="text-2xl font-bold pixel-text text-white flex items-center justify-between">
          GAME INVENTORY
          <span className="text-lg bg-yellow-500 text-slate-900 px-3 py-1 rounded">{games.length}</span>
        </h2>
      </div>

      {/* Add Game Button */}
      <div className="p-4 border-b-4 border-slate-700">
        <Button
          onClick={onAddGame}
          className="w-full pixel-button bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white border-4 border-green-400 py-6 text-lg font-bold shadow-[0_4px_0_rgba(0,0,0,0.3)] hover:shadow-[0_2px_0_rgba(0,0,0,0.3)] active:shadow-[0_1px_0_rgba(0,0,0,0.3)] hover:-translate-y-1 active:translate-y-1 transition-all duration-150"
        >
          <Plus className="w-6 h-6 mr-2" />
          ADD NEW GAME
        </Button>
      </div>

      {/* Games List */}
      <ScrollArea className="h-[calc(100%-180px)]">
        <div className="p-4 space-y-3">
          {games.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎮</div>
              <p className="text-lg font-mono text-slate-400">No games yet!</p>
              <p className="text-sm font-mono text-slate-500 mt-2">Click "ADD NEW GAME" to start</p>
            </div>
          ) : (
            games.map((game) => (
              <div
                key={game.id}
                onClick={() => onSelectGame(game)}
                className={`group relative bg-slate-900 border-4 ${
                  selectedGame?.id === game.id
                    ? 'border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.5)]'
                    : 'border-slate-700 hover:border-cyan-400'
                } pixel-border p-4 cursor-pointer transition-all duration-200 hover:scale-105`}
              >
                {/* Game image thumbnail */}
                {game.image && (
                  <div className="w-full h-32 mb-3 overflow-hidden border-2 border-slate-600 bg-slate-950">
                    <img
                      src={game.image}
                      alt={game.name}
                      className="w-full h-full object-cover pixel-image"
                    />
                  </div>
                )}

                {/* Game info */}
                <div className="space-y-2">
                  <h3 className="font-bold text-lg text-cyan-300 font-mono truncate">{game.name}</h3>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <span className="bg-pink-600 text-white px-2 py-1 font-mono text-xs">GAME</span>
                    {game.platform && (
                      <span className="text-slate-400 font-mono text-xs truncate">{game.platform}</span>
                    )}
                  </div>

                  {game.tags && game.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {game.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-slate-700 text-green-400 px-2 py-1 font-mono border border-slate-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {game.link && (
                    <a
                      href={game.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="bg-blue-600 hover:bg-blue-500 p-2 border-2 border-blue-400 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 text-white" />
                    </a>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Delete this quest?')) {
                        onDeleteGame(game.id);
                      }
                    }}
                    className="bg-red-600 hover:bg-red-500 p-2 border-2 border-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default InventoryPanel;