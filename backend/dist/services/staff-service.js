"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmReservationByStaff = void 0;
const supabase_1 = require("../config/supabase");
const notification_service_1 = require("./notification-service");
const loanService = __importStar(require("./loan-service"));
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
    const loan = await loanService.createLoan(userId, bookId, staffId);
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
            message: 'รายการจองของคุณครบถ้วนและเริ่มการยืมแล้ว'
        });
    }
    catch {
    }
    return { reservationId, loan };
};
exports.confirmReservationByStaff = confirmReservationByStaff;
