import express from 'express'
import cors from 'cors'
import { env } from './config/env'
<<<<<<< HEAD
import authRouter from './routers/auth-router'
import bookRouter from './routers/book-router'
import userRouter from './routers/user-router'
=======
>>>>>>> 5ca0ff5f5837a9afd664b560f1769471e2f3f5ab

const app = express()

app.use(cors())
app.use(express.json())
<<<<<<< HEAD
app.use('/api/auth', authRouter)
app.use('/api/books', bookRouter)
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})
app.use('/api/books', bookRouter);
app.use('/api/users', userRouter);
=======

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})
>>>>>>> 5ca0ff5f5837a9afd664b560f1769471e2f3f5ab

const port = env.port

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`)
<<<<<<< HEAD
})
=======
})

>>>>>>> 5ca0ff5f5837a9afd664b560f1769471e2f3f5ab
