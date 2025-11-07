# GTM Tracking Implementation Status

## ✅ Completed Implementation

### Overview

Complete CTA & UTM tracking has been implemented across all signup pages, landing pages, and navigation elements for both **Candidate** and **HR** flows.

---

## 📊 Pages with Full Tracking

### 1. `/register/candidate` - Candidate Signup Page

**Status:** ✅ Complete

#### Navigation Elements

-   ✅ Logo click to home (Desktop & Mobile) - `data-gtm-nav="candidate_signup_logo_home"`
-   ✅ Sign in link - `data-gtm-nav="candidate_signup_signin_link"`

#### Form Elements

-   ✅ Form container - `data-gtm-form="candidate_signup_step1"`
-   ✅ Full name input - `data-gtm-element="candidate_signup_name_input"`
-   ✅ Phone number input (intl-tel-input) - `data-gtm-element="candidate_signup_phone_input"`
-   ✅ Email input - `data-gtm-element="candidate_signup_email_input"`
-   ✅ Password input - `data-gtm-element="candidate_signup_password_input"`
-   ✅ Confirm password input - `data-gtm-element="candidate_signup_confirm_password_input"`
-   ✅ Source dropdown - `data-gtm-element="candidate_signup_source_select"`

#### CTA Button

-   ✅ Submit button - `data-gtm-cta="candidate_unified_signup_button"`
    -   Text: "Create Job Seeker Account →"
    -   Funnel: `candidate_signup`
    -   Step: `1`
    -   Position: `signup_page`

---

### 2. `/register/hr` - HR Signup Page

**Status:** ✅ Complete

#### Navigation Elements

-   ✅ Logo click to home (Desktop & Mobile) - `data-gtm-nav="hr_signup_logo_home"`
-   ✅ Sign in link - `data-gtm-nav="hr_signup_signin_link"`

#### Form Elements

-   ✅ Form container - `data-gtm-form="hr_signup_step1"`
-   ✅ Full name input - `data-gtm-element="hr_signup_name_input"`
-   ✅ Phone number input (intl-tel-input) - `data-gtm-element="hr_signup_phone_input"`
-   ✅ Email input - `data-gtm-element="hr_signup_email_input"`
-   ✅ Designation input (optional) - `data-gtm-element="hr_signup_designation_input"`
-   ✅ Password input - `data-gtm-element="hr_signup_password_input"`
-   ✅ Confirm password input - `data-gtm-element="hr_signup_confirm_password_input"`
-   ✅ Source dropdown - `data-gtm-element="hr_signup_source_select"`

#### CTA Button

-   ✅ Submit button - `data-gtm-cta="hr_unified_signup_button"`
    -   Text: "Create Employer Account →"
    -   Funnel: `hr_signup`
    -   Step: `1`
    -   Position: `signup_page`

---

### 3. `/candidate` - Candidate Landing Page

**Status:** ✅ Complete

#### Hero Section CTAs

-   ✅ "Get matched in 2 minutes" button - `data-gtm-cta="candidate_hero_get_matched_cv_button"`
-   ✅ "Just upload CV" button - `data-gtm-cta="candidate_hero_upload_cv_button"`

#### Final CTA

-   ✅ "Upload Your CV Now" button - `data-gtm-cta="candidate_final_cta_button"`

---

### 4. `/hr` - HR Landing Page

**Status:** ✅ Complete

#### Hero Section CTA

-   ✅ "Post unlimited jobs for FREE" button - `data-gtm-cta="hr_hero_cta_button"`

#### How It Works Section CTA

-   ✅ "Start Your First Job Post" button - `data-gtm-cta="hr_how_it_works_cta_button"`

#### Final CTA

-   ✅ "Get Started Free - Save ₹3,60,000+" button - `data-gtm-cta="hr_final_cta_button"`

---

## 🎯 Tracking Attributes Structure

### CTA Buttons

```html
<button
    data-gtm-cta="unique_button_id"
    data-gtm-cta-text="Button Text"
    data-gtm-cta-position="hero|signup_page|final_cta"
    data-gtm-cta-destination="/register/candidate"
    data-gtm-cta-funnel="candidate_signup|hr_signup"
    data-gtm-cta-step="1"
    data-gtm-page="candidate_landing|hr_landing"
></button>
```

### Navigation Elements

```html
<button
    data-gtm-nav="unique_nav_id"
    data-gtm-location="signup_page_desktop|signup_page_mobile|header_desktop"
    data-gtm-destination="/login"
></button>
```

### Form Elements

```html
<form data-gtm-form="form_id" data-gtm-cta-funnel="funnel_name" data-gtm-cta-step="1">
    <input data-gtm-element="element_id" />
</form>
```

---

## 📈 UTM Tracking Integration

### Automatic UTM Capture

All signup forms automatically capture UTM parameters using the `getUTMParams()` utility:

-   ✅ `utm_source`
-   ✅ `utm_medium`
-   ✅ `utm_campaign`
-   ✅ `utm_content`
-   ✅ `utm_term`

### UTM to Source Mapping

The `mapUTMToSource()` function automatically maps UTM parameters to the appropriate source field.

---

## 📋 Marketing Spreadsheet

**File:** `GTM_TRACKING_SPREADSHEET.csv`

### Updated Sections:

1. ✅ **Navigation** - Global header tracking (desktop & mobile)
2. ✅ **Home Page** - All CTA buttons
3. ✅ **Candidate Flow** - Landing page + Unified signup form
4. ✅ **HR Flow** - Landing page + Unified signup form

### Spreadsheet Columns:

-   Flow
-   Step
-   Page
-   Element Type
-   Tracking ID
-   Description
-   Additional Tracking Attributes
-   GTM Trigger Suggestion

---

## 🔍 How to Use in Google Tag Manager

### Step 1: Create Triggers

Use the "GTM Trigger Suggestion" column from the spreadsheet to create click triggers:

**Example for Candidate Signup Button:**

```
Trigger Type: Click - All Elements
Trigger Fires On: Some Clicks
Conditions: Click Element matches CSS selector [data-gtm-cta="candidate_unified_signup_button"]
```

### Step 2: Create Tags

Create tags that fire on these triggers to send data to Google Analytics 4:

**Example Tag Configuration:**

```
Tag Type: Google Analytics: GA4 Event
Event Name: signup_button_click
Event Parameters:
  - cta_id: {{Click Element}}.getAttribute('data-gtm-cta')
  - cta_text: {{Click Element}}.getAttribute('data-gtm-cta-text')
  - cta_position: {{Click Element}}.getAttribute('data-gtm-cta-position')
  - funnel: {{Click Element}}.getAttribute('data-gtm-cta-funnel')
  - step: {{Click Element}}.getAttribute('data-gtm-cta-step')
  - page: {{Page Path}}
```

### Step 3: Create Variables (Optional)

Create custom JavaScript variables to extract tracking attributes:

**Example Variable:**

```javascript
function() {
  var element = {{Click Element}};
  return element ? element.getAttribute('data-gtm-cta') : undefined;
}
```

---

## ✅ Verification Checklist

### Pages to Test:

-   [ ] `/register/candidate` - Test all form fields and submit button
-   [ ] `/register/hr` - Test all form fields and submit button
-   [ ] `/candidate` - Test hero CTAs and final CTA
-   [ ] `/hr` - Test hero CTA, how it works CTA, and final CTA

### What to Verify:

1. ✅ All buttons have `data-gtm-cta` attributes
2. ✅ All form inputs have `data-gtm-element` attributes
3. ✅ All navigation links have `data-gtm-nav` attributes
4. ✅ Form containers have `data-gtm-form` attributes
5. ✅ UTM parameters are captured on page load
6. ✅ Data layer events are pushed to GTM

---

## 🚀 Next Steps for Marketing Team

### 1. Set Up GTM Triggers

Use the spreadsheet to create triggers for each trackable element.

### 2. Set Up GA4 Events

Create custom events in GA4 for:

-   `signup_form_view`
-   `signup_form_interaction`
-   `signup_button_click`
-   `navigation_click`
-   `cta_button_click`

### 3. Create Conversion Goals

Set up conversion goals for:

-   Form submissions
-   Successful signups
-   Button clicks on landing pages

### 4. Set Up Funnels

Create funnels in GA4:

-   **Candidate Funnel:** Landing → Signup → OTP → Complete
-   **HR Funnel:** Landing → Signup → OTP → Complete

### 5. Monitor & Optimize

-   Track conversion rates
-   Identify drop-off points
-   A/B test button text and positioning
-   Optimize based on data

---

## 📝 Additional Notes

### Email/Phone Duplicate Check

The unified signup flow now checks for duplicate emails/phones **BEFORE** sending OTP:

-   Returns 409 status code immediately
-   Shows user-friendly error message
-   Prevents wasted OTP sends
-   Better UX and cost savings

### Test the Implementation

1. Open developer console
2. Navigate to `/register/candidate` or `/register/hr`
3. Click buttons and interact with form fields
4. Check that `dataLayer` events are pushed to GTM
5. Verify in GTM Preview mode

---

## 🎉 Implementation Complete!

All tracking is now in place. The marketing team can use the `GTM_TRACKING_SPREADSHEET.csv` to set up their GTM triggers and tags.

**Last Updated:** November 7, 2025
