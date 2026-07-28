import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const readSupabaseConfig = () => {
  const configPath = path.join(process.cwd(), 'src', 'Backend', 'supabase.txt');
  if (!fs.existsSync(configPath)) return {};

  const content = fs.readFileSync(configPath, 'utf8');
  return {
    url: content.match(/URL du projet:\s*(.+)/i)?.[1]?.trim(),
    publishableKey: content.match(/cl.*publiable:\s*(.+)/i)?.[1]?.trim(),
    bucket: content.match(/Bucket:\s*(.+)/i)?.[1]?.trim(),
  };
};

const config = readSupabaseConfig();

export const supabaseUrl = process.env.SUPABASE_URL || config.url;
export const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || config.publishableKey;
export const supabaseBucket = process.env.SUPABASE_BUCKET || config.bucket || 'Fichiers';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL/key are missing. Set SUPABASE_URL and SUPABASE_KEY or fill src/Backend/supabase.txt.');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
