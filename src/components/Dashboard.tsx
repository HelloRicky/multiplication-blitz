import { useState } from 'react';
import { GameMode, Avatar } from '../types';
import { Play, Sparkles, Zap, Shield, HelpCircle, Check, BookOpen } from 'lucide-react';
import { playPop, playFanfare } from '../utils/audio';

interface DashboardProps {
  currentMascot: Avatar;
  onStartGame: (selectedNumbers: number[], mode: GameMode) => void;
}

export function Dashboard({ currentMascot, onStartGame }: DashboardProps) {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([1, 2, 3, 4, 5, 10]); // Fun friendly default set
  const [selectedMode, setSelectedMode] = useState<GameMode>('sprint');

  const toggleNumber = (num: number) => {
    playPop();
    if (selectedNumbers.includes(num)) {
      // Keep at least one number selected
      if (selectedNumbers.length > 1) {
        setSelectedNumbers(selectedNumbers.filter((n) => n !== num));
      }
    } else {
      setSelectedNumbers([...selectedNumbers, num].sort((a, b) => a - b));
    }
  };

  const handleSelectAll = (action: 'all' | 'easy' | 'hard' | 'clear') => {
    playPop();
    if (action === 'all') {
      setSelectedNumbers([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    } else if (action === 'easy') {
      setSelectedNumbers([0, 1, 2, 5, 10]);
    } else if (action === 'hard') {
      setSelectedNumbers([6, 7, 8, 9, 11, 12]);
    } else {
      setSelectedNumbers([5]); // Always keep at least 5 as placeholder
    }
  };

  const handleModeChange = (mode: GameMode) => {
    playPop();
    setSelectedMode(mode);
  };

  const handleStart = () => {
    playFanfare();
    onStartGame(selectedNumbers, selectedMode);
  };

  return (
    <div id="game-dashboard" className="bg-white text-slate-850 rounded-[32px] md:rounded-[40px] border-b-[8px] border-b-[#E5E7EB] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.35)] p-4 md:p-6 relative">
      <div className="absolute top-2.5 right-2.5">
        <span className="text-2xl animate-bounce inline-block">🎈</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 items-center mb-5">
        <div className="text-left">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-[#4F46E5] font-black text-[10px] tracking-widest uppercase mb-2 border-2 border-indigo-100">
          <Sparkles className="w-3.5 h-3.5" /> FOR THE MATH SUPERSTARS
        </span>
          <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight leading-none">
          Sprint 20 is ready ⚡
        </h2>
          <p className="text-slate-600 font-extrabold text-sm mt-2">
          Default mode is <strong>Sprint 20</strong>. Pick tables if needed, then start straight away.
        </p>
        </div>

        <div className="lg:min-w-[280px]">
          <button
            id="start-speed-game-btn-top"
            onClick={handleStart}
            type="button"
            className="w-full py-4 px-6 bg-[#EF4444] hover:brightness-105 hover:scale-[1.01] text-white text-lg font-black rounded-2xl shadow-xl border-b-[7px] border-red-700 active:scale-95 transition-all text-center flex items-center justify-center gap-2 group uppercase tracking-widest cursor-pointer select-none"
          >
            <Play className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
            <span>START SPEED TEST!</span>
          </button>
          <p className="text-center text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wider">
            Ready: {selectedNumbers.length} tables • Mode: Sprint 20
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Side: Interactive Table Customizer */}
        <div className="lg:col-span-8 space-y-5">
          <div>
            <div className="flex flex-wrap justify-between items-center gap-3 mb-3">
              <label className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#4F46E5]" />
                <span>1. Select Multiplication Tables (0 - 12)</span>
              </label>
            </div>

            {/* Grid of giant bouncy bubble numbers */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => {
                const isSelected = selectedNumbers.includes(num);
                return (
                  <button
                    id={`table-num-btn-${num}`}
                    key={num}
                    onClick={() => toggleNumber(num)}
                    type="button"
                    className={`h-14 font-black text-xl rounded-2xl border-2 flex items-center justify-center transition-all duration-150 relative cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-amber-400 border-amber-500 border-b-[6px] text-slate-900 shadow-md font-extrabold scale-[1.03]'
                        : 'bg-slate-50 border-slate-200 border-b-[4px] text-slate-500 hover:border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {num}
                    {isSelected && (
                      <span className="absolute top-1 right-1 text-[8px] leading-none bg-amber-500 text-white rounded-full p-0.5">
                        <Check className="w-2 h-2" strokeWidth={4} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-2 mt-4 justify-end">
              <button
                id="preset-all-btn"
                onClick={() => handleSelectAll('all')}
                type="button"
                className="px-3.5 py-2 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 font-black rounded-xl border border-slate-300 border-b-[3px] transition-all cursor-pointer"
              >
                All Tables
              </button>
              <button
                id="preset-easy-btn"
                onClick={() => handleSelectAll('easy')}
                type="button"
                className="px-3.5 py-2 text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-black rounded-xl border border-emerald-300 border-b-[3px] transition-all cursor-pointer"
              >
                Easy set (0, 1, 2, 5, 10)
              </button>
              <button
                id="preset-hard-btn"
                onClick={() => handleSelectAll('hard')}
                type="button"
                className="px-3.5 py-2 text-xs bg-rose-100 hover:bg-rose-200 text-rose-800 font-black rounded-xl border border-rose-300 border-b-[3px] transition-all cursor-pointer"
              >
                Hard tables (6-12)
              </button>
            </div>
          </div>

          {/* Interactive Mode Selector */}
          <div>
            <label className="text-xs font-black text-indigo-600 uppercase tracking-widest block mb-3">
              2. Choose Your Speed Test Engine Mode
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* TIME ATTACK */}
              <button
                id="mode-time-attack-btn"
                type="button"
                onClick={() => handleModeChange('time-attack')}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer relative ${
                  selectedMode === 'time-attack'
                    ? 'border-[#4F46E5] bg-indigo-50/50 -translate-y-0.5 border-b-[6px]'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 border-b-[4px]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-amber-100 text-amber-600 leading-none">
                    <Zap className="w-5 h-5 fill-amber-500" />
                  </span>
                  <span className="font-black text-sm text-slate-800">Time Attack</span>
                </div>
                <p className="text-xs text-slate-600 font-bold mt-2.5 leading-relaxed">
                  <strong>60 seconds</strong> on clock! Every hit adds <strong>+2s</strong>. High streak boosts scores.
                </p>
                {selectedMode === 'time-attack' && (
                  <span className="absolute top-2 right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                )}
              </button>

              {/* SPRINT SPEED CHALLENGE */}
              <button
                id="mode-sprint-btn"
                type="button"
                onClick={() => handleModeChange('sprint')}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer relative ${
                  selectedMode === 'sprint'
                    ? 'border-[#4F46E5] bg-indigo-50/50 -translate-y-0.5 border-b-[6px]'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 border-b-[4px]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-sky-100 text-sky-600 leading-none">
                    <Sparkles className="w-5 h-5 fill-sky-500" />
                  </span>
                  <span className="font-black text-sm text-slate-800">Sprint 20</span>
                </div>
                <p className="text-xs text-slate-600 font-bold mt-2.5 leading-relaxed">
                  Solve exactly <strong>20 multiplication cards</strong> as fast as physical fingers allow!
                </p>
              </button>

              {/* SURVIVAL */}
              <button
                id="mode-survival-btn"
                type="button"
                onClick={() => handleModeChange('survival')}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer relative ${
                  selectedMode === 'survival'
                    ? 'border-[#4F46E5] bg-indigo-50/50 -translate-y-0.5 border-b-[6px]'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 border-[#E2E8F0] border-b-[4px]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-rose-100 text-rose-500 leading-none">
                    <Shield className="w-5 h-5 fill-rose-500" />
                  </span>
                  <span className="font-black text-sm text-slate-800">Survival Trial</span>
                </div>
                <p className="text-xs text-slate-600 font-bold mt-2.5 leading-relaxed">
                  Starts with <strong>3 hearts</strong>. Shrinking timers. Answer before the time runs out!
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Companion Guide Panel & Start Trigger */}
        <div className="lg:col-span-4 h-full flex flex-col justify-between gap-4 bg-slate-50 rounded-3xl p-4 border-2 border-slate-200 border-b-[6px]">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-3xl animate-pulse">{currentMascot.emoji}</span>
              <div>
                <h4 className="text-base font-black text-slate-800">Mascot Partner</h4>
                <p className="text-xs text-indigo-600 font-extrabold">{currentMascot.name} wishes you luck!</p>
              </div>
            </div>

            <div className="mt-3 space-y-2 bg-white p-3 rounded-2xl border-2 border-slate-200 text-xs text-slate-750 font-medium">
              <p className="font-black text-slate-800 mb-1 flex items-center gap-1">
                <span>💡 Superhero Math Rules:</span>
              </p>
              <ul className="list-disc pl-4 space-y-1.5">
                <li>Look at the math factors carefully to avoid accidental typos!</li>
                <li>Tap the colorful screen buttons with correct calculated value.</li>
                <li>Train difficult tables (e.g. 7, 8, 12) to earn higher multiplier pts!</li>
              </ul>
            </div>
          </div>

          <div className="mt-2">
            <button
              id="start-speed-game-btn"
              onClick={handleStart}
              type="button"
              className="w-full py-5 px-6 bg-[#EF4444] hover:brightness-105 hover:scale-[1.01] text-white text-xl font-black rounded-3xl shadow-xl border-b-[8px] border-red-700 active:scale-95 transition-all text-center flex items-center justify-center gap-2 group uppercase tracking-widest cursor-pointer select-none"
            >
              <Play className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
              <span>START SPEED TEST!</span>
            </button>
            <p className="text-center text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wider">
              Ready: {selectedNumbers.length} tables • Mode: {selectedMode}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
