# WoW Forever Horde Picker

Public Vercel site + Supabase database + Discord OAuth.

## Setup
1. Import this repository into Vercel.
2. Create a Supabase project.
3. Run `supabase-schema.sql` in Supabase SQL Editor.
4. Enable Discord provider in Supabase Auth and enter Discord Client ID + Client Secret.
5. Set Vercel env vars:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
6. In Discord Developer Portal set the OAuth redirect URL shown by Supabase.
7. Redeploy Vercel.

Never put the Discord Client Secret in frontend code or GitHub.
