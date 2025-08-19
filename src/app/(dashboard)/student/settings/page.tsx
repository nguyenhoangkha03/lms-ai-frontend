'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Settings,
  Bell,
  Shield,
  Eye,
  Globe,
  Palette,
  Volume2,
  Download,
  Trash2,
  Lock,
  Key,
  Monitor,
  Moon,
  Sun,
  Languages,
  Clock,
  Smartphone,
  Mail,
  MessageSquare,
  Calendar,
  BookOpen,
  Award,
  TrendingUp,
  Save,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface NotificationSettings {
  courseUpdates: boolean;
  newLessons: boolean;
  assessmentDue: boolean;
  grades: boolean;
  achievements: boolean;
  reminders: boolean;
  marketing: boolean;
  weeklyDigest: boolean;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends';
  showProgress: boolean;
  showAchievements: boolean;
  showActivity: boolean;
  allowMessages: boolean;
  showOnlineStatus: boolean;
}

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: string;
  autoPlay: boolean;
  soundEffects: boolean;
  animations: boolean;
}

interface LearningSettings {
  autoAdvance: boolean;
  skipIntros: boolean;
  captions: boolean;
  playbackSpeed: number;
  reminderFrequency: string;
  studySessionLength: number;
  breakReminders: boolean;
  offlineDownloads: boolean;
}

export default function StudentSettingsPage() {
  const { user } = useAuth();
  const [hasChanges, setHasChanges] = useState(false);
  
  const [notifications, setNotifications] = useState<NotificationSettings>({
    courseUpdates: true,
    newLessons: true,
    assessmentDue: true,
    grades: true,
    achievements: true,
    reminders: true,
    marketing: false,
    weeklyDigest: true,
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: 'public',
    showProgress: true,
    showAchievements: true,
    showActivity: true,
    allowMessages: true,
    showOnlineStatus: true,
  });

  const [appearance, setAppearance] = useState<AppearanceSettings>({
    theme: 'system',
    language: 'vi',
    timezone: 'Asia/Ho_Chi_Minh',
    dateFormat: 'DD/MM/YYYY',
    autoPlay: true,
    soundEffects: true,
    animations: true,
  });

  const [learning, setLearning] = useState<LearningSettings>({
    autoAdvance: false,
    skipIntros: false,
    captions: true,
    playbackSpeed: 1.0,
    reminderFrequency: 'daily',
    studySessionLength: 45,
    breakReminders: true,
    offlineDownloads: true,
  });

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSaveSettings = async () => {
    try {
      // TODO: Implement API calls to save settings
      toast.success('Cài đặt đã được lưu thành công!');
      setHasChanges(false);
    } catch (error) {
      toast.error('Có lỗi xảy ra khi lưu cài đặt');
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      // TODO: Implement password change API
      toast.success('Mật khẩu đã được thay đổi thành công!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi thay đổi mật khẩu');
    }
  };

  const updateNotifications = (key: keyof NotificationSettings, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const updatePrivacy = (key: keyof PrivacySettings, value: any) => {
    setPrivacy(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const updateAppearance = (key: keyof AppearanceSettings, value: any) => {
    setAppearance(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const updateLearning = (key: keyof LearningSettings, value: any) => {
    setLearning(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Cài đặt</h1>
          <p className="text-muted-foreground">
            Tùy chỉnh trải nghiệm học tập và quản lý tài khoản
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <Button onClick={handleSaveSettings}>
              <Save className="mr-2 h-4 w-4" />
              Lưu thay đổi
            </Button>
          )}
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Khôi phục mặc định
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="notifications">
              <Bell className="mr-2 h-4 w-4" />
              Thông báo
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <Shield className="mr-2 h-4 w-4" />
              Quyền riêng tư
            </TabsTrigger>
            <TabsTrigger value="appearance">
              <Palette className="mr-2 h-4 w-4" />
              Giao diện
            </TabsTrigger>
            <TabsTrigger value="learning">
              <BookOpen className="mr-2 h-4 w-4" />
              Học tập
            </TabsTrigger>
            <TabsTrigger value="security">
              <Lock className="mr-2 h-4 w-4" />
              Bảo mật
            </TabsTrigger>
          </TabsList>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Thông báo qua Email</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Cập nhật khóa học</h4>
                    <p className="text-sm text-gray-600">
                      Thông báo khi có bài học mới hoặc thay đổi trong khóa học
                    </p>
                  </div>
                  <Switch
                    checked={notifications.courseUpdates}
                    onCheckedChange={(checked) => updateNotifications('courseUpdates', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Bài học mới</h4>
                    <p className="text-sm text-gray-600">
                      Thông báo khi giảng viên thêm bài học mới
                    </p>
                  </div>
                  <Switch
                    checked={notifications.newLessons}
                    onCheckedChange={(checked) => updateNotifications('newLessons', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Hạn nộp bài tập</h4>
                    <p className="text-sm text-gray-600">
                      Nhắc nhở trước hạn nộp bài tập và kiểm tra
                    </p>
                  </div>
                  <Switch
                    checked={notifications.assessmentDue}
                    onCheckedChange={(checked) => updateNotifications('assessmentDue', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Điểm số</h4>
                    <p className="text-sm text-gray-600">
                      Thông báo khi có điểm mới hoặc phản hồi từ giảng viên
                    </p>
                  </div>
                  <Switch
                    checked={notifications.grades}
                    onCheckedChange={(checked) => updateNotifications('grades', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Thành tích</h4>
                    <p className="text-sm text-gray-600">
                      Thông báo khi đạt được huy hiệu hoặc hoàn thành khóa học
                    </p>
                  </div>
                  <Switch
                    checked={notifications.achievements}
                    onCheckedChange={(checked) => updateNotifications('achievements', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nhắc nhở học tập</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Nhắc nhở hàng ngày</h4>
                    <p className="text-sm text-gray-600">
                      Nhắc nhở học tập đều đặn theo lịch trình của bạn
                    </p>
                  </div>
                  <Switch
                    checked={notifications.reminders}
                    onCheckedChange={(checked) => updateNotifications('reminders', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Báo cáo tuần</h4>
                    <p className="text-sm text-gray-600">
                      Tóm tắt tiến độ học tập hàng tuần
                    </p>
                  </div>
                  <Switch
                    checked={notifications.weeklyDigest}
                    onCheckedChange={(checked) => updateNotifications('weeklyDigest', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email khuyến mãi</h4>
                    <p className="text-sm text-gray-600">
                      Thông tin về khóa học mới và ưu đãi đặc biệt
                    </p>
                  </div>
                  <Switch
                    checked={notifications.marketing}
                    onCheckedChange={(checked) => updateNotifications('marketing', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hiển thị hồ sơ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="profileVisibility">Quyền xem hồ sơ</Label>
                  <Select
                    value={privacy.profileVisibility}
                    onValueChange={(value: any) => updatePrivacy('profileVisibility', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Công khai</SelectItem>
                      <SelectItem value="friends">Chỉ bạn bè</SelectItem>
                      <SelectItem value="private">Riêng tư</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Hiển thị tiến độ học tập</h4>
                    <p className="text-sm text-gray-600">
                      Cho phép người khác xem tiến độ khóa học của bạn
                    </p>
                  </div>
                  <Switch
                    checked={privacy.showProgress}
                    onCheckedChange={(checked) => updatePrivacy('showProgress', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Hiển thị thành tích</h4>
                    <p className="text-sm text-gray-600">
                      Cho phép hiển thị huy hiệu và chứng chỉ
                    </p>
                  </div>
                  <Switch
                    checked={privacy.showAchievements}
                    onCheckedChange={(checked) => updatePrivacy('showAchievements', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Hiển thị hoạt động</h4>
                    <p className="text-sm text-gray-600">
                      Cho phép người khác xem hoạt động học tập gần đây
                    </p>
                  </div>
                  <Switch
                    checked={privacy.showActivity}
                    onCheckedChange={(checked) => updatePrivacy('showActivity', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tương tác xã hội</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Cho phép nhắn tin</h4>
                    <p className="text-sm text-gray-600">
                      Cho phép học viên khác gửi tin nhắn cho bạn
                    </p>
                  </div>
                  <Switch
                    checked={privacy.allowMessages}
                    onCheckedChange={(checked) => updatePrivacy('allowMessages', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Hiển thị trạng thái online</h4>
                    <p className="text-sm text-gray-600">
                      Cho phép người khác biết khi bạn đang online
                    </p>
                  </div>
                  <Switch
                    checked={privacy.showOnlineStatus}
                    onCheckedChange={(checked) => updatePrivacy('showOnlineStatus', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Giao diện và ngôn ngữ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="theme">Chủ đề</Label>
                  <Select
                    value={appearance.theme}
                    onValueChange={(value: any) => updateAppearance('theme', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center">
                          <Sun className="mr-2 h-4 w-4" />
                          Sáng
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center">
                          <Moon className="mr-2 h-4 w-4" />
                          Tối
                        </div>
                      </SelectItem>
                      <SelectItem value="system">
                        <div className="flex items-center">
                          <Monitor className="mr-2 h-4 w-4" />
                          Theo hệ thống
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="language">Ngôn ngữ</Label>
                  <Select
                    value={appearance.language}
                    onValueChange={(value) => updateAppearance('language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vi">Tiếng Việt</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                      <SelectItem value="ko">한국어</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="timezone">Múi giờ</Label>
                  <Select
                    value={appearance.timezone}
                    onValueChange={(value) => updateAppearance('timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Ho_Chi_Minh">GMT+7 (Việt Nam)</SelectItem>
                      <SelectItem value="Asia/Tokyo">GMT+9 (Nhật Bản)</SelectItem>
                      <SelectItem value="America/New_York">GMT-5 (New York)</SelectItem>
                      <SelectItem value="Europe/London">GMT+0 (London)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="dateFormat">Định dạng ngày</Label>
                  <Select
                    value={appearance.dateFormat}
                    onValueChange={(value) => updateAppearance('dateFormat', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hiệu ứng và âm thanh</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Hiệu ứng chuyển động</h4>
                    <p className="text-sm text-gray-600">
                      Hiển thị hiệu ứng animation khi chuyển trang
                    </p>
                  </div>
                  <Switch
                    checked={appearance.animations}
                    onCheckedChange={(checked) => updateAppearance('animations', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Âm thanh</h4>
                    <p className="text-sm text-gray-600">
                      Phát âm thanh thông báo và hiệu ứng
                    </p>
                  </div>
                  <Switch
                    checked={appearance.soundEffects}
                    onCheckedChange={(checked) => updateAppearance('soundEffects', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Tự động phát video</h4>
                    <p className="text-sm text-gray-600">
                      Tự động phát video khi vào bài học
                    </p>
                  </div>
                  <Switch
                    checked={appearance.autoPlay}
                    onCheckedChange={(checked) => updateAppearance('autoPlay', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Learning Tab */}
          <TabsContent value="learning" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Trải nghiệm học tập</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Tự động chuyển bài</h4>
                    <p className="text-sm text-gray-600">
                      Tự động chuyển sang bài học tiếp theo khi hoàn thành
                    </p>
                  </div>
                  <Switch
                    checked={learning.autoAdvance}
                    onCheckedChange={(checked) => updateLearning('autoAdvance', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Bỏ qua phần mở đầu</h4>
                    <p className="text-sm text-gray-600">
                      Tự động bỏ qua phần giới thiệu của video
                    </p>
                  </div>
                  <Switch
                    checked={learning.skipIntros}
                    onCheckedChange={(checked) => updateLearning('skipIntros', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Phụ đề</h4>
                    <p className="text-sm text-gray-600">
                      Hiển thị phụ đề mặc định cho video
                    </p>
                  </div>
                  <Switch
                    checked={learning.captions}
                    onCheckedChange={(checked) => updateLearning('captions', checked)}
                  />
                </div>

                <div>
                  <Label htmlFor="playbackSpeed">Tốc độ phát (x{learning.playbackSpeed})</Label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.25"
                    value={learning.playbackSpeed}
                    onChange={(e) => updateLearning('playbackSpeed', parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0.5x</span>
                    <span>1x</span>
                    <span>1.5x</span>
                    <span>2x</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nhắc nhở và phân bổ thời gian</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="reminderFrequency">Tần suất nhắc nhở</Label>
                  <Select
                    value={learning.reminderFrequency}
                    onValueChange={(value) => updateLearning('reminderFrequency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">Không bao giờ</SelectItem>
                      <SelectItem value="daily">Hàng ngày</SelectItem>
                      <SelectItem value="weekly">Hàng tuần</SelectItem>
                      <SelectItem value="custom">Tùy chỉnh</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="sessionLength">Thời gian học mỗi buổi (phút)</Label>
                  <Input
                    type="number"
                    value={learning.studySessionLength}
                    onChange={(e) => updateLearning('studySessionLength', parseInt(e.target.value))}
                    min="15"
                    max="180"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Nhắc nghỉ giải lao</h4>
                    <p className="text-sm text-gray-600">
                      Nhắc nhở nghỉ ngơi sau thời gian học dài
                    </p>
                  </div>
                  <Switch
                    checked={learning.breakReminders}
                    onCheckedChange={(checked) => updateLearning('breakReminders', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Tải về học offline</h4>
                    <p className="text-sm text-gray-600">
                      Cho phép tải video để học khi không có mạng
                    </p>
                  </div>
                  <Switch
                    checked={learning.offlineDownloads}
                    onCheckedChange={(checked) => updateLearning('offlineDownloads', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Thay đổi mật khẩu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                </div>

                <div>
                  <Label htmlFor="newPassword">Mật khẩu mới</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới"
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                  />
                </div>

                <Button 
                  onClick={handlePasswordChange}
                  disabled={!currentPassword || !newPassword || !confirmPassword}
                >
                  <Key className="mr-2 h-4 w-4" />
                  Đổi mật khẩu
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bảo mật tài khoản</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Xác thực hai bước</h4>
                  <p className="text-sm text-gray-600">
                    Thêm lớp bảo mật bằng cách yêu cầu mã xác thực từ điện thoại
                  </p>
                  <Button variant="outline">
                    <Smartphone className="mr-2 h-4 w-4" />
                    Thiết lập 2FA
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">Phiên đăng nhập</h4>
                  <p className="text-sm text-gray-600">
                    Quản lý các thiết bị đang đăng nhập vào tài khoản
                  </p>
                  <Button variant="outline">
                    <Monitor className="mr-2 h-4 w-4" />
                    Xem phiên đăng nhập
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">Sao lưu dữ liệu</h4>
                  <p className="text-sm text-gray-600">
                    Tải xuống bản sao dữ liệu tài khoản của bạn
                  </p>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Tải dữ liệu
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Vùng nguy hiểm</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Xóa tài khoản</h4>
                  <p className="text-sm text-gray-600">
                    Xóa vĩnh viễn tài khoản và tất cả dữ liệu liên quan. Hành động này không thể hoàn tác.
                  </p>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Xóa tài khoản
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Bạn có chắc chắn?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Hành động này sẽ xóa vĩnh viễn tài khoản của bạn và tất cả dữ liệu liên quan 
                          bao gồm khóa học, tiến độ, thành tích và tin nhắn. Bạn sẽ không thể khôi phục 
                          sau khi xóa.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                          Vẫn xóa tài khoản
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}