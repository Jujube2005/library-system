import { supabase } from "../config/supabase"

export const getMonthlyReport = async (month: number, year: number) => {
  // ดึงข้อมูลการยืมในช่วงเวลาที่กำหนด
  const monthStr = month < 10 ? `0${month}` : month;
  const { data, error, count } = await supabase
    .from('loans')
    .select('*', { count: 'exact' })
    .gte('loan_date', `${year}-${monthStr}-01`)
    .lte('loan_date', `${year}-${monthStr}-31`);

  if (error) {
    console.error('Report Error:', error);
    throw new Error("ไม่สามารถสร้างรายงานได้");
  }

  // สรุปสถิติเบื้องต้น
  const report = {
    total_borrowed: count,
    overdue_count: data.filter(item => item.status === 'overdue').length,
    returned_count: data.filter(item => item.status === 'returned').length,
  };

  return report;
};