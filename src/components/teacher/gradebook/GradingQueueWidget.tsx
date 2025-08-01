'use client';

import { useRouter } from 'next/navigation';
import { Clock, ArrowRight } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useGetManualGradingQueueQuery } from '@/lib/redux/api/gradebook-api';

interface GradingQueueWidgetProps {
  showFullView?: boolean;
  maxItems?: number;
}

export function GradingQueueWidget({
  showFullView = false,
  maxItems = 5,
}: GradingQueueWidgetProps) {
  const router = useRouter();

  const { data: queueData, isLoading } = useGetManualGradingQueueQuery({});

  const displayItems = showFullView
    ? queueData || []
    : (queueData || []).slice(0, maxItems);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'secondary';
      case 'medium':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const handleGradeSubmission = (submissionId: string) => {
    router.push(`/teacher/manual-grading?submission=${submissionId}`);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Grading Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="flex animate-pulse items-center gap-3 rounded-lg border p-3"
              >
                <div className="h-10 w-10 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-gray-200" />
                  <div className="h-3 w-1/2 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Grading Queue
          </CardTitle>
          {!showFullView && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/teacher/manual-grading')}
            >
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
        {queueData && (
          <div className="text-sm text-muted-foreground">
            {queueData.reduce(
              (sum, queue) => sum + queue.pendingSubmissions,
              0
            )}{' '}
            submissions pending
          </div>
        )}
      </CardHeader>
      <CardContent>
        {displayItems.length > 0 ? (
          <div className="space-y-3">
            {displayItems.map(queue => (
              <div key={queue.id} className="rounded-lg border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <h4 className="font-medium">{queue.assessmentTitle}</h4>
                      <p className="text-sm text-muted-foreground">
                        {queue.courseTitle}
                      </p>
                    </div>
                    <Badge variant={getPriorityColor(queue.priority)}>
                      {queue.priority}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ~{queue.avgGradingTime}m avg
                  </div>
                </div>

                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm">Progress</span>
                  <span className="text-sm">
                    {queue.pendingSubmissions} pending
                  </span>
                </div>
                <Progress
                  value={
                    ((queue.totalSubmissions - queue.pendingSubmissions) /
                      queue.totalSubmissions) *
                    100
                  }
                  className="mb-3"
                />

                {queue.dueDate && (
                  <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      Due: {new Date(queue.dueDate).toLocaleDateString()}
                    </span>
                    <span>
                      Est. completion: {queue.estimatedCompletionTime}h
                    </span>
                  </div>
                )}

                <Button
                  size="sm"
                  className="w-full"
                  onClick={() =>
                    router.push(`/teacher/manual-grading?queue=${queue.id}`)
                  }
                >
                  Start Grading ({queue.pendingSubmissions})
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <Clock className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">All Caught Up!</h3>
            <p className="text-muted-foreground">
              No submissions are currently pending manual grading.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
