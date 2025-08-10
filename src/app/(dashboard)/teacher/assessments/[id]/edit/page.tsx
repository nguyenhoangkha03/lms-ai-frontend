import { AssessmentBuilder } from '@/components/teacher/assessment/AssessmentBuilder';

interface EditAssessmentPageProps {
  params: {
    id: string;
  };
}

export default function EditAssessmentPage({
  params,
}: EditAssessmentPageProps) {
  return (
    <div className="container mx-auto py-6">
      <AssessmentBuilder mode="edit" assessmentId={params.id} />
    </div>
  );
}
