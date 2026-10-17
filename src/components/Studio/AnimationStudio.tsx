import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Film,
  Send,
  Music,
  Sliders,
  CheckCircle2,
  Wand2,
  ArrowLeft,
  Info,
} from 'lucide-react';
import { Show, Episode, Frame, Genre, SoundEffectTrigger } from '../../types';
import { CanvasEditor } from './CanvasEditor';
import { Timeline } from './Timeline';
import { ThumbnailMaker } from './ThumbnailMaker';
import { soundEngine } from '../../utils/audio';

interface AnimationStudioProps {
  onPublishShow: (newShow: Show) => void;
  onCancel: () => void;
  existingShowToExtend?: Show; // If adding Episode 2 to an existing show
}

const AVAILABLE_GENRES: Genre[] = [
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

export const AnimationStudio: React.FC<AnimationStudioProps> = ({
  onPublishShow,
  onCancel,
  existingShowToExtend,
}) => {
  // Show metadata
  const [showTitle, setShowTitle] = useState(existingShowToExtend ? existingShowToExtend.title : '');
  const [tagline, setTagline] = useState(existingShowToExtend ? existingShowToExtend.tagline : '');
  const [synopsis, setSynopsis] = useState(existingShowToExtend ? existingShowToExtend.synopsis : '');
  const [selectedGenres, setSelectedGenres] = useState<Genre[]>(
    existingShowToExtend ? existingShowToExtend.genres : ['Action', 'Anime']
  );
  const [maturityRating, setMaturityRating] = useState<'TV-Y7' | 'TV-PG' | 'TV-14' | 'TV-MA'>(
    existingShowToExtend ? existingShowToExtend.maturityRating : 'TV-14'
  );
  const [creatorName, setCreatorName] = useState(
    existingShowToExtend ? existingShowToExtend.creatorName : 'You (FlipFlix Creator)'
  );

  // Episode metadata
  const nextEpNum = existingShowToExtend ? existingShowToExtend.episodes.length + 1 : 1;
  const [episodeTitle, setEpisodeTitle] = useState(
    existingShowToExtend ? `Episode ${nextEpNum}: The Next Chapter` : 'Pilot: The Beginning'
  );
  const [episodeSynopsis, setEpisodeSynopsis] = useState(
    'The initial adventure begins as our hero steps into uncharted territory.'
  );
  const [audioTrack, setAudioTrack] = useState<
    'synthwave' | 'chiptune' | 'ambient' | 'cinematic' | 'mysterious' | 'none'
  >('synthwave');

  // Animation timeline state
  const [frames, setFrames] = useState<Frame[]>([
    { id: 'f-1', dataUrl: '' },
    { id: 'f-2', dataUrl: '' },
    { id: 'f-3', dataUrl: '' },
  ]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);
  const [fps, setFps] = useState<number>(8);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [onionSkinEnabled, setOnionSkinEnabled] = useState<boolean>(true);
  const [onionSkinOpacity, setOnionSkinOpacity] = useState<number>(0.35);
  const [soundTriggers, setSoundTriggers] = useState<SoundEffectTrigger[]>([]);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');

  const playTimerRef = useRef<number | null>(null);

  // Toggle genre in selection
  const toggleGenre = (genre: Genre) => {
    if (selectedGenres.includes(genre)) {
      if (selectedGenres.length > 1) {
        setSelectedGenres(selectedGenres.filter((g) => g !== genre));
      }
    } else {
      if (selectedGenres.length < 4) {
        setSelectedGenres([...selectedGenres, genre]);
      }
    }
  };

  // Save drawing changes to current active frame
  const handleSaveCurrentFrame = (dataUrl: string) => {
    setFrames((prev) => {
      const copy = [...prev];
      copy[currentFrameIndex] = {
        ...copy[currentFrameIndex],
        dataUrl,
      };
      return copy;
    });
  };

  // Add blank frame
  const handleAddBlankFrame = () => {
    const newFrame: Frame = {
      id: `frame-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      dataUrl: '',
    };
    setFrames((prev) => [...prev, newFrame]);
    setCurrentFrameIndex(frames.length);
  };

  // Duplicate current frame
  const handleDuplicateFrame = () => {
    const current = frames[currentFrameIndex];
    const newFrame: Frame = {
      id: `frame-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      dataUrl: current.dataUrl,
    };
    const newFrames = [...frames];
    newFrames.splice(currentFrameIndex + 1, 0, newFrame);
    setFrames(newFrames);
    setCurrentFrameIndex(currentFrameIndex + 1);
  };

  // Delete frame
  const handleDeleteFrame = (index: number) => {
    if (frames.length <= 1) return;
    const newFrames = frames.filter((_, i) => i !== index);
    setFrames(newFrames);
    if (currentFrameIndex >= newFrames.length) {
      setCurrentFrameIndex(newFrames.length - 1);
    }
  };

  // Move frame in order
  const handleMoveFrame = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= frames.length) return;
    const newFrames = [...frames];
    const [moved] = newFrames.splice(fromIndex, 1);
    newFrames.splice(toIndex, 0, moved);
    setFrames(newFrames);
    setCurrentFrameIndex(toIndex);
  };

  // Sound triggers
  const handleAddSoundTrigger = (
    sound: 'swoosh' | 'laser' | 'explosion' | 'sparkle' | 'footstep' | 'chime' | 'hit' | 'glitch'
  ) => {
    soundEngine.playSoundEffect(sound);
    setSoundTriggers((prev) => [
      ...prev.filter((t) => t.frameIndex !== currentFrameIndex),
      { frameIndex: currentFrameIndex, soundType: sound },
    ]);
  };

  const handleRemoveSoundTrigger = (frameIndex: number) => {
    setSoundTriggers((prev) => prev.filter((t) => t.frameIndex !== frameIndex));
  };

  // Animation Playback in Studio
  useEffect(() => {
    if (isPlaying) {
      soundEngine.startBgm(audioTrack);
      const interval = 1000 / fps;

      playTimerRef.current = window.setInterval(() => {
        setCurrentFrameIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;

          // Check if next frame has a sound trigger
          const trigger = soundTriggers.find((t) => t.frameIndex === (nextIndex % frames.length));
          if (trigger) {
            soundEngine.playSoundEffect(trigger.soundType);
          }

          if (nextIndex >= frames.length) {
            if (isLooping) {
              return 0;
            } else {
              setIsPlaying(false);
              soundEngine.stopBgm();
              return 0;
            }
          }
          return nextIndex;
        });
      }, interval);
    } else {
      if (playTimerRef.current) {
        clearInterval(playTimerRef.current);
        playTimerRef.current = null;
      }
      soundEngine.stopBgm();
    }

    return () => {
      if (playTimerRef.current) {
        clearInterval(playTimerRef.current);
      }
    };
  }, [isPlaying, fps, frames.length, isLooping, audioTrack, soundTriggers]);

  // Load starter animation presets for rapid prototyping
  const loadStarterTemplate = (type: 'action' | 'ball') => {
    const W = 640;
    const H = 360;
    const templateFrames: Frame[] = [];

    if (type === 'ball') {
      // 8-frame bouncy ball with squash and stretch
      const heights = [100, 160, 240, 290, 290, 240, 160, 100];
      const squashW = [30, 28, 25, 45, 45, 25, 28, 30];
      const squashH = [30, 32, 35, 18, 18, 35, 32, 30];

      for (let i = 0; i < 8; i++) {
        const canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d')!;

        // Ground line
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(80, 310, 480, 6);

        // Bouncing energy orb
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.ellipse(320, heights[i], squashW[i], squashH[i], 0, 0, Math.PI * 2);
        ctx.fill();

        templateFrames.push({
          id: `tpl-ball-${i}`,
          dataUrl: canvas.toDataURL('image/png'),
        });
      }
      setFrames(templateFrames);
      setCurrentFrameIndex(0);
      setFps(8);
      if (!showTitle) setShowTitle('Super Bouncy Orb');
      if (!tagline) setTagline('Squash, stretch, and physics-defying bounces.');
      setSoundTriggers([
        { frameIndex: 3, soundType: 'hit' },
        { frameIndex: 0, soundType: 'sparkle' },
      ]);
    } else if (type === 'action') {
      // 6-frame laser blast charge & fire
      for (let i = 0; i < 6; i++) {
        const canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d')!;

        // Dark arena background
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, W, H);

        // Character silhouette
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(180, 200, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(165, 222, 30, 60);

        // Arm aiming right
        ctx.fillRect(190, 230, 40, 12);

        // Charge or beam
        if (i < 3) {
          // Charging energy sphere
          const radius = (i + 1) * 12;
          ctx.fillStyle = '#f43f5e';
          ctx.shadowColor = '#f43f5e';
          ctx.shadowBlur = 25;
          ctx.beginPath();
          ctx.arc(240, 236, radius, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Mega beam laser
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 36;
          ctx.shadowColor = '#f43f5e';
          ctx.shadowBlur = 30;
          ctx.beginPath();
          ctx.moveTo(230, 236);
          ctx.lineTo(W, 236);
          ctx.stroke();

          // Core white beam
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 14;
          ctx.stroke();
        }

        templateFrames.push({
          id: `tpl-action-${i}`,
          dataUrl: canvas.toDataURL('image/png'),
        });
      }
      setFrames(templateFrames);
      setCurrentFrameIndex(0);
      setFps(8);
      if (!showTitle) setShowTitle('Plasma Cannon Nova');
      if (!tagline) setTagline('Maximum charge, zero mercy.');
      setSoundTriggers([
        { frameIndex: 1, soundType: 'sparkle' },
        { frameIndex: 3, soundType: 'laser' },
        { frameIndex: 4, soundType: 'explosion' },
      ]);
    }
  };

  // Publish Show
  const handlePublish = () => {
    if (!showTitle.trim()) {
      alert('Please enter a Show Title before publishing.');
      return;
    }

    const hasAnyDrawnFrame = frames.some((f) => f.dataUrl && f.dataUrl.length > 50);
    if (!hasAnyDrawnFrame) {
      alert('Please draw at least one frame or load a starter template for your pilot episode!');
      return;
    }

    const pilotEpisode: Episode = {
      id: `ep-${Date.now()}`,
      showId: existingShowToExtend ? existingShowToExtend.id : `show-${Date.now()}`,
      episodeNumber: nextEpNum,
      title: episodeTitle.trim() || `Episode ${nextEpNum}: Pilot`,
      synopsis: episodeSynopsis.trim() || 'The premiere animated episode.',
      fps,
      frames,
      audioTrack,
      soundTriggers,
      durationSeconds: frames.length / fps,
      createdAt: new Date().toISOString(),
    };

    let publishedShow: Show;

    if (existingShowToExtend) {
      publishedShow = {
        ...existingShowToExtend,
        episodes: [...existingShowToExtend.episodes, pilotEpisode],
        viewsCount: existingShowToExtend.viewsCount + 10,
      };
    } else {
      const finalThumb = thumbnailUrl || frames[0]?.dataUrl || '';
      publishedShow = {
        id: `show-${Date.now()}`,
        title: showTitle.trim(),
        tagline: tagline.trim() || 'A new original animated series on FlipFlix.',
        synopsis: synopsis.trim() || 'An all-new hand-drawn animated series.',
        genres: selectedGenres,
        maturityRating,
        releaseYear: 2026,
        creatorName: creatorName.trim() || 'Indie Animator',
        thumbnailUrl: finalThumb,
        episodes: [pilotEpisode],
        matchScore: 99,
        viewsCount: 1,
        reviews: [],
        comments: [],
        createdAt: new Date().toISOString(),
      };
    }

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#e50914', '#00ffff', '#ffe600', '#ffffff', '#ff007f'],
      });
      soundEngine.playSoundEffect('sparkle');
    } catch {
      // ignore
    }

    onPublishShow(publishedShow);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col gap-6">
      {/* Studio Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#181822] p-4 rounded-2xl border border-neutral-800 shadow-xl">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
            title="Back to Catalog"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Film className="w-5 h-5 text-red-600" />
              <h1 className="text-xl font-black text-white tracking-wide">
                {existingShowToExtend
                  ? `Add Episode to: ${existingShowToExtend.title}`
                  : 'FlipFlix Animation Studio'}
              </h1>
              <span className="bg-red-600/20 text-red-400 text-xs px-2 py-0.5 rounded-full border border-red-500/30 font-semibold">
                Frame-by-Frame
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Draw each keyframe, set framerate, capture thumbnail poster, and publish directly to
              FlipFlix.
            </p>
          </div>
        </div>

        {/* Quick Template Starters & Publish Button */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 bg-neutral-900/90 px-2 py-1 rounded-lg border border-neutral-800 text-xs">
            <span className="text-neutral-400 text-[11px] flex items-center gap-1">
              <Wand2 className="w-3.5 h-3.5 text-amber-400" /> Quick Starters:
            </span>
            <button
              type="button"
              onClick={() => loadStarterTemplate('action')}
              className="px-2 py-1 bg-neutral-800 hover:bg-red-900/40 text-neutral-300 hover:text-white rounded text-[11px] transition-colors"
            >
              Laser Blast
            </button>
            <button
              type="button"
              onClick={() => loadStarterTemplate('ball')}
              className="px-2 py-1 bg-neutral-800 hover:bg-green-900/40 text-neutral-300 hover:text-white rounded text-[11px] transition-colors"
            >
              Bouncing Orb
            </button>
          </div>

          <button
            type="button"
            onClick={handlePublish}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-sm rounded-xl transition-all shadow-lg shadow-red-600/40 hover:scale-105 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Publish Show</span>
          </button>
        </div>
      </div>

      {/* Main Studio Workspace: Left Canvas & Timeline, Right Show Details & Audio */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Canvas & Timeline */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <CanvasEditor
            currentFrameDataUrl={frames[currentFrameIndex]?.dataUrl || ''}
            previousFrameDataUrl={frames[currentFrameIndex - 1]?.dataUrl}
            nextFrameDataUrl={frames[currentFrameIndex + 1]?.dataUrl}
            onionSkinEnabled={onionSkinEnabled}
            onionSkinOpacity={onionSkinOpacity}
            onSaveFrame={handleSaveCurrentFrame}
          />

          <Timeline
            frames={frames}
            currentFrameIndex={currentFrameIndex}
            isPlaying={isPlaying}
            fps={fps}
            isLooping={isLooping}
            onionSkinEnabled={onionSkinEnabled}
            soundTriggers={soundTriggers}
            onSelectFrame={(idx) => setCurrentFrameIndex(idx)}
            onAddBlankFrame={handleAddBlankFrame}
            onDuplicateFrame={handleDuplicateFrame}
            onDeleteFrame={handleDeleteFrame}
            onMoveFrame={handleMoveFrame}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            onChangeFps={(f) => setFps(f)}
            onToggleLoop={() => setIsLooping(!isLooping)}
            onToggleOnionSkin={() => setOnionSkinEnabled(!onionSkinEnabled)}
            onAddSoundTrigger={handleAddSoundTrigger}
            onRemoveSoundTrigger={handleRemoveSoundTrigger}
          />
        </div>

        {/* Right 1 Col: Show Metadata, Pilot Settings, and Audio Tracks */}
        <div className="flex flex-col gap-5">
          {/* Show Details Form */}
          {!existingShowToExtend && (
            <div className="bg-[#181822] p-4 rounded-xl border border-neutral-800 flex flex-col gap-3.5">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-red-500" />
                <span>Show Information</span>
              </h2>

              <div>
                <label className="text-xs font-semibold text-neutral-400 block mb-1">
                  Show Title *
                </label>
                <input
                  type="text"
                  value={showTitle}
                  onChange={(e) => setShowTitle(e.target.value)}
                  placeholder="e.g. Neon Horizon, Star Patrol..."
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-400 block mb-1">
                  Catchy Tagline
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. In deep space, no one hears you draw."
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-400 block mb-1">
                  Synopsis / Story
                </label>
                <textarea
                  value={synopsis}
                  onChange={(e) => setSynopsis(e.target.value)}
                  rows={2}
                  placeholder="Brief description of the universe, characters, and plot..."
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 resize-none"
                />
              </div>

              {/* Genre Selector */}
              <div>
                <label className="text-xs font-semibold text-neutral-400 block mb-1.5">
                  Genres (Choose up to 4)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_GENRES.map((genre) => {
                    const isSelected = selectedGenres.includes(genre);
                    return (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => toggleGenre(genre)}
                        className={`text-xs px-2.5 py-1 rounded-full transition-all ${
                          isSelected
                            ? 'bg-red-600 text-white font-bold'
                            : 'bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700'
                        }`}
                      >
                        {genre}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-400 block mb-1">
                    Rating
                  </label>
                  <select
                    value={maturityRating}
                    onChange={(e) => setMaturityRating(e.target.value as any)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="TV-Y7">TV-Y7 (Family)</option>
                    <option value="TV-PG">TV-PG (Teens)</option>
                    <option value="TV-14">TV-14 (Mature)</option>
                    <option value="TV-MA">TV-MA (Adults)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-400 block mb-1">
                    Creator Name
                  </label>
                  <input
                    type="text"
                    value={creatorName}
                    onChange={(e) => setCreatorName(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Episode Settings & Audio Soundtrack */}
          <div className="bg-[#181822] p-4 rounded-xl border border-neutral-800 flex flex-col gap-3.5">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Film className="w-4 h-4 text-red-500" />
              <span>{existingShowToExtend ? `Episode ${nextEpNum} Settings` : 'Pilot Episode Details'}</span>
            </h2>

            <div>
              <label className="text-xs font-semibold text-neutral-400 block mb-1">
                Episode Title
              </label>
              <input
                type="text"
                value={episodeTitle}
                onChange={(e) => setEpisodeTitle(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
              />
            </div>

            {/* Ambient Synth Soundtrack Selection */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-neutral-400 flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-purple-400" />
                  <span>Synthesized Soundtrack</span>
                </label>
                <span className="text-[10px] text-purple-400 font-mono">Web Audio Engine</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'synthwave', label: 'Neon Synthwave' },
                  { id: 'chiptune', label: '8-Bit Chiptune' },
                  { id: 'ambient', label: 'Cosmic Ambient' },
                  { id: 'mysterious', label: 'Dark Suspense' },
                  { id: 'none', label: 'Mute BGM' },
                ].map((track) => (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => {
                      setAudioTrack(track.id as any);
                      if (isPlaying) {
                        soundEngine.startBgm(track.id as any);
                      }
                    }}
                    className={`px-2.5 py-2 rounded-lg text-xs font-medium text-left transition-all border ${
                      audioTrack === track.id
                        ? 'bg-purple-950/60 border-purple-500 text-purple-200'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {track.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Onion Skin Opacity adjustment */}
          <div className="bg-[#181822] p-3 rounded-xl border border-neutral-800 flex items-center justify-between text-xs">
            <span className="text-neutral-400">Onion Skin Transparency:</span>
            <input
              type="range"
              min={0.1}
              max={0.8}
              step={0.05}
              value={onionSkinOpacity}
              onChange={(e) => setOnionSkinOpacity(Number(e.target.value))}
              className="w-28 accent-cyan-500 cursor-pointer"
            />
            <span className="font-mono text-cyan-400 w-8 text-right">
              {Math.round(onionSkinOpacity * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Thumbnail Maker / Cover Studio */}
      <ThumbnailMaker
        frames={frames}
        currentThumbnailUrl={thumbnailUrl}
        showTitle={showTitle || 'My Original Animated Show'}
        onSelectThumbnail={(thumbUrl) => setThumbnailUrl(thumbUrl)}
      />
    </div>
  );
};
