"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllLoansInSystem = exports.getLoansByUser = exports.renewLoan = void 0;
const supabase_1 = require("../config/supabase");
const renewLoan = async (loanId, userId) => {
    const { data: loan, error: fetchError } = await supabase_1.supabase
        .from('borrowings')
        .select('*')
        .eq('id', loanId)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();
    if (fetchError || !loan)
        throw new Error("ไม่พบรายการยืมที่สามารถต่ออายุได้");
    const isOverdue = new Date(loan.due_date) < new Date();
    if (isOverdue)
        throw new Error("ไม่สามารถต่ออายุได้เนื่องจากเกินกำหนดส่ง กรุณาติดต่อ Staff");
    const currentDueDate = new Date(loan.due_date);
    const newDueDate = new Date(currentDueDate.setDate(currentDueDate.getDate() + 14));
    const { data, error: updateError } = await supabase_1.supabase
        .from('borrowings')
        .update({
        due_date: newDueDate,
        renewed_count: (loan.renewed_count || 0) + 1
    })
        .eq('id', loanId)
        .select()
        .single();
    if (updateError)
        throw new Error("ไม่สามารถต่ออายุการยืมได้");
    return data;
};
exports.renewLoan = renewLoan;
const getLoansByUser = async (userId) => {
    const { data, error } = await supabase_1.supabase
        .from('borrowings')
        .select(`
      id,
      borrow_date,
      due_date,
      status,
      fine_amount,
      books (
        title,
        author,
        cover_image
      )
    `)
        .eq('user_id', userId)
        .order('borrow_date', { ascending: false });
    if (error)
        throw new Error("ไม่สามารถดึงข้อมูลการยืมได้");
    return data;
};
exports.getLoansByUser = getLoansByUser;
const getAllLoansInSystem = async () => {
    const { data, error } = await supabase_1.supabase
        .from('borrowings')
        .select(`
      id,
      borrow_date,
      due_date,
      status,
      fine_amount,
      users (
        full_name,
        role,
        email
      ),
      books (
        title
      )
    `)
        .order('due_date', { ascending: true }); // เรียงตามวันกำหนดส่ง (เพื่อให้ Staff เห็นรายการที่ใกล้ส่งคืนก่อน)
    if (error)
        throw new Error("ไม่สามารถดึงข้อมูลรายการยืมทั้งหมดได้");
    return data;
};
exports.getAllLoansInSystem = getAllLoansInSystem;
