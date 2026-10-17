import React, { useState } from 'react';
import { Play, Trash2, Heart, Clock, Film, Sparkles } from 'lucide-react';
import { Show, UserProfile } from '../types';
import { ShowCard } from './ShowCard';

interface MyListProps {
  shows: Show[];
  profile: UserProfile;
  onPlayShow: (show: Show, episodeId?: string) => void;
  onOpenDetails: (show: Show) => void;
  onToggleWatchlist: (showId: string) => void;
  onToggleLike: (showId: string) => void;
  onOpenStudio: () => void;
}

export const MyList: React.FC<MyListProps> = ({
  shows,
  profile,
  onPlayShow,
  onOpenDetails,
  onToggleWatchlist,
  onToggleLike,
  onOpenStudio,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'watchlist' | 'history'>('all');

  const watchlistShows = shows.filter((s) => profile.watchlist.includes(s.id));
  const historyEntries = Object.entries(profile.watchHistory);
  const historyShows = historyEntries
    .map(([showId, item]) => {
      const show = shows.find((s) => s.id === showId);
      return show ? { show, item } : null;
    })
    .filter(Boolean) as { show: Show; item: (typeof profile.watchHistory)[string] }[];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-12 py-8 flex flex-col gap-8">
      {/* Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-wide font-bebas">
            My List & Viewing Activity
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Personalized collection for {profile.name} • Synced across all your paired devices
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 bg-neutral-900 p-1 rounded-xl border border-neutral-800 text-xs">
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              filterTab === 'all' ? 'bg-red-600 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            All Activity
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('watchlist')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              filterTab === 'watchlist'
                ? 'bg-red-600 text-white'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Watchlist ({watchlistShows.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('history')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              filterTab === 'history'
                ? 'bg-red-600 text-white'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            History ({historyShows.length})
          </button>
        </div>
      </div>

      {/* Watchlist Section */}
      {(filterTab === 'all' || filterTab === 'watchlist') && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>Saved Watchlist ({watchlistShows.length})</span>
            </h2>
          </div>

          {watchlistShows.length === 0 ? (
            <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-10 text-center flex flex-col items-center justify-center gap-3">
              <Film className="w-10 h-10 text-neutral-600" />
              <p className="text-neutral-400 text-sm">
                Your watchlist is currently empty. Browse trending shows or create your own in the Studio!
              </p>
              <button
                type="button"
                onClick={onOpenStudio}
                className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-colors shadow-md shadow-red-600/30"
              >
                Create a Show Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {watchlistShows.map((show) => (
                <ShowCard
                  key={show.id}
                  show={show}
                  profile={profile}
                  onPlayShow={onPlayShow}
                  onOpenDetails={onOpenDetails}
                  onToggleWatchlist={onToggleWatchlist}
                  onToggleLike={onToggleLike}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Continue Watching / History Section */}
      {(filterTab === 'all' || filterTab === 'history') && (
        <div className="flex flex-col gap-4 mt-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Continue Watching & History ({historyShows.length})</span>
          </h2>

          {historyShows.length === 0 ? (
            <div className="text-sm text-neutral-500 py-4">No viewing history recorded yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {historyShows.map(({ show, item }) => (
                <div
                  key={show.id}
                  className="bg-[#181822] rounded-xl border border-neutral-800 overflow-hidden flex flex-col group hover:border-neutral-700 transition-all"
                >
                  <div
                    onClick={() => onPlayShow(show, item.episodeId)}
                    className="relative aspect-video w-full bg-neutral-900 cursor-pointer overflow-hidden"
                  >
                    {show.thumbnailUrl ? (
                      <img
                        src={show.thumbnailUrl}
                        alt={show.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full bg-neutral-800" />
                    )}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 flex items-center justify-center transition-colors">
                      <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-neutral-800">
                      <div
                        className="h-full bg-red-600"
                        style={{ width: `${item.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-white truncate">{show.title}</h4>
                      <span className="text-[11px] font-mono text-cyan-400">
                        {item.progressPercent}%
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400">
                      Paused on Frame {item.currentFrame + 1} of {item.totalFrames}
                    </p>
                    <div className="text-[10px] text-neutral-500">
                      Last watched {new Date(item.lastWatchedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
