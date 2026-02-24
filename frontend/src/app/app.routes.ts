import { Routes } from '@angular/router'
import { LoginComponent } from './features/auth/login/login'
import { HomeComponent } from './features/home/home'
import { DashboardLayoutComponent } from './features/dashboard/layout/dashboard-layout'
import { DashboardOverviewComponent } from './features/dashboard/overview/overview'
import { BookCatalogComponent } from './features/books/catalog/catalog'
import { BookDetailComponent } from './features/books/detail/book-detail'
import { LoansComponent } from './features/borrow/loans/loans'
import { ReservationsComponent } from './features/reservations/list/reservations'
import { FinesComponent } from './features/borrow/fines/fines'
import { MembersComponent } from './features/admin/members/members'
import { ReportsComponent } from './features/admin/reports/reports'
import { authGuard } from './guards/auth.guard'
import { guestGuard } from './guards/guest.guard'

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [guestGuard]
  },
  {
    path: 'books',
    component: DashboardLayoutComponent,
    children: [
      { path: '', component: BookCatalogComponent },
      { path: ':id', component: BookDetailComponent }
    ]
  },
  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: DashboardOverviewComponent },
      // Moved books to /books
      { path: 'loans', component: LoansComponent },
      { path: 'reservations', component: ReservationsComponent },
      { path: 'fines', component: FinesComponent },
      { path: 'members', component: MembersComponent },
      { path: 'reports', component: ReportsComponent }
    ]
  },
  { path: '**', redirectTo: '' }
]
