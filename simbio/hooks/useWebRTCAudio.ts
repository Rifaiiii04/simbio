'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Socket } from 'socket.io-client';

interface UseWebRTCAudioOptions {
  socket: Socket | null;
  partnershipId: string;
  isCaller: boolean;
}

const ICE_SERVERS = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

export function useWebRTCAudio({ socket, partnershipId, isCaller }: UseWebRTCAudioOptions) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

  const cleanup = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setRemoteStream(null);
    setIsConnected(false);
  }, [localStream]);

  const initWebRTC = useCallback(async () => {
    try {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      setLocalStream(stream);

      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionRef.current = pc;

      // Add local audio tracks to peer connection
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // Handle incoming remote audio stream
      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
          if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = event.streams[0];
            remoteAudioRef.current.play().catch(console.error);
          }
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit('ice_candidate', { partnershipId, candidate: event.candidate });
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') {
          setIsConnected(true);
        } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
          setIsConnected(false);
        }
      };

      if (isCaller) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        if (socket) {
          socket.emit('audio_offer', { partnershipId, offer });
        }
      }
    } catch (err) {
      console.error('Failed to get user audio media', err);
    }
  }, [isCaller, partnershipId, socket]);

  useEffect(() => {
    if (!socket) return;

    const handleOffer = async (offer: RTCSessionDescriptionInit) => {
      if (!peerConnectionRef.current) {
        await initWebRTC();
      }
      const pc = peerConnectionRef.current;
      if (pc && (pc.signalingState === 'stable' || pc.signalingState === 'have-local-offer')) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('audio_answer', { partnershipId, answer });
        } catch (err) {
          console.error('Failed to process remote offer:', err);
        }
      }
    };

    const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
      const pc = peerConnectionRef.current;
      // Strictly set remote answer SDP only when peer connection is expecting an answer (have-local-offer state)
      if (pc && pc.signalingState === 'have-local-offer') {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (err) {
          console.error('Failed to process remote answer:', err);
        }
      }
    };

    const handleCandidate = async (candidate: RTCIceCandidateInit) => {
      const pc = peerConnectionRef.current;
      if (pc && pc.remoteDescription) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error('Failed to add ICE candidate:', err);
        }
      }
    };

    socket.on('audio_offer', handleOffer);
    socket.on('audio_answer', handleAnswer);
    socket.on('ice_candidate', handleCandidate);

    return () => {
      socket.off('audio_offer', handleOffer);
      socket.off('audio_answer', handleAnswer);
      socket.off('ice_candidate', handleCandidate);
    };
  }, [socket, partnershipId, initWebRTC]);

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted((prev) => !prev);
    }
  };

  return {
    localStream,
    remoteStream,
    isMuted,
    isConnected,
    toggleMute,
    initWebRTC,
    cleanup,
    remoteAudioRef,
  };
}
