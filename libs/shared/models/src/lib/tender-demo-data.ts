import {
  DashboardOverview,
  PaginatedResponse,
  SavedSearch,
  SavedSearchInput,
  Tender,
  TenderFilter,
  TenderImportInput,
  TenderWorkspaceUpdateInput,
} from './tender.model';

export const tenderSeed: Tender[] = [
  {
    id: 'tn-001',
    title: 'Managed Network and Endpoint Support for Municipal Schools',
    description:
      'Framework agreement for help desk, endpoint monitoring, and field support across municipal school sites.',
    authority: 'City of Skopje',
    region: 'Skopje',
    category: 'IT Services',
    cpvCode: '72700000',
    budgetEstimate: 185000,
    deadline: '2026-03-21T11:00:00.000Z',
    publishedAt: '2026-02-28T09:15:00.000Z',
    submissionMethod: 'ESPP electronic submission',
    bidBond: '2% bid guarantee required',
    requiredCertificates: [
      'Central Registry current status',
      'ISO 27001 or equivalent',
      'Reference list for 3 similar contracts',
    ],
    evaluationCriteria: '70% price, 30% technical quality',
    officialUrl: 'https://example.mk/tenders/tn-001',
    sourceType: 'espp-public',
    stage: 'new',
    lastSeenHash: 'tn001-v1',
    lastChangedAt: '2026-02-28T09:15:00.000Z',
    summary: [
      'Multi-site support scope across school infrastructure.',
      'Strong fit for SME MSP teams with public-sector references.',
    ],
    changes: [],
    workspace: {
      internalDeadline: '2026-03-18T12:00:00.000Z',
      notes: 'Need final sign-off from finance before bond issuance.',
      checklist: [
        {
          id: 'task-tn-001-1',
          title: 'Review amendment history and scope clarifications',
          owner: 'Legal',
          status: 'done',
        },
        {
          id: 'task-tn-001-2',
          title: 'Confirm bid guarantee wording with bank',
          owner: 'Finance',
          status: 'in-progress',
        },
        {
          id: 'task-tn-001-3',
          title: 'Prepare technical references and CV package',
          owner: 'Technical',
          status: 'todo',
        },
      ],
      documents: [
        {
          id: 'doc-tn-001-1',
          name: 'Central Registry current status',
          status: 'ready',
          expiresAt: '2026-04-15T00:00:00.000Z',
          notes: 'Reusable from prior municipal bids.',
        },
        {
          id: 'doc-tn-001-2',
          name: 'ISO 27001 certificate',
          status: 'ready',
          expiresAt: '2026-08-01T00:00:00.000Z',
        },
        {
          id: 'doc-tn-001-3',
          name: 'Reference project list',
          status: 'missing',
          notes: 'Need one more school-sector contract added.',
        },
      ],
    },
  },
  {
    id: 'tn-002',
    title: 'Clinical Imaging Equipment Maintenance and Spare Parts',
    description:
      'Preventive and corrective maintenance for imaging equipment with required spare-parts coverage.',
    authority: 'University Clinic for Radiology',
    region: 'Skopje',
    category: 'Medical Equipment',
    cpvCode: '50421000',
    budgetEstimate: 320000,
    deadline: '2026-03-12T10:00:00.000Z',
    publishedAt: '2026-02-15T08:00:00.000Z',
    submissionMethod: 'ESPP electronic submission',
    bidBond: 'Bank guarantee of 5,000 EUR',
    requiredCertificates: [
      'Authorized service partner confirmation',
      'Tax clearance certificate',
      'Engineers CVs',
    ],
    evaluationCriteria: 'Lowest compliant price',
    officialUrl: 'https://example.mk/tenders/tn-002',
    sourceType: 'espp-public',
    stage: 'changed',
    lastSeenHash: 'tn002-v2',
    lastChangedAt: '2026-03-02T14:20:00.000Z',
    summary: [
      'Recent amendment extended the deadline.',
      'Specialized references are required to qualify.',
    ],
    changes: [
      {
        id: 'chg-tn-002-1',
        label: 'Amendment 1',
        summary: 'Extended the deadline and clarified spare-parts SLA terms.',
        changedAt: '2026-03-02T14:20:00.000Z',
      },
    ],
    workspace: {
      internalDeadline: '2026-03-10T12:00:00.000Z',
      notes: 'Awaiting authorized service partner letter.',
      checklist: [
        {
          id: 'task-tn-002-1',
          title: 'Validate spare-parts SLA amendment',
          owner: 'Legal',
          status: 'done',
        },
        {
          id: 'task-tn-002-2',
          title: 'Collect engineers CVs for submission package',
          owner: 'Technical',
          status: 'in-progress',
        },
      ],
      documents: [
        {
          id: 'doc-tn-002-1',
          name: 'Authorized service partner confirmation',
          status: 'missing',
        },
        {
          id: 'doc-tn-002-2',
          name: 'Tax clearance certificate',
          status: 'expiring',
          expiresAt: '2026-03-15T00:00:00.000Z',
        },
      ],
    },
  },
  {
    id: 'tn-003',
    title: 'Road Reconstruction Supervision Services',
    description:
      'Supervision of reconstruction works, quantity verification, and progress reporting for state-road projects.',
    authority: 'Public Enterprise for State Roads',
    region: 'Bitola',
    category: 'Construction',
    cpvCode: '71520000',
    budgetEstimate: 95000,
    deadline: '2026-03-07T09:00:00.000Z',
    publishedAt: '2026-02-20T10:30:00.000Z',
    submissionMethod: 'Physical submission with ESPP reference',
    bidBond: 'No bid bond required',
    requiredCertificates: [
      'Licensed supervising engineer',
      'Professional liability insurance',
      'Two completed infrastructure references',
    ],
    evaluationCriteria: '60% price, 40% team qualifications',
    officialUrl: 'https://example.mk/tenders/tn-003',
    sourceType: 'espp-public',
    stage: 'closing-soon',
    lastSeenHash: 'tn003-v1',
    lastChangedAt: '2026-02-20T10:30:00.000Z',
    summary: [
      'Deadline is within the next week.',
      'Good fit for engineering consultancies with road supervision references.',
    ],
    changes: [],
    workspace: {
      internalDeadline: '2026-03-05T17:00:00.000Z',
      notes: 'Internal review compressed because official deadline is close.',
      checklist: [
        {
          id: 'task-tn-003-1',
          title: 'Confirm supervising engineer availability',
          owner: 'Technical',
          status: 'in-progress',
        },
        {
          id: 'task-tn-003-2',
          title: 'Upload liability insurance confirmation',
          owner: 'Legal',
          status: 'todo',
        },
      ],
      documents: [
        {
          id: 'doc-tn-003-1',
          name: 'Professional liability insurance',
          status: 'ready',
          expiresAt: '2026-09-30T00:00:00.000Z',
        },
      ],
    },
  },
  {
    id: 'tn-004',
    title: 'Office Cleaning and Facility Support Services',
    description:
      'Recurring cleaning, waste handling, and consumables support for several municipal buildings.',
    authority: 'Municipality of Tetovo',
    region: 'Tetovo',
    category: 'Facility Management',
    cpvCode: '90910000',
    budgetEstimate: 140000,
    deadline: '2026-03-29T11:00:00.000Z',
    publishedAt: '2026-02-25T12:10:00.000Z',
    submissionMethod: 'ESPP electronic submission',
    bidBond: '1% bid guarantee required',
    requiredCertificates: [
      'Central Registry current status',
      'Proof of staffing capacity',
      'Cleaning-services references',
    ],
    evaluationCriteria: 'Lowest compliant price',
    officialUrl: 'https://example.mk/tenders/tn-004',
    sourceType: 'espp-public',
    stage: 'tracked',
    lastSeenHash: 'tn004-v1',
    lastChangedAt: '2026-02-25T12:10:00.000Z',
    summary: [
      'Low-complexity services tender with reusable documentation.',
      'Good candidate for checklist and reminder workflows.',
    ],
    changes: [],
    workspace: {
      notes: 'Good candidate for a fast-turn submission with reused documents.',
      checklist: [
        {
          id: 'task-tn-004-1',
          title: 'Confirm staffing roster and shift coverage',
          owner: 'Operations',
          status: 'todo',
        },
      ],
      documents: [
        {
          id: 'doc-tn-004-1',
          name: 'Cleaning service references',
          status: 'ready',
        },
      ],
    },
  },
  {
    id: 'tn-005',
    title: 'Manual Import: ERP Upgrade Discovery Notice',
    description:
      'Manually imported tender lead used to validate discovery and workflow before live collectors are connected.',
    authority: 'State Statistical Office',
    region: 'Skopje',
    category: 'IT Services',
    cpvCode: '72000000',
    budgetEstimate: 0,
    deadline: '2026-04-02T10:00:00.000Z',
    publishedAt: '2026-03-01T08:45:00.000Z',
    submissionMethod: 'Manual review required',
    bidBond: 'To be confirmed from dossier',
    requiredCertificates: ['To be confirmed'],
    evaluationCriteria: 'To be confirmed',
    officialUrl: 'https://example.mk/tenders/tn-005',
    sourceType: 'manual-import',
    stage: 'new',
    lastSeenHash: 'tn005-v1',
    lastChangedAt: '2026-03-01T08:45:00.000Z',
    summary: [
      'Created from the manual import workflow.',
      'Use this record to assign owners and capture missing documents.',
    ],
    changes: [],
    workspace: {
      notes: 'Discovery-stage lead. Need official dossier review before qualification work starts.',
      checklist: [
        {
          id: 'task-tn-005-1',
          title: 'Review official dossier and CPV scope',
          owner: 'Bid Office',
          status: 'todo',
        },
      ],
      documents: [
        {
          id: 'doc-tn-005-1',
          name: 'Tender dossier review notes',
          status: 'missing',
        },
      ],
    },
  },
];

export const savedSearchSeed: SavedSearch[] = [
  {
    id: 'search-it-services',
    name: 'IT Services',
    searchTerm: 'software support',
    category: 'IT Services',
    deadlineWithinDays: 30,
  },
  {
    id: 'search-construction',
    name: 'Construction',
    searchTerm: 'reconstruction',
    category: 'Construction',
    region: 'Skopje',
    deadlineWithinDays: 45,
  },
  {
    id: 'search-clinics',
    name: 'Health Institutions',
    searchTerm: 'medical equipment',
    authority: 'University Clinic for Radiology',
    deadlineWithinDays: 21,
  },
];

export function cloneTenders(tenders: Tender[] = tenderSeed): Tender[] {
  return tenders.map((tender) => ({
    ...tender,
    requiredCertificates: [...tender.requiredCertificates],
    summary: [...tender.summary],
    changes: tender.changes.map((change) => ({ ...change })),
    workspace: {
      ...tender.workspace,
      checklist: tender.workspace.checklist.map((task) => ({ ...task })),
      documents: tender.workspace.documents.map((document) => ({ ...document })),
    },
  }));
}

export function cloneSavedSearches(
  searches: SavedSearch[] = savedSearchSeed
): SavedSearch[] {
  return searches.map((search) => ({ ...search }));
}

export function createSavedSearch(
  searches: SavedSearch[],
  input: SavedSearchInput
): SavedSearch {
  const nextId =
    searches.reduce((maxId, search) => {
      const match = /^search-(\d+)$/.exec(search.id);
      const numericId = match ? Number(match[1]) : 0;
      return Math.max(maxId, numericId);
    }, 0) + 1;

  return {
    id: `search-${String(nextId).padStart(3, '0')}`,
    name: input.name.trim(),
    searchTerm: input.searchTerm.trim(),
    authority: input.authority || undefined,
    category: input.category || undefined,
    region: input.region || undefined,
    deadlineWithinDays: input.deadlineWithinDays || undefined,
  };
}

export function filterTenders(
  tenders: Tender[],
  filter?: TenderFilter,
  page = 1,
  pageSize = 12
): PaginatedResponse<Tender> {
  let filtered = [...tenders].sort((left, right) =>
    left.deadline.localeCompare(right.deadline)
  );

  if (filter?.category) {
    filtered = filtered.filter((tender) => tender.category === filter.category);
  }

  if (filter?.authority) {
    filtered = filtered.filter((tender) => tender.authority === filter.authority);
  }

  if (filter?.region) {
    filtered = filtered.filter((tender) => tender.region === filter.region);
  }

  if (filter?.stage) {
    filtered = filtered.filter((tender) => tender.stage === filter.stage);
  }

  if (filter?.deadlineWithinDays !== undefined) {
    const deadlineWithinDays = filter.deadlineWithinDays;
    const now = new Date();
    filtered = filtered.filter((tender) => {
      const days =
        (new Date(tender.deadline).getTime() - now.getTime()) /
        (1000 * 60 * 60 * 24);
      return days <= deadlineWithinDays;
    });
  }

  if (filter?.searchTerm) {
    const query = filter.searchTerm.toLowerCase();
    filtered = filtered.filter(
      (tender) =>
        tender.title.toLowerCase().includes(query) ||
        tender.description.toLowerCase().includes(query) ||
        tender.authority.toLowerCase().includes(query) ||
        tender.category.toLowerCase().includes(query) ||
        tender.cpvCode.toLowerCase().includes(query)
    );
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const startIndex = (page - 1) * pageSize;

  return {
    items: filtered.slice(startIndex, startIndex + pageSize),
    total,
    page,
    pageSize,
    totalPages,
  };
}

export function getTenderCategories(tenders: Tender[]): string[] {
  return [...new Set(tenders.map((tender) => tender.category))];
}

export function getTenderAuthorities(tenders: Tender[]): string[] {
  return [...new Set(tenders.map((tender) => tender.authority))];
}

export function getTenderOverview(tenders: Tender[]): DashboardOverview {
  return {
    newCount: tenders.filter((tender) => tender.stage === 'new').length,
    changedCount: tenders.filter((tender) => tender.stage === 'changed').length,
    closingSoonCount: tenders.filter((tender) => tender.stage === 'closing-soon').length,
    trackedAuthorities: getTenderAuthorities(tenders).length,
  };
}

export function createImportedTender(
  tenders: Tender[],
  input: TenderImportInput
): Tender {
  const createdAt = new Date().toISOString();
  const nextId =
    tenders.reduce((maxId, tender) => {
      const match = /^tn-(\d+)$/.exec(tender.id);
      const numericId = match ? Number(match[1]) : 0;
      return Math.max(maxId, numericId);
    }, 0) + 1;

  return {
    id: `tn-${String(nextId).padStart(3, '0')}`,
    title: input.title,
    description:
      'Manually imported tender lead. Review the official notice and complete the bidder checklist before qualification work starts.',
    authority: input.authority,
    region: input.region || 'North Macedonia',
    category: input.category || 'General Services',
    cpvCode: '00000000',
    budgetEstimate: 0,
    deadline: input.deadline,
    publishedAt: createdAt,
    submissionMethod: 'Manual review required',
    bidBond: 'Pending review',
    requiredCertificates: ['Pending review'],
    evaluationCriteria: 'Pending review',
    officialUrl: input.officialUrl,
    sourceType: 'manual-import',
    stage: 'new',
    lastSeenHash: createHash(input.title, input.officialUrl, input.deadline),
    lastChangedAt: createdAt,
    summary: [
      'Imported manually for triage.',
      'Use this record to assign responsibilities and capture missing documents.',
    ],
    changes: [
      {
        id: `chg-${nextId}`,
        label: 'Initial import',
        summary: 'Tender was added through the manual importer.',
        changedAt: createdAt,
      },
    ],
    workspace: {
      notes: 'Imported manually for triage.',
      checklist: [
        {
          id: `task-${nextId}-1`,
          title: 'Review official notice and complete qualification triage',
          owner: 'Bid Office',
          status: 'todo',
        },
      ],
      documents: [
        {
          id: `doc-${nextId}-1`,
          name: 'Qualification notes',
          status: 'missing',
        },
      ],
    },
  };
}

export function updateTenderWorkspace(
  tender: Tender,
  workspace: TenderWorkspaceUpdateInput
): Tender {
  return {
    ...tender,
    workspace: {
      internalDeadline: workspace.internalDeadline || undefined,
      notes: workspace.notes,
      checklist: workspace.checklist.map((task) => ({ ...task })),
      documents: workspace.documents.map((document) => ({ ...document })),
    },
  };
}

function createHash(...values: string[]): string {
  let hash = 0;
  const raw = values.join('|');

  for (let index = 0; index < raw.length; index += 1) {
    hash = (hash * 31 + raw.charCodeAt(index)) >>> 0;
  }

  return `h-${hash.toString(16)}`;
}
