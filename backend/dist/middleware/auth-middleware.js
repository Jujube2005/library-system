"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const env_1 = require("../config/env");
const supabase_admin_1 = require("../config/supabase-admin");
const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
        if (!token) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const supabase = (0, supabase_js_1.createClient)(env_1.env.supabaseUrl, env_1.env.supabaseAnonKey, {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        });
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
            res.status(401).json({ message: 'Invalid token' });
            return;
        }
        // Use admin client for profile check to BE FAST (bypasses RLS overhead)
        const { data: profile, error: profileError } = await supabase_admin_1.supabaseAdmin
            .from('profiles')
            .select('id, role, is_active')
            .eq('id', user.id)
            .single();
        if (profileError || !profile) {
            res.status(403).json({ message: 'Access denied: Profile not found' });
            return;
        }
        if (profile.is_active === false) {
            res.status(403).json({ message: 'Account is inactive' });
            return;
        }
        const userPayload = {
            id: profile.id,
            role: profile.role
        };
        req.user = userPayload;
        req.supabase = supabase;
        req.supabaseAdmin = supabase_admin_1.supabaseAdmin;
        next();
    }
    catch (err) {
        console.error('Auth Middleware Error:', err);
        res.status(500).json({ message: 'Internal server error during authentication' });
    }
};
exports.protect = protect;
