import { supabase } from "../config/supabase"

export const renewLoan = async (loanId: string, userId: string) => {
  const { data: loan, error: fetchError } = await supabase
    .from('loans')
    .select('*')
    .eq('id', loanId)
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

  if (fetchError || !loan) {
    throw new Error("ไม่พบรายการยืมที่สามารถต่ออายุได้")
  }

  const isOverdue = new Date(loan.due_date) < new Date()
  if (isOverdue) {
    throw new Error("ไม่สามารถต่ออายุได้เนื่องจากเกินกำหนดส่ง กรุณาติดต่อ Staff")
  }

  const currentDueDate = new Date(loan.due_date)
  currentDueDate.setDate(currentDueDate.getDate() + 14)

  const { data, error: updateError } = await supabase
    .from('loans')
    .update({
      due_date: currentDueDate.toISOString().slice(0, 10)
    })
    .eq('id', loanId)
    .select()
    .single()

  if (updateError) {
    throw new Error("ไม่สามารถต่ออายุการยืมได้")
  }

  return data
}

export const getLoansByUser = async (userId: string) => {
  const { data, error } = await supabase
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
    .order('loan_date', { ascending: false })

  if (error) {
    throw new Error("ไม่สามารถดึงข้อมูลการยืมได้")
  }

  return data
}

export const getAllLoansInSystem = async () => {
  const { data, error } = await supabase
    .from('loans')
    .select(`
      id,
      loan_date,
      due_date,
      return_date,
      status,
      user:profiles (
        full_name,
        role,
        email
      ),
      book:books (
        title
      )
    `)
    .order('due_date', { ascending: true })

  if (error) {
    throw new Error("ไม่สามารถดึงข้อมูลรายการยืมทั้งหมดได้")
  }

  return data
};
