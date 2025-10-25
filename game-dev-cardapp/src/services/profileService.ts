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
