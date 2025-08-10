'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  Phone,
  PhoneOff,
  Users,
  MessageCircle,
  Settings,
  MoreVertical,
  Send,
  PlusCircle,
  BarChart3,
  Clock,
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  Camera,
  CameraOff,
  Hand,
  Share,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import {
  useGetLiveSessionByIdQuery,
  useGetSessionAttendanceQuery,
  useSendChatMessageMutation,
  useCreatePollMutation,
  useEndLiveSessionMutation,
  LiveSession,
  LiveSessionChat,
  LiveSessionPoll,
} from '@/lib/redux/api/teacher-live-sessions-api';

interface ParticipantVideo {
  id: string;
  name: string;
  hasVideo: boolean;
  hasAudio: boolean;
  isHost: boolean;
  isSpeaking: boolean;
}

export default function LiveSessionRoomPage() {
  const { sessionId } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Local state for session controls
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showParticipants, setShowParticipants] = useState(true);
  const [showChat, setShowChat] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [activePoll, setActivePoll] = useState<LiveSessionPoll | null>(null);
  const [sessionDuration, setSessionDuration] = useState(0);

  // Mock participants data
  const [participants] = useState<ParticipantVideo[]>([
    { id: '1', name: 'Teacher (You)', hasVideo: true, hasAudio: true, isHost: true, isSpeaking: false },
    { id: '2', name: 'Nguyễn Văn An', hasVideo: true, hasAudio: false, isHost: false, isSpeaking: false },
    { id: '3', name: 'Trần Thị Bình', hasVideo: false, hasAudio: true, isHost: false, isSpeaking: true },
    { id: '4', name: 'Lê Minh Cường', hasVideo: true, hasAudio: true, isHost: false, isSpeaking: false },
  ]);

  // Mock chat messages
  const [chatMessages, setChatMessages] = useState<LiveSessionChat[]>([
    {
      id: '1',
      userId: 'teacher-1',
      userName: 'Teacher',
      message: 'Welcome everyone! Today we will cover neural networks.',
      timestamp: new Date().toISOString(),
      type: 'teacher',
    },
    {
      id: '2',
      userId: 'student-1',
      userName: 'Nguyễn Văn An',
      message: 'Thank you for the session!',
      timestamp: new Date().toISOString(),
      type: 'student',
    },
  ]);

  // API hooks
  const { data: session, isLoading } = useGetLiveSessionByIdQuery(sessionId as string);
  const { data: attendance } = useGetSessionAttendanceQuery(sessionId as string);
  const [sendChatMessage] = useSendChatMessageMutation();
  const [createPoll] = useCreatePollMutation();
  const [endSession] = useEndLiveSessionMutation();

  // Update session duration timer
  useEffect(() => {
    if (session && session.status === 'live') {
      const startTime = new Date(session.scheduledAt).getTime();
      const interval = setInterval(() => {
        const now = Date.now();
        const duration = Math.floor((now - startTime) / 1000 / 60);
        setSessionDuration(duration);
      }, 60000); // Update every minute

      return () => clearInterval(interval);
    }
  }, [session]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;

    try {
      const newMessage = await sendChatMessage({
        sessionId: sessionId as string,
        messageData: { message: chatMessage }
      }).unwrap();

      setChatMessages(prev => [...prev, newMessage]);
      setChatMessage('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message.',
        variant: 'destructive',
      });
    }
  };

  const handleEndSession = async () => {
    try {
      await endSession(sessionId as string).unwrap();
      toast({
        title: 'Session Ended',
        description: 'Live session has been ended successfully.',
      });
      router.push('/teacher/live-sessions');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to end session.',
        variant: 'destructive',
      });
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Video className="mx-auto h-12 w-12 text-white mb-4 animate-pulse" />
          <p className="text-white">Joining session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white mb-4">Session not found</p>
          <Button onClick={() => router.push('/teacher/live-sessions')}>
            Back to Sessions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white relative">
      {/* Session Header */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-slate-800/90 backdrop-blur-sm border-b border-slate-700">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold">{session.title}</h1>
            <Badge variant="destructive" className="bg-red-600">
              <div className="flex items-center space-x-1">
                <div className="h-2 w-2 bg-white rounded-full animate-pulse" />
                <span>LIVE</span>
              </div>
            </Badge>
            <div className="flex items-center space-x-2 text-sm text-slate-300">
              <Clock className="h-4 w-4" />
              <span>{formatTime(sessionDuration)}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowParticipants(!showParticipants)}>
              <Users className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowChat(!showChat)}>
              <MessageCircle className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Session Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Analytics
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleEndSession} className="text-red-400">
                  <PhoneOff className="mr-2 h-4 w-4" />
                  End Session
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="pt-20 h-screen flex">
        {/* Main Video Area */}
        <div className="flex-1 relative">
          {/* Main Speaker Video */}
          <div className="h-full bg-slate-800 rounded-lg m-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20" />
            <div className="absolute bottom-4 left-4">
              <div className="flex items-center space-x-2 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>T</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">Teacher (You)</span>
                <div className="flex items-center space-x-1">
                  {isVideoEnabled ? <Video className="h-4 w-4 text-green-400" /> : <VideoOff className="h-4 w-4 text-red-400" />}
                  {isAudioEnabled ? <Mic className="h-4 w-4 text-green-400" /> : <MicOff className="h-4 w-4 text-red-400" />}
                </div>
              </div>
            </div>

            {/* Screen sharing indicator */}
            {isScreenSharing && (
              <div className="absolute top-4 left-4">
                <Badge className="bg-blue-600">
                  <Monitor className="h-3 w-3 mr-1" />
                  Screen Sharing
                </Badge>
              </div>
            )}
          </div>

          {/* Control Bar */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center space-x-2 bg-slate-800/90 backdrop-blur-sm rounded-full px-6 py-3">
              <Button
                size="sm"
                variant={isAudioEnabled ? "default" : "destructive"}
                onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                className="rounded-full h-10 w-10 p-0"
              >
                {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </Button>
              
              <Button
                size="sm"
                variant={isVideoEnabled ? "default" : "destructive"}
                onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                className="rounded-full h-10 w-10 p-0"
              >
                {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
              </Button>

              <Button
                size="sm"
                variant={isScreenSharing ? "secondary" : "outline"}
                onClick={() => setIsScreenSharing(!isScreenSharing)}
                className="rounded-full h-10 w-10 p-0"
              >
                {isScreenSharing ? <MonitorOff className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
              </Button>

              <Separator orientation="vertical" className="h-6" />

              <Button
                size="sm"
                variant="destructive"
                onClick={handleEndSession}
                className="rounded-full h-10 w-10 p-0"
              >
                <PhoneOff className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col">
          {/* Participants Panel */}
          {showParticipants && (
            <div className="flex-1 border-b border-slate-700">
              <div className="p-4 border-b border-slate-700">
                <h3 className="font-semibold flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Participants ({participants.length})
                </h3>
              </div>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-700/50"
                    >
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {participant.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{participant.name}</p>
                          {participant.isHost && (
                            <Badge variant="secondary" className="text-xs">Host</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {participant.hasAudio ? 
                          <Mic className={`h-3 w-3 ${participant.isSpeaking ? 'text-green-400' : 'text-slate-400'}`} /> : 
                          <MicOff className="h-3 w-3 text-red-400" />
                        }
                        {participant.hasVideo ? 
                          <Camera className="h-3 w-3 text-green-400" /> : 
                          <CameraOff className="h-3 w-3 text-slate-400" />
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Chat Panel */}
          {showChat && (
            <div className="flex-1 flex flex-col">
              <div className="p-4 border-b border-slate-700">
                <h3 className="font-semibold flex items-center">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat
                </h3>
              </div>
              
              <ScrollArea className="flex-1 p-4" ref={chatScrollRef}>
                <div className="space-y-3">
                  {chatMessages.map((message) => (
                    <div key={message.id} className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs font-medium ${
                          message.type === 'teacher' ? 'text-blue-400' : 'text-slate-300'
                        }`}>
                          {message.userName}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm bg-slate-700/50 rounded p-2">{message.message}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-slate-700">
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Type a message..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="bg-slate-700 border-slate-600"
                  />
                  <Button size="sm" onClick={handleSendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}