'use client';

import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Globe,
  Lock,
  Calendar,
  BookOpen,
  TrendingUp,
  UserCheck,
  Star,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { collaborativeApi } from '@/lib/redux/api/collaborative-api';

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  type: 'public' | 'private' | 'course_based';
  status: 'active' | 'inactive' | 'archived';
  creatorId: string;
  courseId?: string;
  avatarUrl?: string;
  inviteCode: string;
  maxMembers: number;
  memberCount: number;
  isPrivate: boolean;
  requiresApproval: boolean;
  tags: string[];
  schedule?: {
    type: 'weekly' | 'daily' | 'custom';
    days: string[];
    time: string;
    timezone: string;
  };
  goals: string[];
  rules: string[];
  statistics: {
    totalSessions: number;
    totalNotes: number;
    totalProjects: number;
    avgRating: number;
  };
  lastActivityAt: string;
  createdAt: string;
  creator: {
    id: string;
    name: string;
    avatar?: string;
  };
  course?: {
    id: string;
    title: string;
    thumbnail?: string;
  };
  members: Array<{
    id: string;
    name: string;
    avatar?: string;
    role: 'owner' | 'moderator' | 'member';
    status: 'active' | 'pending' | 'invited';
    contributionScore: number;
  }>;
}

export default function StudyGroupsPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);

  const [activeTab, setActiveTab] = useState<
    'discover' | 'my-groups' | 'suggested'
  >('my-groups');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<
    'all' | 'public' | 'private' | 'course_based'
  >('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  // New group form state
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    type: 'public' as 'public' | 'private' | 'course_based',
    courseId: '',
    maxMembers: 20,
    isPrivate: false,
    requiresApproval: false,
    tags: [] as string[],
    goals: [''],
    rules: [''],
    schedule: {
      type: 'weekly' as 'weekly' | 'daily' | 'custom',
      days: [] as string[],
      time: '',
      timezone: 'UTC+7',
    },
  });

  // RTK Query hooks
  const { data: myGroups, isLoading: myGroupsLoading } =
    collaborativeApi.useGetMyStudyGroupsQuery();
  const { data: discoverGroups, isLoading: discoverLoading } =
    collaborativeApi.useGetStudyGroupsQuery({
      search: searchQuery,
      type: filterType !== 'all' ? filterType : undefined,
      limit: 20,
    });
  const { data: suggestedGroups } =
    collaborativeApi.useGetSuggestedStudyGroupsQuery();
  const { data: courses } = collaborativeApi.useGetUserCoursesQuery();

  const [createStudyGroup] = collaborativeApi.useCreateStudyGroupMutation();
  const [joinStudyGroup] = collaborativeApi.useJoinStudyGroupMutation();
  const [leaveStudyGroup] = collaborativeApi.useLeaveStudyGroupMutation();

  const handleCreateGroup = async () => {
    try {
      await createStudyGroup(newGroup).unwrap();

      toast({
        title: 'Study group created',
        description: 'Your study group has been created successfully.',
      });

      setShowCreateDialog(false);
      setNewGroup({
        name: '',
        description: '',
        type: 'public',
        courseId: '',
        maxMembers: 20,
        isPrivate: false,
        requiresApproval: false,
        tags: [],
        goals: [''],
        rules: [''],
        schedule: {
          type: 'weekly',
          days: [],
          time: '',
          timezone: 'UTC+7',
        },
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.data?.message || 'Failed to create study group.',
        variant: 'destructive',
      });
    }
  };

  const handleJoinWithCode = async () => {
    if (!joinCode.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an invite code.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await joinStudyGroup({ inviteCode: joinCode }).unwrap();

      toast({
        title: 'Joined successfully',
        description: 'You have joined the study group.',
      });

      setShowJoinDialog(false);
      setJoinCode('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.data?.message || 'Failed to join study group.',
        variant: 'destructive',
      });
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      await joinStudyGroup({ groupId }).unwrap();

      toast({
        title: 'Join request sent',
        description: 'Your request to join has been sent.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.data?.message || 'Failed to join study group.',
        variant: 'destructive',
      });
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    try {
      await leaveStudyGroup({ groupId }).unwrap();

      toast({
        title: 'Left study group',
        description: 'You have left the study group.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.data?.message || 'Failed to leave study group.',
        variant: 'destructive',
      });
    }
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Copied',
      description: 'Invite code copied to clipboard.',
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getGroupTypeIcon = (type: string) => {
    switch (type) {
      case 'public':
        return <Globe className="h-4 w-4 text-green-600" />;
      case 'private':
        return <Lock className="h-4 w-4 text-red-600" />;
      case 'course_based':
        return <BookOpen className="h-4 w-4 text-blue-600" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const renderGroupCard = (group: StudyGroup, showJoinButton = true) => (
    <Card key={group.id} className="transition-shadow hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex gap-4">
          <div className="relative">
            <Avatar className="h-16 w-16">
              <AvatarImage src={group.avatarUrl} />
              <AvatarFallback>{group.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1">
              {getGroupTypeIcon(group.type)}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-start justify-between">
              <div>
                <Link
                  href={`/study-groups/${group.id}`}
                  className="hover:text-blue-600"
                >
                  <h3 className="truncate text-lg font-bold">{group.name}</h3>
                </Link>
                <p className="mb-2 line-clamp-2 text-sm text-gray-600">
                  {group.description}
                </p>
              </div>

              {showJoinButton && (
                <div className="ml-4 flex gap-2">
                  {!myGroups?.some(g => g.id === group.id) ? (
                    <Button
                      size="sm"
                      onClick={() => handleJoinGroup(group.id)}
                      disabled={group.memberCount >= group.maxMembers}
                    >
                      <UserCheck className="mr-2 h-4 w-4" />
                      {group.requiresApproval ? 'Request' : 'Join'}
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/study-groups/${group.id}`}>View Group</Link>
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Tags */}
            {group.tags.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1">
                {group.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Course info */}
            {group.course && (
              <div className="mb-3 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-600">
                  {group.course.title}
                </span>
              </div>
            )}

            {/* Group stats */}
            <div className="mb-3 flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>
                  {group.memberCount}/{group.maxMembers} members
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Active {formatTimeAgo(group.lastActivityAt)}</span>
              </div>
              {group.statistics.avgRating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-current text-yellow-500" />
                  <span>{group.statistics.avgRating.toFixed(1)}</span>
                </div>
              )}
            </div>

            {/* Members preview */}
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {group.members.slice(0, 3).map(member => (
                  <Avatar
                    key={member.id}
                    className="h-6 w-6 border-2 border-white"
                  >
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback className="text-xs">
                      {member.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {group.memberCount > 3 && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gray-200">
                    <span className="text-xs text-gray-600">
                      +{group.memberCount - 3}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-500">
                Created by {group.creator.name}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto space-y-6 px-4 py-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Study Groups</h1>
          <p className="mt-1 text-gray-600">
            Collaborate, learn, and grow together with your peers
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setShowJoinDialog(true)} variant="outline">
            <UserCheck className="mr-2 h-4 w-4" />
            Join with Code
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Group
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search study groups..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={filterType}
                onValueChange={value => setFilterType(value as any)}
              >
                <SelectTrigger className="w-40">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="course_based">Course-based</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={value => setActiveTab(value as any)}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="my-groups">
            My Groups ({myGroups?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="suggested">Suggested</TabsTrigger>
        </TabsList>

        <TabsContent value="my-groups" className="space-y-4">
          {myGroupsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-20 rounded bg-gray-200"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : myGroups?.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-medium">
                  No study groups yet
                </h3>
                <p className="mb-4 text-gray-600">
                  Join or create your first study group to start collaborating
                  with peers.
                </p>
                <div className="flex justify-center gap-2">
                  <Button
                    onClick={() => setShowJoinDialog(true)}
                    variant="outline"
                  >
                    Join with Code
                  </Button>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    Create Group
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            myGroups?.map(group => renderGroupCard(group, false))
          )}
        </TabsContent>

        <TabsContent value="discover" className="space-y-4">
          {discoverLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-20 rounded bg-gray-200"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : discoverGroups?.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Search className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-medium">No groups found</h3>
                <p className="text-gray-600">
                  Try adjusting your search criteria or create a new group.
                </p>
              </CardContent>
            </Card>
          ) : (
            discoverGroups?.map(group => renderGroupCard(group))
          )}
        </TabsContent>

        <TabsContent value="suggested" className="space-y-4">
          {suggestedGroups?.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <TrendingUp className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-medium">No suggestions yet</h3>
                <p className="text-gray-600">
                  We'll suggest groups based on your courses and interests.
                </p>
              </CardContent>
            </Card>
          ) : (
            suggestedGroups?.map(group => renderGroupCard(group))
          )}
        </TabsContent>
      </Tabs>

      {/* Create Group Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Study Group</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block text-sm font-medium">
                  Group Name *
                </Label>
                <Input
                  value={newGroup.name}
                  onChange={e =>
                    setNewGroup({ ...newGroup, name: e.target.value })
                  }
                  placeholder="Enter group name..."
                />
              </div>

              <div>
                <Label className="mb-2 block text-sm font-medium">
                  Description *
                </Label>
                <Textarea
                  value={newGroup.description}
                  onChange={e =>
                    setNewGroup({ ...newGroup, description: e.target.value })
                  }
                  placeholder="Describe your study group..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2 block text-sm font-medium">
                    Group Type
                  </Label>
                  <Select
                    value={newGroup.type}
                    onValueChange={value =>
                      setNewGroup({ ...newGroup, type: value as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">
                        Public - Anyone can join
                      </SelectItem>
                      <SelectItem value="private">
                        Private - Invite only
                      </SelectItem>
                      <SelectItem value="course_based">Course-based</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-2 block text-sm font-medium">
                    Max Members
                  </Label>
                  <Input
                    type="number"
                    min="2"
                    max="100"
                    value={newGroup.maxMembers}
                    onChange={e =>
                      setNewGroup({
                        ...newGroup,
                        maxMembers: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              {newGroup.type === 'course_based' && (
                <div>
                  <Label className="mb-2 block text-sm font-medium">
                    Course
                  </Label>
                  <Select
                    value={newGroup.courseId}
                    onValueChange={value =>
                      setNewGroup({ ...newGroup, courseId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses?.map(course => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <Separator />

            {/* Settings */}
            <div className="space-y-4">
              <h4 className="font-medium">Group Settings</h4>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Require Approval</Label>
                  <p className="text-sm text-gray-600">
                    Members need approval to join
                  </p>
                </div>
                <Switch
                  checked={newGroup.requiresApproval}
                  onCheckedChange={checked =>
                    setNewGroup({ ...newGroup, requiresApproval: checked })
                  }
                />
              </div>
            </div>

            <Separator />

            {/* Goals */}
            <div className="space-y-4">
              <h4 className="font-medium">Group Goals</h4>
              {newGroup.goals.map((goal, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={goal}
                    onChange={e => {
                      const newGoals = [...newGroup.goals];
                      newGoals[index] = e.target.value;
                      setNewGroup({ ...newGroup, goals: newGoals });
                    }}
                    placeholder="Enter a goal..."
                  />
                  {newGroup.goals.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newGoals = newGroup.goals.filter(
                          (_, i) => i !== index
                        );
                        setNewGroup({ ...newGroup, goals: newGoals });
                      }}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setNewGroup({ ...newGroup, goals: [...newGroup.goals, ''] })
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Goal
              </Button>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateGroup}
              disabled={!newGroup.name || !newGroup.description}
            >
              Create Group
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Join with Code Dialog */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Join with Invite Code</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="mb-2 block text-sm font-medium">
                Invite Code
              </Label>
              <Input
                value={joinCode}
                onChange={e => setJoinCode(e.target.value)}
                placeholder="Enter invite code..."
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowJoinDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleJoinWithCode} disabled={!joinCode.trim()}>
              Join Group
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
