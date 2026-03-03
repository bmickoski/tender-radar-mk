import {
  Tender,
  TenderChange,
  TenderDocument,
  TenderStage,
  TenderTask,
  TenderWorkspace,
} from './tender.model';

export interface CollectedTenderRecord {
  sourceKey: string;
  externalId: string;
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
  summary: string[];
  fingerprint: string;
  collectedAt: string;
}

export interface TenderSyncResult {
  tenders: Tender[];
  total: number;
  created: number;
  updated: number;
  unchanged: number;
}

export type ScraperRunStatus = 'success' | 'failure';

export interface ScraperRunReport {
  source: string;
  resolvedSource?: string;
  runAt: string;
  total: number;
  created: number;
  updated: number;
  unchanged: number;
  status: ScraperRunStatus;
  durationMs: number;
  errorMessage?: string;
  fallbackReason?: string;
}

export interface ScraperStatusSnapshot {
  latestRun: ScraperRunReport | null;
  recentRuns: ScraperRunReport[];
}

export function createTenderFingerprint(...values: string[]): string {
  let hash = 0;
  const raw = values.join('|');

  for (let index = 0; index < raw.length; index += 1) {
    hash = (hash * 31 + raw.charCodeAt(index)) >>> 0;
  }

  return `h-${hash.toString(16)}`;
}

export function upsertCollectedTenders(
  currentTenders: Tender[],
  records: CollectedTenderRecord[]
): TenderSyncResult {
  let nextId = getNextTenderNumericId(currentTenders);
  let created = 0;
  let updated = 0;
  let unchanged = 0;

  const existingByUrl = new Map(
    currentTenders.map((tender) => [tender.officialUrl, tender] as const)
  );
  const touchedUrls = new Set<string>();
  const syncedTenders: Tender[] = [];

  for (const record of records) {
    const existingTender = existingByUrl.get(record.officialUrl);
    touchedUrls.add(record.officialUrl);

    if (!existingTender) {
      nextId += 1;
      syncedTenders.push(createTenderFromCollected(record, nextId));
      created += 1;
      continue;
    }

    const isChanged = existingTender.lastSeenHash !== record.fingerprint;
    syncedTenders.push(
      mergeCollectedTender(existingTender, record, isChanged)
    );
    if (isChanged) {
      updated += 1;
    } else {
      unchanged += 1;
    }
  }

  const untouchedTenders = currentTenders.filter(
    (tender) => !touchedUrls.has(tender.officialUrl)
  );

  const tenders = [...syncedTenders, ...untouchedTenders].sort((left, right) =>
    left.deadline.localeCompare(right.deadline)
  );

  return {
    tenders,
    total: records.length,
    created,
    updated,
    unchanged,
  };
}

function createTenderFromCollected(
  record: CollectedTenderRecord,
  numericId: number
): Tender {
  return {
    id: `tn-${String(numericId).padStart(3, '0')}`,
    title: record.title,
    description: record.description,
    authority: record.authority,
    region: record.region,
    category: record.category,
    cpvCode: record.cpvCode,
    budgetEstimate: record.budgetEstimate,
    deadline: record.deadline,
    publishedAt: record.publishedAt,
    submissionMethod: record.submissionMethod,
    bidBond: record.bidBond,
    requiredCertificates: [...record.requiredCertificates],
    evaluationCriteria: record.evaluationCriteria,
    officialUrl: record.officialUrl,
    sourceType: 'espp-public',
    stage: deriveStage('new', record.deadline),
    lastSeenHash: record.fingerprint,
    lastChangedAt: record.collectedAt,
    summary: [...record.summary],
    changes: [],
    workspace: createDefaultWorkspace(numericId, record),
  };
}

function mergeCollectedTender(
  existingTender: Tender,
  record: CollectedTenderRecord,
  isChanged: boolean
): Tender {
  const changes = isChanged
    ? [
        createTenderChange(existingTender, record),
        ...existingTender.changes.map((change) => ({ ...change })),
      ].slice(0, 10)
    : existingTender.changes.map((change) => ({ ...change }));

  return {
    ...existingTender,
    title: record.title,
    description: record.description,
    authority: record.authority,
    region: record.region,
    category: record.category,
    cpvCode: record.cpvCode,
    budgetEstimate: record.budgetEstimate,
    deadline: record.deadline,
    publishedAt: record.publishedAt,
    submissionMethod: record.submissionMethod,
    bidBond: record.bidBond,
    requiredCertificates: [...record.requiredCertificates],
    evaluationCriteria: record.evaluationCriteria,
    officialUrl: record.officialUrl,
    sourceType: 'espp-public',
    stage: deriveStage(isChanged ? 'changed' : 'tracked', record.deadline),
    lastSeenHash: record.fingerprint,
    lastChangedAt: isChanged ? record.collectedAt : existingTender.lastChangedAt,
    summary: [...record.summary],
    changes,
    workspace: cloneWorkspace(existingTender.workspace),
  };
}

function createTenderChange(
  tender: Tender,
  record: CollectedTenderRecord
): TenderChange {
  const changedAt = record.collectedAt;

  return {
    id: `chg-${tender.id}-${changedAt}`,
    label: 'Collector update',
    summary: 'Tender notice metadata changed in the latest ESPP polling run.',
    changedAt,
  };
}

function createDefaultWorkspace(
  numericId: number,
  record: CollectedTenderRecord
): TenderWorkspace {
  const checklist: TenderTask[] = [
    {
      id: `task-${numericId}-1`,
      title: 'Review collected notice against the official dossier',
      owner: 'Bid Office',
      status: 'todo',
    },
  ];

  const documents: TenderDocument[] = [
    {
      id: `doc-${numericId}-1`,
      name: 'Official dossier review notes',
      status: 'missing',
      notes: `Collected from ${record.sourceKey}.`,
    },
  ];

  return {
    notes: `Imported by collector from ${record.sourceKey}.`,
    checklist,
    documents,
  };
}

function cloneWorkspace(workspace: TenderWorkspace): TenderWorkspace {
  return {
    ...workspace,
    checklist: workspace.checklist.map((task) => ({ ...task })),
    documents: workspace.documents.map((document) => ({ ...document })),
  };
}

function deriveStage(baseStage: 'new' | 'changed' | 'tracked', deadline: string): TenderStage {
  const deadlineDate = new Date(deadline);
  const daysRemaining =
    (deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);

  if (daysRemaining <= 7) {
    return 'closing-soon';
  }

  return baseStage;
}

function getNextTenderNumericId(tenders: Tender[]): number {
  return tenders.reduce((maxId, tender) => {
    const match = /^tn-(\d+)$/.exec(tender.id);
    const numericId = match ? Number(match[1]) : 0;
    return Math.max(maxId, numericId);
  }, 0);
}
