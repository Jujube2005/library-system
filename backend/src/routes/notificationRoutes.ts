import { Router, Response } from 'express';
import { protect } from '../middleware/auth-middleware';
import { supabaseAdmin } from '../config/supabase-admin';

const router = Router();

router.get(
    '/',
    protect,
    async (req: any, res: Response) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ error: 'UNAUTHENTICATED' });
                return;
            }

            const { data, error } = await supabaseAdmin
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) {
                throw new Error(error.message);
            }

            res.json({ data });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
);

router.get(
    '/unread-count',
    protect,
    async (req: any, res: Response) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ error: 'UNAUTHENTICATED' });
                return;
            }

            const { count, error } = await supabaseAdmin
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('is_read', false);

            if (error) {
                throw new Error(error.message);
            }

            res.json({ data: count || 0 });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
);

router.patch(
    '/:id/read',
    protect,
    async (req: any, res: Response) => {
        try {
            const userId = req.user?.id;
            const { id } = req.params;

            if (!userId || !id) {
                res.status(400).json({ error: 'INVALID_REQUEST' });
                return;
            }

            const { data, error } = await supabaseAdmin
                .from('notifications')
                .update({ is_read: true })
                .eq('id', id)
                .eq('user_id', userId)
                .select()
                .single();

            if (error) {
                throw new Error(error.message);
            }

            res.json({ data });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
);

export default router;
