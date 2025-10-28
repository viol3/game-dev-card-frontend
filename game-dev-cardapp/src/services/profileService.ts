import type { Profile } from '../types';
//import { useSuiClient  } from '@mysten/dapp-kit';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { STORAGE_KEYS, PACKAGE } from '../constants';
import { getGames } from './gameService';

/**
 * Get profile from localStorage by wallet address
 */
export const getProfile = async (walletAddress?: string): Promise<Profile | null> => 
{
  try 
  {
    if (!walletAddress) 
    {
      return null;
    }

    const client = new SuiClient({ url: getFullnodeUrl('testnet') });
    
    const ownedObjects = await client.getOwnedObjects(
    {
      owner: walletAddress,
      filter: {
        StructType: PACKAGE.PROFILETYPE
      },
      options: {
        showType: true,
        showContent: true,
      },
    });

    if (ownedObjects.data.length === 0) {
      return null;
    }

    // Get first profile object
    const profileData = ownedObjects.data[0];
    
    if (profileData.data?.content && 'fields' in profileData.data.content) {
      const fields = profileData.data.content.fields as any;
      
      const profile: Profile = 
      {
        id: fields.id.id || '',
        name: fields.name || ''

      };

      // Save profile from blockchain to localStorage
      localStorage.setItem(
        `${STORAGE_KEYS.PROFILE}_${walletAddress}`,
        JSON.stringify(profile)
      );

      return profile;
    }

    return null;
  } 
  catch (error) 
  {
    console.error('Error reading profile:', error);
    return null;
  }
};

/**
 * Save profile to localStorage with wallet address
 */
export const saveProfile = (profile: Profile, walletAddress: string): void => {
  try 
  {
    const profileWithWallet = {
      ...profile,
      walletAddress,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(
      `${STORAGE_KEYS.PROFILE}_${walletAddress}`,
      JSON.stringify(profileWithWallet)
    );
  } catch (error) {
    console.error('Error saving profile to localStorage:', error);
    throw new Error('Failed to save profile');
  }
};

/**
 * Delete profile and associated data by wallet address
 */
export const deleteProfile = (walletAddress: string): void => {
  try {
    localStorage.removeItem(`${STORAGE_KEYS.PROFILE}_${walletAddress}`);
    localStorage.removeItem(`${STORAGE_KEYS.GAMES}_${walletAddress}`);
  } catch (error) {
    console.error('Error deleting profile:', error);
    throw new Error('Failed to delete profile');
  }
};

/**
 * Generate URL-friendly username from name
 */
export const generateUsername = (name: string): string => {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '-');
};

export const getProfileIdFromUsername = async (username: string): Promise<string> =>
{
  const client = new SuiClient({ url: getFullnodeUrl('testnet') });
  try {
    let hasNextPage = true;
    let cursor = null;

    // Search all dynamic fields with pagination
    while (hasNextPage) 
    {
      const response = await client.getDynamicFields({
        parentId: PACKAGE.DONKEYSADDLE,
        cursor: cursor,
        limit: 50
      });

      const found = response.data.find(
        field => field.name.value === username
      );  

      if (found) 
      {
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
          return fields.value || "";
        }

        return "";
        
      }

      hasNextPage = response.hasNextPage;
      cursor = response.nextCursor;
    }

    return "";
    
  } 
  catch (error) 
  {
    console.error('Error searching for user:', error);
    throw error;
  }
}

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
    const owner = object.data?.owner;
    if (owner && typeof owner === 'object' && 'AddressOwner' in owner) {
      return owner.AddressOwner as string;
    }
    return "";
  } 
  catch (error) 
  {
    console.error('Error reading user:', error);
    return "";
  }
};

/**
 * Get all user profiles from blockchain for exploration
 */
export const getAllProfiles = async (): Promise<any[]> => {
  try {
    const client = new SuiClient({ url: getFullnodeUrl('testnet') });
    
    // Get dynamic fields from DONKEYSADDLE (username -> profile_id mappings)
    const dynamicFields = await client.getDynamicFields({
      parentId: PACKAGE.DONKEYSADDLE,
    });

    if (!dynamicFields.data || dynamicFields.data.length === 0) {
      console.log('No profiles found in dynamic fields');
      return [];
    }

    console.log(`Found ${dynamicFields.data.length} profiles in blockchain`);

    // Process all profiles in parallel
    const profiles = await Promise.all(
      dynamicFields.data.map(async (field) => {
        try {
          console.log('Processing field:', field);
          console.log('Field name:', field.name);
          console.log('Field name value:', field.name.value);
          
          // Extract username from dynamic field name
          // The value might be an array of bytes that needs to be converted to string
          let username = '';
          if (typeof field.name.value === 'string') {
            username = field.name.value;
          } else if (Array.isArray(field.name.value)) {
            // Convert byte array to string
            username = String.fromCharCode(...field.name.value);
          } else {
            console.warn('Unknown username format:', field.name.value);
          }
          
          console.log('Extracted username:', username);
          
          // Get the dynamic field object (contains profile_id as value)
          const fieldObject = await client.getObject({
            id: field.objectId,
            options: {
              showContent: true,
            },
          });

          console.log('Field object:', fieldObject);

          if (!fieldObject.data?.content || fieldObject.data.content.dataType !== 'moveObject') {
            console.log('Invalid field object content');
            return null;
          }

          const profileId = (fieldObject.data.content.fields as any).value;
          console.log('Profile ID:', profileId);
          
          // Get profile details
          const profileObject = await client.getObject({
            id: profileId,
            options: {
              showContent: true,
              showOwner: true,
            },
          });

          console.log('Profile object:', profileObject);

          if (!profileObject.data?.content || profileObject.data.content.dataType !== 'moveObject') {
            console.log('Invalid profile object content');
            return null;
          }

          // Get wallet address from profile owner
          const owner = profileObject.data?.owner;
          let walletAddress = '';
          if (owner && typeof owner === 'object' && 'AddressOwner' in owner) {
            walletAddress = owner.AddressOwner as string;
          }

          console.log('Wallet address:', walletAddress);

          const profileFields = profileObject.data.content.fields as any;
          console.log('Profile fields:', profileFields);
          
          // Get games for this wallet address
          const games = await getGames(walletAddress);
          console.log('Games for profile:', games);
          
          return {
            id: profileId,
            username: username, // Use username from dynamic field
            name: profileFields.name || '',
            bio: profileFields.bio || '',
            gameCount: games.length,
            level: Math.min(Math.floor(games.length / 2) + 1, 10),
            games: games,
          };
        } catch (error) {
          console.error('Error processing profile:', error);
          return null;
        }
      })
    );

    // Filter out null values
    const validProfiles = profiles.filter((profile) => profile !== null);
    console.log(`Successfully loaded ${validProfiles.length} profiles`);
    return validProfiles;
  } catch (error) {
    console.error('Error fetching all profiles:', error);
    return [];
  }
};
