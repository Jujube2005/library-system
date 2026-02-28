"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateCurrentFine = exports.processPayment = exports.getAllFines = exports.getMyFines = void 0;
const getMyFines = async (supabase, userId) => {
    const { data, error } = await supabase
        .from('fines')
        .select('id, loan_id, amount, status, created_at, updated_at, paid_at')
        .eq('user_id', userId);
    if (error) {
        console.error('Supabase Fines Error:', error);
        throw error; // Throw the original error object
    }
    return data;
};
exports.getMyFines = getMyFines;
const getAllFines = async (supabase) => {
    const { data, error } = await supabase
        .from('fines')
        .select('id, loan_id, user_id, amount, status, created_at, updated_at, paid_at');
    if (error) {
        throw new Error('ไม่สามารถดึงข้อมูลค่าปรับทั้งหมดได้');
    }
    return data;
};
exports.getAllFines = getAllFines;
const processPayment = async (supabase, fineId) => {
    const { data: fine, error } = await supabase
        .from('fines')
        .select('id, status')
        .eq('id', fineId)
        .single();
    if (error || !fine) {
        throw new Error('ไม่พบข้อมูลค่าปรับ');
    }
    if (fine.status === 'paid') {
        throw new Error('รายการนี้ชำระเงินเรียบร้อยแล้ว');
    }
    const { data: updatedFine, error: updateError } = await supabase
        .from('fines')
        .update({
        status: 'paid',
        paid_at: new Date()
    })
        .eq('id', fineId)
        .select()
        .single();
    if (updateError) {
        throw new Error('ไม่สามารถอัปเดตสถานะค่าปรับได้');
    }
    return updatedFine;
};
exports.processPayment = processPayment;
const calculateCurrentFine = (dueDate, dailyRate = 5) => {
    const now = new Date();
    const due = new Date(dueDate);
    // ถ้ายังไม่เลยกำหนด ค่าปรับเป็น 0
    if (now <= due)
        return 0;
    // คำนวณส่วนต่างของวัน
    const diffInTime = now.getTime() - due.getTime();
    const diffInDays = Math.ceil(diffInTime / (1000 * 3600 * 24));
    return diffInDays * dailyRate;
};
exports.calculateCurrentFine = calculateCurrentFine;
