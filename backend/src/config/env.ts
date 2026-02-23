import * as dotenv from 'dotenv'
import path from 'path'

const rootEnvPath = path.resolve(__dirname, '../../../.env')
const backendEnvPath = path.resolve(__dirname, '../../.env')

dotenv.config({ path: rootEnvPath })
dotenv.config({ path: backendEnvPath })

const requiredEnv = ['SUPABASE_URL', 'SUPABASE_ANON_KEY']

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing env: ${key}`)
  }
})

export const env = {
  supabaseUrl: process.env.SUPABASE_URL as string,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY as string,
  port: Number(process.env.PORT ?? 4000)
}

