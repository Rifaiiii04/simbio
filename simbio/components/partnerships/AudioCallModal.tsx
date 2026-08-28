'use client';

import { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { apiFetch, getAvatarUrl } from '@/lib/api/client';
import { useWebRTCAudio } from '@/hooks/useWebRTCAudio';
import {
  Phone as PhoneIcon,
  PhoneOff as PhoneOffIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Sparkles as SparklesIcon,
  Zap as ZapIcon,
  Lightbulb as LightbulbIcon,
  Dices as DicesIcon,
  Clock as ClockIcon,
  Check as CheckIcon,
  X as XIcon,
  FastForward as FastForwardIcon,
} from 'lucide-react';

interface PartnerSummary {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface AudioSessionData {
  id: string;
  partnershipId: string;
  mode: 'NORMAL' | 'AI_TOPIC_EXCHANGE';
  status: 'WAITING' | 'PREPARING' | 'USER_A_TURN' | 'USER_B_TURN' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';
  requesterId: string;
  recipientId: string;
  firstSpeakerId: string | null;
  secondSpeakerId: string | null;
  currentSpeakerId: string | null;
  startedAt: string | null;
  turnStartedAt: string | null;
  userTopic?: string | null;
  partnerTopic?: string | null;
  userTopicStatus?: string | null;
}

interface AudioCallModalProps {
  partnershipId: string;
  partner: PartnerSummary;
  myUserId: string;
  socket: Socket | null;
  onClose: () => void;
  incomingSession?: AudioSessionData | null;
}

export function AudioCallModal({
  partnershipId,
  partner,
  myUserId,
  socket,
  onClose,
  incomingSession,
}: AudioCallModalProps) {
  const [session, setSession] = useState<AudioSessionData | null>(incomingSession || null);
  const [loading, setLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  const isCaller = session ? session.requesterId === myUserId : true;

  const {
    isMuted,
    isConnected,
    toggleMute,
    initWebRTC,
    cleanup,
    remoteAudioRef,
  } = useWebRTCAudio({ socket, partnershipId, isCaller });

  // Load active audio session on mount if not provided
  useEffect(() => {
    if (incomingSession) return;
    async function syncActiveSession() {
      try {
        const res = await apiFetch<{ session: AudioSessionData | null }>(
          `/partnerships/${partnershipId}/audio-sessions/current`
        );
        if (res.session && res.session.status !== 'COMPLETED' && res.session.status !== 'CANCELLED' && res.session.status !== 'REJECTED') {
          setSession(res.session);
          if (res.session.status !== 'WAITING') {
            initWebRTC();
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    syncActiveSession();
  }, [partnershipId, incomingSession, initWebRTC]);

  // Real-Time Socket Event Listeners for Call Confirmation
  useEffect(() => {
    if (!socket) return;

    const handleCallAccepting = () => {
      setLoading(true);
    };

    const handleCallAccepted = (sess: AudioSessionData) => {
      setSession(sess);
      setLoading(false);
      initWebRTC();
    };

    const handleCallRejected = () => {
      setLoading(false);
      cleanup();
      onClose();
    };

    const handleCallEnded = () => {
      setLoading(false);
      cleanup();
      onClose();
    };

    socket.on('audio_call_accepting', handleCallAccepting);
    socket.on('audio_call_accepted', handleCallAccepted);
    socket.on('audio_call_rejected', handleCallRejected);
    socket.on('audio_session_ended', handleCallEnded);

    return () => {
      socket.off('audio_call_accepting', handleCallAccepting);
      socket.off('audio_call_accepted', handleCallAccepted);
      socket.off('audio_call_rejected', handleCallRejected);
      socket.off('audio_session_ended', handleCallEnded);
    };
  }, [socket, initWebRTC, cleanup, onClose]);

  // Session State Timer Calculation Engine
  useEffect(() => {
    if (!session || session.status === 'WAITING' || session.status === 'COMPLETED' || session.status === 'CANCELLED' || session.status === 'REJECTED') return;

    const interval = setInterval(async () => {
      try {
        const res = await apiFetch<{ session: AudioSessionData | null }>(
          `/partnerships/${partnershipId}/audio-sessions/current`
        );

        if (!res.session || res.session.status === 'COMPLETED' || res.session.status === 'CANCELLED' || res.session.status === 'REJECTED') {
          cleanup();
          onClose();
          return;
        }

        setSession(res.session);

        const now = Date.now();
        const startedAtMs = res.session.startedAt ? new Date(res.session.startedAt).getTime() : now;
        const turnStartedAtMs = res.session.turnStartedAt
          ? new Date(res.session.turnStartedAt).getTime()
          : startedAtMs;

        if (res.session.mode === 'NORMAL') {
          const elapsed = Math.floor((now - startedAtMs) / 1000);
          setTimeRemaining(Math.max(0, 600 - elapsed));
        } else if (res.session.mode === 'AI_TOPIC_EXCHANGE') {
          if (res.session.status === 'PREPARING') {
            const elapsed = Math.floor((now - startedAtMs) / 1000);
            setTimeRemaining(Math.max(0, 30 - elapsed));
          } else {
            const elapsed = Math.floor((now - turnStartedAtMs) / 1000);
            setTimeRemaining(Math.max(0, 300 - elapsed));
          }
        }
      } catch (err) {
        console.error(err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session, partnershipId, cleanup, onClose]);

  const handleStartCall = async (mode: 'NORMAL' | 'AI_TOPIC_EXCHANGE') => {
    setLoading(true);
    try {
      const res = await apiFetch<{ session: AudioSessionData }>(
        `/partnerships/${partnershipId}/audio-sessions`,
        {
          method: 'POST',
          body: JSON.stringify({ mode }),
        }
      );
      setSession(res.session);

      if (socket) {
        socket.emit('incoming_audio_call', { partnershipId, session: res.session });
      }
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptCall = async () => {
    if (!session) return;
    setLoading(true);
    if (socket) {
      socket.emit('audio_call_accepting', { partnershipId });
    }
    try {
      const res = await apiFetch<{ session: AudioSessionData }>(
        `/partnerships/audio-sessions/${session.id}/accept`,
        { method: 'POST' }
      );
      setSession(res.session);

      if (socket) {
        socket.emit('audio_call_accepted', { partnershipId, session: res.session });
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleSkipPrep = async () => {
    if (!session) return;
    try {
      const res = await apiFetch<{ session: AudioSessionData }>(
        `/partnerships/audio-sessions/${session.id}/skip-prep`,
        { method: 'POST' }
      );
      setSession(res.session);

      if (socket) {
        socket.emit('audio_call_accepted', { partnershipId, session: res.session });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeclineCall = async () => {
    if (session) {
      try {
        await apiFetch(`/partnerships/audio-sessions/${session.id}/reject`, { method: 'POST' });
        if (socket) {
          socket.emit('audio_call_rejected', { partnershipId });
        }
      } catch (err) {
        console.error(err);
      }
    }
    cleanup();
    onClose();
  };

  const handleEndCall = async () => {
    if (session) {
      try {
        await apiFetch(`/partnerships/audio-sessions/${session.id}/leave`, { method: 'POST' });
        if (socket) {
          socket.emit('audio_session_ended', { partnershipId });
        }
      } catch (err) {
        console.error(err);
      }
    }
    cleanup();
    onClose();
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isFirstSpeaker = session?.firstSpeakerId === myUserId;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Hidden audio element for WebRTC audio playback */}
      <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />

      <div className="w-full max-w-lg bg-white/95 backdrop-blur-2xl rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#FF6B30] to-orange-400 text-white font-bold flex items-center justify-center text-base shadow-sm shrink-0 overflow-hidden">
              <img 
                src={getAvatarUrl(partner.avatarUrl, partner.name)} 
                alt={partner.name} 
                className="w-full h-full object-cover" 
              />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-snug">{partner.name}</h2>
              <span className="text-[11px] text-slate-500 font-medium">Partner Audio Call Session</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5 border transition-colors ${
                isConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              <ZapIcon className="w-3.5 h-3.5" />
              <span>{isConnected ? 'Audio Connected' : 'Waiting Connection'}</span>
            </span>

            <button
              onClick={handleEndCall}
              className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition flex items-center justify-center cursor-pointer"
              title="Close modal"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* STEP 1: Mode Selection View */}
        {!session && !loading && (
          <div className="space-y-5">
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Choose Audio Call Mode</h3>
              <p className="text-xs text-slate-500 font-medium">Select how you want to conduct your exchange call session.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3.5">
              <button
                onClick={() => handleStartCall('NORMAL')}
                className="p-4.5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-orange-50/50 hover:border-orange-200 transition-all text-left space-y-2.5 group cursor-pointer shadow-2xs hover:shadow-xs"
              >
                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#FF6B30] group-hover:scale-105 transition-transform shadow-2xs">
                  <PhoneIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#FF6B30] transition-colors">
                    Normal Audio Call
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5">
                    Talk freely with your partner. Maximum 10 minutes total.
                  </p>
                </div>
              </button>

              <button
                onClick={() => handleStartCall('AI_TOPIC_EXCHANGE')}
                className="p-4.5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-orange-50/50 hover:border-orange-200 transition-all text-left space-y-2.5 group cursor-pointer shadow-2xs hover:shadow-xs"
              >
                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-cyan-600 group-hover:scale-105 transition-transform shadow-2xs">
                  <SparklesIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#FF6B30] transition-colors">
                    AI Topic Exchange
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5">
                    Guided 5-minute topics generated for both partners after call acceptance.
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Ringing / Waiting Confirmation Screen */}
        {session && session.status === 'WAITING' && !loading && (
          <div className="py-6 text-center space-y-5">
            {session.requesterId === myUserId ? (
              // Outbound Call: User A Waiting for User B to pick up
              <div className="space-y-5">
                <div className="w-18 h-18 bg-gradient-to-tr from-[#FF6B30] to-orange-400 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-orange-500/25 animate-pulse text-white">
                  <PhoneIcon className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">Calling {partner.name}...</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Waiting for partner to accept your {session.mode === 'NORMAL' ? 'Normal Audio Call' : 'AI Topic Exchange'} invite.
                  </p>
                </div>
                <button
                  onClick={handleEndCall}
                  className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition border border-slate-200 cursor-pointer"
                >
                  Cancel Call
                </button>
              </div>
            ) : (
              // Inbound Call: User B Receiving call with Accept/Decline options
              <div className="space-y-5">
                <div className="w-18 h-18 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/25 animate-bounce text-white">
                  <PhoneIcon className="w-8 h-8" />
                </div>
                <div className="space-y-1.5">
                  <span className="inline-block px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-[#FF6B30] text-[11px] font-bold">
                    Incoming Audio Call
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">{partner.name} is calling you!</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Mode: {session.mode === 'NORMAL' ? 'Normal Audio Call (10m)' : 'AI Topic Exchange Session'}
                  </p>
                </div>
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={handleDeclineCall}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <XIcon className="w-4 h-4 text-rose-500" />
                    <span>Decline</span>
                  </button>
                  <button
                    onClick={handleAcceptCall}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-emerald-500/25 cursor-pointer"
                  >
                    <CheckIcon className="w-4 h-4" />
                    <span>Accept Call</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Dedicated Loading View during Topic Generation */}
        {loading && (
          <div className="py-10 text-center space-y-3">
            <div className="w-14 h-14 bg-orange-50 border border-orange-200 rounded-2xl flex items-center justify-center mx-auto text-[#FF6B30]">
              <SparklesIcon className="w-6 h-6 animate-spin" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900">Connecting Audio & Generating Topics...</h3>
              <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">
                Call accepted! Generating exchange topics for both partners & shuffling turn order...
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: Active Audio Session View */}
        {session && session.status !== 'WAITING' && !loading && (
          <div className="space-y-5">
            {/* Live State & Timer Display */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-5 text-center space-y-3 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <span className="text-[11px] font-bold text-slate-300 bg-white/10 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                  {session.mode === 'NORMAL' ? 'Normal Audio Call' : 'AI Topic Exchange'}
                </span>
                <span className="text-[11px] font-bold text-orange-400 uppercase flex items-center gap-1">
                  <ClockIcon className="w-3.5 h-3.5" />
                  <span>
                    {session.status === 'PREPARING'
                      ? '30s Warm-Up Preparation'
                      : session.status === 'USER_A_TURN'
                      ? `${session.firstSpeakerId === myUserId ? 'Your Turn' : partner.name + "'s Turn"}`
                      : `${session.secondSpeakerId === myUserId ? 'Your Turn' : partner.name + "'s Turn"}`}
                  </span>
                </span>
              </div>

              <div className="text-5xl sm:text-6xl font-mono font-black text-white tracking-wider py-2">
                {formatTimer(timeRemaining)}
              </div>
            </div>

            {/* AI Topic Exchange Banner & Guided Topics */}
            {session.mode === 'AI_TOPIC_EXCHANGE' && (
              <div className="space-y-3">
                {/* Random Selection Result Banner */}
                <div className="p-3 rounded-2xl bg-cyan-50/80 border border-cyan-200/80 text-cyan-900 text-xs font-bold flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-2">
                    <DicesIcon className="w-4 h-4 text-cyan-600 shrink-0" />
                    <span>
                      Random Turn Selection: {isFirstSpeaker ? 'You present first (Speaker 1)!' : `${partner.name} presents first (Speaker 1)!`}
                    </span>
                  </div>
                </div>

                {/* 30s Preparation Stage Banner with SKIP PREP Button */}
                {session.status === 'PREPARING' && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase">
                        <LightbulbIcon className="w-4 h-4 text-amber-600" />
                        <span>30s Warm-Up Prep Phase</span>
                      </div>

                      {isFirstSpeaker && (
                        <button
                          onClick={handleSkipPrep}
                          className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-900 text-[11px] font-bold hover:bg-amber-100 transition flex items-center gap-1 shadow-2xs cursor-pointer"
                        >
                          <FastForwardIcon className="w-3.5 h-3.5" />
                          <span>Skip Prep</span>
                        </button>
                      )}
                    </div>

                    <p className="text-xs font-bold text-slate-800">
                      {isFirstSpeaker
                        ? 'Prepare your presentation! Your 5-minute turn starts right after this 30-second warm-up.'
                        : `${partner.name} is preparing! Get ready for your turn.`}
                    </p>
                  </div>
                )}

                {/* Generated Exchange Topics for Both Partners */}
                <div className="grid sm:grid-cols-2 gap-2.5">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Your Exchange Topic</span>
                    <p className="text-xs font-bold text-slate-800 leading-snug">
                      {session.userTopic || 'Open reciprocal skill exchange'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase text-slate-400">{partner.name}&apos;s Exchange Topic</span>
                    <p className="text-xs font-bold text-slate-800 leading-snug">
                      {session.partnerTopic || 'Open reciprocal skill exchange'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Controls Bar: Mute Microphone & Leave Call */}
            <div className="flex justify-center items-center gap-3 pt-2 border-t border-slate-100">
              <button
                onClick={toggleMute}
                className={`px-5 py-3 rounded-2xl border font-bold text-xs flex items-center gap-2 transition cursor-pointer ${
                  isMuted
                    ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
                    : 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'
                }`}
              >
                {isMuted ? <MicOffIcon className="w-4 h-4" /> : <MicIcon className="w-4 h-4 text-emerald-600" />}
                <span>{isMuted ? 'Muted' : 'Mute Mic'}</span>
              </button>

              <button
                onClick={handleEndCall}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold text-xs transition flex items-center gap-2 shadow-md shadow-rose-500/25 cursor-pointer"
              >
                <PhoneOffIcon className="w-4 h-4" />
                <span>End Audio Call</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
