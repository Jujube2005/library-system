import { supabase } from '../config/supabase';

export const processPayment = async (borrowId: string, userId: string) => {

  const { data: loan, error } = await supabase
    .from('borrowings')
    .select('id, due_date, fine_amount, status')
    .eq('id', borrowId)
    .eq('user_id', userId) 
    .single();

  if (error || !loan) throw new Error("ไม่พบข้อมูลรายการค้างชำระ");
  if (loan.status === 'paid') throw new Error("รายการนี้ชำระเงินเรียบร้อยแล้ว");
  const paymentSuccess = true; 

  if (paymentSuccess) {
    const { data: updatedLoan } = await supabase
      .from('borrowings')
      .update({ 
        status: 'returned_and_paid', 
        fine_paid_date: new Date() 
      })
      .eq('id', borrowId)
      .select();

    return updatedLoan;
  }
}

export const calculateCurrentFine = (dueDate: string, dailyRate: number = 10) => {
  const now = new Date();
  const due = new Date(dueDate);
  
  // ถ้ายังไม่เลยกำหนด ค่าปรับเป็น 0
  if (now <= due) return 0;

  // คำนวณส่วนต่างของวัน
  const diffInTime = now.getTime() - due.getTime();
  const diffInDays = Math.ceil(diffInTime / (1000 * 3600 * 24));

  return diffInDays * dailyRate;
};