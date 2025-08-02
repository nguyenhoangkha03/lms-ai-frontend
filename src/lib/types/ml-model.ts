export interface MLModel {
  id: string;
  name: string;
  description: string;
  type: string;
  version: string;
  status: 'active' | 'training' | 'disabled' | 'error';
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  lastTrained: string;
  predictionCount: number;
  avgResponseTime: number;
  resourceUsage: {
    cpu: number;
    memory: number;
    gpu?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ModelVersion {
  id: string;
  modelId: string;
  version: string;
  description: string;
  status: 'draft' | 'training' | 'testing' | 'deployed' | 'archived';
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  };
  artifacts: {
    modelPath: string;
    dockerImage: string;
    configFile: string;
  };
  createdAt: string;
  deployedAt?: string;
}

export interface ABTest {
  id: string;
  name: string;
  description: string;
  controlModel: string;
  testModel: string;
  status: 'draft' | 'running' | 'completed' | 'paused';
  trafficSplit: number;
  startDate: string;
  endDate: string;
  results?: {
    controlMetric: number;
    testMetric: number;
    confidence: number;
    significance: number;
  };
}

export interface PredictionRecord {
  id: string;
  modelId: string;
  predictionType: string;
  inputData: any;
  prediction: any;
  actualOutcome?: any;
  confidence: number;
  accuracy?: number;
  timestamp: string;
  processingTime: number;
  wasCorrect?: boolean;
}

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'critical';
  models: Array<{
    id: string;
    name: string;
    status: string;
    lastUpdate: string;
    errorRate: number;
  }>;
  lastModelUpdate: string;
  totalPredictions: number;
  avgAccuracy: number;
}
