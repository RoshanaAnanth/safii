import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env file."
  );
}

// Create Supabase client with service role key for backend operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default supabase;
