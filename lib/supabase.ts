
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://crkavupscjmmavepzpam.supabase.co';
// Nota: Em produção, utilize variáveis de ambiente (import.meta.env.VITE_SUPABASE_KEY)
const SUPABASE_KEY = 'sb_publishable_9CZIF4n-4PlsUCSQdoN2XA_E7Hadu3T'; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
