'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Code,
  Palette,
  BarChart3,
  Camera,
  Users,
  Music,
  Cpu,
  CheckCircle,
  Search,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAppSelector } from '@/lib/redux/hooks';
import { useGetRootCategoriesQuery, type Category } from '@/lib/redux/api/onboarding-api';
import { cn } from '@/lib/utils';


interface CategorySelectionStepProps {
  onCategorySelect: (categoryId: string) => void;
  selectedCategory?: string;
}

// Default icons for categories if iconUrl is not provided
const categoryIcons: Record<string, React.ReactNode> = {
  programming: <Code className="h-8 w-8" />,
  design: <Palette className="h-8 w-8" />,
  business: <BarChart3 className="h-8 w-8" />,
  photography: <Camera className="h-8 w-8" />,
  music: <Music className="h-8 w-8" />,
  technology: <Cpu className="h-8 w-8" />,
  marketing: <Users className="h-8 w-8" />,
  default: <BookOpen className="h-8 w-8" />,
};

export const CategorySelectionStep: React.FC<CategorySelectionStepProps> = ({
  onCategorySelect,
  selectedCategory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: response, isLoading, error } = useGetRootCategoriesQuery();
  const categories = response?.categories;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  // Filter categories based on search query
  const filteredCategories = categories?.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const getCategoryIcon = (category: Category) => {
    if (category.iconUrl) {
      return (
        <img 
          src={category.iconUrl} 
          alt={category.name}
          className="h-8 w-8 object-contain" 
        />
      );
    }
    
    // Try to match by slug or name
    const iconKey = category.slug.toLowerCase();
    return categoryIcons[iconKey] || categoryIcons.default;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load categories. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-4 text-center"
      >
        <div className="relative inline-flex items-center justify-center p-4">
          <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-primary/20 to-secondary/20" />
          <BookOpen className="relative z-10 h-16 w-16 text-primary" />
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-bold">Choose Your Learning Focus</h3>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Select the main subject area you want to learn about. This will help us create 
            a personalized skill assessment just for you.
          </p>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative mx-auto max-w-md"
      >
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </motion.div>

      {/* Categories Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {filteredCategories.map((category) => {
          const isSelected = selectedCategory === category.id;
          
          return (
            <motion.div key={category.id} variants={itemVariants}>
              <Card
                className={cn(
                  "cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg group",
                  isSelected && "ring-2 ring-primary border-primary/50 shadow-lg"
                )}
                onClick={() => onCategorySelect(category.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div 
                      className={cn(
                        "rounded-lg p-3 transition-colors",
                        category.color 
                          ? `bg-[${category.color}]/10 text-[${category.color}]` 
                          : "bg-primary/10 text-primary",
                        "group-hover:scale-110"
                      )}
                    >
                      {getCategoryIcon(category)}
                    </div>
                    
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CheckCircle className="h-6 w-6 text-primary" />
                      </motion.div>
                    )}
                  </div>
                  
                  <CardTitle className="text-lg font-semibold">
                    {category.name}
                  </CardTitle>
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {category.courseCount} courses
                    </Badge>
                  </div>
                </CardHeader>
                
                {category.description && (
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed">
                      {category.description}
                    </CardDescription>
                  </CardContent>
                )}
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* No results */}
      {filteredCategories.length === 0 && searchQuery && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-16 text-center"
        >
          <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">
            No categories found matching "{searchQuery}"
          </p>
        </motion.div>
      )}

      {/* Selection Info */}
      {selectedCategory && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Great choice! Your skill assessment will be customized based on{' '}
              <strong>
                {categories?.find(c => c.id === selectedCategory)?.name}
              </strong>
              . This will help us provide more accurate recommendations.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Call to action */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="space-y-4 text-center"
      >
        <p className="text-sm text-muted-foreground">
          Don't worry - you can explore other categories after completing your assessment.
        </p>
        
        {selectedCategory && (
          <p className="text-sm font-medium text-primary">
            Ready to continue? Click "Next" to start your personalized assessment.
          </p>
        )}
      </motion.div>
    </div>
  );
};