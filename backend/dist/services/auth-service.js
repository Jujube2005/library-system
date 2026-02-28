"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.register = register;
exports.logout = logout;
const supabase_js_1 = require("@supabase/supabase-js");
const env_1 = require("../config/env");
async function login(email, password) {
    const client = (0, supabase_js_1.createClient)(env_1.env.supabaseUrl, env_1.env.supabaseAnonKey);
    const { data, error } = await client.auth.signInWithPassword({
        email,
        password
    });
    if (error || !data.session) {
        return {
            success: false,
            message: error?.message ?? 'Login failed'
        };
    }
    return {
        success: true,
        data: {
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token ?? null
        }
    };
}
async function register(email, password, fullName, phone, studentId, role = 'student') {
    const client = (0, supabase_js_1.createClient)(env_1.env.supabaseUrl, env_1.env.supabaseAnonKey);
    const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                phone: phone,
                student_id: studentId,
                role: role
            }
        }
    });
    if (error) {
        return {
            success: false,
            message: error.message
        };
    }
    // If registration is successful and we have a user ID, 
    // we manually insert/update the profile using service role key
    // to ensure student_id and phone are saved.
    if (data.user && env_1.env.supabaseServiceRoleKey) {
        const adminClient = (0, supabase_js_1.createClient)(env_1.env.supabaseUrl, env_1.env.supabaseServiceRoleKey);
        await adminClient
            .from('profiles')
            .upsert({
            id: data.user.id,
            email: email,
            full_name: fullName,
            phone: phone,
            student_id: studentId,
            role: role,
            is_active: true
        }, { onConflict: 'id' });
    }
    return {
        success: true,
        data: null
    };
}
async function logout(accessToken) {
    const client = (0, supabase_js_1.createClient)(env_1.env.supabaseUrl, env_1.env.supabaseAnonKey, {
        global: {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    });
    const { error } = await client.auth.signOut();
    if (error) {
        return {
            success: false,
            message: error.message
        };
    }
    return {
        success: true,
        data: null
    };
}
