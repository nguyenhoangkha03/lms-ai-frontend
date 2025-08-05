'use client';

import React, { useState, useMemo } from 'react';
import {
  Upload,
  Search,
  Filter,
  Grid,
  List,
  MoreHorizontal,
  Download,
  Share2,
  Edit,
  Trash2,
  Eye,
  Play,
  Folder,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Archive,
  Clock,
  CheckCircle,
  AlertTriangle,
  Shield,
  Zap,
  BarChart3,
  Settings,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

import {
  useGetFilesQuery,
  useGetFileStatisticsQuery,
  useDeleteFileMutation,
  useBulkDeleteFilesMutation,
  useUpdateFileMetadataMutation,
} from '@/lib/redux/api/file-management-api';
import {
  FileUpload,
  FileType,
  FileAccessLevel,
  FileProcessingStatus,
} from '@/lib/types/file-management';
import { cn, formatFileSize, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

// Import sub-components
import { FilePreviewModal } from './FilePreviewModal';
import { FileDetailsPanel } from './FileDetailsPanel';
import { BulkOperationsPanel } from './BulkOperationsPanel';
import { FileFilterPanel } from './FileFilterPanel';
import { FileVersionHistory } from './FileVersionHistory';
import { FileUploadZone } from './FileUploadZone';
import { FileProcessingStatus as ProcessingStatusComponent } from './FileProcessingStatus';
import { FileSecurityPanel } from './FileSecurityPanel';
import { CDNManagementPanel } from './CDNManagementPanel';

interface FileManagementDashboardProps {
  userRole?: 'student' | 'teacher' | 'admin';
  courseId?: string;
  lessonId?: string;
  initialView?: 'grid' | 'list';
  enableUpload?: boolean;
  enableBulkOperations?: boolean;
  enableFiltering?: boolean;
}

export function FileManagementDashboard({
  userRole = 'teacher',
  courseId,
  lessonId,
  initialView = 'grid',
  enableUpload = true,
  enableBulkOperations = true,
  enableFiltering = true,
}: FileManagementDashboardProps) {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(initialView);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showUploadZone, setShowUploadZone] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileUpload | null>(null);
  const [showFileDetails, setShowFileDetails] = useState(false);
  const [showBulkOperations, setShowBulkOperations] = useState(false);

  // Filters state
  const [filters, setFilters] = useState({
    fileType: '' as FileType | '',
    accessLevel: '' as FileAccessLevel | '',
    processingStatus: '' as FileProcessingStatus | '',
    dateRange: '',
    uploader: '',
    page: 1,
    limit: 20,
    sortBy: 'createdAt' as const,
    sortOrder: 'desc' as const,
  });

  // API queries
  const {
    data: filesData,
    isLoading: filesLoading,
    error: filesError,
    refetch: refetchFiles,
  } = useGetFilesQuery({
    ...filters,
    search: searchQuery || undefined,
    courseId,
    lessonId,
    fileType: filters.fileType || undefined,
    accessLevel: filters.accessLevel || undefined,
    processingStatus: filters.processingStatus || undefined,
  });

  const { data: statisticsData, isLoading: statisticsLoading } =
    useGetFileStatisticsQuery({
      courseId,
      timeRange: '30d',
    });

  // Mutations
  const [deleteFile] = useDeleteFileMutation();
  const [bulkDeleteFiles] = useBulkDeleteFilesMutation();
  const [updateFileMetadata] = useUpdateFileMetadataMutation();

  // Computed values
  const files = filesData?.files || [];
  const totalFiles = filesData?.total || 0;
  const statistics = statisticsData || {};

  // File type icons mapping
  const getFileIcon = (fileType: FileType) => {
    switch (fileType) {
      case 'image':
        return ImageIcon;
      case 'video':
        return Video;
      case 'audio':
        return Music;
      case 'document':
        return FileText;
      case 'archive':
        return Archive;
      default:
        return FileText;
    }
  };

  // File status badge
  const getStatusBadge = (file: FileUpload) => {
    if (file.processingStatus === 'processing') {
      return (
        <Badge variant="outline" className="text-blue-600">
          <Clock className="mr-1 h-3 w-3" />
          Processing
        </Badge>
      );
    }
    if (file.processingStatus === 'failed') {
      return (
        <Badge variant="destructive">
          <AlertTriangle className="mr-1 h-3 w-3" />
          Failed
        </Badge>
      );
    }
    if (file.processingStatus === 'completed') {
      return (
        <Badge variant="secondary" className="text-green-600">
          <CheckCircle className="mr-1 h-3 w-3" />
          Ready
        </Badge>
      );
    }
    return <Badge variant="outline">Pending</Badge>;
  };

  // Handle file selection
  const handleFileSelect = (fileId: string, selected: boolean) => {
    if (selected) {
      setSelectedFiles(prev => [...prev, fileId]);
    } else {
      setSelectedFiles(prev => prev.filter(id => id !== fileId));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedFiles(files.map(file => file.id));
    } else {
      setSelectedFiles([]);
    }
  };

  // Handle file operations
  const handleFileDelete = async (fileId: string) => {
    try {
      await deleteFile(fileId).unwrap();
      toast.success('File deleted successfully');
      refetchFiles();
    } catch (error) {
      toast.error('Failed to delete file');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.length === 0) return;

    try {
      await bulkDeleteFiles(selectedFiles).unwrap();
      toast.success(`${selectedFiles.length} files deleted successfully`);
      setSelectedFiles([]);
      setShowBulkOperations(false);
      refetchFiles();
    } catch (error) {
      toast.error('Failed to delete files');
    }
  };

  const handleFilePreview = (file: FileUpload) => {
    setSelectedFile(file);
  };

  // Filter files based on search
  const filteredFiles = useMemo(() => {
    if (!searchQuery) return files;

    return files.filter(
      file =>
        file.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.metadata?.tags?.some(tag =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );
  }, [files, searchQuery]);

  return (
    <div className="flex flex-col space-y-6">
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">File Management</h1>
          <p className="text-muted-foreground">
            Manage your files, media processing, and storage
          </p>
        </div>

        <div className="flex items-center gap-2">
          {enableUpload && (
            <Button
              onClick={() => setShowUploadZone(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Files
            </Button>
          )}

          {userRole === 'admin' && (
            <Button variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      {!statisticsLoading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Files
                  </p>
                  <p className="text-2xl font-bold">
                    {(statistics as any)?.totalFiles?.toLocaleString() || '0'}
                  </p>
                </div>
                <Folder className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Storage Used
                  </p>
                  <p className="text-2xl font-bold">
                    {formatFileSize((statistics as any).totalSize || 0)}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Processing
                  </p>
                  <p className="text-2xl font-bold">
                    {(statistics as any).processingStats?.processing || 0}
                  </p>
                </div>
                <Zap className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Security Scans
                  </p>
                  <p className="text-2xl font-bold">
                    {(statistics as any).securityScans?.completed || 0}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
            <Input
              placeholder="Search files by name or tags..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {enableFiltering && (
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(showFilters && 'bg-muted')}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          )}

          <Select
            value={filters.sortBy}
            onValueChange={value =>
              setFilters(prev => ({ ...prev, sortBy: value as any }))
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Date Created</SelectItem>
              <SelectItem value="updatedAt">Date Modified</SelectItem>
              <SelectItem value="originalName">Name</SelectItem>
              <SelectItem value="fileSize">Size</SelectItem>
              <SelectItem value="downloadCount">Downloads</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center rounded-md border">
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

      {/* Bulk Operations Bar */}
      {selectedFiles.length > 0 && enableBulkOperations && (
        <Alert>
          <AlertDescription className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span>{selectedFiles.length} files selected</span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowBulkOperations(true)}
                >
                  More Actions
                </Button>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedFiles([])}
            >
              Clear Selection
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Filter Panel */}
      {showFilters && enableFiltering && (
        <FileFilterPanel
          filters={filters}
          onFiltersChange={setFilters}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Main Content */}
      <Tabs defaultValue="files" className="space-y-6">
        <TabsList>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          {userRole === 'admin' && (
            <>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="cdn">CDN</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="files" className="space-y-4">
          {/* Files Grid/List */}
          {filesLoading ? (
            <div
              className={cn(
                'grid gap-4',
                viewMode === 'grid'
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : 'grid-cols-1'
              )}
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="mb-4 h-32 w-full" />
                    <Skeleton className="mb-2 h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filesError ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Failed to load files. Please try again.
              </AlertDescription>
            </Alert>
          ) : filteredFiles.length === 0 ? (
            <div className="py-12 text-center">
              <Folder className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No files found</h3>
              <p className="mb-4 text-muted-foreground">
                {searchQuery
                  ? 'Try adjusting your search terms'
                  : 'Upload some files to get started'}
              </p>
              {enableUpload && (
                <Button onClick={() => setShowUploadZone(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Files
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Select All Checkbox */}
              {enableBulkOperations && (
                <div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-4">
                  <Checkbox
                    checked={selectedFiles.length === filteredFiles.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm font-medium">
                    Select All ({filteredFiles.length} files)
                  </span>
                </div>
              )}

              {/* Files Display */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredFiles.map(file => (
                    <FileGridCard
                      key={file.id}
                      file={file}
                      selected={selectedFiles.includes(file.id)}
                      onSelect={selected => handleFileSelect(file.id, selected)}
                      onPreview={() => handleFilePreview(file)}
                      onDelete={() => handleFileDelete(file.id)}
                      onShowDetails={() => {
                        setSelectedFile(file);
                        setShowFileDetails(true);
                      }}
                      userRole={userRole}
                      enableSelection={enableBulkOperations}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredFiles.map(file => (
                    <FileListItem
                      key={file.id}
                      file={file}
                      selected={selectedFiles.includes(file.id)}
                      onSelect={selected => handleFileSelect(file.id, selected)}
                      onPreview={() => handleFilePreview(file)}
                      onDelete={() => handleFileDelete(file.id)}
                      onShowDetails={() => {
                        setSelectedFile(file);
                        setShowFileDetails(true);
                      }}
                      userRole={userRole}
                      enableSelection={enableBulkOperations}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {filesData && filesData.totalPages > 1 && (
                <div className="mt-6 flex justify-center">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      disabled={filters.page === 1}
                      onClick={() =>
                        setFilters(prev => ({ ...prev, page: prev.page - 1 }))
                      }
                    >
                      Previous
                    </Button>
                    <span className="px-4 py-2 text-sm">
                      Page {filters.page} of {filesData.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      disabled={filters.page === filesData.totalPages}
                      onClick={() =>
                        setFilters(prev => ({ ...prev, page: prev.page + 1 }))
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="processing">
          <ProcessingStatusComponent />
        </TabsContent>

        {userRole === 'admin' && (
          <>
            <TabsContent value="security">
              <FileSecurityPanel />
            </TabsContent>

            <TabsContent value="cdn">
              <CDNManagementPanel />
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Modals and Panels */}
      {showUploadZone && (
        <FileUploadZone
          open={showUploadZone}
          onClose={() => setShowUploadZone(false)}
          onUploadComplete={() => {
            refetchFiles();
            setShowUploadZone(false);
          }}
          courseId={courseId}
          lessonId={lessonId}
        />
      )}

      {selectedFile && (
        <FilePreviewModal
          file={selectedFile}
          open={!!selectedFile}
          onClose={() => setSelectedFile(null)}
        />
      )}

      {showFileDetails && selectedFile && (
        <FileDetailsPanel
          file={selectedFile}
          open={showFileDetails}
          onClose={() => setShowFileDetails(false)}
          onFileUpdate={updatedFile => {
            setSelectedFile(updatedFile);
            refetchFiles();
          }}
        />
      )}

      {showBulkOperations && (
        <BulkOperationsPanel
          selectedFileIds={selectedFiles}
          open={showBulkOperations}
          onClose={() => setShowBulkOperations(false)}
          onComplete={() => {
            setSelectedFiles([]);
            setShowBulkOperations(false);
            refetchFiles();
          }}
        />
      )}

      {selectedFile && (
        <FileVersionHistory
          fileId={selectedFile.id}
          onVersionRestore={() => refetchFiles()}
        />
      )}
    </div>
  );
}

// File Grid Card Component
interface FileGridCardProps {
  file: FileUpload;
  selected: boolean;
  onSelect: (selected: boolean) => void;
  onPreview: () => void;
  onDelete: () => void;
  onShowDetails: () => void;
  userRole: string;
  enableSelection: boolean;
}

function FileGridCard({
  file,
  selected,
  onSelect,
  onPreview,
  onDelete,
  onShowDetails,
  userRole,
  enableSelection,
}: FileGridCardProps) {
  const FileIcon = getFileIcon(file.fileType);

  return (
    <Card
      className={cn(
        'group cursor-pointer transition-all hover:shadow-md',
        selected && 'ring-2 ring-blue-500'
      )}
    >
      <CardContent className="p-4">
        {/* Selection Checkbox */}
        {enableSelection && (
          <div className="absolute left-2 top-2 z-10">
            <Checkbox
              checked={selected}
              onCheckedChange={onSelect}
              className="border-2 bg-white"
            />
          </div>
        )}

        {/* File Preview */}
        <div
          className="mb-3 flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-muted"
          onClick={onPreview}
        >
          {file.thumbnailPath ? (
            <img
              src={file.thumbnailPath}
              alt={file.originalName}
              className="h-full w-full object-cover"
            />
          ) : (
            <FileIcon className="h-12 w-12 text-muted-foreground" />
          )}

          {/* Play button for video files */}
          {file.fileType === 'video' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="rounded-full bg-white/90 p-3">
                <Play className="h-6 w-6 text-black" />
              </div>
            </div>
          )}
        </div>

        {/* File Info */}
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h4
              className="flex-1 truncate text-sm font-medium"
              title={file.originalName}
            >
              {file.originalName}
            </h4>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onPreview}>
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onShowDetails}>
                  <Edit className="mr-2 h-4 w-4" />
                  Details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {(userRole === 'admin' || userRole === 'teacher') && (
                  <DropdownMenuItem
                    onClick={onDelete}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatFileSize(file.fileSize)}</span>
            <span>{formatDate(file.createdAt)}</span>
          </div>

          <div className="flex items-center justify-between">
            {getStatusBadge(file)}
            <Badge variant="outline" className="text-xs">
              {file.accessLevel}
            </Badge>
          </div>

          {/* Processing Progress */}
          {file.processingStatus === 'processing' && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Processing...</span>
                <span>65%</span>
              </div>
              <Progress value={65} className="h-1" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// File List Item Component
interface FileListItemProps {
  file: FileUpload;
  selected: boolean;
  onSelect: (selected: boolean) => void;
  onPreview: () => void;
  onDelete: () => void;
  onShowDetails: () => void;
  userRole: string;
  enableSelection: boolean;
}

function FileListItem({
  file,
  selected,
  onSelect,
  onPreview,
  onDelete,
  onShowDetails,
  userRole,
  enableSelection,
}: FileListItemProps) {
  const FileIcon = getFileIcon(file.fileType);

  return (
    <Card
      className={cn(
        'group cursor-pointer transition-all hover:shadow-sm',
        selected && 'ring-2 ring-blue-500'
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Selection Checkbox */}
          {enableSelection && (
            <Checkbox checked={selected} onCheckedChange={onSelect} />
          )}

          {/* File Icon/Thumbnail */}
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
            {file.thumbnailPath ? (
              <img
                src={file.thumbnailPath}
                alt={file.originalName}
                className="h-full w-full rounded-lg object-cover"
              />
            ) : (
              <FileIcon className="h-6 w-6 text-muted-foreground" />
            )}
          </div>

          {/* File Info */}
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <h4 className="truncate font-medium" title={file.originalName}>
                {file.originalName}
              </h4>
              {getStatusBadge(file)}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{formatFileSize(file.fileSize)}</span>
              <span>{formatDate(file.createdAt)}</span>
              <Badge variant="outline" className="text-xs">
                {file.accessLevel}
              </Badge>
            </div>
          </div>

          {/* Processing Progress */}
          {file.processingStatus === 'processing' && (
            <div className="w-32">
              <div className="mb-1 flex justify-between text-xs">
                <span>Processing</span>
                <span>65%</span>
              </div>
              <Progress value={65} className="h-1" />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button variant="ghost" size="sm" onClick={onPreview}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onShowDetails}>
              <Edit className="h-4 w-4" />
            </Button>
            {(userRole === 'admin' || userRole === 'teacher') && (
              <Button variant="ghost" size="sm" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to get file icon
function getFileIcon(fileType: FileType) {
  switch (fileType) {
    case 'image':
      return ImageIcon;
    case 'video':
      return Video;
    case 'audio':
      return Music;
    case 'document':
      return FileText;
    case 'archive':
      return Archive;
    default:
      return FileText;
  }
}

// Helper function to get status badge
function getStatusBadge(file: FileUpload) {
  if (file.processingStatus === 'processing') {
    return (
      <Badge variant="outline" className="text-blue-600">
        <Clock className="mr-1 h-3 w-3" />
        Processing
      </Badge>
    );
  }
  if (file.processingStatus === 'failed') {
    return (
      <Badge variant="destructive">
        <AlertTriangle className="mr-1 h-3 w-3" />
        Failed
      </Badge>
    );
  }
  if (file.processingStatus === 'completed') {
    return (
      <Badge variant="secondary" className="text-green-600">
        <CheckCircle className="mr-1 h-3 w-3" />
        Ready
      </Badge>
    );
  }
  return <Badge variant="outline">Pending</Badge>;
}

export default FileManagementDashboard;
