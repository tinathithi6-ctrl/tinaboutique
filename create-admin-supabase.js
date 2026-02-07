
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env file
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
    console.log('🔄 Creating Admin Account...');
    try {
        const hashedPassword = await bcrypt.hash('admin123', 10);

        // Check if user exists first to update or insert
        const { data: existing } = await supabase.from('users').select('id').eq('email', 'admin@tinaboutique.com').single();

        let result;
        if (existing) {
            console.log('User exists, updating...');
            result = await supabase.from('users').update({
                password_hash: hashedPassword,
                role: 'admin',
                full_name: 'Admin Principal'
            }).eq('email', 'admin@tinaboutique.com');
        } else {
            console.log('User does not exist, inserting...');
            result = await supabase.from('users').insert({
                email: 'admin@tinaboutique.com',
                password_hash: hashedPassword,
                role: 'admin',
                full_name: 'Admin Principal'
            });
        }

        if (result.error) {
            throw result.error;
        }

        console.log('✅ Admin Account Ready');
        console.log('Email: admin@tinaboutique.com');
        console.log('Password: admin123');

    } catch (err) {
        console.error('❌ Error:', err);
    }
}

createAdmin();
