# TenderRadar MK

TenderRadar MK is an Nx monorepo for a tender discovery and workflow product focused on North Macedonia public procurement.

## Apps

- `tender-radar-web`: Angular SSR frontend
- `api`: Express API
- `tender-radar-e2e`: Playwright smoke coverage

## Libraries

- `api/tenders`: API-side tender data service
- `tenders/data`: frontend tender data access
- `tenders/feature-list`: tender radar list experience
- `tenders/feature-detail`: tender brief/detail experience
- `tenders/shared-ui`: shared Angular UI
- `shared/models`: shared tender domain and demo seed data

## Run

```bash
npm install
npx nx serve tender-radar-web
```

## Build

```bash
npx nx run-many -t build --projects=tender-radar-web,api
```

## Test

```bash
npx nx test tender-radar-web
npx nx e2e tender-radar-e2e
```
