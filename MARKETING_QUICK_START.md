# 🚀 Quick Start Guide for Marketing Team

## What We Built

We added Google Tag Manager tracking to **every form, input, and button** in both signup flows:

-   ✅ **Candidate Signup** (Job Seekers)
-   ✅ **HR Signup** (Employers)

## How It Works

### Simple Concept

Every element has special `data-gtm-*` tags that GTM can read:

```html
<button data-gtm-cta="candidate_signup_button">Sign Up</button>
```

Your GTM dashboard can detect this button and track when it's clicked!

## The Two Flows

### 📱 Candidate (Job Seeker) Signup

1. **Hero or Signup Page** → Name + Phone → Click "Sign Up" or "Continue"
2. **OTP Page** → Enter 6-digit code → Click "Verify Mobile"
3. **Email Page** → Enter email + password → Click "Create Account"

### 💼 HR (Employer) Signup

1. **Signup Page** → Name + Phone → Click "Continue as an Employer"
2. **OTP Page** → Enter 6-digit code → Click "Verify Mobile"
3. **Email Page** → Enter email + password → Click "Create Account"

## Files You Need

1. **GTM_TRACKING_SPREADSHEET.csv**

    - Open in Excel/Google Sheets
    - Every tracking ID is listed
    - Tells you exactly what to track

2. **GTM_TRACKING_GUIDE.md**
    - Complete technical documentation
    - Examples of how to configure GTM
    - Testing instructions

## 5-Minute Setup in GTM

### Step 1: Create a Button Click Trigger

1. Go to **Triggers** → **New**
2. Choose **Click - All Elements**
3. Add condition: **Click Element** matches CSS selector `[data-gtm-cta]`
4. Save as "All CTA Button Clicks"

### Step 2: Create Variables to Capture Data

1. Go to **Variables** → **User-Defined Variables** → **New**
2. Choose **Custom JavaScript**
3. Add this code:
    ```javascript
    function() {
      return {{Click Element}}.getAttribute('data-gtm-cta');
    }
    ```
4. Save as "CTA ID"
5. Repeat for `data-gtm-cta-text`, `data-gtm-cta-funnel`, `data-gtm-cta-step`

### Step 3: Create a Tag

1. Go to **Tags** → **New**
2. Choose **Google Analytics: GA4 Event**
3. Event Name: `signup_button_click`
4. Add Event Parameters:
    - `button_id` = `{{CTA ID}}`
    - `button_text` = `{{CTA Text}}`
    - `funnel` = `{{CTA Funnel}}`
    - `step` = `{{CTA Step}}`
5. Trigger: Use "All CTA Button Clicks" from Step 1
6. Save and **Submit** (publish your changes)

## What You Can Track

### Primary Goals

-   **Signups Started**: Track when forms appear
-   **Signups Completed**: Track final "Create Account" button
-   **Drop-off Points**: See where users abandon the process

### Secondary Metrics

-   **OTP Resend Rate**: Are codes not arriving?
-   **Hero vs Page**: Which entry point converts better?
-   **Mobile vs Desktop**: Device performance
-   **Time to Complete**: How long does signup take?

## Testing Your Setup

### In GTM Preview Mode:

1. Click **Preview** in GTM
2. Visit your signup pages
3. Go through the signup flow
4. Check that events fire in the Tag Assistant panel

### What Should Fire:

-   **Candidate Hero**: Click "Sign Up" → Event fires with `candidate_hero_signup_button`
-   **OTP Page**: Click "Verify Mobile" → Event fires with `candidate_otp_verify_button`
-   **Final Step**: Click "Create Account" → Event fires with `candidate_create_account_button`

## Quick Reference: Most Important IDs

### Track These for Conversion Goals:

| What                       | Tracking ID                                         | When to Fire         |
| -------------------------- | --------------------------------------------------- | -------------------- |
| Candidate started signup   | `candidate_hero_signup` OR `candidate_signup_step1` | Form becomes visible |
| Candidate completed signup | `candidate_create_account_button`                   | Button clicked       |
| HR started signup          | `hr_signup_step1`                                   | Form becomes visible |
| HR completed signup        | `hr_create_account_button`                          | Button clicked       |

## Common GTM Trigger Examples

### Track Form Visibility (Step 1 Started)

```
Trigger: Element Visibility
Selector: [data-gtm-form="candidate_signup_step1"]
Minimum Visible: 50%
```

### Track All Candidate Buttons

```
Trigger: Click - All Elements
Condition: Click Element matches CSS selector
Value: [data-gtm-cta-funnel="candidate_signup"]
```

### Track Step 2 Completion (OTP Verified)

```
Trigger: Click - All Elements
Condition: Click Element matches CSS selector
Value: [data-gtm-cta="candidate_otp_verify_button"]
```

## Need Help?

### Check These:

1. **GTM_TRACKING_SPREADSHEET.csv** - All IDs listed
2. **GTM_TRACKING_GUIDE.md** - Detailed examples
3. [Google's GTM Documentation](https://support.google.com/tagmanager)

### Common Issues:

-   **Events not firing?** Make sure you published your GTM container
-   **Can't find elements?** Check CSS selectors match exactly (use brackets and quotes)
-   **Data missing?** Variables must extract attributes correctly

## Pro Tips

1. **Start Simple**: Track just button clicks first, then add form visibility
2. **Use Preview Mode**: Always test before publishing
3. **Name Things Clearly**: Use descriptive names in GTM (not just "Tag 1")
4. **Create Folders**: Organize your tags by funnel (Candidate vs HR)
5. **Document Changes**: Note what you configure for future reference

---

**Ready to Go!** 🎉

Everything is implemented and waiting for your GTM configuration. Open the spreadsheet, follow the examples, and you'll have full tracking in minutes!
