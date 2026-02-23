import { supabase } from '../config/supabase';

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, avatar_url, bio')
    .eq('id', userId)
    .single();

  if (error) throw new Error("Profile not found");
  return data;
}

export const updateUserRole = async (targetUserId: string, newRole: 'Student' | 'Instructor' | 'Staff') => {
  // 1. ตรวจสอบว่า User ที่จะแก้ไขมีตัวตนอยู่จริง
  // 2. อัปเดต Role ในตาราง Profiles
  const { data, error } = await supabase
    .from('profiles')
    .update({ 
      role: newRole,
      updated_at: new Date() 
    })
    .eq('id', targetUserId)
    .select();

  if (error) throw new Error("ไม่สามารถเปลี่ยนสิทธิ์ผู้ใช้ได้");
  return data;
};