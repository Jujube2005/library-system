"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLoanById = exports.getAllLoansInSystem = exports.getLoansByUser = exports.renewLoanByStaff = exports.renewLoan = exports.returnLoan = exports.createLoan = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const supabase_1 = require("../config/supabase");
const env_1 = require("../config/env");
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
const createLoan = async (userId, bookId, staffId) => {
    const supabaseAdmin = (0, supabase_js_1.createClient)(env_1.env.supabaseUrl, env_1.env.supabaseServiceRoleKey);
    const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id, role')
        .eq('id', userId)
        .single();
    if (profileError || !profile) {
        throw new Error('ไม่พบข้อมูลผู้ใช้เป้าหมาย');
    }
    const rules = getLoanRulesForRole(profile.role);
    const { count, error: countError } = await supabaseAdmin
        .from('loans')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .in('status', ['active', 'overdue']);
    if (countError) {
        throw new Error('ไม่สามารถตรวจสอบจำนวนการยืมได้');
    }
    if ((count ?? 0) >= rules.maxLoans) {
        throw new Error('ถึงจำนวนการยืมสูงสุดตามสิทธิ์แล้ว');
    }
    const { data: book, error: bookError } = await supabaseAdmin
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
    const { error: updateBookError } = await supabaseAdmin
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
    const { data, error } = await supabaseAdmin
        .from('loans')
        .insert([{
            user_id: userId,
            book_id: bookId,
            issued_by: staffId,
            loan_date: today.toISOString().slice(0, 10),
            due_date: dueDate.toISOString().slice(0, 10),
            status: 'active'
        }])
        .select()
        .single();
    if (error) {
        throw new Error('ไม่สามารถบันทึกการยืมได้');
    }
    return data;
};
exports.createLoan = createLoan;
const returnLoan = async (loanId) => {
    const supabaseAdmin = (0, supabase_js_1.createClient)(env_1.env.supabaseUrl, env_1.env.supabaseServiceRoleKey);
    const { error: rpcError } = await supabaseAdmin
        .rpc('process_return', { p_loan_id: loanId });
    if (rpcError) {
        throw new Error('ไม่สามารถประมวลผลการคืนหนังสือได้');
    }
    const { data: loan, error: loanError } = await supabaseAdmin
        .from('loans')
        .select('*')
        .eq('id', loanId)
        .single();
    if (loanError || !loan) {
        throw new Error('ไม่พบข้อมูลการยืมหลังคืนหนังสือ');
    }
    const { data: fine } = await supabaseAdmin
        .from('fines')
        .select('*')
        .eq('loan_id', loanId)
        .single();
    if (fine && fine.amount > 0) {
        const userId = loan.user_id;
        if (userId) {
            try {
                await (0, notification_service_1.createNotification)(supabaseAdmin, {
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
exports.returnLoan = returnLoan;
const renewLoan = async (loanId, userId) => {
    const { data: loan, error: fetchError } = await supabase_1.supabase
        .from('loans')
        .select('*')
        .eq('id', loanId)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();
    if (fetchError || !loan) {
        throw new Error("ไม่พบรายการยืมที่สามารถต่ออายุได้");
    }
    const isOverdue = new Date(loan.due_date) < new Date();
    if (isOverdue) {
        throw new Error("ไม่สามารถต่ออายุได้เนื่องจากเกินกำหนดส่ง กรุณาติดต่อ Staff");
    }
    const currentDueDate = new Date(loan.due_date);
    currentDueDate.setDate(currentDueDate.getDate() + 14);
    const { data, error: updateError } = await supabase_1.supabase
        .from('loans')
        .update({
        due_date: currentDueDate.toISOString().slice(0, 10)
    })
        .eq('id', loanId)
        .select()
        .single();
    if (updateError) {
        throw new Error("ไม่สามารถต่ออายุการยืมได้");
    }
    return data;
};
exports.renewLoan = renewLoan;
const renewLoanByStaff = async (loanId, userId, staffId) => {
    const supabaseAdmin = (0, supabase_js_1.createClient)(env_1.env.supabaseUrl, env_1.env.supabaseServiceRoleKey);
    const { data: loan, error: fetchError } = await supabaseAdmin
        .from('loans')
        .select('*')
        .eq('id', loanId)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();
    if (fetchError || !loan) {
        throw new Error("ไม่พบรายการยืมที่สามารถต่ออายุได้");
    }
    const currentDueDate = new Date(loan.due_date);
    currentDueDate.setDate(currentDueDate.getDate() + 14); // ต่ออายุ 14 วัน
    const { data, error: updateError } = await supabaseAdmin
        .from('loans')
        .update({
        due_date: currentDueDate.toISOString().slice(0, 10),
        issued_by: staffId // บันทึกว่า Staff คนไหนต่ออายุ
    })
        .eq('id', loanId)
        .select()
        .single();
    if (updateError) {
        throw new Error("ไม่สามารถต่ออายุการยืมได้");
    }
    return data;
};
exports.renewLoanByStaff = renewLoanByStaff;
const getLoansByUser = async (userId) => {
    const { data, error } = await supabase_1.supabase
        .from('loans')
        .select(`
      id,
      loan_date,
      due_date,
      return_date,
      status,
      books (
        id,
        title,
        author
      )
    `)
        .eq('user_id', userId)
        .order('loan_date', { ascending: false });
    if (error) {
        throw new Error("ไม่สามารถดึงข้อมูลการยืมได้");
    }
    return data;
};
exports.getLoansByUser = getLoansByUser;
const getAllLoansInSystem = async () => {
    const { data, error } = await supabase_1.supabase
        .from('loans')
        .select(`
      id,
      user_id,
      book_id,
      loan_date,
      due_date,
      return_date,
      status,
      user:profiles!loans_user_id_fkey (
        id,
        full_name,
        role,
        email,
        is_active
      ),
      book:books (
        title
      )
    `)
        .order('due_date', { ascending: true });
    if (error) {
        throw new Error("ไม่สามารถดึงข้อมูลรายการยืมทั้งหมดได้");
    }
    return data;
};
exports.getAllLoansInSystem = getAllLoansInSystem;
const getLoanById = async (loanId) => {
    const { data, error } = await supabase_1.supabase
        .from('loans')
        .select(`
      id,
      user_id,
      book_id,
      loan_date,
      due_date,
      return_date,
      status,
      user:profiles!loans_user_id_fkey (
        id,
        full_name,
        role,
        email,
        is_active
      ),
      book:books (
        id,
        title,
        author,
        isbn,
        category,
        shelf_location
      )
    `)
        .eq('id', loanId)
        .single();
    if (error) {
        // ถ้าไม่พบ loan จะ return null แทนที่จะ throw error
        if (error.code === 'PGRST116')
            return null; // Not Found
        throw new Error(error.message);
    }
    return data;
};
exports.getLoanById = getLoanById;
