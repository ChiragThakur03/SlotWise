/**
 * Creates required Supabase Storage buckets.
 * Usage: node --env-file=.env.local scripts/create-storage-buckets.mjs
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function ensureBucket(name, isPublic = false) {
  const { data: existing } = await admin.storage.getBucket(name);
  if (existing) {
    console.log(`  ✓ Bucket "${name}" already exists`);
    return;
  }
  const { error } = await admin.storage.createBucket(name, { public: isPublic });
  if (error) {
    console.error(`  ✗ Failed to create "${name}":`, error.message);
  } else {
    console.log(`  ✓ Created bucket "${name}" (public: ${isPublic})`);
  }
}

async function run() {
  console.log("🪣  Setting up Supabase Storage buckets…\n");
  await ensureBucket("intake-uploads", true);
  console.log("\nDone.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
