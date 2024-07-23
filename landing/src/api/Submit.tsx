import { createClient } from "@supabase/supabase-js";

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_KEY);
const tableName = import.meta.env.VITE_SUPABASE_TABLE_NAME;

export const submitData = async (email: string) => {
	await supabase.from(tableName).insert({ email });
};
