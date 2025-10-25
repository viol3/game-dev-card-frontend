import type { Game } from '../types';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { STORAGE_KEYS, PACKAGE } from '../constants';

/**
 * Get all games from localStorage by wallet address
 */
export const getGames = async (walletAddress?: string): Promise<Game[]> => 
{
  try {
    if (!walletAddress) 
    {
      return [];
    }


    const client = new SuiClient({ url: getFullnodeUrl('testnet') });
    
    const ownedObjects = await client.getOwnedObjects(
    {
      owner: walletAddress,
      filter: 
      {
        StructType: PACKAGE.GAMETYPE
      },
      options: 
      {
        showType: true,
        showContent: true,
      },
    });

    if (ownedObjects.data.length === 0) 
    {
      return [];
    }

    const games: Game[] = ownedObjects.data.map((obj) => {
      if (obj.data?.content && 'fields' in obj.data.content) {
        const fields = obj.data.content.fields as any;
        return {
          id: obj.data.objectId,
          name: fields.game_name || '',
          link: fields.game_link || '',
          description: fields.description || '',
          image: fields.image_url || '',
          platform: fields.platform || '',
        };
      }
      
      return null;
    }).filter((game): game is Game => game !== null);

    return games;
  } 
  catch (error) 
  {
    console.error('Error reading games:', error);
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
export const addGame = async (game: Omit<Game, 'id'>, walletAddress: string): Promise<Game> => {
  const games = await getGames(walletAddress);
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
export const updateGame = async (id: string, updatedGame: Partial<Game>, walletAddress: string): Promise<Game | null> => 
{
  const games = await getGames(walletAddress);
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
export const deleteGame = async (id: string, walletAddress: string): Promise<void> => 
{
  const games = await getGames(walletAddress);
  const filtered = games.filter((g) => g.id !== id);
  saveGames(filtered, walletAddress);
};
