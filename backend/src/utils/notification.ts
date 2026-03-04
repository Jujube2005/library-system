import { SupabaseClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '../config/supabase-admin';
import { calculateFine } from './fine';
import { sendFineEmail } from './email';
import { getFineEmailHtml } from '../templates/fineEmailTemplate';

export const createNotification = async (
    userId: string,
    title: string,
    message: string
) => {
    const { data, error } = await supabaseAdmin
        .from('notifications')
        .insert({
            user_id: userId,
            title,
            message
        })
        .select()
        .single();

    if (error) {
        console.error('Create notification error:', error);
        throw new Error('ไม่สามารถสร้างการแจ้งเตือนได้');
    }

    return data;
};

export const checkAndNotifyFine = async (userId: string) => {
    try {
        // 1. Fetch user profile
        const { data: user } = await supabaseAdmin
            .from('profiles')
            .select('email, full_name')
            .eq('id', userId)
            .single();

        if (!user) return;

        // 2. Fetch active loans to check if overdue
        const { data: loans } = await supabaseAdmin
            .from('loans')
            .select(`
        id,
        due_date,
        books (
          title
        )
      `)
            .eq('user_id', userId)
            .in('status', ['active', 'overdue']);

        if (!loans || loans.length === 0) return;

        // 3. Get existing notifications for this user
        const { data: existingNotifs } = await supabaseAdmin
            .from('notifications')
            .select('title, is_read, created_at')
            .eq('user_id', userId);

        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        for (const loan of loans) {
            const bookTitle = (loan.books as any)?.title || 'Unknown Book';
            const dueDate = loan.due_date;
            const amount = calculateFine(dueDate);

            if (amount > 0) {
                const title = `แจ้งเตือนค่าปรับ: ${bookTitle}`;
                const message = `คุณมีค่าปรับ ${amount} บาท สำหรับหนังสือ "${bookTitle}" เนื่องจากเกินกำหนดส่งคืนเมื่อวันที่ ${new Date(dueDate).toLocaleDateString('th-TH')}`;

                // Check if we should notify
                const notifsForBook = existingNotifs?.filter(n => n.title === title) || [];

                const hasUnread = notifsForBook.some(n => n.is_read === false);
                const sentToday = notifsForBook.some(n => {
                    const createdDate = new Date(n.created_at).toISOString().split('T')[0];
                    return createdDate === todayStr;
                });

                if (!hasUnread && !sentToday) {
                    // We can notify
                    await createNotification(userId, title, message);

                    if (user.email) {
                        const html = getFineEmailHtml(
                            user.full_name || 'ผู้ใช้ห้องสมุด',
                            bookTitle,
                            dueDate,
                            amount
                        );
                        await sendFineEmail(
                            user.email,
                            `[RMUTI Library] แจ้งเตือนค่าปรับสำหรับหนังสือ "${bookTitle}"`,
                            html
                        );
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error in checkAndNotifyFine:', error);
    }
};
