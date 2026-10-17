import { Show, UserProfile, Genre } from '../types';

export interface CuratedRow {
  id: string;
  title: string;
  subtitle?: string;
  shows: Show[];
}

export function calculateShowMatchScore(show: Show, profile: UserProfile): number {
  let score = 65; // base score

  // 1. Preferred genres affinity
  const matchedPreferred = show.genres.filter(g => profile.preferredGenres.includes(g));
  score += matchedPreferred.length * 9;

  // 2. Genres from watch history
  const historyGenreCounts: Record<string, number> = {};
  Object.values(profile.watchHistory).forEach(item => {
    // If completed or high progress
    if (item.progressPercent > 30) {
      show.genres.forEach(g => {
        historyGenreCounts[g] = (historyGenreCounts[g] || 0) + 1;
      });
    }
  });

  show.genres.forEach(g => {
    if (historyGenreCounts[g]) {
      score += Math.min(10, historyGenreCounts[g] * 4);
    }
  });

  // 3. User already in watchlist or liked
  if (profile.watchlist.includes(show.id)) {
    score += 5;
  }
  if (profile.likedShowIds.includes(show.id)) {
    score += 8;
  }

  // 4. Community reviews rating
  if (show.reviews.length > 0) {
    const avgRating = show.reviews.reduce((acc, r) => acc + r.rating, 0) / show.reviews.length;
    score += Math.round((avgRating - 3) * 4);
  }

  // Bound to 72% - 99%
  return Math.max(72, Math.min(99, Math.round(score)));
}

export function generateCuratedRows(shows: Show[], profile: UserProfile): CuratedRow[] {
  // Annotate shows with personal match score
  const annotatedShows = shows.map(s => ({
    ...s,
    matchScore: calculateShowMatchScore(s, profile),
  }));

  const rows: CuratedRow[] = [];

  // 1. Continue Watching (if any in progress)
  const continueWatchingShows: Show[] = [];
  Object.entries(profile.watchHistory).forEach(([showId, item]) => {
    if (!item.completed && item.progressPercent > 0 && item.progressPercent < 100) {
      const found = annotatedShows.find(s => s.id === showId);
      if (found) continueWatchingShows.push(found);
    }
  });

  if (continueWatchingShows.length > 0) {
    rows.push({
      id: 'continue-watching',
      title: 'Continue Watching for ' + profile.name.split(' ')[0],
      subtitle: 'Pick up right where your frame paused',
      shows: continueWatchingShows,
    });
  }

  // 2. Curated For You (Top Match scores)
  const topPicks = [...annotatedShows].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  rows.push({
    id: 'top-picks',
    title: 'Top Picks For You',
    subtitle: `Recommended based on your interest in ${profile.preferredGenres.slice(0, 2).join(' & ')}`,
    shows: topPicks,
  });

  // 3. Trending Now (views & comments)
  const trending = [...annotatedShows].sort((a, b) => (b.viewsCount + b.reviews.length * 1000) - (a.viewsCount + a.reviews.length * 1000));
  rows.push({
    id: 'trending-now',
    title: 'Trending Now on FlipFlix',
    subtitle: 'Original animated pilots buzzing with community discussions',
    shows: trending,
  });

  // 4. "Because you watched..." (based on most recent watched show)
  const lastWatchedItem = Object.values(profile.watchHistory).sort(
    (a, b) => new Date(b.lastWatchedAt).getTime() - new Date(a.lastWatchedAt).getTime()
  )[0];

  if (lastWatchedItem) {
    const lastShow = annotatedShows.find(s => s.id === lastWatchedItem.showId);
    if (lastShow) {
      const similarShows = annotatedShows.filter(
        s => s.id !== lastShow.id && s.genres.some(g => lastShow.genres.includes(g))
      );
      if (similarShows.length > 0) {
        rows.push({
          id: 'because-you-watched',
          title: `Because You Watched ${lastShow.title}`,
          subtitle: `Hand-drawn animation with similar genre DNA: ${lastShow.genres.slice(0, 2).join(', ')}`,
          shows: similarShows,
        });
      }
    }
  }

  // 5. Genre-specific rows
  const genresToFeature: Genre[] = ['Cyberpunk', 'Comedy', 'Fantasy', 'Action', 'Sci-Fi'];
  genresToFeature.forEach(genre => {
    const genreShows = annotatedShows.filter(s => s.genres.includes(genre));
    if (genreShows.length > 0) {
      rows.push({
        id: `genre-${genre.toLowerCase()}`,
        title: `${genre} Spotlight`,
        shows: genreShows,
      });
    }
  });

  // 6. Community Critical Acclaim
  const topRated = [...annotatedShows].filter(s => {
    if (s.reviews.length === 0) return false;
    const avg = s.reviews.reduce((acc, r) => acc + r.rating, 0) / s.reviews.length;
    return avg >= 4.5;
  });
  if (topRated.length > 0) {
    rows.push({
      id: 'critically-acclaimed',
      title: 'Critically Acclaimed Originals',
      subtitle: 'Highest rated shows by community animation reviewers',
      shows: topRated,
    });
  }

  return rows;
}
