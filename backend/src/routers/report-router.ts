import { Router, Response } from 'express'
import { protect } from '../middleware/auth-middleware'
import { authorize } from '../middleware/role-middleware'

const router = Router()

router.use(protect, authorize('staff'))

router.get('/popular-books', async (req: any, res: Response) => {
  try {
    const supabase = req.supabase

    if (!supabase) {
      res.status(500).json({ error: 'Supabase client not available' })
      return
    }

    const { data, error } = await supabase
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
    const supabase = req.supabase

    if (!supabase) {
      res.status(500).json({ error: 'Supabase client not available' })
      return
    }

    const { data, error } = await supabase
      .from('fines')
      .select('amount, status, user_id, profiles ( full_name )')
      .eq('status', 'unpaid')

    if (error) {
      res.status(500).json({ error: error.message })
      return
    }

    let total = 0

    const items = (data ?? []).map((row: any) => {
      const amount = Number(row.amount ?? 0)
      total += amount

      return {
        user_id: row.user_id as string,
        user_name: row.profiles?.full_name ?? null,
        amount
      }
    })

    res.json({
      data: items,
      summary: {
        total_unpaid: total
      }
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

export default router
