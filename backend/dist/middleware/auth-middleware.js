"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const env_1 = require("../config/env");
const protect = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
    if (!token) {
        console.log('No token found in request');
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    console.log('Validating token...');
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
    const { data: profile, error: profileError } = await supabase
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
    ;
    req.user = {
        id: profile.id,
        role: profile.role
    };
    console.log(`Authenticated: ${profile.id} (${profile.role})`);
    req.supabase = supabase;
    next();
};
exports.protect = protect;
