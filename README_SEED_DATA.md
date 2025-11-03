# Seed Data Instructions

## Overview
The `supabase/seed.sql` file contains sample data to populate your database with 5 people profiles, including their experience, education, and social profiles. This allows you to test the search functionality immediately.

## What's Included

### People Profiles (5 total):
1. **Sarah Johnson** - Senior Software Engineer at Google
2. **Michael Chen** - Product Manager at Microsoft
3. **Emily Rodriguez** - UX Designer at Apple
4. **David Kim** - Data Scientist at Netflix
5. **Lisa Wang** - DevOps Engineer at Tesla

Each person includes:
- ✅ Personal information (name, email, phone, location, bio)
- ✅ Work experience (current and past positions)
- ✅ Education history
- ✅ Social media profiles (LinkedIn, GitHub, etc.)
- ✅ Skills arrays

## How to Run Seed Data

### Step 1: Ensure Schema is Already Run
Make sure you've already run `supabase/schema.sql` in your Supabase SQL Editor. The seed script will fail if tables don't exist.

### Step 2: Run the Seed Script
1. Open **Supabase Dashboard** → **SQL Editor**
2. Click **"New Query"**
3. Open the file `supabase/seed.sql` from your project
4. Copy the **entire contents** of the file
5. Paste into the SQL Editor
6. Click **"Run"** (or press Ctrl+Enter / Cmd+Enter)

### Step 3: Verify Data Was Inserted
After running the seed script, verify the data:

1. Go to **Table Editor** → **people**
   - You should see 5 people records

2. Check related tables:
   - **experience** - Should have 10 experience records
   - **education** - Should have 8 education records
   - **social_profiles** - Should have 8 social profile records

3. Test in your app:
   - Login to your app
   - Go to Search page
   - Try searching for:
     - "Software Engineer" → Should find Sarah Johnson
     - "Product Manager" → Should find Michael Chen
     - "Google" → Should find Sarah Johnson
     - "Microsoft" → Should find Michael Chen
     - "React" (in skills) → Should find Sarah Johnson

## Optional: Clear Existing Data

If you want to re-run the seed script and start fresh, you can uncomment the TRUNCATE statements at the top of `seed.sql`:

```sql
-- Uncomment these lines to clear existing data first
TRUNCATE TABLE public.social_profiles CASCADE;
TRUNCATE TABLE public.education CASCADE;
TRUNCATE TABLE public.experience CASCADE;
TRUNCATE TABLE public.people CASCADE;
```

**⚠️ Warning**: This will delete ALL existing people data, not just seed data.

## Adding More Seed Data

You can add more people by following the pattern in `seed.sql`:

1. Generate a new UUID for the person ID
2. Insert into `people` table
3. Insert related `experience` records
4. Insert related `education` records
5. Insert related `social_profiles` records

## Troubleshooting

### Error: "relation does not exist"
- Make sure you ran `schema.sql` first
- Check that all tables were created successfully

### Error: "duplicate key value"
- Data already exists - either clear it first or skip re-running the seed script

### Error: "violates foreign key constraint"
- Make sure you insert people first, then their related data (experience, education, social_profiles)
- Check that person_id references match the people table IDs

### Data not appearing in app
- Check RLS policies are not blocking reads
- Verify you're logged in (required for authenticated queries)
- Check browser console for errors

## Next Steps

After seeding:
1. ✅ Test search functionality with various filters
2. ✅ Test dashboard analytics (will show real data after searches)
3. ✅ Test search history (saves searches automatically)
4. ✅ Add more sample data if needed for testing

---

**Happy Testing!** 🚀

