import React from 'react';
import {
  Play,
  Square as StopIcon,
  Plus,
  Copy,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Volume2,
  Repeat,
} from 'lucide-react';
import { Frame, SoundEffectTrigger } from '../../types';

interface TimelineProps {
  frames: Frame[];
  currentFrameIndex: number;
  isPlaying: boolean;
  fps: number;
  isLooping: boolean;
  onionSkinEnabled: boolean;
  soundTriggers: SoundEffectTrigger[];
  onSelectFrame: (index: number) => void;
  onAddBlankFrame: () => void;
  onDuplicateFrame: () => void;
  onDeleteFrame: (index: number) => void;
  onMoveFrame: (fromIndex: number, toIndex: number) => void;
  onTogglePlay: () => void;
  onChangeFps: (fps: number) => void;
  onToggleLoop: () => void;
  onToggleOnionSkin: () => void;
  onAddSoundTrigger: (sound: 'swoosh' | 'laser' | 'explosion' | 'sparkle' | 'footstep' | 'chime' | 'hit' | 'glitch') => void;
  onRemoveSoundTrigger: (frameIndex: number) => void;
}

const FPS_OPTIONS = [4, 6, 8, 12, 16, 24];

export const Timeline: React.FC<TimelineProps> = ({
  frames,
  currentFrameIndex,
  isPlaying,
  fps,
  isLooping,
  onionSkinEnabled,
  soundTriggers,
  onSelectFrame,
  onAddBlankFrame,
  onDuplicateFrame,
  onDeleteFrame,
  onMoveFrame,
  onTogglePlay,
  onChangeFps,
  onToggleLoop,
  onToggleOnionSkin,
  onAddSoundTrigger,
  onRemoveSoundTrigger,
}) => {
  const currentSoundTrigger = soundTriggers.find(t => t.frameIndex === currentFrameIndex);
  const totalDuration = (frames.length / fps).toFixed(1);
  const currentTime = ((currentFrameIndex + 1) / fps).toFixed(1);

  return (
    <div className="flex flex-col gap-2.5 bg-[#171720] p-3 rounded-xl border border-neutral-800">
      {/* Top Playback Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Play / Pause & Loop */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onTogglePlay}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-lg ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
                : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
            }`}
          >
            {isPlaying ? (
              <>
                <StopIcon className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Play Animation</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onToggleLoop}
            className={`p-2 rounded-lg border transition-colors ${
              isLooping
                ? 'bg-neutral-800 border-red-500/50 text-red-400'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
            title={isLooping ? 'Loop: On' : 'Loop: Off'}
          >
            <Repeat className="w-4 h-4" />
          </button>

          {/* Onion Skin Toggle */}
          <button
            type="button"
            onClick={onToggleOnionSkin}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors ${
              onionSkinEnabled
                ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            {onionSkinEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Onion Skin</span>
          </button>
        </div>

        {/* FPS Control & Frame Counter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-800 text-xs">
            <span className="text-neutral-400">Speed:</span>
            <select
              value={fps}
              onChange={(e) => onChangeFps(Number(e.target.value))}
              className="bg-transparent text-white font-bold cursor-pointer focus:outline-none"
            >
              {FPS_OPTIONS.map((rate) => (
                <option key={rate} value={rate} className="bg-neutral-900 text-white">
                  {rate} FPS {rate === 12 ? '(Classic Anime)' : rate === 8 ? '(Retro)' : rate === 24 ? '(Cinema)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs font-mono text-neutral-400 bg-neutral-900/90 px-3 py-1.5 rounded-lg border border-neutral-800">
            Frame <span className="text-white font-bold">{currentFrameIndex + 1}</span> / {frames.length}
            <span className="text-neutral-500 mx-1.5">|</span>
            <span className="text-red-400 font-bold">{currentTime}s</span> / {totalDuration}s
          </div>
        </div>

        {/* Frame Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onAddBlankFrame}
            className="flex items-center gap-1 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium rounded-lg border border-neutral-700 transition-colors"
            title="Add New Blank Frame"
          >
            <Plus className="w-3.5 h-3.5 text-green-400" />
            <span>New Frame</span>
          </button>

          <button
            type="button"
            onClick={onDuplicateFrame}
            className="flex items-center gap-1 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium rounded-lg border border-neutral-700 transition-colors"
            title="Duplicate Current Frame (Clone drawing to next frame)"
          >
            <Copy className="w-3.5 h-3.5 text-cyan-400" />
            <span>Duplicate</span>
          </button>

          <button
            type="button"
            onClick={() => onMoveFrame(currentFrameIndex, currentFrameIndex - 1)}
            disabled={currentFrameIndex === 0}
            className="p-1.5 text-neutral-400 hover:text-white disabled:opacity-30 rounded-lg hover:bg-neutral-800"
            title="Move Frame Left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onMoveFrame(currentFrameIndex, currentFrameIndex + 1)}
            disabled={currentFrameIndex === frames.length - 1}
            className="p-1.5 text-neutral-400 hover:text-white disabled:opacity-30 rounded-lg hover:bg-neutral-800"
            title="Move Frame Right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onDeleteFrame(currentFrameIndex)}
            disabled={frames.length <= 1}
            className="p-1.5 text-red-400 hover:text-red-300 disabled:opacity-30 rounded-lg hover:bg-neutral-800"
            title="Delete Current Frame"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Frame Sound Effect Tagging Row */}
      <div className="flex items-center justify-between bg-neutral-900/60 px-3 py-1.5 rounded-lg border border-neutral-800/80 text-xs">
        <div className="flex items-center gap-2">
          <Volume2 className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-neutral-400">Sound FX on Frame {currentFrameIndex + 1}:</span>
          {currentSoundTrigger ? (
            <div className="flex items-center gap-1.5 bg-purple-900/50 border border-purple-500/40 text-purple-300 px-2 py-0.5 rounded font-mono text-[11px]">
              <span className="capitalize">{currentSoundTrigger.soundType}</span>
              <button
                type="button"
                onClick={() => onRemoveSoundTrigger(currentFrameIndex)}
                className="hover:text-red-400 ml-1"
                title="Remove Sound FX"
              >
                ×
              </button>
            </div>
          ) : (
            <span className="text-neutral-600 italic">None attached</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <span className="text-neutral-500 text-[11px]">Attach:</span>
          {(['swoosh', 'laser', 'explosion', 'sparkle', 'chime', 'hit', 'glitch'] as const).map(sound => (
            <button
              key={sound}
              type="button"
              onClick={() => onAddSoundTrigger(sound)}
              className="px-1.5 py-0.5 bg-neutral-800 hover:bg-purple-900 hover:text-purple-200 text-neutral-300 text-[10px] rounded transition-colors uppercase tracking-wider font-semibold"
            >
              {sound}
            </button>
          ))}
        </div>
      </div>

      {/* Frame Reel Scrollable Filmstrip */}
      <div className="flex items-center gap-2.5 overflow-x-auto py-2 px-1 no-scrollbar border-t border-neutral-800/80">
        {frames.map((frame, index) => {
          const isSelected = index === currentFrameIndex;
          const hasSfx = soundTriggers.some(t => t.frameIndex === index);

          return (
            <div
              key={frame.id || index}
              onClick={() => onSelectFrame(index)}
              className={`relative flex-shrink-0 w-24 h-16 rounded-lg cursor-pointer overflow-hidden transition-all group ${
                isSelected
                  ? 'ring-2 ring-red-600 scale-105 shadow-lg shadow-red-600/30'
                  : 'opacity-70 hover:opacity-100 border border-neutral-800 hover:border-neutral-700'
              }`}
            >
              {/* Checkerboard */}
              <div className="absolute inset-0 checkerboard-pattern opacity-30" />

              {/* Frame Drawing Image */}
              {frame.dataUrl ? (
                <img
                  src={frame.dataUrl}
                  alt={`Frame ${index + 1}`}
                  className="absolute inset-0 w-full h-full object-contain"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-neutral-600 text-[10px]">
                  Empty
                </div>
              )}

              {/* Frame Number badge */}
              <div className="absolute bottom-1 left-1 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-mono text-white">
                {index + 1}
              </div>

              {/* SFX badge */}
              {hasSfx && (
                <div className="absolute top-1 right-1 bg-purple-600/90 text-white rounded-full p-0.5" title="Has Sound FX">
                  <Volume2 className="w-2.5 h-2.5" />
                </div>
              )}

              {/* Red playhead highlight */}
              {isSelected && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-red-600" />
              )}
            </div>
          );
        })}

        {/* Quick Add Frame Button at End of Reel */}
        <button
          type="button"
          onClick={onAddBlankFrame}
          className="flex-shrink-0 w-16 h-16 rounded-lg border-2 border-dashed border-neutral-700 hover:border-red-500 hover:bg-red-500/10 flex flex-col items-center justify-center gap-1 text-neutral-400 hover:text-white transition-all"
        >
          <Plus className="w-5 h-5" />
          <span className="text-[10px]">Add</span>
        </button>
      </div>
    </div>
  );
};
