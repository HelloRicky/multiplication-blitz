import { useState, useEffect, useRef } from 'react';
import { GameMode, Question, Avatar } from '../types';
import { Shield, Flame, RotateCcw, Award, Home, Pause, Play, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  playPop,
  playCorrect,
  playIncorrect,
  playTick,
  playWarning,
  playStreakUp,
} from '../utils/audio';

interface GameScreenProps {
  selectedNumbers: number[];
  mode: GameMode;
  mascot: Avatar;
  onGameEnd: (stats: {
    score: number;
    totalAnswered: number;
    correctCount: number;
    questionsReview: Array<{ num1: number; num2: number; given: number; correct: number; isCorrect: boolean }>;
  }) => void;
  onTriggerConfetti: () => void;
  onExit: () => void;
}

const CHEERS_ON_STREAK = [
  'Nice one! 🎉',
  'Super fast! ⚡',
  'Math Whiz! 🧠',
  'Stitch-perfect! ⭐',
  'You are on fire! 🔥',
  'Incredible! 🚀',
  'Genius brain! 🎒',
  'Absolute Champion! 👑',
];

export function GameScreen({
  selectedNumbers,
  mode,
  mascot,
  onGameEnd,
  onTriggerConfetti,
  onExit,
}: GameScreenProps) {
  // Gameplay progress states
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [lives, setLives] = useState(3); // For Survival mode
  const [gameStartedAt] = useState(Date.now());

  // Time metrics
  const BASE_TIME_MAP = {
    'time-attack': 60,
    'sprint': 0, // Incremental stopwatch
    'survival': 8, // Refreshes per question with decreasing speeds
  };
  const [timeLeft, setTimeLeft] = useState(BASE_TIME_MAP[mode]);
  const [survivalTimeLimit, setSurvivalTimeLimit] = useState(8); // Shrinks slightly per question
  const [isPaused, setIsPaused] = useState(false);

  // Review tracking for StatsScreen
  const [questionsReview, setQuestionsReview] = useState<
    Array<{ num1: number; num2: number; given: number; correct: number; isCorrect: boolean }>
  >([]);

  // Companion Bubble cheer
  const [cheerText, setCheerText] = useState('Let\'s do some lightning fast math!');

  const questionStartTime = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Generate Question & realistic Distractors
  const generateQuestion = (): Question => {
    // Pick multiplier parameters
    const num1 = selectedNumbers[Math.floor(Math.random() * selectedNumbers.length)];
    // Multiplied by a random number 0 - 12
    const num2 = Math.floor(Math.random() * 13);
    const correctAnswer = num1 * num2;

    const optionsSet = new Set<number>();
    optionsSet.add(correctAnswer);

    // Dynamic Distractor parameters inside practical boundaries (0-144)
    // Make them close, clever values so kids have to look and can't use easy patterns
    const candidates = [
      correctAnswer + num1,
      correctAnswer - num1,
      correctAnswer + num2,
      correctAnswer - num2,
      (num1 + 1) * num2,
      num1 * Math.max(0, num2 - 1),
      (num1 - 1) * num2,
      num1 * (num2 + 1),
      correctAnswer + 2,
      correctAnswer - 2,
      correctAnswer + 10,
      correctAnswer - 10,
    ];

    while (optionsSet.size < 4) {
      const fallbackRandom = Math.floor(Math.random() * 13) * Math.floor(Math.random() * 13);
      // Select from smart candidates first, then fall back to pure random integers
      const index = Math.floor(Math.random() * (candidates.length + 3));
      const val = index < candidates.length ? candidates[index] : fallbackRandom;

      if (val >= 0 && val <= 144) {
        optionsSet.add(val);
      }
    }

    // Convert Set and Shuffle
    const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

    return { num1, num2, correctAnswer, options };
  };

  // 2. Main Game Timer Tick loop
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      if (mode === 'sprint') {
        // Stop watch style: increment seconds
        setTimeLeft((prev) => prev + 1);
      } else if (mode === 'time-attack') {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleGameOver();
            return 0;
          }
          // Tick sound in final 5 seconds
          if (prev <= 6) {
            playTick();
          }
          return prev - 1;
        });
      } else if (mode === 'survival') {
        setTimeLeft((prev) => {
          if (prev <= 0.1) {
            // Heart penalty on timeout!
            playIncorrect();
            setLives((l) => {
              const nextL = l - 1;
              if (nextL <= 0) {
                handleGameOver(true);
              } else {
                setStreak(0);
                setCheerText('Timer ran out! ⏰ Stay sharp!');
                // Generate next card automatically on time-out
                setTotalAnswered((t) => t + 1);
                // Record timeout in review
                if (currentQuestion) {
                  setQuestionsReview((r) => [
                    ...r,
                    {
                      num1: currentQuestion.num1,
                      num2: currentQuestion.num2,
                      given: -1,
                      correct: currentQuestion.correctAnswer,
                      isCorrect: false,
                    },
                  ]);
                }
                const nextQ = generateQuestion();
                setCurrentQuestion(nextQ);
                questionStartTime.current = Date.now();
                return survivalTimeLimit;
              }
              return 0;
            });
            return survivalTimeLimit;
          }
          return Number((prev - 0.1).toFixed(1));
        });
      }
    }, mode === 'survival' ? 100 : 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mode, isPaused, currentQuestion, survivalTimeLimit]);

  // Initial trigger
  useEffect(() => {
    const q = generateQuestion();
    setCurrentQuestion(q);
    questionStartTime.current = Date.now();
  }, []);

  const handleGameOver = (endNow = false) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeout(() => {
      onGameEnd({
        score,
        totalAnswered: totalAnswered + (endNow ? 0 : 0), // accurately record answered questions
        correctCount,
        questionsReview,
      });
    }, 450);
  };

  // 3. User Select Choice Option Action
  const handleSelectAnswer = (option: number) => {
    if (isPaused || !currentQuestion) return;

    const isCorrect = option === currentQuestion.correctAnswer;
    const now = Date.now();
    const solveTimeSeconds = (now - questionStartTime.current) / 1000;

    // Record review payload for scorecard review
    setQuestionsReview((prev) => [
      ...prev,
      {
        num1: currentQuestion.num1,
        num2: currentQuestion.num2,
        given: option,
        correct: currentQuestion.correctAnswer,
        isCorrect,
      },
    ]);

    setTotalAnswered((prev) => prev + 1);

    if (isCorrect) {
      playCorrect();
      setCorrectCount((prev) => prev + 1);

      // Multiplier reward systems
      const nextStreak = streak + 1;
      setStreak(nextStreak);

      // High streak sounds & alerts
      if (nextStreak % 4 === 0) {
        playStreakUp(nextStreak);
        onTriggerConfetti();
        setCheerText(`${CHEERS_ON_STREAK[Math.floor(Math.random() * CHEERS_ON_STREAK.length)]} Streak x${nextStreak}!`);
      } else {
        setCheerText(CHEERS_ON_STREAK[Math.floor(Math.random() * CHEERS_ON_STREAK.length)]);
      }

      // Mode-specific rewards
      if (mode === 'time-attack') {
        // Earn base points + streak modifiers
        const pts = 10 + (nextStreak > 5 ? 5 : nextStreak > 2 ? 2 : 0);
        setScore((s) => s + pts);
        // Time bonus: add 2 seconds
        setTimeLeft((t) => Math.min(99, t + 2));
      } else if (mode === 'sprint') {
        const pts = 10 + nextStreak * 2;
        setScore((s) => s + pts);

        // Under 20 mode, end immediately if index is reached
        if (totalAnswered + 1 >= 20) {
          handleGameOver(true);
          return;
        }
      } else if (mode === 'survival') {
        const pts = 15 + nextStreak * 3;
        setScore((s) => s + pts);

        // Gradually shrink survival limit down per question
        const shrinkFactor = 0.96; // Shrinks limit 4% per correct answer
        setSurvivalTimeLimit((t) => Math.max(2.5, t * shrinkFactor));
      }
    } else {
      // Wrong Answer path
      playIncorrect();
      setStreak(0);
      setCheerText('Oh, close one! Let\'s practice, you can do it! 💪');

      if (mode === 'survival') {
        const nextLives = lives - 1;
        setLives(nextLives);
        if (nextLives <= 0) {
          handleGameOver(true);
          return;
        }
      } else if (mode === 'time-attack') {
        // Penalty: take away 3 seconds in time blitz
        setTimeLeft((t) => Math.max(1, t - 3));
      }
    }

    // Load next question with a small bounce delay
    const nextQ = generateQuestion();
    setCurrentQuestion(nextQ);
    questionStartTime.current = Date.now();

    if (mode === 'survival') {
      setTimeLeft(survivalTimeLimit);
    }
  };

  const handleTogglePause = () => {
    playPop();
    setIsPaused((p) => !p);
  };

  // Convert Sprint Stopwatch time to cute human digital timer
  const formatTime = (sec: number) => {
    if (mode === 'survival') {
      return `${sec.toFixed(1)}s`;
    }
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div id="gameplay-arena" className="w-full max-w-xl mx-auto space-y-6">
      {/* 1. Header Stats Panel */}
      <div className="bg-white/10 backdrop-blur-md text-white rounded-[24px] border-2 border-white/20 p-4 sm:px-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] flex items-center justify-between gap-4 font-sans">
        <div className="flex items-center gap-3">
          <button
            id="pause-game-btn"
            onClick={handleTogglePause}
            className="p-2 rounded-xl bg-white/20 hover:bg-white/35 text-white border border-white/20 cursor-pointer active:scale-95 transition-all"
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play className="w-4 h-4 fill-white" /> : <Pause className="w-4 h-4 fill-white" />}
          </button>
          <div>
            <span className="block text-[10px] text-indigo-200 font-extrabold uppercase tracking-widest">
              {mode === 'time-attack' ? '⏰ Time Left' : mode === 'sprint' ? '⏳ Stopwatch' : '⚡ Countdown'}
            </span>
            <span
              className={`text-2xl font-black ${
                mode === 'time-attack' && timeLeft < 10 ? 'text-amber-300 animate-pulse' : 'text-white'
              }`}
            >
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* Total stats progress indicator */}
        <div className="text-center">
          <span className="block text-[10px] text-indigo-200 font-extrabold uppercase tracking-widest">
            {mode === 'sprint' ? 'Progress' : 'Score Points'}
          </span>
          <span className="text-2xl font-black text-amber-300">
            {mode === 'sprint' ? `${totalAnswered}/20` : `${score} pts`}
          </span>
        </div>

        {/* Life / Streak badge */}
        <div className="text-right font-sans">
          {mode === 'survival' ? (
            <div>
              <span className="block text-[10px] text-indigo-200 font-bold uppercase tracking-widest">
                Hearts Left
              </span>
              <div className="flex gap-1 mt-1 justify-end">
                {[1, 2, 3].map((heartIdx) => (
                  <span key={heartIdx} className="text-lg leading-none filter drop-shadow">
                    {heartIdx <= lives ? '❤️' : '🖤'}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <span className="block text-[10px] text-indigo-200 font-bold uppercase tracking-widest">
                Streak Multiplier
              </span>
              <span className="text-sm font-black text-white flex items-center gap-1 justify-end mt-1">
                {streak > 0 ? (
                  <span className="bg-amber-400 text-slate-900 text-[11px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-0.5 animate-bounce">
                    <Flame className="w-3 h-3 text-red-600 fill-red-600" />
                    <span>x{streak}</span>
                  </span>
                ) : (
                  <span className="text-white/40">None</span>
                )}
              </span>
            </div>
          )}
        </div>
      </div>

      {isPaused && (
        <div id="paused-overlay-banner" className="bg-white text-slate-800 border-4 border-white p-6 rounded-[32px] shadow-2xl text-center space-y-4 animate-scaleIn">
          <div className="text-4xl">⏸️</div>
          <h3 className="text-2xl font-black text-slate-900">Game Paused</h3>
          <p className="text-sm text-slate-600 max-w-xs mx-auto">
            Take a breather! Click resume to jump back in or exit to save current achievements.
          </p>
          <div className="flex gap-2 justify-center pt-2">
            <button
              id="pause-resume-btn"
              onClick={handleTogglePause}
              className="px-6 py-3 bg-[#10B981] hover:brightness-105 text-white text-xs font-black rounded-xl shadow-lg border-b-4 border-emerald-700 cursor-pointer active:scale-95 transition-all uppercase tracking-wider"
            >
              Resume Play
            </button>
            <button
              id="pause-quit-btn"
              onClick={onExit}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-xl border-b-4 border-slate-300 cursor-pointer"
            >
              Exit Sandbox
            </button>
          </div>
        </div>
      )}

      {!isPaused && currentQuestion && (
        <div className="space-y-6">
          {/* 2. Visual Equation Card - Bold Typography Theme Styled */}
          <div
            id="multiplication-equation-card"
            className="bg-white text-slate-850 rounded-[48px] p-8 sm:p-12 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.45)] border-b-[12px] border-[#E5E7EB] text-center relative overflow-hidden"
          >
            {/* Playful card background pattern */}
            <div className="absolute top-0 left-0 w-full h-3 bg-[#4F46E5]" />
            <div className="absolute -top-6 -left-6 w-20 h-20 bg-indigo-50/60 rounded-full" />
            <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-purple-50/60 rounded-full" />

            {/* Streak spark background */}
            {streak >= 5 && (
              <div className="absolute top-4 right-4 bg-amber-400 text-slate-900 rounded-full py-1.5 px-3.5 text-xs font-black flex items-center gap-1.5 animate-cute-glow select-none shadow">
                <Flame className="w-4 h-4 text-red-600 fill-red-600" /> STREAK BOOST ACTIVE!
              </div>
            )}

            <div className="flex flex-col items-center justify-center pt-4 pb-2">
              <span className="text-xs text-indigo-500 font-extrabold uppercase tracking-widest mb-4">
                Solve the Problem! (Card #{totalAnswered + 1})
              </span>

              {/* Massive Equation Layout - Bold Typography Pairings */}
              <div className="flex items-center justify-center gap-3 sm:gap-6 select-none">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={`num1-${currentQuestion.num1}`}
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 30, opacity: 0 }}
                    transition={{ type: 'spring', damping: 10, stiffness: 120 }}
                    className="text-8xl sm:text-[144px] md:text-[160px] font-black text-slate-800 tracking-tighter leading-none"
                  >
                    {currentQuestion.num1}
                  </motion.span>
                </AnimatePresence>

                <span className="text-5xl sm:text-[100px] font-black text-[#4F46E5] leading-none transform translate-y-2 select-none">×</span>

                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={`num2-${currentQuestion.num2}`}
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 30, opacity: 0 }}
                    transition={{ type: 'spring', damping: 10, stiffness: 120 }}
                    className="text-8xl sm:text-[144px] md:text-[160px] font-black text-slate-800 tracking-tighter leading-none"
                  >
                    {currentQuestion.num2}
                  </motion.span>
                </AnimatePresence>

                <span className="text-5xl sm:text-[100px] font-black text-slate-400 leading-none transform translate-y-2 select-none">=</span>

                <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-3xl bg-indigo-50 flex items-center justify-center text-5xl sm:text-6xl font-black text-indigo-300 border-4 border-dashed border-indigo-200 select-none animate-pulse">
                  ?
                </div>
              </div>

              {/* Time progression slider for survival */}
              {mode === 'survival' && (
                <div className="w-full max-w-xs h-4 bg-slate-100 rounded-full mt-8 overflow-hidden border-2 border-slate-200">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-rose-500 transition-all duration-100 ease-linear rounded-full"
                    style={{ width: `${(timeLeft / survivalTimeLimit) * 100}%` }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* 3. Companion Mascot Speech Bubble - White contrast glass styled */}
          <div className="flex items-center gap-4 bg-white text-slate-800 p-5 rounded-[24px] shadow-lg border-2 border-white/20">
            <div className="text-5xl leading-none select-none transform hover:scale-110 transition-transform">{mascot.emoji}</div>
            <div>
              <span className="block text-[10px] text-indigo-600 font-black uppercase tracking-wider">
                {mascot.name} Cheers:
              </span>
              <p className="text-sm text-slate-700 font-extrabold italic mt-0.5">
                "{cheerText}"
              </p>
            </div>
          </div>

          {/* 4. Playful Bubble Multiple Choices - Extreme Bold Colors with Heavy Borders */}
          <div className="space-y-3">
            <span className="block text-xs text-white/80 font-black text-center uppercase tracking-widest">
              ★ TAP THE CORRECT BUBBLE ★
            </span>

            <div className="grid grid-cols-2 gap-4">
              {currentQuestion.options.map((option, index) => {
                const colors = [
                  'bg-[#EF4444] border-red-600 shadow-red-900/30',
                  'bg-[#3B82F6] border-blue-700 shadow-blue-950/30',
                  'bg-[#10B981] border-emerald-600 shadow-emerald-950/30',
                  'bg-[#F59E0B] border-amber-600 shadow-amber-950/30',
                ];
                const choiceBgClass = colors[index % colors.length];

                return (
                  <motion.button
                    id={`choice-bubble-btn-${index}`}
                    key={`${option}-${index}`}
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleSelectAnswer(option)}
                    type="button"
                    className={`h-28 sm:h-36 rounded-[32px] text-white text-4xl sm:text-5xl md:text-6xl font-black shadow-xl transition-all cursor-pointer relative overflow-hidden flex items-center justify-center border-b-8 border-current select-none ${choiceBgClass} border-black/25`}
                  >
                    {/* Retro bubble gloss visual accent */}
                    <div className="absolute top-2 left-3 w-8 h-4 bg-white/20 rounded-full filter blur-[1px]" />
                    <span>{option}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* 5. Utility drawer button */}
          <div className="flex justify-between items-center pt-2 text-white/80">
            <button
              id="exit-test-sandbox-btn"
              onClick={() => {
                if (confirm('Exit math sandbox? Your current speed test progress will be lost.')) {
                  playPop();
                  onExit();
                }
              }}
              className="flex items-center gap-1 text-xs text-white hover:text-amber-300 font-extrabold cursor-pointer hover:underline"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Back to Lobby</span>
            </button>
            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-100/70">
              {mode.replace('-', ' ')} • Numbers: 0-12
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
