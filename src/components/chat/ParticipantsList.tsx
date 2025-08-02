'use client';

import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  useGetRoomParticipantsQuery,
  useUpdateParticipantRoleMutation,
  useRemoveParticipantMutation,
  useInviteToRoomMutation,
} from '@/lib/redux/api/enhanced-chat-api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
  Search,
  MoreVertical,
  UserPlus,
  Crown,
  Shield,
  Star,
  User,
  UserX,
  Volume2,
  VolumeX,
  Clock,
  Mail,
  MessageCircle,
  UserCheck,
} from 'lucide-react';
import { ChatParticipant } from '@/lib/types/chat';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ParticipantsListProps {
  roomId: string;
  participants: ChatParticipant[];
  currentUserRole?: ChatParticipant['role'];
}

export function ParticipantsList({
  roomId,
  participants: initialParticipants,
  currentUserRole,
}: ParticipantsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<
    ChatParticipant['role'] | 'all'
  >('all');
  const [selectedStatus, setSelectedStatus] = useState<
    ChatParticipant['status'] | 'all'
  >('all');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] =
    useState<ChatParticipant | null>(null);
  const [inviteEmails, setInviteEmails] = useState('');

  // API queries and mutations
  const { data: participants = initialParticipants, refetch } =
    useGetRoomParticipantsQuery({
      roomId,
      role: selectedRole !== 'all' ? selectedRole : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
    });

  const [updateParticipantRole] = useUpdateParticipantRoleMutation();
  const [removeParticipant] = useRemoveParticipantMutation();
  const [inviteToRoom] = useInviteToRoomMutation();

  // Check permissions
  const canModerate =
    currentUserRole && ['owner', 'admin'].includes(currentUserRole);
  const canManageRoles = currentUserRole === 'owner';

  // Filter participants
  const filteredParticipants = participants.filter(participant => {
    const matchesSearch =
      !searchTerm ||
      participant.user?.firstName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      participant.user?.lastName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      participant.user?.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      participant.nickname?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      selectedRole === 'all' || participant.role === selectedRole;
    const matchesStatus =
      selectedStatus === 'all' || participant.status === selectedStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Group participants by role
  const groupedParticipants = filteredParticipants.reduce(
    (acc, participant) => {
      if (!acc[participant.role]) {
        acc[participant.role] = [];
      }
      acc[participant.role].push(participant);
      return acc;
    },
    {} as Record<ChatParticipant['role'], ChatParticipant[]>
  );

  // Role configurations
  const roleConfig = {
    owner: {
      icon: Crown,
      label: 'Owner',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      priority: 1,
    },
    admin: {
      icon: Shield,
      label: 'Admin',
      color: 'bg-red-100 text-red-800 border-red-300',
      priority: 2,
    },
    moderator: {
      icon: Star,
      label: 'Moderator',
      color: 'bg-blue-100 text-blue-800 border-blue-300',
      priority: 3,
    },
    member: {
      icon: User,
      label: 'Member',
      color: 'bg-gray-100 text-gray-800 border-gray-300',
      priority: 4,
    },
    guest: {
      icon: UserCheck,
      label: 'Guest',
      color: 'bg-green-100 text-green-800 border-green-300',
      priority: 5,
    },
  };

  // Status configurations
  const statusConfig = {
    active: { label: 'Active', color: 'bg-green-500' },
    inactive: { label: 'Inactive', color: 'bg-gray-400' },
    banned: { label: 'Banned', color: 'bg-red-500' },
    muted: { label: 'Muted', color: 'bg-orange-500' },
    away: { label: 'Away', color: 'bg-yellow-500' },
    busy: { label: 'Busy', color: 'bg-purple-500' },
  };

  const handleRoleChange = async (
    participantId: string,
    newRole: ChatParticipant['role']
  ) => {
    try {
      await updateParticipantRole({
        roomId,
        userId: participantId,
        role: newRole,
      }).unwrap();
      toast.success('Role updated successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const handleRemoveParticipant = async () => {
    if (!selectedParticipant) return;

    try {
      await removeParticipant({
        roomId,
        userId: selectedParticipant.userId,
        reason: 'Removed by moderator',
      }).unwrap();
      toast.success('Participant removed successfully');
      setRemoveDialogOpen(false);
      setSelectedParticipant(null);
      refetch();
    } catch (error) {
      toast.error('Failed to remove participant');
    }
  };

  const handleInviteUsers = async () => {
    if (!inviteEmails.trim()) return;

    const emails = inviteEmails
      .split(',')
      .map(email => email.trim())
      .filter(Boolean);

    try {
      await inviteToRoom({
        roomId,
        userIds: emails, // In real app, this would be user IDs
        message: 'You have been invited to join this chat room',
      }).unwrap();
      toast.success(`Invited ${emails.length} user(s) successfully`);
      setInviteDialogOpen(false);
      setInviteEmails('');
    } catch (error) {
      toast.error('Failed to send invitations');
    }
  };

  const getRoleBadge = (role: ChatParticipant['role']) => {
    const config = roleConfig[role];
    const Icon = config.icon;
    return (
      <Badge className={cn('border text-xs', config.color)}>
        <Icon className="mr-1 h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getStatusIndicator = (status: ChatParticipant['status']) => {
    const config = statusConfig[status];
    return (
      <div
        className={cn('h-2 w-2 rounded-full', config.color)}
        title={config.label}
      />
    );
  };

  // Sort roles by priority
  const sortedRoles = Object.keys(groupedParticipants).sort((a, b) => {
    return (
      roleConfig[a as ChatParticipant['role']].priority -
      roleConfig[b as ChatParticipant['role']].priority
    );
  });

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">Participants</h3>

          {canModerate && (
            <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <UserPlus className="mr-1 h-4 w-4" />
                  Invite
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Users</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">
                      Email Addresses
                    </label>
                    <Input
                      placeholder="Enter email addresses separated by commas"
                      value={inviteEmails}
                      onChange={e => setInviteEmails(e.target.value)}
                      className="mt-1"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Separate multiple emails with commas
                    </p>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setInviteDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleInviteUsers}>
                      Send Invitations
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <Input
            placeholder="Search participants..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-2">
          <Select
            value={selectedRole}
            onValueChange={(value: any) => setSelectedRole(value)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {Object.entries(roleConfig).map(([role, config]) => (
                <SelectItem key={role} value={role}>
                  <div className="flex items-center space-x-2">
                    <config.icon className="h-3 w-3" />
                    <span>{config.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedStatus}
            onValueChange={(value: any) => setSelectedStatus(value)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {Object.entries(statusConfig).map(([status, config]) => (
                <SelectItem key={status} value={status}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Participants List */}
      <ScrollArea className="flex-1">
        {filteredParticipants.length === 0 ? (
          <div className="flex h-32 items-center justify-center p-4 text-center">
            <div>
              <User className="mx-auto mb-2 h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-500">No participants found</p>
            </div>
          </div>
        ) : (
          <div className="p-2">
            {sortedRoles.map(role => {
              const participantsInRole =
                groupedParticipants[role as ChatParticipant['role']];
              const config = roleConfig[role as ChatParticipant['role']];
              const Icon = config.icon;

              return (
                <div key={role} className="mb-4">
                  {/* Role header */}
                  <div className="mb-2 flex items-center space-x-2 px-2 py-1">
                    <Icon className="h-4 w-4 text-gray-600" />
                    <span className="text-xs font-medium uppercase tracking-wide text-gray-600">
                      {config.label}
                    </span>
                    <span className="text-xs text-gray-400">
                      ({participantsInRole.length})
                    </span>
                  </div>

                  {/* Participants in this role */}
                  <div className="space-y-1">
                    {participantsInRole.map(participant => (
                      <div
                        key={participant.id}
                        className="group flex items-center space-x-3 rounded-lg p-2 hover:bg-gray-50"
                      >
                        {/* Avatar with status */}
                        <div className="relative flex-shrink-0">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={participant.user?.avatarUrl} />
                            <AvatarFallback>
                              {participant.user?.firstName?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-0.5 -right-0.5">
                            {getStatusIndicator(participant.status)}
                          </div>
                        </div>

                        {/* User info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="truncate text-sm font-medium">
                              {participant.nickname ||
                                `${participant.user?.firstName} ${participant.user?.lastName}`}
                            </span>
                            {getRoleBadge(participant.role)}
                          </div>

                          <div className="mt-1 flex items-center space-x-2">
                            {participant.user?.email && (
                              <span className="truncate text-xs text-gray-500">
                                {participant.user.email}
                              </span>
                            )}
                          </div>

                          {/* Additional info */}
                          <div className="mt-1 flex items-center space-x-2">
                            {participant.lastActiveAt && (
                              <span className="text-xs text-gray-400">
                                <Clock className="mr-1 inline h-3 w-3" />
                                {formatDistanceToNow(
                                  new Date(participant.lastActiveAt),
                                  {
                                    addSuffix: true,
                                  }
                                )}
                              </span>
                            )}

                            {participant.isMuted && (
                              <VolumeX
                                className="h-3 w-3 text-orange-500"
                                aria-label="Muted"
                                role="img"
                              />
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        {canModerate && participant.role !== 'owner' && (
                          <div className="opacity-0 transition-opacity group-hover:opacity-100">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <MessageCircle className="mr-2 h-4 w-4" />
                                  Send Message
                                </DropdownMenuItem>

                                <DropdownMenuItem>
                                  <Mail className="mr-2 h-4 w-4" />
                                  View Profile
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                {canManageRoles && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleRoleChange(
                                          participant.userId,
                                          'moderator'
                                        )
                                      }
                                      disabled={
                                        participant.role === 'moderator'
                                      }
                                    >
                                      <Star className="mr-2 h-4 w-4" />
                                      Make Moderator
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleRoleChange(
                                          participant.userId,
                                          'member'
                                        )
                                      }
                                      disabled={participant.role === 'member'}
                                    >
                                      <User className="mr-2 h-4 w-4" />
                                      Make Member
                                    </DropdownMenuItem>
                                  </>
                                )}

                                <DropdownMenuSeparator />

                                <DropdownMenuItem>
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

                                <DropdownMenuItem className="text-orange-600">
                                  <Clock className="mr-2 h-4 w-4" />
                                  Timeout
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => {
                                    setSelectedParticipant(participant);
                                    setRemoveDialogOpen(true);
                                  }}
                                >
                                  <UserX className="mr-2 h-4 w-4" />
                                  Remove
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Stats Footer */}
      <div className="border-t bg-gray-50 p-3">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {participants.filter(p => p.status === 'active').length}
            </div>
            <div className="text-xs text-gray-600">Online</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {participants.length}
            </div>
            <div className="text-xs text-gray-600">Total</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {
                participants.filter(p =>
                  ['owner', 'admin', 'moderator'].includes(p.role)
                ).length
              }
            </div>
            <div className="text-xs text-gray-600">Staff</div>
          </div>
        </div>
      </div>

      {/* Remove Participant Dialog */}
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Participant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{' '}
              <strong>
                {selectedParticipant?.user?.firstName}{' '}
                {selectedParticipant?.user?.lastName}
              </strong>{' '}
              from this room? They will no longer be able to participate in the
              conversation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleRemoveParticipant}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
