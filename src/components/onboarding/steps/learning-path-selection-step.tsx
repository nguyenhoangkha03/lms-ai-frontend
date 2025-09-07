'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Clock,
  Star,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Brain,
  TrendingUp,
  Sparkles,
  Search,
  RotateCcw,
  Eye,
  Code,
  Palette,
  BarChart3,
  Globe,
  Camera,
  Music,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { selectLearningPath } from '@/lib/redux/slices/onboarding-slice';
import {
  useGetRecommendedLearningPathsQuery,
  useGetAllLearningPathsQuery,
  useSelectLearningPathMutation,
  type LearningPath,
} from '@/lib/redux/api/onboarding-api';

// Simplified - no props needed

// Path category icons
const pathIcons: Record<string, React.ReactNode> = {
  technology: <Code className="h-5 w-5" />,
  design: <Palette className="h-5 w-5" />,
  business: <BarChart3 className="h-5 w-5" />,
  marketing: <TrendingUp className="h-5 w-5" />,
  data: <BarChart3 className="h-5 w-5" />,
  language: <Globe className="h-5 w-5" />,
  creative: <Camera className="h-5 w-5" />,
  music: <Music className="h-5 w-5" />,
  default: <BookOpen className="h-5 w-5" />,
};

// Level badges
const levelColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800',
};

export const LearningPathSelectionStep: React.FC = () => {
  const dispatch = useAppDispatch();
  const { selectedPath, assessmentResult } = useAppSelector(
    state => state.onboarding
  );

  const { data: recommendedPaths = [], isLoading: loadingRecommended } =
    useGetRecommendedLearningPathsQuery();
  const { data: allPaths = [], isLoading: loadingAll } =
    useGetAllLearningPathsQuery();
  const [selectPath, { isLoading: selecting }] =
    useSelectLearningPathMutation();

  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showDetails, setShowDetails] = useState<string | null>(null);

  // Filter paths based on search and filters
  const filteredPaths = allPaths.filter(path => {
    const matchesSearch =
      path.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      path.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === 'all' || path.level === levelFilter;
    const matchesCategory =
      categoryFilter === 'all' ||
      path.skills.some(skill =>
        skill.toLowerCase().includes(categoryFilter.toLowerCase())
      );

    return matchesSearch && matchesLevel && matchesCategory;
  });

  // Handle path selection
  const handleSelectPath = (path: LearningPath) => {
    dispatch(selectLearningPath(path));
    setShowDetails(null);
  };

  // Handle next step
  // Path selection logic will be handled by parent component

  // Get path category for icon
  const getPathCategory = (path: LearningPath) => {
    if (!path.skills || !Array.isArray(path.skills)) {
      return 'default';
    }

    const skills = path.skills.map(s => s.toLowerCase());
    if (skills.some(s => s.includes('programming') || s.includes('code')))
      return 'technology';
    if (skills.some(s => s.includes('design') || s.includes('ui')))
      return 'design';
    if (skills.some(s => s.includes('business') || s.includes('management')))
      return 'business';
    if (skills.some(s => s.includes('marketing') || s.includes('seo')))
      return 'marketing';
    if (skills.some(s => s.includes('data') || s.includes('analytics')))
      return 'data';
    return 'default';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2 text-center">
        <h3 className="text-2xl font-bold">Choose Your Learning Path</h3>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Based on your assessment and preferences, we've curated personalized
          learning paths for you.
        </p>
      </div>

      <Tabs defaultValue="recommended" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger
            value="recommended"
            className="flex items-center space-x-2"
          >
            <Sparkles className="h-4 w-4" />
            <span>AI Recommended</span>
          </TabsTrigger>
          <TabsTrigger value="browse" className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <span>Browse All</span>
          </TabsTrigger>
        </TabsList>

        {/* Recommended Paths Tab */}
        <TabsContent value="recommended" className="space-y-6">
          {loadingRecommended ? (
            <div className="flex items-center justify-center py-16">
              <div className="space-y-4 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="text-muted-foreground">
                  Generating personalized recommendations...
                </p>
              </div>
            </div>
          ) : (
            <>
              <Alert className="border-primary/20 bg-primary/5">
                <Brain className="h-4 w-4" />
                <AlertDescription>
                  <strong>AI Powered:</strong> These paths are specifically
                  tailored to your skills, preferences, and learning goals based
                  on your assessment results.
                </AlertDescription>
              </Alert>

              {/* Assessment-based recommendations */}
              {assessmentResult?.recommendations &&
                assessmentResult.recommendations.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="h-5 w-5 text-yellow-500" />
                      <h3 className="font-semibold">
                        Based on Your Assessment
                      </h3>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      {assessmentResult.recommendations.map(
                        (rec: any, index: number) => (
                          <Card
                            key={rec.id || index}
                            className="border-yellow-200 bg-yellow-50/50"
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-base">
                                  {rec.title}
                                </CardTitle>
                                <Badge
                                  variant="secondary"
                                  className="bg-yellow-100 text-yellow-800"
                                >
                                  {rec.level}
                                </Badge>
                              </div>
                              <CardDescription className="text-sm">
                                {rec.description}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
                                <span>Priority: {rec.priority}</span>
                                <span>Match: {rec.accuracyPercentage}</span>
                              </div>
                              <Button
                                size="sm"
                                className="w-full"
                                onClick={() => {
                                  // Convert assessment recommendation to learning path format
                                  const pathFromRec = {
                                    id: rec.id,
                                    title: rec.title,
                                    description: rec.description,
                                    level: rec.level,
                                    courses: [rec],
                                    skills: rec.skills || ['Web Development'], // Default skills if not provided
                                    prerequisites: rec.prerequisites || [],
                                    estimatedDuration:
                                      rec.estimatedDuration || '3 months',
                                    aiConfidence:
                                      parseFloat(
                                        rec.accuracyPercentage?.replace(
                                          '%',
                                          ''
                                        ) || '0'
                                      ) / 100,
                                  };
                                  handleSelectPath(pathFromRec);
                                }}
                              >
                                Select This Path
                              </Button>
                            </CardContent>
                          </Card>
                        )
                      )}
                    </div>
                  </div>
                )}

              <div className="grid gap-6 md:grid-cols-2">
                {recommendedPaths.map((path, index) => (
                  <RecommendedPathCard
                    key={path.id}
                    path={path}
                    index={index}
                    isSelected={selectedPath?.id === path.id}
                    onSelect={() => handleSelectPath(path)}
                    onViewDetails={() => setShowDetails(path.id)}
                    category={getPathCategory(path)}
                  />
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {/* Browse All Paths Tab */}
        <TabsContent value="browse" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <Input
                placeholder="Search learning paths..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="data">Data Science</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results */}
          {loadingAll ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPaths.map(path => (
                <BrowsePathCard
                  key={path.id}
                  path={path}
                  isSelected={selectedPath?.id === path.id}
                  onSelect={() => handleSelectPath(path)}
                  onViewDetails={() => setShowDetails(path.id)}
                  category={getPathCategory(path)}
                />
              ))}
            </div>
          )}

          {filteredPaths.length === 0 && !loadingAll && (
            <div className="space-y-4 py-16 text-center">
              <Search className="mx-auto h-12 w-12 text-muted-foreground" />
              <div>
                <h4 className="text-lg font-medium">No paths found</h4>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or browse recommended
                  paths.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setLevelFilter('all');
                  setCategoryFilter('all');
                }}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Selected path preview */}
      {selectedPath && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-primary/20 bg-primary/5 p-6"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="rounded-lg bg-primary/10 p-2">
                {pathIcons[getPathCategory(selectedPath)]}
              </div>
              <div>
                <h4 className="font-medium">Selected: {selectedPath.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedPath.courses.length} courses •{' '}
                  {selectedPath.estimatedDuration}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch(selectLearningPath(undefined as any))}
            >
              Change
            </Button>
          </div>
        </motion.div>
      )}

      {/* Selection status */}
      <div className="pt-6 text-center">
        {selectedPath ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-green-600">
              ✓ Selected: {selectedPath.title}
            </p>
            <p className="text-sm text-muted-foreground">
              Ready to complete setup? Click "Complete Setup" below.
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Please select a learning path to continue.
          </p>
        )}
      </div>

      {/* Path details modal */}
      {showDetails && (
        <PathDetailsModal
          path={
            allPaths.find(p => p.id === showDetails) ||
            recommendedPaths.find(p => p.id === showDetails)
          }
          onClose={() => setShowDetails(null)}
          onSelect={path => {
            handleSelectPath(path);
            setShowDetails(null);
          }}
          isSelected={selectedPath?.id === showDetails}
        />
      )}
    </div>
  );
};

// Recommended Path Card Component
const RecommendedPathCard: React.FC<{
  path: LearningPath;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onViewDetails: () => void;
  category: string;
}> = ({ path, index, isSelected, onSelect, onViewDetails, category }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
  >
    <Card
      className={`relative transition-all duration-200 hover:shadow-lg ${
        isSelected
          ? 'border-primary bg-primary/5 shadow-md'
          : 'hover:border-primary/50'
      }`}
    >
      {path.isRecommended && (
        <div className="absolute -right-2 -top-2">
          <Badge className="bg-primary text-primary-foreground">
            <Sparkles className="mr-1 h-3 w-3" />
            AI Pick
          </Badge>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-primary/10 p-2">
              {pathIcons[category]}
            </div>
            <div>
              <CardTitle className="text-lg">{path.title}</CardTitle>
              <div className="mt-1 flex items-center space-x-2">
                <Badge variant="outline" className={levelColors[path.level]}>
                  {path.level}
                </Badge>
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{path.aiConfidence}% match</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <CardDescription className="text-sm">
          {path.description}
        </CardDescription>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span>{path.courses.length} courses</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{path.estimatedDuration}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            {path.skills.slice(0, 3).map(skill => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {path.skills.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{path.skills.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            variant={isSelected ? 'default' : 'outline'}
            size="sm"
            onClick={onSelect}
            className="flex-1"
          >
            {isSelected ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Selected
              </>
            ) : (
              'Select Path'
            )}
          </Button>
          <Button variant="ghost" size="sm" onClick={onViewDetails}>
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// Browse Path Card Component
const BrowsePathCard: React.FC<{
  path: LearningPath;
  isSelected: boolean;
  onSelect: () => void;
  onViewDetails: () => void;
  category: string;
}> = ({ path, isSelected, onSelect, onViewDetails, category }) => (
  <Card
    className={`transition-all duration-200 hover:shadow-md ${
      isSelected ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
    }`}
  >
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <div className="rounded bg-muted p-1.5">{pathIcons[category]}</div>
          <div>
            <CardTitle className="text-base">{path.title}</CardTitle>
            <Badge
              variant="outline"
              className={`${levelColors[path.level]} text-xs`}
            >
              {path.level}
            </Badge>
          </div>
        </div>
      </div>
    </CardHeader>

    <CardContent className="space-y-3">
      <CardDescription className="line-clamp-2 text-sm">
        {path.description}
      </CardDescription>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{path.courses.length} courses</span>
        <span>{path.estimatedDuration}</span>
      </div>

      <div className="flex space-x-2">
        <Button
          variant={isSelected ? 'default' : 'outline'}
          size="sm"
          onClick={onSelect}
          className="flex-1 text-xs"
        >
          {isSelected ? 'Selected' : 'Select'}
        </Button>
        <Button variant="ghost" size="sm" onClick={onViewDetails}>
          <Eye className="h-3 w-3" />
        </Button>
      </div>
    </CardContent>
  </Card>
);

// Path Details Modal Component
const PathDetailsModal: React.FC<{
  path?: LearningPath;
  onClose: () => void;
  onSelect: (path: LearningPath) => void;
  isSelected: boolean;
}> = ({ path, onClose, onSelect, isSelected }) => {
  if (!path) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-background shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="space-y-6 p-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold">{path.title}</h3>
              <div className="mt-2 flex items-center space-x-2">
                <Badge variant="outline" className={levelColors[path.level]}>
                  {path.level}
                </Badge>
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{path.estimatedDuration}</span>
                </div>
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  <span>{path.courses.length} courses</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>

          {/* Description */}
          <div>
            <h4 className="mb-2 font-medium">About this path</h4>
            <p className="text-muted-foreground">{path.description}</p>
          </div>

          {/* Skills */}
          <div>
            <h4 className="mb-2 font-medium">Skills you'll learn</h4>
            <div className="flex flex-wrap gap-2">
              {path.skills.map(skill => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* Prerequisites */}
          {path.prerequisites.length > 0 && (
            <div>
              <h4 className="mb-2 font-medium">Prerequisites</h4>
              <ul className="space-y-1">
                {path.prerequisites.map((prereq, index) => (
                  <li
                    key={index}
                    className="flex items-center space-x-2 text-sm"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                    <span>{prereq}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Course breakdown */}
          <div>
            <h4 className="mb-2 font-medium">Course breakdown</h4>
            <div className="space-y-2">
              {path.courses.map((course, index) => (
                <div
                  key={course.id}
                  className="flex items-center space-x-3 rounded-lg bg-muted/50 p-3"
                >
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{course.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {course.description}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {course.duration}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            <Button
              onClick={() => onSelect(path)}
              className="flex-1"
              variant={isSelected ? 'default' : 'default'}
            >
              {isSelected ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Selected
                </>
              ) : (
                'Select This Path'
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
