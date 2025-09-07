'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Video,
  Calendar,
  Users,
  Clock,
  Search,
  MoreVertical,
  Play,
  Square,
  Edit,
  Trash2,
  Copy,
  Download,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

// Import components
import { VideoSessionInterface } from '@/components/live-teaching/VideoSessionInterface';
import { CreateSessionDialog } from '@/components/live-teaching/CreateSessionDialog';

import {
  useGetLiveSessionsQuery,
  useGetLiveSessionStatisticsQuery,
  useDeleteLiveSessionMutation,
  useStartLiveSessionMutation,
  useEndLiveSessionMutation,
  LiveSession,
} from '@/lib/redux/api/teacher-live-sessions-api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function LiveSessionsPage() {
  const router = useRouter();
  const { toast } = useToast();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sessionTypeFilter, setSessionTypeFilter] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeSession, setActiveSession] = useState<string | null>(null);

  //// API hooks
  const { data: sessionsData, isLoading } = useGetLiveSessionsQuery({
    status: statusFilter === 'all' ? undefined : statusFilter,
  });
  const { data: statistics } = useGetLiveSessionStatisticsQuery();
  const [startSession] = useStartLiveSessionMutation();
  const [endSession] = useEndLiveSessionMutation();
  const [deleteSession] = useDeleteLiveSessionMutation();

  const sessions = sessionsData?.sessions || [];
  const upcomingSessions = statistics?.upcomingSessions || [];

  // Handle session actions
  const handleStartSession = async (sessionId: string) => {
    try {
      await startSession(sessionId).unwrap();
      setActiveSession(sessionId);
      toast({
        title: 'Session Started',
        description: 'Live session has been started successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start session.',
        variant: 'destructive',
      });
    }
  };

  const handleEndSession = async (sessionId: string) => {
    try {
      await endSession(sessionId).unwrap();
      setActiveSession(null);
      toast({
        title: 'Session Ended',
        description: 'Live session has been ended.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to end session.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteSession(sessionId).unwrap();
      toast({
        title: 'Session Deleted',
        description: 'Session has been deleted successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete session.',
        variant: 'destructive',
      });
    }
  };

  const handleJoinSession = (sessionId: string) => {
    setActiveSession(sessionId);
  };

  const copySessionLink = (sessionId: string) => {
    const link = `${window.location.origin}/session/${sessionId}`;
    navigator.clipboard.writeText(link);
    toast({
      title: 'Link Copied',
      description: 'Session link has been copied to clipboard.',
    });
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      ' ' +
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-red-500';
      case 'scheduled':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Show active session interface
  if (activeSession) {
    return (
      <VideoSessionInterface
        sessionId={activeSession}
        isHost={true}
        onSessionEnd={() => setActiveSession(null)}
      />
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Live Sessions</h1>
          <p className="text-muted-foreground">
            Manage and conduct live teaching sessions
          </p>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Schedule Session
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogTitle className="sr-only">Create Live Session</DialogTitle>
            <CreateSessionDialog
              onClose={() => setShowCreateDialog(false)}
              onSuccess={() => {
                setShowCreateDialog(false);
                toast({
                  title: 'Session Scheduled',
                  description:
                    'Your live session has been scheduled successfully.',
                });
              }}
            />
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Upcoming Sessions Quick View */}
      {upcomingSessions && upcomingSessions.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Upcoming Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {upcomingSessions.slice(0, 3).map(session => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`h-2 w-2 rounded-full ${getStatusColor(session.status)}`}
                      />
                      <div>
                        <p className="font-medium">{session.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(session.scheduledAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{session.courseName}</Badge>
                      <Button
                        size="sm"
                        onClick={() => handleJoinSession(session.id)}
                        disabled={session.status !== 'scheduled'}
                      >
                        {session.status === 'live' ? 'Join' : 'Start'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Filters and Search */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col gap-4 sm:flex-row"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search sessions..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="live">Live</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sessionTypeFilter} onValueChange={setSessionTypeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="lecture">Lecture</SelectItem>
            <SelectItem value="tutorial">Tutorial</SelectItem>
            <SelectItem value="office_hours">Office Hours</SelectItem>
            <SelectItem value="study_group">Study Group</SelectItem>
            <SelectItem value="workshop">Workshop</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Sessions Grid */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {sessions.map(session => (
          <motion.div key={session.id} variants={itemVariants}>
            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="mb-1 truncate text-lg">
                      {session.title}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(session.status)}>
                        {session.status}
                      </Badge>
                      <Badge variant="outline">{session.courseName}</Badge>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {session.status === 'scheduled' && (
                        <DropdownMenuItem
                          onClick={() => handleStartSession(session.id)}
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Start Session
                        </DropdownMenuItem>
                      )}
                      {session.status === 'live' && (
                        <>
                          <DropdownMenuItem
                            onClick={() => handleJoinSession(session.id)}
                          >
                            <Video className="mr-2 h-4 w-4" />
                            Join Session
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEndSession(session.id)}
                          >
                            <Square className="mr-2 h-4 w-4" />
                            End Session
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuItem
                        onClick={() => copySessionLink(session.id)}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Link
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(
                            `/teacher/live-sessions/${session.id}/edit`
                          )
                        }
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      {session.status !== 'live' && (
                        <DropdownMenuItem
                          onClick={() => handleDeleteSession(session.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {/* Description */}
                  {session.description && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {session.description}
                    </p>
                  )}

                  {/* Schedule Info */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>Start: {formatDate(session.scheduledAt)}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="mr-2 h-4 w-4" />
                      <span>Duration: {session.duration} minutes</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Users className="mr-2 h-4 w-4" />
                      <span>
                        {session.currentParticipants}/{session.maxParticipants}{' '}
                        participants
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-2">
                    {session.status === 'scheduled' && (
                      <Button
                        className="flex-1"
                        onClick={() => handleStartSession(session.id)}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Start
                      </Button>
                    )}
                    {session.status === 'live' && (
                      <Button
                        className="flex-1"
                        onClick={() => handleJoinSession(session.id)}
                      >
                        <Video className="mr-2 h-4 w-4" />
                        Join
                      </Button>
                    )}
                    {session.status === 'completed' && session.recordingUrl && (
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() =>
                          window.open(session.recordingUrl, '_blank')
                        }
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Recording
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State */}
      {!isLoading && sessions.length === 0 && (
        <motion.div variants={itemVariants} className="py-12 text-center">
          <Video className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-medium">No Sessions Found</h3>
          <p className="mb-4 text-muted-foreground">
            {searchTerm || statusFilter !== 'all' || sessionTypeFilter !== 'all'
              ? 'No sessions match your current filters.'
              : "You haven't scheduled any live sessions yet."}
          </p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Schedule Your First Session
          </Button>
        </motion.div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
                <div className="h-3 w-1/2 rounded bg-gray-200"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 rounded bg-gray-200"></div>
                  <div className="h-3 w-2/3 rounded bg-gray-200"></div>
                  <div className="mt-4 h-8 rounded bg-gray-200"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
