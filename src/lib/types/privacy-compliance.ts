export interface DataProtectionRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type:
    | 'access'
    | 'rectification'
    | 'erasure'
    | 'portability'
    | 'restriction'
    | 'objection';
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requestDate: string;
  completionDate?: string;
  dueDate: string;
  description: string;
  attachments?: string[];
  processingNotes?: string;
  legalBasis?: string;
  assignedTo?: string;
  estimatedCompletionTime: number;
  dataTypes: string[];
}

export interface ConsentRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  consentType:
    | 'marketing'
    | 'analytics'
    | 'functional'
    | 'performance'
    | 'third_party';
  status: 'given' | 'withdrawn' | 'expired' | 'pending';
  consentDate: string;
  withdrawalDate?: string;
  expiryDate?: string;
  version: string;
  ipAddress: string;
  userAgent: string;
  consentMethod: 'explicit' | 'implicit' | 'opt_in' | 'opt_out';
  legalBasis: string;
  purposes: string[];
}

export interface ComplianceAuditRecord {
  id: string;
  auditType: 'gdpr' | 'ccpa' | 'internal' | 'external';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  startDate: string;
  endDate?: string;
  auditor: string;
  scope: string[];
  findings: Array<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    description: string;
    recommendation: string;
    status: 'open' | 'in_progress' | 'resolved';
  }>;
  complianceScore: number;
  reportUrl?: string;
  nextAuditDate?: string;
}
