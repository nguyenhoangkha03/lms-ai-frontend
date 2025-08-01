'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Users,
  Search,
  MoreVertical,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Hand,
  UserX,
  Crown,
  Shield,
  Volume2,
  VolumeX,
  MonitorOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useSocket } from '@/hooks/use-socket';

import type { VideoParticipant } from '@/lib/types/live-teaching';
import {
  useUpdateParticipantMutation,
  useRemoveParticipantMutation,
} from '@/lib/redux/api/live-teaching-api';

interface ParticipantListProps {
  sessionId: string;
  participants: VideoParticipant[];
  isHost: boolean;
  onClose: () => void;
}

type FilterType =
  | 'all'
  | 'hosts'
  | 'moderators'
  | 'participants'
  | 'connected'
  | 'disconnected';

export function ParticipantList({
  sessionId,
  participants,
  isHost,
  onClose,
}: ParticipantListProps) {
  const { toast } = useToast();
  const socket = useSocket();

  // API mutations
  const [updateParticipant] = useUpdateParticipantMutation();
  const [removeParticipant] = useRemoveParticipantMutation();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');

  // Filter participants
  const filteredParticipants = React.useMemo(() => {
    return participants.filter(participant => {
      // Search filter
      if (
        searchTerm &&
        !participant.user.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      // Type filter
      switch (filterType) {
        case 'hosts':
          return ['host', 'owner'].includes(participant.role);
        case 'moderators':
          return ['moderator', 'admin'].includes(participant.role);
        case 'participants':
          return ['member', 'attendee', 'guest'].includes(participant.role);
        case 'connected':
          return participant.connectionStatus === 'connected';
        case 'disconnected':
          return participant.connectionStatus !== 'connected';
        default:
          return true;
      }
    });
  }, [participants, searchTerm, filterType]);

  // Get role icon
  const getRoleIcon = useCallback((role: VideoParticipant['role']) => {
    switch (role) {
      case 'owner':
      case 'host':
        return Crown;
      case 'admin':
      case 'moderator':
        return Shield;
      default:
        return Users;
    }
  }, []);

  // Get role color
  const getRoleColor = useCallback((role: VideoParticipant['role']) => {
    switch (role) {
      case 'owner':
      case 'host':
        return 'text-yellow-400';
      case 'admin':
      case 'moderator':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  }, []);

  // Handle participant actions
  const handleMuteParticipant = useCallback(
    async (participantId: string, mute: boolean) => {
      try {
        await updateParticipant({
          sessionId,
          participantId,
          data: { isMuted: mute },
        }).unwrap();

        socket?.emit('participant:' + (mute ? 'mute' : 'unmute'), {
          sessionId,
          participantId,
        });

        toast({
          title: mute ? 'Participant Muted' : 'Participant Unmuted',
          description: `Participant has been ${mute ? 'muted' : 'unmuted'}.`,
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: `Failed to ${mute ? 'mute' : 'unmute'} participant.`,
          variant: 'destructive',
        });
      }
    },
    [sessionId, updateParticipant, socket, toast]
  );

  const handleToggleVideo = useCallback(
    async (participantId: string, disable: boolean) => {
      try {
        await updateParticipant({
          sessionId,
          participantId,
          data: { videoDisabled: disable },
        }).unwrap();

        socket?.emit('participant:video_' + (disable ? 'off' : 'on'), {
          sessionId,
          participantId,
        });

        toast({
          title: disable ? 'Video Disabled' : 'Video Enabled',
          description: `Participant video has been ${disable ? 'disabled' : 'enabled'}.`,
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to toggle participant video.',
          variant: 'destructive',
        });
      }
    },
    [sessionId, updateParticipant, socket, toast]
  );

  const handleChangeRole = useCallback(
    async (participantId: string, newRole: VideoParticipant['role']) => {
      try {
        await updateParticipant({
          sessionId,
          participantId,
          data: { role: newRole },
        }).unwrap();

        toast({
          title: 'Role Updated',
          description: `Participant role has been changed to ${newRole}.`,
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to update participant role.',
          variant: 'destructive',
        });
      }
    },
    [sessionId, updateParticipant, toast]
  );

  const handleRemoveParticipant = useCallback(
    async (participantId: string) => {
      try {
        await removeParticipant({
          sessionId,
          participantId,
        }).unwrap();

        socket?.emit('participant:remove', {
          sessionId,
          participantId,
        });

        toast({
          title: 'Participant Removed',
          description: 'Participant has been removed from the session.',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to remove participant.',
          variant: 'destructive',
        });
      }
    },
    [sessionId, removeParticipant, socket, toast]
  );

  // Get connection status color
  const getConnectionColor = useCallback(
    (status: VideoParticipant['connectionStatus']) => {
      switch (status) {
        case 'connected':
          return 'bg-green-400';
        case 'connecting':
        case 'reconnecting':
          return 'bg-yellow-400';
        case 'disconnected':
        case 'failed':
          return 'bg-red-400';
        default:
          return 'bg-gray-400';
      }
    },
    []
  );

  // Get network quality color
  const getNetworkQualityColor = useCallback(
    (quality: VideoParticipant['networkQuality']) => {
      switch (quality) {
        case 'excellent':
          return 'text-green-400';
        case 'good':
          return 'text-yellow-400';
        case 'fair':
          return 'text-orange-400';
        case 'poor':
          return 'text-red-400';
        default:
          return 'text-gray-400';
      }
    },
    []
  );

  return (
    <div className="flex h-full flex-col bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-700 p-4">
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-white" />
          <h3 className="text-lg font-semibold text-white">
            Participants ({participants.length})
          </h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="space-y-3 border-b border-gray-700 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search participants..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select
          value={filterType}
          onValueChange={(value: FilterType) => setFilterType(value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Participants</SelectItem>
            <SelectItem value="hosts">Hosts</SelectItem>
            <SelectItem value="moderators">Moderators</SelectItem>
            <SelectItem value="participants">Participants</SelectItem>
            <SelectItem value="connected">Connected</SelectItem>
            <SelectItem value="disconnected">Disconnected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Participants List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {filteredParticipants.map(participant => {
            const RoleIcon = getRoleIcon(participant.role);

            return (
              <motion.div
                key={participant.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between rounded-lg bg-gray-700/50 p-3 transition-colors hover:bg-gray-700"
              >
                <div className="flex min-w-0 flex-1 items-center space-x-3">
                  {/* Avatar */}
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={participant.user.avatar} />
                      <AvatarFallback>
                        {participant.user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {/* Connection Status Indicator */}
                    <div
                      className={cn(
                        'absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-gray-800',
                        getConnectionColor(participant.connectionStatus)
                      )}
                    />
                  </div>

                  {/* Participant Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="truncate text-sm font-medium text-white">
                        {participant.user.name}
                      </p>

                      {/* Role Icon */}
                      <RoleIcon
                        className={cn(
                          'h-3 w-3',
                          getRoleColor(participant.role)
                        )}
                      />

                      {/* Hand Raised */}
                      {participant.handRaised && (
                        <Hand className="h-3 w-3 text-yellow-400" />
                      )}
                    </div>

                    <div className="flex items-center space-x-3 text-xs text-gray-400">
                      <span
                        className={getNetworkQualityColor(
                          participant.networkQuality
                        )}
                      >
                        {participant.networkQuality}
                      </span>

                      {participant.isScreenSharing && (
                        <Badge variant="secondary" className="text-xs">
                          Screen
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Media Status */}
                  <div className="flex items-center space-x-1">
                    {participant.isMuted ? (
                      <MicOff className="h-4 w-4 text-red-400" />
                    ) : (
                      <Mic className="h-4 w-4 text-green-400" />
                    )}

                    {participant.videoDisabled ? (
                      <VideoOff className="h-4 w-4 text-red-400" />
                    ) : (
                      <Video className="h-4 w-4 text-green-400" />
                    )}
                  </div>
                </div>

                {/* Actions (Host Only) */}
                {isHost && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {/* Audio Controls */}
                      <DropdownMenuItem
                        onClick={() =>
                          handleMuteParticipant(
                            participant.id,
                            !participant.isMuted
                          )
                        }
                      >
                        {participant.isMuted ? (
                          <>
                            <Volume2 className="mr-2 h-4 w-4" />
                            Unmute
                          </>
                        ) : (
                          <>
                            <VolumeX className="mr-2 h-4 w-4" />
                            Mute
                          </>
                        )}
                      </DropdownMenuItem>

                      {/* Video Controls */}
                      <DropdownMenuItem
                        onClick={() =>
                          handleToggleVideo(
                            participant.id,
                            !participant.videoDisabled
                          )
                        }
                      >
                        {participant.videoDisabled ? (
                          <>
                            <Video className="mr-2 h-4 w-4" />
                            Enable Video
                          </>
                        ) : (
                          <>
                            <VideoOff className="mr-2 h-4 w-4" />
                            Disable Video
                          </>
                        )}
                      </DropdownMenuItem>

                      {/* Screen Share Control */}
                      {participant.isScreenSharing && (
                        <DropdownMenuItem>
                          <MonitorOff className="mr-2 h-4 w-4" />
                          Stop Screen Share
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator />

                      {/* Role Management */}
                      {participant.role !== 'owner' && (
                        <>
                          <DropdownMenuItem
                            onClick={() =>
                              handleChangeRole(participant.id, 'moderator')
                            }
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            Make Moderator
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() =>
                              handleChangeRole(participant.id, 'member')
                            }
                          >
                            <Users className="mr-2 h-4 w-4" />
                            Make Participant
                          </DropdownMenuItem>
                        </>
                      )}

                      <DropdownMenuSeparator />

                      {/* Remove Participant */}
                      {participant.role !== 'owner' && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleRemoveParticipant(participant.id)
                          }
                          className="text-red-400"
                        >
                          <UserX className="mr-2 h-4 w-4" />
                          Remove
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredParticipants.length === 0 && (
          <div className="py-8 text-center text-gray-400">
            <Users className="mx-auto mb-4 h-12 w-12" />
            <p>No participants found</p>
            {searchTerm && (
              <p className="mt-1 text-sm">
                Try adjusting your search or filter criteria
              </p>
            )}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="border-t border-gray-700 p-4">
        <div className="flex justify-between text-xs text-gray-400">
          <span>
            {
              participants.filter(p => p.connectionStatus === 'connected')
                .length
            }{' '}
            connected
          </span>
          <span>
            {participants.filter(p => p.handRaised).length} hands raised
          </span>
          <span>
            {participants.filter(p => p.isScreenSharing).length} sharing
          </span>
        </div>
      </div>
    </div>
  );
}
