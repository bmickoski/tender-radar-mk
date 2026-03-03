import { Routes } from '@angular/router';
import { TenderDetailComponent } from './tender-detail/tender-detail.component';

export const tenderDetailRoutes: Routes = [
  {
    path: ':id',
    component: TenderDetailComponent,
  },
];
