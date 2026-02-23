"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserProfile = void 0;
const supabase_1 = require("../config/supabase");
const getUserProfile = async (userId) => {
    const { data, error } = await supabase_1.supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, bio')
        .eq('id', userId)
        .single();
    if (error)
        throw new Error("Profile not found");
    return data;
};
exports.getUserProfile = getUserProfile;
