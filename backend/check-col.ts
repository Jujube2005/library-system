import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseAdmin = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkColumn() {
    const { data, error } = await supabaseAdmin
        .from('books')
        .select('cover_image_url')
        .limit(1);

    if (error) {
        console.error('Column error:', error.message);
    } else {
        console.log('Column exists. Data sample:', data);
    }
}

checkColumn();
