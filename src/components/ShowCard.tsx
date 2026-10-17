import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Plus,
  Check,
  ThumbsUp,
  ChevronDown,
  Volume2,
} from 'lucide-react';
import { Show, UserProfile } from '../types';

interface ShowCardProps {
  show: Show;
  profile: UserProfile;
  onPlayShow: (show: Show, episodeId?: string) => void;
  onOpenDetails: (show: Show) => void;
  onToggleWatchlist: (showId: string) => void;
  onToggleLike: (showId: string) => void;
}

export const ShowCard: React.FC<ShowCardProps> = ({
  show,
  profile,
  onPlayShow,
  onOpenDetails,
  onToggleWatchlist,
  onToggleLike,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hoverFrameIndex, setHoverFrameIndex] = useState(0);
  const hoverTimerRef = useRef<number | null>(null);

  const isInWatchlist = profile.watchlist.includes(show.id);
  const isLiked = profile.likedShowIds.includes(show.id);
  const pilotEpisode = show.episodes[0];
  const frames = pilotEpisode?.frames || [];

  // Hover animated preview
  useEffect(() => {
    if (isHovered && frames.length > 1) {
      const interval = 1000 / Math.max(4, pilotEpisode.fps || 6);
      hoverTimerRef.current = window.setInterval(() => {
        setHoverFrameIndex((prev) => (prev + 1) % frames.length);
      }, interval);
    } else {
      if (hoverTimerRef.current) {
        clearInterval(hoverTimerRef.current);
        hoverTimerRef.current = null;
      }
      setHoverFrameIndex(0);
    }

    return () => {
      if (hoverTimerRef.current) {
        clearInterval(hoverTimerRef.current);
      }
    };
  }, [isHovered, frames.length, pilotEpisode]);

  const activeThumb =
    isHovered && frames[hoverFrameIndex]?.dataUrl
      ? frames[hoverFrameIndex].dataUrl
      : show.thumbnailUrl || frames[0]?.dataUrl;

  // Watch history progress if any
  const historyItem = profile.watchHistory[show.id];

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex-shrink-0 w-64 md:w-72 rounded-lg overflow-hidden bg-[#181822] border border-neutral-800/80 transition-all duration-300 hover:scale-105 hover:z-20 hover:shadow-2xl hover:border-neutral-600"
    >
      {/* Thumbnail / Animated Preview viewport */}
      <div
        onClick={() => onPlayShow(show)}
        className="relative aspect-video w-full bg-neutral-900 cursor-pointer overflow-hidden"
      >
        {activeThumb ? (
          <img
            src={activeThumb}
            alt={show.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-neutral-500">
            No Thumbnail
          </div>
        )}

        {/* Netflix 'Original' Tag */}
        <div className="absolute top-2 left-2 bg-red-600 px-1.5 py-0.5 rounded text-[10px] font-black tracking-wider text-white shadow">
          ORIGINAL
        </div>

        {/* Animated preview indicator */}
        {isHovered && frames.length > 1 && (
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded text-[9px] font-mono text-cyan-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>Frame {hoverFrameIndex + 1}/{frames.length}</span>
          </div>
        )}

        {/* Resume Progress Bar */}
        {historyItem && historyItem.progressPercent > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-neutral-700/80">
            <div
              className="h-full bg-red-600"
              style={{ width: `${historyItem.progressPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-3.5 flex flex-col gap-2">
        {/* Action Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Play Button */}
            <button
              type="button"
              onClick={() => onPlayShow(show)}
              className="w-8 h-8 rounded-full bg-white text-black hover:bg-neutral-200 flex items-center justify-center transition-colors shadow-md"
              title="Play Pilot"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </button>

            {/* Watchlist Toggle */}
            <button
              type="button"
              onClick={() => onToggleWatchlist(show.id)}
              className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                isInWatchlist
                  ? 'border-green-500 bg-green-500/20 text-green-400'
                  : 'border-neutral-600 text-neutral-300 hover:border-white hover:text-white'
              }`}
              title={isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
            >
              {isInWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>

            {/* Like Button */}
            <button
              type="button"
              onClick={() => onToggleLike(show.id)}
              className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                isLiked
                  ? 'border-red-500 bg-red-500/20 text-red-400'
                  : 'border-neutral-600 text-neutral-300 hover:border-white hover:text-white'
              }`}
              title={isLiked ? 'Liked' : 'Like'}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* More Info */}
          <button
            type="button"
            onClick={() => onOpenDetails(show)}
            className="w-8 h-8 rounded-full border border-neutral-600 text-neutral-300 hover:border-white hover:text-white flex items-center justify-center transition-colors"
            title="Episode Details & Reviews"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Title & Metadata */}
        <div>
          <h3
            onClick={() => onOpenDetails(show)}
            className="font-bold text-white text-sm truncate hover:text-red-400 cursor-pointer"
          >
            {show.title}
          </h3>

          <div className="flex items-center gap-2 mt-1 text-xs">
            <span className="text-green-400 font-bold font-mono">
              {show.matchScore || 95}% Match
            </span>
            <span className="border border-neutral-700 px-1 py-0.2 rounded text-[10px] text-neutral-400 font-mono">
              {show.maturityRating}
            </span>
            <span className="text-neutral-400 text-[11px]">
              {show.episodes.length} {show.episodes.length === 1 ? 'Episode' : 'Episodes'}
            </span>
          </div>
        </div>

        {/* Genre Tags */}
        <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-neutral-400">
          {show.genres.slice(0, 3).map((g, i) => (
            <React.Fragment key={g}>
              <span>{g}</span>
              {i < Math.min(show.genres.length - 1, 2) && (
                <span className="text-neutral-600">•</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
