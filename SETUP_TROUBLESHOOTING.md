# Clinix AI Billing - Setup & Troubleshooting Guide

## Current Issues and Fixes

### 1. Supabase Database Setup

**Problem:** The app is trying to access `claims` and `claim_events` tables that don't exist in your Supabase project.

**Solution:**
1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Navigate to the SQL Editor
4. Copy and paste the contents of `supabase-schema.sql`
5. Click "Run" to create the tables

**What the schema creates:**
- `claims` table - stores all claim data
- `claim_events` table - stores claim status updates, transactions, etc.
- Row Level Security (RLS) policies - users can only see their own claims
- Indexes for better performance
- Automatic timestamp updates

### 2. Environment Variables

Make sure you have these environment variables set:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Where to find these:**
1. Go to Supabase Dashboard
2. Select your project
3. Click on "Settings" → "API"
4. Copy the "Project URL" and "anon public" key

### 3. GoTrueClient Multiple Instances Warning

**Problem:** "Multiple GoTrueClient instances detected" error in console.

**Cause:** The Supabase client is being recreated on every module import in development mode.

**Solution:** This is fixed in the current `supabaseClient.ts` - it creates a singleton instance. The warning is harmless but if it persists:

1. Clear your browser cache
2. Restart the Next.js dev server
3. Make sure you don't have multiple tabs with hot reload enabled

### 4. 404 Errors on Claim Details Page

**Problem:** GET requests to `/rest/v1/claim_events` return 404.

**Fix Applied:**
- Added proper error handling to all Supabase operations
- Database insert failures now log to console but don't crash the app
- The claim details page will still work even if the database operations fail

## Testing the Setup

### 1. Test Authentication
```bash
# Make sure you're logged in via Supabase Auth
# The app requires authentication to view claims
```

### 2. Create a Test Claim
1. Go to `/claims/new`
2. The form is pre-filled with test data
3. Click through all 6 steps
4. Click "Create Claim" on step 6
5. You should be redirected to the success page
6. Go to `/dashboard` to see your claim

### 3. Verify Database
After creating a claim, check your Supabase dashboard:
1. Go to "Table Editor"
2. Select "claims" table
3. You should see your newly created claim
4. Check "claim_events" table for any status updates

## API Integration Status

### ✅ Fully Connected
- **Dashboard** - Real data from Supabase
- **Claims/New** - Submits to Stedi API + saves to Supabase
- **Claim Details** - Fetches from Supabase, interacts with Stedi API

### ⚠️ Simulated Data
- **Dashboard "View Codes"** - Status codes are simulated based on claim status
- **Upload Page** - CSV parsing is simulated (not yet implemented)

### 🔧 Needs Implementation
- **Upload CSV** - Real CSV parsing and bulk claim creation
- **Claim Success Page** - Pass actual claim ID from creation

## Common Errors

### "Could not find the table 'public.claim_events' in the schema cache"
**Fix:** Run the `supabase-schema.sql` script in your Supabase SQL Editor.

### "Row Level Security (RLS) policy violation"
**Fix:** Make sure you're authenticated. The RLS policies only allow users to see their own claims.

### "Minified React error #310"
**Fix:** This was a hooks violation - FIXED in latest code. Make sure all `useState` calls are at the top of components.

## Deployment Checklist

Before deploying to Cloud Run or Vercel:

1. ✅ Run `supabase-schema.sql` in production Supabase project
2. ✅ Set environment variables in deployment platform
3. ✅ Test authentication flow
4. ✅ Create at least one test claim to verify database connection
5. ✅ Check that claim status polling works

## Need Help?

### Check these first:
1. Browser console for errors
2. Supabase logs (Dashboard → Logs)
3. Next.js dev server output
4. Network tab in Chrome DevTools

### Debug Mode:
Add this to see detailed Supabase errors:
```typescript
// In supabaseClient.ts
const supabaseClient = createClient(supabaseUrl, supabaseKey, {
  auth: {
    debug: true,
  },
});
```


