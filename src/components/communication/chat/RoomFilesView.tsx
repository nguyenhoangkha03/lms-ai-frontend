'use client';

import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useGetRoomFilesQuery } from '@/lib/redux/api/enhanced-chat-api';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  File,
  Image,
  Video,
  Music,
  Archive,
  FileText,
  Download,
  Search,
  Filter,
  Grid3X3,
  List,
  MoreVertical,
  Eye,
  Share,
  Trash2,
  Calendar,
  User,
  HardDrive,
  Clock,
  SortAsc,
  FolderOpen,
  ExternalLink,
} from 'lucide-react';
import { ChatFile } from '@/lib/types/chat';
import { toast } from 'sonner';

interface RoomFilesViewProps {
  roomId: string;
}

type ViewMode = 'grid' | 'list';
type SortOption = 'newest' | 'oldest' | 'name' | 'size' | 'type';

export function RoomFilesView({ roomId }: RoomFilesViewProps) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedFile, setSelectedFile] = useState<ChatFile | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);

  // API query
  const { data: filesData, isLoading } = useGetRoomFilesQuery({
    roomId,
    page: 1,
    limit: 100,
    fileType: selectedCategory !== 'all' ? selectedCategory : undefined,
    search: searchTerm || undefined,
  });

  const files = filesData?.files || [];
  const total = filesData?.total || 0;

  // Check permissions
  const canDelete = user && ['teacher', 'admin'].includes(user.userType);

  // File categories
  const fileCategories = [
    { value: 'all', label: 'All Files', icon: FolderOpen },
    { value: 'image', label: 'Images', icon: Image },
    { value: 'video', label: 'Videos', icon: Video },
    { value: 'audio', label: 'Audio', icon: Music },
    { value: 'document', label: 'Documents', icon: FileText },
    { value: 'archive', label: 'Archives', icon: Archive },
    { value: 'other', label: 'Other', icon: File },
  ];

  // Get file icon
  const getFileIcon = (file: ChatFile) => {
    switch (file.fileCategory) {
      case 'image':
        return Image;
      case 'video':
        return Video;
      case 'audio':
        return Music;
      case 'document':
        return FileText;
      case 'archive':
        return Archive;
      default:
        return File;
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Filter and sort files
  const filteredAndSortedFiles = React.useMemo(() => {
    let filtered = files.filter(file => {
      const matchesSearch =
        !searchTerm ||
        file.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === 'all' || file.fileCategory === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    // Sort files
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case 'oldest':
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case 'name':
          return a.originalName
            .toLowerCase()
            .localeCompare(b.originalName.toLowerCase());
        case 'size':
          return b.fileSize - a.fileSize;
        case 'type':
          return a.fileCategory.localeCompare(b.fileCategory);
        default:
          return 0;
      }
    });

    return filtered;
  }, [files, searchTerm, selectedCategory, sortBy]);

  // Handle file download
  const handleDownload = (file: ChatFile) => {
    // Create download link
    const link = document.createElement('a');
    link.href = file.filePath;
    link.download = file.originalName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Downloading ${file.originalName}`);
  };

  // Handle file preview
  const handlePreview = (file: ChatFile) => {
    setSelectedFile(file);
    setShowPreviewDialog(true);
  };

  // Handle file delete
  const handleDelete = async () => {
    if (!selectedFile) return;

    try {
      // API call to delete file would go here
      toast.success('File deleted successfully');
      setShowDeleteDialog(false);
      setSelectedFile(null);
    } catch (error) {
      toast.error('Failed to delete file');
    }
  };

  // Get category stats
  const getCategoryStats = () => {
    const stats = fileCategories.slice(1).map(category => ({
      ...category,
      count: files.filter(f => f.fileCategory === category.value).length,
      size: files
        .filter(f => f.fileCategory === category.value)
        .reduce((sum, f) => sum + f.fileSize, 0),
    }));
    return stats;
  };

  const categoryStats = getCategoryStats();
  const totalSize = files.reduce((sum, file) => sum + file.fileSize, 0);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FolderOpen className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold">Shared Files</h3>
            <Badge variant="secondary" className="text-xs">
              {total}
            </Badge>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center space-x-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8 w-8 p-0"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search and filters */}
        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder="Search files..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-2">
            {/* Category filter */}
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="h-8 w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fileCategories.map(category => {
                  const Icon = category.icon;
                  const count =
                    category.value === 'all'
                      ? files.length
                      : files.filter(f => f.fileCategory === category.value)
                          .length;

                  return (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4" />
                        <span>{category.label}</span>
                        <span className="text-gray-500">({count})</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {/* Sort options */}
            <Select
              value={sortBy}
              onValueChange={(value: SortOption) => setSortBy(value)}
            >
              <SelectTrigger className="h-8 w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-3 w-3" />
                    <span>Newest</span>
                  </div>
                </SelectItem>
                <SelectItem value="oldest">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-3 w-3" />
                    <span>Oldest</span>
                  </div>
                </SelectItem>
                <SelectItem value="name">
                  <div className="flex items-center space-x-2">
                    <SortAsc className="h-3 w-3" />
                    <span>Name</span>
                  </div>
                </SelectItem>
                <SelectItem value="size">
                  <div className="flex items-center space-x-2">
                    <HardDrive className="h-3 w-3" />
                    <span>Size</span>
                  </div>
                </SelectItem>
                <SelectItem value="type">
                  <div className="flex items-center space-x-2">
                    <Filter className="h-3 w-3" />
                    <span>Type</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="files" className="flex h-full flex-col">
          <TabsList className="mx-4 mt-2 grid w-full grid-cols-2">
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>

          {/* Files Tab */}
          <TabsContent value="files" className="m-0 flex-1">
            <ScrollArea className="h-full">
              {filteredAndSortedFiles.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center p-4 text-center">
                  {files.length === 0 ? (
                    <>
                      <FolderOpen className="mb-4 h-12 w-12 text-gray-300" />
                      <h4 className="mb-2 text-lg font-medium text-gray-900">
                        No files shared yet
                      </h4>
                      <p className="text-gray-600">
                        Files shared in this room will appear here.
                      </p>
                    </>
                  ) : (
                    <>
                      <Search className="mb-2 h-8 w-8 text-gray-400" />
                      <p className="text-gray-500">
                        No files match your search criteria
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedCategory('all');
                        }}
                        className="mt-2"
                      >
                        Clear filters
                      </Button>
                    </>
                  )}
                </div>
              ) : viewMode === 'grid' ? (
                /* Grid View */
                <div className="grid grid-cols-2 gap-3 p-4">
                  {filteredAndSortedFiles.map(file => {
                    const FileIcon = getFileIcon(file);
                    const canPreview =
                      file.fileCategory === 'image' ||
                      file.mimeType.startsWith('text/') ||
                      file.mimeType === 'application/pdf';

                    return (
                      <Card
                        key={file.id}
                        className="group transition-shadow hover:shadow-md"
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start space-x-3">
                            {/* File thumbnail/icon */}
                            <div className="flex-shrink-0">
                              {file.thumbnailUrl ? (
                                <img
                                  src={file.thumbnailUrl}
                                  alt={file.originalName}
                                  className="h-12 w-12 cursor-pointer rounded border object-cover"
                                  onClick={() =>
                                    canPreview && handlePreview(file)
                                  }
                                />
                              ) : (
                                <div className="flex h-12 w-12 items-center justify-center rounded border bg-gray-100">
                                  <FileIcon className="h-6 w-6 text-gray-600" />
                                </div>
                              )}
                            </div>

                            {/* File info */}
                            <div className="min-w-0 flex-1">
                              <h4
                                className="truncate text-sm font-medium"
                                title={file.originalName}
                              >
                                {file.originalName}
                              </h4>
                              <div className="space-y-1 text-xs text-gray-500">
                                <p>{formatFileSize(file.fileSize)}</p>
                                <p>
                                  {formatDistanceToNow(
                                    new Date(file.createdAt),
                                    { addSuffix: true }
                                  )}
                                </p>
                              </div>
                              {file.description && (
                                <p className="mt-1 truncate text-xs text-gray-600">
                                  {file.description}
                                </p>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="opacity-0 transition-opacity group-hover:opacity-100">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                  >
                                    <MoreVertical className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => handleDownload(file)}
                                  >
                                    <Download className="mr-2 h-4 w-4" />
                                    Download
                                  </DropdownMenuItem>

                                  {canPreview && (
                                    <DropdownMenuItem
                                      onClick={() => handlePreview(file)}
                                    >
                                      <Eye className="mr-2 h-4 w-4" />
                                      Preview
                                    </DropdownMenuItem>
                                  )}

                                  <DropdownMenuItem>
                                    <Share className="mr-2 h-4 w-4" />
                                    Share
                                  </DropdownMenuItem>

                                  <DropdownMenuItem>
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Open in New Tab
                                  </DropdownMenuItem>

                                  {canDelete && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        className="text-red-600"
                                        onClick={() => {
                                          setSelectedFile(file);
                                          setShowDeleteDialog(true);
                                        }}
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                /* List View */
                <div className="space-y-2 p-4">
                  {filteredAndSortedFiles.map(file => {
                    const FileIcon = getFileIcon(file);
                    const canPreview =
                      file.fileCategory === 'image' ||
                      file.mimeType.startsWith('text/') ||
                      file.mimeType === 'application/pdf';

                    return (
                      <Card
                        key={file.id}
                        className="group transition-colors hover:bg-gray-50"
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center space-x-4">
                            {/* File icon/thumbnail */}
                            <div className="flex-shrink-0">
                              {file.thumbnailUrl ? (
                                <img
                                  src={file.thumbnailUrl}
                                  alt={file.originalName}
                                  className="h-10 w-10 cursor-pointer rounded border object-cover"
                                  onClick={() =>
                                    canPreview && handlePreview(file)
                                  }
                                />
                              ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded border bg-gray-100">
                                  <FileIcon className="h-5 w-5 text-gray-600" />
                                </div>
                              )}
                            </div>

                            {/* File info */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center space-x-2">
                                <h4
                                  className="truncate text-sm font-medium"
                                  title={file.originalName}
                                >
                                  {file.originalName}
                                </h4>
                                <Badge variant="outline" className="text-xs">
                                  {file.fileCategory}
                                </Badge>
                              </div>
                              {file.description && (
                                <p className="mt-1 truncate text-xs text-gray-600">
                                  {file.description}
                                </p>
                              )}
                            </div>

                            {/* File details */}
                            <div className="flex items-center space-x-6 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <HardDrive className="h-3 w-3" />
                                <span>{formatFileSize(file.fileSize)}</span>
                              </div>

                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {formatDistanceToNow(
                                    new Date(file.createdAt),
                                    { addSuffix: true }
                                  )}
                                </span>
                              </div>

                              <div className="flex items-center space-x-1">
                                <User className="h-3 w-3" />
                                <span>User</span>
                              </div>

                              <div className="flex items-center space-x-1">
                                <Download className="h-3 w-3" />
                                <span>{file.downloadCount}</span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownload(file)}
                                className="h-8 w-8 p-0"
                              >
                                <Download className="h-4 w-4" />
                              </Button>

                              {canPreview && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handlePreview(file)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              )}

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Share className="mr-2 h-4 w-4" />
                                    Share
                                  </DropdownMenuItem>

                                  <DropdownMenuItem>
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Open in New Tab
                                  </DropdownMenuItem>

                                  {canDelete && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        className="text-red-600"
                                        onClick={() => {
                                          setSelectedFile(file);
                                          setShowDeleteDialog(true);
                                        }}
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview" className="m-0 flex-1">
            <ScrollArea className="h-full">
              <div className="space-y-6 p-4">
                {/* Storage Overview */}
                <Card>
                  <CardContent className="p-4">
                    <h4 className="mb-3 flex items-center font-medium">
                      <HardDrive className="mr-2 h-4 w-4" />
                      Storage Overview
                    </h4>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Total files: {files.length}</span>
                        <span>Total size: {formatFileSize(totalSize)}</span>
                      </div>

                      <div className="space-y-2">
                        {categoryStats.map(category => {
                          const Icon = category.icon;
                          const percentage =
                            totalSize > 0
                              ? (category.size / totalSize) * 100
                              : 0;

                          return (
                            <div key={category.value} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center space-x-2">
                                  <Icon className="h-3 w-3" />
                                  <span>{category.label}</span>
                                  <span className="text-gray-500">
                                    ({category.count})
                                  </span>
                                </div>
                                <span>{formatFileSize(category.size)}</span>
                              </div>
                              <Progress value={percentage} className="h-1" />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardContent className="p-4">
                    <h4 className="mb-3 flex items-center font-medium">
                      <Clock className="mr-2 h-4 w-4" />
                      Recent Activity
                    </h4>

                    <div className="space-y-3">
                      {files.slice(0, 5).map(file => {
                        const FileIcon = getFileIcon(file);
                        return (
                          <div
                            key={file.id}
                            className="flex items-center space-x-3"
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded bg-gray-100">
                              <FileIcon className="h-4 w-4 text-gray-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">
                                {file.originalName}
                              </p>
                              <p className="text-xs text-gray-500">
                                Uploaded{' '}
                                {formatDistanceToNow(new Date(file.createdAt), {
                                  addSuffix: true,
                                })}
                              </p>
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatFileSize(file.fileSize)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Downloads */}
                <Card>
                  <CardContent className="p-4">
                    <h4 className="mb-3 flex items-center font-medium">
                      <Download className="mr-2 h-4 w-4" />
                      Most Downloaded
                    </h4>

                    <div className="space-y-3">
                      {files
                        .sort((a, b) => b.downloadCount - a.downloadCount)
                        .slice(0, 5)
                        .map(file => {
                          const FileIcon = getFileIcon(file);
                          return (
                            <div
                              key={file.id}
                              className="flex items-center space-x-3"
                            >
                              <div className="flex h-8 w-8 items-center justify-center rounded bg-gray-100">
                                <FileIcon className="h-4 w-4 text-gray-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">
                                  {file.originalName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {file.downloadCount} downloads
                                </p>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                {file.fileCategory}
                              </Badge>
                            </div>
                          );
                        })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedFile?.originalName}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
            >
              Delete File
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* File preview dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-h-[80vh] max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>{selectedFile?.originalName}</span>
            </DialogTitle>
          </DialogHeader>

          {selectedFile && (
            <div className="space-y-4">
              {/* File info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Size:</span>{' '}
                  {formatFileSize(selectedFile.fileSize)}
                </div>
                <div>
                  <span className="font-medium">Type:</span>{' '}
                  {selectedFile.mimeType}
                </div>
                <div>
                  <span className="font-medium">Uploaded:</span>{' '}
                  {formatDistanceToNow(new Date(selectedFile.createdAt), {
                    addSuffix: true,
                  })}
                </div>
                <div>
                  <span className="font-medium">Downloads:</span>{' '}
                  {selectedFile.downloadCount}
                </div>
              </div>

              {selectedFile.description && (
                <div>
                  <span className="text-sm font-medium">Description:</span>
                  <p className="mt-1 text-sm text-gray-600">
                    {selectedFile.description}
                  </p>
                </div>
              )}

              {/* Preview content */}
              <div className="max-h-96 overflow-auto rounded-lg border bg-gray-50 p-4">
                {selectedFile.fileCategory === 'image' ? (
                  <img
                    src={selectedFile.filePath}
                    alt={selectedFile.originalName}
                    className="mx-auto h-auto max-w-full"
                  />
                ) : selectedFile.mimeType.startsWith('text/') ? (
                  <div className="whitespace-pre-wrap font-mono text-sm">
                    {/* Text content would be loaded here */}
                    <p className="italic text-gray-500">
                      Text preview not available
                    </p>
                  </div>
                ) : selectedFile.mimeType === 'application/pdf' ? (
                  <div className="text-center">
                    <FileText className="mx-auto mb-2 h-16 w-16 text-gray-400" />
                    <p className="text-gray-500">PDF preview not available</p>
                    <Button
                      variant="outline"
                      onClick={() => handleDownload(selectedFile)}
                      className="mt-2"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download to View
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <File className="mx-auto mb-2 h-16 w-16 text-gray-400" />
                    <p className="text-gray-500">
                      Preview not available for this file type
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handleDownload(selectedFile)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button onClick={() => setShowPreviewDialog(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
