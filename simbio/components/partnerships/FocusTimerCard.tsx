'use client';

import { useState, useEffect } from 'react';
import { Clock, CheckCircle2, Play, Pause, RotateCcw } from 'lucide-react';

export function FocusTimerCard() {
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [timerActive, setTimerActive] = useState(false);
  const [sessionCompletedMsg, setSessionCompletedMsg] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => setTimerSeconds((prev) => prev - 1), 1000);
    } else if (timerSeconds === 0) {
      setTimerActive(false);
      setSessionCompletedMsg('25-Minute Focus Session Completed!');
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="neo-box bg-[#FACC15] p-6 text-center space-y-4 shadow-[6px_6px_0px_0px_#0F172A]">
      <div className="flex items-center justify-between border-b-2 border-[#0F172A] pb-2">
        <div className="flex items-center gap-1.5 text-xs font-black text-[#0F172A] uppercase tracking-wider">
          <Clock className="w-4 h-4 text-[#0F172A]" />
          <span>Focus Belajar Bareng</span>
        </div>
        <span className="neo-badge bg-white text-[#0F172A] text-[10px] px-2 py-0.5">25 Min Timer</span>
      </div>

      <div className="text-5xl font-mono font-black text-[#0F172A] py-5 bg-white rounded-2xl border-3 border-[#0F172A] shadow-[4px_4px_0px_0px_#0F172A]">
        {formatTimer(timerSeconds)}
      </div>

      {sessionCompletedMsg && (
        <div className="p-2.5 text-[11px] bg-[#84CC16] text-[#0F172A] font-black border-2 border-[#0F172A] rounded-xl flex items-center justify-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{sessionCompletedMsg}</span>
        </div>
      )}

      <div className="flex justify-center gap-2">
        <button
          onClick={() => setTimerActive(!timerActive)}
          className={`neo-button text-xs px-5 py-2.5 flex items-center gap-1.5 ${timerActive ? 'bg-[#0F172A] text-white' : ''}`}
        >
          {timerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span>{timerActive ? 'Pause' : 'Start Focus'}</span>
        </button>
        <button
          onClick={() => {
            setTimerActive(false);
            setTimerSeconds(25 * 60);
          }}
          className="px-4 py-2.5 rounded-xl bg-white border-2 border-[#0F172A] text-[#0F172A] font-black text-xs hover:bg-gray-100 transition flex items-center gap-1 shadow-[2px_2px_0px_0px_#0F172A]"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
}
