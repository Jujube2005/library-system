import { Component, inject, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservationApiService } from '../../../services/reservation-api.service';

@Component({
    selector: 'app-reservation-management',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './reservation-management.html',
    styleUrls: ['./reservation-management.css']
})
export class ReservationManagementComponent implements OnInit {
    reservations: any[] = [];
    loading = false;
    error = '';

    toastMessage: { message: string, type: 'success' | 'error' } | null = null;
    private toastTimeout: any;

    private cdr = inject(ChangeDetectorRef);
    private zone = inject(NgZone);
    private reservationApi = inject(ReservationApiService);

    ngOnInit() {
        void this.loadReservations();
    }

    showToast(message: string, type: 'success' | 'error' = 'success') {
        this.toastMessage = { message, type };
        if (this.toastTimeout) clearTimeout(this.toastTimeout);
        this.toastTimeout = setTimeout(() => {
            this.toastMessage = null;
            this.cdr.detectChanges();
        }, 3000);
        this.cdr.detectChanges();
    }

    async loadReservations() {
        this.loading = true;
        this.error = '';

        try {
            const res = await this.reservationApi.getAllReservations();
            this.zone.run(() => {
                this.reservations = res.data;
            });
        } catch (err: any) {
            this.zone.run(() => {
                this.error = err.message || 'ไม่สามารถโหลดรายการจองได้';
            });
        } finally {
            this.zone.run(() => {
                this.loading = false;
                this.cdr.detectChanges();
            });
        }
    }

    async updateStatus(id: string, status: string) {
        try {
            await this.reservationApi.updateReservationStatus(id, status);
            this.showToast(`อัปเดตสถานะเป็น ${status} สำเร็จ`);
            await this.loadReservations();
        } catch (err: any) {
            const msg = err.error?.error || err.message || 'Error updating status';
            this.showToast(msg, 'error');
        }
    }

    async confirmCollection(resv: any) {
        if (!confirm(`ยืนยันการรับหนังสือโดย ${resv.user.full_name}?`)) return;

        try {
            // เรียกใช้ PATCH /api/reservations/:id ด้วย status: 'completed'
            // ซึ่งใน backend จะไปเรียก confirmReservationByStaff และสร้าง loan ให้อัตโนมัติ
            await this.reservationApi.updateReservationStatus(resv.id, 'completed');
            this.showToast('บันทึกการรับยืมสำเร็จ และสร้างรายการยืมเรียบร้อย');
            await this.loadReservations();
        } catch (err: any) {
            const msg = err.error?.error || err.message || 'Error confirming pickup';
            this.showToast(msg, 'error');
        }
    }

    // Helper getters to fix template parser errors
    get pendingCount(): number {
        return this.reservations?.filter(r => r.status === 'pending').length || 0;
    }

    get readyCount(): number {
        return this.reservations?.filter(r => r.status === 'ready').length || 0;
    }

    get completedCount(): number {
        return this.reservations?.filter(r => r.status === 'completed').length || 0;
    }
}
