import { SupabaseClient } from '@supabase/supabase-js';

export const getUserProfile = async (supabase: SupabaseClient, userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, student_id, phone, role, is_active, created_at, updated_at')
    .eq('id', userId)
    .single();

  if (error) throw new Error('Profile not found');
  return data;
}

export const updateUserRole = async (supabase: SupabaseClient, targetUserId: string, newRole: 'student' | 'instructor' | 'staff') => {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      role: newRole,
      updated_at: new Date()
    })
    .eq('id', targetUserId)
    .select();

  if (error) throw new Error('ไม่สามารถเปลี่ยนสิทธิ์ผู้ใช้ได้');
  return data;
};

export const listUsers = async (supabase: SupabaseClient) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, student_id, phone, role, is_active, created_at, updated_at')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('ไม่สามารถดึงรายการผู้ใช้ได้')
  }

  return data
}

export const updateUserStatus = async (supabase: SupabaseClient, targetUserId: string, isActive: boolean) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      is_active: isActive,
      updated_at: new Date()
    })
    .eq('id', targetUserId)
    .select('id, full_name, email, student_id, phone, role, is_active, created_at, updated_at')
    .single()

  if (error) {
    throw new Error('ไม่สามารถเปลี่ยนสถานะผู้ใช้ได้')
  }

  return data
}

export const updateMyProfile = async (
  supabase: SupabaseClient,
  userId: string,
  updates: {
    full_name?: string
    phone?: string
    student_id?: string
  }
) => {
  const payload: Record<string, unknown> = {}

  if (typeof updates.full_name === 'string') {
    payload.full_name = updates.full_name
  }

  if (typeof updates.phone === 'string') {
    payload.phone = updates.phone
  }

  if (typeof updates.student_id === 'string') {
    payload.student_id = updates.student_id
  }

  if (Object.keys(payload).length === 0) {
    throw new Error('No fields to update')
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', userId)
    .select('id, full_name, email, student_id, phone, role, is_active, created_at, updated_at')
    .single()

  if (error) {
    throw new Error('Unable to update profile')
  }

  return data
};
