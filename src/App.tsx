/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { GameMode, ScoreEntry, Achievement, ACHIEVEMENTS, Avatar, MASCOTS } from './types';
import { Sparkles, Trophy, Award, Trash2 } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { GameScreen } from './components/GameScreen';
import { StatsScreen } from './components/StatsScreen';
import { GameScoreBoard } from './components/GameScoreBoard';
import { AudioToggle } from './components/AudioToggle';
import { BadgePopup } from './components/BadgePopup';
import { ConfettiEffect } from './components/ConfettiEffect';
import { playPop, playUnlocksBadge } from './utils/audio';

export default function App() {
  // Navigation views
  const [view, setView] = useState<'lobby' | 'playing' | 'stats'>('lobby');

  // Player configurations
  const [currentName, setCurrentName] = useState<string>('Super Math Kid');
  const [currentAvatarId, setCurrentAvatarId] = useState<string>('1');

  // persistent ledger values
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);

  // Confetti burst countdown/trigger
  const [confettiTrigger, setConfettiTrigger] = useState(0);

  // Active game settings
  const [activeNumbers, setActiveNumbers] = useState<number[]>([1, 2, 3, 4, 5, 10]);
  const [activeMode, setActiveMode] = useState<GameMode>('sprint');

  // Game over stats results and new achievements state
  const [lastStats, setLastStats] = useState<{
    score: number;
    totalAnswered: number;
    correctCount: number;
    questionsReview: Array<{ num1: number; num2: number; given: number; correct: number; isCorrect: boolean }>;
  } | null>(null);

  const [isNewHighscore, setIsNewHighscore] = useState(false);
  const [newlyUnlockedBadge, setNewlyUnlockedBadge] = useState<Achievement | null>(null);

  const currentMascot = MASCOTS.find((m) => m.id === currentAvatarId) || MASCOTS[0];

  // 1. Load data from local storage on mount
  useEffect(() => {
    try {
      const savedScores = localStorage.getItem('multiplication-speed-scores');
      if (savedScores) setScores(JSON.parse(savedScores));

      const savedName = localStorage.getItem('multiplication-speed-name');
      if (savedName) setCurrentName(savedName);

      const savedAvatar = localStorage.getItem('multiplication-speed-avatar');
      if (savedAvatar) setCurrentAvatarId(savedAvatar);

      const savedBadges = localStorage.getItem('multiplication-speed-badges');
      if (savedBadges) setUnlockedBadges(JSON.parse(savedBadges));
    } catch (e) {
      console.error('Failed to load local settings:', e);
    }
  }, []);

  // 2. Clear Leaderboard score list
  const handleClearScores = () => {
    setScores([]);
    setUnlockedBadges([]);
    localStorage.removeItem('multiplication-speed-scores');
    localStorage.removeItem('multiplication-speed-badges');
  };

  // 3. Update player name & avatar profile helper
  const handleUpdateProfile = (name: string, avatarId: string) => {
    setCurrentName(name);
    setCurrentAvatarId(avatarId);
    localStorage.setItem('multiplication-speed-name', name);
    localStorage.setItem('multiplication-speed-avatar', avatarId);
  };

  // 4. Trigger active test
  const handleStartGame = (selectedNumbers: number[], mode: GameMode) => {
    setActiveNumbers(selectedNumbers);
    setActiveMode(mode);
    setView('playing');
  };

  // 5. Game session fully ends, compile performance and evaluate rewards/badges!
  const handleGameEnd = (stats: {
    score: number;
    totalAnswered: number;
    correctCount: number;
    questionsReview: Array<{ num1: number; num2: number; given: number; correct: number; isCorrect: boolean }>;
  }) => {
    const accuracy = stats.totalAnswered > 0 ? Math.round((stats.correctCount / stats.totalAnswered) * 100) : 0;

    // Check if this scores higher than previous records of the same mode
    const modeScores = scores.filter((s) => s.mode === activeMode);
    const prevBest = modeScores.length > 0 ? Math.max(...modeScores.map((s) => s.score)) : 0;
    const isBest = stats.score > prevBest && stats.totalAnswered > 0;

    setIsNewHighscore(isBest);

    // Save record to local storage
    const newEntry: ScoreEntry = {
      id: Math.random().toString(36).substring(2, 9),
      name: currentName,
      score: stats.score,
      totalAnswered: stats.totalAnswered,
      accuracy,
      mode: activeMode,
      numbersUsed: activeNumbers,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }),
      isNewHighscore: isBest,
    };

    const updatedScores = [...scores, newEntry];
    setScores(updatedScores);
    localStorage.setItem('multiplication-speed-scores', JSON.stringify(updatedScores));

    // Dynamic Badge calculations!
    const newlyAwards: Achievement[] = [];

    // Analyze streaks (consecutive correct answers)
    let maxStreak = 0;
    let currentStreak = 0;
    stats.questionsReview.forEach((q) => {
      if (q.isCorrect) {
        currentStreak++;
        if (currentStreak > maxStreak) maxStreak = currentStreak;
      } else {
        currentStreak = 0;
      }
    });

    // Award 🎒 first-victory on completing any test
    if (!unlockedBadges.includes('first-victory') && stats.totalAnswered > 0) {
      const b = ACHIEVEMENTS.find((ac) => ac.id === 'first-victory');
      if (b) newlyAwards.push(b);
    }

    // Award 🔥 streak-5
    if (!unlockedBadges.includes('streak-5') && maxStreak >= 5) {
      const b = ACHIEVEMENTS.find((ac) => ac.id === 'streak-5');
      if (b) newlyAwards.push(b);
    }

    // Award 🧠 streak-15
    if (!unlockedBadges.includes('streak-15') && maxStreak >= 15) {
      const b = ACHIEVEMENTS.find((ac) => ac.id === 'streak-15');
      if (b) newlyAwards.push(b);
    }

    // Award 👑 perfect-game
    if (!unlockedBadges.includes('perfect-game') && accuracy === 100 && stats.totalAnswered >= 10) {
      const b = ACHIEVEMENTS.find((ac) => ac.id === 'perfect-game');
      if (b) newlyAwards.push(b);
    }

    // Award 🎪 table-master-12 if answered a difficulty 12 question correctly
    const solved12Table = stats.questionsReview.some((q) => q.isCorrect && (q.num1 === 12 || q.num2 === 12));
    if (!unlockedBadges.includes('table-master-12') && solved12Table) {
      const b = ACHIEVEMENTS.find((ac) => ac.id === 'table-master-12');
      if (b) newlyAwards.push(b);
    }

    // Award 🏆 grandmaster if scored > 40 in Time Attack
    if (!unlockedBadges.includes('grandmaster') && activeMode === 'time-attack' && stats.score >= 40) {
      const b = ACHIEVEMENTS.find((ac) => ac.id === 'grandmaster');
      if (b) newlyAwards.push(b);
    }

    // Capture first newly unlocked badge to trigger sticker card popup!
    if (newlyAwards.length > 0) {
      const badgeToPop = newlyAwards[0];
      setNewlyUnlockedBadge(badgeToPop);

      const nextBadges = [...unlockedBadges, ...newlyAwards.map((b) => b.id)];
      setUnlockedBadges(nextBadges);
      localStorage.setItem('multiplication-speed-badges', JSON.stringify(nextBadges));

      // Trigger celebrate audio
      setTimeout(() => {
        playUnlocksBadge();
        setConfettiTrigger((prev) => prev + 1);
      }, 300);
    } else {
      // Small celebratory burst for high scoring/high accuracy anyway!
      if (accuracy >= 80) {
        setTimeout(() => {
          setConfettiTrigger((prev) => prev + 1);
        }, 300);
      }
    }

    setLastStats(stats);
    setView('stats');
  };

  const handleRestartGame = () => {
    setView('playing');
  };

  return (
    <div id="app-root-wrapper" className="min-h-screen bg-[#4F46E5] text-white flex flex-col justify-between py-3 px-3 md:px-6 transition-colors duration-300">
      {/* Absolute canvas confetti element */}
      <ConfettiEffect trigger={confettiTrigger} />

      {/* Persistent sticker badge notification */}
      <BadgePopup
        achievement={newlyUnlockedBadge}
        onClose={() => setNewlyUnlockedBadge(null)}
      />

      {/* Main Container */}
      <div className="w-full max-w-5xl mx-auto space-y-3 flex-1">
        {/* Playful Top Ribbon with Logo & Controls */}
        <header className="flex items-center justify-between gap-3 pb-2 border-b border-white/15">
          <div className="flex items-center gap-2 cursor-pointer min-w-0" onClick={() => { playPop(); setView('lobby'); }}>
            <div className="w-8 h-8 rounded-full bg-white text-[#4F46E5] flex items-center justify-center font-black text-xl shadow border-2 border-white transform hover:rotate-12 transition-transform shrink-0">
              ×
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-white leading-none truncate">Multiplication Blitz</h1>
              <span className="hidden sm:block text-[9px] uppercase font-extrabold text-amber-300 tracking-wider mt-0.5">Speed math for superstars</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <AudioToggle />
            <span className="hidden sm:inline-flex text-[10px] bg-white/15 backdrop-blur-md rounded-full px-2.5 py-1 font-bold text-white border border-white/10 font-mono">
              ⚡ Sandbox Mode
            </span>
          </div>
        </header>

        {/* Dynamic Views renderer */}
        <main className="py-2">
          {view === 'lobby' && (
            <div className="space-y-5 animate-scaleIn">
              {/* Core interactive customized dashboard panel */}
              <Dashboard
                currentMascot={currentMascot}
                onStartGame={handleStartGame}
              />

              {/* Achievements & score history section */}
              <GameScoreBoard
                scores={scores}
                unlockedBadges={unlockedBadges}
                currentAvatar={currentMascot}
                currentName={currentName}
                onUpdateProfile={handleUpdateProfile}
                onClearScores={handleClearScores}
              />
            </div>
          )}

          {view === 'playing' && (
            <div className="animate-fadeIn">
              <GameScreen
                selectedNumbers={activeNumbers}
                mode={activeMode}
                mascot={currentMascot}
                onGameEnd={handleGameEnd}
                onTriggerConfetti={() => setConfettiTrigger((p) => p + 1)}
                onExit={() => setView('lobby')}
              />
            </div>
          )}

          {view === 'stats' && lastStats && (
            <div className="animate-scaleIn">
              <StatsScreen
                stats={lastStats}
                mascot={currentMascot}
                isNewHighscore={isNewHighscore}
                onRestart={handleRestartGame}
                onHome={() => setView('lobby')}
              />
            </div>
          )}
        </main>
      </div>

      {/* Fun Kid-friendly Footer */}
      <footer className="w-full max-w-5xl mx-auto text-center pt-4 border-t border-white/15 text-xs text-indigo-100/80">
        <p className="font-extrabold tracking-wide uppercase text-amber-300">
          ★ Multiplication Speed Test Sandbox ★
        </p>
        <p className="text-[10px] mt-1 opacity-80">
          Designed with Bold Typography elements & vibrant colors for maximum fun math practice!
        </p>
      </footer>
    </div>
  );
}
