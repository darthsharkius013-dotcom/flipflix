import React, { useState } from 'react';
import {
  X,
  Play,
  Plus,
  Check,
  ThumbsUp,
  Film,
  Sparkles,
  Star,
  Clock,
  PlusCircle,
  Share2,
} from 'lucide-react';
import { Show, UserProfile, Review, EpisodeComment } from '../types';
import { ReviewsAndComments } from './ReviewsAndComments';

interface ShowDetailModalProps {
  show: Show;
  profile: UserProfile;
  onClose: () => void;
  onPlayEpisode: (show: Show, episodeId: string) => void;
  onToggleWatchlist: (showId: string) => void;
  onToggleLike: (showId: string) => void;
  onAddReview: (showId: string, review: Review) => void;
  onAddComment: (comment: EpisodeComment) => void;
  onOpenStudioForShow: (show: Show) => void;
}

export const ShowDetailModal: React.FC<ShowDetailModalProps> = ({
  show,
  profile,
  onClose,
  onPlayEpisode,
  onToggleWatchlist,
  onToggleLike,
  onAddReview,
  onAddComment,
  onOpenStudioForShow,
}) => {
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string>(
    show.episodes[0]?.id || ''
  );

  const isInWatchlist = profile.watchlist.includes(show.id);
  const isLiked = profile.likedShowIds.includes(show.id);
  const pilot = show.episodes[0];
  const coverImg = show.thumbnailUrl || pilot?.frames[0]?.dataUrl;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex justify-center p-2 md:p-6 select-none animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-[#181822] rounded-2xl overflow-hidden border border-neutral-700/80 shadow-2xl my-auto text-white">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-colors border border-neutral-700"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Top Backdrop */}
        <div className="relative aspect-video max-h-[380px] w-full bg-black overflow-hidden">
          {coverImg ? (
            <img
              src={coverImg}
              alt={show.title}
              className="w-full h-full object-cover filter brightness-90"
            />
          ) : (
            <div className="w-full h-full bg-neutral-900" />
          )}

          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#181822] via-[#181822]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#181822]/80 via-transparent to-transparent" />

          {/* Title & Play overlay */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="bg-red-600 px-2 py-0.5 rounded text-[10px] font-black tracking-widest text-white shadow">
                FLIPFLIX ORIGINAL
              </span>
              <span className="text-green-400 font-bold font-mono text-xs">
                {show.matchScore || 96}% Match
              </span>
            </div>

            <h2 className="text-2xl md:text-4xl font-black text-white tracking-wide font-bebas">
              {show.title}
            </h2>

            <p className="text-xs md:text-sm text-red-400 font-semibold">
              "{show.tagline}"
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => onPlayEpisode(show, show.episodes[0].id)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-extrabold text-sm transition-all shadow-lg hover:scale-105"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>Play Pilot</span>
              </button>

              <button
                type="button"
                onClick={() => onToggleWatchlist(show.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                  isInWatchlist
                    ? 'border-green-500 bg-green-500/20 text-green-400'
                    : 'border-neutral-700 bg-neutral-800/80 text-white hover:bg-neutral-700'
                }`}
              >
                {isInWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</span>
              </button>

              <button
                type="button"
                onClick={() => onToggleLike(show.id)}
                className={`p-2.5 rounded-xl border transition-all ${
                  isLiked
                    ? 'border-red-500 bg-red-500/20 text-red-400'
                    : 'border-neutral-700 bg-neutral-800/80 text-white hover:bg-neutral-700'
                }`}
                title={isLiked ? 'Liked' : 'Like'}
              >
                <ThumbsUp className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onOpenStudioForShow(show)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-800/90 hover:bg-neutral-700 border border-neutral-700 text-xs font-semibold text-neutral-200 transition-colors ml-auto"
                title="Create a new animated episode for this show"
              >
                <PlusCircle className="w-4 h-4 text-cyan-400" />
                <span>Animate Episode {show.episodes.length + 1}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="p-6 flex flex-col gap-6">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 flex flex-col gap-3">
              <p className="text-sm text-neutral-300 leading-relaxed">
                {show.synopsis}
              </p>

              <div className="flex items-center gap-3 text-xs text-neutral-400 pt-1">
                <span className="font-mono text-neutral-300">
                  {show.releaseYear}
                </span>
                <span>•</span>
                <span className="border border-neutral-700 px-1.5 py-0.5 rounded text-[11px] font-mono text-neutral-300">
                  {show.maturityRating}
                </span>
                <span>•</span>
                <span className="text-neutral-400">
                  {show.viewsCount.toLocaleString()} Total Streams
                </span>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="flex flex-col gap-2 text-xs border-l border-neutral-800/80 pl-4">
              <div>
                <span className="text-neutral-500 block">Created & Directed by:</span>
                <span className="font-semibold text-white">{show.creatorName}</span>
              </div>
              <div className="pt-1">
                <span className="text-neutral-500 block">Genres:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {show.genres.map((g) => (
                    <span
                      key={g}
                      className="bg-neutral-800/80 border border-neutral-700 px-2 py-0.5 rounded text-[10px] text-neutral-300"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>
              <div className="pt-1">
                <span className="text-neutral-500 block">Animation Style:</span>
                <span className="text-neutral-300 font-mono text-[11px]">
                  Frame-by-Frame Canvas
                </span>
              </div>
            </div>
          </div>

          {/* Episodes Section */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Film className="w-4 h-4 text-red-500" />
                <span>Episodes ({show.episodes.length})</span>
              </h3>
              <span className="text-xs text-neutral-400">Season 1</span>
            </div>

            <div className="flex flex-col gap-2.5">
              {show.episodes.map((ep) => {
                const epDuration = (ep.frames.length / (ep.fps || 8)).toFixed(1);
                const epThumb = ep.frames[0]?.dataUrl || show.thumbnailUrl;

                return (
                  <div
                    key={ep.id}
                    onClick={() => {
                      setSelectedEpisodeId(ep.id);
                      onPlayEpisode(show, ep.id);
                    }}
                    className="group/ep flex items-center gap-4 p-3 rounded-xl bg-neutral-900/50 hover:bg-neutral-800/90 border border-neutral-800/80 transition-all cursor-pointer"
                  >
                    <span className="text-base font-bold font-mono text-neutral-400 w-6 text-center">
                      {ep.episodeNumber}
                    </span>

                    <div className="relative w-32 aspect-video rounded-lg overflow-hidden bg-black flex-shrink-0">
                      {epThumb ? (
                        <img
                          src={epThumb}
                          alt={ep.title}
                          className="w-full h-full object-cover transition-transform group-hover/ep:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-neutral-800" />
                      )}
                      <div className="absolute inset-0 bg-black/40 group-hover/ep:bg-black/10 flex items-center justify-center transition-colors">
                        <Play className="w-5 h-5 text-white fill-current opacity-80 group-hover/ep:opacity-100 group-hover/ep:scale-110 transition-all" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-sm text-white truncate group-hover/ep:text-red-400 transition-colors">
                          {ep.title}
                        </h4>
                        <span className="text-xs font-mono text-neutral-400 flex-shrink-0">
                          {epDuration}s
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 line-clamp-2 mt-1">
                        {ep.synopsis}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-neutral-500 font-mono">
                        <span>{ep.frames.length} Hand-drawn Frames</span>
                        <span>•</span>
                        <span>{ep.fps} FPS</span>
                        {ep.audioTrack && ep.audioTrack !== 'none' && (
                          <>
                            <span>•</span>
                            <span className="text-purple-400 capitalize">{ep.audioTrack} OST</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Social Reviews & Episode Comments */}
          <ReviewsAndComments
            show={show}
            profile={profile}
            selectedEpisodeId={selectedEpisodeId}
            onSelectEpisode={(id) => setSelectedEpisodeId(id)}
            onAddReview={onAddReview}
            onAddComment={onAddComment}
            onJumpToFrame={(epId) => onPlayEpisode(show, epId)}
          />
        </div>
      </div>
    </div>
  );
};
