'use client';

import { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { apiFetch } from '@/lib/api/client';
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      {/* Hidden audio element for WebRTC audio playback */}
      <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />

      <div className="w-full max-w-xl neo-box p-6 sm:p-8 space-y-6 bg-white shadow-[10px_10px_0px_0px_#0F172A]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b-2 border-[#0F172A] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FF7A30] border-2.5 border-[#0F172A] text-white font-black flex items-center justify-center text-lg shadow-[3px_3px_0px_0px_#0F172A]">
              {partner.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={partner.avatarUrl} alt={partner.name} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                partner.name.charAt(0)
              )}
            </div>
            <div>
              <h2 className="text-xl font-black text-[#0F172A]">{partner.name}</h2>
              <span className="text-xs text-gray-600 font-bold">Partner Audio Call Session</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`neo-badge text-xs px-3 py-1 font-black flex items-center gap-1.5 ${
                isConnected ? 'bg-[#84CC16] text-[#0F172A]' : 'bg-[#FACC15] text-[#0F172A]'
              }`}
            >
              <ZapIcon className="w-4 h-4" />
              <span>{isConnected ? 'Audio Connected' : 'Waiting Connection'}</span>
            </span>

            <button
              onClick={handleEndCall}
              className="w-9 h-9 rounded-xl bg-white border-2 border-[#0F172A] font-black text-sm flex items-center justify-center text-[#0F172A] hover:bg-red-500 hover:text-white transition shadow-[2px_2px_0px_0px_#0F172A]"
              title="Close modal"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* STEP 1: Mode Selection View */}
        {!session && !loading && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-[#0F172A]">Choose Audio Call Mode</h3>
              <p className="text-xs text-gray-600 font-bold">Select how you want to conduct your exchange call session.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <button
                onClick={() => handleStartCall('NORMAL')}
                className="p-5 rounded-2xl border-2.5 border-[#0F172A] bg-[#FFFDF7] hover:bg-[#FACC15] transition space-y-3 text-left shadow-[5px_5px_0px_0px_#0F172A] group"
              >
                <div className="w-10 h-10 rounded-xl bg-white border-2 border-[#0F172A] flex items-center justify-center text-[#FF7A30] shadow-[2px_2px_0px_0px_#0F172A]">
                  <PhoneIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-[#0F172A]">Normal Audio Call</h4>
                  <p className="text-xs text-gray-600 font-bold mt-1">Talk freely with your partner. Maximum 10 minutes total.</p>
                </div>
              </button>

              <button
                onClick={() => handleStartCall('AI_TOPIC_EXCHANGE')}
                className="p-5 rounded-2xl border-2.5 border-[#0F172A] bg-[#FFFDF7] hover:bg-[#84CC16] transition space-y-3 text-left shadow-[5px_5px_0px_0px_#0F172A] group"
              >
                <div className="w-10 h-10 rounded-xl bg-white border-2 border-[#0F172A] flex items-center justify-center text-[#06B6D4] shadow-[2px_2px_0px_0px_#0F172A]">
                  <SparklesIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-[#0F172A]">AI Topic Exchange</h4>
                  <p className="text-xs text-gray-600 font-bold mt-1">
                    Guided 5-minute topics generated for both partners after call acceptance.
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Ringing / Waiting Confirmation Screen */}
        {session && session.status === 'WAITING' && !loading && (
          <div className="py-8 text-center space-y-6">
            {session.requesterId === myUserId ? (
              // Outbound Call: User A Waiting for User B to pick up
              <div className="space-y-6">
                <div className="w-20 h-20 bg-[#FACC15] rounded-3xl border-3 border-[#0F172A] flex items-center justify-center mx-auto animate-bounce shadow-[4px_4px_0px_0px_#0F172A]">
                  <PhoneIcon className="w-10 h-10 text-[#0F172A]" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-[#0F172A]">Calling {partner.name}...</h3>
                  <p className="text-xs text-gray-600 font-bold">
                    Waiting for partner to accept your {session.mode === 'NORMAL' ? 'Normal Audio Call' : 'AI Topic Exchange'} invite.
                  </p>
                </div>
                <button
                  onClick={handleEndCall}
                  className="px-6 py-3 rounded-2xl bg-red-600 text-white font-black text-xs border-2 border-[#0F172A] shadow-[3px_3px_0px_0px_#0F172A] hover:bg-red-700 transition"
                >
                  Cancel Call
                </button>
              </div>
            ) : (
              // Inbound Call: User B Receiving call with Accept/Decline options
              <div className="space-y-6">
                <div className="w-20 h-20 bg-[#84CC16] rounded-3xl border-3 border-[#0F172A] flex items-center justify-center mx-auto animate-pulse shadow-[4px_4px_0px_0px_#0F172A]">
                  <PhoneIcon className="w-10 h-10 text-[#0F172A]" />
                </div>
                <div className="space-y-2">
                  <span className="neo-badge bg-[#FF7A30] text-white text-xs font-black px-3 py-1">
                    Incoming Audio Call
                  </span>
                  <h3 className="text-xl font-black text-[#0F172A]">{partner.name} is calling you!</h3>
                  <p className="text-xs text-gray-600 font-bold">
                    Mode: {session.mode === 'NORMAL' ? 'Normal Audio Call (10m)' : 'AI Topic Exchange Session'}
                  </p>
                </div>
                <div className="flex justify-center gap-4 pt-2">
                  <button
                    onClick={handleDeclineCall}
                    className="px-6 py-3.5 rounded-2xl bg-gray-100 border-2 border-[#0F172A] font-black text-xs flex items-center gap-2 shadow-[3px_3px_0px_0px_#0F172A] hover:bg-gray-200 transition"
                  >
                    <XIcon className="w-4 h-4 text-red-600" />
                    <span>Decline</span>
                  </button>
                  <button
                    onClick={handleAcceptCall}
                    className="px-8 py-3.5 rounded-2xl bg-[#84CC16] text-[#0F172A] border-2 border-[#0F172A] font-black text-xs flex items-center gap-2 shadow-[3px_3px_0px_0px_#0F172A] hover:bg-emerald-400 transition"
                  >
                    <CheckIcon className="w-5 h-5 text-[#0F172A]" />
                    <span>Accept Call</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Dedicated Loading View during Topic Generation */}
        {loading && (
          <div className="py-14 text-center space-y-4">
            <div className="w-16 h-16 bg-[#FFFDF7] border-2.5 border-[#0F172A] rounded-2xl flex items-center justify-center mx-auto shadow-[4px_4px_0px_0px_#0F172A]">
              <SparklesIcon className="w-8 h-8 text-[#FF7A30] animate-spin" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-[#0F172A]">Connecting Audio & Generating Topics...</h3>
              <p className="text-xs text-gray-600 font-bold max-w-sm mx-auto">
                Call accepted! Generating exchange topics for both partners & shuffling turn order...
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: Active Audio Session View */}
        {session && session.status !== 'WAITING' && !loading && (
          <div className="space-y-6">
            {/* Live State & Timer Display */}
            <div className="neo-box bg-[#FACC15] p-6 text-center space-y-3 shadow-[6px_6px_0px_0px_#0F172A]">
              <div className="flex items-center justify-between border-b-2 border-[#0F172A] pb-2">
                <span className="neo-badge bg-white text-[#0F172A] text-xs font-black">
                  {session.mode === 'NORMAL' ? 'Normal Audio Call' : 'AI Topic Exchange'}
                </span>
                <span className="text-xs font-black text-[#0F172A] uppercase flex items-center gap-1">
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

              <div className="text-6xl font-mono font-black text-[#0F172A] py-4 bg-white rounded-2xl border-3 border-[#0F172A] shadow-[4px_4px_0px_0px_#0F172A]">
                {formatTimer(timeRemaining)}
              </div>
            </div>

            {/* AI Topic Exchange Banner & Guided Topics */}
            {session.mode === 'AI_TOPIC_EXCHANGE' && (
              <div className="space-y-4">
                {/* Random Selection Result Banner */}
                <div className="p-3.5 rounded-xl border-2 border-[#0F172A] bg-[#F0F9FF] text-[#06B6D4] text-xs font-black flex items-center justify-between shadow-[3px_3px_0px_0px_#0F172A]">
                  <div className="flex items-center gap-2">
                    <DicesIcon className="w-5 h-5 flex-shrink-0" />
                    <span>
                      Random Turn Selection: {isFirstSpeaker ? 'You present first (Speaker 1)!' : `${partner.name} presents first (Speaker 1)!`}
                    </span>
                  </div>
                </div>

                {/* 30s Preparation Stage Banner with SKIP PREP Button */}
                {session.status === 'PREPARING' && (
                  <div className="p-4 rounded-2xl border-2 border-[#0F172A] bg-[#FFFDF7] space-y-3 shadow-[4px_4px_0px_0px_#0F172A]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-black text-[#FF7A30] uppercase">
                        <LightbulbIcon className="w-4 h-4" />
                        <span>30s Warm-Up Prep Phase</span>
                      </div>

                      {isFirstSpeaker && (
                        <button
                          onClick={handleSkipPrep}
                          className="px-3 py-1.5 rounded-xl bg-[#84CC16] text-[#0F172A] border-2 border-[#0F172A] text-xs font-black hover:bg-emerald-400 transition flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#0F172A]"
                        >
                          <FastForwardIcon className="w-4 h-4" />
                          <span>Skip Prep & Start Now</span>
                        </button>
                      )}
                    </div>

                    <p className="text-sm font-black text-[#0F172A]">
                      {isFirstSpeaker
                        ? 'Prepare your presentation! Your 5-minute turn starts right after this 30-second warm-up.'
                        : `${partner.name} is preparing! Get ready for your turn.`}
                    </p>
                  </div>
                )}

                {/* Generated Exchange Topics for Both Partners */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl border-2 border-[#0F172A] bg-[#FFFDF7] space-y-1 shadow-[3px_3px_0px_0px_#0F172A]">
                    <span className="text-[10px] font-black uppercase text-gray-500">Your Exchange Topic</span>
                    <p className="text-sm font-black text-[#0F172A]">
                      {session.userTopic || 'Open reciprocal skill exchange'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border-2 border-[#0F172A] bg-[#FFFDF7] space-y-1 shadow-[3px_3px_0px_0px_#0F172A]">
                    <span className="text-[10px] font-black uppercase text-gray-500">{partner.name}&apos;s Exchange Topic</span>
                    <p className="text-sm font-black text-[#0F172A]">
                      {session.partnerTopic || 'Open reciprocal skill exchange'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Controls Bar: Mute Microphone & Leave Call */}
            <div className="flex justify-center items-center gap-4 pt-2 border-t-2 border-[#0F172A]">
              <button
                onClick={toggleMute}
                className={`p-4 rounded-2xl border-2 border-[#0F172A] font-black text-xs flex items-center gap-2 shadow-[3px_3px_0px_0px_#0F172A] transition ${
                  isMuted ? 'bg-red-500 text-white' : 'bg-white text-[#0F172A] hover:bg-gray-100'
                }`}
              >
                {isMuted ? <MicOffIcon className="w-5 h-5" /> : <MicIcon className="w-5 h-5 text-[#84CC16]" />}
                <span>{isMuted ? 'Muted' : 'Mute Mic'}</span>
              </button>

              <button
                onClick={handleEndCall}
                className="px-6 py-4 rounded-2xl bg-red-600 text-white border-2 border-[#0F172A] font-black text-xs hover:bg-red-700 transition flex items-center gap-2 shadow-[3px_3px_0px_0px_#0F172A]"
              >
                <PhoneOffIcon className="w-5 h-5" />
                <span>End Audio Call</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
