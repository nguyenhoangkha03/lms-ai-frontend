'use client';

import React, { useState } from 'react';
import {
  ArrowUp,
  ArrowDown,
  Heart,
  Star,
  Award,
  TrendingUp,
  Trophy,
  Crown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { forumApi } from '@/lib/redux/api/forum-api';

interface VotingSystemProps {
  targetId: string;
  targetType: 'thread' | 'post';
  currentScore: number;
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down' | null;
  isAccepted?: boolean;
  helpfulCount?: number;
  isHelpful?: boolean;
  onVoteChange?: (newScore: number) => void;
  className?: string;
}

interface UserReputation {
  userId: string;
  score: number;
  rank: number;
  totalPosts: number;
  totalThreads: number;
  totalUpvotes: number;
  totalDownvotes: number;
  totalAcceptedAnswers: number;
  totalHelpfulVotes: number;
  bestAnswerStreak: number;
  currentAnswerStreak: number;
  lastActivityDate: string;
  todayPoints: number;
  weekPoints: number;
  monthPoints: number;
  badges: Array<{
    id: string;
    name: string;
    description: string;
    badgeType: 'bronze' | 'silver' | 'gold' | 'platinum';
    iconUrl: string;
    color: string;
    points: number;
    earnedAt: string;
  }>;
  history: Array<{
    date: string;
    points: number;
    reason: string;
    relatedPostId?: string;
  }>;
}

interface ReputationLevel {
  name: string;
  minScore: number;
  maxScore: number;
  color: string;
  icon: React.ReactNode;
  privileges: string[];
}

const REPUTATION_LEVELS: ReputationLevel[] = [
  {
    name: 'Newcomer',
    minScore: 0,
    maxScore: 49,
    color: 'text-gray-600',
    icon: <Star className="h-4 w-4" />,
    privileges: ['Ask questions', 'Post answers', 'Vote up'],
  },
  {
    name: 'Contributor',
    minScore: 50,
    maxScore: 199,
    color: 'text-blue-600',
    icon: <TrendingUp className="h-4 w-4" />,
    privileges: ['Vote down', 'Comment everywhere', 'Flag posts'],
  },
  {
    name: 'Trusted',
    minScore: 200,
    maxScore: 499,
    color: 'text-green-600',
    icon: <Award className="h-4 w-4" />,
    privileges: [
      'Edit community posts',
      'Close questions',
      'Access moderation tools',
    ],
  },
  {
    name: 'Expert',
    minScore: 500,
    maxScore: 999,
    color: 'text-purple-600',
    icon: <Trophy className="h-4 w-4" />,
    privileges: [
      'Delete posts',
      'Protect questions',
      'Access to moderator tools',
    ],
  },
  {
    name: 'Master',
    minScore: 1000,
    maxScore: Number.MAX_SAFE_INTEGER,
    color: 'text-yellow-600',
    icon: <Crown className="h-4 w-4" />,
    privileges: [
      'Access to all moderation features',
      'Site analytics',
      'User management',
    ],
  },
];

export function VotingSystem({
  targetId,
  targetType,
  currentScore,
  upvotes,
  downvotes,
  userVote,
  isAccepted = false,
  helpfulCount = 0,
  isHelpful = false,
  onVoteChange,
  className = '',
}: VotingSystemProps) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);

  const [isVoting, setIsVoting] = useState(false);
  const [showReputationInfo, setShowReputationInfo] = useState(false);

  const [voteOnThread] = forumApi.useVoteOnThreadMutation();
  const [voteOnPost] = forumApi.useVoteOnPostMutation();
  const [markHelpful] = forumApi.useMarkHelpfulMutation();

  const handleVote = async (voteType: 'up' | 'down') => {
    if (!user) {
      toast(
        <div>
          <strong className="text-red-600">Authentication required</strong>
          <p>Please log in to vote.</p>
        </div>
      );

      return;
    }

    setIsVoting(true);

    try {
      const isCurrentVote = userVote === voteType;
      const mutation = targetType === 'thread' ? voteOnThread : voteOnPost;

      if (isCurrentVote) {
        // Remove vote
        if (targetType === 'thread') {
          await mutation({
            threadId: targetId,
            voteType: null,
          } as any).unwrap();
        } else {
          await mutation({ postId: targetId, voteType: null } as any).unwrap();
        }
      } else {
        // Add or change vote
        if (targetType === 'thread') {
          await mutation({ threadId: targetId, voteType } as any).unwrap();
        } else {
          await mutation({ postId: targetId, voteType } as any).unwrap();
        }
      }

      // Calculate new score based on vote change
      let scoreChange = 0;
      if (isCurrentVote) {
        // Removing vote
        scoreChange = voteType === 'up' ? -1 : 1;
      } else if (userVote) {
        // Changing vote
        scoreChange = voteType === 'up' ? 2 : -2;
      } else {
        // Adding new vote
        scoreChange = voteType === 'up' ? 1 : -1;
      }

      const newScore = currentScore + scoreChange;
      onVoteChange?.(newScore);

      toast(
        <div>
          <strong className="text-red-600">
            {isCurrentVote ? 'Vote removed' : 'Vote recorded'}
          </strong>
          <p>
            {isCurrentVote
              ? 'Your vote has been removed.'
              : `You ${voteType}voted this ${targetType}.`}
          </p>
        </div>
      );
    } catch (error: any) {
      toast(
        <div>
          <strong className="text-red-600">Error</strong>
          <p>
            {error.data?.message || 'Failed to record vote. Please try again.'}
          </p>
        </div>
      );
    } finally {
      setIsVoting(false);
    }
  };

  const handleMarkHelpful = async () => {
    if (!user) {
      toast(
        <div>
          <strong className="text-red-600">Authentication required</strong>
          <p>Please log in to mark as helpful.</p>
        </div>
      );
      return;
    }

    try {
      await markHelpful({ postId: targetId }).unwrap();
      toast(
        <div>
          <strong className="text-red-600">
            {isHelpful ? 'Removed helpful mark' : 'Marked as helpful'}
          </strong>
          <p>
            {isHelpful
              ? 'This post is no longer marked as helpful.'
              : 'Thank you for marking this post as helpful!'}
          </p>
        </div>
      );
    } catch (error: any) {
      toast(
        <div>
          <strong className="text-red-600">Error</strong>
          <p>
            {error.data?.message ||
              'Failed to mark as helpful. Please try again.'}
          </p>
        </div>
      );
    }
  };

  const getScoreColor = (score: number) => {
    if (score > 10) return 'text-green-600';
    if (score > 0) return 'text-blue-600';
    if (score < -5) return 'text-red-600';
    return 'text-gray-600';
  };

  const getVotePercentage = () => {
    const totalVotes = upvotes + downvotes;
    if (totalVotes === 0) return 0;
    return Math.round((upvotes / totalVotes) * 100);
  };

  return (
    <TooltipProvider>
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        {/* Upvote Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={userVote === 'up' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleVote('up')}
              disabled={isVoting}
              className={`h-8 w-8 p-2 ${userVote === 'up' ? 'bg-green-600 hover:bg-green-700' : ''}`}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>This {targetType} is useful and clear</p>
          </TooltipContent>
        </Tooltip>

        {/* Score Display */}
        <div className="text-center">
          <span className={`text-lg font-bold ${getScoreColor(currentScore)}`}>
            {currentScore}
          </span>
          {(upvotes > 0 || downvotes > 0) && (
            <div className="mt-1 text-xs text-gray-500">
              {getVotePercentage()}% positive
            </div>
          )}
        </div>

        {/* Downvote Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={userVote === 'down' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleVote('down')}
              disabled={isVoting}
              className={`h-8 w-8 p-2 ${userVote === 'down' ? 'bg-red-600 hover:bg-red-700' : ''}`}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>This {targetType} is not useful</p>
          </TooltipContent>
        </Tooltip>

        {/* Accepted Answer Badge */}
        {isAccepted && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="outline"
                className="border-green-200 bg-green-50 text-green-700"
              >
                <Award className="mr-1 h-3 w-3" />
                Accepted
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>This answer was accepted by the question author</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Helpful Button (for posts only) */}
        {targetType === 'post' && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkHelpful}
                className={`h-6 p-1 text-xs ${isHelpful ? 'text-red-600' : 'text-gray-600'}`}
              >
                <Heart
                  className={`mr-1 h-3 w-3 ${isHelpful ? 'fill-current' : ''}`}
                />
                {helpfulCount}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isHelpful ? 'Remove helpful mark' : 'Mark as helpful'}</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Vote Breakdown (detailed view) */}
        {(upvotes > 0 || downvotes > 0) && (
          <div className="mt-2 text-center text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <ArrowUp className="h-3 w-3 text-green-600" />
              <span>{upvotes}</span>
            </div>
            <div className="flex items-center gap-1">
              <ArrowDown className="h-3 w-3 text-red-600" />
              <span>{downvotes}</span>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

export function ReputationDisplay({
  userId,
  currentReputation,
  showDetails = false,
}: {
  userId: string;
  currentReputation: number;
  showDetails?: boolean;
}) {
  const { data: reputation, isLoading } =
    forumApi.useGetUserReputationQuery(userId);
  const [showReputationDialog, setShowReputationDialog] = useState(false);

  const getCurrentLevel = (score: number): ReputationLevel => {
    return (
      REPUTATION_LEVELS.find(
        level => score >= level.minScore && score <= level.maxScore
      ) || REPUTATION_LEVELS[0]
    );
  };

  const getNextLevel = (score: number): ReputationLevel | null => {
    const currentLevelIndex = REPUTATION_LEVELS.findIndex(
      level => score >= level.minScore && score <= level.maxScore
    );
    return currentLevelIndex < REPUTATION_LEVELS.length - 1
      ? REPUTATION_LEVELS[currentLevelIndex + 1]
      : null;
  };

  const getProgressToNextLevel = (score: number): number => {
    const nextLevel = getNextLevel(score);
    if (!nextLevel) return 100;

    const currentLevel = getCurrentLevel(score);
    const progress =
      (score - currentLevel.minScore) /
      (nextLevel.minScore - currentLevel.minScore);
    return Math.round(progress * 100);
  };

  const currentLevel = getCurrentLevel(currentReputation);
  const nextLevel = getNextLevel(currentReputation);
  const progressPercent = getProgressToNextLevel(currentReputation);

  if (isLoading) {
    return <div className="h-6 w-16 animate-pulse rounded bg-gray-200"></div>;
  }

  return (
    <div className="flex items-center gap-2">
      <Dialog
        open={showReputationDialog}
        onOpenChange={setShowReputationDialog}
      >
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-auto items-center gap-2 p-1 hover:bg-gray-50"
          >
            <div className={`flex items-center gap-1 ${currentLevel.color}`}>
              {currentLevel.icon}
              <span className="font-medium">{currentReputation}</span>
            </div>
            {showDetails && (
              <Badge
                variant="outline"
                className={`text-xs ${currentLevel.color}`}
              >
                {currentLevel.name}
              </Badge>
            )}
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Reputation & Achievements
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Current Status */}
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-full bg-gray-100 p-2 ${currentLevel.color}`}
                    >
                      {currentLevel.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{currentLevel.name}</h3>
                      <p className="text-gray-600">
                        {currentReputation} reputation points
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${currentLevel.color} px-3 py-1 text-lg`}
                  >
                    Rank #{reputation?.rank || 'N/A'}
                  </Badge>
                </div>

                {/* Progress to Next Level */}
                {nextLevel && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{currentLevel.name}</span>
                      <span>{nextLevel.name}</span>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                    <p className="text-center text-sm text-gray-600">
                      {nextLevel.minScore - currentReputation} points to{' '}
                      {nextLevel.name}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Statistics */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {reputation?.totalPosts || 0}
                  </div>
                  <div className="text-sm text-gray-600">Posts</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {reputation?.totalUpvotes || 0}
                  </div>
                  <div className="text-sm text-gray-600">Upvotes Received</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {reputation?.totalAcceptedAnswers || 0}
                  </div>
                  <div className="text-sm text-gray-600">Accepted Answers</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {reputation?.bestAnswerStreak || 0}
                  </div>
                  <div className="text-sm text-gray-600">
                    Best Answer Streak
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Points</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Today</span>
                    <span className="font-medium text-green-600">
                      +{reputation?.todayPoints || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">This Week</span>
                    <span className="font-medium text-blue-600">
                      +{reputation?.weekPoints || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">This Month</span>
                    <span className="font-medium text-purple-600">
                      +{reputation?.monthPoints || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Badges */}
            {reputation?.badges && reputation.badges.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Badges</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {reputation.badges.map(badge => (
                      <div
                        key={badge.id}
                        className="flex items-center gap-3 rounded-lg border p-3"
                      >
                        <div
                          className={`rounded-full p-2`}
                          style={{ backgroundColor: badge.color + '20' }}
                        >
                          <Award
                            className="h-4 w-4"
                            style={{ color: badge.color }}
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{badge.name}</h4>
                          <p className="text-sm text-gray-600">
                            {badge.description}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {badge.badgeType}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(badge.earnedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-green-600">
                          +{badge.points}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Privileges */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Privileges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {currentLevel.privileges.map((privilege, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-sm">{privilege}</span>
                    </div>
                  ))}
                </div>

                {nextLevel && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <h4 className="mb-2 font-medium text-gray-700">
                        Unlock at {nextLevel.name} ({nextLevel.minScore}{' '}
                        points):
                      </h4>
                      <div className="space-y-2">
                        {nextLevel.privileges.map((privilege, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                            <span className="text-sm text-gray-600">
                              {privilege}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Recent History */}
            {reputation?.history && reputation.history.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-40 space-y-3 overflow-y-auto">
                    {reputation.history.slice(0, 10).map((entry, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex-1">
                          <span className="text-gray-600">{entry.reason}</span>
                          <div className="text-xs text-gray-400">
                            {new Date(entry.date).toLocaleDateString()}
                          </div>
                        </div>
                        <div
                          className={`font-medium ${entry.points > 0 ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {entry.points > 0 ? '+' : ''}
                          {entry.points}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function ReputationLeaderboard({ limit = 10 }: { limit?: number }) {
  const { data: leaderboard, isLoading } =
    forumApi.useGetReputationLeaderboardQuery({ limit });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Contributors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200"></div>
                <div className="flex-1">
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
                  <div className="mt-1 h-3 w-16 animate-pulse rounded bg-gray-200"></div>
                </div>
                <div className="h-4 w-12 animate-pulse rounded bg-gray-200"></div>
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
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Top Contributors
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboard?.map((user: any, index: number) => {
            const level = getCurrentLevel(user.reputation);
            return (
              <div key={user.id} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-medium">
                  {index < 3 ? (
                    <Trophy
                      className={`h-4 w-4 ${
                        index === 0
                          ? 'text-yellow-500'
                          : index === 1
                            ? 'text-gray-400'
                            : 'text-orange-600'
                      }`}
                    />
                  ) : (
                    index + 1
                  )}
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="text-sm font-medium">{user.name}</div>
                  <div className={`text-xs ${level.color}`}>{level.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{user.reputation}</div>
                  <div className="text-xs text-gray-500">rep</div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to get current reputation level
const getCurrentLevel = (score: number): ReputationLevel => {
  return (
    REPUTATION_LEVELS.find(
      level => score >= level.minScore && score <= level.maxScore
    ) || REPUTATION_LEVELS[0]
  );
};
