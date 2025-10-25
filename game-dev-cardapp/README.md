# 🎮 Game Dev Card - Portfolio LinkTree

A professional, pixel-art themed portfolio platform for game developers to showcase their games and achievements. Built with modern web technologies and a clean, modular architecture.

## ✨ Features

- **🎨 Pixel Art Theme**: Retro-styled UI with modern animations
- **🎮 Game Showcase**: Add, edit, and manage your game portfolio
- **👤 Developer Profiles**: Create personalized developer profiles
- **🌌 Space Explorer**: Discover other developers and their portfolios
- **📱 Responsive Design**: Works seamlessly on all devices
- **⚡ Performance Optimized**: Lazy loading, code splitting, and optimized builds
- **🔒 Type-Safe**: Full TypeScript support
- **🎯 Clean Architecture**: Modular service layer with separation of concerns

## 🛠️ Tech Stack

- **Framework**: [React 18](https://react.dev/) with TypeScript
- **Build Tool**: [Vite 7](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router v6](https://reactrouter.com/)
- **State Management**: React Hooks + LocalStorage
- **Code Quality**: ESLint + TypeScript + Prettier

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components (Radix UI)
│   ├── LandingPage.jsx
│   ├── CreateProfilePage.jsx
│   ├── Dashboard.jsx
│   ├── PublicPortfolio.jsx
│   ├── SpaceExplorer.jsx
│   ├── InventoryPanel.jsx
│   └── DetailsPanel.jsx
├── services/           # Business logic & data management
│   ├── gameService.ts
│   ├── profileService.ts
│   └── userService.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── constants/          # App constants & config
│   └── index.ts
├── hooks/              # Custom React hooks
│   └── use-toast.ts
├── lib/                # Utility functions
│   └── utils.ts
├── App.tsx             # Main app component with routing
├── main.tsx            # App entry point
└── index.css           # Global styles & Tailwind config
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/viol3/game-dev-card-frontend.git
cd game-dev-card-frontend/game-dev-cardapp
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Start the development server:
```bash
npm run dev
# or
pnpm dev
```

4. Open your browser to `http://localhost:5173`

## 🏗️ Building for Production

```bash
npm run build
# or
pnpm build
```

The build output will be in the `dist/` directory.

## 🎯 Key Features Explained

### Service Layer Architecture

The app uses a clean service layer pattern to separate business logic from UI:

- **`gameService.ts`**: Handles all game-related operations (CRUD)
- **`profileService.ts`**: Manages user profile data
- **`userService.ts`**: Provides mock user data for exploration

### Type Safety

Full TypeScript support with defined interfaces:
- `Game`: Game entity structure
- `Profile`: User profile structure
- `User`: User entity for exploration feature

### Performance Optimizations

- **Lazy Loading**: Routes are lazy-loaded for better initial load time
- **Code Splitting**: Automatic chunking via Vite
- **Optimized Images**: External image URLs with proper sizing
- **Memoization**: Strategic use of React hooks

### Local Storage Persistence

Data is automatically saved to browser localStorage:
- User profiles
- Game collections
- Preferences

## 🎨 Customization

### Tailwind Configuration

The app uses a custom Tailwind configuration with:
- Dark mode support
- Custom color palette
- Pixel-art themed animations
- Custom gradients

### Adding New Features

1. Create types in `src/types/`
2. Add business logic to `src/services/`
3. Create UI components in `src/components/`
4. Add routes in `src/App.tsx`

## 📝 Code Quality

- **ESLint**: Configured for React + TypeScript
- **Prettier**: Code formatting (via config)
- **TypeScript**: Strict type checking
- **Modular Architecture**: Clean separation of concerns

## 🐛 Troubleshooting

### Port Already in Use

If port 5173 is busy, Vite will automatically use the next available port.

### Build Errors

Make sure all dependencies are installed:
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 👤 Author

**viol3**
- GitHub: [@viol3](https://github.com/viol3)

---

Made with ❤️ for game developers

To build your app for deployment you can run

```bash
pnpm build
```
