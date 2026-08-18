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
    <div className="neo-box bg-[#FACC15] p-5 text-center space-y-4 shadow-[6px_6px_0px_0px_#0F172A] relative overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b-2 border-[#0F172A] pb-2">
        <div className="flex items-center gap-1.5 text-xs font-black text-[#0F172A] uppercase tracking-wider">
          <Clock className="w-4 h-4 text-[#0F172A]" />
          <span>Focus Belajar Bareng (Sync)</span>
        </div>
        <span className="neo-badge bg-white text-[#0F172A] text-[10px] px-2 py-0.5 font-mono font-bold">
          25 Min Pomodoro
        </span>
      </div>

      {/* Synchronized Timer Display */}
      <div className="text-5xl font-mono font-black text-[#0F172A] py-4 bg-white rounded-2xl border-3 border-[#0F172A] shadow-[4px_4px_0px_0px_#0F172A]">
        {formatTimer(timerSeconds)}
      </div>

      {sessionCompletedMsg && (
        <div className="p-2.5 text-[11px] bg-[#84CC16] text-[#0F172A] font-black border-2 border-[#0F172A] rounded-xl flex items-center justify-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" />
          <span>{sessionCompletedMsg}</span>
        </div>
      )}

      {/* State Machine UI Controls */}

      {/* STATE 1: IDLE */}
      {focusState === 'IDLE' && (
        <button
          type="button"
          onClick={handleProposeStart}
          className="w-full neo-button bg-[#0F172A] text-white py-3 text-xs flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Ajukan Start Focus Session 🚀</span>
        </button>
      )}

      {/* STATE 2: START_PROPOSED */}
      {focusState === 'START_PROPOSED' && (
        <div className="p-3 bg-white border-2 border-[#0F172A] rounded-xl text-left space-y-2.5 shadow-[2px_2px_0px_0px_#0F172A]">
          {isRequester ? (
            <div className="flex items-center gap-2 text-xs font-black text-[#0F172A]">
              <Clock className="w-4 h-4 text-[#FF7A30] animate-spin" />
              <span>Menunggu Ready dari {partnerName}... (1/2)</span>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-black text-[#0F172A]">
                🔥 {proposalRequesterName || partnerName} mengajak Start Focus Session (25 Min)! Apakah kamu Siap (Ready)?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAcceptStart}
                  className="flex-1 neo-button bg-[#84CC16] text-[#0F172A] py-2 text-xs flex items-center justify-center gap-1"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Ready & Start! 🚀</span>
                </button>
                <button
                  type="button"
                  onClick={handleRejectStart}
                  className="px-3 py-2 rounded-xl bg-gray-100 border-2 border-[#0F172A] text-xs font-black hover:bg-red-100 transition"
                >
                  <X className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STATE 3: ACTIVE (Running & Distraction Lock) */}
      {focusState === 'ACTIVE' && (
        <div className="space-y-2.5">
          <div className="p-2.5 bg-[#ECFEFF] border-2 border-[#06B6D4] rounded-xl text-xs font-black text-[#0F172A] flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_#06B6D4]">
            <Lock className="w-4 h-4 text-[#06B6D4]" />
            <span>Mode Fokus Aktif (Chat & Navigasi Dikunci)</span>
          </div>

          <button
            type="button"
            onClick={handleProposePause}
            className="w-full neo-button bg-[#FF7A30] text-white py-2.5 text-xs flex items-center justify-center gap-2"
          >
            <Pause className="w-4 h-4" />
            <span>Request Pause / End Focus</span>
          </button>
        </div>
      )}

      {/* STATE 4: PAUSE_PROPOSED */}
      {focusState === 'PAUSE_PROPOSED' && (
        <div className="p-3 bg-white border-2 border-[#0F172A] rounded-xl text-left space-y-2.5 shadow-[2px_2px_0px_0px_#0F172A]">
          {isRequester ? (
            <div className="flex items-center gap-2 text-xs font-black text-[#0F172A]">
              <Clock className="w-4 h-4 text-[#FF7A30] animate-spin" />
              <span>Permintaan Jeda Terkirim... Menunggu persetujuan {partnerName}</span>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-black text-[#0F172A]">
                ⏸️ {proposalRequesterName || partnerName} meminta untuk menghentikan sementara Focus Session. Apakah kamu setuju?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAcceptPause}
                  className="flex-1 neo-button bg-[#FF7A30] text-white py-2 text-xs flex items-center justify-center gap-1"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Setujui Jeda 🤝</span>
                </button>
                <button
                  type="button"
                  onClick={handleRejectPause}
                  className="px-3 py-2 rounded-xl bg-gray-100 border-2 border-[#0F172A] text-xs font-black hover:bg-gray-200 transition"
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
