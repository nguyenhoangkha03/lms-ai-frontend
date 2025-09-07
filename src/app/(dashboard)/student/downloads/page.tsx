import { UnderDevelopment } from '@/components/ui/under-development';

export default function StudentCertificatesPage() {
  return (
    <UnderDevelopment
      title="Digital Certificates & Credentials"
      description="Showcase your achievements with blockchain-verified digital certificates, professional credentials, and shareable badges that validate your learning accomplishments."
      expectedCompletion="Q2 2025"
      features={[
        'Blockchain-verified digital certificates with secure validation',
        'Professional credential management and portfolio showcase',
        'Social media integration and LinkedIn badge sharing',
        'Certificate authenticity verification for employers',
        'Customizable certificate templates and branding options',
        'Achievement analytics and credential pathway tracking',
      ]}
    />
  );
}

// 'use client';

// import React, { useState } from 'react';
// import { motion } from 'framer-motion';
// import Link from 'next/link';
// import { useAuth } from '@/hooks/use-auth';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Input } from '@/components/ui/input';
// import { Progress } from '@/components/ui/progress';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue
// } from '@/components/ui/select';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Skeleton } from '@/components/ui/skeleton';
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from '@/components/ui/alert-dialog';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
// import {
//   Download,
//   Search,
//   Filter,
//   Trash2,
//   MoreVertical,
//   FolderOpen,
//   File,
//   FileText,
//   FileImage,
//   FileVideo,
//   FileAudio,
//   Archive,
//   Calendar,
//   Clock,
//   HardDrive,
//   Eye,
//   ExternalLink,
//   BookOpen,
//   User,
//   CheckCircle,
//   AlertCircle,
//   PlayCircle,
//   Pause,
//   Square,
//   RefreshCw,
//   Share2,
//   Star,
//   StarOff,
//   Folder,
//   Grid3X3,
//   List,
//   SortAsc,
//   SortDesc,
//   Upload,
//   CloudDownload,
//   Wifi,
//   WifiOff,
// } from 'lucide-react';
// import { cn } from '@/lib/utils';
// import { toast } from 'sonner';

// interface DownloadedFile {
//   id: string;
//   name: string;
//   type: 'pdf' | 'video' | 'audio' | 'image' | 'document' | 'archive' | 'other';
//   size: number;
//   downloadedAt: string;
//   lastAccessedAt?: string;
//   downloadUrl: string;
//   localPath?: string;
//   status: 'completed' | 'downloading' | 'paused' | 'failed' | 'queued';
//   progress?: number;
//   courseId?: string;
//   courseName?: string;
//   lessonId?: string;
//   lessonTitle?: string;
//   instructorName?: string;
//   isFavorite: boolean;
//   downloadCount: number;
//   isOfflineAvailable: boolean;
//   expiresAt?: string;
//   tags?: string[];
// }

// interface DownloadStats {
//   totalFiles: number;
//   totalSize: number;
//   recentDownloads: number;
//   favoriteFiles: number;
//   offlineFiles: number;
//   storageUsed: number;
//   storageLimit: number;
// }

// export default function StudentDownloadsPage() {
//   const { user } = useAuth();
//   const [activeTab, setActiveTab] = useState('all');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [filterType, setFilterType] = useState('all');
//   const [sortBy, setSortBy] = useState('newest');
//   const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
//   const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

//   // Mock data
//   const mockStats: DownloadStats = {
//     totalFiles: 47,
//     totalSize: 2.3 * 1024 * 1024 * 1024, // 2.3GB
//     recentDownloads: 8,
//     favoriteFiles: 12,
//     offlineFiles: 15,
//     storageUsed: 1.8 * 1024 * 1024 * 1024, // 1.8GB
//     storageLimit: 5 * 1024 * 1024 * 1024, // 5GB
//   };

//   const mockDownloads: DownloadedFile[] = [
//     {
//       id: '1',
//       name: 'JavaScript ES6 Complete Guide.pdf',
//       type: 'pdf',
//       size: 15 * 1024 * 1024, // 15MB
//       downloadedAt: '2024-01-15T10:30:00Z',
//       lastAccessedAt: '2024-01-15T11:00:00Z',
//       downloadUrl: '/downloads/js-es6-guide.pdf',
//       status: 'completed',
//       courseId: 'course-1',
//       courseName: 'Lập trình JavaScript từ cơ bản đến nâng cao',
//       lessonId: 'lesson-1',
//       lessonTitle: 'ES6 Features Overview',
//       instructorName: 'GV. Nguyễn Văn A',
//       isFavorite: true,
//       downloadCount: 3,
//       isOfflineAvailable: true,
//       tags: ['javascript', 'es6', 'guide'],
//     },
//     {
//       id: '2',
//       name: 'React Hooks Tutorial.mp4',
//       type: 'video',
//       size: 250 * 1024 * 1024, // 250MB
//       downloadedAt: '2024-01-14T16:45:00Z',
//       lastAccessedAt: '2024-01-15T09:20:00Z',
//       downloadUrl: '/downloads/react-hooks-tutorial.mp4',
//       status: 'completed',
//       courseId: 'course-2',
//       courseName: 'React.js Complete Course',
//       lessonId: 'lesson-2',
//       lessonTitle: 'Introduction to React Hooks',
//       instructorName: 'GV. Trần Thị B',
//       isFavorite: false,
//       downloadCount: 1,
//       isOfflineAvailable: true,
//       tags: ['react', 'hooks', 'tutorial'],
//     },
//     {
//       id: '3',
//       name: 'CSS Grid Layout Examples.zip',
//       type: 'archive',
//       size: 8 * 1024 * 1024, // 8MB
//       downloadedAt: '2024-01-13T14:20:00Z',
//       downloadUrl: '/downloads/css-grid-examples.zip',
//       status: 'completed',
//       courseId: 'course-3',
//       courseName: 'Frontend Development với HTML/CSS',
//       lessonId: 'lesson-3',
//       lessonTitle: 'CSS Grid Practical Examples',
//       instructorName: 'GV. Lê Văn C',
//       isFavorite: true,
//       downloadCount: 2,
//       isOfflineAvailable: false,
//       tags: ['css', 'grid', 'examples'],
//     },
//     {
//       id: '4',
//       name: 'Database Design Lecture.mp3',
//       type: 'audio',
//       size: 45 * 1024 * 1024, // 45MB
//       downloadedAt: '2024-01-12T11:15:00Z',
//       downloadUrl: '/downloads/database-design.mp3',
//       status: 'downloading',
//       progress: 65,
//       courseId: 'course-4',
//       courseName: 'Database Management Systems',
//       lessonId: 'lesson-4',
//       lessonTitle: 'Database Design Principles',
//       instructorName: 'GV. Phạm Thị D',
//       isFavorite: false,
//       downloadCount: 0,
//       isOfflineAvailable: false,
//       tags: ['database', 'design', 'lecture'],
//     },
//     {
//       id: '5',
//       name: 'Algorithm Visualization.png',
//       type: 'image',
//       size: 2 * 1024 * 1024, // 2MB
//       downloadedAt: '2024-01-11T08:30:00Z',
//       downloadUrl: '/downloads/algorithm-viz.png',
//       status: 'failed',
//       courseId: 'course-5',
//       courseName: 'Data Structures and Algorithms',
//       lessonId: 'lesson-5',
//       lessonTitle: 'Algorithm Complexity Analysis',
//       instructorName: 'GV. Hoàng Văn E',
//       isFavorite: false,
//       downloadCount: 0,
//       isOfflineAvailable: false,
//       tags: ['algorithm', 'visualization'],
//     },
//   ];

//   const downloads = mockDownloads;
//   const stats = mockStats;

//   const handleDownload = (fileId: string) => {
//     const file = downloads.find(f => f.id === fileId);
//     if (file) {
//       // Create a temporary anchor element to trigger download
//       const link = document.createElement('a');
//       link.href = file.downloadUrl;
//       link.download = file.name;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);

//       toast.success(`Đang tải xuống ${file.name}`);
//     }
//   };

//   const handleBulkDownload = () => {
//     if (selectedFiles.length === 0) {
//       toast.error('Vui lòng chọn ít nhất một file');
//       return;
//     }

//     selectedFiles.forEach(fileId => {
//       handleDownload(fileId);
//     });

//     setSelectedFiles([]);
//     toast.success(`Đang tải xuống ${selectedFiles.length} file`);
//   };

//   const handleDelete = (fileIds: string[]) => {
//     toast.success(`Đã xóa ${fileIds.length} file khỏi danh sách tải xuống`);
//   };

//   const handleToggleFavorite = (fileId: string) => {
//     const file = downloads.find(f => f.id === fileId);
//     if (file) {
//       toast.success(file.isFavorite ? 'Đã bỏ yêu thích' : 'Đã thêm vào yêu thích');
//     }
//   };

//   const handleRetryDownload = (fileId: string) => {
//     toast.success('Đang thử lại tải xuống...');
//   };

//   const handlePauseDownload = (fileId: string) => {
//     toast.success('Đã tạm dừng tải xuống');
//   };

//   const handleResumeDownload = (fileId: string) => {
//     toast.success('Đã tiếp tục tải xuống');
//   };

//   const handleSelectAll = () => {
//     if (selectedFiles.length === filteredDownloads.length) {
//       setSelectedFiles([]);
//     } else {
//       setSelectedFiles(filteredDownloads.map(f => f.id));
//     }
//   };

//   const handleSelectFile = (fileId: string) => {
//     setSelectedFiles(prev => {
//       if (prev.includes(fileId)) {
//         return prev.filter(id => id !== fileId);
//       } else {
//         return [...prev, fileId];
//       }
//     });
//   };

//   const filteredDownloads = downloads.filter(file => {
//     const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                          file.courseName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                          file.lessonTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                          file.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

//     const matchesTab =
//       activeTab === 'all' ||
//       (activeTab === 'completed' && file.status === 'completed') ||
//       (activeTab === 'downloading' && ['downloading', 'paused', 'queued'].includes(file.status)) ||
//       (activeTab === 'failed' && file.status === 'failed') ||
//       (activeTab === 'favorites' && file.isFavorite) ||
//       (activeTab === 'offline' && file.isOfflineAvailable) ||
//       file.type === activeTab;

//     const matchesFilter =
//       filterType === 'all' ||
//       file.type === filterType;

//     return matchesSearch && matchesTab && matchesFilter;
//   });

//   const sortedDownloads = filteredDownloads.sort((a, b) => {
//     switch (sortBy) {
//       case 'newest':
//         return new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime();
//       case 'oldest':
//         return new Date(a.downloadedAt).getTime() - new Date(b.downloadedAt).getTime();
//       case 'name':
//         return a.name.localeCompare(b.name);
//       case 'size':
//         return b.size - a.size;
//       case 'course':
//         return (a.courseName || '').localeCompare(b.courseName || '');
//       default:
//         return 0;
//     }
//   });

//   const getFileIcon = (type: string, size: 'sm' | 'md' | 'lg' = 'md') => {
//     const sizeClass = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-8 w-8' : 'h-5 w-5';

//     switch (type) {
//       case 'pdf':
//       case 'document':
//         return <FileText className={cn(sizeClass, 'text-red-500')} />;
//       case 'video':
//         return <FileVideo className={cn(sizeClass, 'text-purple-500')} />;
//       case 'audio':
//         return <FileAudio className={cn(sizeClass, 'text-green-500')} />;
//       case 'image':
//         return <FileImage className={cn(sizeClass, 'text-blue-500')} />;
//       case 'archive':
//         return <Archive className={cn(sizeClass, 'text-orange-500')} />;
//       default:
//         return <File className={cn(sizeClass, 'text-gray-500')} />;
//     }
//   };

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case 'completed':
//         return <CheckCircle className="h-4 w-4 text-green-500" />;
//       case 'downloading':
//         return <CloudDownload className="h-4 w-4 text-blue-500" />;
//       case 'paused':
//         return <Pause className="h-4 w-4 text-yellow-500" />;
//       case 'failed':
//         return <AlertCircle className="h-4 w-4 text-red-500" />;
//       case 'queued':
//         return <Clock className="h-4 w-4 text-gray-500" />;
//       default:
//         return null;
//     }
//   };

//   const formatFileSize = (bytes: number) => {
//     if (bytes === 0) return '0 Bytes';
//     const k = 1024;
//     const sizes = ['Bytes', 'KB', 'MB', 'GB'];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
//   };

//   const formatTime = (timestamp: string) => {
//     const date = new Date(timestamp);
//     const now = new Date();
//     const diff = now.getTime() - date.getTime();
//     const days = Math.floor(diff / (1000 * 60 * 60 * 24));

//     if (days === 0) {
//       const hours = Math.floor(diff / (1000 * 60 * 60));
//       if (hours === 0) {
//         const minutes = Math.floor(diff / (1000 * 60));
//         return `${minutes} phút trước`;
//       }
//       return `${hours} giờ trước`;
//     } else if (days === 1) {
//       return 'Hôm qua';
//     } else if (days < 7) {
//       return `${days} ngày trước`;
//     } else {
//       return date.toLocaleDateString('vi-VN');
//     }
//   };

//   const getTabCounts = () => {
//     return {
//       all: downloads.length,
//       completed: downloads.filter(f => f.status === 'completed').length,
//       downloading: downloads.filter(f => ['downloading', 'paused', 'queued'].includes(f.status)).length,
//       failed: downloads.filter(f => f.status === 'failed').length,
//       favorites: downloads.filter(f => f.isFavorite).length,
//       offline: downloads.filter(f => f.isOfflineAvailable).length,
//       pdf: downloads.filter(f => f.type === 'pdf').length,
//       video: downloads.filter(f => f.type === 'video').length,
//       audio: downloads.filter(f => f.type === 'audio').length,
//     };
//   };

//   const tabCounts = getTabCounts();
//   const storagePercentage = (stats.storageUsed / stats.storageLimit) * 100;

//   return (
//     <div className="container mx-auto space-y-6 p-6">
//       {/* Header */}
//       <motion.div
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
//       >
//         <div>
//           <h1 className="text-3xl font-bold">Tải xuống</h1>
//           <p className="text-muted-foreground">
//             Quản lý các tài liệu và file đã tải xuống
//           </p>
//         </div>
//         <div className="flex items-center gap-3">
//           <div className="flex items-center gap-2">
//             <Button
//               variant={viewMode === 'grid' ? 'default' : 'outline'}
//               size="sm"
//               onClick={() => setViewMode('grid')}
//             >
//               <Grid3X3 className="h-4 w-4" />
//             </Button>
//             <Button
//               variant={viewMode === 'list' ? 'default' : 'outline'}
//               size="sm"
//               onClick={() => setViewMode('list')}
//             >
//               <List className="h-4 w-4" />
//             </Button>
//           </div>
//           {selectedFiles.length > 0 && (
//             <Button onClick={handleBulkDownload}>
//               <Download className="mr-2 h-4 w-4" />
//               Tải lại ({selectedFiles.length})
//             </Button>
//           )}
//         </div>
//       </motion.div>

//       {/* Stats Cards */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.1 }}
//         className="grid grid-cols-1 gap-4 md:grid-cols-4"
//       >
//         <Card>
//           <CardContent className="p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-muted-foreground">Tổng file</p>
//                 <p className="text-2xl font-bold">{stats.totalFiles}</p>
//               </div>
//               <Download className="h-8 w-8 text-blue-500" />
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardContent className="p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-muted-foreground">Dung lượng</p>
//                 <p className="text-2xl font-bold">{formatFileSize(stats.totalSize)}</p>
//               </div>
//               <HardDrive className="h-8 w-8 text-green-500" />
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardContent className="p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-muted-foreground">Offline</p>
//                 <p className="text-2xl font-bold">{stats.offlineFiles}</p>
//               </div>
//               <WifiOff className="h-8 w-8 text-orange-500" />
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardContent className="p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-muted-foreground">Yêu thích</p>
//                 <p className="text-2xl font-bold">{stats.favoriteFiles}</p>
//               </div>
//               <Star className="h-8 w-8 text-yellow-500" />
//             </div>
//           </CardContent>
//         </Card>
//       </motion.div>

//       {/* Storage Usage */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.15 }}
//       >
//         <Card>
//           <CardContent className="p-6">
//             <div className="space-y-3">
//               <div className="flex items-center justify-between">
//                 <h3 className="font-semibold">Dung lượng lưu trữ</h3>
//                 <span className="text-sm text-gray-600">
//                   {formatFileSize(stats.storageUsed)} / {formatFileSize(stats.storageLimit)}
//                 </span>
//               </div>
//               <Progress value={storagePercentage} className="h-2" />
//               <div className="flex justify-between text-xs text-gray-500">
//                 <span>{Math.round(storagePercentage)}% đã sử dụng</span>
//                 <span>{formatFileSize(stats.storageLimit - stats.storageUsed)} còn lại</span>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </motion.div>

//       {/* Filters */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.2 }}
//       >
//         <Card>
//           <CardContent className="p-6">
//             <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
//               <div className="flex flex-1 items-center gap-4">
//                 <div className="relative flex-1 max-w-md">
//                   <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
//                   <Input
//                     placeholder="Tìm kiếm file, khóa học..."
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     className="pl-10"
//                   />
//                 </div>

//                 {selectedFiles.length > 0 && (
//                   <div className="flex items-center gap-2">
//                     <span className="text-sm text-gray-600">
//                       Đã chọn {selectedFiles.length}
//                     </span>
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={handleBulkDownload}
//                     >
//                       <Download className="h-4 w-4" />
//                     </Button>
//                     <AlertDialog>
//                       <AlertDialogTrigger asChild>
//                         <Button variant="outline" size="sm">
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       </AlertDialogTrigger>
//                       <AlertDialogContent>
//                         <AlertDialogHeader>
//                           <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
//                           <AlertDialogDescription>
//                             Bạn có chắc chắn muốn xóa {selectedFiles.length} file đã chọn?
//                           </AlertDialogDescription>
//                         </AlertDialogHeader>
//                         <AlertDialogFooter>
//                           <AlertDialogCancel>Hủy</AlertDialogCancel>
//                           <AlertDialogAction
//                             onClick={() => {
//                               handleDelete(selectedFiles);
//                               setSelectedFiles([]);
//                             }}
//                           >
//                             Xóa
//                           </AlertDialogAction>
//                         </AlertDialogFooter>
//                       </AlertDialogContent>
//                     </AlertDialog>
//                   </div>
//                 )}
//               </div>

//               <div className="flex items-center gap-3">
//                 <Select value={filterType} onValueChange={setFilterType}>
//                   <SelectTrigger className="w-40">
//                     <SelectValue placeholder="Lọc loại" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="all">Tất cả loại</SelectItem>
//                     <SelectItem value="pdf">PDF</SelectItem>
//                     <SelectItem value="video">Video</SelectItem>
//                     <SelectItem value="audio">Audio</SelectItem>
//                     <SelectItem value="image">Hình ảnh</SelectItem>
//                     <SelectItem value="archive">File nén</SelectItem>
//                   </SelectContent>
//                 </Select>

//                 <Select value={sortBy} onValueChange={setSortBy}>
//                   <SelectTrigger className="w-40">
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="newest">Mới nhất</SelectItem>
//                     <SelectItem value="oldest">Cũ nhất</SelectItem>
//                     <SelectItem value="name">Tên A-Z</SelectItem>
//                     <SelectItem value="size">Dung lượng</SelectItem>
//                     <SelectItem value="course">Khóa học</SelectItem>
//                   </SelectContent>
//                 </Select>

//                 <Button
//                   variant="outline"
//                   onClick={handleSelectAll}
//                 >
//                   {selectedFiles.length === filteredDownloads.length && filteredDownloads.length > 0
//                     ? 'Bỏ chọn tất cả'
//                     : 'Chọn tất cả'
//                   }
//                 </Button>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </motion.div>

//       {/* Tabs */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.3 }}
//       >
//         <Tabs value={activeTab} onValueChange={setActiveTab}>
//           <TabsList className="grid w-full grid-cols-6">
//             <TabsTrigger value="all" className="flex items-center gap-1">
//               Tất cả
//               {tabCounts.all > 0 && (
//                 <Badge variant="secondary" className="text-xs">
//                   {tabCounts.all}
//                 </Badge>
//               )}
//             </TabsTrigger>
//             <TabsTrigger value="completed" className="flex items-center gap-1">
//               Hoàn thành
//               {tabCounts.completed > 0 && (
//                 <Badge variant="secondary" className="text-xs">
//                   {tabCounts.completed}
//                 </Badge>
//               )}
//             </TabsTrigger>
//             <TabsTrigger value="downloading" className="flex items-center gap-1">
//               Đang tải
//               {tabCounts.downloading > 0 && (
//                 <Badge variant="secondary" className="text-xs">
//                   {tabCounts.downloading}
//                 </Badge>
//               )}
//             </TabsTrigger>
//             <TabsTrigger value="failed" className="flex items-center gap-1">
//               Thất bại
//               {tabCounts.failed > 0 && (
//                 <Badge variant="secondary" className="text-xs">
//                   {tabCounts.failed}
//                 </Badge>
//               )}
//             </TabsTrigger>
//             <TabsTrigger value="favorites" className="flex items-center gap-1">
//               Yêu thích
//               {tabCounts.favorites > 0 && (
//                 <Badge variant="secondary" className="text-xs">
//                   {tabCounts.favorites}
//                 </Badge>
//               )}
//             </TabsTrigger>
//             <TabsTrigger value="offline" className="flex items-center gap-1">
//               Offline
//               {tabCounts.offline > 0 && (
//                 <Badge variant="secondary" className="text-xs">
//                   {tabCounts.offline}
//                 </Badge>
//               )}
//             </TabsTrigger>
//           </TabsList>

//           <TabsContent value={activeTab} className="mt-6">
//             {sortedDownloads.length === 0 ? (
//               <div className="py-12 text-center">
//                 <Download className="mx-auto mb-4 h-16 w-16 text-gray-400" />
//                 <h3 className="mb-2 text-xl font-semibold text-gray-600">
//                   Không có file nào
//                 </h3>
//                 <p className="mb-4 text-gray-500">
//                   {activeTab === 'all'
//                     ? 'Chưa có file nào được tải xuống'
//                     : `Không có file ${activeTab}`
//                   }
//                 </p>
//                 <Button asChild>
//                   <Link href="/student/my-courses">
//                     <BookOpen className="mr-2 h-4 w-4" />
//                     Khám phá khóa học
//                   </Link>
//                 </Button>
//               </div>
//             ) : (
//               <div className={cn(
//                 viewMode === 'grid'
//                   ? 'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'
//                   : 'space-y-3'
//               )}>
//                 {sortedDownloads.map((file, index) => (
//                   <motion.div
//                     key={file.id}
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: index * 0.05 }}
//                   >
//                     <Card className={cn(
//                       "transition-all hover:shadow-md",
//                       viewMode === 'grid' ? "h-full" : ""
//                     )}>
//                       <CardContent className="p-4">
//                         <div className={cn(
//                           "flex gap-4",
//                           viewMode === 'grid' ? "flex-col" : "items-center"
//                         )}>
//                           <div className="flex items-center gap-3">
//                             <input
//                               type="checkbox"
//                               checked={selectedFiles.includes(file.id)}
//                               onChange={() => handleSelectFile(file.id)}
//                               className="rounded"
//                             />
//                             <div className="flex items-center gap-2">
//                               {getFileIcon(file.type, viewMode === 'grid' ? 'lg' : 'md')}
//                               {file.isOfflineAvailable && (
//                                 <WifiOff className="h-3 w-3 text-green-500" />
//                               )}
//                             </div>
//                           </div>

//                           <div className="flex-1 min-w-0">
//                             <div className="flex items-start justify-between mb-2">
//                               <div>
//                                 <h3 className="font-semibold text-sm line-clamp-2">
//                                   {file.name}
//                                 </h3>
//                                 <div className="flex items-center gap-2 mt-1">
//                                   {getStatusIcon(file.status)}
//                                   <span className="text-xs text-gray-500">
//                                     {formatFileSize(file.size)}
//                                   </span>
//                                   {file.isFavorite && (
//                                     <Star className="h-3 w-3 text-yellow-500 fill-current" />
//                                   )}
//                                 </div>
//                               </div>

//                               <DropdownMenu>
//                                 <DropdownMenuTrigger asChild>
//                                   <Button variant="ghost" size="icon">
//                                     <MoreVertical className="h-4 w-4" />
//                                   </Button>
//                                 </DropdownMenuTrigger>
//                                 <DropdownMenuContent align="end">
//                                   {file.status === 'completed' && (
//                                     <DropdownMenuItem onClick={() => handleDownload(file.id)}>
//                                       <Download className="mr-2 h-4 w-4" />
//                                       Tải lại
//                                     </DropdownMenuItem>
//                                   )}
//                                   {file.status === 'downloading' && (
//                                     <DropdownMenuItem onClick={() => handlePauseDownload(file.id)}>
//                                       <Pause className="mr-2 h-4 w-4" />
//                                       Tạm dừng
//                                     </DropdownMenuItem>
//                                   )}
//                                   {file.status === 'paused' && (
//                                     <DropdownMenuItem onClick={() => handleResumeDownload(file.id)}>
//                                       <PlayCircle className="mr-2 h-4 w-4" />
//                                       Tiếp tục
//                                     </DropdownMenuItem>
//                                   )}
//                                   {file.status === 'failed' && (
//                                     <DropdownMenuItem onClick={() => handleRetryDownload(file.id)}>
//                                       <RefreshCw className="mr-2 h-4 w-4" />
//                                       Thử lại
//                                     </DropdownMenuItem>
//                                   )}
//                                   <DropdownMenuItem onClick={() => handleToggleFavorite(file.id)}>
//                                     {file.isFavorite ? (
//                                       <>
//                                         <StarOff className="mr-2 h-4 w-4" />
//                                         Bỏ yêu thích
//                                       </>
//                                     ) : (
//                                       <>
//                                         <Star className="mr-2 h-4 w-4" />
//                                         Yêu thích
//                                       </>
//                                     )}
//                                   </DropdownMenuItem>
//                                   {file.courseId && file.lessonId && (
//                                     <DropdownMenuItem asChild>
//                                       <Link href={`/student/courses/${file.courseId}/lessons/${file.lessonId}`}>
//                                         <ExternalLink className="mr-2 h-4 w-4" />
//                                         Đến bài học
//                                       </Link>
//                                     </DropdownMenuItem>
//                                   )}
//                                   <DropdownMenuItem
//                                     className="text-red-600"
//                                     onClick={() => handleDelete([file.id])}
//                                   >
//                                     <Trash2 className="mr-2 h-4 w-4" />
//                                     Xóa
//                                   </DropdownMenuItem>
//                                 </DropdownMenuContent>
//                               </DropdownMenu>
//                             </div>

//                             {/* Progress bar for downloading files */}
//                             {file.status === 'downloading' && file.progress !== undefined && (
//                               <div className="mb-2">
//                                 <Progress value={file.progress} className="h-1" />
//                                 <div className="flex justify-between text-xs text-gray-500 mt-1">
//                                   <span>Đang tải...</span>
//                                   <span>{file.progress}%</span>
//                                 </div>
//                               </div>
//                             )}

//                             <div className="space-y-1 text-xs text-gray-600">
//                               {file.courseName && (
//                                 <div className="flex items-center gap-1">
//                                   <BookOpen className="h-3 w-3" />
//                                   <span className="line-clamp-1">{file.courseName}</span>
//                                 </div>
//                               )}
//                               {file.lessonTitle && (
//                                 <div className="flex items-center gap-1">
//                                   <PlayCircle className="h-3 w-3" />
//                                   <span className="line-clamp-1">{file.lessonTitle}</span>
//                                 </div>
//                               )}
//                               {file.instructorName && (
//                                 <div className="flex items-center gap-1">
//                                   <User className="h-3 w-3" />
//                                   <span>{file.instructorName}</span>
//                                 </div>
//                               )}
//                               <div className="flex items-center gap-1">
//                                 <Calendar className="h-3 w-3" />
//                                 <span>{formatTime(file.downloadedAt)}</span>
//                               </div>
//                               {file.downloadCount > 0 && (
//                                 <div className="flex items-center gap-1">
//                                   <Download className="h-3 w-3" />
//                                   <span>Đã tải {file.downloadCount} lần</span>
//                                 </div>
//                               )}
//                             </div>

//                             {file.tags && file.tags.length > 0 && (
//                               <div className="flex flex-wrap gap-1 mt-2">
//                                 {file.tags.slice(0, 3).map(tag => (
//                                   <Badge key={tag} variant="outline" className="text-xs">
//                                     #{tag}
//                                   </Badge>
//                                 ))}
//                                 {file.tags.length > 3 && (
//                                   <Badge variant="outline" className="text-xs">
//                                     +{file.tags.length - 3}
//                                   </Badge>
//                                 )}
//                               </div>
//                             )}
//                           </div>

//                           {viewMode === 'list' && file.status === 'completed' && (
//                             <Button
//                               variant="outline"
//                               size="sm"
//                               onClick={() => handleDownload(file.id)}
//                             >
//                               <Download className="h-4 w-4" />
//                             </Button>
//                           )}
//                         </div>

//                         {viewMode === 'grid' && (
//                           <div className="flex justify-between items-center mt-4">
//                             <div className="flex items-center gap-2">
//                               {getStatusIcon(file.status)}
//                               <span className="text-xs text-gray-500 capitalize">
//                                 {file.status === 'completed' && 'Hoàn thành'}
//                                 {file.status === 'downloading' && 'Đang tải'}
//                                 {file.status === 'paused' && 'Tạm dừng'}
//                                 {file.status === 'failed' && 'Thất bại'}
//                                 {file.status === 'queued' && 'Đang chờ'}
//                               </span>
//                             </div>
//                             {file.status === 'completed' && (
//                               <Button
//                                 variant="outline"
//                                 size="sm"
//                                 onClick={() => handleDownload(file.id)}
//                               >
//                                 <Download className="h-4 w-4" />
//                               </Button>
//                             )}
//                           </div>
//                         )}
//                       </CardContent>
//                     </Card>
//                   </motion.div>
//                 ))}
//               </div>
//             )}
//           </TabsContent>
//         </Tabs>
//       </motion.div>
//     </div>
//   );
// }
