'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  Archive,
  Edit2,
  Trash2,
  Eye,
  Send,
  Calendar,
  Clock,
  Users,
  BarChart3,
  Settings,
  Copy,
  Star,
  AlertTriangle,
  TrendingUp,
  Download,
  Upload,
  Paperclip,
  X,
  Check,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageCircle,
  ThumbsUp,
  Share2,
  MoreVertical,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  useGetAnnouncementsQuery,
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation,
  usePublishAnnouncementMutation,
  useArchiveAnnouncementMutation,
  useDuplicateAnnouncementMutation,
  useBulkActionsMutation,
  useGetAnnouncementStatisticsQuery,
  useUploadAnnouncementAttachmentMutation,
  type TeacherAnnouncement,
  type CreateAnnouncementRequest,
  type UpdateAnnouncementRequest,
} from '@/lib/redux/api/teacher-announcements-api';

interface AnnouncementFormData {
  title: string;
  content: string;
  courseId?: string;
  targetAudience: 'all_students' | 'specific_course' | 'specific_students';
  specificStudentIds?: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledAt?: string;
  expiresAt?: string;
  attachments?: string[];
  tags?: string[];
  allowComments: boolean;
  sendEmail: boolean;
  sendPush: boolean;
}

const defaultFormData: AnnouncementFormData = {
  title: '',
  content: '',
  targetAudience: 'all_students',
  priority: 'medium',
  allowComments: true,
  sendEmail: false,
  sendPush: false,
};

export default function TeacherAnnouncementsPage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State management
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
  const [selectedAnnouncements, setSelectedAnnouncements] = useState<string[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<TeacherAnnouncement | null>(null);
  const [formData, setFormData] = useState<AnnouncementFormData>(defaultFormData);

  // API queries
  const {
    data: announcementsData,
    isLoading: isLoadingAnnouncements,
    refetch: refetchAnnouncements,
  } = useGetAnnouncementsQuery({
    limit: 50,
    offset: 0,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const { data: statisticsData } = useGetAnnouncementStatisticsQuery({
    dateRange: '30d',
  });

  // Mutations
  const [createAnnouncement] = useCreateAnnouncementMutation();
  const [updateAnnouncement] = useUpdateAnnouncementMutation();
  const [deleteAnnouncement] = useDeleteAnnouncementMutation();
  const [publishAnnouncement] = usePublishAnnouncementMutation();
  const [archiveAnnouncement] = useArchiveAnnouncementMutation();
  const [duplicateAnnouncement] = useDuplicateAnnouncementMutation();
  const [bulkActions] = useBulkActionsMutation();
  const [uploadAttachment] = useUploadAnnouncementAttachmentMutation();

  const announcements = announcementsData?.announcements || [];
  
  // Filter announcements by search query
  const filteredAnnouncements = announcements.filter(
    (announcement) =>
      !searchQuery ||
      announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handle form submission
  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in title and content.',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingAnnouncement) {
        await updateAnnouncement({
          id: editingAnnouncement.id,
          updateData: formData as UpdateAnnouncementRequest,
        }).unwrap();
        toast({
          title: 'Announcement Updated',
          description: 'Your announcement has been updated successfully.',
        });
        setEditingAnnouncement(null);
      } else {
        await createAnnouncement(formData as CreateAnnouncementRequest).unwrap();
        toast({
          title: 'Announcement Created',
          description: 'Your announcement has been created successfully.',
        });
      }
      
      setShowCreateDialog(false);
      setFormData(defaultFormData);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Something went wrong.',
        variant: 'destructive',
      });
    }
  };

  // Handle publish announcement
  const handlePublish = async (id: string) => {
    try {
      await publishAnnouncement(id).unwrap();
      toast({
        title: 'Announcement Published',
        description: 'Your announcement is now visible to students.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to publish announcement.',
        variant: 'destructive',
      });
    }
  };

  // Handle archive announcement
  const handleArchive = async (id: string) => {
    try {
      await archiveAnnouncement(id).unwrap();
      toast({
        title: 'Announcement Archived',
        description: 'The announcement has been archived.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to archive announcement.',
        variant: 'destructive',
      });
    }
  };

  // Handle delete announcement
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    try {
      await deleteAnnouncement(id).unwrap();
      toast({
        title: 'Announcement Deleted',
        description: 'The announcement has been deleted.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to delete announcement.',
        variant: 'destructive',
      });
    }
  };

  // Handle duplicate announcement
  const handleDuplicate = async (id: string) => {
    try {
      await duplicateAnnouncement({ id }).unwrap();
      toast({
        title: 'Announcement Duplicated',
        description: 'A copy has been created in your drafts.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to duplicate announcement.',
        variant: 'destructive',
      });
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action: 'publish' | 'archive' | 'delete') => {
    if (selectedAnnouncements.length === 0) {
      toast({
        title: 'No Selection',
        description: 'Please select announcements first.',
        variant: 'destructive',
      });
      return;
    }

    if (action === 'delete' && !confirm(`Are you sure you want to delete ${selectedAnnouncements.length} announcements?`)) {
      return;
    }

    try {
      const result = await bulkActions({
        announcementIds: selectedAnnouncements,
        action,
      }).unwrap();
      
      toast({
        title: 'Bulk Action Completed',
        description: `${result.processedCount} announcements processed.`,
      });
      
      setSelectedAnnouncements([]);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Bulk action failed.',
        variant: 'destructive',
      });
    }
  };

  // Handle edit announcement
  const handleEdit = (announcement: TeacherAnnouncement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      courseId: announcement.courseId,
      targetAudience: announcement.targetAudience,
      specificStudentIds: announcement.specificStudentIds,
      priority: announcement.priority,
      scheduledAt: announcement.scheduledAt,
      expiresAt: announcement.expiresAt,
      attachments: announcement.attachments,
      tags: announcement.tags,
      allowComments: announcement.allowComments,
      sendEmail: announcement.sendEmail,
      sendPush: announcement.sendPush,
    });
    setShowCreateDialog(true);
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 border-green-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'archived': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-white/20 bg-white/80 backdrop-blur-xl dark:bg-slate-900/80">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                <Megaphone className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Announcements</h1>
                <p className="text-slate-600 dark:text-slate-300">
                  Communicate with your students • {statisticsData?.totalAnnouncements || 0} total
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-gradient-to-r from-blue-500 to-indigo-600"
                    onClick={() => {
                      setEditingAnnouncement(null);
                      setFormData(defaultFormData);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    New Announcement
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingAnnouncement 
                        ? 'Update your announcement details.'
                        : 'Create a new announcement to communicate with your students.'
                      }
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    {/* Title */}
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        placeholder="Enter announcement title..."
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>

                    {/* Content */}
                    <div>
                      <Label htmlFor="content">Content *</Label>
                      <Textarea
                        id="content"
                        placeholder="Enter announcement content..."
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        rows={6}
                      />
                    </div>

                    {/* Target Audience & Priority */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="targetAudience">Target Audience</Label>
                        <Select 
                          value={formData.targetAudience} 
                          onValueChange={(value: any) => setFormData({ ...formData, targetAudience: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all_students">All Students</SelectItem>
                            <SelectItem value="specific_course">Specific Course</SelectItem>
                            <SelectItem value="specific_students">Specific Students</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="priority">Priority</Label>
                        <Select 
                          value={formData.priority} 
                          onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Settings */}
                    <div className="space-y-4">
                      <Label>Settings</Label>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="allowComments" className="text-sm">Allow Comments</Label>
                        <Switch
                          id="allowComments"
                          checked={formData.allowComments}
                          onCheckedChange={(checked) => setFormData({ ...formData, allowComments: checked })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="sendEmail" className="text-sm">Send Email Notification</Label>
                        <Switch
                          id="sendEmail"
                          checked={formData.sendEmail}
                          onCheckedChange={(checked) => setFormData({ ...formData, sendEmail: checked })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="sendPush" className="text-sm">Send Push Notification</Label>
                        <Switch
                          id="sendPush"
                          checked={formData.sendPush}
                          onCheckedChange={(checked) => setFormData({ ...formData, sendPush: checked })}
                        />
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit}>
                      {editingAnnouncement ? 'Update' : 'Create'} Announcement
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Bulk Actions */}
              {selectedAnnouncements.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      Actions ({selectedAnnouncements.length})
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleBulkAction('publish')}>
                      <Send className="mr-2 h-4 w-4" />
                      Publish Selected
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction('archive')}>
                      <Archive className="mr-2 h-4 w-4" />
                      Archive Selected
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleBulkAction('delete')} className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Selected
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-white/30 bg-white/80 backdrop-blur-xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{statisticsData?.totalAnnouncements || 0}</p>
                </div>
                <Megaphone className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/30 bg-white/80 backdrop-blur-xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Published</p>
                  <p className="text-2xl font-bold">{statisticsData?.publishedAnnouncements || 0}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/30 bg-white/80 backdrop-blur-xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Drafts</p>
                  <p className="text-2xl font-bold">{statisticsData?.draftAnnouncements || 0}</p>
                </div>
                <Edit2 className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/30 bg-white/80 backdrop-blur-xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Views</p>
                  <p className="text-2xl font-bold">{statisticsData?.totalViews || 0}</p>
                </div>
                <Eye className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6 border-white/30 bg-white/80 backdrop-blur-xl shadow-xl">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 items-center space-x-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search announcements..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Drafts</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (selectedAnnouncements.length === filteredAnnouncements.length) {
                      setSelectedAnnouncements([]);
                    } else {
                      setSelectedAnnouncements(filteredAnnouncements.map(a => a.id));
                    }
                  }}
                >
                  {selectedAnnouncements.length === filteredAnnouncements.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Announcements List */}
        <Card className="border-white/30 bg-white/80 backdrop-blur-xl shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Megaphone className="h-5 w-5" />
              <span>Announcements</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingAnnouncements ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-start space-x-4 p-4 border rounded-lg">
                    <Skeleton className="h-4 w-4 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <div className="flex space-x-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-8" />
                  </div>
                ))}
              </div>
            ) : filteredAnnouncements.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">
                  {searchQuery ? 'No matching announcements' : 'No announcements yet'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery 
                    ? 'Try adjusting your search terms or filters.'
                    : 'Create your first announcement to start communicating with students.'
                  }
                </p>
                {!searchQuery && (
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Announcement
                  </Button>
                )}
              </div>
            ) : (
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  <AnimatePresence>
                    {filteredAnnouncements.map((announcement) => (
                      <motion.div
                        key={announcement.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="group relative flex items-start space-x-4 rounded-lg border p-4 transition-all hover:bg-muted/30"
                      >
                        <Checkbox
                          checked={selectedAnnouncements.includes(announcement.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedAnnouncements(prev => [...prev, announcement.id]);
                            } else {
                              setSelectedAnnouncements(prev => prev.filter(id => id !== announcement.id));
                            }
                          }}
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-lg truncate">
                                {announcement.title}
                              </h3>
                              <Badge className={getPriorityColor(announcement.priority)}>
                                {announcement.priority}
                              </Badge>
                              <Badge className={getStatusColor(announcement.status)}>
                                {announcement.status}
                              </Badge>
                            </div>
                          </div>

                          <p className="text-muted-foreground mb-3 line-clamp-2">
                            {announcement.content}
                          </p>

                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center space-x-1">
                              <Eye className="h-3 w-3" />
                              <span>{announcement.viewCount}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <ThumbsUp className="h-3 w-3" />
                              <span>{announcement.likeCount}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageCircle className="h-3 w-3" />
                              <span>{announcement.commentCount}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatDate(announcement.createdAt)}</span>
                            </div>
                            {announcement.targetAudience === 'specific_course' && announcement.courseName && (
                              <Badge variant="outline" className="text-xs">
                                {announcement.courseName}
                              </Badge>
                            )}
                          </div>

                          {announcement.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {announcement.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(announcement)}>
                              <Edit2 className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(announcement.id)}>
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            {announcement.status === 'draft' && (
                              <DropdownMenuItem onClick={() => handlePublish(announcement.id)}>
                                <Send className="mr-2 h-4 w-4" />
                                Publish
                              </DropdownMenuItem>
                            )}
                            {announcement.status === 'published' && (
                              <DropdownMenuItem onClick={() => handleArchive(announcement.id)}>
                                <Archive className="mr-2 h-4 w-4" />
                                Archive
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(announcement.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx"
        className="hidden"
        onChange={(e) => {
          // Handle file uploads here if needed
        }}
      />
    </div>
  );
}