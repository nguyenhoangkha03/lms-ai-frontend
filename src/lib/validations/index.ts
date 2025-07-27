export * from './auth-schemas';
export * from './course-schemas';
export * from './user-schemas';
export * from './common-schemas';

export type {
  LoginFormData,
  RegisterFormData,
  ForgotPasswordFormData,
  ResetPasswordFormData,
  ChangePasswordFormData,
  TwoFactorFormData,
  TeacherApplicationFormData,
} from './auth-schemas';

export type {
  CourseFormData,
  LessonFormData,
  SectionFormData,
  AssessmentFormData,
  QuestionFormData,
} from './course-schemas';

export type {
  ProfileFormData,
  StudentProfileFormData,
  TeacherProfileFormData,
  NotificationPreferencesFormData,
} from './user-schemas';

export type {
  SearchFormData,
  ContactFormData,
  FeedbackFormData,
} from './common-schemas';
