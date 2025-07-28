export const ONBOARDING_STEPS = {
  WELCOME: 1,
  SKILL_ASSESSMENT: 2,
  PREFERENCES_SETUP: 3,
  LEARNING_PATH_SELECTION: 4,
  WELCOME_DASHBOARD: 5,
} as const;

export const TOTAL_ONBOARDING_STEPS = 5;

export const LEARNING_STYLES = [
  {
    id: 'visual',
    label: 'Visual Learner',
    description: 'Learn best through images, diagrams, and visual content',
    characteristics: [
      'Charts and graphs',
      'Visual demonstrations',
      'Mind maps',
      'Infographics',
    ],
  },
  {
    id: 'auditory',
    label: 'Auditory Learner',
    description: 'Prefer listening to lectures, podcasts, and discussions',
    characteristics: [
      'Audio lectures',
      'Group discussions',
      'Verbal explanations',
      'Podcasts',
    ],
  },
  {
    id: 'kinesthetic',
    label: 'Kinesthetic Learner',
    description: 'Learn by doing, hands-on practice, and experimentation',
    characteristics: [
      'Interactive labs',
      'Hands-on projects',
      'Simulations',
      'Physical practice',
    ],
  },
  {
    id: 'reading',
    label: 'Reading/Writing',
    description: 'Prefer reading materials and taking written notes',
    characteristics: [
      'Text-based content',
      'Written assignments',
      'Note-taking',
      'Reading lists',
    ],
  },
] as const;

export const STUDY_TIME_OPTIONS = [
  {
    id: 'morning',
    label: 'Morning Person',
    timeRange: '6:00 AM - 12:00 PM',
    description: 'Most focused in the morning hours',
    benefits: ['Peak mental clarity', 'Fewer distractions', 'Fresh mindset'],
  },
  {
    id: 'afternoon',
    label: 'Afternoon Focus',
    timeRange: '12:00 PM - 6:00 PM',
    description: 'Productive during afternoon hours',
    benefits: ['Post-lunch energy', 'Good for collaboration', 'Steady focus'],
  },
  {
    id: 'evening',
    label: 'Evening Learner',
    timeRange: '6:00 PM - 10:00 PM',
    description: 'Study best in the evening',
    benefits: ['Quiet environment', "Day's tasks completed", 'Relaxed pace'],
  },
  {
    id: 'night',
    label: 'Night Owl',
    timeRange: '10:00 PM - 2:00 AM',
    description: 'Late night is peak performance time',
    benefits: ['Deep focus', 'Minimal interruptions', 'Creative thinking'],
  },
] as const;

export const DIFFICULTY_PREFERENCES = [
  {
    id: 'beginner',
    label: 'Start Easy',
    description: 'Begin with fundamentals and build up gradually',
    approach: 'Foundation-first learning with comprehensive basics',
  },
  {
    id: 'intermediate',
    label: 'Balanced Approach',
    description: 'Mix of basic and intermediate concepts',
    approach: 'Structured progression with practical applications',
  },
  {
    id: 'advanced',
    label: 'Challenge Me',
    description: 'Dive into complex topics right away',
    approach: 'Advanced concepts with minimal prerequisite review',
  },
  {
    id: 'mixed',
    label: 'Adaptive Difficulty',
    description: 'Let AI adjust difficulty based on progress',
    approach: 'Dynamic difficulty adjustment based on performance',
  },
] as const;

export const SESSION_DURATIONS = [
  { value: 15, label: '15 minutes', description: 'Quick learning sessions' },
  { value: 30, label: '30 minutes', description: 'Standard focused sessions' },
  { value: 45, label: '45 minutes', description: 'Deep dive sessions' },
  { value: 60, label: '1 hour', description: 'Comprehensive study blocks' },
  { value: 90, label: '1.5 hours', description: 'Extended learning periods' },
] as const;

export const COMMON_LEARNING_GOALS = [
  'Career Advancement',
  'Skill Development',
  'Academic Success',
  'Personal Growth',
  'Industry Certification',
  'Job Preparation',
  'Hobby Learning',
  'Professional Development',
  'Entrepreneurship',
  'Technology Mastery',
  'Creative Expression',
  'Leadership Skills',
] as const;

export const INTEREST_CATEGORIES = [
  {
    id: 'technology',
    label: 'Technology',
    subcategories: ['Programming', 'AI/ML', 'Cybersecurity', 'Web Development'],
  },
  {
    id: 'design',
    label: 'Design',
    subcategories: ['UI/UX', 'Graphic Design', 'Product Design', 'Animation'],
  },
  {
    id: 'business',
    label: 'Business',
    subcategories: ['Management', 'Strategy', 'Finance', 'Operations'],
  },
  {
    id: 'marketing',
    label: 'Marketing',
    subcategories: [
      'Digital Marketing',
      'Content Marketing',
      'SEO',
      'Social Media',
    ],
  },
  {
    id: 'data',
    label: 'Data Science',
    subcategories: [
      'Analytics',
      'Machine Learning',
      'Statistics',
      'Visualization',
    ],
  },
  {
    id: 'language',
    label: 'Languages',
    subcategories: ['English', 'Spanish', 'French', 'Mandarin'],
  },
  {
    id: 'creative',
    label: 'Creative Arts',
    subcategories: ['Photography', 'Video Production', 'Writing', 'Music'],
  },
  {
    id: 'health',
    label: 'Health & Wellness',
    subcategories: ['Fitness', 'Nutrition', 'Mental Health', 'Medicine'],
  },
] as const;

export const ASSESSMENT_CATEGORIES = [
  {
    id: 'technical',
    label: 'Technical Skills',
    description: 'Programming, tools, and technical competencies',
    weight: 0.3,
  },
  {
    id: 'analytical',
    label: 'Analytical Thinking',
    description: 'Problem-solving and logical reasoning abilities',
    weight: 0.25,
  },
  {
    id: 'creative',
    label: 'Creative Thinking',
    description: 'Innovation, design, and creative problem-solving',
    weight: 0.2,
  },
  {
    id: 'communication',
    label: 'Communication',
    description: 'Verbal, written, and presentation skills',
    weight: 0.15,
  },
  {
    id: 'learning',
    label: 'Learning Ability',
    description: 'Adaptability and learning preferences',
    weight: 0.1,
  },
] as const;

export const ONBOARDING_PROGRESS_KEYS = {
  CURRENT_STEP: 'onboarding_current_step',
  SKILL_ASSESSMENT_COMPLETED: 'skill_assessment_completed',
  PREFERENCES_SET: 'preferences_set',
  LEARNING_PATH_SELECTED: 'learning_path_selected',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  ASSESSMENT_RESULT: 'assessment_result',
  SELECTED_PATH: 'selected_learning_path',
  PREFERENCES: 'learning_preferences',
} as const;

export const AI_RECOMMENDATION_CONFIDENCE_THRESHOLDS = {
  HIGH: 0.8,
  MEDIUM: 0.6,
  LOW: 0.4,
} as const;

export const ONBOARDING_ANALYTICS_EVENTS = {
  STEP_STARTED: 'onboarding_step_started',
  STEP_COMPLETED: 'onboarding_step_completed',
  STEP_SKIPPED: 'onboarding_step_skipped',
  ASSESSMENT_STARTED: 'skill_assessment_started',
  ASSESSMENT_COMPLETED: 'skill_assessment_completed',
  PREFERENCES_SAVED: 'learning_preferences_saved',
  PATH_SELECTED: 'learning_path_selected',
  ONBOARDING_COMPLETED: 'onboarding_flow_completed',
  ONBOARDING_ABANDONED: 'onboarding_abandoned',
  HELP_VIEWED: 'onboarding_help_viewed',
  BACK_NAVIGATION: 'onboarding_back_pressed',
  SKIP_ATTEMPTED: 'onboarding_skip_attempted',
} as const;

export const DEFAULT_LEARNING_PREFERENCES = {
  preferredLearningStyle: 'visual' as const,
  studyTimePreference: 'morning' as const,
  sessionDuration: 30,
  difficultyPreference: 'beginner' as const,
  notificationPreferences: {
    email: true,
    push: true,
    reminders: true,
    achievements: true,
  },
  goals: [] as string[],
  interests: [] as string[],
  availableHoursPerWeek: 5,
} as const;

export const ONBOARDING_TOOLTIPS = {
  LEARNING_STYLE: {
    title: 'Learning Style',
    content:
      'Understanding your preferred learning style helps us recommend the most effective content format for you.',
  },
  STUDY_TIME: {
    title: 'Optimal Study Time',
    content:
      "When is your brain most alert? We'll schedule your learning sessions during your peak hours.",
  },
  SESSION_DURATION: {
    title: 'Session Length',
    content:
      'How long can you focus effectively? Shorter sessions with breaks often work better than marathon study periods.',
  },
  DIFFICULTY: {
    title: 'Difficulty Preference',
    content:
      'Would you prefer to start with basics or jump into challenging material? We can adjust based on your comfort level.',
  },
  GOALS: {
    title: 'Learning Goals',
    content:
      'What do you hope to achieve? Your goals help us suggest relevant courses and track meaningful progress.',
  },
  INTERESTS: {
    title: 'Areas of Interest',
    content:
      "Which topics excite you? We'll prioritize recommendations in your areas of interest.",
  },
  WEEKLY_HOURS: {
    title: 'Available Time',
    content:
      "How much time can you realistically dedicate to learning each week? Be honest - we'll create a sustainable schedule.",
  },
} as const;

export const ONBOARDING_ERRORS = {
  NETWORK_ERROR:
    'Network connection error. Please check your internet connection.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  ASSESSMENT_TIMEOUT: 'Assessment session has timed out. Please restart.',
  PREFERENCES_SAVE_ERROR: 'Failed to save preferences. Please try again.',
  PATH_SELECTION_ERROR: 'Failed to select learning path. Please try again.',
  GENERAL_ERROR: 'Something went wrong. Please refresh and try again.',
} as const;
