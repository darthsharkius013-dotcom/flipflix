import React, { useState } from 'react';
import {
  User,
  Sparkles,
  Check,
  X,
  Heart,
  Clock,
  Film,
  Compass,
} from 'lucide-react';
import { UserProfile, Genre, Show } from '../types';

interface UserProfileModalProps {
  profile: UserProfile;
  shows: Show[];
  onClose: () => void;
  onSaveProfile: (updated: UserProfile) => void;
}

const AVATAR_CHOICES = ['🍿', '🥷', '🐱', '🤖', '🧙', '👾', '👽', '⚡', '🌸', '🏮'];

const ALL_GENRES: Genre[] = [
  'Action',
  'Anime',
  'Sci-Fi',
  'Cyberpunk',
  'Comedy',
  'Fantasy',
  'Mystery',
  'Horror',
  'Slice of Life',
  'Adventure',
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  profile,
  shows,
  onClose,
  onSaveProfile,
}) => {
  const [name, setName] = useState(profile.name);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [preferredGenres, setPreferredGenres] = useState<Genre[]>(profile.preferredGenres);

  const toggleGenre = (genre: Genre) => {
    if (preferredGenres.includes(genre)) {
      if (preferredGenres.length > 1) {
        setPreferredGenres(preferredGenres.filter((g) => g !== genre));
      }
    } else {
      setPreferredGenres([...preferredGenres, genre]);
    }
  };

  const handleSave = () => {
    onSaveProfile({
      ...profile,
      name: name.trim() || 'FlipFlix Fan',
      avatar,
      preferredGenres,
    });
    onClose();
  };

  // Stats calculation
  const totalWatched = Object.keys(profile.watchHistory).length;
  const inWatchlistCount = profile.watchlist.length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="relative w-full max-w-lg bg-[#181822] rounded-2xl border border-neutral-700/80 shadow-2xl p-6 text-white flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <User className="w-5 h-5 text-red-500" />
            <h2 className="text-base font-black text-white tracking-wide">
              Edit Profile & Recommendation Preferences
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Avatar Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-neutral-300">Choose Profile Icon:</label>
          <div className="flex flex-wrap gap-2.5">
            {AVATAR_CHOICES.map((av) => (
              <button
                key={av}
                type="button"
                onClick={() => setAvatar(av)}
                className={`w-11 h-11 rounded-xl text-xl flex items-center justify-center transition-all ${
                  avatar === av
                    ? 'bg-red-600 scale-110 shadow-lg shadow-red-600/40 ring-2 ring-white'
                    : 'bg-neutral-800/80 hover:bg-neutral-700 hover:scale-105'
                }`}
              >
                {av}
              </button>
            ))}
          </div>
        </div>

        {/* Profile Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-neutral-300">Your Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-neutral-900 border border-neutral-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-500"
          />
        </div>

        {/* Genre Preferences */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Favorite Genres (Powers Netflix Algorithm):</span>
            </label>
            <span className="text-[11px] text-cyan-400 font-mono">
              {preferredGenres.length} selected
            </span>
          </div>
          <p className="text-[11px] text-neutral-400">
            Shows matching these genres receive higher match percentage and priority placement in "Curated Just For You".
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {ALL_GENRES.map((g) => {
              const selected = preferredGenres.includes(g);
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggleGenre(g)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all border ${
                    selected
                      ? 'bg-red-600/90 border-red-500 text-white shadow-md shadow-red-600/30'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                  }`}
                >
                  {selected && <Check className="w-3 h-3 inline mr-1" />}
                  {g}
                </button>
              );
            })}
          </div>
        </div>

        {/* Viewing Stats Bar */}
        <div className="grid grid-cols-2 gap-3 bg-neutral-900/60 p-3 rounded-xl border border-neutral-800 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Watched: <strong className="text-white">{totalWatched} Shows</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500" />
            <span>Watchlist: <strong className="text-white">{inWatchlistCount} Shows</strong></span>
          </div>
        </div>

        {/* Save & Cancel */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs text-neutral-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-colors shadow-md shadow-red-600/30 cursor-pointer"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
