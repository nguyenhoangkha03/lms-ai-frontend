// Step Components
export { default as BasicInfoStep } from './steps/basic-info-step';
export { default as CurriculumBuilderStep } from './steps/curriculum-builder-step';
export { default as ContentUploadStep } from './steps/content-upload-step';
export { default as PricingStep } from './steps/pricing-step';
export { default as SettingsStep } from './steps/settings-step';
export { default as ReviewStep } from './steps/review-step';

// Upload Components
export { default as DirectVideoUpload } from './upload/DirectVideoUpload';
export { default as TrailerUploadExample } from './upload/TrailerUploadExample';
export { default as ContentUploader } from './upload/content-uploader';

// Builder Components
export { default as CurriculumBuilder } from './builders/curriculum-builder';

// AI Components
export { default as AISuggestionsPanel } from './ai/ai-suggestions-panel';

// Legacy exports for backward compatibility
export { default as CurriculumBuilderLegacy } from '../../../course-creation/curriculum-builder';
export { default as ContentUploaderLegacy } from '../../../course-creation/content-uploader';