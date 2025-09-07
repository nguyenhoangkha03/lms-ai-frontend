'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Hand } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { TooltipProvider } from '@/components/ui/tooltip';
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
  const { data: participantsData, refetch: refetchParticipants } =
    useGetSessionParticipantsQuery(sessionId);
  const [joinSession] = useJoinVideoSessionMutation();
  const [leaveSession] = useLeaveVideoSessionMutation();
  const [updateParticipant] = useUpdateParticipantMutation();

  // Ensure participants is always an array
  const participants = Array.isArray(participantsData) ? participantsData : [];

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

  const [permissionState, setPermissionState] = useState<{
    status: 'pending' | 'granted' | 'denied';
    requested: boolean;
    reason?: 'user_denied' | 'policy_blocked' | 'insecure_context' | 'device_error';
  }>({
    status: 'pending',
    requested: false,
  });

  const [localParticipant, setLocalParticipant] =
    useState<VideoParticipant | null>(null);

  // Check if permissions policy allows media access
  const checkPermissionsPolicy = useCallback(() => {
    try {
      // Try modern Permissions Policy API first
      if (document.permissionsPolicy) {
        const cameraAllowed = document.permissionsPolicy.allowsFeature('camera');
        const microphoneAllowed = document.permissionsPolicy.allowsFeature('microphone');
        
        return {
          camera: cameraAllowed,
          microphone: microphoneAllowed
        };
      }
      
      // Try legacy Feature Policy API
      if (document.featurePolicy) {
        const cameraAllowed = document.featurePolicy.allowsFeature('camera');
        const microphoneAllowed = document.featurePolicy.allowsFeature('microphone');
        
        return {
          camera: cameraAllowed,
          microphone: microphoneAllowed
        };
      }
      
      // If no policy API is available, assume allowed (for older browsers)
      return { camera: true, microphone: true };
      
    } catch (error) {
      console.warn('Could not check permissions policy:', error);
      // If we can't check, assume allowed and let the actual getUserMedia call handle the error
      return { camera: true, microphone: true };
    }
  }, []);

  // Initialize media devices
  const initializeMedia = useCallback(async () => {
    // Don't try again if permission was denied
    if (permissionState.status === 'denied') {
      throw new Error('Media permission denied');
    }

    // Don't spam requests
    if (permissionState.requested && permissionState.status === 'pending') {
      throw new Error('Media permission request in progress');
    }

    // Check if we're running on HTTP (not secure context)
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      setPermissionState({ status: 'denied', requested: true, reason: 'insecure_context' });
      toast({
        title: 'HTTPS Required',
        description: 'Camera and microphone access requires a secure connection (HTTPS). Please use HTTPS or localhost.',
        variant: 'destructive',
      });
      throw new Error('Insecure context - HTTPS required for media access');
    }

    // Check permissions policy (only log for debugging, don't block)
    const policyCheck = checkPermissionsPolicy();
    console.log('Permissions Policy Check:', policyCheck);
    
    // COMPLETELY SKIP policy check for now - let getUserMedia handle the actual restriction
    console.log('Skipping permissions policy check - will attempt direct getUserMedia call');

    // Check if media devices API is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setPermissionState({ status: 'denied', requested: true });
      toast({
        title: 'Media Not Supported',
        description: 'Your browser does not support camera and microphone access.',
        variant: 'destructive',
      });
      throw new Error('Media devices API not supported');
    }

    try {
      setPermissionState(prev => ({ ...prev, requested: true }));

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

      setPermissionState({ status: 'granted', requested: true });
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      
      if (error.name === 'NotAllowedError') {
        setPermissionState({ status: 'denied', requested: true, reason: 'user_denied' });
        toast({
          title: 'Media Permission Denied',
          description:
            'Camera and microphone access was denied. Please enable permissions in your browser settings and refresh the page.',
          variant: 'destructive',
        });
      } else if (error.name === 'NotFoundError') {
        setPermissionState({ status: 'denied', requested: true, reason: 'device_error' });
        toast({
          title: 'No Media Devices Found',
          description:
            'No camera or microphone found. Please check your devices are connected.',
          variant: 'destructive',
        });
      } else if (error.name === 'NotReadableError') {
        setPermissionState({ status: 'denied', requested: true, reason: 'device_error' });
        toast({
          title: 'Device In Use',
          description:
            'Camera or microphone is already in use by another application.',
          variant: 'destructive',
        });
      } else {
        setPermissionState({ status: 'pending', requested: false });
        toast({
          title: 'Media Access Error',
          description:
            'Unable to access camera or microphone. Please check your devices and try again.',
          variant: 'destructive',
        });
      }
      throw error;
    }
  }, [toast, permissionState, checkPermissionsPolicy]);

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

  // Add meta tag and try to override permissions policy
  useEffect(() => {
    // Multiple approaches to override permissions policy
    
    // 1. Add meta tag
    const existingMeta = document.querySelector('meta[name="permissions-policy"]');
    if (existingMeta) {
      existingMeta.setAttribute('content', 'camera=*, microphone=*, display-capture=*, screen-wake-lock=*');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'permissions-policy';
      meta.content = 'camera=*, microphone=*, display-capture=*, screen-wake-lock=*';
      document.head.appendChild(meta);
    }

    // 2. Try to set via HTTP-equiv
    const httpEquivMeta = document.createElement('meta');
    httpEquivMeta.httpEquiv = 'Permissions-Policy';
    httpEquivMeta.content = 'camera=*, microphone=*, display-capture=*, screen-wake-lock=*';
    document.head.appendChild(httpEquivMeta);

    // 3. Try iframe allow attribute (if in iframe)
    if (window.self !== window.top) {
      console.log('Running in iframe - attempting to request permissions');
      const iframe = window.frameElement;
      if (iframe) {
        iframe.setAttribute('allow', 'camera *; microphone *; display-capture *');
      }
    }

    // 4. Log current policy status for debugging
    console.log('Attempting to override permissions policy...');
    console.log('Document location:', window.location.href);
    console.log('Document referrer:', document.referrer);
    console.log('Window parent:', window.parent === window ? 'no parent' : 'has parent');
    
    // 5. Check if we can fetch current headers
    fetch(window.location.href)
      .then(response => {
        console.log('Response headers:');
        for (const [key, value] of response.headers.entries()) {
          console.log(`${key}: ${value}`);
        }
      })
      .catch(err => console.log('Could not fetch headers:', err));
    
    return () => {
      // Don't remove on cleanup as other pages might need it
    };
  }, []);

  // Initialize session on mount
  useEffect(() => {
    if (session && !localParticipant) {
      handleJoinSession();
    }
  }, [session, localParticipant]); // Remove handleJoinSession from deps

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localParticipant) {
        handleLeaveSession();
      }
    };
  }, []); // Empty deps for cleanup only

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

  // Permission denied state
  if (permissionState.status === 'denied') {
    const getUIConfig = () => {
      switch (permissionState.reason) {
        case 'insecure_context':
          return {
            icon: '🔒',
            title: 'Secure Connection Required',
            description: 'Video sessions require a secure HTTPS connection to access camera and microphone.',
            instructions: [
              '• Use HTTPS instead of HTTP',
              '• Or access via localhost for development',
              '• Contact your administrator for SSL certificate'
            ],
            buttonText: 'Try Again'
          };
        case 'policy_blocked':
          return {
            icon: '🚫',
            title: 'Media Access Blocked',
            description: 'Camera and microphone access is blocked by the website\'s permissions policy.',
            instructions: [
              '• This may be due to iframe restrictions',
              '• Contact the website administrator',
              '• Or access the page directly (not in iframe)',
              '• Check server permissions policy headers'
            ],
            buttonText: 'Contact Support'
          };
        case 'device_error':
          return {
            icon: '📷',
            title: 'Device Issue',
            description: 'There\'s a problem with your camera or microphone.',
            instructions: [
              '• Check if devices are connected',
              '• Close other apps using camera/mic',
              '• Try refreshing the page',
              '• Check browser device permissions'
            ],
            buttonText: 'Try Again'
          };
        case 'user_denied':
        default:
          return {
            icon: '🎥',
            title: 'Camera & Microphone Required',
            description: 'To join this video session, please enable camera and microphone permissions.',
            instructions: [
              '1. Click the camera icon in your browser\'s address bar',
              '2. Select "Always allow" for camera and microphone',
              '3. Refresh this page'
            ],
            buttonText: 'Refresh Page'
          };
      }
    };

    const uiConfig = getUIConfig();
    
    return (
      <TooltipProvider>
        <div className="flex h-screen items-center justify-center bg-gray-900">
          <div className="max-w-lg text-center text-white">
            <div className="mb-4 text-6xl">{uiConfig.icon}</div>
            <h2 className="mb-4 text-2xl font-semibold">{uiConfig.title}</h2>
            <p className="mb-6 text-gray-400">{uiConfig.description}</p>
            
            <div className="space-y-3 text-left text-sm text-gray-300">
              {uiConfig.instructions.map((instruction, index) => (
                <p key={index}>{instruction}</p>
              ))}
            </div>
            
            <div className="mt-6 space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
              >
                {uiConfig.buttonText}
              </button>
              
              {permissionState.reason === 'policy_blocked' && (
                <button
                  onClick={() => window.open(window.location.href, '_blank')}
                  className="rounded-lg bg-gray-600 px-6 py-2 text-white hover:bg-gray-700"
                >
                  Open in New Tab
                </button>
              )}
            </div>

            {permissionState.reason === 'policy_blocked' && (
              <div className="mt-6 rounded-lg bg-yellow-900/20 border border-yellow-600/30 p-4">
                <h3 className="text-sm font-medium text-yellow-400 mb-2">For Developers:</h3>
                <p className="text-xs text-gray-300">
                  Add these headers to allow media access:
                </p>
                <code className="block mt-2 text-xs bg-gray-800 p-2 rounded text-green-400">
                  Permissions-Policy: camera=*, microphone=*
                </code>
              </div>
            )}
          </div>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
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
    </TooltipProvider>
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

export default VideoSessionInterface;
