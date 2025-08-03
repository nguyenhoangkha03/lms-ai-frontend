'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Users,
  Settings,
  MessageSquare,
  FileText,
  Target,
  Calendar,
  Copy,
  UserPlus,
  MoreHorizontal,
  Shield,
  Star,
  Clock,
  BookOpen,
  PieChart,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { collaborativeApi } from '@/lib/redux/api/collaborative-api';

// Import sub-components
import { StudyGroupNotes } from '@/components/collaboration/StudyGroupNotes';
import { StudyGroupProjects } from '@/components/collaboration/StudyGroupProjects';
import { StudyGroupWhiteboard } from '@/components/collaboration/StudyGroupWhiteboard';
import { StudyGroupAnalytics } from '@/components/collaboration/StudyGroupAnalytics';

export default function StudyGroupDetailPage() {
  const params = useParams();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);

  const [activeTab, setActiveTab] = useState<
    'overview' | 'notes' | 'projects' | 'whiteboard' | 'analytics'
  >('overview');

  // RTK Query hooks
  const {
    data: group,
    isLoading,
    error,
  } = collaborativeApi.useGetStudyGroupByIdQuery(params.id as string);
  const { data: groupStats } = collaborativeApi.useGetStudyGroupStatsQuery(
    params.id as string
  );

  const [leaveStudyGroup] = collaborativeApi.useLeaveStudyGroupMutation();
  const [generateInviteCode] = collaborativeApi.useGenerateInviteCodeMutation();
  const [inviteUsers] = collaborativeApi.useInviteUsersToGroupMutation();

  const copyInviteCode = () => {
    if (group?.inviteCode) {
      navigator.clipboard.writeText(group.inviteCode);
      toast({
        title: 'Copied',
        description: 'Invite code copied to clipboard.',
      });
    }
  };

  const shareInviteLink = () => {
    const link = `${window.location.origin}/study-groups/join/${group?.inviteCode}`;
    navigator.clipboard.writeText(link);
    toast({
      title: 'Copied',
      description: 'Invite link copied to clipboard.',
    });
  };

  const handleLeaveGroup = async () => {
    try {
      await leaveStudyGroup({ groupId: params.id as string }).unwrap();
      toast({
        title: 'Left study group',
        description: 'You have left the study group.',
      });
      // Redirect to study groups page
      window.location.href = '/study-groups';
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.data?.message || 'Failed to leave study group.',
        variant: 'destructive',
      });
    }
  };

  const handleGenerateNewCode = async () => {
    try {
      await generateInviteCode({ groupId: params.id as string }).unwrap();
      toast({
        title: 'New invite code generated',
        description: 'A new invite code has been generated.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.data?.message || 'Failed to generate new code.',
        variant: 'destructive',
      });
    }
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

  const getUserRole = (userId: string) => {
    return group?.members.find(m => m.id === userId)?.role || 'member';
  };

  const canModerate = () => {
    const userRole = getUserRole(user?.id || '');
    return userRole === 'owner' || userRole === 'moderator';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-32 rounded bg-gray-200"></div>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="h-96 rounded bg-gray-200 lg:col-span-2"></div>
            <div className="h-96 rounded bg-gray-200"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="mb-2 text-2xl font-bold">Study Group Not Found</h2>
            <p className="mb-4 text-gray-600">
              The study group you're looking for doesn't exist or you don't have
              access to it.
            </p>
            <Button asChild>
              <Link href="/study-groups">Back to Study Groups</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 px-4 py-6">
      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="flex flex-1 gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={group.avatarUrl} />
                <AvatarFallback>{group.name.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">
                      {group.name}
                    </h1>
                    <p className="mt-1 text-gray-600">{group.description}</p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {canModerate() && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link href={`/study-groups/${group.id}/settings`}>
                              <Settings className="mr-2 h-4 w-4" />
                              Settings
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={handleGenerateNewCode}>
                            <Copy className="mr-2 h-4 w-4" />
                            New Invite Code
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuItem onClick={copyInviteCode}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Invite Code
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={shareInviteLink}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Share Invite Link
                      </DropdownMenuItem>
                      {getUserRole(user?.id || '') !== 'owner' && (
                        <DropdownMenuItem
                          onClick={handleLeaveGroup}
                          className="text-red-600"
                        >
                          Leave Group
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Tags and Course */}
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  {group.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                  {group.course && (
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700"
                    >
                      <BookOpen className="mr-1 h-3 w-3" />
                      {group.course.title}
                    </Badge>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm lg:grid-cols-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span>
                      {group.memberCount}/{group.maxMembers} members
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-600" />
                    <span>{group.statistics.totalNotes} notes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-purple-600" />
                    <span>{group.statistics.totalProjects} projects</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <span>Active {formatTimeAgo(group.lastActivityAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 lg:flex-col">
              <Button asChild>
                <Link href={`/chat/rooms/${group.id}`}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Group Chat
                </Link>
              </Button>
              {canModerate() && (
                <Button variant="outline" asChild>
                  <Link href={`/study-groups/${group.id}/manage`}>
                    <Shield className="mr-2 h-4 w-4" />
                    Manage
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={value => setActiveTab(value as any)}
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="whiteboard">Whiteboard</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="space-y-6 lg:col-span-2">
              {/* Goals */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Group Goals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {group.goals.length > 0 ? (
                    <ul className="space-y-2">
                      {group.goals.map((goal, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="mt-2 h-2 w-2 rounded-full bg-blue-500"></div>
                          <span>{goal}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No goals set yet.</p>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Activity items would be loaded from API */}
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={group.creator.avatar} />
                        <AvatarFallback>
                          {group.creator.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">
                            {group.creator.name}
                          </span>{' '}
                          created the group
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatTimeAgo(group.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rules */}
              {group.rules.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Group Rules
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {group.rules.map((rule, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="font-medium text-red-600">
                            {index + 1}.
                          </span>
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Members */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Members ({group.memberCount})
                    </div>
                    {canModerate() && (
                      <Button size="sm" variant="outline">
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {group.members.map(member => (
                      <div key={member.id} className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>
                            {member.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{member.name}</p>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                member.role === 'owner'
                                  ? 'default'
                                  : 'secondary'
                              }
                              className="text-xs"
                            >
                              {member.role}
                            </Badge>
                            {member.contributionScore > 0 && (
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-500" />
                                <span className="text-xs text-gray-500">
                                  {member.contributionScore}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Group Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Total Sessions
                    </span>
                    <span className="font-medium">
                      {group.statistics.totalSessions}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg. Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-current text-yellow-500" />
                      <span className="font-medium">
                        {group.statistics.avgRating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Active Members
                    </span>
                    <span className="font-medium">
                      {group.members.filter(m => m.status === 'active').length}
                    </span>
                  </div>

                  {/* Progress toward goals */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Group Progress</span>
                      <span>75%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Schedule */}
              {group.schedule && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">Type:</span>{' '}
                        {group.schedule.type}
                      </p>
                      {group.schedule.days.length > 0 && (
                        <p className="text-sm">
                          <span className="font-medium">Days:</span>{' '}
                          {group.schedule.days.join(', ')}
                        </p>
                      )}
                      {group.schedule.time && (
                        <p className="text-sm">
                          <span className="font-medium">Time:</span>{' '}
                          {group.schedule.time}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notes">
          <StudyGroupNotes groupId={group.id} canEdit={canModerate()} />
        </TabsContent>

        <TabsContent value="projects">
          <StudyGroupProjects groupId={group.id} canManage={canModerate()} />
        </TabsContent>

        <TabsContent value="whiteboard">
          <StudyGroupWhiteboard groupId={group.id} canEdit={true} />
        </TabsContent>

        <TabsContent value="analytics">
          <StudyGroupAnalytics groupId={group.id} canView={canModerate()} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
