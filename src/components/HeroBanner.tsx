import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Info,
  Plus,
  Check,
  Volume2,
  VolumeX,
  Sparkles,
} from 'lucide-react';
import { Show, UserProfile } from '../types';
import { soundEngine } from '../utils/audio';

interface HeroBannerProps {
  show: Show;
  profile: UserProfile;
  onPlay: (show: Show) => void;
  onMoreInfo: (show: Show) => void;
  onToggleWatchlist: (showId: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  show,
  profile,
  onPlay,
  onMoreInfo,
  onToggleWatchlist,
}) => {
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const isInWatchlist = profile.watchlist.includes(show.id);

  const episode = show.episodes[0];
  const frames = episode?.frames || [];
  const animTimerRef = useRef<number | null>(null);

  // Play animation loop in hero backdrop
  useEffect(() => {
    if (frames.length > 1) {
      const interval = 1000 / Math.max(4, episode.fps || 8);
      animTimerRef.current = window.setInterval(() => {
        setCurrentFrameIndex((prev) => (prev + 1) % frames.length);
      }, interval);
    }
    return () => {
      if (animTimerRef.current) {
        clearInterval(animTimerRef.current);
      }
    };
  }, [frames.length, episode]);

  const toggleSound = () => {
    const nextMute = !isAudioMuted;
    setIsAudioMuted(nextMute);
    soundEngine.setMuted(nextMute);
    if (!nextMute && episode?.audioTrack) {
      soundEngine.startBgm(episode.audioTrack);
    } else {
      soundEngine.stopBgm();
    }
  };

  const activeFrame = frames[currentFrameIndex]?.dataUrl || show.thumbnailUrl;

  return (
    <div className="relative w-full h-[65vh] md:h-[75vh] min-h-[480px] max-h-[720px] overflow-hidden bg-black select-none">
      {/* Background Animated Frame Preview */}
      <div className="absolute inset-0">
        {activeFrame ? (
          <img
            src={activeFrame}
            alt={show.title}
            className="w-full h-full object-cover object-center transform scale-105 filter brightness-75 transition-all duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-neutral-950 via-neutral-900 to-black" />
        )}

        {/* Netflix Gradients (Top, Left, and Bottom fade to #141414) */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/70 to-transparent w-full md:w-3/4" />
      </div>

      {/* Hero Content Overlay */}
      <div className="relative z-10 h-full flex flex-col justify-end px-4 md:px-12 pb-14 max-w-2xl gap-3">
        {/* FlipFlix Series Badge */}
        <div className="flex items-center gap-2">
          <span className="bg-red-600 text-white text-[11px] font-black px-2 py-0.5 rounded tracking-widest shadow-md">
            FLIPFLIX
          </span>
          <span className="text-neutral-300 text-xs tracking-wider uppercase font-semibold">
            Series Premiere
          </span>
          <span className="text-green-400 font-bold font-mono text-xs">
            {show.matchScore || 98}% Match
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-xl font-bebas">
          {show.title}
        </h1>

        {/* Tagline */}
        <p className="text-sm md:text-base font-semibold text-red-400 drop-shadow">
          "{show.tagline}"
        </p>

        {/* Synopsis */}
        <p className="text-xs md:text-sm text-neutral-300 line-clamp-3 leading-relaxed drop-shadow max-w-xl">
          {show.synopsis}
        </p>

        {/* Genres & Rating */}
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <span className="border border-neutral-600 px-1.5 py-0.5 rounded text-[10px] text-neutral-300 font-mono">
            {show.maturityRating}
          </span>
          <span>•</span>
          <span className="font-mono">{episode.fps} FPS Hand-drawn Animation</span>
          <span>•</span>
          <span>{show.genres.join(' • ')}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => onPlay(show)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-white hover:bg-neutral-200 text-black font-extrabold text-sm transition-all shadow-xl hover:scale-105"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Play Pilot</span>
          </button>

          <button
            type="button"
            onClick={() => onMoreInfo(show)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-neutral-700/80 hover:bg-neutral-600 text-white font-bold text-sm backdrop-blur-md transition-all hover:scale-105"
          >
            <Info className="w-5 h-5" />
            <span>More Info</span>
          </button>

          <button
            type="button"
            onClick={() => onToggleWatchlist(show.id)}
            className={`p-2.5 rounded-lg border transition-all ${
              isInWatchlist
                ? 'bg-green-600/20 border-green-500 text-green-400'
                : 'bg-neutral-800/80 border-neutral-700 text-white hover:bg-neutral-700'
            }`}
            title={isInWatchlist ? 'Remove from My List' : 'Add to My List'}
          >
            {isInWatchlist ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Right Mute / Unmute Button & Rating Badge */}
      <div className="absolute right-4 md:right-12 bottom-14 z-20 flex items-center gap-3">
        <button
          type="button"
          onClick={toggleSound}
          className="p-2.5 rounded-full bg-black/60 border border-neutral-700 text-white hover:bg-black/90 transition-colors backdrop-blur-md"
          title={isAudioMuted ? 'Unmute preview' : 'Mute preview'}
        >
          {isAudioMuted ? <VolumeX className="w-4 h-4 text-neutral-400" /> : <Volume2 className="w-4 h-4 text-white" />}
        </button>

        <div className="bg-black/60 backdrop-blur-md border-l-4 border-red-600 pl-3 pr-4 py-1 text-xs text-neutral-300 font-mono">
          {show.maturityRating}
        </div>
      </div>
    </div>
  );
};
