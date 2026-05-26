import { useState } from 'react';
import { ScoreEntry, Achievement, ACHIEVEMENTS, Avatar, MASCOTS } from '../types';
import { Trophy, Award, History, Trash2, ShieldCheck, Flame } from 'lucide-react';
import { playPop, playFanfare } from '../utils/audio';

interface GameScoreBoardProps {
  scores: ScoreEntry[];
  unlockedBadges: string[];
  currentAvatar: Avatar;
  currentName: string;
  onUpdateProfile: (name: string, avatarId: string) => void;
  onClearScores: () => void;
}

export function GameScoreBoard({
  scores,
  unlockedBadges,
  currentAvatar,
  currentName,
  onUpdateProfile,
  onClearScores,
}: GameScoreBoardProps) {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'badges' | 'history'>('leaderboard');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempName, setTempName] = useState(currentName);
  const [tempAvatarId, setTempAvatarId] = useState(currentAvatar.id);

  const handleSaveProfile = () => {
    playPop();
    const cleanName = tempName.trim() ? tempName.trim().slice(0, 15) : 'Math Wizard';
    onUpdateProfile(cleanName, tempAvatarId);
    setIsEditingProfile(false);
  };

  const handleCancelProfile = () => {
    playPop();
    setTempName(currentName);
    setTempAvatarId(currentAvatar.id);
    setIsEditingProfile(false);
  };

  const handleTabClick = (tab: 'leaderboard' | 'badges' | 'history') => {
    playPop();
    setActiveTab(tab);
  };

  const handleToggleEdit = () => {
    playPop();
    setIsEditingProfile(true);
  };

  return (
    <div id="scoreboard-container" className="bg-white rounded-[48px] border-2 border-slate-200 border-b-[12px] border-b-[#E5E7EB] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.35)] overflow-hidden">
      {/* Playful Math Companion Profile Box */}
      <div className="bg-slate-50 p-6 sm:p-8 border-b-2 border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-4xl border-3 border-white shadow-md">
              {currentAvatar.emoji}
            </div>
            <span className="absolute -bottom-1 -right-1 bg-[#4F46E5] text-white rounded-full text-[10px] font-black px-1.5 py-0.5 border-2 border-white">
              LVL {Math.max(1, Math.floor(scores.length / 2) + 1)}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-slate-900">{currentName}</h3>
              <button
                id="edit-profile-btn"
                onClick={handleToggleEdit}
                className="text-xs text-[#4F46E5] hover:text-indigo-800 font-extrabold hover:underline cursor-pointer"
              >
                Change Companion
              </button>
            </div>
            <p className="text-xs text-slate-500 font-bold mt-0.5">
              Friendly helper: <span className="font-extrabold text-[#4F46E5]">{currentAvatar.name}</span>
            </p>
          </div>
        </div>

        {/* Quick Summary Numbers */}
        <div className="flex items-center gap-6">
          <div className="text-center">
            <span className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Speed Tests</span>
            <span className="text-3xl font-black text-slate-800 leading-none">{scores.length}</span>
          </div>
          <div className="w-0.5 h-10 bg-slate-200" />
          <div className="text-center">
            <span className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Badges</span>
            <span className="text-3xl font-black text-amber-500 leading-none flex items-center gap-1 justify-center">
              ⭐ {unlockedBadges.length}
            </span>
          </div>
          <div className="w-0.5 h-10 bg-slate-200" />
          <div className="text-center">
            <span className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Top Score</span>
            <span className="text-3xl font-black text-rose-500 leading-none">
              {scores.length > 0 ? Math.max(...scores.map((s) => s.score)) : '--'}
            </span>
          </div>
        </div>
      </div>

      {/* Edit Profile Dialog Popover */}
      {isEditingProfile && (
        <div className="p-6 bg-amber-50 border-2 border-amber-300 rounded-[28px] m-6 animate-fadeIn">
          <h4 className="text-lg font-black text-amber-900 mb-3">Choose Your Avatar & Nickname!</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-amber-700 mb-1.5 uppercase tracking-wider">YOUR MATH NAME</label>
              <input
                id="profile-name-input"
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                maxLength={15}
                placeholder="Math Super Wizard"
                className="w-full px-4 py-3 border-2 border-amber-300 rounded-2xl bg-white text-slate-800 font-black focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-amber-700 mb-1.5 uppercase tracking-wider">CHOOSE CO-PILOT</label>
              <div className="grid grid-cols-6 gap-2">
                {MASCOTS.map((m) => (
                  <button
                    id={`mascot-select-${m.id}`}
                    key={m.id}
                    onClick={() => {
                      playPop();
                      setTempAvatarId(m.id);
                    }}
                    type="button"
                    className={`text-2xl p-2 rounded-xl border-2 transition-all cursor-pointer ${
                      tempAvatarId === m.id
                        ? 'border-[#4F46E5] bg-indigo-50 border-b-4 scale-105 shadow-md'
                        : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50 border-b-4'
                    }`}
                    title={m.name}
                  >
                    {m.emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2 justify-end mt-5">
            <button
              id="cancel-profile-btn"
              onClick={handleCancelProfile}
              className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 border-b-4 border-slate-300 hover:border-slate-400 text-slate-700 rounded-xl font-black text-xs transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="save-profile-btn"
              onClick={handleSaveProfile}
              className="px-6 py-2.5 bg-[#10B981] text-white border-b-4 border-emerald-700 hover:brightness-105 rounded-xl font-black text-xs shadow-md hover:brightness-105 transition-all cursor-pointer uppercase tracking-wider"
            >
              Save Profile
            </button>
          </div>
        </div>
      )}

      {/* Tab Selectors - Styled with chunky bubble pill controls */}
      <div className="flex flex-wrap gap-2.5 justify-center p-4 border-b-2 border-slate-200 bg-slate-50">
        <button
          id="tab-btn-leaderboard"
          onClick={() => handleTabClick('leaderboard')}
          className={`px-5 py-2.5 rounded-full font-black text-xs transition-all uppercase tracking-wider cursor-pointer flex items-center gap-1.5 border-b-4 ${
            activeTab === 'leaderboard'
              ? 'bg-[#4F46E5] text-white border-indigo-850'
              : 'bg-white hover:bg-slate-100 text-slate-700 border-2 border-slate-200 border-b-slate-300'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Champion Ledger</span>
        </button>
        <button
          id="tab-btn-badges"
          onClick={() => handleTabClick('badges')}
          className={`px-5 py-2.5 rounded-full font-black text-xs transition-all uppercase tracking-wider cursor-pointer flex items-center gap-1.5 border-b-4 ${
            activeTab === 'badges'
              ? 'bg-[#4F46E5] text-white border-indigo-850'
              : 'bg-white hover:bg-slate-100 text-slate-700 border-2 border-slate-200 border-b-slate-300'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Stickers ({unlockedBadges.length}/{ACHIEVEMENTS.length})</span>
        </button>
        <button
          id="tab-btn-history"
          onClick={() => handleTabClick('history')}
          className={`px-5 py-2.5 rounded-full font-black text-xs transition-all uppercase tracking-wider cursor-pointer flex items-center gap-1.5 border-b-4 ${
            activeTab === 'history'
              ? 'bg-[#4F46E5] text-white border-indigo-850'
              : 'bg-white hover:bg-slate-100 text-slate-700 border-2 border-slate-200 border-b-slate-300'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Speed Log</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="p-6">
        {/* LEADERBOARD VIEW */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-4">
            {scores.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="text-4xl mb-3">🏅</div>
                <h4 className="text-base font-black text-slate-800">No high scores yet!</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto font-bold">
                  Play your first speed test game above to see your name ranked!
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b-2 border-slate-200 text-[10px] text-[#4F46E5] font-black pb-3 uppercase tracking-wider">
                      <th className="py-2.5 pl-2">Rank</th>
                      <th className="py-2.5">Player</th>
                      <th className="py-2.5">Speed Mode</th>
                      <th className="py-2.5 font-bold text-center">Score</th>
                      <th className="py-2.5 font-bold text-center">Accuracy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...scores]
                      .sort((a, b) => b.score - a.score || b.accuracy - a.accuracy)
                      .slice(0, 10)
                      .map((entry, idx) => {
                        const isTopThree = idx < 3;
                        const medalEmoji = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '';
                        return (
                          <tr
                            key={entry.id}
                            className={`border-b border-slate-100 text-sm hover:bg-slate-50/50 ${
                              isTopThree ? 'font-black bg-indigo-50/30' : 'font-semibold'
                            }`}
                          >
                            <td className="py-3.5 pl-2 flex items-center gap-2">
                              <span className="w-5 text-slate-500 font-extrabold">{idx + 1}</span>
                              {medalEmoji && <span className="text-lg leading-none">{medalEmoji}</span>}
                            </td>
                            <td className="py-3.5">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-slate-900">{entry.name}</span>
                              </div>
                            </td>
                            <td className="py-3.5">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                  entry.mode === 'time-attack'
                                    ? 'bg-amber-100 text-amber-800'
                                    : entry.mode === 'sprint'
                                    ? 'bg-sky-100 text-sky-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {entry.mode.replace('-', ' ')}
                              </span>
                            </td>
                            <td className="py-3.5 text-center font-black font-mono text-indigo-600 text-base">
                              {entry.score}
                            </td>
                            <td className="py-3.5 text-center font-mono text-xs text-slate-500">
                              <span
                                className={`font-black uppercase tracking-wider ${
                                  entry.accuracy >= 90
                                    ? 'text-emerald-500'
                                    : entry.accuracy >= 70
                                    ? 'text-amber-500'
                                    : 'text-rose-400'
                                }`}
                              >
                                {entry.accuracy}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
                <div className="flex justify-between items-center mt-6 pt-4 border-t-2 border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">
                    ★ ONLY TOP 10 MASTER CHAMPIONS RENDERED ★
                  </span>
                  <button
                    id="clear-all-highscores-btn"
                    onClick={() => {
                      if (confirm('Are you sure you want to clear your high scores database? This cannot be undone.')) {
                        playPop();
                        onClearScores();
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-slate-200 border-b-[3px] text-rose-600 rounded-lg text-xs font-black transition-all hover:brightness-95 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>RESET LOGS</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STICKER BOOK / BADGES VIEW */}
        {activeTab === 'badges' && (
          <div>
            <p className="text-xs text-slate-500 mb-5 text-center font-bold">
              Solve multiplication sprints to unlock colorful stickers for your scrapbook!
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {ACHIEVEMENTS.map((badge) => {
                const isUnlocked = unlockedBadges.includes(badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`p-4 rounded-3xl border-2 text-center transition-all ${
                      isUnlocked
                        ? 'bg-white border-amber-300 border-b-[6px] shadow-md scale-100 hover:scale-[1.03] duration-150'
                        : 'bg-slate-50/50 border-slate-200 border-b-[4px] opacity-60'
                    }`}
                  >
                    <div
                      className={`w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-3xl mb-2.5 relative ${
                        isUnlocked ? 'bg-amber-100 border-2 border-dashed border-amber-400' : 'grayscale filter'
                      }`}
                    >
                      {isUnlocked ? badge.emoji : '🔒'}
                    </div>
                    <h5 className="font-black text-sm text-slate-800 leading-tight mb-1">
                      {badge.title}
                    </h5>
                    <p className="text-[10px] text-slate-500 font-medium leading-snug">
                      {badge.description}
                    </p>
                    <div className="mt-2 pt-1 border-t border-slate-100 text-[9px] font-black text-[#4F46E5] uppercase tracking-widest leading-none">
                      {badge.conditionDescription}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* RECENT HISTORICAL FEED */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            {scores.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="text-4xl mb-3">⏳</div>
                <h4 className="text-base font-black text-slate-800">No test history</h4>
                <p className="text-xs text-slate-400 mt-1 font-bold">
                  Complete a Speed Test round and your stats will display here!
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {[...scores]
                  .reverse()
                  .slice(0, 15)
                  .map((run) => (
                    <div
                      key={run.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl border-2 border-slate-200 border-b-[4px] bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-800 text-sm">{run.name}</span>
                          <span className="text-[10px] text-slate-400 font-bold">{run.date}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 flex flex-wrap gap-1.5 items-center font-semibold">
                          <span className="capitalize font-black text-indigo-600">{run.mode.replace('-', ' ')}</span>
                          <span>•</span>
                          <span>Answ: <strong className="text-slate-800">{run.totalAnswered}</strong></span>
                          <span>•</span>
                          <span>Numbers: <strong className="text-indigo-605">[{run.numbersUsed.join(', ')}]</strong></span>
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="block text-lg font-black font-mono text-indigo-700 leading-none">
                          +{run.score} pts
                        </span>
                        <span className="text-[10px] font-black text-emerald-500 mt-0.5 uppercase tracking-wider">
                          {run.accuracy}% Acc
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
