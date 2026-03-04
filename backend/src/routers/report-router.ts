import { Router, Response } from 'express'
import { protect } from '../middleware/auth-middleware'
import { authorize } from '../middleware/role-middleware'
import { supabaseAdmin } from '../config/supabase-admin'

const router = Router()

router.use(protect, authorize('staff'))

router.get('/popular-books', async (req: any, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('loans')
      .select('book_id, books ( title )')

    if (error) {
      res.status(500).json({ error: error.message })
      return
    }

    const counter: Record<string, { book_id: string; title: string | null; loan_count: number }> = {}

    for (const row of data ?? []) {
      const bookId = row.book_id as string
      const title = (row as any).books?.title ?? null

      if (!counter[bookId]) {
        counter[bookId] = { book_id: bookId, title, loan_count: 0 }
      }

      counter[bookId].loan_count += 1
    }

    const items = Object.values(counter).sort((a, b) => b.loan_count - a.loan_count)

    res.json({
      data: items
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/overdue-fines', async (req: any, res: Response) => {
  try {
    const { data: fines, error } = await supabaseAdmin
      .from('fines')
      .select('id, amount, status, user_id, profiles ( full_name )')
      .order('created_at', { ascending: false })

    if (error) {
      res.status(500).json({ error: error.message })
      return
    }

    let totalUnpaid = 0
    let totalPaid = 0

    const items = (fines ?? []).map((row: any) => {
      const amount = Number(row.amount ?? 0)
      const status = row.status as string

      if (status === 'unpaid') {
        totalUnpaid += amount
      } else if (status === 'paid') {
        totalPaid += amount
      }

      return {
        id: row.id,
        user_id: row.user_id as string,
        user_name: row.profiles?.full_name ?? null,
        amount,
        status
      }
    })

    res.json({
      data: items,
      summary: {
        total_unpaid: totalUnpaid,
        total_paid: totalPaid,
        total_revenue: totalPaid
      }
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

export default router
