'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Download,
  Settings,
  Monitor,
  Pause,
  Play,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Move,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Slider } from '@/components/ui/slider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';

import type { VideoParticipant } from '@/lib/types/live-teaching';

interface ScreenShareDisplayProps {
  participant: VideoParticipant;
  onClose: () => void;
  className?: string;
}

interface ViewState {
  zoom: number;
  panX: number;
  panY: number;
  isPanning: boolean;
  isFullscreen: boolean;
}

export function ScreenShareDisplay({
  participant,
  onClose,
  className,
}: ScreenShareDisplayProps) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // State
  const [viewState, setViewState] = useState<ViewState>({
    zoom: 1,
    panX: 0,
    panY: 0,
    isPanning: false,
    isFullscreen: false,
  });
  const [volume, setVolume] = useState([100]);
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [quality, setQuality] = useState<'auto' | 'high' | 'medium' | 'low'>(
    'auto'
  );

  // Auto-hide controls
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimeout = () => {
      setShowControls(true);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    const handleMouseMove = () => resetTimeout();
    const handleKeyPress = () => resetTimeout();

    if (containerRef.current) {
      containerRef.current.addEventListener('mousemove', handleMouseMove);
      containerRef.current.addEventListener('keypress', handleKeyPress);
    }

    resetTimeout();

    return () => {
      clearTimeout(timeoutId);
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousemove', handleMouseMove);
        containerRef.current.removeEventListener('keypress', handleKeyPress);
      }
    };
  }, []);

  // Zoom controls
  const handleZoom = useCallback((delta: number) => {
    setViewState(prev => ({
      ...prev,
      zoom: Math.max(0.5, Math.min(3, prev.zoom + delta)),
    }));
  }, []);

  const resetView = useCallback(() => {
    setViewState(prev => ({
      ...prev,
      zoom: 1,
      panX: 0,
      panY: 0,
    }));
  }, []);

  // Pan controls
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      // Left click
      setViewState(prev => ({ ...prev, isPanning: true }));
    }
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (viewState.isPanning) {
        setViewState(prev => ({
          ...prev,
          panX: prev.panX + e.movementX,
          panY: prev.panY + e.movementY,
        }));
      }
    },
    [viewState.isPanning]
  );

  const handleMouseUp = useCallback(() => {
    setViewState(prev => ({ ...prev, isPanning: false }));
  }, []);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setViewState(prev => ({ ...prev, isFullscreen: true }));
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
      setViewState(prev => ({ ...prev, isFullscreen: false }));
    }
  }, []);

  // Volume control
  const handleVolumeChange = useCallback((newVolume: number[]) => {
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume[0] / 100;
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  }, [isMuted]);

  // Playback control
  const togglePlayback = useCallback(() => {
    if (videoRef.current) {
      if (isPaused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
      setIsPaused(!isPaused);
    }
  }, [isPaused]);

  // Quality control
  const handleQualityChange = useCallback(
    (newQuality: typeof quality) => {
      setQuality(newQuality);
      // In a real implementation, this would send a request to change stream quality
      toast({
        title: 'Quality Changed',
        description: `Screen share quality set to ${newQuality}.`,
      });
    },
    [toast]
  );

  // Take screenshot
  const takeScreenshot = useCallback(() => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);

    // Download the screenshot
    canvas.toBlob(blob => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `screen-share-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: 'Screenshot Saved',
          description: 'Screen share screenshot has been downloaded.',
        });
      }
    });
  }, [toast]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        'fixed inset-4 z-50 overflow-hidden rounded-lg bg-black shadow-2xl',
        viewState.isFullscreen && 'inset-0 rounded-none',
        className
      )}
      ref={containerRef}
    >
      {/* Video Stream */}
      <div className="relative h-full w-full">
        <video
          ref={videoRef}
          className={cn(
            'h-full w-full object-contain transition-transform duration-200',
            viewState.isPanning && 'cursor-grabbing'
          )}
          style={{
            transform: `scale(${viewState.zoom}) translate(${viewState.panX / viewState.zoom}px, ${viewState.panY / viewState.zoom}px)`,
            cursor:
              viewState.zoom > 1
                ? viewState.isPanning
                  ? 'grabbing'
                  : 'grab'
                : 'default',
          }}
          autoPlay
          playsInline
          muted={isMuted}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />

        {/* Presenter Info Overlay */}
        <div className="absolute left-4 top-4 z-10">
          <Card className="border-gray-600 bg-black/70 backdrop-blur">
            <CardContent className="p-3">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={participant.user.avatar} />
                  <AvatarFallback>
                    {participant.user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-white">
                    {participant.user.name}
                  </p>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      <Monitor className="mr-1 h-3 w-3" />
                      Presenting
                    </Badge>
                    <div
                      className={cn(
                        'h-2 w-2 rounded-full',
                        participant.networkQuality === 'excellent' &&
                          'bg-green-400',
                        participant.networkQuality === 'good' &&
                          'bg-yellow-400',
                        participant.networkQuality === 'fair' &&
                          'bg-orange-400',
                        participant.networkQuality === 'poor' && 'bg-red-400'
                      )}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quality Indicator */}
        <div className="absolute right-4 top-4 z-10">
          <Badge variant="outline" className="bg-black/70 backdrop-blur">
            {quality.toUpperCase()}
          </Badge>
        </div>

        {/* Controls Overlay */}
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6"
          >
            <div className="flex items-center justify-between">
              {/* Left Controls */}
              <div className="flex items-center space-x-2">
                {/* Play/Pause */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={togglePlayback}
                      className="text-white hover:bg-white/20"
                    >
                      {isPaused ? (
                        <Play className="h-4 w-4" />
                      ) : (
                        <Pause className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isPaused ? 'Resume' : 'Pause'}
                  </TooltipContent>
                </Tooltip>

                {/* Volume Control */}
                <div className="flex items-center space-x-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleMute}
                        className="text-white hover:bg-white/20"
                      >
                        {isMuted ? (
                          <VolumeX className="h-4 w-4" />
                        ) : (
                          <Volume2 className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isMuted ? 'Unmute' : 'Mute'}
                    </TooltipContent>
                  </Tooltip>

                  <div className="w-20">
                    <Slider
                      value={volume}
                      onValueChange={handleVolumeChange}
                      max={100}
                      step={1}
                      className="slider-white"
                    />
                  </div>
                </div>
              </div>

              {/* Center Controls */}
              <div className="flex items-center space-x-2">
                {/* Zoom Out */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleZoom(-0.2)}
                      disabled={viewState.zoom <= 0.5}
                      className="text-white hover:bg-white/20"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Zoom Out</TooltipContent>
                </Tooltip>

                {/* Zoom Level */}
                <div className="min-w-[60px] text-center text-sm font-medium text-white">
                  {Math.round(viewState.zoom * 100)}%
                </div>

                {/* Zoom In */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleZoom(0.2)}
                      disabled={viewState.zoom >= 3}
                      className="text-white hover:bg-white/20"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Zoom In</TooltipContent>
                </Tooltip>

                {/* Reset View */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetView}
                      className="text-white hover:bg-white/20"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Reset View</TooltipContent>
                </Tooltip>
              </div>

              {/* Right Controls */}
              <div className="flex items-center space-x-2">
                {/* Screenshot */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={takeScreenshot}
                      className="text-white hover:bg-white/20"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Take Screenshot</TooltipContent>
                </Tooltip>

                {/* Settings */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="px-2 py-1.5 text-sm font-semibold">
                      Quality
                    </div>
                    <DropdownMenuItem
                      onClick={() => handleQualityChange('auto')}
                      className={quality === 'auto' ? 'bg-blue-500/20' : ''}
                    >
                      Auto
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleQualityChange('high')}
                      className={quality === 'high' ? 'bg-blue-500/20' : ''}
                    >
                      High (1080p)
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleQualityChange('medium')}
                      className={quality === 'medium' ? 'bg-blue-500/20' : ''}
                    >
                      Medium (720p)
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleQualityChange('low')}
                      className={quality === 'low' ? 'bg-blue-500/20' : ''}
                    >
                      Low (480p)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Fullscreen */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleFullscreen}
                      className="text-white hover:bg-white/20"
                    >
                      {viewState.isFullscreen ? (
                        <Minimize2 className="h-4 w-4" />
                      ) : (
                        <Maximize2 className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {viewState.isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                  </TooltipContent>
                </Tooltip>

                {/* Close */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClose}
                      className="text-white hover:bg-white/20"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Close</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </motion.div>
        )}

        {/* Pan Hint */}
        {viewState.zoom > 1 && showControls && (
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
            <div className="flex items-center space-x-2 rounded-lg bg-black/70 p-3 text-sm text-white backdrop-blur">
              <Move className="h-4 w-4" />
              <span>Click and drag to pan</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
