# RMUTI Library Management System — TASKS

ไฟล์นี้รวบรวม task หลักสำหรับพัฒนาโปรเจกต์ตาม SRS

---

## Phase 1 – Foundation

- [INFRA] สร้าง Supabase project และรัน SQL schema จาก SRS (tables: profiles, books, loans, reservations, fines)
- [DB] ตั้งค่า RLS และ policy ตาม role (student/instructor/staff)
- [INFRA] ตั้งค่า environment variables สำหรับ local และเตรียมค่าไว้ใช้บน Vercel
- [FE] สร้าง Angular workspace (`frontend/`) + ติดตั้ง Tailwind CSS v4 + config basic layout
- [BE] สร้าง Node.js + Express project (`backend/`) + ติดตั้ง Supabase JS client v2 + config การเชื่อมต่อ
- [BE] สร้างโครงสร้างโฟลเดอร์ backend: controllers, routes, services, middleware, config, types
- [FE][BE] สร้าง TypeScript types กลางตาม SRS section 5.3 (Role, Book, Loan, Fine, Reservation, DashboardStats ฯลฯ)
- [BE] สร้าง utility ตรวจสอบ environment variables ตามตัวอย่างใน SRS (throw error ถ้า env ขาด)

---

## Phase 2 – Authentication & Session (FR-001)

- [BE] เขียน middleware ดึง session จาก Supabase Auth (cookie) + โหลด profile จาก `profiles`
- [BE] สร้าง endpoint `/api/profile` (view/edit profile) ตาม SRS
- [BE] สร้าง middleware ตรวจสอบ role (student/instructor/staff) สำหรับใช้ใน staff-only endpoints
- [FE] พัฒนาหน้า Login `/login` (EmailInput, PasswordInput, LoginButton, ErrorAlert) + validation
- [FE] เชื่อมต่อหน้า Login กับ Supabase Auth (signIn, แสดง error ตาม message format)
- [FE] สร้าง Angular route guards:
  - ป้องกันเข้าหน้า dashboard ถ้าไม่ login
  - redirect ไป `/login` เมื่อไม่มี session
- [FE] ดึงข้อมูล profile หลัง login มาเก็บใน service (full_name, role) เพื่อใช้ใน header + navigation

---

## Phase 3 – Layout & Navigation (UI/UX 11.x)

- [FE] สร้าง layout หลัก: Sidebar + Header + Main content ตามข้อ 11.1
- [FE] ทำ responsive behavior: sidebar พับได้บน mobile, header fixed, main scrollable
- [FE] สร้าง navigation menu ตาม role (filter menu items ตาม 4.3 และ 11.3)
- [FE] สร้าง routing structure:
  - `/dashboard`
  - `/dashboard/books`
  - `/dashboard/books/:id`
  - `/dashboard/loans`
  - `/dashboard/reservations`
  - `/dashboard/fines`
  - `/dashboard/members`
  - `/dashboard/reports`
- [FE] สร้าง component สำหรับ feedback พื้นฐาน: toast, modal, skeleton loader, error banner เพื่อใช้ทุกหน้า

---

## Phase 4 – Book Catalog (FR-002, FR-007 บางส่วน)

- [BE] สร้าง Books API:
  - `GET /api/books` (search, filter, pagination)
  - `GET /api/books/:id`
  - `POST /api/books` (staff only)
  - `PATCH /api/books/:id` (staff only)
  - `DELETE /api/books/:id` (soft delete)
- [BE] ใส่ business rules:
  - แสดงเฉพาะหนังสือที่ `status != 'unavailable'`
  - ตรวจ ISBN ซ้ำ → error `DUPLICATE_ISBN`
  - ห้ามลบหนังสือที่มี active loans
- [FE] พัฒนาหน้า Book Catalog `/dashboard/books`:
  - SearchBar, CategoryFilter, SortSelect, BookGrid, Pagination
  - แสดง `available_copies` และ `status` ด้วย badge สีตามข้อ 11.4
- [FE] พัฒนาหน้า Book Detail `/dashboard/books/:id`:
  - แสดงรายละเอียดหนังสือ, shelf location, status badge
  - ปุ่ม Borrow และ Reserve (จะเชื่อม API ใน Phase 5–6)
- [FE] ทำหน้าจัดการหนังสือสำหรับ Staff (reuse catalog + ปุ่ม Add/Edit/Delete)

---

## Phase 5 – Loan System (FR-003, FR-004)

- [BE] เขียน service คำนวณ due date ตาม role จาก LOAN_LIMITS
- [BE] สร้าง Loans API:
  - `POST /api/loans` – Record Borrow (staff only)
  - `GET /api/loans/my` – ดูประวัติยืมของตนเอง
  - `GET /api/loans` – ดูประวัติยืมทั้งหมด (staff only)
  - `POST /api/loans/:id/return` – คืนหนังสือ + auto fine
  - `POST /api/loans/:id/renew` – ต่ออายุยืม (instructor only)
- [BE] ใส่ business rules:
  - เช็ค loan limit ต่อ role → error `LOAN_LIMIT_EXCEEDED`
  - เช็ค unpaid fines → error `UNPAID_FINES`
  - เช็ค book availability (`available_copies > 0`, `status = 'available'`) → error `BOOK_NOT_AVAILABLE`
  - อัปเดต `available_copies` และ `status` แบบ transaction/atomic
- [FE] หน้า Loans `/dashboard/loans`:
  - Student/Instructor: ตาราง loans ตัวเอง
  - Staff: ตาราง loans ทั้งหมด + ฟอร์มสร้าง loan ใหม่ (เลือกสมาชิก + หนังสือ)
- [FE] ผูกปุ่ม Return / Renew กับ API พร้อม toast success/error

---

## Phase 6 – Reservation System (FR-005)

- [BE] ออกแบบ logic FIFO queue และ expiration ตาม `RESERVATION_EXPIRY_HOURS`
- [BE] สร้าง Reservations API:
  - `POST /api/reservations` (student/instructor)
  - `GET /api/reservations/my`
  - `DELETE /api/reservations/:id` – cancel
  - `PATCH /api/reservations/:id` – manage (staff only: ready/fulfilled/cancelled/expired)
- [BE] ใส่ business rules:
  - ห้ามจองเล่มเดิมซ้ำ → error `ALREADY_RESERVED`
  - Limit การจองต่อ role → error `RESERVATION_LIMIT`
  - ถ้าหนังสือยัง available → error `BOOK_AVAILABLE`
- [FE] ผูกปุ่ม Reserve ใน Book Detail เข้ากับ `POST /api/reservations`
- [FE] หน้า Reservations `/dashboard/reservations`:
  - ผู้ใช้: ดูรายการจองของตัวเอง
  - Staff: ดู queue ต่อเล่ม + ปรับสถานะ (ready/fulfilled/cancelled)

---

## Phase 7 – Fine System (FR-006)

- [BE] ฝัง logic คำนวณค่าปรับ (ใช้ `FINE_PER_DAY`) ใน flow คืนหนังสือ (`POST /api/loans/:id/return`)
- [BE] สร้าง Fines API:
  - `GET /api/fines/my` – ผู้ใช้ดูค่าปรับตัวเอง
  - `GET /api/fines` – staff ดูค่าปรับทั้งหมด
  - `PATCH /api/fines/:id` – mark as paid (staff only)
- [BE] ใส่ business rules:
  - สร้าง fine ได้เพียงใบเดียวต่อ loan
  - ห้าม mark paid ซ้ำ → error `ALREADY_PAID`
- [FE] หน้า Fines `/dashboard/fines`:
  - สำหรับผู้ใช้: ตารางค่าปรับ + สถานะ (unpaid/paid)
  - สำหรับ staff: ตารางค่าปรับทั้งหมด + ปุ่ม “Mark as paid”
- [FE] แสดง outstanding fine summary (ยอดค้างชำระรวม) ตาม SRS

---

## Phase 8 – Members Management (FR-008)

- [BE] สร้าง Members API (ใช้ `profiles`):
  - `GET /api/members` (filter by role/status)
  - `POST /api/members` – สร้างบัญชี + ส่ง invite email
  - `PATCH /api/members/:id` – แก้ไขข้อมูล/role/สถานะ active
- [BE] Business rules:
  - เฉพาะ staff สามารถ assign role
  - ถ้า `is_active = false` → block borrowing (error `USER_INACTIVE`) ใน flow สร้าง loan
- [FE] หน้า Members `/dashboard/members`:
  - MemberTable + AddMemberForm + RoleBadge
  - ปุ่ม Activate/Deactivate + เปลี่ยน role

---

## Phase 9 – Reports & Analytics (FR-010)

- [BE] สร้าง Reports API:
  - `GET /api/reports/popular-books`
  - `GET /api/reports/overdue-fines`
- [BE] เขียน query aggregate ผ่าน Supabase client ให้ payload ตรงตาม SRS
- [FE] หน้า Reports `/dashboard/reports`:
  - PopularBooksChart จาก popular-books
  - OverdueLoansTable และ summary จาก overdue-fines
  - DateRangeFilter ส่ง query ไปยัง Reports API

---

## Phase 10 – Polish, Error Handling, QA

- [BE] ทบทวนทุก API ให้ใช้ `try/catch` และส่ง error format เดียวกันตามข้อ 12.1 + 12.2
- [FE] ทำให้ทุกหน้าใช้ toast/skeleton/modal/error banner ร่วมกันอย่างสม่ำเสมอ
- [FE] ตรวจสอบ UX ตาม NFR:
  - Responsive (mobile-first)
  - Accessibility basic: keyboard navigation, labels, color contrast
  - Empty states ในทุกตาราง (No books, No loans, No reservations ฯลฯ)
- [FE][BE] ทดสอบ scenario ตาม “Acceptance Criteria Summary” ใน section 16 ของ SRS
- [INFRA] เตรียม deploy ไป Vercel + test environment บน production (keys, URL, rate config)

---

> หมายเหตุ: สามารถแปลงแต่ละ Phase เป็น Epic แล้วใช้ bullet เป็น Task/Subtask ใน Jira/Trello ได้เลย โดยอ้างอิง ID จาก SRS (BR/UR/FR/NFR) ใน description/acceptance criteria