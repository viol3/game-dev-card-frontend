export interface Game {
  id: string;
  name: string;
  link: string;
  description: string;
  image: string;
  platform: string;
}

export interface Profile {
  name: string;
  username?: string;
  bio?: string;
  walletAddress?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
  socialLinks?: {
    twitter?: string;
    github?: string;
    discord?: string;
    website?: string;
  };
}

export interface User {
  id: string;
  username: string;
  name: string;
  bio: string;
  gameCount: number;
  level: number;
}
