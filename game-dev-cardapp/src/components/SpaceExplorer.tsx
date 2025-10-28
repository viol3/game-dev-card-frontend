import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, Users, Gamepad2, Star, Search, X, Grid3x3, List, Sparkles, ArrowUpDown, Maximize, Minimize } from 'lucide-react';
import { getAllProfiles } from '../services/profileService';
import type { User } from '../types';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

type ViewMode = 'galaxy' | 'grid' | 'list';
type SortBy = 'name' | 'level' | 'games';

interface Planet extends User {
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  animationDelay: number;
}

// Memoized planet color calculation
const getPlanetColor = (index: number): string => {
  const colors = [
    'from-purple-500 to-pink-500',
    'from-blue-500 to-cyan-500',
    'from-green-500 to-emerald-500',
    'from-orange-500 to-red-500',
    'from-yellow-500 to-orange-500',
    'from-pink-500 to-rose-500',
    'from-indigo-500 to-purple-500',
    'from-teal-500 to-green-500',
  ];
  return colors[index % colors.length];
};

const SpaceExplorer = () => {
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [hoveredPlanet, setHoveredPlanet] = useState<Planet | null>(null);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const galaxyViewRef = useRef<HTMLDivElement>(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // View and sort states
  const [viewMode, setViewMode] = useState<ViewMode>('galaxy');
  const [sortBy, setSortBy] = useState<SortBy>('level');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Galaxy pan/drag states
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  
  // Zoom state
  const [zoomLevel, setZoomLevel] = useState(1); // 1 = 100%, 0.5 = 50%, 2 = 200%

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Generate static stars once (memoized for performance)
  const backgroundElements = useMemo(() => {
    // Increase star count for 200% x 200% area (4x the viewport)
    const stars = Array.from({ length: 600 }, (_, i) => ({
      id: `star-${i}`,
      left: `${Math.random() * 200}%`, // Spread across full 200% width
      top: `${Math.random() * 200}%`, // Spread across full 200% height
      size: Math.random() * 2 + 1, // 1-3px
      duration: Math.random() * 3 + 2, // 2-5s
      delay: Math.random() * 5, // 0-5s
    }));

    return { stars };
  }, []); // Empty dependency - generate once

  // State for real user data
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load users from blockchain
  useEffect(() => {
    const loadProfiles = async () => {
      try {
        setIsLoadingUsers(true);
        setLoadError(null);
        const profiles = await getAllProfiles();
        setAllUsers(profiles);
      } catch (error) {
        console.error('Error loading profiles:', error);
        setLoadError('Failed to load developer profiles');
        setAllUsers([]);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    loadProfiles();
  }, []);

  // Extract all unique tags from all users (limited to top 15 most common)
/*   const allTags = useMemo(() => {
    const tagCount = new Map<string, number>();
    allUsers.forEach((user) => {
      user.games?.forEach((game) => {
        game.tags?.forEach((tag) => {
          tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
        });
      });
    });
    // Sort by frequency and take top 15
    return Array.from(tagCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([tag]) => tag);
  }, [allUsers]); */

  // Filter users based on search criteria
  const filteredUsers = useMemo(() => {
    return allUsers.filter((user: User) => {
      // Search by name or bio
      const matchesSearch =
        searchQuery === '' ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.bio.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter by level
      const matchesLevel =
        selectedLevel === 'all' ||
        (selectedLevel === '1-10' && user.level >= 1 && user.level <= 10) ||
        (selectedLevel === '11-20' && user.level >= 11 && user.level <= 20) ||
        (selectedLevel === '21-30' && user.level >= 21 && user.level <= 30) ||
        (selectedLevel === '31+' && user.level >= 31);

      // Filter by tags
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.some((tag) =>
          user.games?.some((game: any) => game.tags?.includes(tag))
        );

      return matchesSearch && matchesLevel && matchesTags;
    });
  }, [allUsers, searchQuery, selectedLevel, selectedTags]);

  const hasActiveFilters =
    searchQuery !== '' || selectedLevel !== 'all' || selectedTags.length > 0;

  // Sort filtered users
  const sortedUsers = useMemo(() => {
    const sorted = [...filteredUsers];
    
    sorted.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'level':
          comparison = a.level - b.level;
          break;
        case 'games':
          comparison = a.gameCount - b.gameCount;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
  }, [filteredUsers, sortBy, sortOrder]);

  useEffect(() => {
    // Generate planet positions from sorted users
    const generatedPlanets: Planet[] = [];
    
    // Helper function to check if two planets are too close
    const isPositionValid = (x: number, y: number, size: number, existingPlanets: Planet[]): boolean => {
      const minDistance = 12; // Reduced for better space utilization
      
      for (const planet of existingPlanets) {
        const dx = x - planet.x;
        const dy = y - planet.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Calculate required distance based on both planets' sizes
        const requiredDistance = minDistance + (size + planet.size) / 12;
        
        if (distance < requiredDistance) {
          return false;
        }
      }
      return true;
    };
    
    // Generate position for each user with improved distribution
    sortedUsers.forEach((user, index) => {
      // Calculate size based on level and game count (more balanced)
      const levelSize = Math.min(user.level * 0.8, 40);
      const gameSize = Math.min(user.gameCount * 2.5, 25);
      const calculatedSize = 35 + levelSize + gameSize; // Slightly smaller base size
      
      let x = 0, y = 0;
      let attempts = 0;
      const maxAttempts = 100; // Increased for better positioning
      
      // Use grid-based initial positioning for better distribution
      const gridSize = Math.ceil(Math.sqrt(sortedUsers.length));
      const gridX = (index % gridSize) * (180 / gridSize) + 10;
      const gridY = Math.floor(index / gridSize) * (180 / gridSize) + 10;
      
      // Try to find a valid position (start near grid position, then randomize)
      do {
        if (attempts < 10) {
          // First tries: near grid position with small randomization
          x = gridX + (Math.random() - 0.5) * 30;
          y = gridY + (Math.random() - 0.5) * 30;
        } else {
          // Later tries: fully random
          x = Math.random() * 180 + 10; // 10-190%
          y = Math.random() * 180 + 10; // 10-190%
        }
        attempts++;
      } while (attempts < maxAttempts && !isPositionValid(x, y, calculatedSize, generatedPlanets));
      
      // If we couldn't find a valid position after max attempts, use the last generated position
      generatedPlanets.push({
        ...user,
        x,
        y,
        size: calculatedSize,
        color: getPlanetColor(index),
        rotation: Math.random() * 360,
        animationDelay: Math.random() * 3,
      });
    });
    
    setPlanets(generatedPlanets);
  }, [sortedUsers]);

  // Double-click to zoom in/out handler
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isClickingPlanet = target.closest('.planet-element');
    
    if (!isClickingPlanet) {
      const container = galaxyViewRef.current;
      if (!container) return;
      
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      setZoomLevel((prevZoom) => {
        // Toggle between current zoom and 2x zoom
        const newZoom = prevZoom < 1.5 ? 2 : 1;
        const zoomFactor = newZoom / prevZoom;
        
        setPanOffset((prevOffset) => ({
          x: mouseX - (mouseX - prevOffset.x) * zoomFactor,
          y: mouseY - (mouseY - prevOffset.y) * zoomFactor,
        }));
        
        return newZoom;
      });
    }
  }, []);

  // Pan/Drag handlers for galaxy view - memoized for performance
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Don't pan if clicking on a planet
    const target = e.target as HTMLElement;
    const isClickingPlanet = target.closest('.planet-element');
    
    if (!isClickingPlanet) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      e.preventDefault();
    }
  }, [panOffset.x, panOffset.y]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      e.preventDefault();
    }
  }, [isPanning, panStart.x, panStart.y]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Zoom handler with throttling for better performance
  const zoomTimeoutRef = useRef<number | null>(null);
  const pendingZoomRef = useRef<{ mouseX: number; mouseY: number; delta: number } | null>(null);

  const applyZoom = useCallback(() => {
    if (!pendingZoomRef.current) return;
    
    const { mouseX, mouseY, delta } = pendingZoomRef.current;
    pendingZoomRef.current = null;
    
    setZoomLevel((prevZoom) => {
      const newZoom = Math.min(Math.max(prevZoom + delta, 0.5), 3);
      
      if (newZoom === prevZoom) return prevZoom;
      
      const zoomFactor = newZoom / prevZoom;
      
      setPanOffset((prevOffset) => ({
        x: mouseX - (mouseX - prevOffset.x) * zoomFactor,
        y: mouseY - (mouseY - prevOffset.y) * zoomFactor,
      }));
      
      return newZoom;
    });
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    
    const container = galaxyViewRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Smoother zoom speed
    const zoomSpeed = 0.0008;
    const delta = -e.deltaY * zoomSpeed;
    
    // Accumulate zoom changes
    if (pendingZoomRef.current) {
      pendingZoomRef.current.delta += delta;
    } else {
      pendingZoomRef.current = { mouseX, mouseY, delta };
    }
    
    // Clear existing timeout
    if (zoomTimeoutRef.current) {
      cancelAnimationFrame(zoomTimeoutRef.current);
    }
    
    // Apply zoom on next animation frame
    zoomTimeoutRef.current = requestAnimationFrame(applyZoom);
  }, [applyZoom]);

  // Fullscreen handlers - memoized
  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  }, []);

  // Listen for fullscreen changes (e.g., user pressing ESC)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Add wheel event listener with passive: false to allow preventDefault
  // Add wheel event listener with passive: false to allow preventDefault
  useEffect(() => {
    const galaxyView = galaxyViewRef.current;
    if (!galaxyView || viewMode !== 'galaxy' || isLoadingUsers || allUsers.length === 0) return;

    const wheelHandler = (e: WheelEvent) => {
      handleWheel(e);
    };

    galaxyView.addEventListener('wheel', wheelHandler, { passive: false });
    
    return () => {
      galaxyView.removeEventListener('wheel', wheelHandler);
      // Cleanup pending zoom on unmount
      if (zoomTimeoutRef.current) {
        cancelAnimationFrame(zoomTimeoutRef.current);
      }
    };
  }, [handleWheel, viewMode, isLoadingUsers, allUsers.length]);

  const handlePlanetClick = useCallback((username: string): void => {
    navigate(`/${username}`);
  }, [navigate]);

  /* const handleTagToggle = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []); */

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedLevel('all');
    setSelectedTags([]);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-slate-950 overflow-hidden">
      {/* Header Stats */}
      <div className="relative z-10 p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-cyan-500 to-pink-500 rounded-lg">
            <Rocket className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold pixel-text text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-pink-300">
              SPACE EXPLORER
            </h2>
            <p className="text-sm font-mono text-slate-400">Discover game developers across the galaxy</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex gap-6">
            <div className="text-center">
              <div className="flex items-center gap-2 text-cyan-400">
                <Users className="w-5 h-5" />
                <span className="text-2xl font-bold">{planets.length}</span>
              </div>
              <p className="text-xs font-mono text-slate-400">
                {filteredUsers.length === allUsers.length 
                  ? 'Developers' 
                  : `of ${allUsers.length}`}
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-2 text-yellow-400">
                <Gamepad2 className="w-5 h-5" />
                <span className="text-2xl font-bold">
                  {planets.reduce((sum, p) => sum + p.gameCount, 0)}
                </span>
              </div>
              <p className="text-xs font-mono text-slate-400">Games</p>
            </div>
          </div>
          
          {/* Fullscreen Toggle Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={toggleFullscreen}
            className="border-slate-700 hover:bg-slate-800 hover:border-cyan-500 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen (ESC)' : 'Enter Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize className="w-5 h-5 text-cyan-400" />
            ) : (
              <Maximize className="w-5 h-5 text-cyan-400" />
            )}
          </Button>
        </div>
      </div>

      {/* Main Layout - Sidebar + Content */}
      <div className={`relative z-10 flex ${isFullscreen ? 'h-[calc(100vh-80px)]' : 'h-[calc(100vh-120px)]'}`}>
        {/* Left Sidebar - Filters & Controls */}
        <div className="w-80 flex-shrink-0 bg-slate-800/30 backdrop-blur-sm border-r border-slate-700/50 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 h-full">
            <div className="p-4 pb-6 space-y-4">
              {/* View Mode Buttons */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-white uppercase">View Mode</label>
                <div className="flex flex-col gap-2">
                  <Button
                    variant={viewMode === 'galaxy' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('galaxy')}
                    className={`justify-start ${viewMode === 'galaxy' ? 'bg-cyan-500 hover:bg-cyan-600 text-white' : 'border-slate-600 text-white hover:text-white'}`}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Galaxy View
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={`justify-start ${viewMode === 'grid' ? 'bg-cyan-500 hover:bg-cyan-600 text-white' : 'border-slate-600 text-white hover:text-white'}`}
                  >
                    <Grid3x3 className="w-4 h-4 mr-2" />
                    Grid View
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={`justify-start ${viewMode === 'list' ? 'bg-cyan-500 hover:bg-cyan-600 text-white' : 'border-slate-600 text-white hover:text-white'}`}
                  >
                    <List className="w-4 h-4 mr-2" />
                    List View
                  </Button>
                </div>
              </div>

              {/* Sort Dropdown */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-white uppercase flex items-center gap-2">
                  <ArrowUpDown className="w-3 h-3" />
                  Sort By
                </label>
                {/* @ts-ignore - Select component type issue */}
                <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                  const [newSortBy, newSortOrder] = value.split('-') as [SortBy, 'asc' | 'desc'];
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder);
                }}>
                  {/* @ts-ignore */}
                  <SelectTrigger className="w-full bg-slate-900/50 border-slate-700 text-white">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  {/* @ts-ignore */}
                  <SelectContent>
                    {/* @ts-ignore */}
                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    {/* @ts-ignore */}
                    <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                    {/* @ts-ignore */}
                    <SelectItem value="level-desc">Level (High-Low)</SelectItem>
                    {/* @ts-ignore */}
                    <SelectItem value="level-asc">Level (Low-High)</SelectItem>
                    {/* @ts-ignore */}
                    <SelectItem value="games-desc">Games (Most-Least)</SelectItem>
                    {/* @ts-ignore */}
                    <SelectItem value="games-asc">Games (Least-Most)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t border-slate-700/50 pt-4"></div>

              {/* Search Bar */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-white uppercase">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Name or bio..."
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-slate-900/50 border-slate-700 focus:border-cyan-500 text-white"
                  />
                </div>
              </div>

              {/* Level Filter */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-white uppercase">Level Range</label>
                {/* @ts-ignore - Select component type issue */}
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  {/* @ts-ignore */}
                  <SelectTrigger className="w-full bg-slate-900/50 border-slate-700 text-white">
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  {/* @ts-ignore */}
                  <SelectContent>
                    {/* @ts-ignore */}
                    <SelectItem value="all">All Levels</SelectItem>
                    {/* @ts-ignore */}
                    <SelectItem value="1-10">Level 1-10</SelectItem>
                    {/* @ts-ignore */}
                    <SelectItem value="11-20">Level 11-20</SelectItem>
                    {/* @ts-ignore */}
                    <SelectItem value="21-30">Level 21-30</SelectItem>
                    {/* @ts-ignore */}
                    <SelectItem value="31+">Level 31+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tags Filter
              <div className="space-y-2">
                <label className="text-xs font-mono text-white uppercase">Skills & Tags</label>
                <ScrollArea className="w-full whitespace-nowrap rounded-md">
                  <div className="flex flex-wrap gap-2 pb-2">
                    {allTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                        className={`cursor-pointer transition-all shrink-0 ${
                          selectedTags.includes(tag)
                            ? 'bg-cyan-500 hover:bg-cyan-600 text-white border-cyan-500'
                            : 'border-slate-600 text-white hover:border-cyan-500 hover:text-cyan-400'
                        }`}
                        onClick={() => handleTagToggle(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </ScrollArea>
              </div> */}

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="w-full border-slate-700 hover:bg-slate-700 text-white"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear All Filters
                </Button>
              )}

              {/* Results Info */}
              {hasActiveFilters && (
                <div className="pt-3 border-t border-slate-700/50">
                  <p className="text-xs font-mono text-white">
                    Showing <span className="text-cyan-400 font-bold">{filteredUsers.length}</span> of{' '}
                    <span className="text-white font-bold">{allUsers.length}</span> developers
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 overflow-hidden">
          {/* Loading State */}
          {isLoadingUsers && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <div className="relative w-20 h-20 mx-auto">
                  <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-slate-400 font-mono">Loading developer profiles...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {!isLoadingUsers && loadError && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4 max-w-md px-4">
                <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-full flex items-center justify-center">
                  <X className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-white">Failed to Load Profiles</h3>
                <p className="text-slate-400">{loadError}</p>
                <Button 
                  onClick={() => window.location.reload()} 
                  className="bg-cyan-500 hover:bg-cyan-600 text-white"
                >
                  Retry
                </Button>
              </div>
            </div>
          )}

          {/* Empty State - No Profiles Found */}
          {!isLoadingUsers && !loadError && allUsers.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4 max-w-md px-4">
                <div className="w-20 h-20 mx-auto bg-slate-700/30 rounded-full flex items-center justify-center">
                  <Users className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-white">No Developers Yet</h3>
                <p className="text-slate-400">
                  Be the first game developer to create a profile on the blockchain!
                </p>
                <Button 
                  onClick={() => navigate('/create-profile')} 
                  className="bg-cyan-500 hover:bg-cyan-600 text-white"
                >
                  Create Your Profile
                </Button>
              </div>
            </div>
          )}

          {/* Content Area - View Mode Dependent */}
          {!isLoadingUsers && !loadError && allUsers.length > 0 && viewMode === 'galaxy' && (
            /* Galaxy View - Space with planets - Drag to Pan & Zoom */
            <div 
          ref={galaxyViewRef}
          className={`relative ${isFullscreen ? 'h-[calc(100vh-80px)]' : 'h-[calc(100vh-120px)]'} overflow-hidden select-none ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onDoubleClick={handleDoubleClick}
        >
          <div 
            className="galaxy-space relative w-[200%] h-[200%] select-none"
            style={{
              transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
              transition: isPanning ? 'none' : 'transform 0.05s ease-out',
              transformOrigin: '0 0',
              willChange: 'transform',
            }}
          >
        {/* Background Stars - Static, animated with CSS */}
        <div className="absolute inset-0 pointer-events-none">
          {backgroundElements.stars.map((star) => (
            <div
              key={star.id}
              className="star"
              style={{
                left: star.left,
                top: star.top,
                width: `${star.size}px`,
                height: `${star.size}px`,
                '--duration': `${star.duration}s`,
                '--delay': `${star.delay}s`,
              } as React.CSSProperties}
            />
          ))}
        </div>

        {/* Planets */}
        {planets.map((planet) => (
          <div
            key={planet.id}
            className="planet-element absolute cursor-pointer group"
            style={{
              left: `${planet.x}%`,
              top: `${planet.y}%`,
              transform: 'translate(-50%, -50%)',
              animationName: 'float',
              animationDuration: `${3 + Math.random() * 2}s`,
              animationTimingFunction: 'ease-in-out',
              animationIterationCount: 'infinite',
              animationDelay: `${planet.animationDelay}s`,
            }}
            onClick={() => handlePlanetClick(planet.username)}
            onMouseEnter={() => setHoveredPlanet(planet)}
            onMouseLeave={() => setHoveredPlanet(null)}
          >
            {/* Planet glow effect */}
            <div
              className={`absolute inset-0 bg-gradient-to-r ${planet.color} rounded-full blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-300`}
              style={{
                width: planet.size * 1.5,
                height: planet.size * 1.5,
                transform: 'translate(-16.66%, -16.66%)',
              }}
            />

            {/* Planet body */}
            <div
              className={`relative bg-gradient-to-br ${planet.color} rounded-full border-4 border-white/20 shadow-2xl group-hover:scale-110 transition-transform duration-300`}
              style={{
                width: planet.size,
                height: planet.size,
              }}
            >
              {/* Planet texture */}
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 50%)`,
                  }}
                />
                {/* Craters */}
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute bg-black/20 rounded-full"
                    style={{
                      width: `${15 + Math.random() * 15}%`,
                      height: `${15 + Math.random() * 15}%`,
                      top: `${Math.random() * 70}%`,
                      left: `${Math.random() * 70}%`,
                    }}
                  />
                ))}
              </div>

              {/* Game count badge */}
              <div className="absolute -top-2 -right-2 bg-yellow-500 border-2 border-yellow-300 rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                <span className="text-xs font-bold text-slate-900">{planet.gameCount}</span>
              </div>
            </div>

            {/* Planet name label */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
              <div className="bg-slate-800/90 border-2 border-cyan-500 px-3 py-1 rounded backdrop-blur-sm">
                <p className="text-xs font-bold font-mono text-cyan-300 truncate max-w-[120px]">
                  {planet.name}
                </p>
              </div>
            </div>

            {/* Orbit ring on hover */}
            {hoveredPlanet?.id === planet.id && (
              <div
                className="absolute border-2 border-cyan-400/50 rounded-full animate-spin"
                style={{
                  width: planet.size * 1.8,
                  height: planet.size * 1.8,
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  animationDuration: '10s',
                }}
              >
                <div className="absolute top-0 left-1/2 w-2 h-2 bg-cyan-400 rounded-full -translate-x-1/2 -translate-y-1/2" />
              </div>
            )}
          </div>
        ))}
          </div>
        
        {/* Hover info panel - Fixed position, not affected by pan */}
        {hoveredPlanet && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
            <div className="bg-slate-800/95 border-4 border-cyan-500 pixel-border p-4 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-200">
              <div className="flex items-center gap-4">
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${hoveredPlanet.color} rounded-full border-2 border-white/30`}
                />
                <div>
                  <h3 className="text-xl font-bold pixel-text text-cyan-300">{hoveredPlanet.name}</h3>
                  <p className="text-sm font-mono text-slate-300 mt-1">{hoveredPlanet.bio}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Gamepad2 className="w-4 h-4" />
                      <span className="text-sm font-mono font-bold">{hoveredPlanet.gameCount} Games</span>
                    </div>
                    <div className="flex items-center gap-1 text-green-400">
                      <Star className="w-4 h-4" />
                      <span className="text-sm font-mono font-bold">Lvl {hoveredPlanet.level}</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs font-mono text-cyan-400 mt-3 text-center">
                Click planet to explore portfolio →
              </p>
            </div>
          </div>
        )}
        
        {/* Zoom level indicator and controls - Fixed position, top right */}
        <div className="absolute top-6 right-6 z-50">
          <div className="bg-slate-800/95 border-2 border-cyan-500/50 rounded-lg px-4 py-3 backdrop-blur-sm space-y-2">
            <p className="text-xs font-mono text-white text-center">
              Zoom: <span className="text-cyan-400 font-bold">{Math.round(zoomLevel * 100)}%</span>
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0 border-cyan-500/50 hover:bg-cyan-500/20 hover:border-cyan-500 text-cyan-400"
                onClick={() => {
                  setZoomLevel((prev) => Math.max(prev - 0.2, 0.5));
                }}
                disabled={zoomLevel <= 0.5}
              >
                −
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-2 text-xs border-cyan-500/50 hover:bg-cyan-500/20 hover:border-cyan-500 text-cyan-400"
                onClick={() => {
                  setZoomLevel(1);
                  setPanOffset({ x: 0, y: 0 });
                }}
              >
                Reset
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0 border-cyan-500/50 hover:bg-cyan-500/20 hover:border-cyan-500 text-cyan-400"
                onClick={() => {
                  setZoomLevel((prev) => Math.min(prev + 0.2, 3));
                }}
                disabled={zoomLevel >= 3}
              >
                +
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation hint - Fixed position, bottom right */}
        {!hoveredPlanet && (
          <div className="absolute bottom-6 right-6 z-50 pointer-events-none">
            <div className="bg-slate-800/95 border-2 border-cyan-500/50 rounded-lg px-4 py-2 backdrop-blur-sm">
              <p className="text-xs font-mono text-slate-300">
                🖱️ Drag to pan • 🔍 Scroll to zoom • 👆 Double-click to zoom • 🌍 Click planet to visit
              </p>
            </div>
          </div>
        )}
          </div>
          )}

          {/* Grid View */}
          {!isLoadingUsers && !loadError && allUsers.length > 0 && viewMode === 'grid' && (
            <ScrollArea className="h-full">
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {sortedUsers.map((user) => (
              /* @ts-ignore - Card component type issue */
              <Card
                key={user.id}
                className="bg-slate-800/50 border-slate-700 hover:border-cyan-500 transition-all cursor-pointer group"
                onClick={() => navigate(`/${user.username}`)}
              >
                {/* @ts-ignore */}
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 bg-gradient-to-br ${getPlanetColor(sortedUsers.indexOf(user))} rounded-full border-2 border-white/30 group-hover:scale-110 transition-transform`} />
                    <div className="flex-1">
                      {/* @ts-ignore */}
                      <CardTitle className="text-lg text-cyan-300 pixel-text">{user.name}</CardTitle>
                      {/* @ts-ignore */}
                      <CardDescription className="text-xs font-mono text-slate-400">@{user.username}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                {/* @ts-ignore */}
                <CardContent>
                  <p className="text-sm text-slate-300 mb-3 line-clamp-2">{user.bio}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Gamepad2 className="w-4 h-4" />
                      <span className="text-sm font-mono font-bold">{user.gameCount}</span>
                    </div>
                    <div className="flex items-center gap-1 text-green-400">
                      <Star className="w-4 h-4" />
                      <span className="text-sm font-mono font-bold">Lvl {user.level}</span>
                    </div>
                  </div>
                  {user.games && user.games.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {user.games[0].tags?.slice(0, 3).map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs border-slate-600 text-slate-400">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              ))}
            </div>
              </div>
            </ScrollArea>
          )}

          {/* List View */}
          {!isLoadingUsers && !loadError && allUsers.length > 0 && viewMode === 'list' && (
            <ScrollArea className="h-full">
              <div className="p-6">
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50 border-b border-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-mono text-slate-400 uppercase">Developer</th>
                    <th className="px-4 py-3 text-left text-xs font-mono text-slate-400 uppercase">Bio</th>
                    <th className="px-4 py-3 text-center text-xs font-mono text-slate-400 uppercase">Level</th>
                    <th className="px-4 py-3 text-center text-xs font-mono text-slate-400 uppercase">Games</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {sortedUsers.map((user, index) => (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-700/30 cursor-pointer transition-colors"
                      onClick={() => navigate(`/${user.username}`)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 bg-gradient-to-br ${getPlanetColor(index)} rounded-full border-2 border-white/30`} />
                          <div>
                            <p className="font-bold text-cyan-300 pixel-text">{user.name}</p>
                            <p className="text-xs font-mono text-slate-400">@{user.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-slate-300 line-clamp-1">{user.bio}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant="outline" className="border-green-500/50 text-green-400">
                          Lvl {user.level}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-yellow-400">
                          <Gamepad2 className="w-4 h-4" />
                          <span className="font-mono font-bold">{user.gameCount}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {user.games && user.games.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {user.games[0].tags?.slice(0, 3).map((tag: string) => (
                              <Badge key={tag} variant="outline" className="text-xs border-slate-600 text-slate-400">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpaceExplorer;
