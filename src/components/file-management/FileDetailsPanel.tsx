'use client';

import React, { useState } from 'react';
import {
  X,
  Save,
  Edit3,
  Eye,
  Download,
  Share2,
  Clock,
  User,
  Tag,
  FileText,
  Settings,
  Shield,
  BarChart3,
  RefreshCw,
} from 'lucide-react';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { useUpdateFileMetadataMutation } from '@/lib/redux/api/file-management-api';
import { FileUpload, FileAccessLevel } from '@/lib/types/file-management';
import { formatFileSize, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

interface FileDetailsPanelProps {
  file: FileUpload | null;
  open: boolean;
  onClose: () => void;
  onFileUpdate: (file: FileUpload) => void;
}

export function FileDetailsPanel({
  file,
  open,
  onClose,
  onFileUpdate,
}: FileDetailsPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    category: '',
    accessLevel: 'enrolled_only' as FileAccessLevel,
    isPublic: false,
    allowDownload: true,
    allowSharing: true,
  });

  // Initialize form data when file changes
  React.useEffect(() => {
    if (file) {
      setFormData({
        title: file.metadata?.title || file.originalName,
        description: file.metadata?.description || '',
        tags: file.metadata?.tags?.join(', ') || '',
        category: file.metadata?.category || '',
        accessLevel: file.accessLevel,
        isPublic: file.isPublic,
        allowDownload: file.settings?.allowDownload ?? true,
        allowSharing: file.settings?.allowSharing ?? true,
      });
    }
  }, [file]);

  const [updateFileMetadata, { isLoading: isUpdating }] =
    useUpdateFileMetadataMutation();

  if (!file) return null;

  const handleSave = async () => {
    try {
      const updatedFile = await updateFileMetadata({
        id: file.id,
        data: {
          accessLevel: formData.accessLevel,
          isPublic: formData.isPublic,
          metadata: {
            ...file.metadata,
            title: formData.title,
            description: formData.description,
            tags: formData.tags
              .split(',')
              .map(tag => tag.trim())
              .filter(Boolean),
            category: formData.category,
          },
          settings: {
            ...file.settings,
            allowDownload: formData.allowDownload,
            allowSharing: formData.allowSharing,
          },
        },
      }).unwrap();

      onFileUpdate(updatedFile);
      setIsEditing(false);
      toast.success('File updated successfully');
    } catch (error) {
      toast.error('Failed to update file');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data
    setFormData({
      title: file.metadata?.title || file.originalName,
      description: file.metadata?.description || '',
      tags: file.metadata?.tags?.join(', ') || '',
      category: file.metadata?.category || '',
      accessLevel: file.accessLevel,
      isPublic: file.isPublic,
      allowDownload: file.settings?.allowDownload ?? true,
      allowSharing: file.settings?.allowSharing ?? true,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <SheetTitle className="truncate" title={file.originalName}>
                {file.originalName}
              </SheetTitle>
              <SheetDescription>
                {formatFileSize(file.fileSize)} • {formatDate(file.createdAt)}
              </SheetDescription>
            </div>

            <div className="ml-4 flex items-center gap-2">
              {!isEditing ? (
                <Button size="sm" onClick={() => setIsEditing(true)}>
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              ) : (
                <>
                  <Button size="sm" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={isUpdating}>
                    {isUpdating ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save
                  </Button>
                </>
              )}
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="stats">Stats</TabsTrigger>
              <TabsTrigger value="versions">Versions</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-6 space-y-6">
              {/* File Preview */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {file.thumbnailPath ? (
                      <img
                        src={file.thumbnailPath}
                        alt={file.originalName}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-medium">
                        {file.originalName}
                      </h3>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="outline">{file.fileType}</Badge>
                        <Badge variant="outline">{file.accessLevel}</Badge>
                        {file.processingStatus === 'completed' && (
                          <Badge variant="secondary" className="text-green-600">
                            Ready
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <Button size="sm" variant="outline">
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      disabled={!isEditing}
                      rows={3}
                      placeholder="Enter file description..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, tags: e.target.value }))
                      }
                      disabled={!isEditing}
                      placeholder="Enter tags separated by commas"
                    />
                    <p className="text-xs text-muted-foreground">
                      Separate tags with commas (e.g., education, video,
                      tutorial)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={value =>
                        setFormData(prev => ({ ...prev, category: value }))
                      }
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="lesson">Lesson Material</SelectItem>
                        <SelectItem value="assignment">Assignment</SelectItem>
                        <SelectItem value="resource">Resource</SelectItem>
                        <SelectItem value="media">Media</SelectItem>
                        <SelectItem value="certificate">Certificate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Technical Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Technical Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                    <div>
                      <Label className="text-muted-foreground">File Type</Label>
                      <p className="font-medium">{file.mimeType}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">File Size</Label>
                      <p className="font-medium">
                        {formatFileSize(file.fileSize)}
                      </p>
                    </div>
                    {file.resolution && (
                      <div>
                        <Label className="text-muted-foreground">
                          Resolution
                        </Label>
                        <p className="font-medium">{file.resolution}</p>
                      </div>
                    )}
                    {file.duration && (
                      <div>
                        <Label className="text-muted-foreground">
                          Duration
                        </Label>
                        <p className="font-medium">
                          {Math.floor(file.duration / 60)}:
                          {(file.duration % 60).toString().padStart(2, '0')}
                        </p>
                      </div>
                    )}
                    <div>
                      <Label className="text-muted-foreground">Checksum</Label>
                      <p className="break-all font-mono text-xs">
                        {file.checksum}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Extension</Label>
                      <p className="font-medium">{file.extension}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="mt-6 space-y-6">
              {/* Access Control */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Shield className="h-5 w-5" />
                    Access Control
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Access Level</Label>
                    <Select
                      value={formData.accessLevel}
                      onValueChange={value =>
                        setFormData(prev => ({
                          ...prev,
                          accessLevel: value as FileAccessLevel,
                        }))
                      }
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">
                          Public - Anyone can access
                        </SelectItem>
                        <SelectItem value="enrolled_only">
                          Enrolled Only - Course students only
                        </SelectItem>
                        <SelectItem value="premium_only">
                          Premium Only - Premium members only
                        </SelectItem>
                        <SelectItem value="private">
                          Private - Restricted access
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Public File</Label>
                      <p className="text-sm text-muted-foreground">
                        Make this file publicly accessible
                      </p>
                    </div>
                    <Switch
                      checked={formData.isPublic}
                      onCheckedChange={checked =>
                        setFormData(prev => ({ ...prev, isPublic: checked }))
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* File Permissions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Settings className="h-5 w-5" />
                    Permissions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Allow Downloads</Label>
                      <p className="text-sm text-muted-foreground">
                        Users can download this file
                      </p>
                    </div>
                    <Switch
                      checked={formData.allowDownload}
                      onCheckedChange={checked =>
                        setFormData(prev => ({
                          ...prev,
                          allowDownload: checked,
                        }))
                      }
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Allow Sharing</Label>
                      <p className="text-sm text-muted-foreground">
                        Users can share this file with others
                      </p>
                    </div>
                    <Switch
                      checked={formData.allowSharing}
                      onCheckedChange={checked =>
                        setFormData(prev => ({
                          ...prev,
                          allowSharing: checked,
                        }))
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Processing Status */}
              {file.processingStatus !== 'completed' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Processing Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-3 w-3 rounded-full ${
                          file.processingStatus === 'processing'
                            ? 'animate-pulse bg-blue-500'
                            : file.processingStatus === 'failed'
                              ? 'bg-red-500'
                              : file.processingStatus === 'pending'
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                        }`}
                      />
                      <span className="capitalize">
                        {file.processingStatus}
                      </span>
                      {file.processingStatus === 'failed' &&
                        file.processingError && (
                          <Alert variant="destructive" className="mt-2">
                            <AlertDescription>
                              {file.processingError}
                            </AlertDescription>
                          </Alert>
                        )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="stats" className="mt-6 space-y-6">
              {/* Usage Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="h-5 w-5" />
                    Usage Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border p-4 text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {file.downloadCount}
                      </p>
                      <p className="text-sm text-muted-foreground">Downloads</p>
                    </div>
                    <div className="rounded-lg border p-4 text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {file.viewCount}
                      </p>
                      <p className="text-sm text-muted-foreground">Views</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    {file.lastDownloadedAt && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Last Downloaded:
                        </span>
                        <span>{formatDate(file.lastDownloadedAt)}</span>
                      </div>
                    )}
                    {file.lastViewedAt && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Last Viewed:
                        </span>
                        <span>{formatDate(file.lastViewedAt)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* File History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="h-5 w-5" />
                    File History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-muted-foreground">Created:</span>
                      <span>{formatDate(file.createdAt)}</span>
                    </div>
                    {file.updatedAt !== file.createdAt && (
                      <div className="flex items-center gap-3 text-sm">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        <span className="text-muted-foreground">
                          Last Modified:
                        </span>
                        <span>{formatDate(file.updatedAt)}</span>
                      </div>
                    )}
                    {file.processingCompletedAt && (
                      <div className="flex items-center gap-3 text-sm">
                        <div className="h-2 w-2 rounded-full bg-purple-500" />
                        <span className="text-muted-foreground">
                          Processing Completed:
                        </span>
                        <span>{formatDate(file.processingCompletedAt)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="versions" className="mt-6 space-y-6">
              {/* File Versions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">File Versions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium">Current Version</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(file.updatedAt)}
                        </p>
                      </div>
                      <Badge>Active</Badge>
                    </div>

                    {/* Mock previous versions */}
                    <div className="py-8 text-center text-muted-foreground">
                      <p>No previous versions available</p>
                      <p className="mt-1 text-xs">
                        File versions will appear here when the file is updated
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
