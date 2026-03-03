import {
  createSavedSearch,
  DashboardOverview,
  PaginatedResponse,
  SavedSearch,
  SavedSearchInput,
  Tender,
  TenderFilter,
  TenderImportInput,
  TenderWorkspaceUpdateInput,
  cloneSavedSearches,
  cloneTenders,
  createImportedTender,
  filterTenders,
  getTenderAuthorities,
  getTenderCategories,
  getTenderOverview,
  updateTenderWorkspace,
} from '@org/models';
import * as fs from 'node:fs';
import * as path from 'node:path';

export class TenderDataService {
  private readonly storageFilePath: string;
  private savedSearches: SavedSearch[] = [];
  private tenders: Tender[] = [];

  constructor(
    storageFilePath = process.env['TENDER_RADAR_STORAGE_PATH'] ||
      path.join(process.cwd(), 'data', 'runtime', 'tender-radar-db.json')
  ) {
    this.storageFilePath = storageFilePath;
    this.loadState();
  }

  getAllTenders(
    filter?: TenderFilter,
    page = 1,
    pageSize = 12
  ): PaginatedResponse<Tender> {
    return filterTenders(this.tenders, filter, page, pageSize);
  }

  getTenderById(id: string): Tender | null {
    return this.tenders.find((tender) => tender.id === id) ?? null;
  }

  getCategories(): string[] {
    return getTenderCategories(this.tenders);
  }

  getAuthorities(): string[] {
    return getTenderAuthorities(this.tenders);
  }

  getSavedSearches(): SavedSearch[] {
    return cloneSavedSearches(this.savedSearches);
  }

  saveSearch(input: SavedSearchInput): SavedSearch {
    const savedSearch = createSavedSearch(this.savedSearches, input);
    this.savedSearches = [savedSearch, ...this.savedSearches];
    this.persistState();
    return savedSearch;
  }

  deleteSavedSearch(id: string): boolean {
    const initialLength = this.savedSearches.length;
    this.savedSearches = this.savedSearches.filter((search) => search.id !== id);

    if (this.savedSearches.length === initialLength) {
      return false;
    }

    this.persistState();
    return true;
  }

  getOverview(): DashboardOverview {
    return getTenderOverview(this.tenders);
  }

  importTender(input: TenderImportInput): Tender {
    const tender = createImportedTender(this.tenders, input);
    this.tenders = [tender, ...this.tenders];
    this.persistState();
    return tender;
  }

  updateTenderWorkspace(
    id: string,
    workspace: TenderWorkspaceUpdateInput
  ): Tender | null {
    const tenderIndex = this.tenders.findIndex((tender) => tender.id === id);

    if (tenderIndex === -1) {
      return null;
    }

    const updatedTender = updateTenderWorkspace(this.tenders[tenderIndex], workspace);
    this.tenders = this.tenders.map((tender, index) =>
      index === tenderIndex ? updatedTender : tender
    );
    this.persistState();
    return updatedTender;
  }

  private loadState(): void {
    const fallbackState = {
      savedSearches: cloneSavedSearches(),
      tenders: cloneTenders(),
    };

    try {
      if (!fs.existsSync(this.storageFilePath)) {
        this.savedSearches = fallbackState.savedSearches;
        this.tenders = fallbackState.tenders;
        this.persistState();
        return;
      }

      const raw = fs.readFileSync(this.storageFilePath, 'utf8');
      const parsed = JSON.parse(raw) as {
        savedSearches?: SavedSearch[];
        tenders?: Tender[];
      };

      this.savedSearches = Array.isArray(parsed.savedSearches)
        ? cloneSavedSearches(parsed.savedSearches)
        : fallbackState.savedSearches;
      this.tenders = Array.isArray(parsed.tenders)
        ? cloneTenders(parsed.tenders)
        : fallbackState.tenders;
    } catch {
      this.savedSearches = fallbackState.savedSearches;
      this.tenders = fallbackState.tenders;
      this.persistState();
    }
  }

  private persistState(): void {
    fs.mkdirSync(path.dirname(this.storageFilePath), { recursive: true });
    fs.writeFileSync(
      this.storageFilePath,
      JSON.stringify(
        {
          savedSearches: this.savedSearches,
          tenders: this.tenders,
        },
        null,
        2
      ),
      'utf8'
    );
  }
}
