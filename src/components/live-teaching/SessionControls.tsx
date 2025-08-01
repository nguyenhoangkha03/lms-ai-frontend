'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Monitor,
  MonitorOff,
  Users,
  MessageSquare,
  BarChart,
  Settings,
  MoreVertical,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Hand,
  StopCircle,
  Play,
  Grid3X3,
  Layers,
  PieChart,
  Share,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';

import type { VideoSession, VideoParticipant } from '@/lib/types/live-teaching';
import {
  useStartRecordingMutation,
  useStopRecordingMutation,
  useStartScreenShareMutation,
  useStopScreenShareMutation,
} from '@/lib/redux/api/live-teaching-api';

interface MediaState {
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  isRecording: boolean;
  isFullscreen: boolean;
  volume: number;
}

interface SessionControlsProps {
  session: VideoSession;
  mediaState: MediaState;
  participants: VideoParticipant[];
  isHost: boolean;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  onToggleFullscreen: () => void;
  onLeaveSession: () => void;
  onTogglePanel: (
    panel: 'participants' | 'chat' | 'whiteboard' | 'polls' | 'breakout' | null
  ) => void;
  activePanel: string | null;
}

export function SessionControls({
  session,
  mediaState,
  participants,
  isHost,
  onToggleVideo,
  onToggleAudio,
  onToggleFullscreen,
  onLeaveSession,
  onTogglePanel,
  activePanel,
}: SessionControlsProps) {
  const { toast } = useToast();
  const [volume, setVolume] = useState([100]);
  const [handRaised, setHandRaised] = useState(false);
  const [showVolumeControl, setShowVolumeControl] = useState(false);

  // API mutations
  const [startRecording] = useStartRecordingMutation();
  const [stopRecording] = useStopRecordingMutation();
  const [startScreenShare] = useStartScreenShareMutation();
  const [stopScreenShare] = useStopScreenShareMutation();

  // Screen sharing handler
  const handleScreenShare = useCallback(async () => {
    try {
      if (mediaState.isScreenSharing) {
        await stopScreenShare({
          sessionId: session.id,
          participantId: 'current-user-id', // This should come from context
        });
        toast({
          title: 'Screen Sharing Stopped',
          description: 'You stopped sharing your screen.',
        });
      } else {
        await startScreenShare({
          sessionId: session.id,
          participantId: 'current-user-id',
        });
        toast({
          title: 'Screen Sharing Started',
          description: 'You are now sharing your screen.',
        });
      }
    } catch (error) {
      toast({
        title: 'Screen Share Error',
        description: 'Failed to toggle screen sharing.',
        variant: 'destructive',
      });
    }
  }, [
    mediaState.isScreenSharing,
    session.id,
    startScreenShare,
    stopScreenShare,
    toast,
  ]);

  // Recording handler
  const handleRecording = useCallback(async () => {
    if (!isHost) return;

    try {
      if (mediaState.isRecording) {
        await stopRecording(session.id);
        toast({
          title: 'Recording Stopped',
          description: 'The session recording has been stopped.',
        });
      } else {
        await startRecording(session.id);
        toast({
          title: 'Recording Started',
          description: 'The session is now being recorded.',
        });
      }
    } catch (error) {
      toast({
        title: 'Recording Error',
        description: 'Failed to toggle recording.',
        variant: 'destructive',
      });
    }
  }, [
    isHost,
    mediaState.isRecording,
    session.id,
    startRecording,
    stopRecording,
    toast,
  ]);

  // Hand raise handler
  const handleHandRaise = useCallback(() => {
    setHandRaised(!handRaised);
    toast({
      title: handRaised ? 'Hand Lowered' : 'Hand Raised',
      description: handRaised
        ? 'You lowered your hand.'
        : 'You raised your hand.',
    });
  }, [handRaised, toast]);

  // Volume control handler
  const handleVolumeChange = useCallback((newVolume: number[]) => {
    setVolume(newVolume);
    // Apply volume to audio elements
    const audioElements = document.querySelectorAll('video, audio');
    audioElements.forEach(element => {
      (element as HTMLMediaElement).volume = newVolume[0] / 100;
    });
  }, []);

  return (
    <div className="border-t border-gray-700 bg-gray-900/95 backdrop-blur-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Side - Session Info */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div
              className={cn(
                'h-3 w-3 rounded-full',
                session.status === 'live' && 'animate-pulse bg-red-500',
                session.status === 'scheduled' && 'bg-yellow-500',
                session.status === 'completed' && 'bg-gray-500'
              )}
            />
            <span className="text-sm font-medium">
              {session.status === 'live' && 'LIVE'}
              {session.status === 'scheduled' && 'SCHEDULED'}
              {session.status === 'completed' && 'ENDED'}
            </span>
          </div>

          {mediaState.isRecording && (
            <Badge variant="destructive" className="animate-pulse">
              <StopCircle className="mr-1 h-3 w-3" />
              Recording
            </Badge>
          )}

          <div className="text-sm text-gray-400">
            {participants.length} participant
            {participants.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Center - Main Controls */}
        <div className="flex items-center space-x-2">
          {/* Audio Control */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={mediaState.isAudioEnabled ? 'default' : 'destructive'}
                size="lg"
                onClick={onToggleAudio}
                className="rounded-full"
              >
                {mediaState.isAudioEnabled ? (
                  <Mic className="h-5 w-5" />
                ) : (
                  <MicOff className="h-5 w-5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {mediaState.isAudioEnabled ? 'Mute' : 'Unmute'}
            </TooltipContent>
          </Tooltip>

          {/* Video Control */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={mediaState.isVideoEnabled ? 'default' : 'destructive'}
                size="lg"
                onClick={onToggleVideo}
                className="rounded-full"
              >
                {mediaState.isVideoEnabled ? (
                  <Video className="h-5 w-5" />
                ) : (
                  <VideoOff className="h-5 w-5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {mediaState.isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
            </TooltipContent>
          </Tooltip>

          {/* Screen Share */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={mediaState.isScreenSharing ? 'secondary' : 'outline'}
                size="lg"
                onClick={handleScreenShare}
                className="rounded-full"
              >
                {mediaState.isScreenSharing ? (
                  <MonitorOff className="h-5 w-5" />
                ) : (
                  <Monitor className="h-5 w-5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {mediaState.isScreenSharing ? 'Stop sharing' : 'Share screen'}
            </TooltipContent>
          </Tooltip>

          {/* Hand Raise */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={handRaised ? 'secondary' : 'outline'}
                size="lg"
                onClick={handleHandRaise}
                className="rounded-full"
              >
                <Hand
                  className={cn('h-5 w-5', handRaised && 'text-yellow-400')}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {handRaised ? 'Lower hand' : 'Raise hand'}
            </TooltipContent>
          </Tooltip>

          {/* Leave Session */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="destructive"
                size="lg"
                onClick={onLeaveSession}
                className="rounded-full"
              >
                <PhoneOff className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Leave session</TooltipContent>
          </Tooltip>
        </div>

        {/* Right Side - Panel Controls & Settings */}
        <div className="flex items-center space-x-2">
          {/* Participants Panel */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={
                  activePanel === 'participants' ? 'secondary' : 'outline'
                }
                size="sm"
                onClick={() => onTogglePanel('participants')}
              >
                <Users className="h-4 w-4" />
                <span className="ml-1 text-xs">{participants.length}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Participants</TooltipContent>
          </Tooltip>

          {/* Chat Panel */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activePanel === 'chat' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => onTogglePanel('chat')}
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Chat</TooltipContent>
          </Tooltip>

          {/* Whiteboard Panel */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activePanel === 'whiteboard' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => onTogglePanel('whiteboard')}
              >
                <BarChart className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Whiteboard</TooltipContent>
          </Tooltip>

          {/* Polls Panel */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activePanel === 'polls' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => onTogglePanel('polls')}
              >
                <PieChart className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Polls</TooltipContent>
          </Tooltip>

          {/* Breakout Rooms (Host Only) */}
          {isHost && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={activePanel === 'breakout' ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => onTogglePanel('breakout')}
                >
                  <Layers className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Breakout Rooms</TooltipContent>
            </Tooltip>
          )}

          {/* Volume Control */}
          <div className="relative">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowVolumeControl(!showVolumeControl)}
                >
                  {volume[0] > 0 ? (
                    <Volume2 className="h-4 w-4" />
                  ) : (
                    <VolumeX className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Volume</TooltipContent>
            </Tooltip>

            {showVolumeControl && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full right-0 mb-2 rounded-lg border border-gray-700 bg-gray-800 p-3"
              >
                <div className="flex items-center space-x-2">
                  <VolumeX className="h-4 w-4 text-gray-400" />
                  <Slider
                    value={volume}
                    onValueChange={handleVolumeChange}
                    max={100}
                    step={1}
                    className="w-20"
                  />
                  <Volume2 className="h-4 w-4 text-gray-400" />
                </div>
                <div className="mt-1 text-center text-xs text-gray-400">
                  {volume[0]}%
                </div>
              </motion.div>
            )}
          </div>

          {/* Fullscreen Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={onToggleFullscreen}>
                {mediaState.isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {mediaState.isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            </TooltipContent>
          </Tooltip>

          {/* More Options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {/* Recording (Host Only) */}
              {isHost && (
                <>
                  <DropdownMenuItem
                    onClick={handleRecording}
                    className={cn(mediaState.isRecording && 'text-red-400')}
                  >
                    {mediaState.isRecording ? (
                      <>
                        <StopCircle className="mr-2 h-4 w-4" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Start Recording
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}

              {/* View Mode Options */}
              <DropdownMenuItem>
                <Grid3X3 className="mr-2 h-4 w-4" />
                Gallery View
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Monitor className="mr-2 h-4 w-4" />
                Speaker View
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              {/* Settings */}
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>

              {/* Share Session */}
              <DropdownMenuItem>
                <Share className="mr-2 h-4 w-4" />
                Share Session Link
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Session Timer */}
      <div className="px-6 pb-2">
        <div className="flex items-center justify-center">
          <div className="text-xs text-gray-400">
            Session Duration: {formatDuration(getSessionDuration(session))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getSessionDuration(session: VideoSession): number {
  if (!session.actualStart) return 0;
  const start = new Date(session.actualStart).getTime();
  const end = session.actualEnd
    ? new Date(session.actualEnd).getTime()
    : Date.now();
  return Math.floor((end - start) / 1000);
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
