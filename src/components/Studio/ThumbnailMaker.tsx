import React, { useRef, useState, useEffect } from 'react';
import { Sparkles, Image as ImageIcon, Paintbrush, Check } from 'lucide-react';
import { Frame } from '../../types';

interface ThumbnailMakerProps {
  frames: Frame[];
  currentThumbnailUrl: string;
  showTitle: string;
  onSelectThumbnail: (dataUrl: string) => void;
}

const POSTER_PRESETS = [
  { name: 'Neon Cyber', grad: ['#0f051d', '#3b0764', '#06b6d4'] },
  { name: 'Midnight Thriller', grad: ['#030712', '#1e1b4b', '#4338ca'] },
  { name: 'Sunset Anime', grad: ['#450a0a', '#991b1b', '#f97316'] },
  { name: 'Mystic Emerald', grad: ['#022c22', '#065f46', '#10b981'] },
  { name: 'Deep Space', grad: ['#050814', '#1e1b4b', '#7c3aed'] },
];

export const ThumbnailMaker: React.FC<ThumbnailMakerProps> = ({
  frames,
  currentThumbnailUrl,
  showTitle,
  onSelectThumbnail,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedFrameIndex, setSelectedFrameIndex] = useState<number>(0);
  const [overlayTitle, setOverlayTitle] = useState(true);
  const [activePreset, setActivePreset] = useState<number | null>(null);

  // Generate thumbnail composite whenever frame or preset changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = 640;
    const h = 360;

    // If preset background selected
    if (activePreset !== null) {
      const preset = POSTER_PRESETS[activePreset];
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, preset.grad[0]);
      grad.addColorStop(0.5, preset.grad[1]);
      grad.addColorStop(1, preset.grad[2]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    } else {
      ctx.fillStyle = '#0f0f13';
      ctx.fillRect(0, 0, w, h);
    }

    // Draw the selected frame on top
    const targetFrame = frames[selectedFrameIndex];
    if (targetFrame && targetFrame.dataUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, w, h);

        // Cinematic bottom vignette gradient
        const vignette = ctx.createLinearGradient(0, h * 0.4, 0, h);
        vignette.addColorStop(0, 'transparent');
        vignette.addColorStop(1, 'rgba(10, 10, 14, 0.95)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, w, h);

        // Optional title banner overlay
        if (overlayTitle && showTitle.trim()) {
          ctx.font = 'bold 32px "Bebas Neue", sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#000000';
          ctx.shadowBlur = 12;
          ctx.fillText(showTitle.toUpperCase(), 30, h - 35);

          // Netflix 'N' style accent tag
          ctx.fillStyle = '#e50914';
          ctx.fillRect(30, h - 75, 4, 28);
          ctx.font = 'bold 12px sans-serif';
          ctx.fillText('ORIGINAL PILOT', 42, h - 56);
          ctx.shadowBlur = 0;
        }

        const compositeUrl = canvas.toDataURL('image/png');
        onSelectThumbnail(compositeUrl);
      };
      img.src = targetFrame.dataUrl;
    } else {
      // Empty placeholder
      if (overlayTitle && showTitle.trim()) {
        ctx.font = 'bold 32px "Bebas Neue", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(showTitle.toUpperCase(), 30, h - 35);
      }
      const compositeUrl = canvas.toDataURL('image/png');
      onSelectThumbnail(compositeUrl);
    }
  }, [selectedFrameIndex, overlayTitle, activePreset, frames, showTitle, onSelectThumbnail]);

  return (
    <div className="bg-[#171720] p-4 rounded-xl border border-neutral-800 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-red-500" />
          <h3 className="font-bold text-white text-base">Show Thumbnail / Poster Studio</h3>
        </div>
        <span className="text-xs text-neutral-400">16:9 Netflix standard cover</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Thumbnail Live Canvas Preview */}
        <div className="flex flex-col gap-2">
          <div className="relative aspect-video rounded-lg overflow-hidden border border-neutral-700 shadow-xl bg-black flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={640}
              height={360}
              className="w-full h-full object-contain"
            />
            <div className="absolute top-2 left-2 bg-red-600 px-2 py-0.5 rounded text-[11px] font-black tracking-wider text-white shadow-md">
              FLIPFLIX ORIGINAL
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Hover preview match score: <strong className="text-green-400">98% Match</strong></span>
            <label className="flex items-center gap-2 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={overlayTitle}
                onChange={(e) => setOverlayTitle(e.target.checked)}
                className="accent-red-600 rounded"
              />
              <span>Overlay show typography</span>
            </label>
          </div>
        </div>

        {/* Right: Pick frame to use as thumbnail */}
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
              1. Pick keyframe to capture as cover:
            </label>
            <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
              {frames.map((frame, idx) => (
                <button
                  key={frame.id || idx}
                  type="button"
                  onClick={() => {
                    setSelectedFrameIndex(idx);
                    setActivePreset(null);
                  }}
                  className={`relative flex-shrink-0 w-20 h-12 rounded border transition-all overflow-hidden ${
                    selectedFrameIndex === idx && activePreset === null
                      ? 'border-red-500 ring-2 ring-red-500 scale-105'
                      : 'border-neutral-800 opacity-70 hover:opacity-100'
                  }`}
                >
                  {frame.dataUrl ? (
                    <img src={frame.dataUrl} alt={`Frame ${idx + 1}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-neutral-900 flex items-center justify-center text-[9px] text-neutral-500">
                      Empty
                    </div>
                  )}
                  <span className="absolute bottom-0.5 right-1 bg-black/80 text-[9px] font-mono px-1 rounded text-white">
                    #{idx + 1}
                  </span>
                  {selectedFrameIndex === idx && activePreset === null && (
                    <span className="absolute top-0.5 left-0.5 bg-red-600 rounded-full p-0.5">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
              2. Or apply cinematic aesthetic mood:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {POSTER_PRESETS.map((preset, idx) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => setActivePreset(idx)}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-xs text-left transition-all ${
                    activePreset === idx
                      ? 'border-red-500 bg-red-950/30 text-white font-bold'
                      : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-700'
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${preset.grad[1]}, ${preset.grad[2]})` }}
                  />
                  <span className="truncate">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
