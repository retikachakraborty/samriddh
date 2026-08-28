import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  CheckCircle2,
  ThumbsUp,
  ChevronLeft,
  ChevronRight,
  Package,
  Truck,
  DollarSign,
  Headphones,
  Maximize2,
  AlertCircle,
} from 'lucide-react';
import type { Review } from '../../types/api';
import { LotusLogo } from '../ui/LotusLogo';

interface StackedReviewCardsProps {
  reviews: Review[];
  onSelectReview?: (review: Review) => void;
}

export const StackedReviewCards: React.FC<StackedReviewCardsProps> = ({
  reviews,
  onSelectReview,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!reviews || reviews.length === 0) {
    return (
      <div className="h-96 w-full rounded-2xl bg-ivory-200/50 border border-ivory-300 flex items-center justify-center p-8 text-forest-600 animate-pulse">
        <p className="text-sm">Connecting to Voice of Customer stream...</p>
      </div>
    );
  }

  const activeReview = reviews[currentIndex % reviews.length];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  // Stack offsets for top 3 visible cards
  const getCardStyle = (offset: number) => {
    switch (offset) {
      case 0:
        return {
          scale: 1,
          y: 0,
          rotate: 0,
          zIndex: 30,
          opacity: 1,
          filter: 'drop-shadow(0 20px 30px rgba(15, 46, 38, 0.12))',
        };
      case 1:
        return {
          scale: 0.94,
          y: 20,
          rotate: -2.5,
          zIndex: 20,
          opacity: 0.85,
          filter: 'drop-shadow(0 10px 20px rgba(15, 46, 38, 0.08))',
        };
      case 2:
        return {
          scale: 0.88,
          y: 40,
          rotate: 3,
          zIndex: 10,
          opacity: 0.6,
          filter: 'drop-shadow(0 6px 14px rgba(15, 46, 38, 0.05))',
        };
      default:
        return {
          scale: 0.82,
          y: 60,
          rotate: 0,
          zIndex: 0,
          opacity: 0,
          filter: 'none',
        };
    }
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    return (
      <div className="flex items-center gap-1 text-gold-500">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < fullStars ? 'fill-gold-500 text-gold-500' : 'text-ivory-400'
            }`}
          />
        ))}
        <span className="ml-1 text-xs font-serif font-bold text-forest-900">
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
        <span>{isPos ? '✓ Positive' : '✗ Friction'}</span>
      </span>
    );
  };

  // Build aspect-grounded quote derived from the database row
  const getReviewAspectSummary = (r: Review) => {
    const aspects: string[] = [];
    if (r.quality_aspect === 'positive') aspects.push('Quality exceeded expectations');
    if (r.quality_aspect === 'negative') aspects.push('Quality issues observed');
    if (r.shipping_aspect === 'positive') aspects.push('Prompt delivery and secure packaging');
    if (r.shipping_aspect === 'negative') aspects.push('Delivery transit delay or packaging damage');
    if (r.value_aspect === 'positive') aspects.push('Excellent value for the price point');
    if (r.value_aspect === 'negative') aspects.push('Price does not match perceived value');
    if (r.service_aspect === 'positive') aspects.push('Support and seller service was helpful');
    if (r.service_aspect === 'negative') aspects.push('Service communication friction reported');

    if (aspects.length > 0) {
      return aspects.join('. ') + '.';
    }
    return `${r.sentiment === 'positive' ? 'Positive buyer feedback recorded' : 'Negative customer friction observed'} in category ${r.category || 'Retail'}.`;
  };

  return (
    <div className="relative w-full py-6">
      {/* Background Editorial Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-lotus-50/40 via-ivory-100/60 to-gold-50/40 rounded-3xl -z-10 border border-ivory-300/80" />

      {/* Header bar */}
      <div className="px-6 sm:px-8 flex items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-lotus-100 text-lotus-900 border border-lotus-200 text-[10px] font-semibold uppercase tracking-wider">
              Spatial Voice Stack
            </span>
            <span className="text-xs text-forest-600">
              Live Verified Reviews ({currentIndex + 1} of {reviews.length})
            </span>
          </div>
          <h3 className="text-xl font-serif font-bold text-forest-950 mt-1">
            Real Customer Expressions
          </h3>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="w-9 h-9 rounded-full bg-white border border-ivory-300 text-forest-800 hover:text-forest-950 hover:bg-ivory-100 shadow-sm flex items-center justify-center transition-all active:scale-95"
            aria-label="Previous customer voice"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="w-9 h-9 rounded-full bg-forest-900 border border-forest-800 text-white hover:bg-forest-800 shadow-md flex items-center justify-center transition-all active:scale-95"
            aria-label="Next customer voice"
          >
            <ChevronRight className="w-4 h-4 text-gold-300" />
          </button>
        </div>
      </div>

      {/* 3D Stack Viewport */}
      <div className="relative h-[370px] sm:h-[350px] w-full max-w-2xl mx-auto px-4 perspective-[1000px] flex items-center justify-center">
        {[2, 1, 0].map((offset) => {
          const itemIndex = (currentIndex + offset) % reviews.length;
          const review = reviews[itemIndex];
          const style = getCardStyle(offset);

          if (!review) return null;
          const isTop = offset === 0;

          return (
            <motion.div
              key={review.review_id || `${itemIndex}-${offset}`}
              layout
              style={{
                zIndex: style.zIndex,
                position: 'absolute',
                top: '5%',
                width: 'calc(100% - 2rem)',
              }}
              animate={{
                scale: style.scale,
                y: style.y,
                rotate: style.rotate,
                opacity: style.opacity,
              }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 24,
              }}
              drag={isTop ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.4}
              onDragEnd={(_, info) => {
                if (info.offset.x < -80) {
                  handleNext();
                } else if (info.offset.x > 80) {
                  handlePrev();
                }
              }}
              className={`rounded-2xl bg-white border border-ivory-300/90 p-6 sm:p-7 select-none transition-shadow relative overflow-hidden ${
                isTop ? 'cursor-grab active:cursor-grabbing shadow-luxury-lg' : 'cursor-pointer pointer-events-none'
              }`}
              onClick={() => {
                if (!isTop) {
                  setCurrentIndex(itemIndex);
                }
              }}
            >
              {/* Lotus Flower Card Watermark */}
              <div className="absolute -right-6 -bottom-6 opacity-15 text-lotus-500 pointer-events-none">
                <LotusLogo size={110} />
              </div>

              {/* Card Header */}
              <div className="relative z-10 flex items-start justify-between gap-3 border-b border-ivory-200/80 pb-3.5 mb-3.5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <LotusLogo size={18} className="w-4.5 h-4.5 text-lotus-500 shrink-0" />
                    <span className="text-xs font-mono font-bold text-forest-900 uppercase tracking-tight">
                      Product {review.product_id}
                    </span>
                    {review.category && (
                      <span className="px-2 py-0.5 rounded-md bg-ivory-200 text-forest-700 text-[10px] font-medium uppercase">
                        {review.category}
                      </span>
                    )}
                  </div>
                  {renderStars(review.star_rating)}
                </div>

                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1.5">
                    {review.verified_purchase && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Verified
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                        review.sentiment === 'positive'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : review.sentiment === 'negative'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : 'bg-ivory-200 text-forest-800 border-ivory-300'
                      }`}
                    >
                      {review.sentiment}
                    </span>
                  </div>

                  {review.emotion && (
                    <span className="text-[10px] text-lotus-700 font-medium italic">
                      Emotion: {review.emotion}
                    </span>
                  )}
                </div>
              </div>

              {/* Review Text Body */}
              <div className="space-y-3">
                <blockquote className="text-sm sm:text-base font-serif italic text-forest-950 leading-relaxed min-h-[55px] line-clamp-3">
                  “{getReviewAspectSummary(review)}”
                </blockquote>

                {/* Aspect Matrix Tags */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {getAspectPill('Quality', review.quality_aspect, <Package className="w-3 h-3" />)}
                  {getAspectPill('Shipping', review.shipping_aspect, <Truck className="w-3 h-3" />)}
                  {getAspectPill('Value', review.value_aspect, <DollarSign className="w-3 h-3" />)}
                  {getAspectPill('Service', review.service_aspect, <Headphones className="w-3 h-3" />)}
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-ivory-200/80 flex items-center justify-between text-xs text-forest-600">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px]">
                    {review.review_date ? new Date(review.review_date).toLocaleDateString() : `${review.month}/${review.year}`}
                  </span>
                  {review.helpful_votes !== undefined && review.total_votes !== undefined && (
                    <span className="flex items-center gap-1 text-gold-700 font-medium font-mono text-[11px]">
                      <ThumbsUp className="w-3 h-3 text-gold-600" />
                      {review.helpful_votes}/{review.total_votes} helpful
                    </span>
                  )}
                </div>

                {onSelectReview && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectReview(review);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-forest-900 hover:text-gold-700 transition-colors"
                  >
                    <span>Inspect</span>
                    <Maximize2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Navigation Dot Indicators */}
      <div className="flex items-center justify-center gap-1.5 mt-8">
        {reviews.slice(0, Math.min(8, reviews.length)).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === currentIndex % Math.min(8, reviews.length)
                ? 'w-6 bg-gold-500'
                : 'w-1.5 bg-ivory-400 hover:bg-forest-600'
            }`}
            aria-label={`Jump to review ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
