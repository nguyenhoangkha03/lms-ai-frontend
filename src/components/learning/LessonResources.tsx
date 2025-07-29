'use client';

import { useGetLessonResourcesQuery } from '@/lib/redux/api/learning-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  ExternalLink,
  Eye,
  Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Separator } from '../ui/separator';

interface LessonResourcesProps {
  lessonId: string;
  className?: string;
}

export function LessonResources({ lessonId, className }: LessonResourcesProps) {
  const {
    data: resources,
    isLoading,
    error,
  } = useGetLessonResourcesQuery(lessonId);

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-5 w-5" />;
    if (type.startsWith('video/')) return <Video className="h-5 w-5" />;
    if (type.startsWith('audio/')) return <Music className="h-5 w-5" />;
    if (type.includes('pdf')) return <FileText className="h-5 w-5" />;
    if (type.includes('zip') || type.includes('rar'))
      return <Archive className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeColor = (type: string) => {
    if (type.startsWith('image/')) return 'bg-green-100 text-green-800';
    if (type.startsWith('video/')) return 'bg-red-100 text-red-800';
    if (type.startsWith('audio/')) return 'bg-purple-100 text-purple-800';
    if (type.includes('pdf')) return 'bg-red-100 text-red-800';
    if (type.includes('zip') || type.includes('rar'))
      return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success('Tải xuống thành công!');
    } catch (error) {
      toast.error('Không thể tải xuống tệp');
    }
  };

  const handlePreview = (url: string) => {
    window.open(url, '_blank');
  };

  if (error) {
    return (
      <div className={cn('py-8 text-center', className)}>
        <p className="mb-2 text-red-600">Không thể tải tài liệu</p>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          size="sm"
        >
          Thử lại
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded bg-gray-200"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                    <div className="h-3 w-1/2 rounded bg-gray-200"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (
    !resources ||
    (resources.attachments.length === 0 &&
      !resources.transcript &&
      (!resources.subtitles || resources.subtitles.length === 0))
  ) {
    return (
      <div className={cn('py-12 text-center', className)}>
        <Download className="mx-auto mb-3 h-12 w-12 text-gray-300" />
        <p className="mb-2 text-gray-500">Không có tài liệu đính kèm</p>
        <p className="text-sm text-gray-400">Tài liệu sẽ được cập nhật sau</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Attachments */}
      {resources.attachments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Tài liệu đính kèm ({resources.attachments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {resources.attachments.map(attachment => (
              <div
                key={attachment.id}
                className="flex items-center gap-4 rounded-lg border p-3 transition-colors hover:bg-gray-50"
              >
                <div
                  className={cn(
                    'rounded-lg p-2',
                    getFileTypeColor(attachment.type)
                  )}
                >
                  {getFileIcon(attachment.type)}
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-sm font-medium">
                    {attachment.name}
                  </h4>
                  <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                    <span>{formatFileSize(attachment.size)}</span>
                    <Badge variant="outline" className="text-xs">
                      {attachment.type.split('/')[1]?.toUpperCase() || 'FILE'}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreview(attachment.url)}
                  >
                    <Eye className="mr-1 h-4 w-4" />
                    Xem
                  </Button>

                  {attachment.downloadable && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleDownload(attachment.url, attachment.name)
                      }
                    >
                      <Download className="mr-1 h-4 w-4" />
                      Tải
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Subtitles */}
      {resources.subtitles && resources.subtitles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Phụ đề
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {resources.subtitles.map((subtitle, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="text-sm font-medium">
                      {subtitle.language === 'vi'
                        ? 'Tiếng Việt'
                        : subtitle.language === 'en'
                          ? 'English'
                          : subtitle.language}
                    </div>
                    <div className="text-xs text-gray-500">Phụ đề video</div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleDownload(
                      subtitle.url,
                      `subtitles_${subtitle.language}.vtt`
                    )
                  }
                >
                  <Download className="mr-1 h-4 w-4" />
                  Tải
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Additional Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Tài nguyên bổ sung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h4 className="mb-2 font-medium text-blue-800">Hỗ trợ học tập</h4>
              <p className="mb-3 text-sm text-blue-700">
                Cần hỗ trợ thêm? Liên hệ với giảng viên hoặc tham gia diễn đàn
                thảo luận.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="border-blue-300 text-blue-700"
              >
                <ExternalLink className="mr-1 h-4 w-4" />
                Diễn đàn
              </Button>
            </div>

            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <h4 className="mb-2 font-medium text-green-800">
                Thực hành thêm
              </h4>
              <p className="mb-3 text-sm text-green-700">
                Củng cố kiến thức với các bài tập và tài liệu bổ sung.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="border-green-300 text-green-700"
              >
                <ExternalLink className="mr-1 h-4 w-4" />
                Bài tập
              </Button>
            </div>
          </div>

          <Separator />

          <div className="text-center text-sm text-gray-500">
            <p>💡 Mẹo: Tải xuống tài liệu để học offline khi không có mạng</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
