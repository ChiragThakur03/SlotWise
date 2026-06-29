/**
 * Adds RLS policy to allow anonymous uploads to intake-uploads bucket.
 * Usage: node --env-file=.env.local scripts/add-storage-policy.mjs
 */

const projectRef = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.split(".")[0];
const token = process.env.SUPABASE_ACCESS_TOKEN;

if (!token) {
  console.error("Missing SUPABASE_ACCESS_TOKEN in .env.local");
  process.exit(1);
}

const sql = `
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'anon can upload to intake-uploads'
  ) THEN
    CREATE POLICY "anon can upload to intake-uploads"
      ON storage.objects
      FOR INSERT TO anon
      WITH CHECK (bucket_id = 'intake-uploads');
    RAISE NOTICE 'Policy created';
  ELSE
    RAISE NOTICE 'Policy already exists';
  END IF;
END $$;
`;

const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ query: sql }),
});

const text = await res.text();
console.log(`Status: ${res.status}`);
console.log(text);

if (res.ok) {
  console.log("✓ Storage policy applied");
} else {
  console.error("✗ Failed to apply policy");
  process.exit(1);
}
