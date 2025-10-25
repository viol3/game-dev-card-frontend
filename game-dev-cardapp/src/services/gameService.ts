import type { Game } from '../types';
import { STORAGE_KEYS } from '../constants';

/**
 * Get all games from localStorage by wallet address
 */
export const getGames = (walletAddress?: string): Game[] => {
  try {
    if (walletAddress) {
      const stored = localStorage.getItem(`${STORAGE_KEYS.GAMES}_${walletAddress}`);
      return stored ? JSON.parse(stored) : [];
    }
    // Fallback to old storage for backward compatibility
    const stored = localStorage.getItem(STORAGE_KEYS.GAMES);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading games from localStorage:', error);
    return [];
  }
};

/**
 * Save games to localStorage with wallet address
 */
export const saveGames = (games: Game[], walletAddress: string): void => {
  try {
    localStorage.setItem(
      `${STORAGE_KEYS.GAMES}_${walletAddress}`,
      JSON.stringify(games)
    );
  } catch (error) {
    console.error('Error saving games to localStorage:', error);
    throw new Error('Failed to save games');
  }
};

/**
 * Add a new game
 */
export const addGame = (game: Omit<Game, 'id'>, walletAddress: string): Game => {
  const games = getGames(walletAddress);
  const newGame: Game = {
    ...game,
    id: Date.now().toString(),
  };
  games.push(newGame);
  saveGames(games, walletAddress);
  return newGame;
};

/**
 * Update an existing game
 */
export const updateGame = (id: string, updatedGame: Partial<Game>, walletAddress: string): Game | null => {
  const games = getGames(walletAddress);
  const index = games.findIndex((g) => g.id === id);
  
  if (index === -1) {
    console.warn(`Game with id ${id} not found`);
    return null;
  }

  games[index] = { ...games[index], ...updatedGame };
  saveGames(games, walletAddress);
  return games[index];
};

/**
 * Delete a game by id
 */
export const deleteGame = (id: string, walletAddress: string): void => {
  const games = getGames(walletAddress);
  const filtered = games.filter((g) => g.id !== id);
  saveGames(filtered, walletAddress);
};
