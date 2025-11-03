# Microsoft Clarity Setup Guide

## Quick Answer
**Clarity does NOT work with Google Tag Manager** - you need to install it directly via the NPM package (which we've already done).

## Why Your Dashboard Shows "Get Started"

If you're still on the "Get Started" page in Clarity, it means:
- ✅ Clarity is set up correctly
- ❌ No session data has been collected yet

**Clarity needs REAL website visits to collect data** - it doesn't populate automatically.

## Step-by-Step Instructions

### 1. Verify Clarity is Initialized

1. Open your website in a browser
2. Press `F12` to open Developer Tools
3. Go to the **Console** tab
4. Look for this message:
   ```
   ✅ Microsoft Clarity initialized with project ID: [your-id]
   ```
5. If you see this, Clarity is working! ✅

### 2. Generate Session Data

**This is the important part!** You need to actually use your website:

1. Navigate to your website (e.g., `http://localhost:5173` or your production URL)
2. Visit multiple pages:
   - Homepage
   - Login page
   - Dashboard (if logged in)
   - Any other pages
3. Interact with the site:
   - Click buttons
   - Fill out forms
   - Scroll up and down
   - Hover over elements
4. **Stay on each page for at least 30 seconds**
5. Generate at least 2-3 sessions (visit the site multiple times)

### 3. Wait for Processing

- After your first visit: **Wait 5-10 minutes**
- Clarity processes data in batches, not real-time
- Data appears faster after you have multiple sessions

### 4. Check Your Dashboard

1. Go to https://clarity.microsoft.com/dashboard
2. Select your project from the list
3. You should now see:
   - Session recordings
   - Heatmaps
   - Click tracking
   - User insights

## Verification Checklist

Run this in your browser console to verify everything:

```javascript
// Check 1: Clarity ID is set
console.log('Clarity ID:', import.meta.env.VITE_CLARITY_ID);

// Check 2: Clarity object exists
console.log('Clarity object:', window.clarity);

// Check 3: Network requests (should see requests to v.clarity.ms)
// Open Network tab, filter by "clarity", refresh page
```

## Common Issues

### Issue: "Get Started" page still showing
**Solution**: You haven't generated enough session data yet. Follow Step 2 above.

### Issue: No console log about Clarity initialization
**Solutions**:
- Check your `.env` file has `VITE_CLARITY_ID=your_id`
- Restart your dev server after adding the env var
- Clear browser cache and hard refresh

### Issue: Clarity object not found
**Solutions**:
- Make sure `@microsoft/clarity` is installed: `npm install @microsoft/clarity`
- Check browser console for initialization errors
- Verify your Project ID is correct in Clarity dashboard

### Issue: Data taking too long
**Solution**: This is normal! Clarity processes data in batches. After your first few visits, data should appear within 10 minutes. Subsequent visits appear faster.

## Important Notes

1. **Clarity is FREE** - No need for Google Tag Manager or other tools
2. **Data collection requires real visits** - Visiting the site once may not be enough
3. **Processing delay is normal** - First data appears 5-10 minutes after visits
4. **Use the NPM package** - We've already set this up, no GTM needed
5. **Check the correct account** - Make sure you're logged into the Microsoft account that created the Clarity project

## Quick Test

To quickly test if Clarity is working:

1. Open your website
2. Open console (F12)
3. Look for: `✅ Microsoft Clarity initialized`
4. Visit 2-3 pages on your site
5. Wait 10 minutes
6. Check Clarity dashboard

If after 10 minutes you still see nothing, check:
- Are you visiting the correct URL?
- Is the Project ID correct?
- Are there any console errors?
- Did you wait long enough?

## Still Having Issues?

1. Double-check your Project ID in Clarity dashboard (Settings → Overview)
2. Verify it matches your `.env` file exactly
3. Restart your dev server completely
4. Clear browser cache and try incognito mode
5. Check browser console for any errors

