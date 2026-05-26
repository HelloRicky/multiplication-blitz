import { motion, AnimatePresence } from 'motion/react';
import { Achievement } from '../types';
import { playPop } from '../utils/audio';

interface BadgePopupProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export function BadgePopup({ achievement, onClose }: BadgePopupProps) {
  return (
    <AnimatePresence>
      {achievement && (
        <div id="badge-popup-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            id="badge-popup-card"
            initial={{ scale: 0.8, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: -50, opacity: 0 }}
            transition={{ type: 'spring', damping: 15 }}
            className="w-full max-w-sm overflow-hidden text-center bg-white rounded-3xl border-4 border-amber-300 shadow-2xl animate-cute-glow"
          >
            {/* Playful Banner Header */}
            <div className={`p-6 bg-gradient-to-r ${achievement.color} text-white relative`}>
              <div className="absolute top-2 right-2 flex gap-1">
                <span className="text-sm opacity-60">⭐</span>
              </div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-amber-200">New Sticker Unlocked!</p>
              <h3 className="mt-1 text-2xl font-black">{achievement.title}</h3>
            </div>

            {/* Badge Central Image */}
            <div className="p-8 flex flex-col items-center">
              <motion.div
                initial={{ rotate: -15, scale: 0.5 }}
                animate={{ rotate: 10, scale: 1.2 }}
                transition={{ type: 'spring', delay: 0.15, stiffness: 180 }}
                className="w-32 h-32 rounded-full bg-amber-50 flex items-center justify-center text-7xl border-4 border-dashed border-amber-400 mb-6 relative hover:rotate-12 transition-transform duration-300"
              >
                {achievement.emoji}
                <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-white rounded-full p-1.5 shadow-md border-2 border-white text-base">
                  🏆
                </div>
              </motion.div>

              <blockquote className="px-4 text-slate-600 font-medium text-base italic leading-relaxed">
                "{achievement.description}"
              </blockquote>

              <div className="w-full h-px bg-slate-100 my-5" />

              <div className="bg-slate-50 border border-slate-100 rounded-2xl py-2 px-4 inline-block">
                <p className="text-xs text-slate-500 font-semibold mb-0.5">How you earned it:</p>
                <p className="text-sm font-bold text-indigo-600">{achievement.conditionDescription}</p>
              </div>

              <motion.button
                id="badge-popup-dismiss-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  playPop();
                  onClose();
                }}
                className="w-full mt-6 py-3 px-6 bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-black rounded-2xl shadow-lg shadow-emerald-200 hover:brightness-105 transition-all text-base cursor-pointer"
              >
                Awesome! Put in Binder
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
