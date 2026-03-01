"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmReservationByStaff = void 0;
const supabase_1 = require("../config/supabase");
const notification_service_1 = require("./notification-service");
const getLoanRulesForRole = (role) => {
    if (role === 'instructor') {
        return { maxLoans: 10, loanDays: 30 };
    }
    if (role === 'student') {
        return { maxLoans: 5, loanDays: 7 };
    }
    return { maxLoans: 5, loanDays: 7 };
};
const confirmReservationByStaff = async (reservationId, staffId) => {
    const { data: resv, error } = await supabase_1.supabase
        .from('reservations')
        .select('id, user_id, book_id, status, reserved_at')
        .eq('id', reservationId)
        .single();
    if (error || !resv || resv.status !== 'pending') {
        throw new Error("รายการจองไม่ถูกต้อง");
    }
    const userId = resv.user_id;
    const bookId = resv.book_id;
    const reservedAt = resv.reserved_at;
    if (reservedAt) {
        const { data: earlier, error: earlierError } = await supabase_1.supabase
            .from('reservations')
            .select('id')
            .eq('book_id', bookId)
            .eq('status', 'pending')
            .lt('reserved_at', reservedAt);
        if (!earlierError && (earlier ?? []).length > 0) {
            throw new Error("ต้องยืนยันการจองตามลำดับคิวที่จองก่อน");
        }
    }
    // แทนที่ด้วย loanService.createLoan
    // const loans = await recordBorrowByStaff(staffId, userId, bookId)
    // const loan = Array.isArray(loans) ? loans[0] : loans
    const { error: updateError } = await supabase_1.supabase
        .from('reservations')
        .update({ status: 'completed' })
        .eq('id', reservationId);
    if (updateError) {
        throw new Error("ไม่สามารถอัปเดตสถานะการจองได้");
    }
    try {
        await (0, notification_service_1.createNotification)(supabase_1.supabase, {
            userId,
            type: 'reservation_ready',
            message: 'รายการจองของคุณพร้อมรับแล้วที่ห้องสมุด'
        });
    }
    catch {
    }
    return { reservationId, loan: null }; // loan is not directly returned here anymore
};
exports.confirmReservationByStaff = confirmReservationByStaff;
