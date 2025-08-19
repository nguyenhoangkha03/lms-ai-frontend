'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Bell,
  BellOff,
  Search,
  Filter,
  Check,
  CheckCheck,
  Trash2,
  MoreVertical,
  Settings,
  Archive,
  Star,
  StarOff,
  Calendar,
  Clock,
  User,
  BookOpen,
  MessageSquare,
  Award,
  Upload,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  Zap,
  Mail,
  Smartphone,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  ExternalLink,
  GraduationCap,
  FileText,
  Users,
  Target,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'announcement' | 'assignment' | 'grade' | 'message' | 'system';
  category: 'course' | 'assignment' | 'grade' | 'message' | 'system' | 'achievement' | 'reminder';
  isRead: boolean;
  isImportant: boolean;
  isFavorite: boolean;
  actionUrl?: string;
  actionText?: string;
  data?: Record<string, any>;
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
  courseId?: string;
  courseName?: string;
  createdAt: string;
  readAt?: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  courseUpdates: boolean;
  assignmentReminders: boolean;
  gradeNotifications: boolean;
  messageNotifications: boolean;
  achievementNotifications: boolean;
  systemNotifications: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
  frequency: 'instant' | 'daily' | 'weekly';
}

export default function StudentNotificationsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Mock notification settings
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    courseUpdates: true,
    assignmentReminders: true,
    gradeNotifications: true,
    messageNotifications: true,
    achievementNotifications: true,
    systemNotifications: true,
    quietHours: {
      enabled: true,
      startTime: '22:00',
      endTime: '07:00',
    },
    frequency: 'instant',
  });

  // Mock notifications data
  const mockNotifications: Notification[] = [
    {
      id: '1',
      title: 'Bài tập mới được giao',
      message: 'Bạn có bài tập mới "JavaScript ES6 Features" cần hoàn thành trước ngày 25/01/2024',
      type: 'assignment',
      category: 'assignment',
      isRead: false,
      isImportant: true,
      isFavorite: false,
      actionUrl: '/student/assignments/1',
      actionText: 'Xem bài tập',
      courseId: 'course-1',
      courseName: 'Lập trình JavaScript từ cơ bản đến nâng cao',
      senderId: 'teacher-1',
      senderName: 'GV. Nguyễn Văn A',
      createdAt: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      title: 'Điểm số đã được cập nhật',
      message: 'Điểm bài kiểm tra "React Hooks" của bạn đã được chấm: 85/100',
      type: 'grade',
      category: 'grade',
      isRead: false,
      isImportant: false,
      isFavorite: true,
      actionUrl: '/student/grades',
      actionText: 'Xem điểm',
      courseId: 'course-2',
      courseName: 'React.js Complete Course',
      senderId: 'teacher-2',
      senderName: 'GV. Trần Thị B',
      createdAt: '2024-01-15T09:15:00Z',
    },
    {
      id: '3',
      title: 'Tin nhắn mới từ giảng viên',
      message: 'GV. Lê Văn C đã gửi tin nhắn cho bạn về dự án cuối khóa',
      type: 'message',
      category: 'message',
      isRead: true,
      isImportant: false,
      isFavorite: false,
      actionUrl: '/student/messages/3',
      actionText: 'Xem tin nhắn',
      senderId: 'teacher-3',
      senderName: 'GV. Lê Văn C',
      createdAt: '2024-01-14T16:45:00Z',
      readAt: '2024-01-14T17:00:00Z',
    },
    {
      id: '4',
      title: 'Chúc mừng! Bạn đã hoàn thành khóa học',
      message: 'Bạn đã hoàn thành 100% khóa học "HTML/CSS Fundamentals" và nhận được chứng chỉ',
      type: 'success',
      category: 'achievement',
      isRead: true,
      isImportant: true,
      isFavorite: true,
      actionUrl: '/student/certificates',
      actionText: 'Xem chứng chỉ',
      courseId: 'course-3',
      courseName: 'HTML/CSS Fundamentals',
      createdAt: '2024-01-13T14:20:00Z',
      readAt: '2024-01-13T14:25:00Z',
    },
    {
      id: '5',
      title: 'Nhắc nhở: Hạn nộp bài tập sắp đến',
      message: 'Bài tập "CSS Grid Layout" sẽ hết hạn nộp vào ngày mai (16/01/2024)',
      type: 'warning',
      category: 'reminder',
      isRead: false,
      isImportant: true,
      isFavorite: false,
      actionUrl: '/student/assignments/2',
      actionText: 'Nộp bài',
      courseId: 'course-2',
      courseName: 'Frontend Development',
      createdAt: '2024-01-14T08:00:00Z',
    },
  ];

  const notifications = mockNotifications;

  const handleMarkAsRead = (notificationIds: string[]) => {
    toast.success(`Đã đánh dấu ${notificationIds.length} thông báo là đã đọc`);
  };

  const handleMarkAsUnread = (notificationIds: string[]) => {
    toast.success(`Đã đánh dấu ${notificationIds.length} thông báo là chưa đọc`);
  };

  const handleDelete = (notificationIds: string[]) => {
    toast.success(`Đã xóa ${notificationIds.length} thông báo`);
  };

  const handleToggleFavorite = (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      toast.success(notification.isFavorite ? 'Đã bỏ yêu thích' : 'Đã thêm vào yêu thích');
    }
  };

  const handleBulkAction = (action: 'read' | 'unread' | 'delete') => {
    if (selectedNotifications.length === 0) {
      toast.error('Vui lòng chọn ít nhất một thông báo');
      return;
    }

    switch (action) {
      case 'read':
        handleMarkAsRead(selectedNotifications);
        break;
      case 'unread':
        handleMarkAsUnread(selectedNotifications);
        break;
      case 'delete':
        handleDelete(selectedNotifications);
        break;
    }
    setSelectedNotifications([]);
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const handleSelectNotification = (notificationId: string) => {
    setSelectedNotifications(prev => {
      if (prev.includes(notificationId)) {
        return prev.filter(id => id !== notificationId);
      } else {
        return [...prev, notificationId];
      }
    });
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.courseName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab = 
      activeTab === 'all' ||
      (activeTab === 'unread' && !notification.isRead) ||
      (activeTab === 'important' && notification.isImportant) ||
      (activeTab === 'favorites' && notification.isFavorite) ||
      notification.category === activeTab;

    const matchesFilter = 
      filterType === 'all' ||
      notification.type === filterType;

    return matchesSearch && matchesTab && matchesFilter;
  });

  const sortedNotifications = filteredNotifications.sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'importance':
        if (a.isImportant && !b.isImportant) return -1;
        if (!a.isImportant && b.isImportant) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'course':
        return (a.courseName || '').localeCompare(b.courseName || '');
      default:
        return 0;
    }
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'assignment':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'grade':
        return <Award className="h-5 w-5 text-green-500" />;
      case 'message':
        return <MessageSquare className="h-5 w-5 text-purple-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'announcement':
        return <Bell className="h-5 w-5 text-blue-500" />;
      case 'system':
        return <Settings className="h-5 w-5 text-gray-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'assignment': return 'Bài tập';
      case 'grade': return 'Điểm số';
      case 'message': return 'Tin nhắn';
      case 'achievement': return 'Thành tích';
      case 'reminder': return 'Nhắc nhở';
      case 'course': return 'Khóa học';
      case 'system': return 'Hệ thống';
      default: return 'Khác';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return `${minutes} phút trước`;
      }
      return `${hours} giờ trước`;
    } else if (days === 1) {
      return 'Hôm qua';
    } else if (days < 7) {
      return `${days} ngày trước`;
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  };

  const getTabCounts = () => {
    return {
      all: notifications.length,
      unread: notifications.filter(n => !n.isRead).length,
      important: notifications.filter(n => n.isImportant).length,
      favorites: notifications.filter(n => n.isFavorite).length,
      assignment: notifications.filter(n => n.category === 'assignment').length,
      grade: notifications.filter(n => n.category === 'grade').length,
      message: notifications.filter(n => n.category === 'message').length,
    };
  };

  const tabCounts = getTabCounts();

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Thông báo</h1>
          <p className="text-muted-foreground">
            Theo dõi các thông báo và cập nhật quan trọng
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => handleBulkAction('read')}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Đánh dấu tất cả đã đọc
          </Button>
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Cài đặt
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Cài đặt thông báo</DialogTitle>
                <DialogDescription>
                  Tùy chỉnh cách bạn nhận thông báo
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {/* Notification Channels */}
                <div>
                  <h4 className="font-semibold mb-3">Kênh thông báo</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4" />
                        <span>Email</span>
                      </div>
                      <Switch
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({ ...prev, emailNotifications: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Bell className="h-4 w-4" />
                        <span>Thông báo đẩy</span>
                      </div>
                      <Switch
                        checked={settings.pushNotifications}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({ ...prev, pushNotifications: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-4 w-4" />
                        <span>SMS</span>
                      </div>
                      <Switch
                        checked={settings.smsNotifications}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({ ...prev, smsNotifications: checked }))
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Notification Types */}
                <div>
                  <h4 className="font-semibold mb-3">Loại thông báo</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Cập nhật khóa học</span>
                      <Switch
                        checked={settings.courseUpdates}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({ ...prev, courseUpdates: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Nhắc nhở bài tập</span>
                      <Switch
                        checked={settings.assignmentReminders}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({ ...prev, assignmentReminders: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Thông báo điểm số</span>
                      <Switch
                        checked={settings.gradeNotifications}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({ ...prev, gradeNotifications: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Tin nhắn mới</span>
                      <Switch
                        checked={settings.messageNotifications}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({ ...prev, messageNotifications: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Thành tích</span>
                      <Switch
                        checked={settings.achievementNotifications}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({ ...prev, achievementNotifications: checked }))
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Quiet Hours */}
                <div>
                  <h4 className="font-semibold mb-3">Giờ yên tĩnh</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Bật giờ yên tĩnh</span>
                      <Switch
                        checked={settings.quietHours.enabled}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({ 
                            ...prev, 
                            quietHours: { ...prev.quietHours, enabled: checked }
                          }))
                        }
                      />
                    </div>
                    {settings.quietHours.enabled && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Từ</label>
                          <Input
                            type="time"
                            value={settings.quietHours.startTime}
                            onChange={(e) => 
                              setSettings(prev => ({ 
                                ...prev, 
                                quietHours: { ...prev.quietHours, startTime: e.target.value }
                              }))
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Đến</label>
                          <Input
                            type="time"
                            value={settings.quietHours.endTime}
                            onChange={(e) => 
                              setSettings(prev => ({ 
                                ...prev, 
                                quietHours: { ...prev.quietHours, endTime: e.target.value }
                              }))
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={() => {
                  toast.success('Đã lưu cài đặt thông báo');
                  setIsSettingsOpen(false);
                }}>
                  Lưu cài đặt
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 gap-4 md:grid-cols-4"
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tổng thông báo</p>
                <p className="text-2xl font-bold">{tabCounts.all}</p>
              </div>
              <Bell className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Chưa đọc</p>
                <p className="text-2xl font-bold">{tabCounts.unread}</p>
              </div>
              <Eye className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Quan trọng</p>
                <p className="text-2xl font-bold">{tabCounts.important}</p>
              </div>
              <Zap className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Yêu thích</p>
                <p className="text-2xl font-bold">{tabCounts.favorites}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Tìm kiếm thông báo..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {selectedNotifications.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      Đã chọn {selectedNotifications.length}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAction('read')}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAction('delete')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Lọc loại" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả loại</SelectItem>
                    <SelectItem value="assignment">Bài tập</SelectItem>
                    <SelectItem value="grade">Điểm số</SelectItem>
                    <SelectItem value="message">Tin nhắn</SelectItem>
                    <SelectItem value="success">Thành công</SelectItem>
                    <SelectItem value="warning">Cảnh báo</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Mới nhất</SelectItem>
                    <SelectItem value="oldest">Cũ nhất</SelectItem>
                    <SelectItem value="importance">Quan trọng</SelectItem>
                    <SelectItem value="course">Khóa học</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={handleSelectAll}
                >
                  {selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0
                    ? 'Bỏ chọn tất cả'
                    : 'Chọn tất cả'
                  }
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="all" className="flex items-center gap-1">
              Tất cả
              {tabCounts.all > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {tabCounts.all}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="unread" className="flex items-center gap-1">
              Chưa đọc
              {tabCounts.unread > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {tabCounts.unread}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="important" className="flex items-center gap-1">
              Quan trọng
              {tabCounts.important > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {tabCounts.important}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-1">
              Yêu thích
              {tabCounts.favorites > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {tabCounts.favorites}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="assignment" className="flex items-center gap-1">
              Bài tập
              {tabCounts.assignment > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {tabCounts.assignment}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="grade" className="flex items-center gap-1">
              Điểm số
              {tabCounts.grade > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {tabCounts.grade}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="message" className="flex items-center gap-1">
              Tin nhắn
              {tabCounts.message > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {tabCounts.message}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {sortedNotifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                <h3 className="mb-2 text-xl font-semibold text-gray-600">
                  Không có thông báo nào
                </h3>
                <p className="mb-4 text-gray-500">
                  {activeTab === 'all' 
                    ? 'Chưa có thông báo nào'
                    : `Không có thông báo ${getTypeLabel(activeTab)}`
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedNotifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={cn(
                      "transition-all hover:shadow-md cursor-pointer",
                      !notification.isRead && "border-l-4 border-l-blue-500 bg-blue-50/30"
                    )}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedNotifications.includes(notification.id)}
                              onChange={() => handleSelectNotification(notification.id)}
                              className="rounded"
                            />
                            <div className="flex-shrink-0">
                              {getNotificationIcon(notification.type)}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <h3 className={cn(
                                  "font-semibold",
                                  !notification.isRead && "text-blue-900"
                                )}>
                                  {notification.title}
                                </h3>
                                {notification.isImportant && (
                                  <Zap className="h-4 w-4 text-red-500" />
                                )}
                                <Badge variant="outline" className="text-xs">
                                  {getTypeLabel(notification.category)}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-gray-500">
                                  {formatTime(notification.createdAt)}
                                </span>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => handleMarkAsRead([notification.id])}
                                    >
                                      {notification.isRead ? (
                                        <>
                                          <EyeOff className="mr-2 h-4 w-4" />
                                          Đánh dấu chưa đọc
                                        </>
                                      ) : (
                                        <>
                                          <Eye className="mr-2 h-4 w-4" />
                                          Đánh dấu đã đọc
                                        </>
                                      )}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleToggleFavorite(notification.id)}
                                    >
                                      {notification.isFavorite ? (
                                        <>
                                          <StarOff className="mr-2 h-4 w-4" />
                                          Bỏ yêu thích
                                        </>
                                      ) : (
                                        <>
                                          <Star className="mr-2 h-4 w-4" />
                                          Thêm yêu thích
                                        </>
                                      )}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={() => handleDelete([notification.id])}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Xóa
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>

                            <p className="text-gray-700 text-sm mb-3">
                              {notification.message}
                            </p>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                {notification.senderName && (
                                  <span className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {notification.senderName}
                                  </span>
                                )}
                                {notification.courseName && (
                                  <span className="flex items-center gap-1">
                                    <BookOpen className="h-3 w-3" />
                                    {notification.courseName}
                                  </span>
                                )}
                                {notification.isFavorite && (
                                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                )}
                              </div>

                              {notification.actionUrl && notification.actionText && (
                                <Button variant="outline" size="sm" asChild>
                                  <Link href={notification.actionUrl}>
                                    {notification.actionText}
                                    <ExternalLink className="ml-2 h-3 w-3" />
                                  </Link>
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}