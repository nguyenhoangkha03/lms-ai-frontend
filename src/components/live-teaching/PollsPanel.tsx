'use client';

import React, { useState, useCallback } from 'react';
import {
  X,
  Plus,
  Play,
  Square,
  BarChart3,
  Users,
  Clock,
  Trash2,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useSocket } from '@/hooks/use-socket';

import type { Poll } from '@/lib/types/live-teaching';
import {
  useGetSessionPollsQuery,
  useCreatePollMutation,
  useStartPollMutation,
  useEndPollMutation,
  useRespondToPollMutation,
} from '@/lib/redux/api/live-teaching-api';

interface PollsPanelProps {
  sessionId: string;
  isHost: boolean;
  onClose: () => void;
}

interface CreatePollForm {
  question: string;
  type: Poll['type'];
  options: string[];
  anonymous: boolean;
  showResults: boolean;
  allowComments: boolean;
  timeLimit?: number;
}

export function PollsPanel({ sessionId, isHost, onClose }: PollsPanelProps) {
  const { toast } = useToast();
  const socket = useSocket();

  // API hooks
  const { data: polls = [], refetch } = useGetSessionPollsQuery(sessionId);
  const [createPoll] = useCreatePollMutation();
  const [startPoll] = useStartPollMutation();
  const [endPoll] = useEndPollMutation();
  const [respondToPoll] = useRespondToPollMutation();

  // State
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
  const [createForm, setCreateForm] = useState<CreatePollForm>({
    question: '',
    type: 'single_choice',
    options: ['', ''],
    anonymous: true,
    showResults: true,
    allowComments: false,
  });

  // Mock current user responses
  const [userResponses, setUserResponses] = useState<Record<string, any>>({});

  // Handle form changes
  const handleFormChange = useCallback(
    (field: keyof CreatePollForm, value: any) => {
      setCreateForm(prev => ({ ...prev, [field]: value }));
    },
    []
  );

  // Add/remove options
  const addOption = useCallback(() => {
    setCreateForm(prev => ({
      ...prev,
      options: [...prev.options, ''],
    }));
  }, []);

  const removeOption = useCallback((index: number) => {
    setCreateForm(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  }, []);

  const updateOption = useCallback((index: number, value: string) => {
    setCreateForm(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => (i === index ? value : opt)),
    }));
  }, []);

  // Create poll
  const handleCreatePoll = useCallback(async () => {
    try {
      const pollData = {
        question: createForm.question,
        type: createForm.type,
        options: createForm.options
          .filter(opt => opt.trim())
          .map((text, index) => ({
            id: `option-${index}`,
            text: text.trim(),
            order: index,
          })),
        anonymous: createForm.anonymous,
        showResults: createForm.showResults,
        allowComments: createForm.allowComments,
        timeLimit: createForm.timeLimit,
      };

      await createPoll({
        sessionId,
        poll: pollData,
      }).unwrap();

      // Emit socket event
      socket?.emit('poll:create', {
        sessionId,
        poll: pollData,
      });

      setShowCreateDialog(false);
      setCreateForm({
        question: '',
        type: 'single_choice',
        options: ['', ''],
        anonymous: true,
        showResults: true,
        allowComments: false,
      });
      refetch();

      toast({
        title: 'Poll Created',
        description: 'Your poll has been created successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create poll.',
        variant: 'destructive',
      });
    }
  }, [createForm, sessionId, createPoll, socket, refetch, toast]);

  // Start poll
  const handleStartPoll = useCallback(
    async (pollId: string) => {
      try {
        await startPoll({ sessionId, pollId }).unwrap();

        socket?.emit('poll:start', { sessionId, pollId });
        refetch();

        toast({
          title: 'Poll Started',
          description: 'The poll has been started and is now live.',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to start poll.',
          variant: 'destructive',
        });
      }
    },
    [sessionId, startPoll, socket, refetch, toast]
  );

  // End poll
  const handleEndPoll = useCallback(
    async (pollId: string) => {
      try {
        await endPoll({ sessionId, pollId }).unwrap();

        socket?.emit('poll:end', { sessionId, pollId });
        refetch();

        toast({
          title: 'Poll Ended',
          description: 'The poll has been ended and results are final.',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to end poll.',
          variant: 'destructive',
        });
      }
    },
    [sessionId, endPoll, socket, refetch, toast]
  );

  // Submit response
  const handleSubmitResponse = useCallback(
    async (poll: Poll, response: any) => {
      try {
        let selectedOptions: string[] = [];
        let textResponse: string | undefined;

        if (poll.type === 'single_choice' || poll.type === 'yes_no') {
          selectedOptions = [response];
        } else if (poll.type === 'multiple_choice') {
          selectedOptions = response;
        } else if (poll.type === 'text') {
          textResponse = response;
        } else if (poll.type === 'rating') {
          selectedOptions = [response.toString()];
        }

        await respondToPoll({
          sessionId,
          pollId: poll.id,
          response: {
            selectedOptions,
            textResponse,
          },
        }).unwrap();

        // Update local state
        setUserResponses(prev => ({
          ...prev,
          [poll.id]: response,
        }));

        socket?.emit('poll:response', {
          sessionId,
          pollId: poll.id,
          response,
        });

        toast({
          title: 'Response Submitted',
          description: 'Your response has been recorded.',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to submit response.',
          variant: 'destructive',
        });
      }
    },
    [sessionId, respondToPoll, socket, toast]
  );

  // Calculate results
  const calculateResults = useCallback((poll: Poll) => {
    if (!poll.results) return [];

    const totalResponses = poll.results.totalResponses;

    return poll.options.map(option => {
      const count = poll.results.optionCounts[option.id] || 0;
      const percentage =
        totalResponses > 0 ? (count / totalResponses) * 100 : 0;

      return {
        ...option,
        count,
        percentage,
      };
    });
  }, []);

  // Get poll status color
  const getStatusColor = useCallback((status: Poll['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'ended':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  }, []);

  return (
    <div className="flex h-full flex-col bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-700 p-4">
        <h3 className="text-lg font-semibold text-white">Polls</h3>
        <div className="flex items-center space-x-2">
          {isHost && (
            <Button size="sm" onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Poll
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Polls List */}
      <div className="flex-1 overflow-y-auto p-4">
        {polls.length === 0 ? (
          <div className="py-8 text-center">
            <BarChart3 className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h4 className="mb-2 text-lg font-medium text-white">
              No Polls Yet
            </h4>
            <p className="mb-4 text-gray-400">
              {isHost
                ? 'Create your first poll to engage with participants.'
                : "The host hasn't created any polls yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {polls.map(poll => {
              const results = calculateResults(poll);
              const userResponse = userResponses[poll.id];
              const hasResponded = userResponse !== undefined;

              return (
                <Card key={poll.id} className="border-gray-600 bg-gray-700">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="mb-2 text-base text-white">
                          {poll.question}
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(poll.status)}>
                            {poll.status}
                          </Badge>
                          <Badge variant="outline">
                            {poll.type.replace('_', ' ')}
                          </Badge>
                          {poll.anonymous && (
                            <Badge variant="secondary">Anonymous</Badge>
                          )}
                        </div>
                      </div>

                      {isHost && (
                        <div className="flex items-center space-x-1">
                          {poll.status === 'draft' && (
                            <Button
                              size="sm"
                              onClick={() => handleStartPoll(poll.id)}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          {poll.status === 'active' && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleEndPoll(poll.id)}
                            >
                              <Square className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent>
                    {/* Poll Options */}
                    {poll.status === 'active' && !hasResponded && !isHost && (
                      <div className="space-y-3">
                        {poll.type === 'single_choice' && (
                          <RadioGroup
                            onValueChange={value =>
                              handleSubmitResponse(poll, value)
                            }
                          >
                            {poll.options.map(option => (
                              <div
                                key={option.id}
                                className="flex items-center space-x-2"
                              >
                                <RadioGroupItem
                                  value={option.id}
                                  id={option.id}
                                />
                                <Label
                                  htmlFor={option.id}
                                  className="text-white"
                                >
                                  {option.text}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        )}

                        {poll.type === 'multiple_choice' && (
                          <div className="space-y-2">
                            {poll.options.map(option => (
                              <div
                                key={option.id}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={option.id}
                                  onCheckedChange={checked => {
                                    const current = userResponse || [];
                                    const updated = checked
                                      ? [...current, option.id]
                                      : current.filter(
                                          (id: string) => id !== option.id
                                        );
                                    setUserResponses(prev => ({
                                      ...prev,
                                      [poll.id]: updated,
                                    }));
                                  }}
                                />
                                <Label
                                  htmlFor={option.id}
                                  className="text-white"
                                >
                                  {option.text}
                                </Label>
                              </div>
                            ))}
                            <Button
                              size="sm"
                              onClick={() =>
                                handleSubmitResponse(poll, userResponse || [])
                              }
                              disabled={
                                !userResponse || userResponse.length === 0
                              }
                              className="mt-3"
                            >
                              Submit
                            </Button>
                          </div>
                        )}

                        {poll.type === 'yes_no' && (
                          <div className="flex space-x-3">
                            <Button
                              variant="outline"
                              onClick={() => handleSubmitResponse(poll, 'yes')}
                              className="flex-1"
                            >
                              Yes
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleSubmitResponse(poll, 'no')}
                              className="flex-1"
                            >
                              No
                            </Button>
                          </div>
                        )}

                        {poll.type === 'rating' && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              {[1, 2, 3, 4, 5].map(rating => (
                                <Button
                                  key={rating}
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleSubmitResponse(poll, rating)
                                  }
                                  className="h-12 w-12"
                                >
                                  <Star className="h-4 w-4" />
                                  <span className="ml-1">{rating}</span>
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}

                        {poll.type === 'text' && (
                          <div className="space-y-3">
                            <Textarea
                              placeholder="Enter your response..."
                              value={userResponse || ''}
                              onChange={e =>
                                setUserResponses(prev => ({
                                  ...prev,
                                  [poll.id]: e.target.value,
                                }))
                              }
                            />
                            <Button
                              size="sm"
                              onClick={() =>
                                handleSubmitResponse(poll, userResponse)
                              }
                              disabled={!userResponse || !userResponse.trim()}
                            >
                              Submit
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Results */}
                    {(poll.status === 'ended' ||
                      (poll.showResults && hasResponded) ||
                      isHost) && (
                      <div className="space-y-3">
                        <div className="mb-3 flex items-center justify-between">
                          <h4 className="font-medium text-white">Results</h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-400">
                            <Users className="h-4 w-4" />
                            <span>{poll.results.totalResponses} responses</span>
                          </div>
                        </div>

                        {poll.type === 'text' ? (
                          <div className="space-y-2">
                            {poll.results.textResponses.map(
                              (response, index) => (
                                <div
                                  key={index}
                                  className="rounded bg-gray-600 p-2 text-sm text-white"
                                >
                                  {response}
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {results.map(result => (
                              <div key={result.id} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span className="text-white">
                                    {result.text}
                                  </span>
                                  <span className="text-gray-400">
                                    {result.count} (
                                    {Math.round(result.percentage)}%)
                                  </span>
                                </div>
                                <Progress
                                  value={result.percentage}
                                  className="h-2"
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {poll.type === 'rating' &&
                          poll.results.averageRating && (
                            <div className="mt-3 rounded bg-gray-600 p-3">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-white">
                                  Average Rating
                                </span>
                                <div className="flex items-center space-x-1">
                                  <Star className="h-4 w-4 text-yellow-400" />
                                  <span className="font-bold text-white">
                                    {poll.results.averageRating.toFixed(1)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                      </div>
                    )}

                    {/* User Response Confirmation */}
                    {hasResponded && poll.status === 'active' && (
                      <div className="mt-3 rounded border border-green-700 bg-green-900/20 p-3">
                        <p className="text-sm text-green-400">
                          ✓ Your response has been recorded
                        </p>
                      </div>
                    )}

                    {/* Poll Timer */}
                    {poll.timeLimit && poll.status === 'active' && (
                      <div className="mt-3 flex items-center space-x-2 text-sm text-gray-400">
                        <Clock className="h-4 w-4" />
                        <span>Time remaining: {poll.timeLimit} minutes</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Poll Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Poll</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Question */}
            <div>
              <Label>Question *</Label>
              <Textarea
                placeholder="Enter your poll question..."
                value={createForm.question}
                onChange={e => handleFormChange('question', e.target.value)}
                rows={2}
              />
            </div>

            {/* Poll Type */}
            <div>
              <Label>Poll Type</Label>
              <Select
                value={createForm.type}
                onValueChange={(value: Poll['type']) =>
                  handleFormChange('type', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes_no">Yes/No</SelectItem>
                  <SelectItem value="rating">Rating (1-5 stars)</SelectItem>
                  <SelectItem value="text">Text Response</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Options (for choice-based polls) */}
            {(createForm.type === 'single_choice' ||
              createForm.type === 'multiple_choice') && (
              <div>
                <Label>Options</Label>
                <div className="space-y-2">
                  {createForm.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={e => updateOption(index, e.target.value)}
                      />
                      {createForm.options.length > 2 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeOption(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                    disabled={createForm.options.length >= 10}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Option
                  </Button>
                </div>
              </div>
            )}

            {/* Settings */}
            <div className="space-y-3">
              <h4 className="font-medium">Poll Settings</h4>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Anonymous Responses</Label>
                  <p className="text-sm text-muted-foreground">
                    Hide participant identities in responses
                  </p>
                </div>
                <Switch
                  checked={createForm.anonymous}
                  onCheckedChange={checked =>
                    handleFormChange('anonymous', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Results After Voting</Label>
                  <p className="text-sm text-muted-foreground">
                    Display results immediately after participants vote
                  </p>
                </div>
                <Switch
                  checked={createForm.showResults}
                  onCheckedChange={checked =>
                    handleFormChange('showResults', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow Comments</Label>
                  <p className="text-sm text-muted-foreground">
                    Let participants add optional comments
                  </p>
                </div>
                <Switch
                  checked={createForm.allowComments}
                  onCheckedChange={checked =>
                    handleFormChange('allowComments', checked)
                  }
                />
              </div>

              {/* Time Limit */}
              <div>
                <Label>Time Limit (minutes, optional)</Label>
                <Input
                  type="number"
                  placeholder="No time limit"
                  value={createForm.timeLimit || ''}
                  onChange={e =>
                    handleFormChange(
                      'timeLimit',
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  min={1}
                  max={60}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreatePoll}
              disabled={
                !createForm.question.trim() ||
                (createForm.type !== 'text' &&
                  createForm.type !== 'yes_no' &&
                  createForm.type !== 'rating' &&
                  createForm.options.filter(opt => opt.trim()).length < 2)
              }
            >
              Create Poll
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
