"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBookInfo = exports.deleteBookSafely = exports.createBook = exports.confirmReservationByStaff = exports.recordReturnByStaff = exports.recordBorrowByStaff = void 0;
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
    const { data: book, error: bookError } = await supabase_1.supabase
        .from('books')
        .select('id, available_copies')
        .eq('id', bookId)
        .single();
    if (bookError || !book) {
        throw new Error('ไม่พบข้อมูลหนังสือ');
    }
    if (book.available_copies <= 0) {
        throw new Error('หนังสือไม่เหลือให้ยืม');
    }
    const { error: updateBookError } = await supabase_1.supabase
        .from('books')
        .update({
        available_copies: book.available_copies - 1
    })
        .eq('id', bookId);
    if (updateBookError) {
        throw new Error('ไม่สามารถอัปเดตจำนวนคงเหลือของหนังสือได้');
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
    if (fine && fine.amount > 0) {
        const userId = loan.user_id;
        if (userId) {
            try {
                await (0, notification_service_1.createNotification)(supabase_1.supabase, {
                    userId,
                    type: 'overdue_fine',
                    message: `คุณมีค่าปรับ ${Number(fine.amount)} บาทจากการคืนหนังสือเกินกำหนด`
                });
            }
            catch {
            }
        }
    }
    return { loan, fine };
};
exports.recordReturnByStaff = recordReturnByStaff;
const confirmReservationByStaff = async (reservationId, staffId) => {
    const { data: resv, error } = await supabase_1.supabase
        .from('reservations')
        .select('id, user_id, book_id, status, reserved_at, expires_at')
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
    const loans = await (0, exports.recordBorrowByStaff)(staffId, userId, bookId);
    const loan = Array.isArray(loans) ? loans[0] : loans;
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
    return { reservationId, loan };
};
exports.confirmReservationByStaff = confirmReservationByStaff;
const createBook = async (bookData) => {
    const { data: existingBook } = await supabase_1.supabase
        .from('books')
        .select('id, total_copies, available_copies')
        .eq('isbn', bookData.isbn)
        .single();
    if (existingBook) {
        const increment = Number(bookData.total_copies ?? bookData.copies ?? 1);
        const { data } = await supabase_1.supabase
            .from('books')
            .update({
            total_copies: existingBook.total_copies + increment,
            available_copies: existingBook.available_copies + increment
        })
            .eq('id', existingBook.id);
        return { message: "เพิ่มจำนวนหนังสือเดิมสำเร็จ", data };
    }
    const totalCopies = Number(bookData.total_copies ?? bookData.copies ?? 1);
    const availableCopies = Number(typeof bookData.available_copies === 'number'
        ? bookData.available_copies
        : totalCopies);
    const { data, error } = await supabase_1.supabase
        .from('books')
        .insert([{
            title: bookData.title,
            author: bookData.author,
            isbn: bookData.isbn,
            category: bookData.category,
            total_copies: totalCopies,
            available_copies: availableCopies,
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
    const { count, error: loanError } = await supabase_1.supabase
        .from('loans')
        .select('id', { count: 'exact', head: true })
        .eq('book_id', bookId)
        .in('status', ['active', 'overdue']);
    if (loanError) {
        throw new Error("ไม่สามารถตรวจสอบสถานะการยืมของหนังสือได้");
    }
    if ((count ?? 0) > 0) {
        throw new Error("ไม่สามารถลบหนังสือได้เนื่องจากยังมีรายการยืมค้างอยู่");
    }
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
