'use client';

import React, { useState, useCallback } from 'react';
import {
  X,
  Users,
  Plus,
  Settings,
  Square,
  UserPlus,
  UserMinus,
  Clock,
  MessageSquare,
  RotateCcw,
  Shuffle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useSocket } from '@/hooks/use-socket';

import type { VideoParticipant } from '@/lib/types/live-teaching';
import {
  useGetBreakoutRoomsQuery,
  useCreateBreakoutRoomsMutation,
  useAssignToBreakoutRoomMutation,
  useCloseBreakoutRoomsMutation,
  useGetSessionParticipantsQuery,
} from '@/lib/redux/api/live-teaching-api';

interface BreakoutRoomsPanelProps {
  sessionId: string;
  isHost: boolean;
  onClose: () => void;
}

interface CreateRoomsForm {
  numberOfRooms: number;
  assignmentMethod: 'manual' | 'automatic' | 'self_select';
  maxParticipants: number;
  allowReturn: boolean;
  timeLimit: number;
  moderatorMessage: string;
  roomNames: string[];
}

export function BreakoutRoomsPanel({
  sessionId,
  isHost,
  onClose,
}: BreakoutRoomsPanelProps) {
  const { toast } = useToast();
  const socket = useSocket();

  // API hooks
  const { data: breakoutRooms = [], refetch: refetchRooms } =
    useGetBreakoutRoomsQuery(sessionId);
  const { data: participants = [] } = useGetSessionParticipantsQuery(sessionId);
  const [createBreakoutRooms] = useCreateBreakoutRoomsMutation();
  const [assignToBreakoutRoom] = useAssignToBreakoutRoomMutation();
  const [closeBreakoutRooms] = useCloseBreakoutRoomsMutation();

  // State
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    []
  );
  const [createForm, setCreateForm] = useState<CreateRoomsForm>({
    numberOfRooms: 2,
    assignmentMethod: 'automatic',
    maxParticipants: 10,
    allowReturn: true,
    timeLimit: 30,
    moderatorMessage: '',
    roomNames: ['Room 1', 'Room 2'],
  });

  // Get unassigned participants
  const unassignedParticipants = participants.filter(
    p => !breakoutRooms.some(room => room.participants.includes(p.id))
  );

  // Handle form changes
  const handleFormChange = useCallback(
    (field: keyof CreateRoomsForm, value: any) => {
      setCreateForm(prev => {
        const updated = { ...prev, [field]: value };

        // Update room names when number of rooms changes
        if (field === 'numberOfRooms') {
          const names = [];
          for (let i = 1; i <= value; i++) {
            names.push(prev.roomNames[i - 1] || `Room ${i}`);
          }
          updated.roomNames = names;
        }

        return updated;
      });
    },
    []
  );

  // Create breakout rooms
  const handleCreateRooms = useCallback(async () => {
    try {
      const rooms = createForm.roomNames
        .slice(0, createForm.numberOfRooms)
        .map((name, index) => ({
          name,
          maxParticipants: createForm.maxParticipants,
          participants:
            createForm.assignmentMethod === 'automatic'
              ? assignParticipantsAutomatically(
                  participants,
                  createForm.numberOfRooms
                )[index] || []
              : [],
        }));

      await createBreakoutRooms({
        sessionId,
        rooms,
        settings: {
          allowReturn: createForm.allowReturn,
          timeLimit:
            createForm.timeLimit > 0 ? createForm.timeLimit : undefined,
          moderatorMessage: createForm.moderatorMessage,
        },
      }).unwrap();

      // Emit socket event
      socket?.emit('breakout:create', {
        sessionId,
        rooms,
      });

      refetchRooms();
      setShowCreateDialog(false);

      toast({
        title: 'Breakout Rooms Created',
        description: `${createForm.numberOfRooms} breakout rooms have been created.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create breakout rooms.',
        variant: 'destructive',
      });
    }
  }, [
    createForm,
    sessionId,
    participants,
    createBreakoutRooms,
    socket,
    refetchRooms,
    toast,
  ]);

  // Assign participants automatically
  const assignParticipantsAutomatically = useCallback(
    (participants: VideoParticipant[], numberOfRooms: number) => {
      const rooms: string[][] = Array.from({ length: numberOfRooms }, () => []);
      const shuffled = [...participants].sort(() => Math.random() - 0.5);

      shuffled.forEach((participant, index) => {
        rooms[index % numberOfRooms].push(participant.id);
      });

      return rooms;
    },
    []
  );

  // Assign participant to room
  const handleAssignParticipant = useCallback(
    async (participantId: string, roomId: string) => {
      try {
        await assignToBreakoutRoom({
          sessionId,
          roomId,
          participantIds: [participantId],
        }).unwrap();

        // Emit socket event
        socket?.emit('breakout:assign', {
          sessionId,
          participantId,
          roomId,
        });

        refetchRooms();

        toast({
          title: 'Participant Assigned',
          description: 'Participant has been moved to the breakout room.',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to assign participant.',
          variant: 'destructive',
        });
      }
    },
    [sessionId, assignToBreakoutRoom, socket, refetchRooms, toast]
  );

  // Close breakout rooms
  const handleCloseRooms = useCallback(
    async (roomId?: string) => {
      try {
        await closeBreakoutRooms({
          sessionId,
          roomId,
        }).unwrap();

        // Emit socket event
        socket?.emit('breakout:close', {
          sessionId,
          roomId,
        });

        refetchRooms();

        toast({
          title: 'Breakout Rooms Closed',
          description: roomId
            ? 'Breakout room has been closed.'
            : 'All breakout rooms have been closed.',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to close breakout rooms.',
          variant: 'destructive',
        });
      }
    },
    [sessionId, closeBreakoutRooms, socket, refetchRooms, toast]
  );

  // Shuffle participants
  const handleShuffleParticipants = useCallback(async () => {
    if (breakoutRooms.length === 0) return;

    try {
      // Get all participants from all rooms
      const allParticipants = breakoutRooms.flatMap(room => room.participants);

      // Reassign automatically
      const newAssignments = assignParticipantsAutomatically(
        participants.filter(p => allParticipants.includes(p.id)),
        breakoutRooms.length
      );

      // Assign participants to rooms
      for (let i = 0; i < breakoutRooms.length; i++) {
        const room = breakoutRooms[i];
        const newParticipants = newAssignments[i] || [];

        await assignToBreakoutRoom({
          sessionId,
          roomId: room.id,
          participantIds: newParticipants,
        }).unwrap();
      }

      refetchRooms();

      toast({
        title: 'Participants Shuffled',
        description:
          'Participants have been redistributed among breakout rooms.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to shuffle participants.',
        variant: 'destructive',
      });
    }
  }, [
    breakoutRooms,
    participants,
    sessionId,
    assignToBreakoutRoom,
    assignParticipantsAutomatically,
    refetchRooms,
    toast,
  ]);

  return (
    <div className="flex h-full flex-col bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-700 p-4">
        <h3 className="text-lg font-semibold text-white">Breakout Rooms</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Controls (Host Only) */}
      {isHost && (
        <div className="border-b border-gray-700 p-4">
          <div className="flex gap-2">
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size="sm" disabled={breakoutRooms.length > 0}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Rooms
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Breakout Rooms</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Number of Rooms */}
                  <div>
                    <Label>Number of Rooms</Label>
                    <Select
                      value={createForm.numberOfRooms.toString()}
                      onValueChange={value =>
                        handleFormChange('numberOfRooms', parseInt(value))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[2, 3, 4, 5, 6, 7, 8].map(num => (
                          <SelectItem key={num} value={num.toString()}>
                            {num}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Assignment Method */}
                  <div>
                    <Label>Assignment Method</Label>
                    <Select
                      value={createForm.assignmentMethod}
                      onValueChange={value =>
                        handleFormChange('assignmentMethod', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="automatic">Automatic</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="self_select">
                          Self Selection
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Room Names */}
                  <div>
                    <Label>Room Names</Label>
                    {createForm.roomNames
                      .slice(0, createForm.numberOfRooms)
                      .map((name, index) => (
                        <Input
                          key={index}
                          value={name}
                          onChange={e => {
                            const newNames = [...createForm.roomNames];
                            newNames[index] = e.target.value;
                            handleFormChange('roomNames', newNames);
                          }}
                          className="mt-1"
                          placeholder={`Room ${index + 1}`}
                        />
                      ))}
                  </div>

                  {/* Max Participants */}
                  <div>
                    <Label>Max Participants per Room</Label>
                    <Input
                      type="number"
                      value={createForm.maxParticipants}
                      onChange={e =>
                        handleFormChange(
                          'maxParticipants',
                          parseInt(e.target.value)
                        )
                      }
                      min={1}
                      max={50}
                    />
                  </div>

                  {/* Settings */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Allow participants to return</Label>
                      <Switch
                        checked={createForm.allowReturn}
                        onCheckedChange={checked =>
                          handleFormChange('allowReturn', checked)
                        }
                      />
                    </div>

                    <div>
                      <Label>Time Limit (minutes, 0 = unlimited)</Label>
                      <Input
                        type="number"
                        value={createForm.timeLimit}
                        onChange={e =>
                          handleFormChange(
                            'timeLimit',
                            parseInt(e.target.value)
                          )
                        }
                        min={0}
                        max={180}
                      />
                    </div>

                    <div>
                      <Label>Message to participants</Label>
                      <Textarea
                        value={createForm.moderatorMessage}
                        onChange={e =>
                          handleFormChange('moderatorMessage', e.target.value)
                        }
                        placeholder="Optional message to display when participants join breakout rooms"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateRooms}>Create Rooms</Button>
                </div>
              </DialogContent>
            </Dialog>

            {breakoutRooms.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShuffleParticipants}
                >
                  <Shuffle className="mr-2 h-4 w-4" />
                  Shuffle
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleCloseRooms()}
                >
                  <Square className="mr-2 h-4 w-4" />
                  Close All
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {breakoutRooms.length === 0 ? (
          <div className="py-8 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h4 className="mb-2 text-lg font-medium text-white">
              No Breakout Rooms
            </h4>
            <p className="mb-4 text-gray-400">
              {isHost
                ? 'Create breakout rooms to enable small group discussions.'
                : "The host hasn't created any breakout rooms yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Active Breakout Rooms */}
            {breakoutRooms.map(room => (
              <Card key={room.id} className="border-gray-600 bg-gray-700">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-base text-white">
                      <Users className="mr-2 h-4 w-4" />
                      {room.name}
                      <Badge variant="secondary" className="ml-2">
                        {room.currentParticipants}/{room.maxParticipants}
                      </Badge>
                    </CardTitle>

                    {isHost && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleCloseRooms(room.id)}
                          >
                            <Square className="mr-2 h-4 w-4" />
                            Close Room
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Room Status */}
                  <div className="mb-3 flex items-center gap-4 text-sm text-gray-300">
                    <div className="flex items-center">
                      <div
                        className={cn(
                          'mr-2 h-2 w-2 rounded-full',
                          room.status === 'active'
                            ? 'bg-green-400'
                            : 'bg-gray-400'
                        )}
                      />
                      {room.status === 'active' ? 'Active' : 'Inactive'}
                    </div>

                    {room.settings.timeLimit && (
                      <div className="flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        {room.settings.timeLimit}min limit
                      </div>
                    )}
                  </div>

                  {/* Participants in Room */}
                  <div className="space-y-2">
                    {room.participants.length > 0 ? (
                      room.participants.map(participantId => {
                        const participant = participants.find(
                          p => p.id === participantId
                        );
                        if (!participant) return null;

                        return (
                          <div
                            key={participantId}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center">
                              <Avatar className="mr-2 h-6 w-6">
                                <AvatarImage src={participant.user.avatar} />
                                <AvatarFallback className="text-xs">
                                  {participant.user.name
                                    .charAt(0)
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-white">
                                {participant.user.name}
                              </span>

                              {/* Connection Status */}
                              <div
                                className={cn(
                                  'ml-2 h-2 w-2 rounded-full',
                                  participant.connectionStatus === 'connected'
                                    ? 'bg-green-400'
                                    : 'bg-red-400'
                                )}
                              />
                            </div>

                            {isHost && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleAssignParticipant(participantId, '')
                                } // Move to main room
                                className="text-xs"
                              >
                                <UserMinus className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm italic text-gray-400">
                        No participants assigned
                      </p>
                    )}
                  </div>

                  {/* Room Actions */}
                  <div className="mt-3 border-t border-gray-600 pt-3">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <MessageSquare className="mr-2 h-3 w-3" />
                        Join Chat
                      </Button>

                      {room.settings.allowReturn && (
                        <Button variant="outline" size="sm">
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Unassigned Participants */}
            {isHost && unassignedParticipants.length > 0 && (
              <Card className="border-gray-600 bg-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-base text-white">
                    <Users className="mr-2 h-4 w-4" />
                    Unassigned Participants
                    <Badge variant="outline" className="ml-2">
                      {unassignedParticipants.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="space-y-2">
                    {unassignedParticipants.map(participant => (
                      <div
                        key={participant.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <Avatar className="mr-2 h-6 w-6">
                            <AvatarImage src={participant.user.avatar} />
                            <AvatarFallback className="text-xs">
                              {participant.user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-white">
                            {participant.user.name}
                          </span>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <UserPlus className="mr-1 h-3 w-3" />
                              Assign
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {breakoutRooms.map(room => (
                              <DropdownMenuItem
                                key={room.id}
                                onClick={() =>
                                  handleAssignParticipant(
                                    participant.id,
                                    room.id
                                  )
                                }
                                disabled={
                                  room.currentParticipants >=
                                  room.maxParticipants
                                }
                              >
                                {room.name} ({room.currentParticipants}/
                                {room.maxParticipants})
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Status Bar */}
      {breakoutRooms.length > 0 && (
        <div className="border-t border-gray-700 p-3">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>
              {breakoutRooms.length} room{breakoutRooms.length !== 1 ? 's' : ''}{' '}
              active
            </span>
            <span>
              {breakoutRooms.reduce(
                (total, room) => total + room.currentParticipants,
                0
              )}{' '}
              participants in rooms
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
