'use client';

import { useState, useEffect } from 'react';
import {
  Bot,
  CheckCircle,
  AlertTriangle,
  Edit,
  RefreshCw,
  Lightbulb,
  MessageSquare,
  TrendingUp,
  FileText,
  Save,
  X,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

import { useAiGradeEssayMutation } from '@/lib/redux/api/gradebook-api';

import { AIGradingRequest, AIGradingResponse } from '@/lib/types/gradebook';

interface AIGradingInterfaceProps {
  submissionText: string;
  assessmentType: 'essay' | 'short_answer' | 'code' | 'creative_writing';
  maxScore: number;
  rubric?: any;
  onGradeAccept: (grade: number, feedback: string, aiData: any) => void;
  onCancel: () => void;
}

export function AIGradingInterface({
  submissionText,
  assessmentType,
  maxScore,
  rubric,
  onGradeAccept,
  onCancel,
}: AIGradingInterfaceProps) {
  const { toast } = useToast();
  const [aiGradeEssay, { isLoading: isGrading }] = useAiGradeEssayMutation();

  // AI Grading State
  const [aiResult, setAiResult] = useState<AIGradingResponse | null>(null);
  const [isManualReview, setIsManualReview] = useState(false);
  const [manualScore, setManualScore] = useState<number>(0);
  const [manualFeedback, setManualFeedback] = useState('');
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.8);

  // AI Configuration
  const [gradingCriteria, setGradingCriteria] = useState({
    content: true,
    structure: true,
    grammar: true,
    creativity: assessmentType === 'creative_writing',
    technical: assessmentType === 'code',
  });

  const [customPrompt, setCustomPrompt] = useState('');

  useEffect(() => {
    if (submissionText && !aiResult) {
      handleAIGrading();
    }
  }, [submissionText]);

  const handleAIGrading = async () => {
    try {
      const request: AIGradingRequest = {
        text: submissionText,
        rubric: rubric,
        assessmentType: assessmentType,
        customCriteria: Object.entries(gradingCriteria)
          .filter(([_, enabled]) => enabled)
          .map(([criterion, _]) => criterion),
      };

      const result = await aiGradeEssay(request).unwrap();
      setAiResult(result);
      setManualScore(result.score);
      setManualFeedback(result.feedback.overall);

      // Check if manual review is needed based on confidence
      if (result.confidence < confidenceThreshold) {
        setIsManualReview(true);
        toast({
          title: 'Manual Review Recommended',
          description: `AI confidence is ${(result.confidence * 100).toFixed(1)}%. Please review the grading.`,
          variant: 'default',
        });
      }

      // Check for flagged issues
      if (result.flaggedIssues.length > 0) {
        setIsManualReview(true);
        toast({
          title: 'Issues Detected',
          description: 'The submission has been flagged for manual review.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'AI Grading Failed',
        description: 'Failed to grade with AI. Please try manual grading.',
        variant: 'destructive',
      });
    }
  };

  const handleAcceptGrade = () => {
    if (!aiResult) return;

    onGradeAccept(manualScore, manualFeedback, {
      aiScore: aiResult.score,
      aiConfidence: aiResult.confidence,
      aiFeedback: aiResult.feedback.overall,
      aiAnalysis: {
        strengths: aiResult.strengths,
        improvements: aiResult.improvements,
        qualityIndicators: aiResult.qualityIndicators,
        flaggedIssues: aiResult.flaggedIssues,
      },
      isManuallyReviewed: isManualReview,
      gradingCriteria: gradingCriteria,
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600 bg-green-100';
    if (confidence >= 0.7) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getQualityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isGrading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Bot className="mb-4 h-12 w-12 animate-pulse text-primary" />
          <h3 className="mb-2 text-lg font-semibold">AI is Grading...</h3>
          <p className="mb-4 text-center text-muted-foreground">
            Analyzing submission content, structure, and quality
          </p>
          <Progress value={undefined} className="w-64" />
        </CardContent>
      </Card>
    );
  }

  if (!aiResult) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="mb-4 h-12 w-12 text-red-500" />
          <h3 className="mb-2 text-lg font-semibold">AI Grading Failed</h3>
          <p className="mb-4 text-center text-muted-foreground">
            Unable to grade this submission automatically. Please proceed with
            manual grading.
          </p>
          <Button onClick={onCancel}>Continue Manually</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Grading Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bot className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>AI Grading Results</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Automated analysis of {assessmentType.replace('_', ' ')}{' '}
                  submission
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getConfidenceColor(aiResult.confidence)}>
                {(aiResult.confidence * 100).toFixed(1)}% Confidence
              </Badge>
              {isManualReview && (
                <Badge variant="destructive">Manual Review Required</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Score Section */}
            <div className="space-y-4">
              <div className="text-center">
                <div className="mb-2 text-3xl font-bold text-primary">
                  {aiResult.score.toFixed(1)} / {maxScore}
                </div>
                <div className="text-lg text-muted-foreground">
                  {((aiResult.score / maxScore) * 100).toFixed(1)}%
                </div>
                <Progress
                  value={(aiResult.score / maxScore) * 100}
                  className="mt-2"
                />
              </div>

              {/* Manual Override */}
              <div className="space-y-3">
                <Label>Manual Score Override</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    max={maxScore}
                    step="0.1"
                    value={manualScore}
                    onChange={e =>
                      setManualScore(parseFloat(e.target.value) || 0)
                    }
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground">
                    / {maxScore}
                  </span>
                </div>
              </div>
            </div>

            {/* Quality Indicators */}
            <div className="space-y-4">
              <h4 className="font-semibold">Quality Analysis</h4>
              <div className="grid gap-3">
                {Object.entries(aiResult.qualityIndicators).map(
                  ([indicator, score]) => (
                    <div
                      key={indicator}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm capitalize">
                        {indicator.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <div className="flex items-center gap-2">
                        <Progress value={score * 100} className="h-2 w-20" />
                        <span
                          className={`text-sm font-medium ${getQualityColor(score)}`}
                        >
                          {(score * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      <Tabs defaultValue="feedback" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="rubric">Rubric</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
        </TabsList>

        {/* Feedback Tab */}
        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                AI Generated Feedback
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Overall Feedback</Label>
                <Textarea
                  value={manualFeedback}
                  onChange={e => setManualFeedback(e.target.value)}
                  className="mt-2"
                  rows={6}
                  placeholder="Edit the AI-generated feedback..."
                />
              </div>

              {aiResult.strengths.length > 0 && (
                <div>
                  <Label className="text-green-600">Strengths Identified</Label>
                  <ul className="mt-2 space-y-1">
                    {aiResult.strengths.map((strength, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm"
                      >
                        <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {aiResult.improvements.length > 0 && (
                <div>
                  <Label className="text-orange-600">
                    Areas for Improvement
                  </Label>
                  <ul className="mt-2 space-y-1">
                    {aiResult.improvements.map((improvement, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm"
                      >
                        <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-500" />
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rubric Tab */}
        <TabsContent value="rubric">
          <Card>
            <CardHeader>
              <CardTitle>Rubric-based Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              {aiResult.feedback.specific.length > 0 ? (
                <div className="space-y-4">
                  {aiResult.feedback.specific.map((item, index) => (
                    <div key={index} className="rounded-lg border p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <h4 className="font-medium">{item.criterion}</h4>
                        <Badge variant="outline">
                          {item.score} / {maxScore}
                        </Badge>
                      </div>
                      <p className="mb-3 text-sm text-muted-foreground">
                        {item.feedback}
                      </p>
                      {item.suggestions.length > 0 && (
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Suggestions:
                          </Label>
                          <ul className="mt-1 space-y-1">
                            {item.suggestions.map((suggestion, sIndex) => (
                              <li
                                key={sIndex}
                                className="flex items-start gap-1 text-xs text-muted-foreground"
                              >
                                <span>•</span>
                                {suggestion}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-muted-foreground">
                  No rubric-specific analysis available
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Issues Tab */}
        <TabsContent value="issues">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Flagged Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              {aiResult.flaggedIssues.length > 0 ? (
                <div className="space-y-3">
                  {aiResult.flaggedIssues.map((issue, index) => (
                    <Alert
                      key={index}
                      variant={
                        issue.type === 'plagiarism' ? 'destructive' : 'default'
                      }
                    >
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex items-center justify-between">
                          <span className="font-medium capitalize">
                            {issue.type.replace('_', ' ')}
                          </span>
                          <Badge variant="outline">
                            {(issue.confidence * 100).toFixed(1)}% confidence
                          </Badge>
                        </div>
                        <p className="mt-1">{issue.description}</p>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
                  <p className="text-muted-foreground">No issues detected</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Suggestions Tab */}
        <TabsContent value="suggestions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Teaching Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <TrendingUp className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Recommendation:</strong> This student would benefit
                    from additional practice in
                    {aiResult.improvements.slice(0, 2).join(' and ')}. Consider
                    providing targeted resources or one-on-one feedback
                    sessions.
                  </AlertDescription>
                </Alert>

                {aiResult.qualityIndicators.grammar < 0.7 && (
                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Grammar Support:</strong> Consider recommending
                      grammar checking tools or writing center resources to help
                      improve language mechanics.
                    </AlertDescription>
                  </Alert>
                )}

                {aiResult.qualityIndicators.coherence < 0.6 && (
                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Structure Help:</strong> This student may benefit
                      from outline templates or guided writing exercises to
                      improve organization and flow.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <Card>
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => handleAIGrading()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Re-analyze
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsManualReview(!isManualReview)}
            >
              <Edit className="mr-2 h-4 w-4" />
              {isManualReview ? 'Hide' : 'Show'} Manual Controls
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onCancel}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleAcceptGrade}>
              <Save className="mr-2 h-4 w-4" />
              Accept & Save Grade
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
