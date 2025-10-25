import type { User } from '../types';
import { MOCK_USERS } from '../constants';

/**
 * Get all mock users for exploration feature
 */
export const getMockUsers = (): User[] => {
  return MOCK_USERS.map((user, index) => ({
    id: `user-${index}`,
    username: user.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    ...user,
  }));
};
