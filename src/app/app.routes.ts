import { Routes } from '@angular/router';
import { HomeComponent } from './features/dashboard/home/home';
import { LoginComponent } from './features/auth/login/login';
import { DashboardLayoutComponent } from './features/dashboard/layout/dashboard-layout';
import { DashboardOverviewComponent } from './features/dashboard/overview/overview';
import { BookCatalogComponent } from './features/books/catalog/catalog';
import { BookDetailComponent } from './features/books/detail/book-detail';
import { LoansComponent } from './features/borrow/loans/loans';
import { ReservationsComponent } from './features/reservations/list/reservations';
import { FinesComponent } from './features/borrow/fines/fines';
import { MembersComponent } from './features/admin/members/members';
import { ReportsComponent } from './features/admin/reports/reports';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    children: [
      { path: '', component: DashboardOverviewComponent },
      { path: 'books', component: BookCatalogComponent },
      { path: 'books/:id', component: BookDetailComponent },
      { path: 'loans', component: LoansComponent },
      { path: 'reservations', component: ReservationsComponent },
      { path: 'fines', component: FinesComponent },
      { path: 'members', component: MembersComponent },
      { path: 'reports', component: ReportsComponent }
    ]
  }
];
