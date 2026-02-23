import { createClient } from '@supabase/supabase-js'
import { env } from '../config/env'

type AuthResult<T = unknown> =
    | { success: true; data: T }
    | { success: false; message: string }

type LoginData = {
    accessToken: string
    refreshToken: string | null
}

export async function login(email: string, password: string): Promise<AuthResult<LoginData>> {
    const client = createClient(env.supabaseUrl, env.supabaseAnonKey)

    const { data, error } = await client.auth.signInWithPassword({
        email,
        password
    })

    if (error || !data.session) {
        return {
            success: false,
            message: error?.message ?? 'Login failed'
        }
    }

    return {
        success: true,
        data: {
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token ?? null
        }
    }
}

export async function register(
    email: string,
    password: string
): Promise<AuthResult<null>> {
    const client = createClient(env.supabaseUrl, env.supabaseAnonKey)

    const { error } = await client.auth.signUp({
        email,
        password
    })

    if (error) {
        return {
            success: false,
            message: error.message
        }
    }

    return {
        success: true,
        data: null
    }
}

export async function logout(accessToken: string): Promise<AuthResult<null>> {
    const client = createClient(env.supabaseUrl, env.supabaseAnonKey, {
        global: {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    })

    const { error } = await client.auth.signOut()

    if (error) {
        return {
            success: false,
            message: error.message
        }
    }

    return {
        success: true,
        data: null
    }
}
