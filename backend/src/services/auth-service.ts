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
    password: string,
    fullName: string, 
    phone: string,    
    studentId?: string 
): Promise<AuthResult<null>> {
    const client = createClient(env.supabaseUrl, env.supabaseAnonKey)
    const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                phone: phone,
                student_id: studentId
            }
        }
    })

    if (error) {
        return {
            success: false,
            message: error.message
        }
    }

    // If registration is successful and we have a user ID, 
    // we manually insert/update the profile using service role key
    // to ensure student_id and phone are saved.
    if (data.user && env.supabaseServiceRoleKey) {
        const adminClient = createClient(env.supabaseUrl, env.supabaseServiceRoleKey)
        
        await adminClient
            .from('profiles')
            .upsert({
                id: data.user.id,
                email: email,
                full_name: fullName,
                phone: phone,
                student_id: studentId,
                role: 'student',
                is_active: true
            }, { onConflict: 'id' })
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
