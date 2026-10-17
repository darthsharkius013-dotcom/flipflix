import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  X,
  ChevronLeft,
  ChevronRight,
  Repeat,
  FastForward,
  Film,
  Sparkles,
} from 'lucide-react';
import { Show, Episode } from '../types';
import { soundEngine } from '../utils/audio';

interface PlayerModalProps {
  show: Show;
  initialEpisodeId?: string;
  initialFrameIndex?: number;
  onClose: () => void;
  onUpdateWatchProgress: (showId: string, episodeId: string, frameIndex: number, totalFrames: number) => void;
  onSelectEpisode?: (episodeId: string) => void;
}

export const PlayerModal: React.FC<PlayerModalProps> = ({
  show,
  initialEpisodeId,
  initialFrameIndex = 0,
  onClose,
  onUpdateWatchProgress,
}) => {
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(() => {
    if (initialEpisodeId) {
      const idx = show.episodes.findIndex((e) => e.id === initialEpisodeId);
      return idx >= 0 ? idx : 0;
    }
    return 0;
  });

  const episode = show.episodes[currentEpisodeIndex] || show.episodes[0];
  const frames = episode?.frames || [];

  const [currentFrameIndex, setCurrentFrameIndex] = useState(
    Math.min(initialFrameIndex, Math.max(0, frames.length - 1))
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(soundEngine.getMuted());
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);

  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const controlsTimeoutRef = useRef<number | null>(null);
  const playTimerRef = useRef<number | null>(null);

  // Auto-hide controls when mouse is still
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 2800);
  };

  // Start sound track when episode opens or changes
  useEffect(() => {
    if (episode?.audioTrack) {
      soundEngine.startBgm(episode.audioTrack);
    }
    return () => {
      soundEngine.stopBgm();
    };
  }, [episode]);

  // Handle Playback Interval
  useEffect(() => {
    if (isPlaying && frames.length > 0) {
      const effectiveFps = Math.max(1, (episode.fps || 8) * playbackSpeed);
      const interval = 1000 / effectiveFps;

      playTimerRef.current = window.setInterval(() => {
        setCurrentFrameIndex((prev) => {
          const next = prev + 1;

          // Sound triggers
          const trigger = episode.soundTriggers?.find((t) => t.frameIndex === (next % frames.length));
          if (trigger) {
            soundEngine.playSoundEffect(trigger.soundType);
          }

          if (next >= frames.length) {
            // Update watch history as completed
            onUpdateWatchProgress(show.id, episode.id, frames.length - 1, frames.length);
            if (isLooping) {
              return 0;
            } else {
              setIsPlaying(false);
              return frames.length - 1;
            }
          }

          // Regularly record watch history frame
          if (next % 2 === 0 || next === frames.length - 1) {
            onUpdateWatchProgress(show.id, episode.id, next, frames.length);
          }
          return next;
        });
      }, interval);
    } else {
      if (playTimerRef.current) {
        clearInterval(playTimerRef.current);
        playTimerRef.current = null;
      }
    }

    return () => {
      if (playTimerRef.current) {
        clearInterval(playTimerRef.current);
      }
    };
  }, [isPlaying, episode, frames.length, playbackSpeed, isLooping, show.id, onUpdateWatchProgress]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.key === 'ArrowRight') {
        setCurrentFrameIndex((i) => Math.min(frames.length - 1, i + 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentFrameIndex((i) => Math.max(0, i - 1));
      } else if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'm' || e.key === 'M') {
        toggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [frames.length, onClose]);

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    soundEngine.setMuted(nextMute);
  };

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const frame = Number(e.target.value);
    setCurrentFrameIndex(frame);
    onUpdateWatchProgress(show.id, episode.id, frame, frames.length);
  };

  const currentFrame = frames[currentFrameIndex];
  const progressPercent = frames.length > 0 ? ((currentFrameIndex + 1) / frames.length) * 100 : 0;
  const currentTime = ((currentFrameIndex + 1) / (episode.fps || 8)).toFixed(1);
  const totalDuration = (frames.length / (episode.fps || 8)).toFixed(1);

  return (
    <div
      ref={playerContainerRef}
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center select-none overflow-hidden"
    >
      {/* Active Animation Canvas/Frame Image */}
      <div className="relative w-full h-full flex items-center justify-center bg-black">
        {currentFrame?.dataUrl ? (
          <img
            src={currentFrame.dataUrl}
            alt={`Frame ${currentFrameIndex + 1}`}
            className="max-w-full max-h-full object-contain pointer-events-none drop-shadow-2xl"
          />
        ) : (
          <div className="text-neutral-500 font-mono text-sm">No frame content available</div>
        )}
      </div>

      {/* Top Overlay Bar */}
      <div
        className={`absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/90 via-black/40 to-transparent flex items-center justify-between transition-opacity duration-300 z-10 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white rounded-full bg-black/40 backdrop-blur-md hover:bg-black/70 transition-colors"
            title="Exit Player (Esc)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-black text-white tracking-wide drop-shadow-md">
              {show.title}
            </h1>
            <p className="text-xs text-neutral-300 flex items-center gap-2 drop-shadow">
              <span className="text-red-400 font-bold">
                E{episode.episodeNumber}: {episode.title}
              </span>
              <span>•</span>
              <span className="font-mono">{episode.fps} FPS Hand-drawn</span>
            </p>
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="p-2 text-white/70 hover:text-white rounded-full bg-black/40 backdrop-blur-md hover:bg-black/70 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Center Big Play/Pause indicator on click */}
      <div
        onClick={() => setIsPlaying(!isPlaying)}
        className="absolute inset-0 cursor-pointer flex items-center justify-center"
      >
        {!isPlaying && showControls && (
          <div className="w-20 h-20 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-2xl backdrop-blur-sm transform transition-transform hover:scale-110">
            <Play className="w-10 h-10 fill-current ml-1" />
          </div>
        )}
      </div>

      {/* Bottom Controls Overlay */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex flex-col gap-3 transition-opacity duration-300 z-10 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Scrubber Timeline Bar */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-neutral-300 w-12 text-right">{currentTime}s</span>
          <div className="relative flex-1 flex items-center">
            <input
              type="range"
              min={0}
              max={Math.max(0, frames.length - 1)}
              value={currentFrameIndex}
              onChange={handleScrubberChange}
              className="w-full h-1.5 bg-neutral-700/80 rounded-lg appearance-none cursor-pointer accent-red-600 focus:outline-none"
            />
            {/* Red progress highlight */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-red-600 rounded-lg pointer-events-none"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-mono text-neutral-400 w-12">{totalDuration}s</span>
        </div>

        {/* Bottom Control Buttons */}
        <div className="flex items-center justify-between">
          {/* Left Buttons: Play, Stepper, Volume */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 text-white hover:text-red-500 transition-colors"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
            </button>

            {/* Frame Stepper Backward */}
            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setCurrentFrameIndex((i) => Math.max(0, i - 1));
              }}
              className="p-2 text-neutral-300 hover:text-white transition-colors"
              title="Previous Frame (Left Arrow)"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Frame Stepper Forward */}
            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setCurrentFrameIndex((i) => Math.min(frames.length - 1, i + 1));
              }}
              className="p-2 text-neutral-300 hover:text-white transition-colors"
              title="Next Frame (Right Arrow)"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Replay */}
            <button
              type="button"
              onClick={() => {
                setCurrentFrameIndex(0);
                setIsPlaying(true);
              }}
              className="p-2 text-neutral-300 hover:text-white transition-colors"
              title="Restart Episode"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            {/* Volume / Mute */}
            <button
              type="button"
              onClick={toggleMute}
              className="p-2 text-neutral-300 hover:text-white transition-colors"
              title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
            >
              {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
            </button>

            {/* Frame Counter Tag */}
            <div className="hidden sm:flex items-center bg-neutral-900/80 px-2.5 py-1 rounded text-xs font-mono text-neutral-400 border border-neutral-800">
              Frame <strong className="text-white ml-1">{currentFrameIndex + 1}</strong>
              <span className="mx-1">/</span>
              {frames.length}
            </div>
          </div>

          {/* Right Buttons: Loop, Speed, Fullscreen, Episode Drawer */}
          <div className="flex items-center gap-3">
            {/* Speed Multiplier */}
            <div className="flex items-center gap-1 bg-neutral-900/80 px-2 py-1 rounded border border-neutral-800 text-xs">
              <span className="text-neutral-400">Speed:</span>
              {[0.5, 1, 1.5, 2].map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                    playbackSpeed === spd ? 'bg-red-600 text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* Loop Toggle */}
            <button
              type="button"
              onClick={() => setIsLooping(!isLooping)}
              className={`p-2 rounded transition-colors ${
                isLooping ? 'text-red-500' : 'text-neutral-400 hover:text-white'
              }`}
              title={isLooping ? 'Looping: On' : 'Looping: Off'}
            >
              <Repeat className="w-5 h-5" />
            </button>

            {/* Fullscreen */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2 text-neutral-300 hover:text-white transition-colors"
              title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
