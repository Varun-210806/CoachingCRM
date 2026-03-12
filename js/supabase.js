import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://oaejfnsqloujtikxbpqm.supabase.co";
const SUPABASE_KEY = "sb_publishable_x1_VYFc15tyiwXNwytusIA_NQ9aYC2X";

window.supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
