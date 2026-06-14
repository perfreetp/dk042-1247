export interface Comment {
  id: string;
  content: string;
  author: string;
  createdAt: string;
}

export interface Risk {
  id: string;
  content: string;
  level: 'low' | 'medium' | 'high';
  author: string;
}

export interface Inspiration {
  id: string;
  title: string;
  description: string;
  targetPlayer: string;
  rewardType: string;
  launchWindow: string;
  referenceActivity: string;
  tags: string[];
  likes: number;
  author: string;
  createdAt: string;
  isLiked: boolean;
  comments: Comment[];
  risks: Risk[];
}

export type MaterialType = 'poster' | 'competitor' | 'sketch' | 'other';

export interface Material {
  id: string;
  title: string;
  url: string;
  type: MaterialType;
  tags: string[];
  uploadedAt: string;
}

export interface ResourceRequirement {
  id: string;
  type: string;
  description: string;
  quantity: number;
}

export interface Metric {
  id: string;
  name: string;
  target: number;
  unit: string;
}

export type DraftStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'running' | 'completed';

export interface Draft {
  id: string;
  title: string;
  description: string;
  status: DraftStatus;
  resourceRequirements: ResourceRequirement[];
  metrics: Metric[];
  owner: string;
  startDate: string;
  endDate: string;
  relatedInspirationIds: string[];
  createdAt: string;
}

export type EvaluationDecision = 'approved' | 'rejected' | 'pending';

export interface Evaluation {
  id: string;
  draftId: string;
  riskScore: number;
  resourceScore: number;
  benefitScore: number;
  decision: EvaluationDecision;
  evaluator: string;
  comment: string;
  evaluatedAt: string;
}

export interface ActualMetric {
  id: string;
  name: string;
  actual: number;
  target: number;
  unit: string;
}

export interface Review {
  id: string;
  draftId: string;
  actualMetrics: ActualMetric[];
  summary: string;
  lessonsLearned: string;
  improvements: string;
  completedAt: string;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: 'member' | 'manager';
}

export type TagCategory = 'all' | 'festival' | 'payment' | 'retention' | 'other';
