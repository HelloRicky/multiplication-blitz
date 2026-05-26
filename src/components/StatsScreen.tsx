import { ScoreEntry, Avatar } from '../types';
import { RefreshCw, Home, Sparkles, Award, CheckCircle, XCircle } from 'lucide-react';
import { playPop, playFanfare } from '../utils/audio';

interface StatsScreenProps {
  stats: {
    score: number;
    totalAnswered: number;
    correctCount: number;
    questionsReview: Array<{ num1: number; num2: number; given: number; correct: number; isCorrect: boolean }>;
  };
  mascot: Avatar;
  isNewHighscore: boolean;
  onRestart: () => void;
  onHome: () => void;
}

export function StatsScreen({
  stats,
  mascot,
  isNewHighscore,
  onRestart,
  onHome,
}: StatsScreenProps) {
  const { score, totalAnswered, correctCount, questionsReview } = stats;
  const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;

  // Praise categories
  let title = 'Awesome Math Effort! 🌟';
  let message = 'You answered so many questions! Multiplication takes a tiny bit of practice to master. Try again, I know you can get a super streak next time!';
  let reactionEmoji = '😊';

  if (accuracy === 100 && totalAnswered >= 10) {
    title = 'PERFECT SCORE! 👑';
    message = 'Incredible! You are a brilliant mathematician! A perfect game with lightning-fast speeds. You are ready to teach multiplication to space aliens!';
    reactionEmoji = '🤩';
  } else if (accuracy >= 90) {
    title = 'Superb Speed Reflexes! 🚀';
    message = 'Splendid speed run! Your multiplication reflexes are outstanding. Let\'s play once more to grab that 100% perfect badge!';
    reactionEmoji = '⚡';
  } else if (accuracy >= 70) {
    title = 'Fantastic Performance! 🎒';
    message = 'Great score! You have awesome foundational math muscles. Practice your slightly tougher tables a tiny bit more to become unbeatable!';
    reactionEmoji = '🎉';
  }

  const handleRestartClick = () => {
    playFanfare();
    onRestart();
  };

  const handleHomeClick = () => {
    playPop();
    onHome();
  };

  return (
    <div id="stats-summary-card" className="bg-white rounded-[48px] border-2 border-slate-200 border-b-[12px] border-b-[#E5E7EB] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.35)] overflow-hidden max-w-2xl mx-auto">
      {/* Playful Colorful Header Banner */}
      <div className="bg-[#4F46E5] p-8 text-center text-white relative">
        <div className="absolute top-2 left-2 text-xl">🎈</div>
        <div className="absolute top-2 right-2 text-xl">✨</div>

        <span className="text-4xl block mb-2">{reactionEmoji}</span>
        <h3 className="text-2xl sm:text-3.5xl font-black tracking-tight uppercase leading-none">{title}</h3>
        <p className="text-xs sm:text-sm font-extrabold text-indigo-100 mt-2.5 max-w-xl mx-auto leading-relaxed">
          {message}
        </p>

        {isNewHighscore && (
          <div className="mt-4 inline-flex items-center gap-2 bg-amber-400 text-slate-900 font-black text-xs uppercase px-4 py-2 border-2 border-white border-b-4 border-b-amber-600 shadow-md animate-bounce select-none">
            <Award className="w-4 h-4 text-slate-900 fill-yellow-255" /> NEW HIGH SCORE ACHIEVED!
          </div>
        )}
      </div>

      {/* Main Stats Grid */}
      <div className="p-6 md:p-8 space-y-6 text-slate-800">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 border-b-4 flex flex-col justify-center">
            <span className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">SCORE</span>
            <span className="text-3xl font-black text-indigo-700 mt-1 block">
              {score}
            </span>
          </div>

          <div className="text-center p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 border-b-4 flex flex-col justify-center">
            <span className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">ACCURACY</span>
            <span className={`text-3xl font-black mt-1 block ${
              accuracy >= 90 ? 'text-emerald-600' : accuracy >= 70 ? 'text-amber-600' : 'text-rose-500'
            }`}>
              {accuracy}%
            </span>
            <span className="text-[10px] text-slate-400 font-bold mt-1">
              {correctCount}/{totalAnswered} Correct
            </span>
          </div>

          <div className="text-center p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 border-b-4 flex flex-col justify-center">
            <span className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">PARTNER</span>
            <span className="text-3xl block mt-1 leading-none select-none">
              {mascot.emoji}
            </span>
            <span className="text-[9px] text-slate-400 font-bold block mt-1">
              {mascot.name}
            </span>
          </div>
        </div>

        {/* Dynamic educational feedback review */}
        {questionsReview.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>MATH CARD LEDGER (REVIEW)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {questionsReview.map((rev, index) => {
                const equation = `${rev.num1} × ${rev.num2} = ${rev.correct}`;

                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs border-2 font-bold ${
                      rev.isCorrect
                        ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800'
                        : 'bg-rose-50/50 border-rose-200 text-rose-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {rev.isCorrect ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                      )}
                      <span className="font-extrabold font-mono text-xs">{equation}</span>
                    </div>

                    {!rev.isCorrect && (
                      <span className="text-[10px] text-slate-500 font-extrabold font-mono">
                        Got: {rev.given === -1 ? 'Time-out' : rev.given}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom CTA Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t-2 border-slate-200">
          <button
            id="stats-lobby-home-btn"
            onClick={handleHomeClick}
            className="flex-1 py-3 px-5 border-2 border-slate-200 border-b-4 hover:bg-slate-100 text-slate-700 font-black rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Go to Game Lobby</span>
          </button>
          <button
            id="stats-play-again-btn"
            onClick={handleRestartClick}
            className="flex-1 py-3.5 px-6 bg-[#EF4444] text-white font-black rounded-xl text-xs border-b-4 border-red-700 hover:brightness-105 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span>PLAY AGAIN!</span>
          </button>
        </div>
      </div>
    </div>
  );
}
