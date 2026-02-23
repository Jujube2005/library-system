import express from 'express'
import cors from 'cors'
import { env } from './config/env'
import authRouter from './routers/auth-router'
import bookRouter from './routers/book-router'
import userRouter from './routers/user-router'

const app = express()

app.use(cors())
app.use(express.json())
app.use('/api/auth', authRouter)
app.use('/api/books', bookRouter)
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})
app.use('/api/books', bookRouter);
app.use('/api/users', userRouter);

const port = env.port

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`)
})