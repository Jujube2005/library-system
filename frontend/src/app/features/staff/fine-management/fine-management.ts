import { Component, OnInit, ChangeDetectorRef } from '@angular/core'
import { NgFor, NgIf, DatePipe, DecimalPipe } from '@angular/common'
import { FineApiService } from '../../../services/fine-api.service'
import { Fine } from '../../../models/fine.model'

@Component({
    selector: 'app-fine-management',
    standalone: true,
    imports: [NgFor, NgIf, DatePipe, DecimalPipe],
    templateUrl: './fine-management.html',
    styleUrls: ['./fine-management.css']
})
export class FineManagementComponent implements OnInit {
    fines: Fine[] = []
    loading = false
    error = ''

    constructor(
        private fineApi: FineApiService,
        private cdr: ChangeDetectorRef
    ) { }

    get outstandingTotal() {
        return this.fines
            .filter(f => f.status === 'unpaid')
            .reduce((sum, f) => sum + f.amount, 0)
    }

    ngOnInit() {
        void this.loadFines()
    }

    async loadFines() {
        this.loading = true
        this.error = ''
        try {
            const res = await this.fineApi.getAllFines()
            this.fines = res.data
        } catch (err) {
            console.error('Load Fines Error:', err)
            this.error = 'ไม่สามารถดึงรายการค่าปรับทั้งหมดได้'
        } finally {
            this.loading = false
            this.cdr.detectChanges()
        }
    }

    async markAsPaid(fine: Fine) {
        if (this.loading || fine.status === 'paid') return

        try {
            this.loading = true
            await this.fineApi.markAsPaid(fine.id)
            await this.loadFines()
        } catch {
            this.error = 'ไม่สามารถบันทึกการจ่ายเงินได้'
        } finally {
            this.loading = false
            this.cdr.detectChanges()
        }
    }
}
