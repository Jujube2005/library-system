import express from 'express'
import cors from 'cors'
import { env } from './config/env'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

const port = env.port

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`)
})

