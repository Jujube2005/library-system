import dotenv from 'dotenv'

dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` })

const requiredEnv = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'CORS_ORIGIN'
]

// ensure all required environment variables are defined
requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing env: ${key}`)
  }
})

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  supabaseUrl: process.env.SUPABASE_URL as string,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY as string,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  corsOrigin: process.env.CORS_ORIGIN as string,
  port: Number(process.env.PORT ?? 4000),
}
