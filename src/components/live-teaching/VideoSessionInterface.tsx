'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Hand } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useSocket } from '@/contexts/socket-context';

// Import related components
import { SessionControls } from './SessionControls';
import { WhiteboardPanel } from './WhiteboardPanel';
import { BreakoutRoomsPanel } from './BreakoutRoomsPanel';
import { AttendanceTracker } from './AttendanceTracker';
import { ParticipantList } from './ParticipantList';
import { ChatPanel } from './ChatPanel';
import { PollsPanel } from './PollsPanel';
import { ScreenShareDisplay } from './ScreenShareDisplay';
import { QualityIndicator } from './QualityIndicator';

import type { VideoParticipant } from '@/lib/types/live-teaching';
import {
  useGetVideoSessionQuery,
  useGetSessionParticipantsQuery,
  useJoinVideoSessionMutation,
  useLeaveVideoSessionMutation,
  useUpdateParticipantMutation,
} from '@/lib/redux/api/live-teaching-api';

interface VideoSessionInterfaceProps {
  sessionId: string;
  isHost?: boolean;
  onSessionEnd?: () => void;
}

interface MediaState {
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  isRecording: boolean;
  isFullscreen: boolean;
  volume: number;
}

interface UIState {
  activePanel:
    | 'participants'
    | 'chat'
    | 'whiteboard'
    | 'polls'
    | 'breakout'
    | null;
  showControls: boolean;
  viewMode: 'gallery' | 'speaker' | 'presentation';
  isMinimized: boolean;
}

export function VideoSessionInterface({
  sessionId,
  isHost = false,
  onSessionEnd,
}: VideoSessionInterfaceProps) {
  const { toast } = useToast();
  const socket = useSocket();
  const videoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());

  // API hooks
  const { data: session, isLoading: sessionLoading } =
    useGetVideoSessionQuery(sessionId);
  const { data: participants = [], refetch: refetchParticipants } =
    useGetSessionParticipantsQuery(sessionId);
  const [joinSession] = useJoinVideoSessionMutation();
  const [leaveSession] = useLeaveVideoSessionMutation();
  const [updateParticipant] = useUpdateParticipantMutation();

  // State management
  const [mediaState, setMediaState] = useState<MediaState>({
    isVideoEnabled: true,
    isAudioEnabled: true,
    isScreenSharing: false,
    isRecording: false,
    isFullscreen: false,
    volume: 1,
  });

  const [uiState, setUIState] = useState<UIState>({
    activePanel: null,
    showControls: true,
    viewMode: 'gallery',
    isMinimized: false,
  });

  const [connectionState, setConnectionState] = useState<{
    status: 'connecting' | 'connected' | 'disconnected' | 'reconnecting';
    quality: 'excellent' | 'good' | 'fair' | 'poor';
  }>({
    status: 'connecting',
    quality: 'good',
  });

  const [localParticipant, setLocalParticipant] =
    useState<VideoParticipant | null>(null);

  // Initialize media devices
  const initializeMedia = useCallback(async () => {
    try {
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Update media state based on actual tracks
      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];

      setMediaState(prev => ({
        ...prev,
        isVideoEnabled: videoTrack?.enabled ?? false,
        isAudioEnabled: audioTrack?.enabled ?? false,
      }));

      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast({
        title: 'Media Access Error',
        description:
          'Unable to access camera or microphone. Please check permissions.',
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast]);

  // Join session
  const handleJoinSession = useCallback(async () => {
    try {
      setConnectionState(prev => ({ ...prev, status: 'connecting' }));

      // Initialize media first
      await initializeMedia();

      // Join session via API
      const result = await joinSession({
        sessionId,
        displayName: 'Current User', // This should come from user context
      }).unwrap();

      setLocalParticipant(result.participant);
      setConnectionState(prev => ({ ...prev, status: 'connected' }));

      toast({
        title: 'Session Joined',
        description: 'Successfully joined the video session.',
      });
    } catch (error) {
      console.error('Error joining session:', error);
      setConnectionState(prev => ({ ...prev, status: 'disconnected' }));
      toast({
        title: 'Connection Error',
        description: 'Failed to join the session. Please try again.',
        variant: 'destructive',
      });
    }
  }, [sessionId, joinSession, initializeMedia, toast]);

  // Leave session
  const handleLeaveSession = useCallback(async () => {
    try {
      // Stop local media
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }

      // Close peer connections
      peerConnectionsRef.current.forEach(pc => pc.close());
      peerConnectionsRef.current.clear();

      // Leave session via API
      await leaveSession(sessionId);

      setConnectionState(prev => ({ ...prev, status: 'disconnected' }));
      setLocalParticipant(null);

      toast({
        title: 'Session Left',
        description: 'You have left the video session.',
      });

      onSessionEnd?.();
    } catch (error) {
      console.error('Error leaving session:', error);
      toast({
        title: 'Error',
        description: 'Error leaving session.',
        variant: 'destructive',
      });
    }
  }, [sessionId, leaveSession, onSessionEnd, toast]);

  // Toggle video
  const toggleVideo = useCallback(async () => {
    if (!localStreamRef.current) return;

    const videoTrack = localStreamRef.current.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setMediaState(prev => ({
        ...prev,
        isVideoEnabled: videoTrack.enabled,
      }));

      // Update participant state
      if (localParticipant) {
        await updateParticipant({
          sessionId,
          participantId: localParticipant.id,
          data: { videoDisabled: !videoTrack.enabled },
        });
      }

      // Emit socket event
      socket?.emit('participant:video_' + (videoTrack.enabled ? 'on' : 'off'), {
        sessionId,
        participantId: localParticipant?.id,
      });
    }
  }, [sessionId, localParticipant, updateParticipant, socket]);

  // Toggle audio
  const toggleAudio = useCallback(async () => {
    if (!localStreamRef.current) return;

    const audioTrack = localStreamRef.current.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMediaState(prev => ({
        ...prev,
        isAudioEnabled: audioTrack.enabled,
      }));

      // Update participant state
      if (localParticipant) {
        await updateParticipant({
          sessionId,
          participantId: localParticipant.id,
          data: { isMuted: !audioTrack.enabled },
        });
      }

      // Emit socket event
      socket?.emit('participant:' + (audioTrack.enabled ? 'unmute' : 'mute'), {
        sessionId,
        participantId: localParticipant?.id,
      });
    }
  }, [sessionId, localParticipant, updateParticipant, socket]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setMediaState(prev => ({ ...prev, isFullscreen: true }));
    } else {
      document.exitFullscreen();
      setMediaState(prev => ({ ...prev, isFullscreen: false }));
    }
  }, []);

  // Handle panel toggle
  const togglePanel = useCallback((panel: UIState['activePanel']) => {
    setUIState(prev => ({
      ...prev,
      activePanel: prev.activePanel === panel ? null : panel,
    }));
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleParticipantJoin = (data: { participant: VideoParticipant }) => {
      toast({
        title: 'Participant Joined',
        description: `${data.participant.user.name} joined the session`,
      });
      refetchParticipants();
    };

    const handleParticipantLeave = (data: { participantId: string }) => {
      toast({
        title: 'Participant Left',
        description: 'A participant left the session',
      });
      refetchParticipants();
    };

    socket.on('participant:join', handleParticipantJoin);
    socket.on('participant:leave', handleParticipantLeave);

    return () => {
      socket.off('participant:join', handleParticipantJoin);
      socket.off('participant:leave', handleParticipantLeave);
    };
  }, [socket, toast, refetchParticipants]);

  // Auto-hide controls
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimeout = () => {
      clearTimeout(timeoutId);
      setUIState(prev => ({ ...prev, showControls: true }));
      timeoutId = setTimeout(() => {
        setUIState(prev => ({ ...prev, showControls: false }));
      }, 3000);
    };

    const handleMouseMove = () => resetTimeout();
    const handleKeyPress = () => resetTimeout();

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('keypress', handleKeyPress);

    resetTimeout();

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('keypress', handleKeyPress);
    };
  }, []);

  // Initialize session on mount
  useEffect(() => {
    if (session && !localParticipant) {
      handleJoinSession();
    }

    return () => {
      if (localParticipant) {
        handleLeaveSession();
      }
    };
  }, [session, localParticipant, handleJoinSession, handleLeaveSession]);

  if (sessionLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
          <p className="text-white">Connecting to session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <h2 className="mb-2 text-xl font-semibold">Session Not Found</h2>
          <p className="text-gray-400">
            The requested session could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative h-screen w-full bg-gray-900 text-white',
        mediaState.isFullscreen && 'fixed inset-0 z-50'
      )}
    >
      {/* Main Video Area */}
      <div className="relative flex h-full">
        {/* Video Grid */}
        <div className="relative flex-1">
          {/* Local Video */}
          <div className="absolute inset-0">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="h-full w-full object-cover"
            />
          </div>

          {/* Participant Videos Grid */}
          <div className="absolute inset-0 grid auto-rows-fr gap-2 p-4">
            {participants.map(participant => (
              <ParticipantVideo
                key={participant.id}
                participant={participant}
                isLocal={participant.id === localParticipant?.id}
              />
            ))}
          </div>

          {/* Screen Share Display */}
          {participants.some(p => p.isScreenSharing) && (
            <ScreenShareDisplay
              participant={participants.find(p => p.isScreenSharing)!}
              onClose={() => {}}
            />
          )}

          {/* Quality Indicator */}
          <QualityIndicator
            quality={connectionState.quality}
            className="absolute left-4 top-4"
          />

          {/* Session Info */}
          <div className="absolute right-4 top-4">
            <Card className="bg-black/50 backdrop-blur">
              <CardContent className="p-3">
                <div className="text-sm">
                  <p className="font-semibold">{session.title}</p>
                  <p className="text-gray-300">
                    {participants.length} participants
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Side Panels */}
        <AnimatePresence>
          {uiState.activePanel && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-gray-700 bg-gray-800"
            >
              {uiState.activePanel === 'participants' && (
                <ParticipantList
                  sessionId={sessionId}
                  participants={participants}
                  isHost={isHost}
                  onClose={() => togglePanel('participants')}
                />
              )}
              {uiState.activePanel === 'chat' && (
                <ChatPanel
                  sessionId={sessionId}
                  onClose={() => togglePanel('chat')}
                />
              )}
              {uiState.activePanel === 'whiteboard' && (
                <WhiteboardPanel
                  sessionId={sessionId}
                  onClose={() => togglePanel('whiteboard')}
                />
              )}
              {uiState.activePanel === 'polls' && (
                <PollsPanel
                  sessionId={sessionId}
                  isHost={isHost}
                  onClose={() => togglePanel('polls')}
                />
              )}
              {uiState.activePanel === 'breakout' && (
                <BreakoutRoomsPanel
                  sessionId={sessionId}
                  isHost={isHost}
                  onClose={() => togglePanel('breakout')}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <AnimatePresence>
        {uiState.showControls && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-0 left-0 right-0"
          >
            <SessionControls
              session={session}
              mediaState={mediaState}
              participants={participants}
              isHost={isHost}
              onToggleVideo={toggleVideo}
              onToggleAudio={toggleAudio}
              onToggleFullscreen={toggleFullscreen}
              onLeaveSession={handleLeaveSession}
              onTogglePanel={togglePanel}
              activePanel={uiState.activePanel}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attendance Tracker */}
      {isHost && (
        <AttendanceTracker
          sessionId={sessionId}
          participants={participants}
          className="absolute left-1/2 top-4 -translate-x-1/2"
        />
      )}
    </div>
  );
}

// Individual participant video component
function ParticipantVideo({
  participant,
  isLocal = false,
}: {
  participant: VideoParticipant;
  isLocal?: boolean;
}) {
  return (
    <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-800">
      {/* Video placeholder when camera is off */}
      {participant.videoDisabled ? (
        <div className="flex h-full items-center justify-center">
          <Avatar className="h-16 w-16">
            <AvatarImage src={participant.user.avatar} />
            <AvatarFallback>
              {participant.user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      ) : (
        <video
          autoPlay
          muted={isLocal}
          playsInline
          className="h-full w-full object-cover"
        />
      )}

      {/* Participant Info */}
      <div className="absolute bottom-2 left-2 flex items-center space-x-2">
        <Badge
          variant={
            participant.connectionStatus === 'connected'
              ? 'default'
              : 'destructive'
          }
        >
          {participant.user.name}
          {isLocal && ' (You)'}
        </Badge>

        {participant.isMuted ? (
          <MicOff className="h-4 w-4 text-red-400" />
        ) : (
          <Mic className="h-4 w-4 text-green-400" />
        )}

        {participant.handRaised && <Hand className="h-4 w-4 text-yellow-400" />}
      </div>

      {/* Connection Quality */}
      <div className="absolute right-2 top-2">
        <div
          className={cn(
            'h-2 w-2 rounded-full',
            participant.networkQuality === 'excellent' && 'bg-green-400',
            participant.networkQuality === 'good' && 'bg-yellow-400',
            participant.networkQuality === 'fair' && 'bg-orange-400',
            participant.networkQuality === 'poor' && 'bg-red-400'
          )}
        />
      </div>
    </div>
  );
}
