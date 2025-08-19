'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useGetUserEnrollmentsQuery } from '@/lib/redux/api/course-api';
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
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Award,
  Download,
  Search,
  Share2,
  Eye,
  Calendar,
  BookOpen,
  CheckCircle,
  Star,
  MoreVertical,
  ExternalLink,
  Trophy,
  Medal,
  Shield,
  Crown,
  Zap,
  Target,
  TrendingUp,
  Users,
  Clock,
  Globe,
  Print,
  Copy,
  Facebook,
  Twitter,
  Linkedin,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Certificate {
  id: string;
  courseId: string;
  courseName: string;
  instructorName: string;
  completionDate: string;
  certificateNumber: string;
  grade: string;
  hoursCompleted: number;
  skills: string[];
  isVerified: boolean;
  thumbnailUrl?: string;
  category: string;
  level: string;
  credentialId: string;
}

export default function StudentCertificatesPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [filterBy, setFilterBy] = useState('all');
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  const {
    data: enrollments,
    isLoading,
    error,
    refetch,
  } = useGetUserEnrollmentsQuery({
    status: 'completed',
    limit: 100,
  });

  // Filter only completed courses with certificates
  const certificates: Certificate[] = enrollments?.filter(enrollment => 
    enrollment.status === 'completed' && 
    enrollment.course.hasCertificate &&
    enrollment.progressPercentage >= 100
  ).map(enrollment => ({
    id: `cert-${enrollment.id}`,
    courseId: enrollment.course.id,
    courseName: enrollment.course.title,
    instructorName: enrollment.course.instructor.name,
    completionDate: enrollment.completedAt || enrollment.enrollmentDate,
    certificateNumber: `CERT-${enrollment.id.slice(-8).toUpperCase()}`,
    grade: enrollment.finalGrade || 'A',
    hoursCompleted: Math.round(enrollment.totalTimeSpent / 3600),
    skills: enrollment.course.tags || [],
    isVerified: true,
    thumbnailUrl: enrollment.course.thumbnailUrl,
    category: enrollment.course.category.name,
    level: enrollment.course.level,
    credentialId: `CRED-${enrollment.id.slice(-12).toUpperCase()}`,
  })) || [];

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = cert.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cert.instructorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cert.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterBy === 'all') return matchesSearch;
    if (filterBy === 'verified') return matchesSearch && cert.isVerified;
    if (filterBy === cert.category.toLowerCase()) return matchesSearch;
    
    return matchesSearch;
  });

  const sortedCertificates = filteredCertificates.sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.completionDate).getTime() - new Date(a.completionDate).getTime();
      case 'oldest':
        return new Date(a.completionDate).getTime() - new Date(b.completionDate).getTime();
      case 'name':
        return a.courseName.localeCompare(b.courseName);
      case 'category':
        return a.category.localeCompare(b.category);
      default:
        return 0;
    }
  });

  const getCertificateIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'technology':
      case 'programming':
        return <Zap className="h-6 w-6 text-blue-500" />;
      case 'business':
        return <TrendingUp className="h-6 w-6 text-green-500" />;
      case 'design':
        return <Star className="h-6 w-6 text-purple-500" />;
      case 'marketing':
        return <Target className="h-6 w-6 text-orange-500" />;
      default:
        return <Award className="h-6 w-6 text-yellow-500" />;
    }
  };

  const getLevelBadge = (level: string) => {
    const configs = {
      beginner: { color: 'bg-green-100 text-green-800', icon: Shield },
      intermediate: { color: 'bg-blue-100 text-blue-800', icon: Medal },
      advanced: { color: 'bg-purple-100 text-purple-800', icon: Trophy },
      expert: { color: 'bg-yellow-100 text-yellow-800', icon: Crown },
    };
    
    const config = configs[level as keyof typeof configs] || configs.beginner;
    const Icon = config.icon;
    
    return (
      <Badge className={config.color}>
        <Icon className="mr-1 h-3 w-3" />
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </Badge>
    );
  };

  const handleDownload = (certificate: Certificate) => {
    // TODO: Implement certificate download
    toast.success('Đang tải xuống chứng chỉ...');
  };

  const handleShare = (certificate: Certificate, platform: string) => {
    const url = `${window.location.origin}/certificates/verify/${certificate.credentialId}`;
    const text = `Tôi vừa hoàn thành khóa học "${certificate.courseName}" và nhận được chứng chỉ!`;
    
    switch (platform) {
      case 'copy':
        navigator.clipboard.writeText(url);
        toast.success('Đã sao chép liên kết');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
        break;
    }
  };

  const getStats = () => {
    return {
      total: certificates.length,
      verified: certificates.filter(c => c.isVerified).length,
      totalHours: certificates.reduce((sum, c) => sum + c.hoursCompleted, 0),
      categories: [...new Set(certificates.map(c => c.category))].length,
    };
  };

  const stats = getStats();

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-red-600">
            Không thể tải danh sách chứng chỉ
          </h2>
          <p className="mb-4 text-gray-600">
            Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.
          </p>
          <Button onClick={() => refetch()}>Thử lại</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Chứng chỉ của tôi</h1>
          <p className="text-muted-foreground">
            Quản lý và chia sẻ các chứng chỉ đã đạt được
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/student/my-courses">
              <BookOpen className="mr-2 h-4 w-4" />
              Tiếp tục học
            </Link>
          </Button>
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
                <p className="text-sm font-medium text-muted-foreground">Tổng chứng chỉ</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Award className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Đã xác thực</p>
                <p className="text-2xl font-bold">{stats.verified}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tổng giờ học</p>
                <p className="text-2xl font-bold">{stats.totalHours}h</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Lĩnh vực</p>
                <p className="text-2xl font-bold">{stats.categories}</p>
              </div>
              <Globe className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters and Search */}
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
                    placeholder="Tìm kiếm chứng chỉ, khóa học..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="verified">Đã xác thực</SelectItem>
                    <SelectItem value="technology">Công nghệ</SelectItem>
                    <SelectItem value="business">Kinh doanh</SelectItem>
                    <SelectItem value="design">Thiết kế</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Mới nhất</SelectItem>
                    <SelectItem value="oldest">Cũ nhất</SelectItem>
                    <SelectItem value="name">Tên A-Z</SelectItem>
                    <SelectItem value="category">Theo danh mục</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Certificates Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-0">
                  <Skeleton className="h-48 w-full rounded-t-lg" />
                  <div className="space-y-3 p-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : sortedCertificates.length === 0 ? (
          <div className="py-12 text-center">
            <Award className="mx-auto mb-4 h-16 w-16 text-gray-400" />
            <h3 className="mb-2 text-xl font-semibold text-gray-600">
              Chưa có chứng chỉ nào
            </h3>
            <p className="mb-4 text-gray-500">
              Hoàn thành các khóa học để nhận chứng chỉ
            </p>
            <Button asChild>
              <Link href="/student/my-courses">
                <BookOpen className="mr-2 h-4 w-4" />
                Tiếp tục học
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sortedCertificates.map((certificate, index) => (
              <motion.div
                key={certificate.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                  <CardContent className="p-0">
                    {/* Certificate Preview */}
                    <div className="relative h-48 bg-gradient-to-br from-blue-600 to-purple-600">
                      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm">
                        <div className="flex h-full flex-col items-center justify-center p-6 text-center text-white">
                          {getCertificateIcon(certificate.category)}
                          <h3 className="mt-3 text-lg font-bold line-clamp-2">
                            {certificate.courseName}
                          </h3>
                          <p className="text-sm opacity-90">
                            Chứng chỉ hoàn thành
                          </p>
                        </div>
                      </div>
                      
                      <div className="absolute top-3 right-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/20 text-white hover:bg-white/30">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedCertificate(certificate)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownload(certificate)}>
                              <Download className="mr-2 h-4 w-4" />
                              Tải xuống PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleShare(certificate, 'copy')}>
                              <Copy className="mr-2 h-4 w-4" />
                              Sao chép liên kết
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleShare(certificate, 'linkedin')}>
                              <Linkedin className="mr-2 h-4 w-4" />
                              Chia sẻ LinkedIn
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="absolute top-3 left-3">
                        {certificate.isVerified && (
                          <Badge className="bg-green-500 text-white">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Đã xác thực
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Certificate Info */}
                    <div className="p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm text-gray-600">{certificate.category}</span>
                        {getLevelBadge(certificate.level)}
                      </div>

                      <h4 className="font-semibold leading-tight line-clamp-2 mb-2">
                        {certificate.courseName}
                      </h4>

                      <p className="text-sm text-gray-600 mb-3">
                        Giảng viên: {certificate.instructorName}
                      </p>

                      {/* Stats */}
                      <div className="mb-4 flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(certificate.completionDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{certificate.hoursCompleted}h</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{certificate.grade}</span>
                        </div>
                      </div>

                      {/* Skills */}
                      {certificate.skills.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1">
                            {certificate.skills.slice(0, 3).map((skill, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {certificate.skills.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{certificate.skills.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => setSelectedCertificate(certificate)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Xem
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownload(certificate)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleShare(certificate, 'copy')}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Certificate Number */}
                      <div className="mt-3 text-xs text-gray-500">
                        Mã chứng chỉ: {certificate.certificateNumber}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Certificate Detail Modal */}
      <Dialog open={!!selectedCertificate} onOpenChange={() => setSelectedCertificate(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Chi tiết chứng chỉ</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về chứng chỉ hoàn thành khóa học
            </DialogDescription>
          </DialogHeader>
          
          {selectedCertificate && (
            <div className="space-y-6">
              {/* Certificate Preview */}
              <div className="relative h-64 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-lg">
                  <div className="flex h-full flex-col items-center justify-center p-8 text-center text-white">
                    {getCertificateIcon(selectedCertificate.category)}
                    <h2 className="mt-4 text-2xl font-bold">
                      Chứng chỉ hoàn thành
                    </h2>
                    <h3 className="mt-2 text-xl font-semibold">
                      {selectedCertificate.courseName}
                    </h3>
                    <p className="mt-2 text-lg">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-sm opacity-90">
                      Hoàn thành ngày {new Date(selectedCertificate.completionDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Certificate Details */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Tên khóa học</Label>
                    <p className="mt-1">{selectedCertificate.courseName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Giảng viên</Label>
                    <p className="mt-1">{selectedCertificate.instructorName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Danh mục</Label>
                    <p className="mt-1">{selectedCertificate.category}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Cấp độ</Label>
                    <div className="mt-1">{getLevelBadge(selectedCertificate.level)}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Ngày hoàn thành</Label>
                    <p className="mt-1">
                      {new Date(selectedCertificate.completionDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Điểm số</Label>
                    <p className="mt-1">{selectedCertificate.grade}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Thời gian học</Label>
                    <p className="mt-1">{selectedCertificate.hoursCompleted} giờ</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Mã chứng chỉ</Label>
                    <p className="mt-1 font-mono text-sm">{selectedCertificate.certificateNumber}</p>
                  </div>
                </div>
              </div>

              {/* Skills */}
              {selectedCertificate.skills.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Kỹ năng đạt được</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedCertificate.skills.map((skill, idx) => (
                      <Badge key={idx} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => handleDownload(selectedCertificate)}>
                  <Download className="mr-2 h-4 w-4" />
                  Tải xuống PDF
                </Button>
                <Button variant="outline">
                  <Print className="mr-2 h-4 w-4" />
                  In chứng chỉ
                </Button>
                <Button variant="outline" onClick={() => handleShare(selectedCertificate, 'linkedin')}>
                  <Linkedin className="mr-2 h-4 w-4" />
                  Chia sẻ LinkedIn
                </Button>
                <Button variant="outline" onClick={() => handleShare(selectedCertificate, 'copy')}>
                  <Copy className="mr-2 h-4 w-4" />
                  Sao chép liên kết
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/certificates/verify/${selectedCertificate.credentialId}`} target="_blank">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Xác thực công khai
                  </Link>
                </Button>
              </div>

              {/* Verification Info */}
              <div className="rounded-lg bg-gray-50 p-4">
                <h4 className="font-medium">Thông tin xác thực</h4>
                <p className="mt-1 text-sm text-gray-600">
                  Chứng chỉ này có thể được xác thực bằng mã số: 
                  <span className="font-mono ml-1">{selectedCertificate.credentialId}</span>
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Truy cập trang xác thực công khai để kiểm tra tính hợp lệ của chứng chỉ.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}