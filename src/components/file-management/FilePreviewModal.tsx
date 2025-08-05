'use client';

import React, { useState } from 'react';
import {
  X,
  Download,
  Share2,
  Eye,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import { FileUpload } from '@/lib/types/file-management';
import { formatFileSize, formatDate } from '@/lib/utils';

interface FilePreviewModalProps {
  file: FileUpload | null;
  open: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

export function FilePreviewModal({
  file,
  open,
  onClose,
  onNext,
  onPrevious,
}: FilePreviewModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([80]);
  const [isMuted, setIsMuted] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  if (!file) return null;

  const handleDownload = () => {
    if (file.downloadUrl) {
      window.open(file.downloadUrl, '_blank');
    }
  };

  const handleShare = () => {
    if (navigator.share && file.fileUrl) {
      navigator.share({
        title: file.originalName,
        url: file.fileUrl,
      });
    }
  };

  const renderPreviewContent = () => {
    switch (file.fileType) {
      case 'image':
        return (
          <div className="relative flex min-h-[400px] items-center justify-center rounded-lg bg-black/5">
            <img
              src={file.fileUrl}
              alt={file.originalName}
              className="max-h-[70vh] max-w-full object-contain"
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transition: 'transform 0.2s ease',
              }}
            />

            {/* Image Controls */}
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 transform items-center gap-2 rounded-lg bg-black/70 p-2">
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={() => setZoom(Math.max(25, zoom - 25))}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="px-2 text-sm text-white">{zoom}%</span>
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={() => setZoom(Math.min(400, zoom + 25))}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Separator orientation="vertical" className="h-4 bg-white/30" />
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={() => setRotation((rotation + 90) % 360)}
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      case 'video':
        return (
          <div className="relative overflow-hidden rounded-lg bg-black">
            <video
              className="max-h-[70vh] w-full"
              controls
              preload="metadata"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            >
              <source
                src={file.streamingUrl || file.fileUrl}
                type={file.mimeType}
              />
              Your browser does not support the video tag.
            </video>
          </div>
        );

      case 'audio':
        return (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 p-8">
            <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-blue-500">
              <Volume2 className="h-16 w-16 text-white" />
            </div>

            <h3 className="mb-2 text-xl font-semibold">{file.originalName}</h3>
            {file.duration && (
              <p className="mb-6 text-muted-foreground">
                Duration: {Math.floor(file.duration / 60)}:
                {(file.duration % 60).toString().padStart(2, '0')}
              </p>
            )}

            <audio
              className="w-full max-w-md"
              controls
              preload="metadata"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            >
              <source src={file.fileUrl} type={file.mimeType} />
              Your browser does not support the audio tag.
            </audio>

            {/* Custom Audio Controls */}
            <div className="mt-4 flex w-full max-w-md items-center gap-4">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>

              <div className="flex-1">
                <Slider
                  value={volume}
                  onValueChange={setVolume}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              <span className="w-8 text-sm text-muted-foreground">
                {volume[0]}%
              </span>
            </div>
          </div>
        );

      case 'document':
        return (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg bg-gray-50 p-8">
            <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-lg bg-red-100">
              <Eye className="h-12 w-12 text-red-600" />
            </div>

            <h3 className="mb-2 text-xl font-semibold">{file.originalName}</h3>
            <p className="mb-6 text-center text-muted-foreground">
              This document type cannot be previewed directly in the browser.
            </p>

            <div className="flex gap-2">
              <Button onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download to View
              </Button>
              {file.fileUrl && (
                <Button
                  variant="outline"
                  onClick={() => window.open(file.fileUrl, '_blank')}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Open in New Tab
                </Button>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg bg-gray-50 p-8">
            <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-lg bg-gray-100">
              <Eye className="h-12 w-12 text-gray-600" />
            </div>

            <h3 className="mb-2 text-xl font-semibold">{file.originalName}</h3>
            <p className="mb-6 text-center text-muted-foreground">
              Preview not available for this file type.
            </p>

            <Button onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download File
            </Button>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-5xl p-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <DialogTitle className="truncate" title={file.originalName}>
                {file.originalName}
              </DialogTitle>
              <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                <span>{formatFileSize(file.fileSize)}</span>
                <span>•</span>
                <span>{formatDate(file.createdAt)}</span>
                <Badge variant="outline">{file.fileType}</Badge>
                <Badge variant="outline">{file.accessLevel}</Badge>
              </div>
            </div>

            <div className="ml-4 flex items-center gap-2">
              {/* Navigation */}
              {onPrevious && (
                <Button size="sm" variant="ghost" onClick={onPrevious}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
              {onNext && (
                <Button size="sm" variant="ghost" onClick={onNext}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}

              <Separator orientation="vertical" className="h-4" />

              {/* Actions */}
              <Button size="sm" variant="ghost" onClick={handleDownload}>
                <Download className="h-4 w-4" />
              </Button>

              <Button size="sm" variant="ghost" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>

              <Button size="sm" variant="ghost" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Preview Content */}
        <div className="p-6 pt-4">{renderPreviewContent()}</div>

        {/* File Metadata */}
        <div className="border-t bg-muted/30 p-6">
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
            <div>
              <h4 className="mb-2 font-medium">File Information</h4>
              <div className="space-y-1 text-muted-foreground">
                <p>Type: {file.mimeType}</p>
                <p>Size: {formatFileSize(file.fileSize)}</p>
                {file.duration && (
                  <p>
                    Duration: {Math.floor(file.duration / 60)}:
                    {(file.duration % 60).toString().padStart(2, '0')}
                  </p>
                )}
                {file.resolution && <p>Resolution: {file.resolution}</p>}
              </div>
            </div>

            <div>
              <h4 className="mb-2 font-medium">Upload Details</h4>
              <div className="space-y-1 text-muted-foreground">
                <p>Uploaded: {formatDate(file.createdAt)}</p>
                {file.updatedAt !== file.createdAt && (
                  <p>Modified: {formatDate(file.updatedAt)}</p>
                )}
                <p>Access: {file.accessLevel}</p>
              </div>
            </div>

            <div>
              <h4 className="mb-2 font-medium">Usage Stats</h4>
              <div className="space-y-1 text-muted-foreground">
                <p>Downloads: {file.downloadCount}</p>
                <p>Views: {file.viewCount}</p>
                {file.lastViewedAt && (
                  <p>Last viewed: {formatDate(file.lastViewedAt)}</p>
                )}
              </div>
            </div>
          </div>

          {/* Tags */}
          {file.metadata?.tags && file.metadata.tags.length > 0 && (
            <div className="mt-4">
              <h4 className="mb-2 font-medium">Tags</h4>
              <div className="flex flex-wrap gap-1">
                {file.metadata.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {file.metadata?.description && (
            <div className="mt-4">
              <h4 className="mb-2 font-medium">Description</h4>
              <p className="text-sm text-muted-foreground">
                {file.metadata.description}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
