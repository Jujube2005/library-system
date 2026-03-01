import express from 'express'
import cors from 'cors'
import { env } from './config/env'
import authRouter from './routers/auth-router'
import bookRouter from './routers/book-router'
import userRouter from './routers/user-router'
import loanRouter from './routers/loan-router'
import reservationRouter from './routers/reservation-router'
import fineRouter from './routers/fine-router'
import staffRouter from './routers/staff-router'
import adminRouter from './routers/admin-router'
import reportRouter from './routers/report-router'
import notificationRouter from './routers/notification-router'

const app = express()

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`)
  next()
})

app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}))
app.use(express.json())
app.use('/api/auth', authRouter)
app.use('/api/books', bookRouter)
app.use('/api/loans', loanRouter)
app.use('/api/reservations', reservationRouter)
app.use('/api/fines', fineRouter)
app.use('/api/users', userRouter)
app.use('/api/staff', staffRouter)
app.use('/api/admin', adminRouter)
app.use('/api/reports', reportRouter)
app.use('/api/notifications', notificationRouter)
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is reachable' })
})

app.get('/api/diag-books', async (req, res) => {
  try {
    const { createClient } = require('@supabase/supabase-js')
    const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey)
    const { data, error } = await supabase.from('books').select('id, title').limit(5)
    res.json({ data, error })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

const port = env.port

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`)
})
