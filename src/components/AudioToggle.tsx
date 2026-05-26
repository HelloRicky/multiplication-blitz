import { Volume2, VolumeX } from 'lucide-react';
import { getMuted, setMuted, playPop } from '../utils/audio';
import { useState } from 'react';

interface AudioToggleProps {
  onToggle?: (isMuted: boolean) => void;
}

export function AudioToggle({ onToggle }: AudioToggleProps) {
  const [muted, setMutedState] = useState(getMuted());

  const handleToggle = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    setMutedState(nextMuted);
    if (onToggle) {
      onToggle(nextMuted);
    }
    if (!nextMuted) {
      playPop();
    }
  };

  return (
    <button
      id="audio-toggle-btn"
      onClick={handleToggle}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold transition-all duration-200 cursor-pointer active:scale-95 ${
        muted
          ? 'bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100'
          : 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100'
      }`}
      title={muted ? 'Unmute sounds' : 'Mute sounds'}
    >
      {muted ? (
        <>
          <VolumeX className="w-4.5 h-4.5 animate-pulse" />
          <span>Sounds Off</span>
        </>
      ) : (
        <>
          <Volume2 className="w-4.5 h-4.5" />
          <span>Sounds On</span>
        </>
      )}
    </button>
  );
}
