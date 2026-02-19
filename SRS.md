\# RMUTI Library Management System — SRS



> \*\*AI-Ready Software Requirements Specification\*\*

> Version 2.0 | Last Updated: 2026-02-17

> Team: อ้ายมาแล้ว



---



\## Table of Contents

1\. \[Project Overview](#1-project-overview)

2\. \[Tech Stack](#2-tech-stack)

3\. \[Project Structure](#3-project-structure)

4\. \[User Classes \& Role-Permission Matrix](#4-user-classes--role-permission-matrix)

5\. \[Database Schema](#5-database-schema)

6\. \[Business Requirements](#6-business-requirements)

7\. \[User Requirements](#7-user-requirements)

8\. \[Functional Requirements](#8-functional-requirements)

9\. \[API Specifications](#9-api-specifications)

10\. \[Non-Functional Requirements](#10-non-functional-requirements)

11\. \[UI/UX Requirements](#11-uiux-requirements)

12\. \[Error Handling Specification](#12-error-handling-specification)

13\. \[Environment \& Configuration](#13-environment--configuration)

14\. \[Constraints \& Rules](#14-constraints--rules)

15\. \[Implementation Order](#15-implementation-order)

16\. \[Acceptance Criteria Summary](#16-acceptance-criteria-summary)

17\. \[Appendix A: Gap Analysis](#appendix-a-gap-analysis-current-vs-proposed)

18\. \[Appendix B: Glossary](#appendix-b-glossary)



---



\# 1. Project Overview



RMUTI Library Management System is a cloud-based web application that replaces the current manual process (paper logbooks and Excel spreadsheets) used by the Rajamangala University of Technology Isan (RMUTI) library. The system manages member registration, book catalog, reservations, borrowing/returning, automated fine calculation, and reporting for approximately 2,500 students and 15,000+ books.



The primary users are library staff (who manage daily operations), instructors (who borrow books for extended periods), and students (who search and reserve books online). The system must reduce staff processing time from 10-15 minutes per transaction to under 10 seconds.



\# 2. Tech Stack



```

Frontend: Angular v17 (UI and client-side logic)

UI Library: Tailwind CSS v4

Language: TypeScript 5.x (strict mode enabled)

Backend Runtime: Node.js v20

Backend Framework: Express v4 (REST API)

Database: Supabase (PostgreSQL 15)

Authentication: Supabase Auth (email/password)

Database Client: Supabase JS Client v2 (@supabase/supabase-js)

State Management: Angular services + RxJS

Package Manager: pnpm

Deployment: Vercel

Notification: Email (SMTP / provider)

```



\### Constraints on Tech Choices



\- The frontend must be implemented using \*\*Angular v17\*\* only.

\- All source code must be written in \*\*TypeScript 5.x\*\* with strict mode enabled.

\- Styling must be implemented using \*\*Tailwind CSS v4\*\*.

\- The backend must use \*\*Node.js (v20)\*\* with \*\*Express v4\*\* to provide REST APIs.

\- The system must use \*\*Supabase PostgreSQL\*\* as the primary database.

\- Database access must be performed using the \*\*Supabase JS Client v2\*\* directly.

\- External ORMs such as Prisma, Drizzle, or Sequelize must not be used.

\- Authentication must be handled using \*\*Supabase Auth\*\* with email/password only.

\- External OAuth or social login providers are not included.

\- State management must use built-in Angular mechanisms (services and RxJS). External state libraries are not used.

\- The project must use \*\*pnpm\*\* as the package manager to ensure consistent dependency resolution.

\- Other package managers such as npm or yarn are not used in this project.

\- Deployment must be performed via \*\*Vercel\*\*.

\- Email notifications must be handled via an SMTP or email provider service.



---



\## 3. Project Structure

```

library-management-system/

│

├── frontend/ 					# Angular application

│ ├── src/

│ │ ├── app/

│ │ │ ├── core/ 				# Core services (auth, API, guards)

│ │ │ ├── shared/ 				# Shared components \& utilities

│ │ │ ├── features/

│ │ │ │ ├── auth/ 			# Login \& authentication

│ │ │ │ ├── books/ 			# Book search \& details

│ │ │ │ ├── borrow/ 			# Borrow/return UI

│ │ │ │ ├── reservations/ 	# Reservation UI

│ │ │ │ ├── dashboard/ 		# User dashboard

│ │ │ │ └── admin/ 			# Staff management pages

│ │ │ ├── models/ 				# TypeScript interfaces

│ │ │ ├── services/ 			# API services (Supabase/REST)

│ │ │ └── guards/ 				# Route guards

│ │ ├── environments/

│ │ └── styles/

│ └── angular.json

│

├── backend/ 					# Node.js + Express API

│ ├── src/

│ │ ├── controllers/ 			# Route controllers

│ │ ├── routes/ 				# Express routes

│ │ ├── services/ 				# Business logic

│ │ ├── middleware/ 			# Auth \& validation

│ │ ├── utils/ 				# Helpers

│ │ ├── config/ 				# Env \& Supabase setup

│ │ └── types/ 				# Shared TypeScript types

│ └── server.ts

│

├── database/

│ ├── migrations/ 				# SQL migrations

│ └── seed/	 				# Seed data

│

├── docs/

│ ├── SRS.md

│ ├── ERD.png

│ └── usecase.png

│

├── .env

├── pnpm-workspace.yaml

└── README.md

```



---



\## 4. User Classes \& Role-Permission Matrix



\####4.1 User Classes



| Role       | Description                       | Count  | Device           | Tech Level   |

| ---------- | --------------------------------- | ------ | ---------------- | ------------ |

| Student    | Undergraduate / graduate students | ~2,500 | Mobile-first     | Basic        |

| Instructor | Faculty members / professors      | ~200   | Desktop / Mobile | Intermediate |

| Staff      | Library staff managing operations | 3-5    | Desktop          | Intermediate |



\###4.2 Loan Limits by Role



| Role       | Max Books | Loan Duration | Max Reservations |

| ---------- | --------- | ------------- | ---------------- |

| Student    | 5         | 7 days        | 2                |

| Instructor | 10        | 30 days       | 5                |

| Staff      | Unlimited | Configurable  | Unlimited        |



\#### 4.3 Role-Permission Matrix



| Action                         | Student     | Instructor  | Staff |

| ------------------------------ | ----------- | ----------- | ----- |

| Login / Logout                 | YES         | YES         | YES   |

| Search Book Realtime           | YES         | YES         | YES   |

| View Book Status               | YES         | YES         | YES   |

| Check Book Availability        | YES         | YES         | YES   |

| View own profile               | YES         | YES         | YES   |

| Edit own profile               | YES         | YES         | YES   |

| Reserve Book                   | YES (max 2) | YES (max 5) | YES   |

| Cancel own reservation         | YES         | YES         | YES   |

| Borrow Book Online             | YES         | YES         | NO    |

| Return Book                    | YES         | YES         | NO    |

| Renew Book Loan                | NO          | YES         | NO    |

| Pay Fine                       | YES         | YES         | NO    |

| View own loans                 | YES         | YES         | YES   |

| View all loans                 | NO          | NO          | YES   |

| Calculate Fine                 | AUTO        | AUTO        | YES   |

| Record Borrow / Return         | NO          | NO          | YES   |

| Manage Reservation             | NO          | NO          | YES   |

| Add Book                       | NO          | NO          | YES   |

| Manage Books (Add/Edit/Delete) | NO          | NO          | YES   |

| Manage Users                   | NO          | NO          | YES   |

| Generate Reports               | NO          | NO          | YES   |

| View System Reports            | NO          | NO          | YES   |



---



\## 5. Database Schema



\### 5.1 ER Summary

The system uses \*\*Supabase PostgreSQL 15\*\* as the primary relational database.  

Core entities include users, books, categories, transactions, reservations, and notifications.



\*\*Entities\*\*

\- users  

\- categories  

\- books  

\- transactions  

\- reservations  

\- notifications  



\*\*Relationships\*\*

\- One user can have many borrow transactions  

\- One book can appear in many transactions  

\- One user can create many reservations  

\- One book can have many reservations  

\- One category can contain many books  

\- One user can receive many notifications  



users 1 ────< transactions >──── 1 books

users 1 ────< reservations >──── 1 books

categories 1 ────< books

users 1 ────< notifications





\*\*Business Rules\*\*

\- A book must belong to a category  

\- A book can only be borrowed if status = available  

\- Reservations expire after a defined period  

\- Late returns generate fines  

\- Only staff can manage books  



---



\## 5. Database Schema



\### 5.1 ER Summary



profiles (1) ──── (N) loans

profiles (1) ──── (N) reservations

profiles (1) ──── (N) fines

books (1) ──── (N) loans

books (1) ──── (N) reservations

loans (1) ──── (0..1) fines

profiles (1) ──── (N) loans \[issued\_by staff]



Entities:

\- profiles → system users (students, instructors, staff)

\- books → library inventory

\- loans → borrowing transactions

\- reservations → book reservations queue

\- fines → overdue penalties



Relationships:

\- One profile can create many loans  

\- One book can appear in many loans  

\- One loan can generate zero or one fine  

\- One profile can reserve many books  

\- One book can have many reservations  

\- One staff profile issues many loans  



---



\### 5.2 SQL Schema (Execute directly in Supabase SQL Editor)



```sql

-- =============================================

-- RMUTI Library Management System

-- Database Schema v2.0

-- =============================================



CREATE TABLE public.profiles (

&nbsp;   id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

&nbsp;   student\_id VARCHAR(20) UNIQUE,

&nbsp;   full\_name VARCHAR(255) NOT NULL,

&nbsp;   email VARCHAR(255) NOT NULL UNIQUE,

&nbsp;   phone VARCHAR(20),

&nbsp;   role VARCHAR(20) NOT NULL DEFAULT 'student'

&nbsp;       CHECK (role IN ('student','instructor','staff')),

&nbsp;   is\_active BOOLEAN DEFAULT true,

&nbsp;   created\_at TIMESTAMPTZ DEFAULT NOW(),

&nbsp;   updated\_at TIMESTAMPTZ DEFAULT NOW()

);



CREATE TABLE public.books (

&nbsp;   id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

&nbsp;   title VARCHAR(500) NOT NULL,

&nbsp;   author VARCHAR(500) NOT NULL,

&nbsp;   isbn VARCHAR(13) UNIQUE,

&nbsp;   category VARCHAR(100) NOT NULL,

&nbsp;   shelf\_location VARCHAR(50) NOT NULL,

&nbsp;   total\_copies INTEGER NOT NULL DEFAULT 1,

&nbsp;   available\_copies INTEGER NOT NULL DEFAULT 1,

&nbsp;   status VARCHAR(20) DEFAULT 'available'

&nbsp;       CHECK (status IN ('available','borrowed','reserved','unavailable')),

&nbsp;   created\_at TIMESTAMPTZ DEFAULT NOW(),

&nbsp;   updated\_at TIMESTAMPTZ DEFAULT NOW()

);



CREATE TABLE public.loans (

&nbsp;   id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

&nbsp;   book\_id UUID REFERENCES public.books(id),

&nbsp;   user\_id UUID REFERENCES public.profiles(id),

&nbsp;   issued\_by UUID REFERENCES public.profiles(id),

&nbsp;   loan\_date DATE DEFAULT CURRENT\_DATE,

&nbsp;   due\_date DATE NOT NULL,

&nbsp;   return\_date DATE,

&nbsp;   status VARCHAR(20) DEFAULT 'active'

&nbsp;       CHECK (status IN ('active','returned','overdue')),

&nbsp;   created\_at TIMESTAMPTZ DEFAULT NOW(),

&nbsp;   updated\_at TIMESTAMPTZ DEFAULT NOW()

);



CREATE TABLE public.fines (

&nbsp;   id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

&nbsp;   loan\_id UUID UNIQUE REFERENCES public.loans(id),

&nbsp;   user\_id UUID REFERENCES public.profiles(id),

&nbsp;   amount DECIMAL(10,2) DEFAULT 0,

&nbsp;   status VARCHAR(20) DEFAULT 'unpaid'

&nbsp;       CHECK (status IN ('unpaid','paid')),

&nbsp;   created\_at TIMESTAMPTZ DEFAULT NOW(),

&nbsp;   updated\_at TIMESTAMPTZ DEFAULT NOW()

);



CREATE TABLE public.reservations (

&nbsp;   id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

&nbsp;   book\_id UUID REFERENCES public.books(id),

&nbsp;   user\_id UUID REFERENCES public.profiles(id),

&nbsp;   status VARCHAR(20) DEFAULT 'pending'

&nbsp;       CHECK (status IN ('pending','ready','fulfilled','cancelled','expired')),

&nbsp;   reserved\_at TIMESTAMPTZ DEFAULT NOW(),

&nbsp;   expires\_at TIMESTAMPTZ,

&nbsp;   created\_at TIMESTAMPTZ DEFAULT NOW(),

&nbsp;   updated\_at TIMESTAMPTZ DEFAULT NOW()

);



\### 5.3 TypeScript Types



```ts

// src/types/index.ts



/\* =========================

&nbsp;  ENUM TYPES

========================= \*/



export type Role = "student" | "instructor" | "staff";



export type BookStatus =

&nbsp; | "available"

&nbsp; | "borrowed"

&nbsp; | "reserved"

&nbsp; | "unavailable";



export type LoanStatus =

&nbsp; | "active"

&nbsp; | "returned"

&nbsp; | "overdue";



export type FineStatus =

&nbsp; | "unpaid"

&nbsp; | "paid";



export type ReservationStatus =

&nbsp; | "pending"

&nbsp; | "ready"

&nbsp; | "fulfilled"

&nbsp; | "cancelled"

&nbsp; | "expired";



/\* =========================

&nbsp;  CORE TABLE TYPES

========================= \*/



export interface Profile {

&nbsp; id: string;

&nbsp; student\_id: string | null;

&nbsp; full\_name: string;

&nbsp; email: string;

&nbsp; phone: string | null;

&nbsp; role: Role;

&nbsp; is\_active: boolean;

&nbsp; created\_at: string;

&nbsp; updated\_at: string;

}



export interface Book {

&nbsp; id: string;

&nbsp; title: string;

&nbsp; author: string;

&nbsp; isbn: string | null;

&nbsp; category: string;

&nbsp; shelf\_location: string;

&nbsp; total\_copies: number;

&nbsp; available\_copies: number;

&nbsp; status: BookStatus;

&nbsp; created\_at: string;

&nbsp; updated\_at: string;

}



export interface Loan {

&nbsp; id: string;

&nbsp; book\_id: string;

&nbsp; user\_id: string;

&nbsp; issued\_by: string;

&nbsp; loan\_date: string;

&nbsp; due\_date: string;

&nbsp; return\_date: string | null;

&nbsp; status: LoanStatus;

&nbsp; created\_at: string;

&nbsp; updated\_at: string;



&nbsp; // optional joins

&nbsp; book?: Book;

&nbsp; user?: Profile;

&nbsp; issuer?: Profile;

}



export interface Fine {

&nbsp; id: string;

&nbsp; loan\_id: string;

&nbsp; user\_id: string;

&nbsp; amount: number;

&nbsp; status: FineStatus;

&nbsp; paid\_at?: string | null;

&nbsp; created\_at: string;

&nbsp; updated\_at: string;



&nbsp; // joins

&nbsp; loan?: Loan;

&nbsp; user?: Profile;

}



export interface Reservation {

&nbsp; id: string;

&nbsp; book\_id: string;

&nbsp; user\_id: string;

&nbsp; status: ReservationStatus;

&nbsp; reserved\_at: string;

&nbsp; expires\_at?: string | null;

&nbsp; created\_at: string;

&nbsp; updated\_at: string;



&nbsp; // joins

&nbsp; book?: Book;

&nbsp; user?: Profile;

}



/\* =========================

&nbsp;  BUSINESS RULE CONSTANTS

========================= \*/



export const LOAN\_LIMITS: Record<

&nbsp; Role,

&nbsp; { max\_books: number; duration\_days: number }

> = {

&nbsp; student: { max\_books: 3, duration\_days: 14 },

&nbsp; instructor: { max\_books: 10, duration\_days: 30 },

&nbsp; staff: { max\_books: 999, duration\_days: 30 },

};



export const RESERVATION\_LIMITS: Record<Role, number> = {

&nbsp; student: 2,

&nbsp; instructor: 5,

&nbsp; staff: 999,

};



export const FINE\_PER\_DAY = 5.0; // THB per day

export const RESERVATION\_EXPIRY\_HOURS = 48;



/\* =========================

&nbsp;  API RESPONSE TYPES

========================= \*/



export interface ApiResponse<T> {

&nbsp; data: T | null;

&nbsp; error: string | null;

}



export interface Paginated<T> {

&nbsp; items: T\[];

&nbsp; total: number;

&nbsp; page: number;

&nbsp; limit: number;

}



/\* =========================

&nbsp;  DASHBOARD TYPES

========================= \*/



export interface DashboardStats {

&nbsp; total\_books: number;

&nbsp; total\_users: number;

&nbsp; active\_loans: number;

&nbsp; overdue\_loans: number;

&nbsp; unpaid\_fines: number;

}



\## 6. Business Requirements



| ID     | Requirement                                                                 | Priority | Success Metric |

|--------|-----------------------------------------------------------------------------|----------|----------------|

| BR-001 | Reduce staff processing time for issuing and returning books                | MUST     | Loan/return transaction completed in < 10 seconds |

| BR-002 | Allow users to search and check book availability online 24/7               | MUST     | 100% of catalog searchable online |

| BR-003 | Automate fine calculation for overdue books                                 | MUST     | 0% manual fine calculation required |

| BR-004 | Prevent users from borrowing beyond allowed limits                          | MUST     | System blocks loans beyond role limits |

| BR-005 | Track real-time book availability and stock                                 | MUST     | Available copies always accurate |

| BR-006 | Provide reservation system when books are unavailable                       | MUST     | Users can reserve unavailable books |

| BR-007 | Implement FIFO reservation queue                                            | SHOULD   | Reservations served in order |

| BR-008 | Notify users when reserved book becomes available                           | SHOULD   | Email sent within 1 minute of availability |

| BR-009 | Provide overdue alerts to users                                             | MUST     | Overdue email sent daily |

| BR-010 | Allow staff to manage books and inventory                                   | MUST     | Staff CRUD operations available |

| BR-011 | Provide borrowing history for users                                         | MUST     | Users can view full history |

| BR-012 | Generate reports for library usage and popular books                        | SHOULD   | Monthly report generated |

| BR-013 | Ensure role-based access control                                            | MUST     | Unauthorized access = 0 incidents |

| BR-014 | Maintain data integrity for loans, returns, and fines                       | MUST     | No inconsistent loan states |

| BR-015 | Support scalable usage for university-level traffic                         | SHOULD   | System supports 500+ concurrent users |



\## 7. User Requirements



| ID     | User Story                                                                                                                        | Traces To | Priority |

|--------|-----------------------------------------------------------------------------------------------------------------------------------|-----------|----------|

| UR-001 | As a \*\*Student\*\*, I want to search for books online so that I can check availability before going to the library                  | BR-002    | MUST     |

| UR-002 | As a \*\*Student\*\*, I want to see real-time available copies so that I know whether I can borrow immediately                        | BR-005    | MUST     |

| UR-003 | As a \*\*Student\*\*, I want to reserve a book when it is unavailable so that I can get it when it returns                            | BR-006    | MUST     |

| UR-004 | As a \*\*Student\*\*, I want to view my current loans, due dates, and fines so that I can avoid overdue penalties                     | BR-003    | MUST     |

| UR-005 | As a \*\*Student\*\*, I want to receive overdue notifications so that I remember to return books on time                              | BR-009    | MUST     |

| UR-006 | As an \*\*Instructor\*\*, I want to borrow more books with longer durations so that I can use them for teaching                       | BR-004    | MUST     |

| UR-007 | As an \*\*Instructor\*\*, I want to reserve academic books in advance so that I can prepare course materials                          | BR-006    | SHOULD   |

| UR-008 | As a \*\*Staff\*\*, I want to issue and return books quickly so that queues at the counter are reduced                                | BR-001    | MUST     |

| UR-009 | As a \*\*Staff\*\*, I want fines to be calculated automatically when a book is returned late so that I avoid manual errors            | BR-003    | MUST     |

| UR-010 | As a \*\*Staff\*\*, I want to manage books (add, edit, remove) so that the catalog stays accurate                                     | BR-010    | MUST     |

| UR-011 | As a \*\*Staff\*\*, I want to manage user accounts and roles so that only valid members can use the system                            | BR-013    | MUST     |

| UR-012 | As a \*\*Staff\*\*, I want to see reservation queues so that I can prepare books for pickup                                           | BR-007    | SHOULD   |

| UR-013 | As a \*\*Staff\*\*, I want to view system reports (popular books, active loans) so that I can support procurement decisions           | BR-012    | SHOULD   |

| UR-014 | As a \*\*Staff\*\*, I want to mark reserved books as ready for pickup so that users can be notified                                   | BR-008    | SHOULD   |

| UR-015 | As a \*\*User\*\*, I want secure login with my account so that my borrowing data is protected                                         | BR-013    | MUST     |



\## 8. Functional Requirements



\### FR-001: Authentication \& Session Management



| Field       | Value |

|-------------|------|

| \*\*ID\*\*      | FR-001 |

| \*\*Traces\*\*  | UR-001, UR-015 |

| \*\*Priority\*\*| MUST |



\*\*Description:\*\*  

The system must support email/password login via Supabase Auth. After login, the user's role is retrieved from the `profiles` table and used to determine access permissions and dashboard content.



\*\*Business Rules:\*\*

\- Only Staff can create new user accounts

\- No public self-registration

\- Supabase handles session cookies

\- Session expires after 24 hours of inactivity



\*\*Acceptance Criteria:\*\*

Given valid credentials

When user logs in

Then redirect to dashboard



Given invalid credentials

Then show login error



Given unauthenticated access

Then redirect to /login





---



\### FR-002: Book Search \& Catalog



| Field       | Value |

|-------------|------|

| \*\*ID\*\*      | FR-002 |

| \*\*Traces\*\*  | UR-001 |

| \*\*Priority\*\*| MUST |



\*\*Description:\*\*  

Users must be able to search and filter books by title, author, category, or ISBN.



\*\*Business Rules:\*\*

\- Partial keyword search supported

\- Show available copies

\- Only active books visible



\*\*Acceptance Criteria:\*\*

Given search keyword

Then matching books appear



Given book has 0 copies

Then show unavailable status





---



\### FR-003: Borrow Book



| Field       | Value |

|-------------|------|

| \*\*ID\*\*      | FR-003 |

| \*\*Traces\*\*  | UR-008 |

| \*\*Priority\*\*| MUST |



\*\*Description:\*\*  

Staff can issue books to users.



\*\*Business Rules:\*\*

\- Cannot exceed loan limit

\- Book must have available copies

\- Due date auto-calculated

\- available\_copies decreases



\*\*Acceptance Criteria:\*\*

Given book available

When loan created

Then record stored and copies decrease



Given loan limit reached

Then block borrowing





---



\### FR-004: Return Book



| Field       | Value |

|-------------|------|

| \*\*ID\*\*      | FR-004 |

| \*\*Traces\*\*  | UR-008 |

| \*\*Priority\*\*| MUST |



\*\*Description:\*\*  

Staff processes book returns.



\*\*Business Rules:\*\*

\- return\_date recorded

\- available\_copies increases

\- Fine calculated if overdue



\*\*Acceptance Criteria:\*\*

Given on-time return

Then no fine created



Given late return

Then fine created





---



\### FR-005: Reservation System



| Field       | Value |

|-------------|------|

| \*\*ID\*\*      | FR-005 |

| \*\*Traces\*\*  | UR-003 |

| \*\*Priority\*\*| MUST |



\*\*Description:\*\*  

Users can reserve books when unavailable.



\*\*Business Rules:\*\*

\- FIFO queue

\- Cannot reserve twice

\- Expires after 48h



\*\*Acceptance Criteria:\*\*

Given unavailable book

When reserve

Then reservation created



Given book ready

Then notify user





---



\### FR-006: Fine Management



| Field       | Value |

|-------------|------|

| \*\*ID\*\*      | FR-006 |

| \*\*Traces\*\*  | UR-004 |

| \*\*Priority\*\*| MUST |



\*\*Description:\*\*  

System auto-calculates overdue fines.



\*\*Business Rules:\*\*

\- 5 THB per day

\- One fine per loan



\*\*Acceptance Criteria:\*\*

Given overdue return

Then fine created



Given fine paid

Then status updated





---



\### FR-007: Book Management



| Field       | Value |

|-------------|------|

| \*\*ID\*\*      | FR-007 |

| \*\*Traces\*\*  | UR-010 |

| \*\*Priority\*\*| MUST |



\*\*Description:\*\*  

Staff manages book catalog.



\*\*Business Rules:\*\*

\- Staff only

\- ISBN unique

\- total ≥ available



\*\*Acceptance Criteria:\*\*

Given valid data

Then book saved



Given delete

Then allowed if no active loan





---



\### FR-008: User Management



| Field       | Value |

|-------------|------|

| \*\*ID\*\*      | FR-008 |

| \*\*Traces\*\*  | UR-011 |

| \*\*Priority\*\*| MUST |



\*\*Description:\*\*  

Staff manages users and roles.



\*\*Business Rules:\*\*

\- Only staff can assign roles

\- Inactive users cannot borrow



\*\*Acceptance Criteria:\*\*

Given new user

Then invite email sent



Given user inactive

Then borrowing blocked





---



\### FR-009: Notifications



| Field       | Value |

|-------------|------|

| \*\*ID\*\*      | FR-009 |

| \*\*Traces\*\*  | UR-005 |

| \*\*Priority\*\*| SHOULD |



\*\*Description:\*\*  

System sends email notifications.



\*\*Acceptance Criteria:\*\*

Given overdue book

Then email sent



Given reservation ready

Then email sent





---



\### FR-010: Dashboard \& Reports



| Field       | Value |

|-------------|------|

| \*\*ID\*\*      | FR-010 |

| \*\*Traces\*\*  | UR-013 |

| \*\*Priority\*\*| SHOULD |



\*\*Description:\*\*  

Staff dashboard shows statistics.



\*\*Includes:\*\*

\- active loans

\- overdue loans

\- popular books



\*\*Acceptance Criteria:\*\*

Given dashboard open

Then stats load < 3s



\## 9. API Specifications



\### 9.1 Authentication

All API routes require authentication via Supabase session cookie.

Role-based access is enforced using profiles.role (student, instructor, staff).





\###9.2 Endpoints



\#Books (Search, View Status, Check Availability)



\###GET /api/books



```

?q=\&category=\&page=\&limit=\&sort=

Auth: Student, Instructor, Staff

Response 200:{

&nbsp; "data": \[

&nbsp;   {

&nbsp;     "id": "uuid-001",

&nbsp;     "title": "Database Systems",

&nbsp;     "author": "Ramez Elmasri",

&nbsp;     "category": "Computer Science",

&nbsp;     "available\_copies": 2,

&nbsp;     "total\_copies": 3,

&nbsp;     "status": "available"

&nbsp;   }

&nbsp; ],

&nbsp; "pagination": {}

}

```



```

\###GET /api/books/\[id]

Auth: Student, Instructor, Staff

Response:



{

&nbsp; "data": {

&nbsp;   "id": "uuid",

&nbsp;   "title": "Database Systems",

&nbsp;   "description": "...",

&nbsp;   "available\_copies": 2

&nbsp; }

}

Error 404:



{ "error": "BOOK\_NOT\_FOUND" }

```



```

\###POST /api/books (Staff only)

\#Auth: Staff only

Response 201:



{

&nbsp; "data": {

&nbsp;   "id": "uuid-new",

&nbsp;   "title": "Introduction to Algorithms",

&nbsp;   "status": "available"

&nbsp; }

}

Error 403:



{ "error": "FORBIDDEN" }

&nbsp;

PATCH /api/books/\[id]



Auth: Staff only



Response 200:



{

&nbsp; "data": {

&nbsp;   "id": "uuid",

&nbsp;   "updated": true

&nbsp; }

}

DELETE /api/books/\[id]



Auth: Staff only



Response 200:



{

&nbsp; "data": {

&nbsp;   "deleted": true

&nbsp; }

}

```



```

\###POST /api/reservations

Auth: Student, Instructor



Response 201:



{

&nbsp; "data": {

&nbsp;   "id": "uuid-res",

&nbsp;   "book\_id": "uuid-001",

&nbsp;   "status": "pending",

&nbsp;   "reserved\_at": "2026-02-16T10:30:00Z"

&nbsp; }

}

```



```

\###GET /api/reservations/my



Use case: View Reservation



Auth: Student, Instructor



Response 200:



{

&nbsp; "data": \[

&nbsp;   {

&nbsp;     "id": "uuid-res",

&nbsp;     "book\_title": "Database Systems",

&nbsp;     "status": "pending"

&nbsp;   }

&nbsp; ]

}

DELETE /api/reservations/\[id]



Use case: Cancel Reservation



Auth: Student, Instructor



Response 200:



{

&nbsp; "data": {

&nbsp;   "cancelled": true

&nbsp; }

}

```



```

PATCH /api/reservations/\[id]



Use case: Manage Reservation



Auth: Staff only



Response 200:



{

&nbsp; "data": {

&nbsp;   "id": "uuid",

&nbsp;   "status": "fulfilled"

&nbsp; }

}

```



\### Loans



```

POST /api/loans



Use case: Record Borrow



Auth: Staff only



Response 201:



{

&nbsp; "data": {

&nbsp;   "id": "uuid-loan",

&nbsp;   "loan\_date": "2026-02-16",

&nbsp;   "due\_date": "2026-03-02",

&nbsp;   "status": "active"

&nbsp; }

}

```



```

GET /api/loans/my



Use case: View own loans



Auth: Student, Instructor



Response 200:



{

&nbsp; "data": \[

&nbsp;   {

&nbsp;     "id": "uuid-loan",

&nbsp;     "book\_title": "Database Systems",

&nbsp;     "due\_date": "2026-03-02",

&nbsp;     "status": "active"

&nbsp;   }

&nbsp; ]

}

```



```

GET /api/loans



Use case: View all loans



Auth: Staff only



Response 200:



{

&nbsp; "data": \[

&nbsp;   {

&nbsp;     "id": "uuid",

&nbsp;     "user": "สมชาย",

&nbsp;     "book": "Database Systems",

&nbsp;     "status": "active"

&nbsp;   }

&nbsp; ]

}

```



```

POST /api/loans/\[id]/return



Use case: Record Return, Calculate Fine



Auth: Staff only



Response 200:



{

&nbsp; "data": {

&nbsp;   "loan": {

&nbsp;     "status": "returned"

&nbsp;   },

&nbsp;   "fine": {

&nbsp;     "amount": 15,

&nbsp;     "status": "unpaid"

&nbsp;   }

&nbsp; }

}

```



```

POST /api/loans/\[id]/renew



Use case: Renew Loan



Auth: Instructor only



Response 200:



{

&nbsp; "data": {

&nbsp;   "new\_due\_date": "2026-04-01"

&nbsp; }

}

```



```

GET /api/fines/my



Use case: View own fines



Auth: Student, Instructor



Response 200:



{

&nbsp; "data": \[

&nbsp;   {

&nbsp;     "amount": 25,

&nbsp;     "status": "unpaid"

&nbsp;   }

&nbsp; ]

}

```



```

GET /api/fines



Use case: View all fines



Auth: Staff only



Response 200:



{

&nbsp; "data": \[

&nbsp;   {

&nbsp;     "user": "สมชาย",

&nbsp;     "amount": 25,

&nbsp;     "status": "unpaid"

&nbsp;   }

&nbsp; ]

}

PATCH /api/fines/\[id]



Use case: Mark fine as paid



Auth: Staff only



Response 200:



{

&nbsp; "data": {

&nbsp;   "status": "paid",

&nbsp;   "paid\_at": "2026-02-16T14:00:00Z"

&nbsp; }

}

```



```

GET /api/reports/popular-books



Use case: Popular books



Auth: Staff only



Response 200:



{

&nbsp; "data": \[

&nbsp;   {

&nbsp;     "title": "Database Systems",

&nbsp;     "loan\_count": 42

&nbsp;   }

&nbsp; ]

}

```



```

GET /api/reports/overdue-fines



Use case: Overdue fines



Auth: Staff only



Response 200:



{

&nbsp; "data": \[

&nbsp;   {

&nbsp;     "user": "สมชาย",

&nbsp;     "fine\_amount": 25

&nbsp;   }

&nbsp; ],

&nbsp; "summary": {

&nbsp;   "total\_unpaid": 350

&nbsp; }

}

```



```

GET /api/profile



Use case: View own profile



Auth: Student, Instructor, Staff



Response 200:



{

&nbsp; "data": {

&nbsp;   "full\_name": "สมชาย ใจดี",

&nbsp;   "role": "student"

&nbsp; }

}

PATCH /api/profile



Use case: Edit profile



Auth: Student, Instructor, Staff



Response 200:



{

&nbsp; "data": {

&nbsp;   "updated": true

&nbsp; }

}

```



---



\## 10. Non-Functional Requirements



\### 10.1 Performance



| ID      | Requirement                                                                 | Target |

|---------|-----------------------------------------------------------------------------|--------|

| NFR-P1  | Book search response time                                                   | ≤ 2 seconds |

| NFR-P2  | Borrow/return transaction processing                                        | ≤ 10 seconds |

| NFR-P3  | Dashboard statistics load                                                   | ≤ 3 seconds |

| NFR-P4  | System supports concurrent users                                            | ≥ 500 users |

| NFR-P5  | API response time (average)                                                 | ≤ 500 ms |



---



\### 10.2 Availability



| ID      | Requirement                                                                 | Target |

|---------|-----------------------------------------------------------------------------|--------|

| NFR-A1  | System uptime                                                               | ≥ 99% |

| NFR-A2  | Database uptime (Supabase cloud)                                            | ≥ 99% |

| NFR-A3  | System accessible via web browser 24/7                                      | Yes |



---



\### 10.3 Security



| ID      | Requirement                                                                 | Target |

|---------|-----------------------------------------------------------------------------|--------|

| NFR-S1  | Authentication via Supabase Auth                                            | Required |

| NFR-S2  | Role-based access control                                                   | Enforced |

| NFR-S3  | Passwords stored securely (handled by Supabase)                             | Required |

| NFR-S4  | Unauthorized access to protected routes blocked                             | 100% |

| NFR-S5  | Row Level Security enabled on database                                      | Enabled |

| NFR-S6  | HTTPS enforced for all requests                                             | Required |



---



\### 10.4 Usability



| ID      | Requirement                                                                 | Target |

|---------|-----------------------------------------------------------------------------|--------|

| NFR-U1  | Mobile responsive UI                                                        | Required |

| NFR-U2  | Clear error messages                                                        | Required |

| NFR-U3  | Staff can complete loan transaction without training                        | ≤ 1 min learning |

| NFR-U4  | UI supports English language                                                | Required |



---



\### 10.5 Reliability \& Data Integrity



| ID      | Requirement                                                                 | Target |

|---------|-----------------------------------------------------------------------------|--------|

| NFR-R1  | No duplicate loan records                                                   | 0 duplicates |

| NFR-R2  | Fine calculation accuracy                                                   | 100% |

| NFR-R3  | available\_copies always matches actual stock                                | Consistent |

| NFR-R4  | Transactions must be atomic                                                 | Required |



---



\### 10.6 Maintainability



| ID      | Requirement                                                                 | Target |

|---------|-----------------------------------------------------------------------------|--------|

| NFR-M1  | Codebase must use TypeScript                                                | Required |

| NFR-M2  | Modular service architecture                                                | Required |

| NFR-M3  | Environment variables configurable                                          | Required |

| NFR-M4  | Clear project structure                                                     | Required |



---



\### 10.7 Scalability



| ID      | Requirement                                                                 | Target |

|---------|-----------------------------------------------------------------------------|--------|

| NFR-SC1 | Database must support growth to 100k+ records                               | Supported |

| NFR-SC2 | System must support multi-year data                                         | Supported |

| NFR-SC3 | Can deploy to cloud infrastructure                                          | Supported |



---



\## 11. UI/UX Requirements



\### 11.1 Page Layout



All pages must use a consistent layout structure:



\- \*\*Sidebar (left)\*\*  

&nbsp; Width: 256px (desktop)  

&nbsp; Contains role-based navigation menu  

&nbsp; Collapsible on mobile  



\- \*\*Header (top)\*\*  

&nbsp; Displays:

&nbsp; - System title

&nbsp; - Logged-in user name  

&nbsp; - Role badge  

&nbsp; - Logout button  



\- \*\*Main Content Area\*\*  

&nbsp; Displays page-specific content  

&nbsp; Must be responsive and scrollable  



\- \*\*Mobile Behavior\*\*  

&nbsp; Sidebar becomes hamburger menu overlay  

&nbsp; Header remains fixed  

&nbsp; Content stacks vertically  



---



\### 11.2 Pages



| Page             | Route                         | Components                                                                 | Roles |

|------------------|------------------------------|---------------------------------------------------------------------------|------|

| Login            | /login                       | EmailInput, PasswordInput, LoginButton, ErrorAlert                        | Public |

| Dashboard        | /dashboard                   | StatsCards, ActiveLoansTable, OverdueAlertBanner                          | All |

| Book Catalog     | /dashboard/books             | SearchBar, CategoryFilter, SortSelect, BookGrid, Pagination               | All |

| Book Detail      | /dashboard/books/:id         | BookInfo, ShelfLocation, StatusBadge, BorrowButton, ReserveButton         | All |

| Loans            | /dashboard/loans             | LoanTable, ReturnButton, LoanCreateForm (Staff only)                       | All |

| Reservations     | /dashboard/reservations      | ReservationTable, CancelButton, StatusBadge                               | All |

| Fines            | /dashboard/fines             | FineTable, PayFineButton (Staff), OutstandingTotal                         | All |

| Members          | /dashboard/members           | MemberTable, AddMemberForm, RoleBadge                                     | Staff |

| Reports          | /dashboard/reports           | PopularBooksChart, OverdueLoansTable, DateRangeFilter                      | Staff |



---



\### 11.3 Navigation Rules



\- Sidebar menu items must be filtered by role  

\- Students cannot see Members or Reports pages  

\- Staff can access all pages  

\- Unauthorized route access must redirect to dashboard  



---



\### 11.4 Design System



\*\*Framework:\*\* Tailwind CSS v4  

\*\*Component Style:\*\* Clean admin dashboard  



Color usage:

\- Primary: Blue  

\- Success: Green  

\- Warning: Yellow  

\- Danger: Red  

\- Neutral: Gray  



Status badge colors:

\- Available → Green  

\- Borrowed → Yellow  

\- Reserved → Blue  

\- Overdue → Red  



UI behavior:

\- Use skeleton loaders while fetching data  

\- Show toast notifications for success/error  

\- Show confirmation modal before delete/return  

\- Disable buttons during loading  



---



\### 11.5 Forms \& Inputs



\- All forms must validate before submission  

\- Required fields marked with \*  

\- Show inline validation errors  

\- Prevent duplicate submissions  

\- Auto-focus first input field  



---



\### 11.6 Tables \& Lists



All tables must support:

\- Sorting  

\- Pagination  

\- Search/filter  

\- Empty state message  



Example empty states:

\- "No books found"

\- "No active loans"

\- "No reservations yet"



---



\### 11.7 Accessibility



\- Buttons must have accessible labels  

\- Forms must be keyboard accessible  

\- Color contrast must be readable  

\- Mobile friendly touch targets  



---



\### 11.8 Feedback \& Error UI



System must provide feedback for:

\- Successful actions → toast notification  

\- Errors → error banner  

\- Loading → skeleton UI  

\- Confirmation → modal dialog  



Examples:

\- Book borrowed successfully  

\- Fine paid successfully  

\- Login failed  

\- Network error  



---



\## 12. Error Handling Specification



\### 12.1 Error Response Format



All API errors must return a consistent JSON structure:



```json

{

&nbsp; "error": "ERROR\_CODE",

&nbsp; "message": "Human-readable Thai message"

}

```



---



\### 12.2 Error Codes



|HTTP	| Status 	 				|Error Code 	  						|Thai Message	Trigger 			|

|-------|-----------------------|-----------------------------------|---------------------------|

400		|VALIDATION\_ERROR		|กรุณากรอกข้อมูลให้ครบถ้วน				|Missing required fields			|

400		|LOAN\_LIMIT\_EXCEEDED		|{role}ยืมหนังสือได้สูงสุด {n} เล่ม				|Active loans ≥ max allowed for role|

400		|UNPAID\_FINES			|ผู้ใช้มียอดค่าปรับค้างชำระ กรุณาชำระก่อนยืม		|User has unpaid fines			|

400		|BOOK\_NOT\_AVAILABLE		|หนังสือไม่มีสำเนาที่พร้อมให้ยืม				|available\_copies = 0			|

400		|BOOK\_AVAILABLE			|หนังสือยังว่างอยู่ ไม่จำเป็นต้องจอง				|Trying to reserve available book	|

400		|RESERVATION\_LIMIT		|คุณจองหนังสือได้สูงสุด {n} เล่ม				|Active reservations ≥ limit		|

400		|ALREADY\_RESERVED		|คุณจองหนังสือเล่มนี้ไว้แล้ว					|Duplicate reservation			|

400		|ALREADY\_RETURNED		|หนังสือเล่มนี้ถูกคืนแล้ว					|Loan already returned			|

400		|ALREADY\_PAID			|ค่าปรับนี้ชำระแล้ว						|Fine already paid				|

400		|USER\_INACTIVE			|บัญชีผู้ใช้ถูกระงับ						|User inactive					|

401		|UNAUTHORIZED			|กรุณาเข้าสู่ระบบ						|No valid session				|

403		|FORBIDDEN				|เฉพาะเจ้าหน้าที่เท่านั้น					|Non-staff accessing staff endpoint|

404		|NOT\_FOUND				|ไม่พบข้อมูลที่ร้องขอ						|Resource not found			|

409		|DUPLICATE\_ISBN			|ISBN นี้มีในระบบแล้ว						|Duplicate ISBN				|

500		|INTERNAL\_ERROR			|เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง			|Unexpected server error			|



---



\### 12.3 Client-Side Error Display



\*\*Validation Errors\*\*

\-แสดงใต้ input field (สีแดง)



\*\*Business Logic Errors (400)\*\*

\-Toast notification มุมขวาบน

\-ใช้ destructive variant



\*\*Authentication Errors (401)\*\*

\-Redirect ไป /login

\-แนบ return URL



\*\*Permission Errors (403)\*\*

\-Toast notification



\*\*Not Found (404)\*\*

\-แสดงหน้า 404 หรือ toast



\*\*Server Errors (500)\*\*

\-Toast แจ้งข้อผิดพลาด

\-มีปุ่ม Retry (ถ้าเหมาะสม)



---



\## 13. Environment \& Configuration



\### 13.1 `.env.local` Template



```env

\# =========================

\# Supabase

\# =========================

NEXT\_PUBLIC\_SUPABASE\_URL=https://your-project.supabase.co

NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY=eyJhbGci...your-anon-key

SUPABASE\_SERVICE\_ROLE\_KEY=eyJhbGci...your-service-role-key



\# =========================

\# Application

\# =========================

NEXT\_PUBLIC\_APP\_NAME=RMUTI Library

NEXT\_PUBLIC\_APP\_URL=http://localhost:3000



\# =========================

\# Business Rules Config

\# =========================

NEXT\_PUBLIC\_FINE\_PER\_DAY=5

NEXT\_PUBLIC\_RESERVATION\_EXPIRY\_HOURS=48



\### 13.2 Variable Descriptions



| Variable                             | Used In         | Description                                                   |

|--------------------------------------|-----------------|---------------------------------------------------------------|

| NEXT\_PUBLIC\_SUPABASE\_URL             | Client + Server | Supabase project URL                                          |

| NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY        | Client          | Public anonymous key for client-side authentication           |

| SUPABASE\_SERVICE\_ROLE\_KEY            | Server only     | Service role key used in server API routes (bypasses RLS)     |

| NEXT\_PUBLIC\_APP\_NAME                 | Client          | Application name displayed in header/title                    |

| NEXT\_PUBLIC\_APP\_URL                  | Server          | Base URL for generating links (email redirects, etc.)         |

| NEXT\_PUBLIC\_FINE\_PER\_DAY             | Client + Server | Fine rate per overdue day in THB (default: 5)                 |

| NEXT\_PUBLIC\_RESERVATION\_EXPIRY\_HOURS | Server          | Hours before an unclaimed reservation expires (default: 48)   |



---



\### 13.3 Environment Rules



\*\*Security\*\*

\- ห้าม commit .env.local ลง Git

\-SUPABASE\_SERVICE\_ROLE\_KEY ใช้เฉพาะ server

\-Client ใช้ได้เฉพาะ NEXT\_PUBLIC\_\*



\*\*Deployment\*\*

\-Local → ใช้ .env.local

\-Vercel → ตั้งค่าใน Project Settings → Environment Variables

\-Production ต้องเปลี่ยน:

&nbsp;	-APP\_URL

&nbsp;	-Supabase keys

&nbsp;	-Rate config (ถ้าต้องการ)



\*\*Validation on Boot\*\*

\-ระบบควรเช็ค env ตอน start:



```ts

const requiredEnv = \[

&nbsp; "NEXT\_PUBLIC\_SUPABASE\_URL",

&nbsp; "NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY",

&nbsp; "SUPABASE\_SERVICE\_ROLE\_KEY"

];



requiredEnv.forEach((key) => {

&nbsp; if (!process.env\[key]) {

&nbsp;   throw new Error(`Missing env: ${key}`);

&nbsp; }

});

```



---



\## 14. Constraints \& Rules



\### DO NOT



\- DO NOT use Pages Router, `getServerSideProps`, or `getStaticProps`

\- DO NOT use any ORM other than Supabase JS client

\- DO NOT implement self-registration — only Staff can create accounts

\- DO NOT add social login (Google, Facebook, GitHub, etc.)

\- DO NOT add 2FA or magic link authentication

\- DO NOT use Redux, Zustand, Jotai, or any external state manager

\- DO NOT use `any` type in TypeScript — always define proper types

\- DO NOT store fine amounts in the database until the book is actually returned

\- DO NOT allow negative values for `available\_copies`, `fine\_amount`, or `total\_copies`

\- DO NOT delete records permanently — use soft delete:

&nbsp; - Users → `is\_active = false`

&nbsp; - Books → `status = 'unavailable'`

\- DO NOT write raw SQL inside API routes — use Supabase JS client:

&nbsp; `.from().select().eq().insert().update()`

\- DO NOT skip error handling — every API route must use `try/catch` and return standardized error responses



\### ALWAYS



\- ALWAYS validate user role in every Staff-only API route before processing

\- ALWAYS use Server Components by default — only add `"use client"` when hooks are required

\- ALWAYS use TypeScript with strict mode enabled

\- ALWAYS return Thai-language error messages for user-facing errors

\- ALWAYS use UUID for primary keys (Supabase default)

\- ALWAYS check loan limits and unpaid fines before creating a new loan

\- ALWAYS update `books.available\_copies` and `books.status` atomically during loan/return

\- ALWAYS use `TIMESTAMPTZ` (not `TIMESTAMP`) for all datetime columns

\- ALWAYS use `DECIMAL(10,2)` for monetary values (fine amounts)



---



\## 15. Implementation Order



| Phase | Name               | Tasks                                                                                                                                     | Depends On | Estimated Effort |

|------|--------------------|-------------------------------------------------------------------------------------------------------------------------------------------|------------|------------------|

| 1    | \*\*Foundation\*\*     | Project setup (Angular + Tailwind + pnpm), Backend setup (Next.js + Express), Supabase project creation, execute SQL schema, TypeScript types, Supabase client setup, environment variables | -          | 2–3 hours        |

| 2    | \*\*Auth\*\*           | Login page, Supabase Auth integration, session handling, middleware/guards for protected routes, role-based redirects, profile creation | Phase 1    | 3 hours          |

| 3    | \*\*Layout \& Navigation\*\* | Dashboard layout with sidebar, header component, role guard, responsive navigation, mobile menu                                      | Phase 2    | 2 hours          |

| 4    | \*\*Book Catalog\*\*   | Books CRUD API, search (title/author/ISBN), category filter, pagination, Book list UI, Book detail page, availability status logic      | Phase 1,3  | 4 hours          |

| 5    | \*\*Loan System\*\*    | Loan creation API, return API, due-date calculation, loan limits per role, unpaid fine check, update available copies atomically         | Phase 1–4  | 4 hours          |

| 6    | \*\*Reservation System\*\* | Reservation API, FIFO queue logic, cancel reservation, reservation expiry, reservation limits                                         | Phase 1–5  | 3 hours          |

| 7    | \*\*Fine System\*\*    | Fine calculation logic, mark-as-paid API (staff), outstanding fine display, block borrowing when unpaid fines exist                      | Phase 1–5  | 2 hours          |

| 8    | \*\*Members Management\*\* | Members CRUD (staff only), invite flow, activate/deactivate users, role assignment                                                    | Phase 1–3  | 2 hours          |

| 9    | \*\*Reports \& Analytics\*\* | Popular books report, overdue summary, simple charts, date range filter                                                                | Phase 1–7  | 2 hours          |

| 10   | \*\*Polish \& QA\*\*    | Error handling audit, loading states, empty states, Thai language review, responsive testing, edge case fixes, performance check         | Phase 1–9  | 3 hours          |



\*\*Total Estimated Effort: ~27–28 hours\*\*



###### ---



\## 16. Acceptance Criteria Summary



| FR     | Scenario                         | Given                              | When                      | Then                                              |

|--------|----------------------------------|------------------------------------|---------------------------|---------------------------------------------------|

| FR-001 | Successful login                 | Valid credentials                  | Submit login form         | Redirect to /dashboard with role-based content    |

| FR-001 | Failed login                     | Invalid credentials                | Submit login form         | Show error message and stay on /login             |

| FR-001 | Unauthenticated access           | No active session                  | Access protected route    | Redirect to /login                                |

| FR-002 | Search books                     | Books exist in database            | Enter keyword             | Matching books returned within 2 seconds          |

| FR-002 | Filter by category               | Multiple categories exist          | Select category filter    | Only filtered category displayed                  |

| FR-003 | Reserve unavailable book         | available\_copies = 0               | Click reserve             | Reservation created with pending status           |

| FR-003 | Reservation limit reached        | User at reservation limit          | Attempt reservation       | Error message shown                               |

| FR-004 | Create loan                      | Book available, user eligible      | Staff creates loan        | Loan created with correct due date                |

| FR-004 | Loan limit exceeded              | User has max active loans          | Attempt loan creation     | Error message shown                               |

| FR-004 | Unpaid fine exists               | User has unpaid fines              | Attempt loan creation     | Borrowing blocked                                 |

| FR-005 | Return overdue book              | Return after due date              | Process return            | Fine calculated and created                       |

| FR-005 | Return on-time book              | Returned before due date           | Process return            | No fine created                                   |

| FR-006 | Pay fine                         | Fine status unpaid                 | Staff marks paid          | Fine status updated to paid                       |

| FR-007 | View reports                     | Loans exist                        | Staff opens reports       | Popular books sorted by loan count                |



---



\## Appendix A: Gap Analysis (Current vs Proposed)



| Area              | Current (Manual)                              | Proposed System                                      |

|-------------------|-----------------------------------------------|------------------------------------------------------|

| Accessibility     | Must visit library physically                | Access via web from any device                      |

| Processing Speed  | ~10–15 minutes per transaction               | <10 seconds per transaction                         |

| Data Accuracy     | Manual fine calculation                      | Automated fine calculation                          |

| Queue Management  | No reservation tracking                      | FIFO reservation system                             |

| Reporting         | Manual Excel compilation                     | Instant generated reports                           |



---



\## Appendix B: Glossary



| Term         | Definition                                                                 |

|--------------|----------------------------------------------------------------------------|

| RLS          | Row Level Security for controlling database access per user                |

| FIFO         | First In First Out reservation order                                       |

| Supabase     | Backend service providing PostgreSQL, Auth, and APIs                       |

| UUID         | Unique identifier used as primary key                                      |

| THB          | Thai Baht currency                                                         |

| TIMESTAMPTZ  | PostgreSQL timestamp with timezone                                         |

| Loan         | Borrow transaction record                                                  |

| Reservation  | Queue entry for borrowing unavailable book                                 |

| Fine         | Monetary penalty for overdue return                                        |



> \*\*Note for AI Agents:\*\*  

> This SRS is designed to be implemented in phases.  

> Begin with \*\*Sections 2, 3, and 5\*\* (Tech Stack, Project Structure, Database Schema) as the technical foundation.  

> After the foundation is complete, implement features sequentially following \*\*Section 15: Implementation Order\*\*.  

>  

> Each \*\*Functional Requirement (FR)\*\* section is self-contained and includes:

> - Business rules  

> - API behavior expectations  

> - Validation logic  

> - Acceptance criteria  

>  

> AI coding agents should treat each FR as an independent, testable unit and complete them in order without skipping dependencies.

