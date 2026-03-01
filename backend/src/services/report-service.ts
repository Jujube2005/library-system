import { supabase } from "../config/supabase"

export const getMonthlyReport = async (month: number, year: number) => {
  // ดึงข้อมูลการยืมในช่วงเวลาที่กำหนด
  const { data, error, count } = await supabase
    .from('borrowings')
    .select('*', { count: 'exact' })
    .gte('borrow_date', `${year}-${month}-01`)
    .lte('borrow_date', `${year}-${month}-31`);

  if (error) throw new Error("ไม่สามารถสร้างรายงานได้");

  // สรุปสถิติเบื้องต้น
  const report = {
    total_borrowed: count,
    overdue_count: data.filter(item => item.status === 'overdue').length,
    returned_count: data.filter(item => item.status === 'returned').length,
  };

  return report;
};