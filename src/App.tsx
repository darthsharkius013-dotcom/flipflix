import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Show,
  UserProfile,
  DeviceSession,
  ActiveTab,
  Review,
  EpisodeComment,
} from './types';
import {
  loadShows,
  saveShows,
  loadProfile,
  saveProfile,
  loadDeviceSessions,
  saveDeviceSessions,
  subscribeToSync,
  addReviewToShow,
  addCommentToEpisode,
} from './utils/storage';
import { generateCuratedRows } from './utils/recommendations';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { ShowRow } from './components/ShowRow';
import { ShowCard } from './components/ShowCard';
import { PlayerModal } from './components/PlayerModal';
import { ShowDetailModal } from './components/ShowDetailModal';
import { DeviceSyncModal } from './components/DeviceSyncModal';
import { UserProfileModal } from './components/UserProfileModal';
import { MyList } from './components/MyList';
import { AnimationStudio } from './components/Studio/AnimationStudio';
import { soundEngine } from './utils/audio';
import {
  Film,
  Sparkles,
  Search,
  Radio,
  Tv,
  Smartphone,
  Laptop,
  CheckCircle2,
  TrendingUp,
  Star,
} from 'lucide-react';

export default function App() {
  const [shows, setShows] = useState<Show[]>(() => loadShows());
  const [profile, setProfile] = useState<UserProfile>(() => loadProfile());
  const [activeSessions, setActiveSessions] = useState<DeviceSession[]>(() => loadDeviceSessions());

  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Panels
  const [playerShow, setPlayerShow] = useState<Show | null>(null);
  const [playerEpisodeId, setPlayerEpisodeId] = useState<string | undefined>(undefined);
  const [playerInitialFrame, setPlayerInitialFrame] = useState<number>(0);

  const [detailShow, setDetailShow] = useState<Show | null>(null);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [studioExtendingShow, setStudioExtendingShow] = useState<Show | undefined>(undefined);
  const [syncToastMessage, setSyncToastMessage] = useState<string | null>(null);

  // Subscribe to multi-window / multi-tab synchronization
  useEffect(() => {
    const unsubscribe = subscribeToSync(
      (updatedShows) => setShows(updatedShows),
      (updatedProfile) => setProfile(updatedProfile),
      (updatedSessions) => setActiveSessions(updatedSessions)
    );
    return () => unsubscribe();
  }, []);

  // Sync toast helper
  const triggerSyncToast = useCallback((msg: string) => {
    setSyncToastMessage(msg);
    setTimeout(() => {
      setSyncToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  }, []);

  // Update watch history & broadcast
  const handleUpdateWatchProgress = useCallback(
    (showId: string, episodeId: string, frameIndex: number, totalFrames: number) => {
      const progressPercent = Math.round(((frameIndex + 1) / totalFrames) * 100);
      const isCompleted = frameIndex >= totalFrames - 1;

      setProfile((prev) => {
        const targetShow = shows.find((s) => s.id === showId);
        const updatedProfile: UserProfile = {
          ...prev,
          watchHistory: {
            ...prev.watchHistory,
            [showId]: {
              showId,
              episodeId,
              currentFrame: frameIndex,
              totalFrames,
              progressPercent,
              lastWatchedAt: new Date().toISOString(),
              completed: isCompleted,
            },
          },
        };
        saveProfile(updatedProfile);

        // Update active device session's progress
        setActiveSessions((prevSessions) => {
          const updatedSessions = prevSessions.map((s) => {
            if (s.type === prev.deviceType) {
              return {
                ...s,
                currentShowTitle: targetShow?.title || s.currentShowTitle,
                currentProgress: progressPercent,
                lastActive: 'Active now',
              };
            }
            return s;
          });
          saveDeviceSessions(updatedSessions);
          return updatedSessions;
        });

        return updatedProfile;
      });
    },
    [shows]
  );

  // Toggle watchlist
  const handleToggleWatchlist = (showId: string) => {
    setProfile((prev) => {
      const isAdded = prev.watchlist.includes(showId);
      const updatedWatchlist = isAdded
        ? prev.watchlist.filter((id) => id !== showId)
        : [...prev.watchlist, showId];

      const updated = { ...prev, watchlist: updatedWatchlist };
      saveProfile(updated);
      triggerSyncToast(
        isAdded
          ? 'Removed from Watchlist (Synced across devices)'
          : 'Added to Watchlist (Synced across devices)'
      );
      return updated;
    });
  };

  // Toggle like
  const handleToggleLike = (showId: string) => {
    setProfile((prev) => {
      const isLiked = prev.likedShowIds.includes(showId);
      const updatedLikes = isLiked
        ? prev.likedShowIds.filter((id) => id !== showId)
        : [...prev.likedShowIds, showId];

      const updated = { ...prev, likedShowIds: updatedLikes };
      saveProfile(updated);
      triggerSyncToast(isLiked ? 'Rating removed' : 'Marked as Liked • Updating recommendations');
      return updated;
    });
  };

  // Add review
  const handleAddReview = (showId: string, review: Review) => {
    const updated = addReviewToShow(showId, review);
    setShows(updated);
    if (detailShow && detailShow.id === showId) {
      const updatedShow = updated.find((s) => s.id === showId);
      if (updatedShow) setDetailShow(updatedShow);
    }
    triggerSyncToast('Review published to community discussions!');
  };

  // Add comment
  const handleAddComment = (comment: EpisodeComment) => {
    const updated = addCommentToEpisode(comment);
    setShows(updated);
    if (detailShow && detailShow.id === comment.showId) {
      const updatedShow = updated.find((s) => s.id === comment.showId);
      if (updatedShow) setDetailShow(updatedShow);
    }
    triggerSyncToast('Comment posted to episode thread!');
  };

  // Switch simulated device
  const handleSwitchSimulatedDevice = (
    deviceType: 'tv' | 'mobile' | 'laptop',
    deviceName: string
  ) => {
    setProfile((prev) => {
      const updated: UserProfile = {
        ...prev,
        deviceType,
        deviceName,
      };
      saveProfile(updated);
      return updated;
    });

    setActiveSessions((prevSessions) => {
      const updated = prevSessions.map((s) => ({
        ...s,
        isCurrentDevice: s.type === deviceType,
        lastActive: s.type === deviceType ? 'Active now' : s.lastActive,
      }));
      saveDeviceSessions(updated);
      return updated;
    });

    triggerSyncToast(`Switched active view to ${deviceName}. Instant state synced!`);
  };

  // Publish new show from Studio
  const handlePublishShow = (newShow: Show) => {
    setShows((prev) => {
      const exists = prev.some((s) => s.id === newShow.id);
      const updated = exists
        ? prev.map((s) => (s.id === newShow.id ? newShow : s))
        : [newShow, ...prev];
      saveShows(updated);
      return updated;
    });

    // Close studio and open the published show player
    setActiveTab('home');
    setStudioExtendingShow(undefined);
    setPlayerShow(newShow);
    setPlayerEpisodeId(newShow.episodes[0].id);
    setPlayerInitialFrame(0);
    triggerSyncToast(`"${newShow.title}" is now LIVE on FlipFlix!`);
  };

  // Open Player for a show
  const handlePlayShow = (show: Show, episodeId?: string) => {
    const epId = episodeId || show.episodes[0]?.id;
    const historyItem = profile.watchHistory[show.id];
    const resumeFrame =
      historyItem && historyItem.episodeId === epId ? historyItem.currentFrame : 0;

    setPlayerShow(show);
    setPlayerEpisodeId(epId);
    setPlayerInitialFrame(resumeFrame);
  };

  // Filter shows for search
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return shows.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.synopsis.toLowerCase().includes(q) ||
        s.creatorName.toLowerCase().includes(q) ||
        s.genres.some((g) => g.toLowerCase().includes(q))
    );
  }, [shows, searchQuery]);

  // Curated Recommendation Rows
  const curatedRows = useMemo(() => {
    return generateCuratedRows(shows, profile);
  }, [shows, profile]);

  // Featured Show for Hero Banner
  const featuredShow = useMemo(() => {
    return shows.find((s) => s.featured) || shows[0];
  }, [shows]);

  return (
    <div className="min-h-screen bg-[#141414] text-white flex flex-col font-sans">
      {/* Top Device Simulation Bar indicator */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 border-b border-neutral-800/80 px-4 py-1 text-[11px] flex items-center justify-between z-30">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-neutral-300">
            {profile.deviceType === 'tv' ? (
              <Tv className="w-3.5 h-3.5 text-indigo-400" />
            ) : profile.deviceType === 'mobile' ? (
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Laptop className="w-3.5 h-3.5 text-blue-400" />
            )}
            <span className="font-semibold">{profile.deviceName}</span>
          </div>
          <span className="text-neutral-600">•</span>
          <span className="text-green-400 font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Cross-Device Synced ({activeSessions.length} Devices Online)
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsSyncModalOpen(true)}
          className="text-neutral-400 hover:text-white underline text-[11px] font-mono cursor-pointer"
        >
          Manage Pairing & Sync Code ({profile.syncToken})
        </button>
      </div>

      {/* Global Navbar */}
      <Navbar
        activeTab={activeTab}
        profile={profile}
        searchQuery={searchQuery}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setSearchQuery('');
        }}
        onSearchChange={(q) => setSearchQuery(q)}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenStudio={() => {
          setStudioExtendingShow(undefined);
          setActiveTab('studio');
        }}
      />

      {/* Main Content Body */}
      <main className="flex-1 pt-12">
        {/* Sync Toast Notification */}
        {syncToastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#1e1e2d] border border-green-500/50 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
            <span className="text-xs font-semibold">{syncToastMessage}</span>
          </div>
        )}

        {/* 1. ANIMATION STUDIO TAB */}
        {activeTab === 'studio' && (
          <AnimationStudio
            existingShowToExtend={studioExtendingShow}
            onPublishShow={handlePublishShow}
            onCancel={() => {
              setActiveTab('home');
              setStudioExtendingShow(undefined);
            }}
          />
        )}

        {/* 2. SEARCH RESULTS VIEW */}
        {activeTab !== 'studio' && searchQuery.trim() && (
          <div className="max-w-7xl mx-auto px-4 md:px-12 py-8 flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-red-500" />
                <span>Search results for: "{searchQuery}"</span>
              </h1>
              <span className="text-xs text-neutral-400 font-mono">
                {searchResults.length} {searchResults.length === 1 ? 'Show' : 'Shows'} Found
              </span>
            </div>

            {searchResults.length === 0 ? (
              <div className="py-16 text-center text-neutral-500 text-sm">
                No shows found matching "{searchQuery}". Try searching for genres like "Action",
                "Cyberpunk", "Comedy", or create this show yourself in the Animation Studio!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {searchResults.map((show) => (
                  <ShowCard
                    key={show.id}
                    show={show}
                    profile={profile}
                    onPlayShow={handlePlayShow}
                    onOpenDetails={(s) => setDetailShow(s)}
                    onToggleWatchlist={handleToggleWatchlist}
                    onToggleLike={handleToggleLike}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. HOME VIEW */}
        {activeTab === 'home' && !searchQuery.trim() && (
          <div className="flex flex-col pb-16">
            {/* Cinematic Hero Spotlight */}
            {featuredShow && (
              <HeroBanner
                show={featuredShow}
                profile={profile}
                onPlay={(s) => handlePlayShow(s)}
                onMoreInfo={(s) => setDetailShow(s)}
                onToggleWatchlist={handleToggleWatchlist}
              />
            )}

            {/* Curated Recommendation Carousels */}
            <div className="flex flex-col -mt-16 md:-mt-24 z-20">
              {curatedRows.map((row) => (
                <ShowRow
                  key={row.id}
                  title={row.title}
                  subtitle={row.subtitle}
                  shows={row.shows}
                  profile={profile}
                  onPlayShow={handlePlayShow}
                  onOpenDetails={(s) => setDetailShow(s)}
                  onToggleWatchlist={handleToggleWatchlist}
                  onToggleLike={handleToggleLike}
                />
              ))}
            </div>
          </div>
        )}

        {/* 4. CURATED SHOWS TAB */}
        {activeTab === 'shows' && !searchQuery.trim() && (
          <div className="max-w-7xl mx-auto px-4 md:px-12 py-8 flex flex-col gap-8">
            <div className="flex flex-col gap-1 border-b border-neutral-800 pb-4">
              <h1 className="text-3xl font-black text-white font-bebas tracking-wide">
                Curated Recommendations Catalog
              </h1>
              <p className="text-xs text-neutral-400">
                Shows matched against your profile genres ({profile.preferredGenres.join(', ')})
                and viewing history.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {shows.map((show) => (
                <ShowCard
                  key={show.id}
                  show={show}
                  profile={profile}
                  onPlayShow={handlePlayShow}
                  onOpenDetails={(s) => setDetailShow(s)}
                  onToggleWatchlist={handleToggleWatchlist}
                  onToggleLike={handleToggleLike}
                />
              ))}
            </div>
          </div>
        )}

        {/* 5. TRENDING & REVIEWS TAB */}
        {activeTab === 'trending' && !searchQuery.trim() && (
          <div className="max-w-7xl mx-auto px-4 md:px-12 py-8 flex flex-col gap-8">
            <div className="flex flex-col gap-1 border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-red-500" />
                <h1 className="text-3xl font-black text-white font-bebas tracking-wide">
                  Trending Now & Community Reviews
                </h1>
              </div>
              <p className="text-xs text-neutral-400">
                Top original pilots with active discussions and high review scores.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {shows.map((show) => {
                const avg =
                  show.reviews.length > 0
                    ? (
                        show.reviews.reduce((acc, r) => acc + r.rating, 0) / show.reviews.length
                      ).toFixed(1)
                    : '5.0';

                return (
                  <div
                    key={show.id}
                    className="bg-[#181822] rounded-2xl border border-neutral-800 p-4 flex flex-col gap-4 hover:border-neutral-700 transition-all"
                  >
                    <div className="flex gap-4">
                      <div
                        onClick={() => handlePlayShow(show)}
                        className="relative w-40 aspect-video rounded-lg overflow-hidden bg-black flex-shrink-0 cursor-pointer group"
                      >
                        <img
                          src={show.thumbnailUrl}
                          alt={show.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 flex items-center justify-center">
                          <span className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shadow">
                            ▶
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-green-400 font-mono font-bold">
                              {show.matchScore || 96}% Match
                            </span>
                            <span className="bg-amber-950/80 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded text-[10px] font-mono flex items-center gap-1">
                              <Star className="w-2.5 h-2.5 fill-current" /> {avg}
                            </span>
                          </div>
                          <h3
                            onClick={() => setDetailShow(show)}
                            className="font-bold text-white text-base truncate hover:text-red-400 cursor-pointer mt-0.5"
                          >
                            {show.title}
                          </h3>
                          <p className="text-xs text-neutral-400 line-clamp-2 mt-1">
                            {show.synopsis}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-neutral-500">
                          <span>{show.reviews.length} Reviews</span>
                          <span>•</span>
                          <span>{show.comments.length} Episode Comments</span>
                        </div>
                      </div>
                    </div>

                    {/* Featured review quote if available */}
                    {show.reviews[0] && (
                      <div className="bg-neutral-900/70 p-3 rounded-xl border border-neutral-800 text-xs text-neutral-300">
                        <div className="flex items-center gap-1.5 font-semibold text-white mb-1">
                          <span>{show.reviews[0].userAvatar}</span>
                          <span>{show.reviews[0].userName}:</span>
                          <span className="text-amber-400 ml-auto font-mono">
                            {show.reviews[0].rating}/5 ★
                          </span>
                        </div>
                        <p className="italic text-neutral-400 line-clamp-2">
                          "{show.reviews[0].content}"
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 border-t border-neutral-800/80">
                      <button
                        type="button"
                        onClick={() => handlePlayShow(show)}
                        className="text-xs font-bold text-white hover:text-red-400 flex items-center gap-1.5"
                      >
                        <span>Watch Pilot</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDetailShow(show)}
                        className="text-xs font-semibold text-neutral-400 hover:text-white"
                      >
                        Read all {show.reviews.length} reviews & discussions →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 6. MY LIST & HISTORY TAB */}
        {activeTab === 'watchlist' && !searchQuery.trim() && (
          <MyList
            shows={shows}
            profile={profile}
            onPlayShow={handlePlayShow}
            onOpenDetails={(s) => setDetailShow(s)}
            onToggleWatchlist={handleToggleWatchlist}
            onToggleLike={handleToggleLike}
            onOpenStudio={() => {
              setStudioExtendingShow(undefined);
              setActiveTab('studio');
            }}
          />
        )}
      </main>

      {/* MODAL: Fullscreen Video Player */}
      {playerShow && (
        <PlayerModal
          show={playerShow}
          initialEpisodeId={playerEpisodeId}
          initialFrameIndex={playerInitialFrame}
          onClose={() => setPlayerShow(null)}
          onUpdateWatchProgress={handleUpdateWatchProgress}
        />
      )}

      {/* MODAL: Show Details & Reviews/Discussions */}
      {detailShow && (
        <ShowDetailModal
          show={detailShow}
          profile={profile}
          onClose={() => setDetailShow(null)}
          onPlayEpisode={(s, epId) => {
            setDetailShow(null);
            handlePlayShow(s, epId);
          }}
          onToggleWatchlist={handleToggleWatchlist}
          onToggleLike={handleToggleLike}
          onAddReview={handleAddReview}
          onAddComment={handleAddComment}
          onOpenStudioForShow={(s) => {
            setDetailShow(null);
            setStudioExtendingShow(s);
            setActiveTab('studio');
          }}
        />
      )}

      {/* MODAL: Cross-Device Synchronization */}
      {isSyncModalOpen && (
        <DeviceSyncModal
          profile={profile}
          shows={shows}
          activeSessions={activeSessions}
          onClose={() => setIsSyncModalOpen(false)}
          onSwitchSimulatedDevice={handleSwitchSimulatedDevice}
          onRefreshSync={() => {
            setShows(loadShows());
            setProfile(loadProfile());
            setActiveSessions(loadDeviceSessions());
          }}
          onProfileUpdated={(updated) => setProfile(updated)}
        />
      )}

      {/* MODAL: User Profile & Recommendation Preferences */}
      {isProfileModalOpen && (
        <UserProfileModal
          profile={profile}
          shows={shows}
          onClose={() => setIsProfileModalOpen(false)}
          onSaveProfile={(updated) => {
            setProfile(updated);
            saveProfile(updated);
            triggerSyncToast('Genre preferences saved! Updated your curated recommendations.');
          }}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-neutral-900 bg-black/60 py-10 px-4 md:px-12 text-xs text-neutral-500 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bebas text-lg text-red-600 font-bold">FLIPFLIX</span>
            <span>— The Frame-by-Frame Animated Streaming Network & Creator Studio</span>
          </div>
          <div className="flex items-center gap-6">
            <span>Instant Cloud & Tab Sync Active</span>
            <span>•</span>
            <span>Web Audio Engine</span>
            <span>•</span>
            <span>Personalized Curated Feed</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
