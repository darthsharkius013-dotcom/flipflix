import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Show, UserProfile } from '../types';
import { ShowCard } from './ShowCard';

interface ShowRowProps {
  title: string;
  subtitle?: string;
  shows: Show[];
  profile: UserProfile;
  onPlayShow: (show: Show, episodeId?: string) => void;
  onOpenDetails: (show: Show) => void;
  onToggleWatchlist: (showId: string) => void;
  onToggleLike: (showId: string) => void;
}

export const ShowRow: React.FC<ShowRowProps> = ({
  title,
  subtitle,
  shows,
  profile,
  onPlayShow,
  onOpenDetails,
  onToggleWatchlist,
  onToggleLike,
}) => {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleScroll = () => {
    if (!rowRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
    setShowLeftArrow(scrollLeft > 20);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!rowRef.current) return;
    const scrollAmount = rowRef.current.clientWidth * 0.75;
    rowRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (!shows || shows.length === 0) return null;

  return (
    <div className="relative group/row flex flex-col gap-2.5 my-5">
      {/* Row Header */}
      <div className="flex items-baseline justify-between px-4 md:px-12">
        <div>
          <h2 className="text-lg md:text-xl font-black text-white tracking-wide flex items-center gap-2">
            <span>{title}</span>
          </h2>
          {subtitle && (
            <p className="text-xs text-neutral-400 mt-0.5">{subtitle}</p>
          )}
        </div>
        <span className="text-xs text-neutral-500 font-mono">
          {shows.length} {shows.length === 1 ? 'Title' : 'Titles'}
        </span>
      </div>

      {/* Carousel Track Wrapper */}
      <div className="relative">
        {/* Left Scroll Button */}
        {showLeftArrow && (
          <button
            type="button"
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-30 w-10 md:w-14 bg-black/70 hover:bg-black/90 text-white flex items-center justify-center transition-opacity opacity-0 group-hover/row:opacity-100"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
        )}

        {/* Scrollable Container */}
        <div
          ref={rowRef}
          onScroll={handleScroll}
          className="flex items-center gap-4 overflow-x-auto px-4 md:px-12 py-4 no-scrollbar scroll-smooth"
        >
          {shows.map((show) => (
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

        {/* Right Scroll Button */}
        {showRightArrow && (
          <button
            type="button"
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-30 w-10 md:w-14 bg-black/70 hover:bg-black/90 text-white flex items-center justify-center transition-opacity opacity-0 group-hover/row:opacity-100"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        )}
      </div>
    </div>
  );
};
