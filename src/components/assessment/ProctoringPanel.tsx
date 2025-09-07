'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Camera,
  Mic,
  MicOff,
  VideoOff,
  Video,
  AlertTriangle,
  CheckCircle,
  Eye,
  Users,
  Volume2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ProctoringPanelProps {
  sessionId?: string;
  showPreview?: boolean;
  onSetupComplete?: (success: boolean) => void;
  onSecurityEvent?: (eventType: string, metadata?: any) => void;
  requirements?: {
    webcam: boolean;
    microphone: boolean;
    faceDetection: boolean;
  };
  className?: string;
}

export function ProctoringPanel({
  sessionId,
  showPreview = false,
  onSetupComplete,
  onSecurityEvent,
  requirements = { webcam: true, microphone: false, faceDetection: true },
  className,
}: ProctoringPanelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const faceDetectionInterval = useRef<NodeJS.Timeout>();

  const [webcamStatus, setWebcamStatus] = useState<
    'inactive' | 'requesting' | 'active' | 'error'
  >('inactive');
  const [microphoneStatus, setMicrophoneStatus] = useState<
    'inactive' | 'requesting' | 'active' | 'error'
  >('inactive');
  const [faceDetectionStatus, setFaceDetectionStatus] = useState<
    'inactive' | 'active' | 'no_face' | 'multiple_faces'
  >('inactive');
  const [audioLevel, setAudioLevel] = useState(0);
  const [setupComplete, setSetupComplete] = useState(false);

  // Face detection using basic image processing
  const detectFaces = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !requirements.faceDetection)
      return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx || video.videoWidth === 0) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    // Simple face detection simulation (in real app, use actual face detection library)
    // This is a placeholder for demonstration
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const faces = simulateFaceDetection(imageData);

    if (faces.length === 0) {
      setFaceDetectionStatus('no_face');
      onSecurityEvent?.('face_not_detected', { timestamp: Date.now() });
    } else if (faces.length > 1) {
      setFaceDetectionStatus('multiple_faces');
      onSecurityEvent?.('multiple_faces', {
        count: faces.length,
        timestamp: Date.now(),
      });
    } else {
      setFaceDetectionStatus('active');
    }
  }, [requirements.faceDetection, onSecurityEvent]);

  // Simulate face detection (replace with actual face detection library)
  const simulateFaceDetection = (imageData: ImageData) => {
    // Placeholder simulation - always returns 1 face for demo
    // In real implementation, use libraries like face-api.js or MediaPipe
    return [{ x: 100, y: 100, width: 200, height: 200 }];
  };

  // Setup webcam
  const setupWebcam = async () => {
    if (!requirements.webcam) return true;

    setWebcamStatus('requesting');

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
      };

      if (requirements.microphone) {
        constraints.audio = {
          echoCancellation: true,
          noiseSuppression: true,
        };
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setWebcamStatus('active');

      if (requirements.microphone) {
        setMicrophoneStatus('active');
        setupAudioMonitoring(stream);
      }

      return true;
    } catch (error) {
      console.error('Failed to setup webcam:', error);
      setWebcamStatus('error');
      toast.error('Failed to access webcam. Please check permissions.');
      return false;
    }
  };

  // Setup audio monitoring
  const setupAudioMonitoring = (stream: MediaStream) => {
    if (!requirements.microphone) return;

    try {
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      microphone.connect(analyser);
      analyser.fftSize = 256;

      const updateAudioLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average);

        // Detect suspicious audio (too loud, indicates possible cheating)
        if (average > 150) {
          onSecurityEvent?.('noise_detected', { level: average });
        }

        requestAnimationFrame(updateAudioLevel);
      };

      updateAudioLevel();
    } catch (error) {
      console.error('Failed to setup audio monitoring:', error);
    }
  };

  // Start face detection
  const startFaceDetection = () => {
    if (!requirements.faceDetection || faceDetectionInterval.current) return;

    faceDetectionInterval.current = setInterval(detectFaces, 2000); // Check every 2 seconds
  };

  // Stop face detection
  const stopFaceDetection = () => {
    if (faceDetectionInterval.current) {
      clearInterval(faceDetectionInterval.current);
      faceDetectionInterval.current = undefined;
    }
  };

  // Initialize proctoring
  const initializeProctoring = async () => {
    const webcamSuccess = await setupWebcam();

    if (webcamSuccess && requirements.faceDetection) {
      // Wait for video to be ready
      setTimeout(() => {
        startFaceDetection();
      }, 1000);
    }

    const success = webcamSuccess;
    setSetupComplete(success);
    onSetupComplete?.(success);
  };

  // Cleanup
  const cleanup = () => {
    stopFaceDetection();

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    return cleanup;
  }, []);

  const getFaceDetectionStatus = () => {
    switch (faceDetectionStatus) {
      case 'active':
        return {
          icon: CheckCircle,
          color: 'text-green-400',
          text: 'Face Detected',
        };
      case 'no_face':
        return {
          icon: AlertTriangle,
          color: 'text-red-400',
          text: 'No Face Detected',
        };
      case 'multiple_faces':
        return { icon: Users, color: 'text-red-400', text: 'Multiple Faces' };
      default:
        return { icon: Eye, color: 'text-gray-600', text: 'Detecting...' };
    }
  };

  if (!showPreview && setupComplete) {
    // Compact monitoring view during assessment
    return (
      <div className={cn('space-y-3', className)}>
        <Card className="border-gray-300 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Camera className="h-4 w-4 text-blue-400" />
              Proctoring Active
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Webcam Preview */}
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="h-32 w-full rounded bg-gray-900 object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />

              <div className="absolute right-2 top-2 flex gap-1">
                <Badge className="bg-red-500 text-xs text-gray-900">REC</Badge>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Webcam:</span>
                <div className="flex items-center gap-1">
                  {webcamStatus === 'active' ? (
                    <Video className="h-3 w-3 text-green-400" />
                  ) : (
                    <VideoOff className="h-3 w-3 text-red-400" />
                  )}
                  <span
                    className={
                      webcamStatus === 'active'
                        ? 'text-green-400'
                        : 'text-red-400'
                    }
                  >
                    {webcamStatus === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {requirements.microphone && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Audio:</span>
                  <div className="flex items-center gap-1">
                    {microphoneStatus === 'active' ? (
                      <Mic className="h-3 w-3 text-green-400" />
                    ) : (
                      <MicOff className="h-3 w-3 text-red-400" />
                    )}
                    <div className="flex items-center gap-1">
                      <Volume2 className="h-3 w-3 text-blue-400" />
                      <Progress value={audioLevel} className="h-1 w-8" />
                    </div>
                  </div>
                </div>
              )}

              {requirements.faceDetection && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Face Detection:</span>
                  <div className="flex items-center gap-1">
                    {(() => {
                      const status = getFaceDetectionStatus();
                      return (
                        <>
                          <status.icon
                            className={cn('h-3 w-3', status.color)}
                          />
                          <span className={status.color}>{status.text}</span>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Warnings */}
            {(faceDetectionStatus === 'no_face' ||
              faceDetectionStatus === 'multiple_faces') && (
              <Alert className="border-red-500 bg-red-900/20">
                <AlertTriangle className="h-3 w-3 text-red-400" />
                <AlertDescription className="text-xs text-red-300">
                  {faceDetectionStatus === 'no_face'
                    ? 'Please ensure your face is visible to the camera'
                    : 'Multiple people detected. Only the test taker should be visible'}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Setup view
  return (
    <div className={cn('space-y-4', className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Proctoring Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Requirements Checklist */}
          <div className="space-y-3">
            <h4 className="font-medium">System Requirements:</h4>
            <div className="space-y-2">
              {requirements.webcam && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Webcam Access</span>
                  <div className="flex items-center gap-2">
                    {webcamStatus === 'active' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : webcamStatus === 'error' ? (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-gray-300"></div>
                    )}
                    <span className="text-sm capitalize">{webcamStatus}</span>
                  </div>
                </div>
              )}

              {requirements.microphone && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Microphone Access</span>
                  <div className="flex items-center gap-2">
                    {microphoneStatus === 'active' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : microphoneStatus === 'error' ? (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-gray-300"></div>
                    )}
                    <span className="text-sm capitalize">
                      {microphoneStatus}
                    </span>
                  </div>
                </div>
              )}

              {requirements.faceDetection && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Face Detection</span>
                  <div className="flex items-center gap-2">
                    {faceDetectionStatus === 'active' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-gray-300"></div>
                    )}
                    <span className="text-sm">
                      {faceDetectionStatus === 'active' ? 'Working' : 'Pending'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Video Preview */}
          {webcamStatus === 'active' && (
            <div className="space-y-2">
              <h4 className="font-medium">Camera Preview:</h4>
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="h-48 w-full rounded-lg bg-gray-100 object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
            </div>
          )}

          {/* Audio Level Indicator */}
          {requirements.microphone && microphoneStatus === 'active' && (
            <div className="space-y-2">
              <h4 className="font-medium">Audio Level:</h4>
              <div className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                <Progress value={audioLevel} className="h-2 flex-1" />
                <span className="text-sm">{Math.round(audioLevel)}%</span>
              </div>
            </div>
          )}

          {/* Setup Button */}
          {!setupComplete && (
            <Button
              onClick={initializeProctoring}
              className="w-full"
              disabled={webcamStatus === 'requesting'}
            >
              {webcamStatus === 'requesting'
                ? 'Setting up...'
                : 'Initialize Proctoring'}
            </Button>
          )}

          {setupComplete && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Proctoring setup complete. You can now start the assessment.
              </AlertDescription>
            </Alert>
          )}

          {/* Privacy Notice */}
          <Alert>
            <Eye className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Privacy Notice:</strong> This assessment is being
              proctored for security purposes. Video and audio may be recorded
              and analyzed by AI systems. Your privacy is protected according to
              our data policy.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
