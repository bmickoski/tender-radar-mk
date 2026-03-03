import {
  CollectedTenderRecord,
  createTenderFingerprint,
} from '@org/models';
import {
  TenderCollectorResult,
  TenderCollectorSource,
} from './local-espp-fixture.source';

const DEFAULT_URL =
  'https://www.e-nabavki.gov.mk/PublicAccess/ConcessionAnnouncements/';

export class EsppConcessionAnnouncementsSource implements TenderCollectorSource {
  readonly name = 'espp-concession-announcements';

  constructor(
    private readonly url = DEFAULT_URL,
    private readonly fetchImpl: typeof fetch = fetch
  ) {}

  async fetchRecords(): Promise<TenderCollectorResult> {
    const response = await this.fetchImpl(this.url, {
      headers: {
        'user-agent': 'TenderRadarMK/0.1 (+https://github.com/bmickoski/tender-radar-mk)',
      },
    });

    if (!response.ok) {
      throw new Error(`ESPP source returned ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    return {
      source: this.name,
      records: parseConcessionAnnouncementsHtml(html, this.url),
    };
  }
}

export function parseConcessionAnnouncementsHtml(
  html: string,
  sourceUrl = DEFAULT_URL
): CollectedTenderRecord[] {
  const normalized = html
    .replace(/\u00a0/g, ' ')
    .replace(/\r/g, '')
    .replace(/<[^>]+>/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const headerIndex = normalized.findIndex((line) =>
    line.includes('Договорен орган Опис на огласот Датум на објава')
  );

  if (headerIndex === -1) {
    throw new Error('Unable to locate the concession announcements table in the ESPP response.');
  }

  const tableLines: string[] = [];
  for (let index = headerIndex + 1; index < normalized.length; index += 1) {
    const line = normalized[index];

    if (line.startsWith('Страница')) {
      break;
    }

    if (/\d{2}\.\d{2}\.\d{4}$/.test(line)) {
      tableLines.push(line);
    }
  }

  return tableLines.map((line, index) => toCollectedRecord(line, index, sourceUrl));
}

function toCollectedRecord(
  line: string,
  index: number,
  sourceUrl: string
): CollectedTenderRecord {
  const dateMatch = line.match(/(\d{2}\.\d{2}\.\d{4})$/);

  if (!dateMatch) {
    throw new Error(`Unable to parse publication date from ESPP row: ${line}`);
  }

  const publishedAt = toIsoDate(dateMatch[1]);
  const content = line.slice(0, dateMatch.index).trim();
  const authority = extractAuthority(content);
  const title = content.slice(authority.length).trim();
  const collectedAt = new Date().toISOString();
  const officialUrl = `${sourceUrl}#row-${index + 1}`;

  return {
    sourceKey: 'espp-concession-announcements',
    externalId: `concession-${index + 1}-${dateMatch[1]}`,
    title,
    description: title,
    authority,
    region: 'North Macedonia',
    category: 'PPP / Concessions',
    cpvCode: '00000000',
    deadline: publishedAt,
    publishedAt,
    submissionMethod: 'Public ESPP concession announcement',
    bidBond: 'Review official notice',
    requiredCertificates: ['Review official notice'],
    evaluationCriteria: 'Review official notice',
    officialUrl,
    summary: [
      'Collected from the public ESPP concessions listing.',
      'Requires follow-up against the full official notice and attached documents.',
    ],
    fingerprint: createTenderFingerprint(authority, title, publishedAt),
    collectedAt,
  };
}

function extractAuthority(content: string): string {
  const match = content.match(
    /^(.+?)\s(?=(?:Доделување|Реконструкција|Воспоставување|Јавна набавка|ОГЛАС|ЗА|Договор))/u
  );

  if (!match) {
    throw new Error(`Unable to parse authority from ESPP row: ${content}`);
  }

  return match[1].trim();
}

function toIsoDate(value: string): string {
  const [day, month, year] = value.split('.');
  return `${year}-${month}-${day}T00:00:00.000Z`;
}
