import React, { useState } from 'react';
import {
  Star,
  ThumbsUp,
  MessageSquare,
  AlertTriangle,
  Send,
  Sparkles,
  Clock,
  Eye,
  Check,
} from 'lucide-react';
import { Show, Review, EpisodeComment, UserProfile } from '../types';

interface ReviewsAndCommentsProps {
  show: Show;
  profile: UserProfile;
  selectedEpisodeId: string;
  onSelectEpisode: (episodeId: string) => void;
  onAddReview: (showId: string, review: Review) => void;
  onAddComment: (comment: EpisodeComment) => void;
  onJumpToFrame?: (episodeId: string, frameIndex: number) => void;
}

export const ReviewsAndComments: React.FC<ReviewsAndCommentsProps> = ({
  show,
  profile,
  selectedEpisodeId,
  onSelectEpisode,
  onAddReview,
  onAddComment,
  onJumpToFrame,
}) => {
  const [activeTab, setActiveTab] = useState<'reviews' | 'discussion'>('reviews');

  // Review Form State
  const [newRating, setNewRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewTitle, setReviewTitle] = useState<string>('');
  const [reviewContent, setReviewContent] = useState<string>('');
  const [hasSpoilers, setHasSpoilers] = useState<boolean>(false);
  const [showReviewForm, setShowReviewForm] = useState<boolean>(false);

  // Episode Discussion Form State
  const [commentText, setCommentText] = useState<string>('');
  const [attachTimestamp, setAttachTimestamp] = useState<boolean>(true);
  const [revealedSpoilers, setRevealedSpoilers] = useState<Record<string, boolean>>({});

  // Helpful votes local tracking
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, number>>({});
  const [votedHelpful, setVotedHelpful] = useState<Record<string, boolean>>({});

  // Comment likes local tracking
  const [commentLikes, setCommentLikes] = useState<Record<string, number>>({});
  const [votedComments, setVotedComments] = useState<Record<string, boolean>>({});

  // Average Rating
  const avgRating =
    show.reviews.length > 0
      ? (show.reviews.reduce((acc, r) => acc + r.rating, 0) / show.reviews.length).toFixed(1)
      : '5.0';

  const currentEpisode = show.episodes.find((e) => e.id === selectedEpisodeId) || show.episodes[0];
  const episodeComments = show.comments.filter((c) => c.episodeId === currentEpisode?.id);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewContent.trim()) return;

    const review: Review = {
      id: `rev-${Date.now()}`,
      showId: show.id,
      userId: profile.id,
      userName: profile.name,
      userAvatar: profile.avatar,
      rating: newRating,
      title: reviewTitle.trim() || 'Impressive Animation!',
      content: reviewContent.trim(),
      hasSpoilers,
      helpfulCount: 0,
      createdAt: new Date().toISOString(),
    };

    onAddReview(show.id, review);
    setReviewTitle('');
    setReviewContent('');
    setShowReviewForm(false);
  };

  const handleVoteHelpful = (reviewId: string, currentCount: number) => {
    if (votedHelpful[reviewId]) return;
    setVotedHelpful((prev) => ({ ...prev, [reviewId]: true }));
    setHelpfulVotes((prev) => ({
      ...prev,
      [reviewId]: (prev[reviewId] ?? currentCount) + 1,
    }));
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !currentEpisode) return;

    const comment: EpisodeComment = {
      id: `comm-${Date.now()}`,
      episodeId: currentEpisode.id,
      showId: show.id,
      userId: profile.id,
      userName: profile.name,
      userAvatar: profile.avatar,
      text: commentText.trim(),
      likes: 0,
      frameIndex: attachTimestamp ? 3 : undefined,
      timestampSeconds: attachTimestamp ? 0.5 : undefined,
      createdAt: new Date().toISOString(),
    };

    onAddComment(comment);
    setCommentText('');
  };

  const handleLikeComment = (commentId: string, currentCount: number) => {
    if (votedComments[commentId]) return;
    setVotedComments((prev) => ({ ...prev, [commentId]: true }));
    setCommentLikes((prev) => ({
      ...prev,
      [commentId]: (prev[commentId] ?? currentCount) + 1,
    }));
  };

  return (
    <div className="flex flex-col gap-5 pt-4 border-t border-neutral-800">
      {/* Tab Switcher */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`flex items-center gap-2 pb-2 px-1 text-sm font-bold transition-all relative ${
              activeTab === 'reviews'
                ? 'text-white border-b-2 border-red-600'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Star className="w-4 h-4 text-amber-400 fill-current" />
            <span>Reviews ({show.reviews.length})</span>
            <span className="bg-neutral-800 text-amber-300 px-2 py-0.5 rounded-full text-xs font-mono">
              {avgRating} ★
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('discussion')}
            className={`flex items-center gap-2 pb-2 px-1 text-sm font-bold transition-all relative ${
              activeTab === 'discussion'
                ? 'text-white border-b-2 border-red-600'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            <span>Episode Discussions</span>
            <span className="bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded-full text-xs font-mono">
              {show.comments.length}
            </span>
          </button>
        </div>

        {activeTab === 'reviews' && (
          <button
            type="button"
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="text-xs bg-red-600 hover:bg-red-500 text-white font-bold px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-red-600/30"
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>Write a Review</span>
          </button>
        )}
      </div>

      {/* REVIEWS TAB CONTENT */}
      {activeTab === 'reviews' && (
        <div className="flex flex-col gap-4">
          {/* Write Review Form */}
          {showReviewForm && (
            <form
              onSubmit={handleSubmitReview}
              className="bg-[#1b1b24] p-4 rounded-xl border border-neutral-700/80 flex flex-col gap-3 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-sm">Rate & Review "{show.title}"</h4>
                {/* Star Picker */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setNewRating(star)}
                      className="p-1 focus:outline-none transition-transform hover:scale-125"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          (hoverRating || newRating) >= star
                            ? 'text-amber-400 fill-current'
                            : 'text-neutral-600'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-amber-400 ml-1.5">{newRating}/5 Stars</span>
                </div>
              </div>

              <input
                type="text"
                placeholder="Headline (e.g. Incredible animation and rhythm!)"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
              />

              <textarea
                placeholder="What did you think of the frame-by-frame animation, timing, character design, and atmosphere?"
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                rows={3}
                className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 resize-none"
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-neutral-400 cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={hasSpoilers}
                    onChange={(e) => setHasSpoilers(e.target.checked)}
                    className="accent-red-600 rounded"
                  />
                  <span>This review contains plot spoilers</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors shadow-md shadow-red-600/30"
                  >
                    Post Review
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Reviews List */}
          <div className="flex flex-col gap-3">
            {show.reviews.length === 0 ? (
              <div className="text-center py-8 text-neutral-500 text-sm">
                No reviews yet. Be the first animator or fan to review this show!
              </div>
            ) : (
              show.reviews.map((rev) => {
                const isRevealed = revealedSpoilers[rev.id];
                const votes = helpfulVotes[rev.id] ?? rev.helpfulCount;
                const hasVoted = votedHelpful[rev.id];

                return (
                  <div
                    key={rev.id}
                    className="bg-neutral-900/60 p-4 rounded-xl border border-neutral-800/80 flex flex-col gap-2.5 transition-colors hover:border-neutral-700"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-sm border border-neutral-700">
                          {rev.userAvatar || '👤'}
                        </div>
                        <div>
                          <div className="font-semibold text-white text-xs flex items-center gap-2">
                            <span>{rev.userName}</span>
                            {rev.hasSpoilers && (
                              <span className="bg-amber-950/80 text-amber-400 border border-amber-600/40 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 font-mono">
                                <AlertTriangle className="w-2.5 h-2.5" /> Spoiler
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-neutral-500">
                            {new Date(rev.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= rev.rating ? 'text-amber-400 fill-current' : 'text-neutral-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <h5 className="font-bold text-neutral-100 text-sm">{rev.title}</h5>

                    {/* Content (with spoiler blur shield) */}
                    {rev.hasSpoilers && !isRevealed ? (
                      <div className="bg-neutral-950/80 border border-neutral-800 p-3 rounded-lg flex items-center justify-between">
                        <span className="text-xs text-neutral-400 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          Contains story spoilers
                        </span>
                        <button
                          type="button"
                          onClick={() => setRevealedSpoilers((p) => ({ ...p, [rev.id]: true }))}
                          className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> Reveal
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-neutral-300 leading-relaxed">{rev.content}</p>
                    )}

                    {/* Helpful Vote Button */}
                    <div className="flex items-center gap-3 pt-1 text-[11px] text-neutral-400">
                      <button
                        type="button"
                        onClick={() => handleVoteHelpful(rev.id, rev.helpfulCount)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
                          hasVoted
                            ? 'bg-green-950/60 text-green-400 border border-green-600/40'
                            : 'hover:bg-neutral-800 hover:text-white'
                        }`}
                      >
                        <ThumbsUp className="w-3 h-3" />
                        <span>Helpful ({votes})</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* EPISODE DISCUSSION THREADS CONTENT */}
      {activeTab === 'discussion' && (
        <div className="flex flex-col gap-4">
          {/* Episode Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {show.episodes.map((ep) => (
              <button
                key={ep.id}
                type="button"
                onClick={() => onSelectEpisode(ep.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  ep.id === currentEpisode?.id
                    ? 'bg-neutral-800 border-red-500 text-white shadow'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                E{ep.episodeNumber}: {ep.title}
              </button>
            ))}
          </div>

          {/* Comment submission form */}
          <form
            onSubmit={handleSubmitComment}
            className="flex flex-col gap-2 bg-[#1b1b24] p-3 rounded-xl border border-neutral-800"
          >
            <div className="flex items-center gap-2 text-xs text-neutral-300">
              <span className="font-semibold text-white">Discussing:</span>
              <span className="text-red-400">
                Episode {currentEpisode?.episodeNumber}: {currentEpisode?.title}
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Leave an animation commentary or favorite scene thought..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
              />
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2 rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-red-600/30"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-neutral-400">
              <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={attachTimestamp}
                  onChange={(e) => setAttachTimestamp(e.target.checked)}
                  className="accent-red-600 rounded"
                />
                <Clock className="w-3 h-3 text-cyan-400" />
                <span>Tag with keyframe stamp</span>
              </label>
            </div>
          </form>

          {/* Episode Comments List */}
          <div className="flex flex-col gap-2.5">
            {episodeComments.length === 0 ? (
              <div className="text-center py-6 text-neutral-500 text-xs">
                No comments on this episode yet. Start the thread!
              </div>
            ) : (
              episodeComments.map((comm) => {
                const likes = commentLikes[comm.id] ?? comm.likes;
                const hasLiked = votedComments[comm.id];

                return (
                  <div
                    key={comm.id}
                    className="bg-neutral-900/50 p-3 rounded-xl border border-neutral-800/80 flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{comm.userAvatar || '💬'}</span>
                        <span className="font-semibold text-white text-xs">{comm.userName}</span>
                        {comm.frameIndex !== undefined && (
                          <button
                            type="button"
                            onClick={() => onJumpToFrame && onJumpToFrame(comm.episodeId, comm.frameIndex!)}
                            className="bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono px-1.5 py-0.5 rounded hover:bg-cyan-900 transition-colors"
                            title="Jump to this frame in player"
                          >
                            Frame #{comm.frameIndex + 1}
                          </button>
                        )}
                      </div>
                      <span className="text-[10px] text-neutral-500">
                        {new Date(comm.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-200 leading-relaxed pl-6">{comm.text}</p>

                    <div className="flex items-center gap-3 pl-6 pt-1 text-[11px] text-neutral-400">
                      <button
                        type="button"
                        onClick={() => handleLikeComment(comm.id, comm.likes)}
                        className={`flex items-center gap-1 hover:text-white transition-colors ${
                          hasLiked ? 'text-red-400 font-bold' : ''
                        }`}
                      >
                        <ThumbsUp className="w-2.5 h-2.5" />
                        <span>{likes}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
