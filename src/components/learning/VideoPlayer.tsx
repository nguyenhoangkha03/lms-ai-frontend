'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useAppSelector } from '@/lib/redux/hooks';
import {
  useUpdateVideoPositionMutation,
  useGetVideoPositionQuery,
  useTrackLearningActivityMutation,
  useCreateBookmarkMutation,
} from '@/lib/redux/api/learning-api';
import {
  VideoPlayerState,
  VideoControls,
  PlayerSettings,
} from '@/types/learning';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Settings,
  Bookmark,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface VideoPlayerProps {
  lessonId: string;
  videoUrl: string;
  sessionId?: string;
  thumbnailUrl?: string;
  subtitles?: Array<{
    language: string;
    url: string;
  }>;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  className?: string;
  autoplay?: boolean;
}

// Helper function to detect and convert YouTube URLs
const getVideoInfo = (url: string) => {
  const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
  const match = url.match(youtubeRegex);
  
  if (match) {
    const videoId = match[1];
    return {
      isYouTube: true,
      videoId,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    };
  }
  
  return {
    isYouTube: false,
    videoId: null,
    embedUrl: url,
    thumbnailUrl: null
  };
};

export function VideoPlayer({
  lessonId,
  videoUrl,
  sessionId,
  thumbnailUrl,
  subtitles = [],
  onProgress,
  onComplete,
  className,
  autoplay = false,
}: VideoPlayerProps) {
  const videoInfo = getVideoInfo(videoUrl);
  const effectiveThumbnail = thumbnailUrl || videoInfo.thumbnailUrl;
  
  // Get current user from Redux store
  const { user } = useAppSelector(state => state.auth) || {};

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  const [state, setState] = useState<VideoPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
    playbackRate: 1,
    quality: 'auto',
    isFullscreen: false,
    isLoading: true,
  });

  const [showControls, setShowControls] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [buffered, setBuffered] = useState(0);

  const { data: videoPosition } = useGetVideoPositionQuery(lessonId);
  const [updateVideoPosition] = useUpdateVideoPositionMutation();
  const [trackActivity] = useTrackLearningActivityMutation();
  const [createBookmark] = useCreateBookmarkMutation();

  // Player settings
  const [settings, setSettings] = useState<PlayerSettings>({
    autoplay: autoplay,
    playbackRate: 1,
    quality: 'auto',
    volume: 1,
    subtitles: {
      enabled: false,
      language: 'vi',
      fontSize: 16,
      backgroundColor: 'rgba(0,0,0,0.8)',
      fontColor: '#ffffff',
    },
    shortcuts: {
      enabled: true,
      skipForward: 10,
      skipBackward: 10,
    },
    resumePosition: true,
  });

  // Video controls
  const controls: VideoControls = {
    play: useCallback(() => {
      if (videoRef.current) {
        videoRef.current.play().catch(console.error);
        trackActivity({
          studentId: user?.id,
          sessionId,
          lessonId,
          activityType: state.currentTime > 0 ? 'video_resume' : 'video_start',
          metadata: { timestamp: state.currentTime },
        }).catch(console.error);
      }
    }, [lessonId, state.currentTime, trackActivity, user?.id, sessionId]),

    pause: useCallback(() => {
      if (videoRef.current) {
        videoRef.current.pause();
        trackActivity({
          studentId: user?.id,
          sessionId,
          lessonId,
          activityType: 'video_pause',
          metadata: { timestamp: state.currentTime },
        }).catch(console.error);
      }
    }, [lessonId, state.currentTime, trackActivity, user?.id, sessionId]),

    seek: useCallback((time: number) => {
      if (videoRef.current) {
        const oldTime = videoRef.current.currentTime;
        videoRef.current.currentTime = time;
        setState(prev => ({ ...prev, currentTime: time }));
        
        // Track seek activity
        trackActivity({
          studentId: user?.id,
          sessionId,
          lessonId,
          activityType: 'video_seek',
          metadata: { 
            fromTime: oldTime,
            toTime: time,
            seekDistance: Math.abs(time - oldTime)
          },
        }).catch(console.error);
      }
    }, [lessonId, trackActivity, user?.id, sessionId]),

    setVolume: useCallback((volume: number) => {
      if (videoRef.current) {
        videoRef.current.volume = volume;
        setState(prev => ({ ...prev, volume, isMuted: volume === 0 }));
      }
    }, []),

    setPlaybackRate: useCallback((rate: number) => {
      if (videoRef.current) {
        const oldRate = videoRef.current.playbackRate;
        videoRef.current.playbackRate = rate;
        setState(prev => ({ ...prev, playbackRate: rate }));
        
        // Track speed change
        trackActivity({
          studentId: user?.id,
          sessionId,
          lessonId,
          activityType: 'video_speed_change',
          metadata: { 
            fromSpeed: oldRate,
            toSpeed: rate
          },
        }).catch(console.error);
      }
    }, [lessonId, trackActivity, user?.id, sessionId]),

    setQuality: useCallback((quality: string) => {
      const oldQuality = state.quality;
      setState(prev => ({ ...prev, quality }));
      
      // Track quality change
      trackActivity({
        studentId: user?.id,
        sessionId,
        lessonId,
        activityType: 'video_quality_change',
        metadata: { 
          fromQuality: oldQuality,
          toQuality: quality
        },
      }).catch(console.error);
    }, [lessonId, state.quality, trackActivity, user?.id, sessionId]),

    toggleFullscreen: useCallback(() => {
      if (!document.fullscreenElement) {
        containerRef.current?.requestFullscreen().catch(console.error);
        setState(prev => ({ ...prev, isFullscreen: true }));
      } else {
        document.exitFullscreen().catch(console.error);
        setState(prev => ({ ...prev, isFullscreen: false }));
      }
    }, []),

    toggleMute: useCallback(() => {
      if (videoRef.current) {
        const newMuted = !state.isMuted;
        videoRef.current.muted = newMuted;
        setState(prev => ({ ...prev, isMuted: newMuted }));
      }
    }, [state.isMuted]),
  };

  // Video event handlers
  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setState(prev => ({
        ...prev,
        duration: videoRef.current!.duration,
        isLoading: false,
      }));

      // Resume from saved position
      if (settings.resumePosition && videoPosition?.position) {
        videoRef.current.currentTime = videoPosition.position;
      }

      // Auto play if enabled
      if (settings.autoplay) {
        controls.play();
      }
    }
  }, [
    settings.resumePosition,
    settings.autoplay,
    videoPosition?.position,
    controls,
  ]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current && !isDragging) {
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      const progress = (currentTime / duration) * 100;

      setState(prev => ({ ...prev, currentTime }));
      onProgress?.(progress);

      // Update progress every 10 seconds
      if (Math.floor(currentTime) % 10 === 0) {
        updateVideoPosition({
          lessonId,
          position: currentTime,
          duration,
        }).catch(console.error);
      }
    }
  }, [isDragging, onProgress, updateVideoPosition, lessonId]);

  const handleProgress = useCallback(() => {
    if (videoRef.current) {
      const buffered = videoRef.current.buffered;
      if (buffered.length > 0) {
        const bufferedEnd = buffered.end(buffered.length - 1);
        const duration = videoRef.current.duration;
        setBuffered((bufferedEnd / duration) * 100);
      }
    }
  }, []);

  const handleEnded = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: false }));
    trackActivity({
      studentId: user?.id,
      sessionId,
      lessonId,
      activityType: 'video_complete',
      metadata: { duration: state.duration },
    }).catch(console.error);
    onComplete?.();
  }, [lessonId, state.duration, trackActivity, onComplete, user?.id, sessionId]);

  const handlePlay = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: true }));
  }, []);

  const handlePause = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  const handleVolumeChange = useCallback(() => {
    if (videoRef.current) {
      setState(prev => ({
        ...prev,
        volume: videoRef.current!.volume,
        isMuted: videoRef.current!.muted,
      }));
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!settings.shortcuts.enabled) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          state.isPlaying ? controls.pause() : controls.play();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          controls.seek(
            Math.max(0, state.currentTime - settings.shortcuts.skipBackward)
          );
          break;
        case 'ArrowRight':
          e.preventDefault();
          controls.seek(
            Math.min(
              state.duration,
              state.currentTime + settings.shortcuts.skipForward
            )
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          controls.setVolume(Math.min(1, state.volume + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          controls.setVolume(Math.max(0, state.volume - 0.1));
          break;
        case 'KeyF':
          e.preventDefault();
          controls.toggleFullscreen();
          break;
        case 'KeyM':
          e.preventDefault();
          controls.toggleMute();
          break;
      }
    },
    [controls, settings, state]
  );

  // Show controls temporarily on mouse movement
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (state.isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  }, [state.isPlaying]);

  const handleBookmark = async () => {
    try {
      await createBookmark({
        lessonId,
        timestamp: state.currentTime,
      }).unwrap();
      toast.success('Đã tạo bookmark tại thời điểm này');
    } catch (error) {
      toast.error('Không thể tạo bookmark');
    }
  };

  // Format time display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Progress bar click handler
  const handleProgressClick = (e: React.MouseEvent) => {
    if (progressRef.current && videoRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const percentage = (e.clientX - rect.left) / rect.width;
      const newTime = percentage * state.duration;
      controls.seek(newTime);
    }
  };

  // Effects
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('progress', handleProgress);
      video.addEventListener('ended', handleEnded);
      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);
      video.addEventListener('volumechange', handleVolumeChange);

      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('progress', handleProgress);
        video.removeEventListener('ended', handleEnded);
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
        video.removeEventListener('volumechange', handleVolumeChange);
      };
    }
  }, [
    handleLoadedMetadata,
    handleTimeUpdate,
    handleProgress,
    handleEnded,
    handlePlay,
    handlePause,
    handleVolumeChange,
  ]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        'group relative overflow-hidden rounded-lg bg-black',
        state.isFullscreen && 'fixed inset-0 z-50 rounded-none',
        className
      )}
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => state.isPlaying && setShowControls(false)}
    >
      {/* Video Element */}
      {videoInfo.isYouTube ? (
        <div className="relative h-full w-full">
          <iframe
            className="h-full w-full"
            src={`${videoInfo.embedUrl}?enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}&controls=1&modestbranding=1&rel=0${autoplay ? '&autoplay=1' : ''}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{ border: 'none' }}
          />
          {/* Overlay for basic controls - YouTube iframe handles most functionality */}
          <div className="absolute right-4 top-4 z-10">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmark}
              className="text-white hover:bg-white/20 bg-black/50"
            >
              <Bookmark className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <video
          ref={videoRef}
          className="h-full w-full object-contain"
          poster={effectiveThumbnail}
          preload="metadata"
          crossOrigin="anonymous"
        >
          <source src={videoUrl} type="video/mp4" />
          {subtitles.map(subtitle => (
            <track
              key={subtitle.language}
              kind="subtitles"
              src={subtitle.url}
              srcLang={subtitle.language}
              label={
                subtitle.language === 'vi' ? 'Tiếng Việt' : subtitle.language
              }
            />
          ))}
          Trình duyệt của bạn không hỗ trợ video HTML5.
        </video>
      )}

      {/* Loading Overlay - Only for non-YouTube videos */}
      {!videoInfo.isYouTube && state.isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-white"></div>
        </div>
      )}

      {/* Controls Overlay - Only for non-YouTube videos */}
      {!videoInfo.isYouTube && (
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 transition-opacity duration-300',
            showControls ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          )}
        >
        {/* Top Controls */}
        <div className="absolute right-4 top-4 flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBookmark}
            className="text-white hover:bg-white/20"
          >
            <Bookmark className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="text-white hover:bg-white/20"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Center Play Button */}
        {!state.isPlaying && !state.isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              variant="ghost"
              size="lg"
              onClick={controls.play}
              className="h-16 w-16 rounded-full bg-white/20 text-white hover:bg-white/30"
            >
              <Play className="ml-1 h-8 w-8" />
            </Button>
          </div>
        )}

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Progress Bar */}
          <div className="mb-4">
            <div
              ref={progressRef}
              className="group/progress relative h-2 cursor-pointer rounded-full bg-white/20"
              onClick={handleProgressClick}
            >
              {/* Buffered Progress */}
              <div
                className="absolute h-full rounded-full bg-white/40"
                style={{ width: `${buffered}%` }}
              />
              {/* Watched Progress */}
              <div
                className="absolute h-full rounded-full bg-blue-500"
                style={{
                  width: `${(state.currentTime / state.duration) * 100}%`,
                }}
              />
              {/* Scrubber */}
              <div
                className="absolute -top-1 h-4 w-4 -translate-x-1/2 transform rounded-full bg-blue-500 opacity-0 transition-opacity group-hover/progress:opacity-100"
                style={{
                  left: `${(state.currentTime / state.duration) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            {/* Left Controls */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={state.isPlaying ? controls.pause : controls.play}
                className="text-white hover:bg-white/20"
              >
                {state.isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  controls.seek(
                    Math.max(
                      0,
                      state.currentTime - settings.shortcuts.skipBackward
                    )
                  )
                }
                className="text-white hover:bg-white/20"
              >
                <SkipBack className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  controls.seek(
                    Math.min(
                      state.duration,
                      state.currentTime + settings.shortcuts.skipForward
                    )
                  )
                }
                className="text-white hover:bg-white/20"
              >
                <SkipForward className="h-4 w-4" />
              </Button>

              {/* Volume Control */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={controls.toggleMute}
                  className="text-white hover:bg-white/20"
                >
                  {state.isMuted || state.volume === 0 ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
                <div className="w-20">
                  <Slider
                    value={[state.isMuted ? 0 : state.volume * 100]}
                    max={100}
                    step={1}
                    onValueChange={([value]) => controls.setVolume(value / 100)}
                    className="cursor-pointer"
                  />
                </div>
              </div>

              {/* Time Display */}
              <div className="font-mono text-sm text-white">
                {formatTime(state.currentTime)} / {formatTime(state.duration)}
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              {/* Playback Speed */}
              <select
                value={state.playbackRate}
                onChange={e =>
                  controls.setPlaybackRate(parseFloat(e.target.value))
                }
                className="cursor-pointer rounded border border-white/20 bg-transparent px-2 py-1 text-sm text-white"
              >
                <option value={0.5} className="text-black">
                  0.5x
                </option>
                <option value={0.75} className="text-black">
                  0.75x
                </option>
                <option value={1} className="text-black">
                  1x
                </option>
                <option value={1.25} className="text-black">
                  1.25x
                </option>
                <option value={1.5} className="text-black">
                  1.5x
                </option>
                <option value={2} className="text-black">
                  2x
                </option>
              </select>

              <Button
                variant="ghost"
                size="sm"
                onClick={controls.toggleFullscreen}
                className="text-white hover:bg-white/20"
              >
                {state.isFullscreen ? (
                  <Minimize className="h-4 w-4" />
                ) : (
                  <Maximize className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Settings Panel - Only for non-YouTube videos */}
      {!videoInfo.isYouTube && showSettings && (
        <div className="absolute right-4 top-16 z-10 min-w-64 rounded-lg bg-black/90 p-4 text-white">
          <h3 className="mb-3 font-semibold">Cài đặt video</h3>

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm">Chất lượng</label>
              <select
                value={settings.quality}
                onChange={e =>
                  setSettings(prev => ({
                    ...prev,
                    quality: e.target.value as any,
                  }))
                }
                className="w-full rounded border border-white/20 bg-white/10 px-2 py-1 text-sm"
              >
                <option value="auto" className="text-black">
                  Tự động
                </option>
                <option value="1080p" className="text-black">
                  1080p
                </option>
                <option value="720p" className="text-black">
                  720p
                </option>
                <option value="480p" className="text-black">
                  480p
                </option>
                <option value="360p" className="text-black">
                  360p
                </option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.subtitles.enabled}
                  onChange={e =>
                    setSettings(prev => ({
                      ...prev,
                      subtitles: {
                        ...prev.subtitles,
                        enabled: e.target.checked,
                      },
                    }))
                  }
                  className="rounded"
                />
                <span className="text-sm">Hiển thị phụ đề</span>
              </label>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.autoplay}
                  onChange={e =>
                    setSettings(prev => ({
                      ...prev,
                      autoplay: e.target.checked,
                    }))
                  }
                  className="rounded"
                />
                <span className="text-sm">Tự động phát</span>
              </label>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.resumePosition}
                  onChange={e =>
                    setSettings(prev => ({
                      ...prev,
                      resumePosition: e.target.checked,
                    }))
                  }
                  className="rounded"
                />
                <span className="text-sm">Tiếp tục từ vị trí đã xem</span>
              </label>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.shortcuts.enabled}
                  onChange={e =>
                    setSettings(prev => ({
                      ...prev,
                      shortcuts: {
                        ...prev.shortcuts,
                        enabled: e.target.checked,
                      },
                    }))
                  }
                  className="rounded"
                />
                <span className="text-sm">Phím tắt</span>
              </label>
            </div>
          </div>

          <div className="mt-4 border-t border-white/20 pt-3">
            <h4 className="mb-2 text-sm font-medium">Phím tắt</h4>
            <div className="space-y-1 text-xs text-white/70">
              <div>Space: Phát/Tạm dừng</div>
              <div>←→: Tua lùi/tiến ({settings.shortcuts.skipBackward}s)</div>
              <div>↑↓: Tăng/giảm âm lượng</div>
              <div>F: Toàn màn hình</div>
              <div>M: Tắt/bật âm</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
