import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'tenders',
    pathMatch: 'full',
  },
  {
    path: 'tenders',
    loadChildren: () =>
      import('@org/tenders/feature-list').then(m => m.tenderListRoutes),
  },
  {
    path: 'tenders',
    loadChildren: () =>
      import('@org/tenders/feature-detail').then(m => m.tenderDetailRoutes),
  },
  {
    path: '**',
    redirectTo: 'tenders',
  },
];
