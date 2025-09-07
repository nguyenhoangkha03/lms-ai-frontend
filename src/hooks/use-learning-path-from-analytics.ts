'use client';

import { useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { LearningPathStep, AIAdaptation, AdaptiveLearningPath } from '@/lib/types/ai-recommendation';

interface AnalyticsData {
  selectedCategory?: string;
  welcomeCompleted?: boolean;
  learningPathSelected?: boolean;
  selectedLearningPath?: {
    id: string;
    level: string;
    title: string;
    skills: string[];
    courses: Array<{
      id: string;
      level: string;
      title: string;
      priority: string;
      dataSource: string;
      orderIndex: number;
      wrongRatio: number;
      description: string;
      correctRatio: number;
      priorityScore: number;
      accuracyPercentage: string;
      wrongEasyQuestions: number;
    }>;
    description: string;
    aiConfidence: number;
    prerequisites: string[];
    estimatedDuration: string;
  };
  skillAssessmentResults?: {
    strategy: string;
    skillScores: Record<string, number>;
    overallScore: number;
    recommendations: any[];
    strategyConfidence: number;
    totalRecommendations: number;
  };
  recommendedLearningPath?: Array<{
    id: string;
    level: string;
    order: number;
    title: string;
    courses: any[];
    priority: string;
    description: string;
  }>;
  skillAssessmentCompleted?: boolean;
  preferencesSetupCompleted?: boolean;
}

// Remove custom interface since we're using the one from types

export function useLearningPathFromAnalytics() {
  const { user } = useAuth();
  
  // Debug logs
  console.log('🔍 useLearningPathFromAnalytics - user:', user);
  console.log('🔍 studentProfile:', user?.studentProfile);
  console.log('🔍 analyticsData raw:', user?.studentProfile?.analyticsData);
  
  const analyticsData: AnalyticsData | null = useMemo(() => {
    if (!user?.studentProfile?.analyticsData) {
      console.log('❌ No analyticsData found in user.studentProfile');
      return null;
    }
    
    try {
      const parsed = typeof user.studentProfile.analyticsData === 'string' 
        ? JSON.parse(user.studentProfile.analyticsData)
        : user.studentProfile.analyticsData;
      
      console.log('✅ Parsed analyticsData:', parsed);
      return parsed;
    } catch (error) {
      console.error('❌ Failed to parse analyticsData:', error);
      return null;
    }
  }, [user?.studentProfile?.analyticsData]);

  const learningPath: AdaptiveLearningPath | null = useMemo(() => {
    if (!analyticsData || !analyticsData.selectedLearningPath) {
      console.log('❌ No selectedLearningPath found, showing mock data');
      
      // Return mock data for testing
      return {
        id: 'mock-learning-path',
        studentId: user?.id || 'current-user',
        title: 'Complete Web Development Bootcamp 2024 (Mock)',
        description: 'Mock learning path - real data not found in analyticsData',
        difficulty: 'beginner' as const,
        status: 'active' as const,
        estimatedDuration: 180,
        progress: {
          currentStep: 0,
          totalSteps: 1,
          completedSteps: 0,
          percentageComplete: 0,
          estimatedTimeRemaining: 180
        },
        steps: [{
          id: 'mock-step-1',
          pathId: 'mock-learning-path',
          title: 'Complete Web Development Bootcamp 2024',
          description: 'beginner level course with 28.6% accuracy',
          type: 'lesson' as const,
          status: 'in_progress' as const,
          order: 1,
          difficulty: 4,
          estimatedDuration: 120,
          prerequisites: [],
          learningObjectives: [
            'Master Complete Web Development Bootcamp 2024',
            'Improve accuracy from 28.6% to 80%+',
            'Understand core concepts and apply them effectively'
          ],
          resources: [
            {
              id: 'mock-video',
              title: 'Complete Web Development Bootcamp 2024 - Video Lessons',
              type: 'video' as const,
              url: '/student/courses/45562ff5-4652-4b22-854b-279cffcc5963',
              duration: 60,
              isRequired: true,
              description: 'Comprehensive video lessons'
            }
          ],
          assessment: {
            type: 'quiz',
            passingScore: 80,
            maxAttempts: 3,
            timeLimit: 45
          },
          aiRecommendations: [
            'Focus on areas where you scored 28.6%',
            'This course has CRITICAL priority based on your performance',
            'Practice more with easy questions you got wrong'
          ],
          completedAt: undefined,
          score: undefined,
          feedback: undefined,
          adaptations: [],
          engagementMetrics: {
            timeSpent: 0,
            interactionCount: 0,
            lastAccessedAt: new Date().toISOString()
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }],
        aiAdaptations: [],
        learningStyle: {
          visualPreference: 0.8,
          auditoryPreference: 0.6,
          kinestheticPreference: 0.7,
          readingPreference: 0.5,
          pace: 'slow' as const,
          preferredTimeOfDay: 'morning' as const,
          sessionDuration: 60
        },
        performance: {
          overallScore: 0.286,
          strengthAreas: ['Web Development'],
          improvementAreas: ['Complete Web Development Bootcamp 2024'],
          consistencyScore: 0.8,
          engagementScore: 0.286,
          completionRate: 0,
          timeInvested: 0,
          averageSessionDuration: 60,
          streakCount: 1,
          adaptationHistory: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        nextRecommendation: {
          stepId: 'mock-step-1',
          reason: 'Based on your INTENSIVE_FOUNDATION strategy, we recommend focusing on foundational concepts first.',
          confidence: 0.83,
          estimatedDifficulty: 2
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    const { selectedLearningPath, skillAssessmentResults, recommendedLearningPath } = analyticsData;

    // Convert courses to learning steps
    const steps: LearningPathStep[] = selectedLearningPath.courses.map((course, index) => ({
      id: course.id,
      pathId: selectedLearningPath.id,
      title: course.title,
      description: course.description,
      type: 'lesson' as const,
      status: index === 0 ? 'in_progress' : 'available' as const,
      order: course.orderIndex,
      difficulty: course.wrongRatio > 0.7 ? 5 : course.wrongRatio > 0.5 ? 4 : course.wrongRatio > 0.3 ? 3 : 2,
      estimatedDuration: 120, // Default 2 hours per course
      prerequisites: [],
      learningObjectives: [
        `Master ${course.title}`,
        `Improve accuracy from ${course.accuracyPercentage} to 80%+`,
        `Understand core concepts and apply them effectively`
      ],
      resources: [
        {
          id: `${course.id}-video`,
          title: `${course.title} - Video Lessons`,
          type: 'video' as const,
          url: `/student/courses/${course.id}`,
          duration: 60,
          isRequired: true,
          description: `Comprehensive video lessons for ${course.title}`
        },
        {
          id: `${course.id}-practice`,
          title: `${course.title} - Practice Exercises`,
          type: 'interactive' as const,
          url: `/student/courses/${course.id}/practice`,
          duration: 30,
          isRequired: false,
          description: 'Interactive practice exercises to reinforce learning'
        }
      ],
      assessment: {
        type: 'quiz',
        passingScore: 80,
        maxAttempts: 3,
        timeLimit: 45
      },
      aiRecommendations: [
        `Focus on areas where you scored ${course.accuracyPercentage}`,
        `This course has ${course.priority} priority based on your performance`,
        `Practice more with ${course.wrongEasyQuestions} wrong easy questions identified`
      ],
      completedAt: undefined,
      score: undefined,
      feedback: undefined,
      adaptations: [],
      engagementMetrics: {
        timeSpent: 0,
        interactionCount: 0,
        lastAccessedAt: new Date().toISOString()
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    // Add assessment steps between courses
    const stepsWithAssessments: LearningPathStep[] = [];
    steps.forEach((step, index) => {
      stepsWithAssessments.push(step);
      
      if (index < steps.length - 1) {
        stepsWithAssessments.push({
          id: `assessment-${step.id}`,
          pathId: selectedLearningPath.id,
          title: `Assessment: ${step.title}`,
          description: `Test your knowledge of ${step.title}`,
          type: 'assessment',
          status: 'locked',
          order: step.order + 0.5,
          difficulty: step.difficulty,
          estimatedDuration: 30,
          prerequisites: [step.title],
          learningObjectives: [`Demonstrate mastery of ${step.title}`],
          resources: [],
          assessment: {
            type: 'quiz',
            passingScore: 80,
            maxAttempts: 3,
            timeLimit: 30
          },
          aiRecommendations: [`Complete ${step.title} before taking this assessment`],
          completedAt: undefined,
          score: undefined,
          feedback: undefined,
          adaptations: [],
          engagementMetrics: {
            timeSpent: 0,
            interactionCount: 0,
            lastAccessedAt: new Date().toISOString()
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    });

    const totalSteps = stepsWithAssessments.length;
    const completedSteps = stepsWithAssessments.filter(s => s.status === 'completed').length;
    const percentageComplete = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    return {
      id: selectedLearningPath.id,
      studentId: user?.id || 'current-user',
      title: selectedLearningPath.title,
      description: selectedLearningPath.description,
      difficulty: selectedLearningPath.level as 'beginner' | 'intermediate' | 'advanced',
      status: 'active' as const,
      estimatedDuration: parseInt(selectedLearningPath.estimatedDuration?.replace(/\D/g, '') || '180'), // Extract numbers from "3 months" -> 180 hours
      progress: {
        currentStep: 0,
        totalSteps,
        completedSteps,
        percentageComplete,
        estimatedTimeRemaining: (totalSteps - completedSteps) * 90 // 1.5 hours per remaining step
      },
      steps: stepsWithAssessments,
      aiAdaptations: [
        {
          id: 'initial-setup',
          pathId: selectedLearningPath.id,
          adaptationType: 'path_creation',
          reason: `Learning path created based on skill assessment results. Strategy: ${skillAssessmentResults?.strategy}`,
          confidence: skillAssessmentResults?.strategyConfidence || 0.8,
          timestamp: new Date().toISOString(),
          beforeState: {},
          afterState: { courses: selectedLearningPath.courses.length },
          effectiveness: undefined,
          metadata: {
            strategy: skillAssessmentResults?.strategy,
            overallScore: skillAssessmentResults?.overallScore
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      learningStyle: {
        visualPreference: 0.8,
        auditoryPreference: 0.6,
        kinestheticPreference: 0.7,
        readingPreference: 0.5,
        pace: selectedLearningPath.level === 'beginner' ? 'slow' : 'normal' as const,
        preferredTimeOfDay: 'morning' as const,
        sessionDuration: 60
      },
      performance: {
        overallScore: (skillAssessmentResults?.overallScore || 0) / 100,
        strengthAreas: selectedLearningPath.skills,
        improvementAreas: selectedLearningPath.courses
          .filter(c => c.wrongRatio > 0.5)
          .map(c => c.title),
        consistencyScore: 0.8, // Default
        engagementScore: selectedLearningPath.aiConfidence,
        completionRate: percentageComplete / 100,
        timeInvested: completedSteps * 90,
        averageSessionDuration: 60,
        streakCount: 1,
        adaptationHistory: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      nextRecommendation: {
        stepId: stepsWithAssessments[0]?.id || 'first-step',
        reason: `Based on your ${skillAssessmentResults?.strategy || 'INTENSIVE_FOUNDATION'} strategy, we recommend focusing on foundational concepts first.`,
        confidence: skillAssessmentResults?.strategyConfidence || 0.8,
        estimatedDifficulty: selectedLearningPath.level === 'beginner' ? 2 : 
                            selectedLearningPath.level === 'intermediate' ? 3 : 4
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }, [analyticsData]);

  return {
    data: learningPath,
    isLoading: false,
    isError: !user || (!analyticsData && !learningPath), // Show error only if no user or no data at all
    error: !user 
      ? new Error('User not authenticated') 
      : (!analyticsData && !learningPath) 
        ? new Error('No analytics data found') 
        : null,
    refetch: () => {
      // This would typically refetch from API, but we're using local data
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }
  };
}