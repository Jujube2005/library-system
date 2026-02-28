import { Routes } from '@angular/router'
import { LoginComponent } from './features/auth/login/login'
import { HomeComponent } from './features/home/home'
import { DashboardLayoutComponent } from './features/dashboard/layout/dashboard-layout'
import { DashboardOverviewComponent } from './features/dashboard/overview/overview'
import { BookCatalogComponent } from './features/books/catalog/catalog'
import { BookDetailComponent } from './features/books/detail/book-detail'
import { LoansComponent } from './features/borrow/loans/loans'
import { MyReservationsComponent } from './features/reservations/list/reservations'
import { FinesComponent } from './features/borrow/fines/fines'
import { MembersComponent } from './features/admin/members/members'
import { ReportsComponent } from './features/admin/reports/reports'
import { authGuard } from './guards/auth.guard'
import { guestGuard } from './guards/guest.guard'

import { RegisterComponent } from './features/auth/register/register'

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
    path: 'register',
    component: RegisterComponent,
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
      { path: 'reservations', component: MyReservationsComponent },
      { path: 'fines', component: FinesComponent },
      { path: 'members', component: MembersComponent },
      { path: 'reports', component: ReportsComponent },
      {
        path: 'book-management',
        loadComponent: () => import('./features/staff/book-management/book-management').then(m => m.BookManagementComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile').then(m => m.ProfileComponent)
      },
      {
        path: 'loan-management',
        loadComponent: () => import('./features/staff/loan-management/loan-management').then(m => m.LoanManagementComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
]
