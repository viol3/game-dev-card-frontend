import type { Game } from '../types';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { PACKAGE } from '../constants';

export const getProfileIdFromUsername = async (username: string): Promise<string> =>
{
  const client = new SuiClient({ url: getFullnodeUrl('testnet') });
  try {
    let hasNextPage = true;
    let cursor = null;

    // Tüm dynamic field'ları paginate ederek ara
    while (hasNextPage) 
    {
      const response = await client.getDynamicFields({
        parentId: PACKAGE.DONKEYSADDLE,
        cursor: cursor,
        limit: 50
      });

      // Username'i ara
      const found = response.data.find(
        field => field.name.value === username
      );

      if (found) 
      {
        console.log(`Found user "${username}":`, found.objectId);
        const object = await client.getObject(
        {
          id: found.objectId,
          options: 
          {
            showContent: true
          }
        });

        if (object.data?.content?.dataType === 'moveObject') 
          {
          const fields = object.data.content.fields as any;
          console.log(fields)
          return fields.value || "";
        }

        return "";
        
      }

      hasNextPage = response.hasNextPage;
      cursor = response.nextCursor;
    }

    console.log(`User "${username}" not found`);
    return "";
    
  } 
  catch (error) 
  {
    console.error('Error searching for user:', error);
    throw error;
  }
}

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

export const getWalletAddressByProfileId = async (profileId: string): Promise<string> => 
{
  try 
  {
    if (!profileId) 
    {
      return "";
    }
    const client = new SuiClient({ url: getFullnodeUrl('testnet') });
    const object = await client.getObject(
    {
        id: profileId,
        options: 
        {
          showOwner: true
        }
    });
    console.log(object.data)
    return object.data?.owner?.AddressOwner || "";
  } 
  catch (error) 
  {
    console.error('Error reading user:', error);
    return "";
  }
};


/**
 * Add a new game
 */
export const addGame = async (game: Omit<Game, 'id'>, walletAddress: string): Promise<Game> => {
  const games = await getGames(walletAddress);
  console.log("fetched new games => " + games)
  const newGame: Game = {
    ...game,
    id: Date.now().toString(),
  };
  games.push(newGame);
  //saveGames(games, walletAddress);
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
  //saveGames(games, walletAddress);
  return games[index];
};


