"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markNotificationAsRead = exports.getMyNotifications = exports.createNotification = void 0;
const createNotification = async (supabase, input) => {
    const { data, error } = await supabase
        .from('notifications')
        .insert({
        user_id: input.userId,
        notification_type: input.type,
        message: input.message
    })
        .select()
        .single();
    if (error) {
        throw new Error('ไม่สามารถสร้างการแจ้งเตือนได้');
    }
    return data;
};
exports.createNotification = createNotification;
const getMyNotifications = async (supabase, userId) => {
    const { data, error } = await supabase
        .from('notifications')
        .select('id, notification_type, message, is_read, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    if (error) {
        throw new Error('ไม่สามารถดึงข้อมูลการแจ้งเตือนได้');
    }
    return data;
};
exports.getMyNotifications = getMyNotifications;
const markNotificationAsRead = async (supabase, notificationId, userId) => {
    const { data, error } = await supabase
        .from('notifications')
        .update({
        is_read: true
    })
        .eq('id', notificationId)
        .eq('user_id', userId)
        .select()
        .single();
    if (error) {
        throw new Error('ไม่สามารถอัปเดตสถานะการแจ้งเตือนได้');
    }
    return data;
};
exports.markNotificationAsRead = markNotificationAsRead;
