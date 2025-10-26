export const STORAGE_KEYS = 
{
  PROFILE: 'gamedev_profile_new',
  GAMES: 'gamedev_games_new',
} as const;

export const PACKAGE = 
{
  PACKAGEID: '0x975c47abc685ac6405eeb94bb643b5da83d424ec87eb665d3dfd23240b2d4424',
  PROFILETYPE: '0x975c47abc685ac6405eeb94bb643b5da83d424ec87eb665d3dfd23240b2d4424::game_dev_card::GameDevCardProfile',
  GAMETYPE: '0x975c47abc685ac6405eeb94bb643b5da83d424ec87eb665d3dfd23240b2d4424::game_dev_card::GameItem',
  MODULENAME: 'game_dev_card',
  CREATEPROFILEFUNC: 'create_game_dev_profile',
  ADDGAMEFUNC: 'add_game',
  UPDATEGAMEFUNC: 'update_game',
  DELETEGAMEFUNC: 'remove_game',
  DONKEYSADDLE: '0x67a472febf1820277d68e96bd462a0bd050273bb5c5d9f157df0ecf6d526ae02'
} as const;

export const ROUTES = {
  CONNECT_WALLET: '/',
  HOME: '/home',
  CREATE_PROFILE: '/create-profile',
  DASHBOARD: '/dashboard',
  PORTFOLIO: '/:username',
  EXPLORER: '/explorer',
} as const;

export const SAMPLE_GAMES = [
  {
    id: '1',
    name: 'Pixel Quest Adventures',
    link: 'https://example.com/pixel-quest',
    description: 'A retro-style platformer with procedurally generated dungeons and epic boss battles.',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=300&fit=crop',
    platform: 'PC, Nintendo Switch',
    releaseDate: '2024-03-15',
    tags: ['Platformer', 'Adventure', 'Pixel Art'],
  },
  {
    id: '2',
    name: 'Cyber Samurai',
    link: 'https://example.com/cyber-samurai',
    description: 'Fast-paced action game set in a neon-lit cyberpunk Tokyo.',
    image: 'https://images.unsplash.com/photo-1538481199705-c4e965fc?w=400&h=300&fit=crop',
    platform: 'PS5, Xbox Series X',
    releaseDate: '2023-11-20',
    tags: ['Action', 'Cyberpunk', 'Fighting'],
  },
] as const;

export const MOCK_USERS = [
  { name: 'PixelMaster', bio: 'Retro game enthusiast', gameCount: 8, level: 12 },
  { name: 'CodeNinja', bio: 'Indie dev from Tokyo', gameCount: 5, level: 8 },
  { name: 'GameWizard', bio: 'RPG specialist', gameCount: 12, level: 15 },
  { name: 'RetroKing', bio: '8-bit forever', gameCount: 6, level: 9 },
  { name: 'PixelQueen', bio: 'Art & code fusion', gameCount: 10, level: 13 },
  { name: 'ByteHero', bio: 'Speed run developer', gameCount: 4, level: 7 },
  { name: 'ArcadeAce', bio: 'Classic arcade revivals', gameCount: 15, level: 18 },
  { name: 'ChiptuneChamp', bio: 'Music & games', gameCount: 7, level: 10 },
  { name: 'SpriteSmith', bio: 'Pixel art creator', gameCount: 9, level: 11 },
  { name: 'QuestMaker', bio: 'Story-driven games', gameCount: 11, level: 14 },
  { name: 'BossBattler', bio: 'Epic encounters', gameCount: 6, level: 9 },
  { name: 'LevelDesigner', bio: 'Worlds & puzzles', gameCount: 8, level: 12 },
  { name: 'IndieGamer', bio: 'Solo game creator', gameCount: 5, level: 8 },
  { name: 'PixelPunk', bio: 'Cyberpunk aesthetics', gameCount: 7, level: 10 },
  { name: 'RetroRevival', bio: 'Bringing classics back', gameCount: 13, level: 16 },
  { name: 'CodeCrusader', bio: 'Clean code warrior', gameCount: 9, level: 11 },
  { name: 'GameGuru', bio: 'Teaching & creating', gameCount: 14, level: 17 },
  { name: 'PixelPirate', bio: 'Adventure games ahoy', gameCount: 6, level: 9 },
  { name: 'ByteBoss', bio: 'Optimization expert', gameCount: 10, level: 13 },
  { name: 'ArcadeLegend', bio: 'High score chaser', gameCount: 12, level: 15 },
] as const;
