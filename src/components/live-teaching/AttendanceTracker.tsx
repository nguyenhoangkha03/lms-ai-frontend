'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Download,
  Search,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

import type {
  VideoParticipant,
  AttendanceRecord,
} from '@/lib/types/live-teaching';
import {
  useGetSessionAttendanceQuery,
  useUpdateAttendanceRecordMutation,
  useExportAttendanceMutation,
} from '@/lib/redux/api/live-teaching-api';

interface AttendanceTrackerProps {
  sessionId: string;
  participants: VideoParticipant[];
  className?: string;
}

type AttendanceStatus = 'present' | 'late' | 'absent' | 'excused';
type FilterType = 'all' | 'present' | 'late' | 'absent' | 'excused';

export function AttendanceTracker({
  sessionId,
  participants,
  className,
}: AttendanceTrackerProps) {
  const { toast } = useToast();

  // API hooks
  const { data: attendanceData, refetch } =
    useGetSessionAttendanceQuery(sessionId);
  const [updateAttendanceRecord] = useUpdateAttendanceRecordMutation();
  const [exportAttendance] = useExportAttendanceMutation();

  // State
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterType>('all');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    []
  );

  const attendanceRecords = attendanceData?.records || [];
  const attendanceSummary = attendanceData?.summary;

  // Calculate real-time attendance statistics
  const attendanceStats = React.useMemo(() => {
    const total = participants.length;
    const present = participants.filter(
      p => p.connectionStatus === 'connected'
    ).length;
    const late = attendanceRecords.filter(r => r.status === 'late').length;
    const absent = total - present;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, late, absent, rate };
  }, [participants, attendanceRecords]);

  // Filter and search participants
  const filteredParticipants = React.useMemo(() => {
    return participants.filter(participant => {
      // Search filter
      if (
        searchTerm &&
        !participant.user.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'all') {
        const record = attendanceRecords.find(
          r => r.participantId === participant.id
        );
        const status = getParticipantStatus(participant, record);
        if (status !== statusFilter) {
          return false;
        }
      }

      return true;
    });
  }, [participants, searchTerm, statusFilter, attendanceRecords]);

  // Get participant status
  const getParticipantStatus = useCallback(
    (
      participant: VideoParticipant,
      record?: AttendanceRecord
    ): AttendanceStatus => {
      if (record) {
        return record.status;
      }

      // Determine status based on connection
      if (participant.connectionStatus === 'connected') {
        // Check if joined late (more than 5 minutes after session start)
        const joinTime = new Date(participant.joinedAt).getTime();
        const sessionStart = Date.now() - participant.duration * 1000; // Approximate session start
        const lateThreshold = 5 * 60 * 1000; // 5 minutes

        return joinTime > sessionStart + lateThreshold ? 'late' : 'present';
      }

      return 'absent';
    },
    []
  );

  // Get status color
  const getStatusColor = useCallback((status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return 'text-green-400';
      case 'late':
        return 'text-yellow-400';
      case 'absent':
        return 'text-red-400';
      case 'excused':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  }, []);

  // Get status icon
  const getStatusIcon = useCallback((status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return CheckCircle;
      case 'late':
        return AlertCircle;
      case 'absent':
        return XCircle;
      case 'excused':
        return Eye;
      default:
        return XCircle;
    }
  }, []);

  // Update attendance status
  const handleUpdateStatus = useCallback(
    async (participantId: string, status: AttendanceStatus, notes?: string) => {
      try {
        await updateAttendanceRecord({
          sessionId,
          participantId,
          data: { status, notes },
        }).unwrap();

        refetch();

        toast({
          title: 'Attendance Updated',
          description: 'Participant attendance status has been updated.',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to update attendance status.',
          variant: 'destructive',
        });
      }
    },
    [sessionId, updateAttendanceRecord, refetch, toast]
  );

  // Bulk update attendance
  const handleBulkUpdate = useCallback(
    async (status: AttendanceStatus) => {
      try {
        for (const participantId of selectedParticipants) {
          await updateAttendanceRecord({
            sessionId,
            participantId,
            data: { status },
          }).unwrap();
        }

        setSelectedParticipants([]);
        refetch();

        toast({
          title: 'Bulk Update Complete',
          description: `${selectedParticipants.length} attendance records updated.`,
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to update attendance records.',
          variant: 'destructive',
        });
      }
    },
    [selectedParticipants, sessionId, updateAttendanceRecord, refetch, toast]
  );

  // Export attendance
  const handleExport = useCallback(
    async (format: 'csv' | 'excel' | 'pdf') => {
      try {
        const blob = await exportAttendance({
          sessionId,
          format,
        }).unwrap();

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance-${sessionId}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: 'Export Complete',
          description: `Attendance report exported as ${format.toUpperCase()}.`,
        });
      } catch (error) {
        toast({
          title: 'Export Error',
          description: 'Failed to export attendance report.',
          variant: 'destructive',
        });
      }
    },
    [sessionId, exportAttendance, toast]
  );

  // Format duration
  const formatDuration = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }, []);

  return (
    <div
      className={cn(
        'rounded-lg border border-gray-700 bg-gray-900/95 backdrop-blur-sm',
        className
      )}
    >
      {/* Compact View */}
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-white">
                Attendance: {attendanceStats.present}/{attendanceStats.total}
              </span>
              <Badge
                variant={attendanceStats.rate >= 80 ? 'default' : 'destructive'}
              >
                {attendanceStats.rate}%
              </Badge>
            </div>

            <div className="flex space-x-1">
              <div className="flex items-center space-x-1">
                <div className="h-2 w-2 rounded-full bg-green-400" />
                <span className="text-xs text-gray-400">
                  {attendanceStats.present}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="h-2 w-2 rounded-full bg-yellow-400" />
                <span className="text-xs text-gray-400">
                  {attendanceStats.late}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="h-2 w-2 rounded-full bg-red-400" />
                <span className="text-xs text-gray-400">
                  {attendanceStats.absent}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('excel')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-2">
          <Progress value={attendanceStats.rate} className="h-1" />
        </div>
      </div>

      {/* Expanded View */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-700"
          >
            <div className="p-4">
              {/* Controls */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search participants..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-48 pl-9"
                    />
                  </div>

                  <Select
                    value={statusFilter}
                    onValueChange={(value: FilterType) =>
                      setStatusFilter(value)
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="present">Present</SelectItem>
                      <SelectItem value="late">Late</SelectItem>
                      <SelectItem value="absent">Absent</SelectItem>
                      <SelectItem value="excused">Excused</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Bulk Actions */}
                {selectedParticipants.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">
                      {selectedParticipants.length} selected
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          Bulk Update
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => handleBulkUpdate('present')}
                        >
                          Mark as Present
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleBulkUpdate('late')}
                        >
                          Mark as Late
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleBulkUpdate('absent')}
                        >
                          Mark as Absent
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleBulkUpdate('excused')}
                        >
                          Mark as Excused
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>

              {/* Participant List */}
              <div className="max-h-80 space-y-2 overflow-y-auto">
                {filteredParticipants.map(participant => {
                  const record = attendanceRecords.find(
                    r => r.participantId === participant.id
                  );
                  const status = getParticipantStatus(participant, record);
                  const StatusIcon = getStatusIcon(status);
                  const isSelected = selectedParticipants.includes(
                    participant.id
                  );

                  return (
                    <div
                      key={participant.id}
                      className={cn(
                        'flex items-center justify-between rounded-lg border p-3',
                        isSelected
                          ? 'border-blue-500 bg-blue-500/20'
                          : 'border-gray-600 bg-gray-700'
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={e => {
                            if (e.target.checked) {
                              setSelectedParticipants(prev => [
                                ...prev,
                                participant.id,
                              ]);
                            } else {
                              setSelectedParticipants(prev =>
                                prev.filter(id => id !== participant.id)
                              );
                            }
                          }}
                          className="rounded"
                        />

                        <Avatar className="h-8 w-8">
                          <AvatarImage src={participant.user.avatar} />
                          <AvatarFallback>
                            {participant.user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div>
                          <p className="text-sm font-medium text-white">
                            {participant.user.name}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-gray-400">
                            <span>
                              Duration: {formatDuration(participant.duration)}
                            </span>
                            {record && (
                              <span>
                                • Joined:{' '}
                                {new Date(
                                  participant.joinedAt
                                ).toLocaleTimeString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div
                          className={cn(
                            'flex items-center space-x-1',
                            getStatusColor(status)
                          )}
                        >
                          <StatusIcon className="h-4 w-4" />
                          <span className="text-sm capitalize">{status}</span>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateStatus(participant.id, 'present')
                              }
                            >
                              Mark Present
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateStatus(participant.id, 'late')
                              }
                            >
                              Mark Late
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateStatus(participant.id, 'absent')
                              }
                            >
                              Mark Absent
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateStatus(participant.id, 'excused')
                              }
                            >
                              Mark Excused
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredParticipants.length === 0 && (
                <div className="py-8 text-center text-gray-400">
                  No participants found matching your criteria.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
