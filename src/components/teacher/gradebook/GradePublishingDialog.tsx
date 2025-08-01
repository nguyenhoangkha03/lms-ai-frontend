'use client';

import { useState } from 'react';
import { Send, AlertTriangle, Mail, Bell, Eye } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface GradePublishingDialogProps {
  open: boolean;
  onClose: () => void;
  selectedGrades: string[];
  onSuccess: () => void;
}

export function GradePublishingDialog({
  open,
  onClose,
  selectedGrades,
  onSuccess,
}: GradePublishingDialogProps) {
  const { toast } = useToast();
  const [isPublishing, setIsPublishing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Notification settings
  const [sendEmail, setSendEmail] = useState(true);
  const [sendPushNotification, setSendPushNotification] = useState(true);
  const [customMessage, setCustomMessage] = useState('');

  const handlePublish = async () => {
    setIsPublishing(true);

    try {
      // Simulate publishing process with progress updates
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      toast({
        title: 'Grades Published',
        description: `Successfully published ${selectedGrades.length} grades to students.`,
      });

      setProgress(0);
      setIsPublishing(false);
      onSuccess();
    } catch (error) {
      toast({
        title: 'Publishing Failed',
        description: 'Failed to publish grades. Please try again.',
        variant: 'destructive',
      });
      setIsPublishing(false);
      setProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Publish Grades to Students
          </DialogTitle>
          <DialogDescription>
            Publish {selectedGrades.length} grades and send notifications to
            students.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Warning */}
          <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <div>
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-300">
                    Important Notice
                  </h4>
                  <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-400">
                    Once grades are published, students will immediately receive
                    notifications and be able to view their grades. Published
                    grades can be unpublished, but students will retain access
                    to their grade history.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Publishing Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Publishing Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Grades:</span>
                    <Badge variant="outline">{selectedGrades.length}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Students Affected:</span>
                    <Badge variant="outline">{selectedGrades.length}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Notification Method:</span>
                    <div className="flex gap-1">
                      {sendEmail && <Badge variant="outline">Email</Badge>}
                      {sendPushNotification && (
                        <Badge variant="outline">Push</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Estimated Delivery:</span>
                    <span className="text-muted-foreground">2-5 minutes</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Status:</span>
                    <Badge variant="secondary">Ready to Publish</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <Label htmlFor="send-email">Send Email Notifications</Label>
                </div>
                <Switch
                  id="send-email"
                  checked={sendEmail}
                  onCheckedChange={setSendEmail}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <Label htmlFor="send-push">Send Push Notifications</Label>
                </div>
                <Switch
                  id="send-push"
                  checked={sendPushNotification}
                  onCheckedChange={setSendPushNotification}
                />
              </div>

              <div>
                <Label htmlFor="custom-message">
                  Custom Message (Optional)
                </Label>
                <Textarea
                  id="custom-message"
                  value={customMessage}
                  onChange={e => setCustomMessage(e.target.value)}
                  placeholder="Add a custom message that will be included in the notification..."
                  rows={3}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Publishing Progress */}
          {progress > 0 && (
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Publishing grades...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} />
                  <div className="text-xs text-muted-foreground">
                    {progress < 50
                      ? 'Preparing grade data...'
                      : progress < 80
                        ? 'Sending notifications...'
                        : 'Finalizing publication...'}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={onClose} disabled={isPublishing}>
              Cancel
            </Button>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                disabled={isPublishing}
                onClick={() => {
                  // Preview functionality
                  toast({
                    title: 'Preview Available',
                    description: 'Grade preview feature coming soon.',
                  });
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>

              <Button
                onClick={handlePublish}
                disabled={isPublishing || (!sendEmail && !sendPushNotification)}
              >
                <Send className="mr-2 h-4 w-4" />
                {isPublishing
                  ? 'Publishing...'
                  : `Publish ${selectedGrades.length} Grades`}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
