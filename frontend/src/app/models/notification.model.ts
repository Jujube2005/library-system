export interface Notification {
  id: string
  notification_type: string | null
  message: string | null
  is_read: boolean
  created_at: string
}

