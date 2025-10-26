import type { Profile } from '../types';
//import { useSuiClient  } from '@mysten/dapp-kit';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { STORAGE_KEYS, PACKAGE } from '../constants';

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

    // İlk profile objesini al
    const profileData = ownedObjects.data[0];
    
    if (profileData.data?.content && 'fields' in profileData.data.content) {
      const fields = profileData.data.content.fields as any;
      
      const profile: Profile = 
      {
        id: fields.id.id || '',
        name: fields.name || ''

      };

      // Blockchain'den alınan profili localStorage'a kaydet
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
