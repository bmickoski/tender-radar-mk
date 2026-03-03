import express from 'express';
import { TenderDataService } from '@org/api/tenders';
import {
  ApiResponse,
  DashboardOverview,
  PaginatedResponse,
  SavedSearch,
  SavedSearchInput,
  Tender,
  TenderFilter,
  TenderImportInput,
  TenderWorkspaceUpdateInput,
} from '@org/models';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3333;

const app = express();
const tenderDataService = new TenderDataService();

app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }

  next();
});

app.get('/', (req, res) => {
  res.send({ message: 'TenderRadar MK API' });
});

app.get('/api/tenders', (req, res) => {
  try {
    const filter: TenderFilter = {};

    if (req.query.authority) {
      filter.authority = req.query.authority as string;
    }
    if (req.query.category) {
      filter.category = req.query.category as string;
    }
    if (req.query.region) {
      filter.region = req.query.region as string;
    }
    if (req.query.stage) {
      filter.stage = req.query.stage as TenderFilter['stage'];
    }
    if (req.query.deadlineWithinDays) {
      filter.deadlineWithinDays = Number(req.query.deadlineWithinDays);
    }
    if (req.query.searchTerm) {
      filter.searchTerm = req.query.searchTerm as string;
    }

    const page = req.query.page ? Number(req.query.page) : 1;
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 12;
    const result = tenderDataService.getAllTenders(filter, page, pageSize);

    const response: ApiResponse<PaginatedResponse<Tender>> = {
      data: result,
      success: true,
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    res.status(500).json(response);
  }
});

app.get('/api/tenders/:id', (req, res) => {
  try {
    const tender = tenderDataService.getTenderById(req.params.id);

    if (!tender) {
      const response: ApiResponse<null> = {
        data: null,
        success: false,
        error: 'Tender not found',
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse<Tender> = {
      data: tender,
      success: true,
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    res.status(500).json(response);
  }
});

app.get('/api/tenders-metadata/categories', (req, res) => {
  try {
    const response: ApiResponse<string[]> = {
      data: tenderDataService.getCategories(),
      success: true,
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    res.status(500).json(response);
  }
});

app.get('/api/tenders-metadata/authorities', (req, res) => {
  try {
    const response: ApiResponse<string[]> = {
      data: tenderDataService.getAuthorities(),
      success: true,
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    res.status(500).json(response);
  }
});

app.get('/api/saved-searches', (req, res) => {
  try {
    const response: ApiResponse<SavedSearch[]> = {
      data: tenderDataService.getSavedSearches(),
      success: true,
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    res.status(500).json(response);
  }
});

app.post('/api/saved-searches', (req, res) => {
  try {
    const payload = req.body as SavedSearchInput;
    const response: ApiResponse<SavedSearch> = {
      data: tenderDataService.saveSearch(payload),
      success: true,
    };
    res.status(201).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    res.status(500).json(response);
  }
});

app.delete('/api/saved-searches/:id', (req, res) => {
  try {
    const deleted = tenderDataService.deleteSavedSearch(req.params.id);

    if (!deleted) {
      const response: ApiResponse<null> = {
        data: null,
        success: false,
        error: 'Saved search not found',
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse<{ deleted: true }> = {
      data: { deleted: true },
      success: true,
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    res.status(500).json(response);
  }
});

app.get('/api/overview', (req, res) => {
  try {
    const response: ApiResponse<DashboardOverview> = {
      data: tenderDataService.getOverview(),
      success: true,
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    res.status(500).json(response);
  }
});

app.post('/api/tenders/import', (req, res) => {
  try {
    const payload = req.body as TenderImportInput;
    const response: ApiResponse<Tender> = {
      data: tenderDataService.importTender(payload),
      success: true,
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    res.status(500).json(response);
  }
});

app.patch('/api/tenders/:id/workspace', (req, res) => {
  try {
    const payload = req.body as TenderWorkspaceUpdateInput;
    const tender = tenderDataService.updateTenderWorkspace(req.params.id, payload);

    if (!tender) {
      const response: ApiResponse<null> = {
        data: null,
        success: false,
        error: 'Tender not found',
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse<Tender> = {
      data: tender,
      success: true,
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    res.status(500).json(response);
  }
});

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
