import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Radio,
  Tv,
  Smartphone,
  Laptop,
  Film,
  Sparkles,
  User,
  Heart,
  X,
} from 'lucide-react';
import { UserProfile, ActiveTab } from '../types';

interface NavbarProps {
  activeTab: ActiveTab;
  profile: UserProfile;
  searchQuery: string;
  onSelectTab: (tab: ActiveTab) => void;
  onSearchChange: (query: string) => void;
  onOpenSyncModal: () => void;
  onOpenProfileModal: () => void;
  onOpenStudio: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  profile,
  searchQuery,
  onSelectTab,
  onSearchChange,
  onOpenSyncModal,
  onOpenProfileModal,
  onOpenStudio,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getDeviceIcon = () => {
    switch (profile.deviceType) {
      case 'tv':
        return <Tv className="w-3.5 h-3.5 text-indigo-400" />;
      case 'mobile':
        return <Smartphone className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Laptop className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#141414]/95 backdrop-blur-md shadow-2xl py-3 border-b border-neutral-800/80'
          : 'bg-gradient-to-b from-black/90 via-black/40 to-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-12 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Navigation Links */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-1.5 cursor-pointer group select-none"
          >
            <div className="w-7 h-7 bg-red-600 rounded flex items-center justify-center font-black text-white text-base shadow-lg shadow-red-600/50 group-hover:scale-105 transition-transform">
              F
            </div>
            <span className="font-bebas text-2xl md:text-3xl tracking-wider text-red-600 text-glow-red font-black">
              FLIPFLIX
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => onSelectTab('home')}
              className={`transition-colors ${
                activeTab === 'home' ? 'text-white font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('shows')}
              className={`transition-colors ${
                activeTab === 'shows' ? 'text-white font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Curated Shows
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('trending')}
              className={`transition-colors ${
                activeTab === 'trending' ? 'text-white font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Trending & Reviews
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('watchlist')}
              className={`flex items-center gap-1.5 transition-colors ${
                activeTab === 'watchlist' ? 'text-white font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>My List</span>
              {profile.watchlist.length > 0 && (
                <span className="bg-red-600/80 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                  {profile.watchlist.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Right: Search, Create Studio Button, Device Sync & User Avatar */}
        <div className="flex items-center gap-3">
          {/* Search Box */}
          <div className="relative flex items-center">
            {isSearchOpen ? (
              <div className="flex items-center bg-black/80 border border-neutral-700 rounded-lg px-2.5 py-1 text-xs transition-all w-44 md:w-60 shadow-lg">
                <Search className="w-3.5 h-3.5 text-neutral-400 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Titles, creators, genres..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  autoFocus
                  className="bg-transparent text-white placeholder-neutral-500 focus:outline-none w-full text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchOpen(false);
                    onSearchChange('');
                  }}
                  className="text-neutral-400 hover:text-white ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-neutral-300 hover:text-white transition-colors"
                title="Search shows"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Create Show in Studio Button */}
          <button
            type="button"
            onClick={onOpenStudio}
            className="flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-extrabold text-xs transition-all shadow-lg shadow-red-600/30 hover:scale-105"
            title="Create and animate a new original show"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span className="hidden sm:inline">Create Show</span>
            <span className="sm:hidden">Animate</span>
          </button>

          {/* Cross-Device Sync Indicator Button */}
          <button
            type="button"
            onClick={onOpenSyncModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 text-xs text-neutral-300 hover:text-white transition-colors"
            title="Cross-Device Synchronization Manager"
          >
            {getDeviceIcon()}
            <span className="hidden md:inline font-mono text-[11px]">Sync</span>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          </button>

          {/* User Profile Avatar */}
          <button
            type="button"
            onClick={onOpenProfileModal}
            className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 flex items-center justify-center text-sm shadow transition-all hover:scale-105"
            title={`${profile.name} - Recommendation preferences`}
          >
            {profile.avatar || '🍿'}
          </button>
        </div>
      </div>
    </header>
  );
};
