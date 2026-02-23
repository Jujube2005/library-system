import { SupabaseClient } from '@supabase/supabase-js'

type CreateNotificationInput = {
  userId: string
  type: string
  message: string
}

export const createNotification = async (supabase: SupabaseClient, input: CreateNotificationInput) => {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: input.userId,
      notification_type: input.type,
      message: input.message
    })
    .select()
    .single()

  if (error) {
    throw new Error('ไม่สามารถสร้างการแจ้งเตือนได้')
  }

  return data
}

export const getMyNotifications = async (supabase: SupabaseClient, userId: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('id, notification_type, message, is_read, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('ไม่สามารถดึงข้อมูลการแจ้งเตือนได้')
  }

  return data
}

export const markNotificationAsRead = async (supabase: SupabaseClient, notificationId: string, userId: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .update({
      is_read: true
    })
    .eq('id', notificationId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    throw new Error('ไม่สามารถอัปเดตสถานะการแจ้งเตือนได้')
  }

  return data
}

