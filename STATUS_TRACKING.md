# Claim Status Tracking System

## Overview

The Clinix platform now has a comprehensive status tracking system that automatically updates claim statuses based on API responses from Stedi.

## Status Values

The system uses these standardized status values:

| Status | Display Label | Color | Meaning |
|--------|--------------|-------|---------|
| `accepted` | Accepted | 🟢 Green | Claim accepted by payer |
| `paid` | Accepted | 🟢 Green | Claim paid by payer |
| `posted` | Accepted | 🟢 Green | Payment posted |
| `success` | Accepted | 🟢 Green | Successfully processed |
| `submitted` | Submitted | 🔵 Blue | Sent to payer, awaiting response |
| `sent` | Submitted | 🔵 Blue | Sent to clearinghouse |
| `denied` | Denied | 🔴 Red | Rejected by payer |
| `rejected` | Denied | 🔴 Red | Rejected at clearinghouse |
| `pending` | Needs Review | 🟡 Yellow | Pending additional info |
| `needs review` | Needs Review | 🟡 Yellow | Requires manual review |
| `review` | Needs Review | 🟡 Yellow | Under review |
| `null` or other | Draft | ⚪ Gray | Not yet submitted or unknown |

## How Status Updates Work

### 1. Initial Claim Creation (`/claims/new`)

When a new claim is created:
```typescript
const res = await submitClaim(payload);
const rawStatus = res.data?.status?.toLowerCase();
const normalizedStatus = rawStatus === "success" ? "accepted" : rawStatus || "submitted";

await supabase.from("claims").insert({
  ...claimData,
  status: normalizedStatus  // "accepted" or "submitted"
});
```

**Default**: New claims start as `"submitted"` unless Stedi returns `"success"`, which becomes `"accepted"`.

### 2. Status Check (`/claims/[id]` → Check Status Button)

When you click "Check Status":
```typescript
const res = await claimStatus(payload);  // Stedi 277 request

// Map 277 status codes to our statuses
const statusCode = res.data?.statusInformation?.[0]?.claimStatusCategoryCode;
if (["1", "2", "20", "22"].includes(statusCode)) {
  newStatus = "accepted";  // Finalized/forwarded
} else if (["4", "27"].includes(statusCode)) {
  newStatus = "denied";  // Denied/rejected
} else if (["3", "15", "16"].includes(statusCode)) {
  newStatus = "pending";  // Pending/needs info
}

await supabase.from("claims").update({ status: newStatus }).eq("id", claimId);
```

**Common 277 Status Codes**:
- `1` = Acknowledged
- `2` = Forwarded
- `3` = Pending
- `4` = Denied
- `20` = Finalized
- `22` = Returned/Processed
- `27` = Rejected

### 3. Transaction Polling (`/claims/[id]` → Get 277/835 Button)

When you fetch transaction output (835 remittance):
```typescript
const res = await getTransactionOutput(txnId);  // Get 835 data

const claimInfo = res.data?.claimPaymentInformation?.[0];
const paidAmount = parseFloat(claimInfo?.claimPaymentAmount || "0");
const billedAmount = parseFloat(claimInfo?.chargeAmount || "0");

if (paidAmount > 0) {
  newStatus = "paid";  // Payment received!
} else if (paidAmount === 0 && billedAmount > 0) {
  newStatus = "denied";  // Billed but not paid
} else {
  newStatus = "accepted";  // Response received
}

await supabase.from("claims").update({ status: newStatus }).eq("id", claimId);
```

**835 Analysis**:
- If `claimPaymentAmount > 0` → `"paid"`
- If `claimPaymentAmount = 0` and `chargeAmount > 0` → `"denied"`
- Otherwise → `"accepted"`

## Status Flow Diagram

```
NEW CLAIM
   ↓
"submitted" (blue)
   ↓
[CHECK STATUS - 277]
   ↓
┌─────────────┬─────────────┬─────────────┐
│             │             │             │
"accepted"    "denied"      "pending"     
(green)       (red)         (yellow)      
   ↓             ↓             ↓
[POLL TRANSACTIONS - 835]
   ↓             ↓             ↓
"paid"         "denied"      "accepted"
(green)        (red)         (green)
```

## Dashboard Display

The dashboard's `deriveStatusMeta()` function maps database statuses to display labels:

```typescript
function deriveStatusMeta(status?: string | null) {
  const key = (status || "submitted").toLowerCase();
  
  if (["accepted", "paid", "posted", "success"].includes(key)) {
    return { label: "Accepted", tone: "success" };  // Green
  }
  if (["submitted", "sent"].includes(key)) {
    return { label: "Submitted", tone: "primary" };  // Blue
  }
  if (["denied", "rejected"].includes(key)) {
    return { label: "Denied", tone: "danger" };  // Red
  }
  if (["needs review", "review", "pending"].includes(key)) {
    return { label: "Needs Review", tone: "warning" };  // Yellow
  }
  return { label: "Draft", tone: "muted" };  // Gray
}
```

## Fixing Old Claims

If you have claims stuck on "Draft", they likely have `null` or empty status values.

### Option 1: Use Admin Tool

Visit `/admin/fix-statuses` to:
1. View all claim statuses
2. See which ones are null/empty
3. Fix them all at once (sets to "submitted")

### Option 2: Manual SQL

```sql
-- View claims with missing status
SELECT id, patient_name, status, created_at
FROM claims
WHERE status IS NULL OR status = '';

-- Fix them all at once
UPDATE claims
SET status = 'submitted'
WHERE status IS NULL OR status = '';
```

### Option 3: Re-check Individual Claims

1. Go to claim details page
2. Click "Check Status" to query Stedi
3. Status auto-updates based on 277 response

## Testing Status Updates

### Test Case 1: New Claim
1. Create a new claim at `/claims/new`
2. Submit to Stedi
3. **Expected**: Status should be "submitted" (blue) or "accepted" (green)

### Test Case 2: Status Check
1. Go to claim details `/claims/[id]`
2. Click "Check Status"
3. **Expected**: Status updates based on 277 response
4. **Check**: Dashboard should reflect new status immediately

### Test Case 3: Payment Received
1. Go to claim details
2. Click "Poll Transactions"
3. Click "Get 277/835"
4. **Expected**: If 835 shows payment, status → "paid" (green)
5. **Check**: ERA PDF viewer appears

## Common Issues & Solutions

### Issue: All claims show "Draft"
**Cause**: Status field is null or empty in database
**Solution**: 
1. Visit `/admin/fix-statuses`
2. Click "Fix Missing Statuses"
3. Refresh dashboard

### Issue: Status doesn't update after API call
**Cause**: Supabase update might have failed silently
**Solution**:
1. Check browser console for errors
2. Verify Supabase connection
3. Try re-clicking the status check button

### Issue: Status shows wrong color
**Cause**: Status value doesn't match expected format
**Solution**:
1. View status summary at `/admin/fix-statuses`
2. Check if status has unexpected value (e.g., "SUBMITTED" uppercase)
3. Status matching is case-insensitive, but should be lowercase in DB

### Issue: 277/835 response doesn't change status
**Cause**: Response format might be different than expected
**Solution**:
1. Check browser console for API response
2. Look at `res.data` structure
3. File GitHub issue with response format

## Status Audit Trail

All status changes are logged to `claim_events` table:

```typescript
await supabase.from("claim_events").insert({
  claim_id: id,
  type: "status",  // or "transaction_output"
  payload: res.data,  // Full API response
  transaction_id: txnId  // If from 835
});
```

View events:
```sql
SELECT type, payload, created_at
FROM claim_events
WHERE claim_id = 'your-claim-id'
ORDER BY created_at DESC;
```

## Future Enhancements

### Planned Features
- [ ] Auto-refresh status on dashboard (every 5 min)
- [ ] Batch status checking (check all "submitted" claims at once)
- [ ] Status change notifications
- [ ] Status history timeline in UI
- [ ] Predictive status (AI estimates when status will change)
- [ ] Webhook listeners for real-time status updates from Stedi

### Status Analytics
- [ ] Average time to acceptance by payer
- [ ] Denial rate by status code
- [ ] Payment velocity (submitted → paid time)
- [ ] Status distribution charts

---

## Quick Reference

| Action | API | Status Update |
|--------|-----|---------------|
| Create Claim | POST /submission | `"submitted"` or `"accepted"` |
| Check Status | POST /claimstatus (277) | Based on status code |
| Get Remittance | GET /transactions/:id (835) | `"paid"` or `"denied"` |
| Manual Fix | `/admin/fix-statuses` | `"submitted"` (default) |

**Always check the claim details page after API calls to verify status updated correctly!**


