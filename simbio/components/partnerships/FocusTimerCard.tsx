'use client';

import { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { Clock, CheckCircle2, Play, Pause, Lock, ShieldAlert, Check, X } from 'lucide-react';

interface FocusTimerCardProps {
  partnershipId: string;
  myUserId: string;
  partnerName: string;
  socket: Socket | null;
  onFocusStateChange?: (isFocusActive: boolean) => void;
}

export function FocusTimerCard({
  partnershipId,
  myUserId,
  partnerName,
  socket,
  onFocusStateChange,
}: FocusTimerCardProps) {
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [focusState, setFocusState] = useState<'IDLE' | 'START_PROPOSED' | 'ACTIVE' | 'PAUSE_PROPOSED'>('IDLE');
  const [proposalRequesterName, setProposalRequesterName] = useState<string | null>(null);
  const [isRequester, setIsRequester] = useState(false);
  const [sessionCompletedMsg, setSessionCompletedMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!socket) return;

    const handleStartProposed = (data: { requesterId: string; requesterName: string }) => {
      setFocusState('START_PROPOSED');
      setProposalRequesterName(data.requesterName);
      setIsRequester(data.requesterId === myUserId);
    };

    const handleStartRejected = () => {
      setFocusState('IDLE');
      setProposalRequesterName(null);
      setIsRequester(false);
    };

    const handleSessionStarted = () => {
      setFocusState('ACTIVE');
      setProposalRequesterName(null);
      setSessionCompletedMsg(null);
      onFocusStateChange?.(true);
    };

    const handlePauseProposed = (data: { requesterId: string; requesterName: string }) => {
      setFocusState('PAUSE_PROPOSED');
      setProposalRequesterName(data.requesterName);
      setIsRequester(data.requesterId === myUserId);
    };

    const handlePauseRejected = () => {
      setFocusState('ACTIVE');
      setProposalRequesterName(null);
    };

    const handleSessionPaused = () => {
      setFocusState('IDLE');
      setProposalRequesterName(null);
      setIsRequester(false);
      onFocusStateChange?.(false);
    };

    socket.on('focus_start_proposed', handleStartProposed);
    socket.on('focus_start_rejected', handleStartRejected);
    socket.on('focus_session_started', handleSessionStarted);
    socket.on('focus_pause_proposed', handlePauseProposed);
    socket.on('focus_pause_rejected', handlePauseRejected);
    socket.on('focus_session_paused', handleSessionPaused);

    return () => {
      socket.off('focus_start_proposed', handleStartProposed);
      socket.off('focus_start_rejected', handleStartRejected);
      socket.off('focus_session_started', handleSessionStarted);
      socket.off('focus_pause_proposed', handlePauseProposed);
      socket.off('focus_pause_rejected', handlePauseRejected);
      socket.off('focus_session_paused', handleSessionPaused);
    };
  }, [socket, myUserId, onFocusStateChange]);

  // Synchronous Pomodoro Countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (focusState === 'ACTIVE' && timerSeconds > 0) {
      interval = setInterval(() => setTimerSeconds((prev) => prev - 1), 1000);
    } else if (timerSeconds === 0) {
      setFocusState('IDLE');
      setSessionCompletedMsg('25-Minute Focus Session Completed! 🎉');
      onFocusStateChange?.(false);
    }
    return () => clearInterval(interval);
  }, [focusState, timerSeconds, onFocusStateChange]);

  // Handlers for Mutual Actions
  const handleProposeStart = () => {
    setFocusState('START_PROPOSED');
    setIsRequester(true);
    setProposalRequesterName('Saya');
    if (socket) {
      socket.emit('focus_request_start', { partnershipId, requesterId: myUserId, requesterName: 'Saya' });
    }
  };

  const handleAcceptStart = () => {
    setFocusState('ACTIVE');
    onFocusStateChange?.(true);
    if (socket) {
      socket.emit('focus_accept_start', { partnershipId });
    }
  };

  const handleRejectStart = () => {
    setFocusState('IDLE');
    if (socket) {
      socket.emit('focus_reject_start', { partnershipId });
    }
  };

  const handleProposePause = () => {
    setFocusState('PAUSE_PROPOSED');
    setIsRequester(true);
    setProposalRequesterName('Saya');
    if (socket) {
      socket.emit('focus_request_pause', { partnershipId, requesterId: myUserId, requesterName: 'Saya' });
    }
  };

  const handleAcceptPause = () => {
    setFocusState('IDLE');
    onFocusStateChange?.(false);
    if (socket) {
      socket.emit('focus_accept_pause', { partnershipId });
    }
  };

  const handleRejectPause = () => {
    setFocusState('ACTIVE');
    if (socket) {
      socket.emit('focus_reject_pause', { partnershipId });
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="soft-card p-5 bg-gradient-to-br from-amber-50/80 via-white to-orange-50/80 border border-amber-200/80 text-center space-y-4 shadow-xs relative overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
          <Clock className="w-4 h-4 text-[#FF6B30]" />
          <span>Focus Belajar Bareng (Sync)</span>
        </div>
        <span className="soft-badge bg-white text-slate-800 border-amber-200 text-[10px] font-mono">
          25 Min Pomodoro
        </span>
      </div>

      {/* Synchronized Timer Display */}
      <div className="text-5xl font-mono font-bold text-slate-900 py-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
        {formatTimer(timerSeconds)}
      </div>

      {sessionCompletedMsg && (
        <div className="p-2.5 text-[11px] bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 rounded-xl flex items-center justify-center gap-1.5 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{sessionCompletedMsg}</span>
        </div>
      )}

      {/* State Machine UI Controls */}

      {/* STATE 1: IDLE */}
      {focusState === 'IDLE' && (
        <button
          type="button"
          onClick={handleProposeStart}
          className="w-full soft-button bg-slate-900 hover:bg-slate-800 text-white py-3 text-xs flex items-center justify-center gap-2 shadow-xs"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Ajukan Start Focus Session 🚀</span>
        </button>
      )}

      {/* STATE 2: START_PROPOSED */}
      {focusState === 'START_PROPOSED' && (
        <div className="p-3 bg-white border border-slate-200 rounded-xl text-left space-y-2.5 shadow-xs">
          {isRequester ? (
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Clock className="w-4 h-4 text-[#FF6B30] animate-spin" />
              <span>Menunggu Ready dari {partnerName}... (1/2)</span>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-900">
                🔥 {proposalRequesterName || partnerName} mengajak Start Focus Session (25 Min)! Apakah kamu Siap (Ready)?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAcceptStart}
                  className="flex-1 soft-button bg-[#10B981] hover:bg-emerald-600 text-white py-2 text-xs flex items-center justify-center gap-1"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Ready & Start! 🚀</span>
                </button>
                <button
                  type="button"
                  onClick={handleRejectStart}
                  className="px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold hover:bg-red-50 hover:text-red-600 transition"
                >
                  <X className="w-4 h-4 text-slate-600 hover:text-red-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STATE 3: ACTIVE (Running & Distraction Lock) */}
      {focusState === 'ACTIVE' && (
        <div className="space-y-2.5">
          <div className="p-2.5 bg-sky-50 border border-sky-200 rounded-xl text-xs font-bold text-sky-800 flex items-center justify-center gap-1.5 shadow-2xs">
            <Lock className="w-4 h-4 text-sky-600" />
            <span>Mode Fokus Aktif (Chat & Navigasi Dikunci)</span>
          </div>

          <button
            type="button"
            onClick={handleProposePause}
            className="w-full soft-button bg-[#FF6B30] text-white py-2.5 text-xs flex items-center justify-center gap-2"
          >
            <Pause className="w-4 h-4" />
            <span>Request Pause / End Focus</span>
          </button>
        </div>
      )}

      {/* STATE 4: PAUSE_PROPOSED */}
      {focusState === 'PAUSE_PROPOSED' && (
        <div className="p-3 bg-white border border-slate-200 rounded-xl text-left space-y-2.5 shadow-xs">
          {isRequester ? (
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Clock className="w-4 h-4 text-[#FF6B30] animate-spin" />
              <span>Permintaan Jeda Terkirim... Menunggu persetujuan {partnerName}</span>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-900">
                ⏸️ {proposalRequesterName || partnerName} meminta untuk menghentikan sementara Focus Session. Apakah kamu setuju?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAcceptPause}
                  className="flex-1 soft-button bg-[#FF6B30] text-white py-2 text-xs flex items-center justify-center gap-1"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Setujui Jeda 🤝</span>
                </button>
                <button
                  type="button"
                  onClick={handleRejectPause}
                  className="px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold hover:bg-slate-200 transition text-slate-700"
                >
                  <span>Lanjutkan Fokus</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
