'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FolderOpen,
  Upload,
  Search,
  Filter,
  Grid,
  List,
  MoreHorizontal,
  Download,
  Edit,
  Share,
  Trash2,
  Eye,
  Copy,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  File,
  Plus,
  SortAsc,
  SortDesc,
  Folder,
  Star,
  Tag,
  Calendar,
  BarChart3,
  Settings,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useDropzone } from 'react-dropzone';
import {
  useGetFilesQuery,
  useGetFileStatisticsQuery,
  useUploadFileMutation,
  useUploadMultipleFilesMutation,
  useDeleteFileMutation,
  useUpdateFileMutation,
  useGenerateAccessUrlMutation,
  useBulkDeleteFilesMutation,
  FileUpload,
  FileQueryParams,
} from '@/lib/redux/api/teacher-files-api';

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

const getFileIcon = (fileType: string, mimeType: string) => {
  switch (fileType) {
    case 'IMAGE':
      return <Image className="h-8 w-8 text-green-500" />;
    case 'VIDEO':
      return <Video className="h-8 w-8 text-red-500" />;
    case 'AUDIO':
      return <Music className="h-8 w-8 text-purple-500" />;
    case 'ARCHIVE':
      return <Archive className="h-8 w-8 text-orange-500" />;
    default:
      if (mimeType.includes('pdf')) {
        return <FileText className="h-8 w-8 text-red-600" />;
      }
      if (mimeType.includes('doc') || mimeType.includes('docx')) {
        return <FileText className="h-8 w-8 text-blue-600" />;
      }
      return <File className="h-8 w-8 text-slate-500" />;
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function TeacherFilesPage() {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('all');
  const [accessLevelFilter, setAccessLevelFilter] = useState('all');
  const [sortBy, setSortBy] = useState('uploadedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentFolder, setCurrentFolder] = useState('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  // Query parameters
  const queryParams: FileQueryParams = {
    search: searchTerm || undefined,
    fileType: fileTypeFilter === 'all' ? undefined : fileTypeFilter,
    accessLevel: accessLevelFilter === 'all' ? undefined : accessLevelFilter,
    folder: currentFolder || undefined,
    page: 1,
    limit: 50,
  };

  // API hooks
  const { data: filesData, isLoading: isLoadingFiles, refetch } = useGetFilesQuery(queryParams);
  const { data: statistics, isLoading: isLoadingStats } = useGetFileStatisticsQuery();
  
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
  const [uploadMultipleFiles, { isLoading: isUploadingMultiple }] = useUploadMultipleFilesMutation();
  const [deleteFile] = useDeleteFileMutation();
  const [updateFile] = useUpdateFileMutation();
  const [generateAccessUrl] = useGenerateAccessUrlMutation();
  const [bulkDeleteFiles] = useBulkDeleteFilesMutation();

  const files = filesData?.files || [];

  // File upload with drag and drop
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 1) {
      try {
        await uploadFile({
          file: acceptedFiles[0],
          folder: currentFolder,
          accessLevel: 'private',
        }).unwrap();
        toast({
          title: 'File Uploaded',
          description: 'File has been uploaded successfully.',
        });
        refetch();
      } catch (error) {
        toast({
          title: 'Upload Failed',
          description: 'Failed to upload file.',
          variant: 'destructive',
        });
      }
    } else if (acceptedFiles.length > 1) {
      try {
        await uploadMultipleFiles({
          files: acceptedFiles,
          metadata: { folder: currentFolder },
        }).unwrap();
        toast({
          title: 'Files Uploaded',
          description: `${acceptedFiles.length} files uploaded successfully.`,
        });
        refetch();
      } catch (error) {
        toast({
          title: 'Upload Failed',
          description: 'Failed to upload files.',
          variant: 'destructive',
        });
      }
    }
    setUploadDialogOpen(false);
  }, [currentFolder, uploadFile, uploadMultipleFiles, refetch, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    disabled: isUploading || isUploadingMultiple,
  });

  const handleFileSelect = (fileId: string) => {
    setSelectedFiles(prev =>
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === files.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(files.map(file => file.id));
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await deleteFile(fileId).unwrap();
      toast({
        title: 'File Deleted',
        description: 'File has been deleted successfully.',
      });
      setSelectedFiles(prev => prev.filter(id => id !== fileId));
      refetch();
    } catch (error) {
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete file.',
        variant: 'destructive',
      });
    }
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteFiles({ fileIds: selectedFiles }).unwrap();
      toast({
        title: 'Files Deleted',
        description: `${selectedFiles.length} files deleted successfully.`,
      });
      setSelectedFiles([]);
      refetch();
    } catch (error) {
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete files.',
        variant: 'destructive',
      });
    }
  };

  const handleGenerateShareLink = async (fileId: string) => {
    try {
      const result = await generateAccessUrl({
        id: fileId,
        accessData: { expiresIn: 3600, accessType: 'view' },
      }).unwrap();
      
      await navigator.clipboard.writeText(result.accessUrl);
      toast({
        title: 'Share Link Copied',
        description: 'Share link has been copied to clipboard.',
      });
    } catch (error) {
      toast({
        title: 'Share Failed',
        description: 'Failed to generate share link.',
        variant: 'destructive',
      });
    }
  };

  // Sort files
  const sortedFiles = [...files].sort((a, b) => {
    let aValue: any = a[sortBy as keyof FileUpload];
    let bValue: any = b[sortBy as keyof FileUpload];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  if (isLoadingFiles) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30">
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="bg-white/80 backdrop-blur-lg border-white/30 shadow-xl">
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-8 w-8 bg-slate-200 rounded mb-4"></div>
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-white/20 bg-white/80 backdrop-blur-xl dark:bg-slate-900/80">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg">
                <FolderOpen className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                  File Manager
                </h1>
                <p className="text-slate-600 dark:text-slate-300">
                  Manage your teaching materials and resources
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Files
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Upload Files</DialogTitle>
                    <DialogDescription>
                      Drag and drop files or click to browse
                    </DialogDescription>
                  </DialogHeader>
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      isDragActive 
                        ? 'border-violet-500 bg-violet-50' 
                        : 'border-slate-300 hover:border-violet-400'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                    {isDragActive ? (
                      <p className="text-violet-600">Drop files here...</p>
                    ) : (
                      <>
                        <p className="text-slate-600 mb-2">
                          Drag and drop files here, or click to browse
                        </p>
                        <p className="text-sm text-slate-500">
                          Support for images, videos, documents, and more
                        </p>
                      </>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              
              {selectedFiles.length > 0 && (
                <Button
                  variant="outline"
                  onClick={handleBulkDelete}
                  className="bg-white/80 backdrop-blur-sm border-white/20 text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete ({selectedFiles.length})
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={() => refetch()}
                className="bg-white/80 backdrop-blur-sm border-white/20"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <motion.div
        className="container mx-auto space-y-8 px-6 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Statistics Cards */}
        {!isLoadingStats && statistics && (
          <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6 md:grid-cols-5">
            <Card className="bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-lg border-white/30 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Files</p>
                    <p className="text-2xl font-bold text-slate-800">{statistics.totalFiles}</p>
                  </div>
                  <File className="h-8 w-8 text-slate-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-lg border-white/30 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Storage Used</p>
                    <p className="text-2xl font-bold text-violet-600">{formatFileSize(statistics.totalSize)}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-violet-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-lg border-white/30 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Images</p>
                    <p className="text-2xl font-bold text-green-600">{statistics.filesByType.images}</p>
                  </div>
                  <Image className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-lg border-white/30 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Videos</p>
                    <p className="text-2xl font-bold text-red-600">{statistics.filesByType.videos}</p>
                  </div>
                  <Video className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-lg border-white/30 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Documents</p>
                    <p className="text-2xl font-bold text-blue-600">{statistics.filesByType.documents}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Filters and Controls */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white/80 backdrop-blur-xl border-white/30 shadow-xl">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-1 items-center space-x-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="Search files..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/80 backdrop-blur-sm"
                    />
                  </div>
                  
                  {selectedFiles.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={selectedFiles.length === files.length}
                        onCheckedChange={handleSelectAll}
                      />
                      <span className="text-sm text-slate-600">
                        {selectedFiles.length} selected
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <Select value={fileTypeFilter} onValueChange={setFileTypeFilter}>
                    <SelectTrigger className="w-32 bg-white/80">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="IMAGE">Images</SelectItem>
                      <SelectItem value="VIDEO">Videos</SelectItem>
                      <SelectItem value="DOCUMENT">Documents</SelectItem>
                      <SelectItem value="AUDIO">Audio</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={accessLevelFilter} onValueChange={setAccessLevelFilter}>
                    <SelectTrigger className="w-32 bg-white/80">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Access</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="restricted">Restricted</SelectItem>
                    </SelectContent>
                  </Select>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="bg-white/80">
                        {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setSortBy('originalName')}>
                        Name
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy('uploadedAt')}>
                        Date
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy('fileSize')}>
                        Size
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                        {sortOrder === 'asc' ? 'Descending' : 'Ascending'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <div className="flex border border-slate-200 rounded-md">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Files Grid/List */}
        <motion.div variants={itemVariants}>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {sortedFiles.map((file) => (
                <Card
                  key={file.id}
                  className="group bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-lg border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <Checkbox
                        checked={selectedFiles.includes(file.id)}
                        onCheckedChange={() => handleFileSelect(file.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleGenerateShareLink(file.id)}>
                            <Share className="mr-2 h-4 w-4" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteFile(file.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex flex-col items-center space-y-3">
                      {file.thumbnailUrl ? (
                        <img
                          src={file.thumbnailUrl}
                          alt={file.originalName}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        getFileIcon(file.fileType, file.mimeType)
                      )}
                      
                      <div className="text-center w-full">
                        <p className="font-medium text-sm text-slate-800 truncate" title={file.originalName}>
                          {file.originalName}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {formatFileSize(file.fileSize)}
                        </p>
                        <Badge
                          variant="outline"
                          className={`mt-2 text-xs ${
                            file.accessLevel === 'public' 
                              ? 'border-green-300 text-green-700'
                              : file.accessLevel === 'private'
                              ? 'border-red-300 text-red-700'
                              : 'border-orange-300 text-orange-700'
                          }`}
                        >
                          {file.accessLevel}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-white/80 backdrop-blur-xl border-white/30 shadow-xl">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-slate-200">
                      <tr>
                        <th className="text-left p-4 w-12">
                          <Checkbox
                            checked={selectedFiles.length === files.length}
                            onCheckedChange={handleSelectAll}
                          />
                        </th>
                        <th className="text-left p-4">Name</th>
                        <th className="text-left p-4">Type</th>
                        <th className="text-left p-4">Size</th>
                        <th className="text-left p-4">Access</th>
                        <th className="text-left p-4">Uploaded</th>
                        <th className="text-left p-4 w-20">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedFiles.map((file) => (
                        <tr key={file.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="p-4">
                            <Checkbox
                              checked={selectedFiles.includes(file.id)}
                              onCheckedChange={() => handleFileSelect(file.id)}
                            />
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-3">
                              {file.thumbnailUrl ? (
                                <img
                                  src={file.thumbnailUrl}
                                  alt={file.originalName}
                                  className="w-8 h-8 object-cover rounded"
                                />
                              ) : (
                                getFileIcon(file.fileType, file.mimeType)
                              )}
                              <div>
                                <p className="font-medium text-slate-800">{file.originalName}</p>
                                {file.description && (
                                  <p className="text-sm text-slate-500">{file.description}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline">{file.fileType}</Badge>
                          </td>
                          <td className="p-4 text-slate-600">
                            {formatFileSize(file.fileSize)}
                          </td>
                          <td className="p-4">
                            <Badge
                              variant="outline"
                              className={
                                file.accessLevel === 'public' 
                                  ? 'border-green-300 text-green-700'
                                  : file.accessLevel === 'private'
                                  ? 'border-red-300 text-red-700'
                                  : 'border-orange-300 text-orange-700'
                              }
                            >
                              {file.accessLevel}
                            </Badge>
                          </td>
                          <td className="p-4 text-slate-600">
                            {new Date(file.uploadedAt).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Preview
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleGenerateShareLink(file.id)}>
                                  <Share className="mr-2 h-4 w-4" />
                                  Share
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="mr-2 h-4 w-4" />
                                  Download
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDeleteFile(file.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Empty State */}
        {sortedFiles.length === 0 && (
          <motion.div variants={itemVariants} className="text-center py-12">
            <FolderOpen className="mx-auto h-16 w-16 text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">No Files Found</h3>
            <p className="text-slate-500 mb-6">
              {searchTerm || fileTypeFilter !== 'all' || accessLevelFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Upload your first files to get started.'}
            </p>
            <Button
              onClick={() => setUploadDialogOpen(true)}
              className="bg-gradient-to-r from-violet-500 to-purple-600"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Files
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}