import type { Profile } from '../types';
import { STORAGE_KEYS } from '../constants';

/**
 * Get profile from localStorage by wallet address
 */
export const getProfile = (walletAddress?: string): Profile | null => {
  try {
    if (walletAddress) {
      const stored = localStorage.getItem(`${STORAGE_KEYS.PROFILE}_${walletAddress}`);
      return stored ? JSON.parse(stored) : null;
    }
    // Fallback to old storage for backward compatibility
    const stored = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error reading profile from localStorage:', error);
    return null;
  }
};

/**
 * Save profile to localStorage with wallet address
 */
export const saveProfile = (profile: Profile, walletAddress: string): void => {
  try {
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
