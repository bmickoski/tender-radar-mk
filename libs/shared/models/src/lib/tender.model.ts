export type TenderStage = 'new' | 'changed' | 'tracked' | 'closing-soon';

export interface TenderChange {
  id: string;
  label: string;
  summary: string;
  changedAt: string;
}

export interface Tender {
  id: string;
  title: string;
  description: string;
  authority: string;
  region: string;
  category: string;
  cpvCode: string;
  budgetEstimate?: number;
  deadline: string;
  publishedAt: string;
  submissionMethod: string;
  bidBond: string;
  requiredCertificates: string[];
  evaluationCriteria: string;
  officialUrl: string;
  sourceType: 'manual-import' | 'espp-public';
  stage: TenderStage;
  lastSeenHash: string;
  lastChangedAt: string;
  summary: string[];
  changes: TenderChange[];
}

export interface SavedSearch {
  id: string;
  name: string;
  searchTerm: string;
  authority?: string;
  category?: string;
  region?: string;
  deadlineWithinDays?: number;
}

export interface SavedSearchInput {
  name: string;
  searchTerm: string;
  authority?: string;
  category?: string;
  region?: string;
  deadlineWithinDays?: number;
}

export interface DashboardOverview {
  newCount: number;
  changedCount: number;
  closingSoonCount: number;
  trackedAuthorities: number;
}

export interface TenderImportInput {
  title: string;
  authority: string;
  deadline: string;
  officialUrl: string;
  region?: string;
  category?: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface TenderFilter {
  authority?: string;
  category?: string;
  region?: string;
  stage?: TenderStage;
  deadlineWithinDays?: number;
  searchTerm?: string;
}
