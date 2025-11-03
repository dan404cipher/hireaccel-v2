# Clarity Dashboard Not Showing Data - Quick Troubleshooting

## Immediate Checks

### 1. Is Clarity Actually Tracking?

**In your browser console, run this:**
```javascript
// Check if Clarity is loaded
console.log('Clarity ID:', import.meta.env.VITE_CLARITY_ID);
console.log('Clarity object:', window.clarity);

// Check Network tab
// F12 → Network → Filter: "clarity" → Refresh page
// You should see requests to v.clarity.ms/collect
```

### 2. Verify Data Collection

**Steps to verify:**
1. Open your website
2. Open Developer Tools (F12)
3. Go to **Network** tab
4. Filter by typing: `clarity`
5. Refresh the page or navigate to another page
6. **You SHOULD see requests like:**
   - `https://v.clarity.ms/collect?[params]`
   - Status should be `200` or `204`

**If you DON'T see these requests:**
- Clarity is not initialized
- Check console for errors
- Verify your `.env` file has `VITE_CLARITY_ID`

### 3. Have You Actually Visited Your Site?

**Common mistake:** People set up Clarity but never actually visit their own website!

**You MUST:**
- Visit your website URL (localhost or production)
- Navigate through at least 2-3 pages
- Spend at least 30 seconds on each page
- Click some buttons/links
- Scroll around
- Do this 2-3 times (create multiple sessions)

### 4. Wait Time

**Important:** Clarity processes data in batches
- **First visit:** Wait 10-15 minutes
- **Subsequent visits:** Data appears faster (5-10 minutes)
- **Real-time is NOT available** - there's always a delay

## Diagnostic Checklist

Run through these in order:

- [ ] **Environment variable set?** Check `.env` file has `VITE_CLARITY_ID=your_id`
- [ ] **Dev server restarted?** After adding env var, you MUST restart
- [ ] **Console shows initialization?** Look for `✅ Microsoft Clarity initialized`
- [ ] **Network requests visible?** Check Network tab for `v.clarity.ms/collect`
- [ ] **Actually visited site?** Not just configured, but actually browsed your site
- [ ] **Waited long enough?** First data takes 10-15 minutes minimum
- [ ] **Correct project?** Make sure you're viewing the right project in Clarity dashboard
- [ ] **Correct account?** Logged into the Microsoft account that created the project

## Quick Test Procedure

1. **Open your website** (the actual URL, not just the dashboard)
2. **Open console** (F12)
3. **Look for:** `✅ Microsoft Clarity initialized`
4. **Open Network tab**, filter by "clarity"
5. **Refresh page** - you should see `v.clarity.ms/collect` requests
6. **Visit 3-4 different pages** on your site
7. **Wait 10 minutes**
8. **Check Clarity dashboard**

## Still Not Working?

### Check Project ID

1. Go to https://clarity.microsoft.com
2. Click your project
3. Go to **Settings** → **Overview**
4. Copy the **Project ID**
5. Compare with your `.env` file - must match EXACTLY
6. Restart dev server

### Check Console Errors

Look for:
- `❌ Microsoft Clarity initialization failed` = Package issue
- `⚠️ Microsoft Clarity not configured` = Env var missing
- CSP errors = Content Security Policy blocking (should be fixed now)

### Verify Package Installation

```bash
cd client
npm list @microsoft/clarity
```

Should show version like `@microsoft/clarity@1.0.0`

If not installed:
```bash
npm install @microsoft/clarity
```

### Test with Fresh Browser

1. Open **Incognito/Private** window
2. Visit your site
3. Check console for Clarity messages
4. This rules out browser cache issues

## Most Common Issues

### Issue: "Get Started" page still showing
**Cause:** No data collected yet
**Fix:** Actually visit your website multiple times, wait 10-15 minutes

### Issue: Network requests not appearing
**Cause:** Clarity not initialized
**Fix:** Check console for errors, verify env var, restart server

### Issue: Wrong project showing
**Cause:** Wrong Project ID in .env
**Fix:** Double-check Project ID matches exactly

### Issue: Data takes forever
**Cause:** First-time processing is slow
**Fix:** Wait longer (up to 15 minutes for first data), generate more sessions

## Expected Timeline

- **0-5 min:** Set up and configure ✅
- **5-10 min:** Visit site and generate data 📊
- **10-15 min:** First data appears in dashboard ⏱️
- **15+ min:** Full data and recordings available 🎉

## If Nothing Works

1. Double-check Project ID is correct
2. Verify package is installed: `npm list @microsoft/clarity`
3. Check browser console for any errors
4. Try a different browser
5. Clear browser cache completely
6. Check Network tab for blocked requests
7. Verify CSP allows Clarity domains (should be fixed)

Remember: **Clarity needs REAL website visits, not just configuration!**

