import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Pen,
  Eraser,
  PaintBucket,
  Minus,
  Square,
  Circle as CircleIcon,
  RotateCcw,
  RotateCw,
  Eye,
  Trash2,
  Highlighter,
} from 'lucide-react';
import { floodFill } from '../../utils/floodFill';

export type ToolType = 'pen' | 'marker' | 'eraser' | 'bucket' | 'line' | 'rect' | 'circle';

interface CanvasEditorProps {
  currentFrameDataUrl: string;
  previousFrameDataUrl?: string;
  nextFrameDataUrl?: string;
  onionSkinEnabled: boolean;
  onionSkinOpacity: number;
  onSaveFrame: (dataUrl: string) => void;
  width?: number;
  height?: number;
}

const PALETTE = [
  '#000000', '#ffffff', '#e50914', '#00ffff', '#ff007f',
  '#ffe600', '#00ff66', '#3b82f6', '#8b5cf6', '#ec4899',
  '#f97316', '#10b981', '#64748b', '#78350f', '#fef08a'
];

export const CanvasEditor: React.FC<CanvasEditorProps> = ({
  currentFrameDataUrl,
  previousFrameDataUrl,
  nextFrameDataUrl,
  onionSkinEnabled,
  onionSkinOpacity,
  onSaveFrame,
  width = 640,
  height = 360,
}) => {
  const mainCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeTool, setActiveTool] = useState<ToolType>('pen');
  const [color, setColor] = useState<string>('#ffffff');
  const [lineWidth, setLineWidth] = useState<number>(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);

  // Undo/Redo stack for current frame
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Initialize or load current frame into main canvas
  useEffect(() => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (currentFrameDataUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        // Reset undo history when switching frames
        setHistory([currentFrameDataUrl]);
        setHistoryIndex(0);
      };
      img.src = currentFrameDataUrl;
    } else {
      ctx.clearRect(0, 0, width, height);
      const blankUrl = canvas.toDataURL('image/png');
      setHistory([blankUrl]);
      setHistoryIndex(0);
    }
  }, [currentFrameDataUrl, width, height]);

  const pushToHistory = useCallback(() => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(dataUrl);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    onSaveFrame(dataUrl);
  }, [history, historyIndex, onSaveFrame]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      setHistoryIndex(newIdx);
      const targetUrl = history[newIdx];
      const canvas = mainCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        onSaveFrame(targetUrl);
      };
      img.src = targetUrl;
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1;
      setHistoryIndex(newIdx);
      const targetUrl = history[newIdx];
      const canvas = mainCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        onSaveFrame(targetUrl);
      };
      img.src = targetUrl;
    }
  };

  const clearCanvas = () => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    pushToHistory();
  };

  // Coordinates helper mapping mouse/touch event to canvas scale
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const coords = getCanvasCoords(e);
    setIsDrawing(true);
    setStartPos(coords);

    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (activeTool === 'bucket') {
      floodFill(ctx, coords.x, coords.y, color);
      pushToHistory();
      setIsDrawing(false);
      return;
    }

    if (activeTool === 'pen' || activeTool === 'marker' || activeTool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = lineWidth;
      if (activeTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
      } else if (activeTool === 'marker') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = color + '80'; // semi-transparent
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = color;
      }
    }
  };

  const drawMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const coords = getCanvasCoords(e);
    const canvas = mainCanvasRef.current;
    const previewCanvas = previewCanvasRef.current;
    if (!canvas || !previewCanvas) return;
    const ctx = canvas.getContext('2d');
    const prevCtx = previewCanvas.getContext('2d');
    if (!ctx || !prevCtx) return;

    if (activeTool === 'pen' || activeTool === 'marker' || activeTool === 'eraser') {
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    } else if (['line', 'rect', 'circle'].includes(activeTool) && startPos) {
      // Draw live shape guide on the preview canvas
      prevCtx.clearRect(0, 0, width, height);
      prevCtx.strokeStyle = color;
      prevCtx.lineWidth = lineWidth;
      prevCtx.lineCap = 'round';
      prevCtx.lineJoin = 'round';

      if (activeTool === 'line') {
        prevCtx.beginPath();
        prevCtx.moveTo(startPos.x, startPos.y);
        prevCtx.lineTo(coords.x, coords.y);
        prevCtx.stroke();
      } else if (activeTool === 'rect') {
        const x = Math.min(startPos.x, coords.x);
        const y = Math.min(startPos.y, coords.y);
        const w = Math.abs(coords.x - startPos.x);
        const h = Math.abs(coords.y - startPos.y);
        prevCtx.strokeRect(x, y, w, h);
      } else if (activeTool === 'circle') {
        const radius = Math.hypot(coords.x - startPos.x, coords.y - startPos.y);
        prevCtx.beginPath();
        prevCtx.arc(startPos.x, startPos.y, radius, 0, Math.PI * 2);
        prevCtx.stroke();
      }
    }
  };

  const endDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const canvas = mainCanvasRef.current;
    const previewCanvas = previewCanvasRef.current;
    if (!canvas || !previewCanvas) return;
    const ctx = canvas.getContext('2d');
    const prevCtx = previewCanvas.getContext('2d');
    if (!ctx || !prevCtx) return;

    if (['line', 'rect', 'circle'].includes(activeTool) && startPos) {
      const coords = getCanvasCoords(e);
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalCompositeOperation = 'source-over';

      if (activeTool === 'line') {
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
      } else if (activeTool === 'rect') {
        const x = Math.min(startPos.x, coords.x);
        const y = Math.min(startPos.y, coords.y);
        const w = Math.abs(coords.x - startPos.x);
        const h = Math.abs(coords.y - startPos.y);
        ctx.strokeRect(x, y, w, h);
      } else if (activeTool === 'circle') {
        const radius = Math.hypot(coords.x - startPos.x, coords.y - startPos.y);
        ctx.beginPath();
        ctx.arc(startPos.x, startPos.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
      prevCtx.clearRect(0, 0, width, height);
    }

    ctx.closePath();
    ctx.globalCompositeOperation = 'source-over';
    pushToHistory();
    setStartPos(null);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Tool Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#1a1a24] p-2.5 rounded-xl border border-neutral-800">
        {/* Drawing Tools */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTool('pen')}
            className={`p-2 rounded-lg transition-colors ${
              activeTool === 'pen' ? 'bg-red-600 text-white' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
            title="Pen / Brush"
          >
            <Pen className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setActiveTool('marker')}
            className={`p-2 rounded-lg transition-colors ${
              activeTool === 'marker' ? 'bg-red-600 text-white' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
            title="Marker (Semi-transparent glaze)"
          >
            <Highlighter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setActiveTool('eraser')}
            className={`p-2 rounded-lg transition-colors ${
              activeTool === 'eraser' ? 'bg-red-600 text-white' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
            title="Eraser"
          >
            <Eraser className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setActiveTool('bucket')}
            className={`p-2 rounded-lg transition-colors ${
              activeTool === 'bucket' ? 'bg-red-600 text-white' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
            title="Paint Bucket (Flood Fill)"
          >
            <PaintBucket className="w-4 h-4" />
          </button>
          <div className="h-6 w-px bg-neutral-700 mx-1" />
          <button
            type="button"
            onClick={() => setActiveTool('line')}
            className={`p-2 rounded-lg transition-colors ${
              activeTool === 'line' ? 'bg-red-600 text-white' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
            title="Straight Line"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setActiveTool('rect')}
            className={`p-2 rounded-lg transition-colors ${
              activeTool === 'rect' ? 'bg-red-600 text-white' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
            title="Rectangle"
          >
            <Square className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setActiveTool('circle')}
            className={`p-2 rounded-lg transition-colors ${
              activeTool === 'circle' ? 'bg-red-600 text-white' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
            title="Circle"
          >
            <CircleIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Brush Size Slider */}
        <div className="flex items-center gap-2 bg-neutral-900/80 px-2.5 py-1 rounded-lg border border-neutral-800">
          <span className="text-xs text-neutral-400">Size</span>
          <input
            type="range"
            min={1}
            max={36}
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            className="w-20 accent-red-600 cursor-pointer"
          />
          <span className="text-xs font-mono text-neutral-300 w-4">{lineWidth}</span>
        </div>

        {/* Undo / Redo & Clear */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-2 text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-400 rounded-lg hover:bg-neutral-800"
            title="Undo"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-400 rounded-lg hover:bg-neutral-800"
            title="Redo"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={clearCanvas}
            className="p-2 text-red-400 hover:text-red-300 rounded-lg hover:bg-neutral-800"
            title="Clear Frame Canvas"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Color Swatches and Pickers */}
      <div className="flex flex-wrap items-center gap-1.5 bg-[#1a1a24] p-2 rounded-xl border border-neutral-800">
        <div className="flex items-center gap-1 mr-2">
          <span className="text-xs text-neutral-400">Color:</span>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-7 h-7 rounded border-none bg-transparent cursor-pointer p-0"
            title="Custom Color"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {PALETTE.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-6 h-6 rounded-md transition-transform ${
                color.toLowerCase() === c.toLowerCase() ? 'scale-125 ring-2 ring-white ring-offset-1 ring-offset-neutral-900' : 'hover:scale-110'
              }`}
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
        </div>
      </div>

      {/* Main Canvas Viewport with Onion Skinning Layers */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-neutral-800 shadow-2xl bg-[#0a0a0e] flex items-center justify-center">
        {/* Checkerboard transparency grid */}
        <div className="absolute inset-0 checkerboard-pattern opacity-40 pointer-events-none" />

        {/* Previous Frame Onion Skin (Cyan tint) */}
        {onionSkinEnabled && previousFrameDataUrl && (
          <img
            src={previousFrameDataUrl}
            alt="Previous Frame Onion Skin"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none mix-blend-screen"
            style={{ opacity: onionSkinOpacity * 0.7, filter: 'sepia(1) saturate(5) hue-rotate(140deg)' }}
          />
        )}

        {/* Next Frame Onion Skin (Green tint) */}
        {onionSkinEnabled && nextFrameDataUrl && (
          <img
            src={nextFrameDataUrl}
            alt="Next Frame Onion Skin"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none mix-blend-screen"
            style={{ opacity: onionSkinOpacity * 0.5, filter: 'sepia(1) saturate(5) hue-rotate(60deg)' }}
          />
        )}

        {/* Active Drawing Canvas */}
        <canvas
          ref={mainCanvasRef}
          width={width}
          height={height}
          onMouseDown={startDraw}
          onMouseMove={drawMove}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={drawMove}
          onTouchEnd={endDraw}
          className="absolute inset-0 w-full h-full object-contain cursor-crosshair touch-none"
        />

        {/* Live Preview Shapes Canvas */}
        <canvas
          ref={previewCanvasRef}
          width={width}
          height={height}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        />

        {/* Onion Skin Indicator */}
        {onionSkinEnabled && (
          <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-mono text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5 pointer-events-none">
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>Onion Skin: <span className="text-cyan-300">Prev (Cyan)</span> / <span className="text-green-400">Next (Green)</span></span>
          </div>
        )}
      </div>
    </div>
  );
};
