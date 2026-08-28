import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeTone?: 'gold' | 'forest' | 'navy' | 'lotus';
  children: React.ReactNode;
  width?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  badgeTone = 'forest',
  children,
  width = 'max-w-xl',
}) => {
  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const badgeClasses = {
    gold: 'bg-gold-50 text-gold-800 border-gold-300',
    forest: 'bg-forest-50 text-forest-900 border-forest-200',
    navy: 'bg-navy-50 text-navy-800 border-navy-200',
    lotus: 'bg-lotus-50 text-lotus-800 border-lotus-200',
  }[badgeTone];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-forest-950/40 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className={`relative z-10 w-full ${width} bg-ivory-100 border-l border-ivory-400 shadow-2xl flex flex-col h-full overflow-hidden`}
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-ivory-300 bg-white/80 backdrop-blur-md flex items-center justify-between">
              <div>
                {badge && (
                  <span className={`inline-block px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border mb-1.5 ${badgeClasses}`}>
                    {badge}
                  </span>
                )}
                <h2 className="text-xl font-serif font-semibold text-forest-900 leading-tight">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-xs text-forest-600 mt-0.5">{subtitle}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-forest-700 hover:text-forest-950 hover:bg-ivory-200 transition-colors"
                aria-label="Close panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {children}
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};
