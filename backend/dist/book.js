"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
app.get('/api/books', async (req, res) => {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const categoryId = typeof req.query.categoryId === 'string' ? req.query.categoryId.trim() : '';
    let query = supabase
        .from('books')
        .select('id, title, author, isbn, category_id, total_copies, available_copies')
        .order('title', { ascending: true });
    if (q) {
        const pattern = `%${q}%`;
        query = query.or(`title.ilike.${pattern},author.ilike.${pattern}`);
    }
    if (categoryId) {
        query = query.eq('category_id', categoryId);
    }
});
