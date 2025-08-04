import React, { useState } from 'react';
import {
  Shield,
  AlertTriangle,
  Lock,
  Eye,
  Activity,
  RefreshCw,
  CheckCircle,
} from 'lucide-react';
import {
  useGetSecurityEventsQuery,
  useResolveSecurityEventMutation,
} from '@/lib/redux/api/user-management-api';
import { UserSecurityEvent } from '@/lib/types/user-management';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface SecurityEventsWidgetProps {
  className?: string;
}

export const SecurityEventsWidget: React.FC<SecurityEventsWidgetProps> = ({
  className,
}) => {
  const { toast } = useToast();
  const [selectedEvent, setSelectedEvent] = useState<UserSecurityEvent | null>(
    null
  );
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');

  const {
    data: securityEventsData,
    isLoading,
    refetch,
  } = useGetSecurityEventsQuery({
    page: 1,
    limit: 10,
    resolved: false,
  });

  const [resolveSecurityEvent] = useResolveSecurityEventMutation();

  const handleResolveEvent = async () => {
    if (!selectedEvent) return;

    try {
      await resolveSecurityEvent({
        id: selectedEvent.id,
        resolution: resolutionNote,
      }).unwrap();

      toast({
        title: 'Security event resolved',
        description: 'The security event has been marked as resolved.',
      });

      setShowResolveDialog(false);
      setSelectedEvent(null);
      setResolutionNote('');
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to resolve security event',
        variant: 'destructive',
      });
    }
  };

  const getSeverityBadge = (severity: string) => {
    const config = {
      low: {
        variant: 'outline' as const,
        text: 'Low',
        color: 'text-green-600',
      },
      medium: {
        variant: 'secondary' as const,
        text: 'Medium',
        color: 'text-yellow-600',
      },
      high: {
        variant: 'destructive' as const,
        text: 'High',
        color: 'text-orange-600',
      },
      critical: {
        variant: 'destructive' as const,
        text: 'Critical',
        color: 'text-red-600',
      },
    };

    const { variant, text, color } =
      config[severity as keyof typeof config] || config.low;
    return (
      <Badge variant={variant} className={color}>
        {text}
      </Badge>
    );
  };

  const getEventIcon = (eventType: string) => {
    const icons = {
      login: Activity,
      logout: Activity,
      failed_login: Lock,
      password_change: Lock,
      suspicious_activity: AlertTriangle,
    };

    const IconComponent = icons[eventType as keyof typeof icons] || Shield;
    return <IconComponent className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Security Events</CardTitle>
          <CardDescription>Loading security events...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="mb-2 h-4 w-full rounded bg-muted"></div>
                <div className="h-3 w-3/4 rounded bg-muted"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const events = securityEventsData?.events || [];

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Events
              </CardTitle>
              <CardDescription>
                Recent security events requiring attention
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {events.length === 0 ? (
            <div className="py-8 text-center">
              <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
              <div className="text-sm text-muted-foreground">
                No unresolved security events
              </div>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {events.map(event => (
                  <div
                    key={event.id}
                    className="space-y-3 rounded-lg border p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getEventIcon(event.eventType)}
                        <div>
                          <div className="text-sm font-medium">
                            {event.eventType.replace('_', ' ').toUpperCase()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(event.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      {getSeverityBadge(event.severity)}
                    </div>

                    <div className="text-sm text-muted-foreground">
                      {event.description}
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="space-x-4">
                        <span>IP: {event.ipAddress}</span>
                        <span>User ID: {event.userId}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedEvent(event)}
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowResolveDialog(true);
                          }}
                        >
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Resolve
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Event Details Dialog */}
      <Dialog
        open={!!selectedEvent && !showResolveDialog}
        onOpenChange={() => setSelectedEvent(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedEvent && getEventIcon(selectedEvent.eventType)}
              Security Event Details
            </DialogTitle>
            <DialogDescription>
              Detailed information about the security event
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Event Type</label>
                  <div className="text-sm capitalize">
                    {selectedEvent.eventType.replace('_', ' ')}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Severity</label>
                  <div className="mt-1">
                    {getSeverityBadge(selectedEvent.severity)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Timestamp</label>
                  <div className="text-sm">
                    {new Date(selectedEvent.timestamp).toLocaleString()}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">User ID</label>
                  <div className="text-sm">{selectedEvent.userId}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">IP Address</label>
                  <div className="text-sm">{selectedEvent.ipAddress}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <div className="text-sm">
                    {selectedEvent.resolved ? (
                      <Badge variant="default">Resolved</Badge>
                    ) : (
                      <Badge variant="destructive">Unresolved</Badge>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <label className="text-sm font-medium">Description</label>
                <div className="mt-1 text-sm text-muted-foreground">
                  {selectedEvent.description}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">User Agent</label>
                <div className="mt-1 break-all text-sm text-muted-foreground">
                  {selectedEvent.userAgent}
                </div>
              </div>

              {selectedEvent.metadata && (
                <div>
                  <label className="text-sm font-medium">Additional Data</label>
                  <div className="mt-1 rounded bg-muted p-3 text-xs">
                    <pre>{JSON.stringify(selectedEvent.metadata, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedEvent(null)}>
              Close
            </Button>
            {selectedEvent && !selectedEvent.resolved && (
              <Button onClick={() => setShowResolveDialog(true)}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Resolve Event
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolve Event Dialog */}
      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Security Event</DialogTitle>
            <DialogDescription>
              Mark this security event as resolved and add resolution notes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Resolution Notes</label>
              <Textarea
                value={resolutionNote}
                onChange={e => setResolutionNote(e.target.value)}
                placeholder="Describe how this event was resolved..."
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowResolveDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleResolveEvent}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Resolve Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
