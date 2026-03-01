import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseAdmin = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function createBucket() {
    console.log('Creating bucket book-covers...');
    const { data, error } = await supabaseAdmin.storage.createBucket('book-covers', {
        public: true,
        fileSizeLimit: 5242880, // 5MB limit
    });

    if (error) {
        if (error.message.includes('already exists')) {
            console.log('Bucket book-covers already exists.');
        } else {
            console.error('Error creating bucket:', error);
        }
    } else {
        console.log('Successfully created bucket:', data);
    }
}

createBucket();
