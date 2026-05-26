export type GameMode = 'time-attack' | 'sprint' | 'survival';

export interface ScoreEntry {
  id: string;
  name: string;
  score: number;
  totalAnswered: number;
  accuracy: number;
  mode: GameMode;
  numbersUsed: number[];
  date: string;
  isNewHighscore?: boolean;
}

export interface Question {
  num1: number;
  num2: number;
  correctAnswer: number;
  options: number[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  color: string;
  unlockedAt?: string;
  conditionDescription: string;
}

export interface Avatar {
  id: string;
  emoji: string;
  name: string;
  color: string;
}

export const MASCOTS: Avatar[] = [
  { id: '1', emoji: '🦊', name: 'Felix the Fox', color: 'bg-orange-100 hover:bg-orange-200 text-orange-600 border-orange-300' },
  { id: '2', emoji: '🦖', name: 'Rexy the Dino', color: 'bg-emerald-100 hover:bg-emerald-200 text-emerald-600 border-emerald-300' },
  { id: '3', emoji: '🦄', name: 'Sparkles the Uni', color: 'bg-purple-100 hover:bg-purple-200 text-purple-600 border-purple-300' },
  { id: '4', emoji: '🐼', name: 'Pip the Panda', color: 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300' },
  { id: '5', emoji: '🦁', name: 'Leo the Lion', color: 'bg-amber-100 hover:bg-amber-200 text-amber-600 border-amber-300' },
  { id: '6', emoji: '🐙', name: 'Ollie the Octo', color: 'bg-pink-100 hover:bg-pink-200 text-pink-600 border-pink-300' },
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'streak-5',
    title: 'On Fire!',
    description: 'Get a streak of 5 correct answers!',
    emoji: '🔥',
    color: 'from-orange-400 to-amber-500',
    conditionDescription: 'Streak of 5',
  },
  {
    id: 'streak-15',
    title: 'Super Einstein',
    description: 'Get a streak of 15 correct answers!',
    emoji: '🧠',
    color: 'from-purple-400 to-indigo-500',
    conditionDescription: 'Streak of 15',
  },
  {
    id: 'perfect-game',
    title: 'Perfect Score',
    description: 'Complete a full game with 100% accuracy!',
    emoji: '👑',
    color: 'from-yellow-400 to-amber-500',
    conditionDescription: '100% accuracy (min 10 answered)',
  },
  {
    id: 'speed-demon',
    title: 'Speed Demon',
    description: 'Answer a question in under 1 second!',
    emoji: '⚡',
    color: 'from-cyan-400 to-blue-500',
    conditionDescription: 'Solve in < 1s',
  },
  {
    id: 'table-master-12',
    title: 'Twelve Master',
    description: 'Correctly solve a multiplication of the challenging 12 table!',
    emoji: '🎪',
    color: 'from-rose-400 to-pink-500',
    conditionDescription: 'Answer a 12x question',
  },
  {
    id: 'first-victory',
    title: 'First Step',
    description: 'Complete your very first speed test!',
    emoji: '🎒',
    color: 'from-emerald-400 to-teal-500',
    conditionDescription: 'Complete 1 game',
  },
  {
    id: 'grandmaster',
    title: 'Grandmaster',
    description: 'Score over 40 in a single Time Attack game!',
    emoji: '🏆',
    color: 'from-red-400 to-rose-600',
    conditionDescription: 'Score over 40 in Time Attack',
  },
];
