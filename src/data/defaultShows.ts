import { Show, Episode, Frame, Review, EpisodeComment } from '../types';

// Helper to create a dataURL from a drawing callback
function renderFrameToDataUrl(
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    draw(ctx, width, height);
  }
  return canvas.toDataURL('image/png');
}

// Generates animated frames for Cyber Samurai (12 frames)
function generateCyberSamuraiFrames(): Frame[] {
  const frames: Frame[] = [];
  const W = 640;
  const H = 360;

  for (let i = 0; i < 12; i++) {
    const dataUrl = renderFrameToDataUrl(W, H, (ctx, w, h) => {
      // Background: Cyberpunk skyline at night
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#0a0518');
      grad.addColorStop(0.7, '#1b0933');
      grad.addColorStop(1, '#05020a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Distant neon buildings
      ctx.fillStyle = '#120b24';
      ctx.fillRect(40, 100, 80, 260);
      ctx.fillRect(140, 60, 100, 300);
      ctx.fillRect(420, 90, 90, 270);
      ctx.fillRect(530, 40, 80, 320);

      // Windows glow
      ctx.fillStyle = 'rgba(0, 255, 230, 0.4)';
      for (let y = 120; y < 240; y += 30) {
        ctx.fillRect(60, y, 15, 12);
        ctx.fillRect(160, y, 15, 12);
        ctx.fillRect(450, y, 15, 12);
      }

      // Neon Moon / holographic billboard
      ctx.beginPath();
      ctx.arc(w - 120, 80, 45, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 0, 128, 0.3)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(w - 120, 80, 38, 0, Math.PI * 2);
      ctx.fillStyle = '#ff007f';
      ctx.shadowColor = '#ff007f';
      ctx.shadowBlur = 25;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Ground platform
      ctx.fillStyle = '#0f1016';
      ctx.fillRect(0, h - 50, w, 50);
      ctx.fillStyle = '#00ffff';
      ctx.fillRect(0, h - 50, w, 3);

      // Samurai animation: Stance to swift Katana slash with neon cyan trail!
      const progress = i / 11; // 0 to 1
      const slashAngle = -Math.PI / 3 + progress * Math.PI * 1.2;
      const bladeX = 260 + Math.cos(slashAngle) * 110;
      const bladeY = 200 + Math.sin(slashAngle) * 100;

      // Samurai Body (Silhouette with glowing visor)
      ctx.fillStyle = '#050508';
      // Torso & coat
      ctx.beginPath();
      ctx.moveTo(220, 290);
      ctx.lineTo(240, 190);
      ctx.lineTo(260, 190);
      ctx.lineTo(285, 290);
      ctx.closePath();
      ctx.fill();

      // Flowing coat tail
      ctx.beginPath();
      ctx.moveTo(220, 270);
      ctx.quadraticCurveTo(180 - i * 6, 290 + i * 2, 170 - i * 8, 305);
      ctx.lineTo(235, 290);
      ctx.closePath();
      ctx.fillStyle = '#0d0d18';
      ctx.fill();

      // Head / Helmet
      ctx.fillStyle = '#0a0a14';
      ctx.beginPath();
      ctx.arc(248, 175, 18, 0, Math.PI * 2);
      ctx.fill();

      // Glowing Neon Red Visor
      ctx.strokeStyle = '#ff0055';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#ff0055';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.moveTo(242, 174);
      ctx.lineTo(262, 175);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Neon Katana Blade & Glowing Trail
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 20;

      // Blade trail arc
      if (i > 2 && i < 10) {
        ctx.beginPath();
        ctx.arc(250, 200, 110, -Math.PI / 4, slashAngle, false);
        ctx.lineWidth = 8;
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.4)';
        ctx.stroke();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
      }

      // Main Katana
      ctx.beginPath();
      ctx.moveTo(250, 200);
      ctx.lineTo(bladeX, bladeY);
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Blade tip energy spark
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(bladeX, bladeY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Cyber rain streaks
      ctx.strokeStyle = 'rgba(0, 255, 230, 0.2)';
      ctx.lineWidth = 1;
      for (let r = 0; r < 20; r++) {
        const rx = (r * 37 + i * 23) % w;
        const ry = (r * 49 + i * 31) % (h - 60);
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 8, ry + 22);
        ctx.stroke();
      }
    });

    frames.push({
      id: `cs-frame-${i}`,
      dataUrl,
    });
  }

  return frames;
}

// Generates animated frames for Cosmic Cafe (10 frames)
function generateCosmicCafeFrames(): Frame[] {
  const frames: Frame[] = [];
  const W = 640;
  const H = 360;

  for (let i = 0; i < 10; i++) {
    const dataUrl = renderFrameToDataUrl(W, H, (ctx, w, h) => {
      // Cosmic Cafe interior with panoramic space viewport
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);

      // Large curved space window
      ctx.save();
      ctx.beginPath();
      ctx.arc(w / 2, h / 2 - 20, 200, 0, Math.PI * 2);
      ctx.clip();

      // Deep space nebula inside window
      const nebGrad = ctx.createRadialGradient(280, 140, 10, 320, 160, 220);
      nebGrad.addColorStop(0, '#7928ca');
      nebGrad.addColorStop(0.5, '#4338ca');
      nebGrad.addColorStop(1, '#050515');
      ctx.fillStyle = nebGrad;
      ctx.fillRect(100, 0, 440, 320);

      // Twinkling stars
      for (let s = 0; s < 30; s++) {
        const sx = (s * 31) % 400 + 120;
        const sy = (s * 43) % 240 + 30;
        const size = ((s + i) % 3) + 1;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Window Frame
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2 - 20, 200, 0, Math.PI * 2);
      ctx.stroke();

      // Cafe Counter
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, h - 110, w, 110);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(0, h - 110, w, 4);

      // Barista Bot "Gizmo"
      const botY = 175 + Math.sin((i / 10) * Math.PI * 2) * 5;
      // Bot Head
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.roundRect(260, botY, 120, 80, [20]);
      ctx.fill();

      // Screen Face
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.roundRect(275, botY + 15, 90, 50, [10]);
      ctx.fill();

      // Cute Eyes (blinking on frame 4 & 5)
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      if (i === 4 || i === 5) {
        // Blinking line
        ctx.fillRect(290, botY + 38, 20, 4);
        ctx.fillRect(330, botY + 38, 20, 4);
      } else {
        ctx.beginPath();
        ctx.arc(300, botY + 38, 9, 0, Math.PI * 2);
        ctx.arc(340, botY + 38, 9, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // Bot Antenna with pulsating neon light
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(320, botY);
      ctx.lineTo(320, botY - 25);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(320, botY - 28, 8, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 ? '#f43f5e' : '#fb7185';
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Coffee Mug on counter
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.roundRect(300, h - 100, 45, 55, [4]);
      ctx.fill();

      // Mug handle
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(348, h - 72, 12, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();

      // Swirling Cosmic Steam
      const steamOffset = (i * 8) % 40;
      ctx.strokeStyle = 'rgba(216, 180, 254, 0.7)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(315, h - 105);
      ctx.bezierCurveTo(
        310 + Math.sin(i) * 10,
        h - 130 - steamOffset,
        335 + Math.cos(i) * 10,
        h - 145 - steamOffset,
        322,
        h - 170 - steamOffset
      );
      ctx.stroke();
    });

    frames.push({
      id: `cc-frame-${i}`,
      dataUrl,
    });
  }

  return frames;
}

// Generates animated frames for The Lantern Bearer (10 frames)
function generateLanternBearerFrames(): Frame[] {
  const frames: Frame[] = [];
  const W = 640;
  const H = 360;

  for (let i = 0; i < 10; i++) {
    const dataUrl = renderFrameToDataUrl(W, H, (ctx, w, h) => {
      // Dark enchanted forest at twilight
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#020617');
      bgGrad.addColorStop(0.6, '#0f172a');
      bgGrad.addColorStop(1, '#052e16');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Misty ancient trees silhouette
      ctx.fillStyle = '#061c16';
      // Tree 1
      ctx.beginPath();
      ctx.moveTo(60, h);
      ctx.lineTo(85, 80);
      ctx.lineTo(130, h);
      ctx.fill();
      // Tree 2
      ctx.beginPath();
      ctx.moveTo(500, h);
      ctx.lineTo(540, 60);
      ctx.lineTo(590, h);
      ctx.fill();

      // Ground moss
      ctx.fillStyle = '#064e3b';
      ctx.beginPath();
      ctx.moveTo(0, h - 40);
      ctx.quadraticCurveTo(w / 2, h - 60, w, h - 35);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.fill();

      // Walking wanderer
      const walkCycle = (i / 10) * Math.PI * 2;
      const wandererX = 260 + Math.sin(walkCycle) * 15;
      const wandererY = 240;

      // Spirit Lantern hanging from staff
      const lanternSwing = Math.sin(walkCycle) * 0.25;
      const staffEndX = wandererX + 65;
      const staffEndY = wandererY - 45;
      const lanternX = staffEndX + Math.sin(lanternSwing) * 35;
      const lanternY = staffEndY + 50 + Math.cos(lanternSwing) * 5;

      // Glow radius from spirit lantern
      const lanternGlow = ctx.createRadialGradient(
        lanternX,
        lanternY,
        5,
        lanternX,
        lanternY,
        140
      );
      lanternGlow.addColorStop(0, 'rgba(251, 191, 36, 0.85)');
      lanternGlow.addColorStop(0.3, 'rgba(245, 158, 11, 0.4)');
      lanternGlow.addColorStop(0.7, 'rgba(52, 211, 153, 0.15)');
      lanternGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = lanternGlow;
      ctx.beginPath();
      ctx.arc(lanternX, lanternY, 140, 0, Math.PI * 2);
      ctx.fill();

      // Cloaked Wanderer body
      ctx.fillStyle = '#1e293b';
      // Hood
      ctx.beginPath();
      ctx.arc(wandererX, wandererY - 40, 18, 0, Math.PI * 2);
      ctx.fill();
      // Cloak
      ctx.beginPath();
      ctx.moveTo(wandererX - 16, wandererY - 30);
      ctx.lineTo(wandererX + 16, wandererY - 30);
      ctx.lineTo(wandererX + 24, wandererY + 45);
      ctx.lineTo(wandererX - 22, wandererY + 45);
      ctx.closePath();
      ctx.fill();

      // Staff
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(wandererX + 10, wandererY + 40);
      ctx.lineTo(staffEndX, staffEndY);
      ctx.stroke();

      // Lantern cord
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(staffEndX, staffEndY);
      ctx.lineTo(lanternX, lanternY - 15);
      ctx.stroke();

      // Brass lantern cage
      ctx.fillStyle = '#b45309';
      ctx.fillRect(lanternX - 10, lanternY - 15, 20, 6);
      ctx.fillRect(lanternX - 8, lanternY + 15, 16, 5);

      // Glowing spirit core inside lantern
      ctx.fillStyle = '#fef08a';
      ctx.shadowColor = '#fef08a';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(lanternX, lanternY, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Floating forest spirits / fireflies
      for (let f = 0; f < 8; f++) {
        const fx = (f * 71 + i * 14) % w;
        const fy = 120 + Math.sin((i + f) * 0.7) * 40;
        ctx.fillStyle = '#6ee7b7';
        ctx.shadowColor = '#6ee7b7';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(fx, fy, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    });

    frames.push({
      id: `lb-frame-${i}`,
      dataUrl,
    });
  }

  return frames;
}

// Generates animated frames for Pixel Knight (8 frames)
function generatePixelKnightFrames(): Frame[] {
  const frames: Frame[] = [];
  const W = 640;
  const H = 360;

  for (let i = 0; i < 8; i++) {
    const dataUrl = renderFrameToDataUrl(W, H, (ctx, w, h) => {
      // Retro dungeon brick background
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(0, 0, w, h);

      // Dungeon stone wall pattern
      ctx.strokeStyle = '#292524';
      ctx.lineWidth = 3;
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      for (let x = 0; x < w; x += 80) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      // Torches on walls
      const torchFlicker = (i % 2 === 0 ? 4 : -3);
      ctx.fillStyle = '#f97316';
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 25;
      ctx.beginPath();
      ctx.arc(100, 120 + torchFlicker, 16, 0, Math.PI * 2);
      ctx.arc(540, 120 - torchFlicker, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Ground dungeon flagstones
      ctx.fillStyle = '#44403c';
      ctx.fillRect(0, h - 70, w, 70);

      // Pixel Knight jumping animation
      const jumpProgress = (i / 8) * Math.PI;
      const jumpY = Math.sin(jumpProgress) * 55;
      const kX = 220 + (i * 12);
      const kY = h - 130 - jumpY;

      // Knight Armor
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(kX, kY, 45, 55);

      // Golden helmet crest
      ctx.fillStyle = '#eab308';
      ctx.fillRect(kX + 12, kY - 14, 20, 14);

      // Helmet visor slit
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(kX + 8, kY + 12, 30, 8);

      // Glowing Knight eyes
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(kX + 14, kY + 14, 6, 4);
      ctx.fillRect(kX + 26, kY + 14, 6, 4);

      // Shield
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.roundRect(kX - 16, kY + 10, 16, 32, [4]);
      ctx.fill();

      // Sword slash
      const swordAngle = -Math.PI / 4 + (i / 8) * Math.PI;
      ctx.save();
      ctx.translate(kX + 45, kY + 25);
      ctx.rotate(swordAngle);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(0, -5, 48, 10);
      ctx.fillStyle = '#eab308';
      ctx.fillRect(-10, -8, 10, 16);
      ctx.restore();

      // Tiny playful dragon pet on the right
      const dragX = 460;
      const dragY = h - 120 + (i % 2 === 0 ? 4 : 0);
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(dragX, dragY, 28, 0, Math.PI * 2);
      ctx.fill();
      // Dragon snout
      ctx.beginPath();
      ctx.arc(dragX - 18, dragY + 4, 14, 0, Math.PI * 2);
      ctx.fill();
      // Dragon eye
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(dragX - 10, dragY - 8, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(dragX - 12, dragY - 8, 3, 0, Math.PI * 2);
      ctx.fill();

      // Dragon breathing cute puff of fire
      if (i > 3) {
        ctx.fillStyle = '#f97316';
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(dragX - 45 - (i - 4) * 12, dragY + 2, 8 + (i - 4) * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });

    frames.push({
      id: `pk-frame-${i}`,
      dataUrl,
    });
  }

  return frames;
}

// Initial Show Catalog
export function getDefaultShows(): Show[] {
  const csFrames = generateCyberSamuraiFrames();
  const ccFrames = generateCosmicCafeFrames();
  const lbFrames = generateLanternBearerFrames();
  const pkFrames = generatePixelKnightFrames();

  const csThumb = csFrames[5]?.dataUrl || '';
  const ccThumb = ccFrames[4]?.dataUrl || '';
  const lbThumb = lbFrames[4]?.dataUrl || '';
  const pkThumb = pkFrames[3]?.dataUrl || '';

  return [
    {
      id: 'show-cyber-samurai',
      title: 'Cyber Samurai: Neon Blade',
      tagline: 'Honor cuts deeper than tungsten.',
      synopsis: 'In Neo-Kyoto 2099, an ex-guard turned ronin wields a forbidden plasma katana to protect the city’s last rooftop bonsai nursery against the corporate syndicate.',
      genres: ['Cyberpunk', 'Action', 'Anime', 'Sci-Fi'],
      maturityRating: 'TV-14',
      releaseYear: 2026,
      creatorName: 'Renji Takahashi',
      thumbnailUrl: csThumb,
      viewsCount: 148920,
      featured: true,
      matchScore: 98,
      createdAt: '2026-09-12T14:20:00Z',
      episodes: [
        {
          id: 'cs-ep-1',
          showId: 'show-cyber-samurai',
          episodeNumber: 1,
          title: 'Pilot: The Neon Blossom',
          synopsis: 'Jin awakens to red sirens as security droids breach sector 4. With his blade charged, he draws the line on the rain-slicked catwalks.',
          fps: 8,
          frames: csFrames,
          audioTrack: 'synthwave',
          durationSeconds: csFrames.length / 8,
          createdAt: '2026-09-12T14:20:00Z',
          soundTriggers: [
            { frameIndex: 3, soundType: 'swoosh' },
            { frameIndex: 6, soundType: 'laser' },
            { frameIndex: 9, soundType: 'hit' },
          ],
        },
      ],
      reviews: [
        {
          id: 'cs-rev-1',
          showId: 'show-cyber-samurai',
          userId: 'user-kai',
          userName: 'Kai Nakamura',
          userAvatar: '⚡',
          rating: 5,
          title: 'Masterpiece of hand-drawn cyberpunk animation!',
          content: 'The sword arc animation on frame 5 is literally mindblowing. The cyan glow trails combined with the synth bass gave me goosebumps. Can’t wait for episode 2!',
          hasSpoilers: false,
          helpfulCount: 42,
          createdAt: '2026-09-14T10:15:00Z',
        },
        {
          id: 'cs-rev-2',
          showId: 'show-cyber-samurai',
          userId: 'user-elena',
          userName: 'Elena Rostova',
          userAvatar: '🌸',
          rating: 5,
          title: 'Gorgeous aesthetic & pulse-pounding rhythm',
          content: 'The contrast between the dark silhouette and the glowing visor captures the classic 80s anime OVA feel with modern frame timing. Instant 10/10.',
          hasSpoilers: false,
          helpfulCount: 29,
          createdAt: '2026-09-15T18:40:00Z',
        },
      ],
      comments: [
        {
          id: 'cs-comm-1',
          episodeId: 'cs-ep-1',
          showId: 'show-cyber-samurai',
          userId: 'user-animator99',
          userName: 'SakugaFan',
          userAvatar: '🗡️',
          frameIndex: 5,
          timestampSeconds: 0.6,
          text: 'Notice the secondary motion on the coat tail here? That is textbook hand-drawn weight!',
          likes: 18,
          createdAt: '2026-09-16T12:00:00Z',
        },
        {
          id: 'cs-comm-2',
          episodeId: 'cs-ep-1',
          showId: 'show-cyber-samurai',
          userId: 'user-synth',
          userName: 'VaporDave',
          userAvatar: '🕶️',
          frameIndex: 8,
          timestampSeconds: 1.0,
          text: 'The sound effect sync right here hits so hard.',
          likes: 9,
          createdAt: '2026-09-17T09:25:00Z',
        },
      ],
    },
    {
      id: 'show-cosmic-cafe',
      title: 'Cosmic Cafe: Journey to Vega',
      tagline: 'Best espresso this side of the Milky Way.',
      synopsis: 'A cheerful barista robot named Gizmo serves galactic travelers, moody bounty hunters, and friendly gelatinous beings at an orbital rest stop.',
      genres: ['Comedy', 'Slice of Life', 'Sci-Fi'],
      maturityRating: 'TV-PG',
      releaseYear: 2026,
      creatorName: 'Maya Lin',
      thumbnailUrl: ccThumb,
      viewsCount: 92430,
      matchScore: 94,
      createdAt: '2026-09-18T11:00:00Z',
      episodes: [
        {
          id: 'cc-ep-1',
          showId: 'show-cosmic-cafe',
          episodeNumber: 1,
          title: 'Pilot: Supernova Roast',
          synopsis: 'Gizmo prepares a triple-shot dark nebula macchiato just as a fleet of hungry space scouts docks at Port Vega.',
          fps: 6,
          frames: ccFrames,
          audioTrack: 'chiptune',
          durationSeconds: ccFrames.length / 6,
          createdAt: '2026-09-18T11:00:00Z',
          soundTriggers: [
            { frameIndex: 2, soundType: 'sparkle' },
            { frameIndex: 5, soundType: 'chime' },
          ],
        },
      ],
      reviews: [
        {
          id: 'cc-rev-1',
          showId: 'show-cosmic-cafe',
          userId: 'user-cozy',
          userName: 'CozyGamerGirl',
          userAvatar: '☕',
          rating: 5,
          title: 'The cutest animation on FlipFlix!',
          content: 'Gizmo blinking and the swirling star steam made me smile so much. Perfect cozy anime vibe.',
          hasSpoilers: false,
          helpfulCount: 35,
          createdAt: '2026-09-20T14:10:00Z',
        },
      ],
      comments: [
        {
          id: 'cc-comm-1',
          episodeId: 'cc-ep-1',
          showId: 'show-cosmic-cafe',
          userId: 'user-latte',
          userName: 'StarBarista',
          userAvatar: '✨',
          frameIndex: 4,
          timestampSeconds: 0.7,
          text: 'The blinking frame timing is so adorable! 10/10 character acting.',
          likes: 12,
          createdAt: '2026-09-21T08:14:00Z',
        },
      ],
    },
    {
      id: 'show-lantern-bearer',
      title: 'The Lantern Bearer: Spectral Hollow',
      tagline: 'Light the path for the lost souls.',
      synopsis: 'Equipped with a spirit-glass lantern that reveals unseen realms, an apprentice cartographer journeys deep into the Whispering Woods.',
      genres: ['Fantasy', 'Mystery', 'Adventure'],
      maturityRating: 'TV-PG',
      releaseYear: 2026,
      creatorName: 'Arthur Pendelton',
      thumbnailUrl: lbThumb,
      viewsCount: 114500,
      matchScore: 91,
      createdAt: '2026-09-22T08:30:00Z',
      episodes: [
        {
          id: 'lb-ep-1',
          showId: 'show-lantern-bearer',
          episodeNumber: 1,
          title: 'Pilot: The Green Glow',
          synopsis: 'Elowen enters the ancient woods as twilight falls. Her lantern begins to pulse in resonance with forgotten firefly spirits.',
          fps: 6,
          frames: lbFrames,
          audioTrack: 'mysterious',
          durationSeconds: lbFrames.length / 6,
          createdAt: '2026-09-22T08:30:00Z',
          soundTriggers: [
            { frameIndex: 1, soundType: 'chime' },
            { frameIndex: 4, soundType: 'footstep' },
            { frameIndex: 7, soundType: 'sparkle' },
          ],
        },
      ],
      reviews: [
        {
          id: 'lb-rev-1',
          showId: 'show-lantern-bearer',
          userId: 'user-lore',
          userName: 'MythWeaver',
          userAvatar: '🏮',
          rating: 5,
          title: 'Magical lighting and atmosphere',
          content: 'The radial gradient lighting that follows the lantern swing is pure art. Feels like Studio Ghibli meets indie folklore.',
          hasSpoilers: false,
          helpfulCount: 51,
          createdAt: '2026-09-24T19:00:00Z',
        },
      ],
      comments: [
        {
          id: 'lb-comm-1',
          episodeId: 'lb-ep-1',
          showId: 'show-lantern-bearer',
          userId: 'user-spirit',
          userName: 'WillOWisp',
          userAvatar: '🌿',
          frameIndex: 3,
          timestampSeconds: 0.5,
          text: 'The pendulum motion on the lantern swing is physically accurate, wonderful attention to detail!',
          likes: 15,
          createdAt: '2026-09-25T11:45:00Z',
        },
      ],
    },
    {
      id: 'show-pixel-knight',
      title: 'Pixel Knight: Dragon Dungeons',
      tagline: 'Big sword, tiny dragon, huge trouble.',
      synopsis: 'Sir Bobs-a-Lot ventures into the forbidden underground dungeon in search of mythical treasure, accompanied by an unpredictable baby fire drake.',
      genres: ['Action', 'Comedy', 'Adventure', 'Fantasy'],
      maturityRating: 'TV-Y7',
      releaseYear: 2026,
      creatorName: 'PixelForge Studios',
      thumbnailUrl: pkThumb,
      viewsCount: 81200,
      matchScore: 88,
      createdAt: '2026-09-26T16:00:00Z',
      episodes: [
        {
          id: 'pk-ep-1',
          showId: 'show-pixel-knight',
          episodeNumber: 1,
          title: 'Pilot: Dungeon Hop',
          synopsis: 'Sir Bobs tests his leaping sword strike while the baby dragon accidentally roasts a wall sconce.',
          fps: 8,
          frames: pkFrames,
          audioTrack: 'chiptune',
          durationSeconds: pkFrames.length / 8,
          createdAt: '2026-09-26T16:00:00Z',
          soundTriggers: [
            { frameIndex: 2, soundType: 'swoosh' },
            { frameIndex: 5, soundType: 'explosion' },
          ],
        },
      ],
      reviews: [
        {
          id: 'pk-rev-1',
          showId: 'show-pixel-knight',
          userId: 'user-arcade',
          userName: 'RetroGamer92',
          userAvatar: '👾',
          rating: 4,
          title: 'Pure Saturday morning cartoon fun',
          content: 'The jump arc and recoil when the baby dragon breathes fire is hilarious. High energy!',
          hasSpoilers: false,
          helpfulCount: 22,
          createdAt: '2026-09-28T09:30:00Z',
        },
      ],
      comments: [
        {
          id: 'pk-comm-1',
          episodeId: 'pk-ep-1',
          showId: 'show-pixel-knight',
          userId: 'user-shield',
          userName: 'IronShield',
          userAvatar: '🛡️',
          frameIndex: 4,
          timestampSeconds: 0.5,
          text: 'Look at the dragon puffing up before the flame, brilliant squash and stretch principle!',
          likes: 8,
          createdAt: '2026-09-29T14:22:00Z',
        },
      ],
    },
  ];
}
