"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBookInfo = exports.deleteBookSafely = exports.createBook = exports.confirmReservationByStaff = exports.recordReturnByStaff = exports.recordBorrowByStaff = void 0;
const supabase_1 = require("../config/supabase");
const getLoanRulesForRole = (role) => {
    if (role === 'instructor') {
        return { maxLoans: 10, loanDays: 30 };
    }
    if (role === 'student') {
        return { maxLoans: 5, loanDays: 7 };
    }
    return { maxLoans: 5, loanDays: 7 };
};
const recordBorrowByStaff = async (staffId, targetUserId, bookId) => {
    const { data: profile, error: profileError } = await supabase_1.supabase
        .from('profiles')
        .select('id, role')
        .eq('id', targetUserId)
        .single();
    if (profileError || !profile) {
        throw new Error('ไม่พบข้อมูลผู้ใช้เป้าหมาย');
    }
    const rules = getLoanRulesForRole(profile.role);
    const { count, error: countError } = await supabase_1.supabase
        .from('loans')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', targetUserId)
        .in('status', ['active', 'overdue']);
    if (countError) {
        throw new Error('ไม่สามารถตรวจสอบจำนวนการยืมได้');
    }
    if ((count ?? 0) >= rules.maxLoans) {
        throw new Error('ถึงจำนวนการยืมสูงสุดตามสิทธิ์แล้ว');
    }
    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + rules.loanDays);
    const { data, error } = await supabase_1.supabase
        .from('loans')
        .insert([{
            user_id: targetUserId,
            book_id: bookId,
            issued_by: staffId,
            loan_date: today.toISOString().slice(0, 10),
            due_date: dueDate.toISOString().slice(0, 10),
            status: 'active'
        }])
        .select();
    if (error) {
        throw new Error('ไม่สามารถบันทึกการยืมได้');
    }
    return data;
};
exports.recordBorrowByStaff = recordBorrowByStaff;
const recordReturnByStaff = async (loanId) => {
    const { error: rpcError } = await supabase_1.supabase
        .rpc('process_return', { p_loan_id: loanId });
    if (rpcError) {
        throw new Error('ไม่สามารถประมวลผลการคืนหนังสือได้');
    }
    const { data: loan, error: loanError } = await supabase_1.supabase
        .from('loans')
        .select('*')
        .eq('id', loanId)
        .single();
    if (loanError || !loan) {
        throw new Error('ไม่พบข้อมูลการยืมหลังคืนหนังสือ');
    }
    const { data: fine } = await supabase_1.supabase
        .from('fines')
        .select('*')
        .eq('loan_id', loanId)
        .single();
    return { loan, fine };
};
exports.recordReturnByStaff = recordReturnByStaff;
const confirmReservationByStaff = async (reservationId, staffId) => {
    // 1. ตรวจสอบว่ารายการจองมีอยู่จริงและสถานะคือ 'reserved'
    const { data: resv, error } = await supabase_1.supabase
        .from('reservations')
        .select('*')
        .eq('id', reservationId)
        .single();
    if (!resv || resv.status !== 'pending')
        throw new Error("รายการจองไม่ถูกต้อง");
    // 2. สร้างรายการยืมใหม่ (Borrowing)
    await supabase_1.supabase.from('borrowings').insert({
        user_id: resv.user_id,
        book_id: resv.book_id,
        staff_id: staffId,
        borrow_date: new Date(),
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    // 3. อัปเดตสถานะการจองเป็น 'completed'
    await supabase_1.supabase.from('reservations').update({ status: 'completed' }).eq('id', reservationId);
    return { message: "ยืนยันการรับหนังสือสำเร็จ" };
};
exports.confirmReservationByStaff = confirmReservationByStaff;
const createBook = async (bookData) => {
    // 1. ตรวจสอบก่อนว่าหนังสือที่มี ISBN นี้มีอยู่แล้วหรือยัง
    const { data: existingBook } = await supabase_1.supabase
        .from('books')
        .select('id, stock_count')
        .eq('isbn', bookData.isbn)
        .single();
    if (existingBook) {
        // ถ้ามีแล้ว อาจจะเพิ่มแค่จำนวนเล่ม (Stock) แทนการเพิ่ม Row ใหม่
        const { data } = await supabase_1.supabase
            .from('books')
            .update({ stock_count: existingBook.stock_count + bookData.stock_count })
            .eq('id', existingBook.id);
        return { message: "เพิ่มจำนวนหนังสือเดิมสำเร็จ", data };
    }
    // 2. ถ้าเป็นหนังสือใหม่ ให้เพิ่มข้อมูลทั้งหมดเข้าไป
    const { data, error } = await supabase_1.supabase
        .from('books')
        .insert([{
            title: bookData.title,
            author: bookData.author,
            isbn: bookData.isbn,
            category: bookData.category,
            stock_count: bookData.stock_count,
            status: 'available',
            created_at: new Date()
        }])
        .select();
    if (error)
        throw new Error("ไม่สามารถเพิ่มหนังสือได้: " + error.message);
    return data;
};
exports.createBook = createBook;
// services/staffService.ts
const deleteBookSafely = async (bookId) => {
    // แทนที่จะ .delete() เราใช้ .update() เพื่อเปลี่ยนสถานะแทน
    const { data, error } = await supabase_1.supabase
        .from('books')
        .update({
        is_archived: true,
        status: 'unavailable',
        deleted_at: new Date()
    })
        .eq('id', bookId);
    if (error)
        throw new Error("ไม่สามารถลบหนังสือได้");
    return data;
};
exports.deleteBookSafely = deleteBookSafely;
const updateBookInfo = async (bookId, updateData) => {
    const { data, error } = await supabase_1.supabase
        .from('books')
        .update(updateData) // รับเฉพาะฟิลด์ที่ต้องการแก้ เช่น { title: 'ชื่อใหม่' }
        .eq('id', bookId)
        .select();
    if (error)
        throw new Error("แก้ไขข้อมูลไม่สำเร็จ");
    return data;
};
exports.updateBookInfo = updateBookInfo;
