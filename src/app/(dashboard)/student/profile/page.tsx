'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import {
  useGetUserProfileQuery,
  useGetStudentProfileQuery,
  useUpdateUserProfileMutation,
  useUpdateStudentProfileMutation,
  useUploadAvatarMutation,
} from '@/lib/redux/api/user-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
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
  User,
  Camera,
  Save,
  Edit,
  MapPin,
  Calendar,
  Globe,
  Phone,
  Mail,
  BookOpen,
  Award,
  Target,
  TrendingUp,
  Clock,
  Star,
  Settings,
  Shield,
  Eye,
  EyeOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function StudentProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<any>({});
  const [studentData, setStudentData] = useState<any>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    data: userProfile,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = useGetUserProfileQuery(user?.id || '', {
    skip: !user?.id,
  });

  const {
    data: studentProfile,
    isLoading: studentLoading,
    refetch: refetchStudent,
  } = useGetStudentProfileQuery(user?.id || '', {
    skip: !user?.id,
  });

  const [updateProfile, { isLoading: updatingProfile }] = useUpdateUserProfileMutation();
  const [updateStudentProfile, { isLoading: updatingStudent }] = useUpdateStudentProfileMutation();
  const [uploadAvatar, { isLoading: uploadingAvatar }] = useUploadAvatarMutation();

  React.useEffect(() => {
    if (userProfile) {
      setProfileData(userProfile);
    }
  }, [userProfile]);

  React.useEffect(() => {
    if (studentProfile) {
      setStudentData(studentProfile);
    }
  }, [studentProfile]);

  const handleSave = async () => {
    try {
      if (user?.id) {
        await updateProfile({
          userId: user.id,
          data: profileData,
        }).unwrap();

        await updateStudentProfile({
          userId: user.id,
          data: studentData,
        }).unwrap();

        toast.success('Cập nhật hồ sơ thành công!');
        setIsEditing(false);
        refetchProfile();
        refetchStudent();
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật hồ sơ');
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleAvatarUpload = async () => {
    if (!selectedFile) return;

    try {
      const result = await uploadAvatar({ file: selectedFile }).unwrap();
      toast.success('Cập nhật ảnh đại diện thành công!');
      setSelectedFile(null);
      refetchProfile();
    } catch (error) {
      toast.error('Có lỗi xảy ra khi tải ảnh lên');
    }
  };

  const getLearningStyleDisplay = (style: string) => {
    const styles = {
      visual: 'Thị giác',
      auditory: 'Thính giác', 
      kinesthetic: 'Vận động',
      reading_writing: 'Đọc/Viết',
    };
    return styles[style as keyof typeof styles] || style;
  };

  const getProfileCompleteness = () => {
    if (!userProfile || !studentProfile) return 0;
    
    const fields = [
      userProfile.firstName,
      userProfile.lastName,
      userProfile.bio,
      userProfile.avatar,
      studentProfile.dateOfBirth,
      studentProfile.phoneNumber,
      studentProfile.address,
      studentProfile.learningGoals,
    ];
    
    const completedFields = fields.filter(field => field && field.toString().trim()).length;
    return Math.round((completedFields / fields.length) * 100);
  };

  if (profileLoading || studentLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!userProfile || !studentProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-red-600">
            Không thể tải thông tin hồ sơ
          </h2>
          <p className="mb-4 text-gray-600">
            Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.
          </p>
          <Button onClick={() => { refetchProfile(); refetchStudent(); }}>
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  const completeness = getProfileCompleteness();

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Hồ sơ cá nhân</h1>
          <p className="text-muted-foreground">
            Quản lý thông tin cá nhân và tùy chọn học tập
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setProfileData(userProfile);
                  setStudentData(studentProfile);
                }}
              >
                Hủy
              </Button>
              <Button
                onClick={handleSave}
                disabled={updatingProfile || updatingStudent}
              >
                <Save className="mr-2 h-4 w-4" />
                {updatingProfile || updatingStudent ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </Button>
          )}
        </div>
      </motion.div>

      {/* Profile Completeness Alert */}
      {completeness < 80 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-yellow-800">
                    Hoàn thiện hồ sơ của bạn
                  </h3>
                  <p className="text-sm text-yellow-700">
                    Hồ sơ đã hoàn thành {completeness}%. Hãy cập nhật thêm thông tin để nhận được gợi ý học tập tốt hơn.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-yellow-800">{completeness}%</div>
                  <Progress value={completeness} className="mt-1 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1"
        >
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                {/* Avatar */}
                <div className="relative mx-auto mb-4 w-32 h-32">
                  <Avatar className="w-32 h-32">
                    <AvatarImage 
                      src={selectedFile ? URL.createObjectURL(selectedFile) : userProfile.avatar} 
                      alt={`${userProfile.firstName} ${userProfile.lastName}`}
                    />
                    <AvatarFallback className="text-2xl">
                      {userProfile.firstName?.charAt(0)}{userProfile.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  {isEditing && (
                    <div className="absolute -bottom-2 -right-2">
                      <label className="cursor-pointer">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700">
                          <Camera className="h-5 w-5" />
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>

                {selectedFile && (
                  <div className="mb-4 space-y-2">
                    <p className="text-sm text-gray-600">Ảnh mới đã chọn</p>
                    <Button
                      size="sm"
                      onClick={handleAvatarUpload}
                      disabled={uploadingAvatar}
                    >
                      {uploadingAvatar ? 'Đang tải...' : 'Cập nhật ảnh'}
                    </Button>
                  </div>
                )}

                <h2 className="text-xl font-bold">
                  {userProfile.firstName} {userProfile.lastName}
                </h2>
                <p className="text-gray-600">{userProfile.email}</p>
                
                {userProfile.bio && (
                  <p className="mt-2 text-sm text-gray-500">{userProfile.bio}</p>
                )}

                <div className="mt-4 flex justify-center gap-2">
                  <Badge variant="secondary">Học viên</Badge>
                  {studentProfile.isActive && (
                    <Badge className="bg-green-100 text-green-800">Đang hoạt động</Badge>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="mt-6 grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-blue-600">
                      {studentProfile.totalCoursesEnrolled || 0}
                    </div>
                    <div className="text-sm text-gray-600">Khóa học</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">
                      {studentProfile.totalCoursesCompleted || 0}
                    </div>
                    <div className="text-sm text-gray-600">Hoàn thành</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-purple-600">
                      {studentProfile.totalCertificatesEarned || 0}
                    </div>
                    <div className="text-sm text-gray-600">Chứng chỉ</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-orange-600">
                      {Math.round((studentProfile.totalHoursLearned || 0) / 60)}h
                    </div>
                    <div className="text-sm text-gray-600">Học tập</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
              <TabsTrigger value="learning">Học tập</TabsTrigger>
              <TabsTrigger value="privacy">Quyền riêng tư</TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin cá nhân</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="firstName">Họ và tên đệm</Label>
                      <Input
                        id="firstName"
                        value={profileData.firstName || ''}
                        onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Tên</Label>
                      <Input
                        id="lastName"
                        value={profileData.lastName || ''}
                        onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">Giới thiệu bản thân</Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio || ''}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Hãy chia sẻ một chút về bản thân bạn..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="dateOfBirth">Ngày sinh</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={studentData.dateOfBirth?.split('T')[0] || ''}
                        onChange={(e) => setStudentData({ ...studentData, dateOfBirth: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phoneNumber">Số điện thoại</Label>
                      <Input
                        id="phoneNumber"
                        value={studentData.phoneNumber || ''}
                        onChange={(e) => setStudentData({ ...studentData, phoneNumber: e.target.value })}
                        disabled={!isEditing}
                        placeholder="+84 123 456 789"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Địa chỉ</Label>
                    <Input
                      id="address"
                      value={studentData.address || ''}
                      onChange={(e) => setStudentData({ ...studentData, address: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Địa chỉ hiện tại của bạn"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="occupation">Nghề nghiệp</Label>
                      <Input
                        id="occupation"
                        value={studentData.occupation || ''}
                        onChange={(e) => setStudentData({ ...studentData, occupation: e.target.value })}
                        disabled={!isEditing}
                        placeholder="Công việc hiện tại"
                      />
                    </div>
                    <div>
                      <Label htmlFor="education">Trình độ học vấn</Label>
                      <Select
                        value={studentData.educationLevel || ''}
                        onValueChange={(value) => setStudentData({ ...studentData, educationLevel: value })}
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn trình độ" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high_school">Trung học phổ thông</SelectItem>
                          <SelectItem value="college">Cao đẳng</SelectItem>
                          <SelectItem value="bachelor">Cử nhân</SelectItem>
                          <SelectItem value="master">Thạc sĩ</SelectItem>
                          <SelectItem value="phd">Tiến sĩ</SelectItem>
                          <SelectItem value="other">Khác</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Learning Preferences Tab */}
            <TabsContent value="learning" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tùy chọn học tập</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="learningGoals">Mục tiêu học tập</Label>
                    <Textarea
                      id="learningGoals"
                      value={studentData.learningGoals || ''}
                      onChange={(e) => setStudentData({ ...studentData, learningGoals: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Mô tả mục tiêu học tập của bạn..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="learningStyle">Phong cách học tập</Label>
                      <Select
                        value={studentData.preferredLearningStyle || ''}
                        onValueChange={(value) => setStudentData({ ...studentData, preferredLearningStyle: value })}
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn phong cách" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="visual">Thị giác</SelectItem>
                          <SelectItem value="auditory">Thính giác</SelectItem>
                          <SelectItem value="kinesthetic">Vận động</SelectItem>
                          <SelectItem value="reading_writing">Đọc/Viết</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="studyTime">Thời gian học ưa thích</Label>
                      <Select
                        value={studentData.preferredStudyTime || ''}
                        onValueChange={(value) => setStudentData({ ...studentData, preferredStudyTime: value })}
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn thời gian" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">Buổi sáng</SelectItem>
                          <SelectItem value="afternoon">Buổi chiều</SelectItem>
                          <SelectItem value="evening">Buổi tối</SelectItem>
                          <SelectItem value="night">Buổi đêm</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="weeklyGoal">Mục tiêu hàng tuần (giờ)</Label>
                      <Input
                        id="weeklyGoal"
                        type="number"
                        value={studentData.weeklyLearningGoalHours || ''}
                        onChange={(e) => setStudentData({ ...studentData, weeklyLearningGoalHours: parseInt(e.target.value) })}
                        disabled={!isEditing}
                        placeholder="10"
                      />
                    </div>
                    <div>
                      <Label htmlFor="difficulty">Mức độ thử thách</Label>
                      <Select
                        value={studentData.preferredDifficulty || ''}
                        onValueChange={(value) => setStudentData({ ...studentData, preferredDifficulty: value })}
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn mức độ" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Cơ bản</SelectItem>
                          <SelectItem value="intermediate">Trung cấp</SelectItem>
                          <SelectItem value="advanced">Nâng cao</SelectItem>
                          <SelectItem value="expert">Chuyên gia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="interests">Lĩnh vực quan tâm</Label>
                    <Input
                      id="interests"
                      value={studentData.interests?.join(', ') || ''}
                      onChange={(e) => setStudentData({ 
                        ...studentData, 
                        interests: e.target.value.split(',').map(i => i.trim()).filter(i => i) 
                      })}
                      disabled={!isEditing}
                      placeholder="Lập trình, Thiết kế, Marketing..."
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Phân cách bằng dấu phẩy
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Learning Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Thống kê học tập</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {studentProfile.currentStreak || 0}
                      </div>
                      <div className="text-sm text-gray-600">Ngày liên tiếp</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {studentProfile.longestStreak || 0}
                      </div>
                      <div className="text-sm text-gray-600">Chuỗi dài nhất</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {studentProfile.averageSessionDuration || 0}min
                      </div>
                      <div className="text-sm text-gray-600">Thời gian/buổi</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {Math.round(studentProfile.completionRate || 0)}%
                      </div>
                      <div className="text-sm text-gray-600">Tỷ lệ hoàn thành</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Privacy Settings Tab */}
            <TabsContent value="privacy" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cài đặt quyền riêng tư</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Hiển thị hồ sơ công khai</h4>
                      <p className="text-sm text-gray-600">
                        Cho phép người khác xem hồ sơ cơ bản của bạn
                      </p>
                    </div>
                    <Button
                      variant={studentData.isPublicProfile ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStudentData({ 
                        ...studentData, 
                        isPublicProfile: !studentData.isPublicProfile 
                      })}
                      disabled={!isEditing}
                    >
                      {studentData.isPublicProfile ? (
                        <><Eye className="mr-2 h-4 w-4" /> Công khai</>
                      ) : (
                        <><EyeOff className="mr-2 h-4 w-4" /> Riêng tư</>
                      )}
                    </Button>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Hiển thị tiến độ học tập</h4>
                      <p className="text-sm text-gray-600">
                        Cho phép hiển thị tiến độ và thành tích học tập
                      </p>
                    </div>
                    <Button
                      variant={studentData.showProgress ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStudentData({ 
                        ...studentData, 
                        showProgress: !studentData.showProgress 
                      })}
                      disabled={!isEditing}
                    >
                      {studentData.showProgress ? 'Hiển thị' : 'Ẩn'}
                    </Button>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Nhận email thông báo</h4>
                      <p className="text-sm text-gray-600">
                        Nhận thông báo về khóa học và tiến độ học tập
                      </p>
                    </div>
                    <Button
                      variant={studentData.emailNotifications ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStudentData({ 
                        ...studentData, 
                        emailNotifications: !studentData.emailNotifications 
                      })}
                      disabled={!isEditing}
                    >
                      {studentData.emailNotifications ? 'Bật' : 'Tắt'}
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="font-medium text-red-600">Vùng nguy hiểm</h4>
                    <p className="text-sm text-gray-600">
                      Các hành động này sẽ ảnh hưởng vĩnh viễn đến tài khoản của bạn
                    </p>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Shield className="mr-2 h-4 w-4" />
                          Xóa tài khoản
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Bạn có chắc chắn?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Hành động này sẽ xóa vĩnh viễn tài khoản của bạn và tất cả dữ liệu liên quan. 
                            Bạn sẽ không thể khôi phục sau khi xóa.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                            Xóa tài khoản
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
    </div>
  );
}