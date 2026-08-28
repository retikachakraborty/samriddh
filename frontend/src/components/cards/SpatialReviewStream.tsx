import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  CheckCircle2,
  ThumbsUp,
  Package,
  Truck,
  DollarSign,
  Headphones,
  Maximize2,
  Sparkles,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react';
import type { Review } from '../../types/api';
import { LotusLogo } from '../ui/LotusLogo';

interface SpatialReviewStreamProps {
  reviews: Review[];
  onSelectReview?: (review: Review) => void;
}

interface FloatingCardState {
  id: string;
  review: Review;
  slot: number; // 0 to 3
}

export const SpatialReviewStream: React.FC<SpatialReviewStreamProps> = ({
  reviews,
  onSelectReview,
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [activeCards, setActiveCards] = useState<FloatingCardState[]>([]);
  const [nextReviewIdx, setNextReviewIdx] = useState(0);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
  }, []);

  // Initialize slots with first reviews
  useEffect(() => {
    if (!reviews || reviews.length === 0) return;
    const initial: FloatingCardState[] = [0, 1, 2].map((slot) => ({
      id: `slot_${slot}_${Date.now()}_${Math.random()}`,
      review: reviews[slot % reviews.length],
      slot,
    }));
    setActiveCards(initial);
    setNextReviewIdx(3 % reviews.length);
  }, [reviews]);

  // Interval to replace one card at a time with fluid spatial entry
  useEffect(() => {
    if (isPaused || prefersReducedMotion || !reviews || reviews.length === 0) return;

    const interval = setInterval(() => {
      setActiveCards((prev) => {
        if (prev.length === 0) return prev;
        // Randomly pick a slot to cycle
        const slotToReplace = Math.floor(Math.random() * 3);
        const newCard: FloatingCardState = {
          id: `slot_${slotToReplace}_${Date.now()}_${Math.random()}`,
          review: reviews[nextReviewIdx % reviews.length],
          slot: slotToReplace,
        };
        return prev.map((c) => (c.slot === slotToReplace ? newCard : c));
      });
      setNextReviewIdx((prev) => (prev + 1) % reviews.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [isPaused, prefersReducedMotion, reviews, nextReviewIdx]);

  if (!reviews || reviews.length === 0) {
    return (
      <div className="h-96 w-full rounded-2xl bg-ivory-200/50 border border-ivory-300 flex items-center justify-center p-8 text-forest-600 animate-pulse">
        <p className="text-sm">Connecting to Voice of Customer stream...</p>
      </div>
    );
  }

  // Spatial positions & paths for the 3 visual lanes/zones
  const slotConfigs = [
    {
      initial: { opacity: 0, x: 80, y: -20, rotate: 3, scale: 0.92 },
      animate: { opacity: 1, x: 0, y: 0, rotate: -1.5, scale: 1 },
      exit: { opacity: 0, x: -80, y: 20, rotate: -4, scale: 0.94 },
      laneStyle: 'lg:col-span-4 lg:translate-y-2',
      glow: 'from-gold-50/50 to-ivory-50/80 border-gold-200/60',
    },
    {
      initial: { opacity: 0, y: 60, scale: 0.9, rotate: -3 },
      animate: { opacity: 1, y: 0, scale: 1.02, rotate: 1 },
      exit: { opacity: 0, y: -60, scale: 0.92, rotate: 3 },
      laneStyle: 'lg:col-span-4 lg:-translate-y-3 z-10',
      glow: 'from-lotus-50/50 to-ivory-50/90 border-lotus-200/80 shadow-luxury-lg',
    },
    {
      initial: { opacity: 0, x: -80, y: 30, rotate: -2, scale: 0.94 },
      animate: { opacity: 1, x: 0, y: 0, rotate: 2, scale: 1 },
      exit: { opacity: 0, x: 80, y: -30, rotate: 4, scale: 0.92 },
      laneStyle: 'lg:col-span-4 lg:translate-y-4',
      glow: 'from-emerald-50/40 to-ivory-50/80 border-emerald-200/60',
    },
  ];

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    return (
      <div className="flex items-center gap-1 text-gold-500">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-3.5 h-3.5 ${
              i < fullStars ? 'fill-gold-500 text-gold-500' : 'text-ivory-300'
            }`}
          />
        ))}
        <span className="ml-1 text-xs font-serif font-bold text-forest-950">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  const getAspectPill = (name: string, status?: string, icon?: React.ReactNode) => {
    if (!status || status === 'neutral') return null;
    const isPos = status === 'positive';
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide border ${
          isPos
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}
      >
        {icon}
        <span>{name}</span>
        <span>{isPos ? '✓' : '✗'}</span>
      </span>
    );
  };

  const getReviewAspectSummary = (r: Review) => {
    const aspects: string[] = [];
    if (r.quality_aspect === 'positive') aspects.push('Quality exceeded expectations');
    if (r.quality_aspect === 'negative') aspects.push('Quality friction observed');
    if (r.shipping_aspect === 'positive') aspects.push('Fast transit & secure packaging');
    if (r.shipping_aspect === 'negative') aspects.push('Delivery transit delay reported');
    if (r.value_aspect === 'positive') aspects.push('Exceptional value for spend');
    if (r.value_aspect === 'negative') aspects.push('Price-to-value friction noted');
    if (r.service_aspect === 'positive') aspects.push('Seller communication was helpful');
    if (r.service_aspect === 'negative') aspects.push('Support response delay noted');

    if (aspects.length > 0) return aspects.join('. ') + '.';
    return `${r.sentiment === 'positive' ? 'Positive verified feedback recorded' : 'Negative customer friction observed'} in ${r.category || 'Retail'}.`;
  };

  return (
    <div
      className="relative w-full rounded-3xl bg-gradient-to-b from-ivory-100/90 via-white to-ivory-100/70 border border-ivory-300/80 p-6 sm:p-8 overflow-hidden shadow-luxury"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lotus-100 text-lotus-900 border border-lotus-200 text-[11px] font-semibold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-lotus-600" />
              Spatial Voice Stream
            </span>
            <span className="text-xs text-forest-600 font-mono">
              Continuous Database Flow (100,000 Signals)
            </span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-forest-950 mt-1">
            Dynamic Voice of Customer Flow
          </h2>
        </div>

        {/* Play / Pause Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-ivory-300 text-forest-800 text-xs font-semibold hover:bg-ivory-100 shadow-sm transition-all"
            aria-label={isPaused ? 'Resume stream' : 'Pause stream'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-700" /> : <Pause className="w-3.5 h-3.5 text-forest-600" />}
            <span>{isPaused ? 'Resume Stream' : 'Pause Stream'}</span>
          </button>
        </div>
      </div>

      {/* Spatial 3-Lane Stream Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 min-h-[320px]">
        {[0, 1, 2].map((slotIndex) => {
          const cardState = activeCards.find((c) => c.slot === slotIndex);
          const config = slotConfigs[slotIndex];

          return (
            <div key={slotIndex} className={`relative flex flex-col ${config.laneStyle}`}>
              <AnimatePresence mode="wait">
                {cardState && (
                  <motion.div
                    key={cardState.id}
                    initial={config.initial}
                    animate={config.animate}
                    exit={config.exit}
                    transition={{
                      duration: prefersReducedMotion ? 0.2 : 0.8,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    whileHover={{ scale: 1.03, y: -4, transition: { duration: 0.2 } }}
                    onClick={() => onSelectReview && onSelectReview(cardState.review)}
                    className={`group rounded-2xl bg-gradient-to-br ${config.glow} border p-6 backdrop-blur-sm cursor-pointer shadow-luxury hover:shadow-luxury-lg transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden`}
                  >
                    {/* Lotus Flower Card Watermark */}
                    <div className="absolute -right-4 -bottom-4 opacity-[0.14] group-hover:opacity-30 group-hover:scale-110 transition-all duration-500 pointer-events-none text-lotus-600">
                      <LotusLogo size={96} />
                    </div>

                    {/* Header */}
                    <div className="relative z-10">
                      <div className="flex items-start justify-between gap-2 border-b border-ivory-300/60 pb-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <LotusLogo size={16} className="w-4 h-4 text-lotus-500 shrink-0 group-hover:rotate-12 transition-transform duration-300" />
                            <span className="font-mono font-bold text-xs text-forest-950 uppercase tracking-tight">
                              Product {cardState.review.product_id}
                            </span>
                            {cardState.review.category && (
                              <span className="px-2 py-0.5 rounded bg-ivory-200 text-forest-800 text-[10px] font-semibold uppercase">
                                {cardState.review.category}
                              </span>
                            )}
                          </div>
                          {renderStars(cardState.review.star_rating)}
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              cardState.review.sentiment === 'positive'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : cardState.review.sentiment === 'negative'
                                ? 'bg-rose-50 text-rose-800 border-rose-200'
                                : 'bg-ivory-200 text-forest-800 border-ivory-300'
                            }`}
                          >
                            {cardState.review.sentiment}
                          </span>
                          {cardState.review.verified_purchase && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Verified
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quote Body */}
                      <blockquote className="text-sm font-serif italic text-forest-950 leading-relaxed min-h-[50px] line-clamp-3">
                        “{getReviewAspectSummary(cardState.review)}”
                      </blockquote>

                      {/* Aspects */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-3">
                        {getAspectPill('Quality', cardState.review.quality_aspect, <Package className="w-3 h-3" />)}
                        {getAspectPill('Shipping', cardState.review.shipping_aspect, <Truck className="w-3 h-3" />)}
                        {getAspectPill('Value', cardState.review.value_aspect, <DollarSign className="w-3 h-3" />)}
                        {getAspectPill('Service', cardState.review.service_aspect, <Headphones className="w-3 h-3" />)}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-4 pt-3 border-t border-ivory-300/60 flex items-center justify-between text-xs text-forest-600">
                      <span className="font-mono text-[11px]">
                        {cardState.review.review_date
                          ? new Date(cardState.review.review_date).toLocaleDateString()
                          : `${cardState.review.month}/${cardState.review.year}`}
                      </span>

                      <span className="inline-flex items-center gap-1 text-forest-800 group-hover:text-gold-700 font-semibold transition-colors">
                        <span>Inspect</span>
                        <Maximize2 className="w-3 h-3" />
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};
