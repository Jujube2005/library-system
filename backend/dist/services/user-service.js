"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMyProfile = exports.updateUserStatus = exports.listUsers = exports.updateUserRole = exports.getUserProfile = void 0;
const getUserProfile = async (supabase, userId) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, student_id, phone, role, is_active, created_at, updated_at')
        .eq('id', userId)
        .single();
    if (error)
        throw new Error('Profile not found');
    return data;
};
exports.getUserProfile = getUserProfile;
const updateUserRole = async (supabase, targetUserId, newRole) => {
    const { data, error } = await supabase
        .from('profiles')
        .update({
        role: newRole,
        updated_at: new Date()
    })
        .eq('id', targetUserId)
        .select();
    if (error)
        throw new Error('ไม่สามารถเปลี่ยนสิทธิ์ผู้ใช้ได้');
    return data;
};
exports.updateUserRole = updateUserRole;
const listUsers = async (supabase) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, student_id, phone, role, is_active, created_at, updated_at')
        .order('created_at', { ascending: false });
    if (error) {
        throw new Error('ไม่สามารถดึงรายการผู้ใช้ได้');
    }
    return data;
};
exports.listUsers = listUsers;
const updateUserStatus = async (supabase, targetUserId, isActive) => {
    const { data, error } = await supabase
        .from('profiles')
        .update({
        is_active: isActive,
        updated_at: new Date()
    })
        .eq('id', targetUserId)
        .select('id, full_name, email, student_id, phone, role, is_active, created_at, updated_at')
        .single();
    if (error) {
        throw new Error('ไม่สามารถเปลี่ยนสถานะผู้ใช้ได้');
    }
    return data;
};
exports.updateUserStatus = updateUserStatus;
const updateMyProfile = async (supabase, userId, updates) => {
    const payload = {};
    if (typeof updates.full_name === 'string') {
        payload.full_name = updates.full_name;
    }
    if (typeof updates.phone === 'string') {
        payload.phone = updates.phone;
    }
    if (Object.keys(payload).length === 0) {
        throw new Error('No fields to update');
    }
    const { data, error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', userId)
        .select('id, full_name, email, student_id, phone, role, is_active, created_at, updated_at')
        .single();
    if (error) {
        throw new Error('Unable to update profile');
    }
    return data;
};
exports.updateMyProfile = updateMyProfile;
