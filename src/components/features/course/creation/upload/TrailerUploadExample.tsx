import React, { useState } from 'react';
import DirectVideoUpload from './DirectVideoUpload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface TrailerUploadExampleProps {
  courseId: string;
  currentTrailerUrl?: string;
  onTrailerUpdate?: (trailerUrl: string) => void;
}

const TrailerUploadExample: React.FC<TrailerUploadExampleProps> = ({
  courseId,
  currentTrailerUrl,
  onTrailerUpdate,
}) => {
  const [trailerUrl, setTrailerUrl] = useState<string | null>(currentTrailerUrl || null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleUploadComplete = (fileRecord: any) => {
    setTrailerUrl(fileRecord.fileUrl);
    onTrailerUpdate?.(fileRecord.fileUrl);
    
    toast({
      title: 'Trailer Upload Complete',
      description: 'Your course trailer has been uploaded successfully.',
      variant: 'default',
    });
  };

  const handleUploadError = (error: string) => {
    toast({
      title: 'Upload Failed',
      description: error,
      variant: 'destructive',
    });
  };

  const handleDeleteTrailer = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/course/${courseId}/trailer-video`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setTrailerUrl(null);
        onTrailerUpdate?.('');
        toast({
          title: 'Trailer Deleted',
          description: 'Course trailer has been removed.',
          variant: 'default',
        });
      } else {
        throw new Error('Failed to delete trailer');
      }
    } catch (error) {
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete trailer video.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Trailer Display */}
      {trailerUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Current Course Trailer
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteTrailer}
                disabled={isDeleting}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? 'Deleting...' : 'Delete Trailer'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <video
                src={trailerUrl}
                controls
                className="w-full h-full object-cover"
                preload="metadata"
              >
                Your browser does not support video playback.
              </video>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              URL: {trailerUrl}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Upload Component */}
      <DirectVideoUpload
        courseId={courseId}
        uploadType="trailer"
        onUploadComplete={handleUploadComplete}
        onUploadError={handleUploadError}
        maxSizeGB={0.5} // 500MB limit for trailers
        disabled={false}
      />

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Course Trailer Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800 space-y-2">
          <p>✅ Keep trailer videos under 2-3 minutes for best engagement</p>
          <p>✅ Show preview of course content and key learning outcomes</p>
          <p>✅ Include a clear call-to-action for enrollment</p>
          <p>✅ Use high-quality video (1080p recommended)</p>
          <p>⚠️ Maximum file size: 500MB</p>
          <p>⚠️ Supported formats: MP4, WebM, MOV, AVI</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrailerUploadExample;