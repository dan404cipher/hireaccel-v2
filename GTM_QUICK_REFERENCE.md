# Quick Reference: GTM Tracking IDs

## 🎯 Candidate Signup Flow (`/register/candidate`)

### Page Elements

| Element          | Tracking ID                               | Type       | Notes                |
| ---------------- | ----------------------------------------- | ---------- | -------------------- |
| Logo (Home)      | `candidate_signup_logo_home`              | Navigation | Desktop & Mobile     |
| Full Name Input  | `candidate_signup_name_input`             | Form Field | Required             |
| Phone Input      | `candidate_signup_phone_input`            | Form Field | International format |
| Email Input      | `candidate_signup_email_input`            | Form Field | Required             |
| Password Input   | `candidate_signup_password_input`         | Form Field | Required             |
| Confirm Password | `candidate_signup_confirm_password_input` | Form Field | Required             |
| Source Dropdown  | `candidate_signup_source_select`          | Form Field | Optional             |
| Submit Button    | `candidate_unified_signup_button`         | CTA        | Main conversion      |
| Sign In Link     | `candidate_signup_signin_link`            | Navigation | Bottom of form       |

---

## 🏢 HR Signup Flow (`/register/hr`)

### Page Elements

| Element           | Tracking ID                        | Type       | Notes                |
| ----------------- | ---------------------------------- | ---------- | -------------------- |
| Logo (Home)       | `hr_signup_logo_home`              | Navigation | Desktop & Mobile     |
| Full Name Input   | `hr_signup_name_input`             | Form Field | Required             |
| Phone Input       | `hr_signup_phone_input`            | Form Field | International format |
| Email Input       | `hr_signup_email_input`            | Form Field | Required             |
| Designation Input | `hr_signup_designation_input`      | Form Field | Optional             |
| Password Input    | `hr_signup_password_input`         | Form Field | Required             |
| Confirm Password  | `hr_signup_confirm_password_input` | Form Field | Required             |
| Source Dropdown   | `hr_signup_source_select`          | Form Field | Optional             |
| Submit Button     | `hr_unified_signup_button`         | CTA        | Main conversion      |
| Sign In Link      | `hr_signup_signin_link`            | Navigation | Bottom of form       |

---

## 👔 Candidate Landing Page (`/candidate`)

### CTAs

| Button Text                | Tracking ID                            | Position  |
| -------------------------- | -------------------------------------- | --------- |
| "Get matched in 2 minutes" | `candidate_hero_get_matched_cv_button` | Hero      |
| "Just upload CV"           | `candidate_hero_upload_cv_button`      | Hero      |
| "Upload Your CV Now"       | `candidate_final_cta_button`           | Final CTA |

---

## 💼 HR Landing Page (`/hr`)

### CTAs

| Button Text                          | Tracking ID                  | Position     |
| ------------------------------------ | ---------------------------- | ------------ |
| "Post unlimited jobs for FREE"       | `hr_hero_cta_button`         | Hero         |
| "Start Your First Job Post"          | `hr_how_it_works_cta_button` | How It Works |
| "Get Started Free - Save ₹3,60,000+" | `hr_final_cta_button`        | Final CTA    |

---

## 📊 Event Naming Convention

### Suggested GA4 Event Names

```javascript
// Form View
event_name: 'form_view'
form_id: 'candidate_signup_step1' or 'hr_signup_step1'
funnel: 'candidate_signup' or 'hr_signup'
step: 1

// Form Field Interaction
event_name: 'form_interaction'
element_id: 'candidate_signup_name_input'
field_name: 'name'
funnel: 'candidate_signup'

// CTA Button Click
event_name: 'cta_click'
cta_id: 'candidate_unified_signup_button'
cta_text: 'Create Job Seeker Account →'
position: 'signup_page'
funnel: 'candidate_signup'
step: 1

// Navigation Click
event_name: 'navigation_click'
nav_id: 'candidate_signup_logo_home'
destination: '/'
location: 'signup_page_desktop'
```

---

## 🎨 CSS Selectors for GTM Triggers

### CTA Buttons

```css
/* Candidate signup button */
[data-gtm-cta="candidate_unified_signup_button"]

/* HR signup button */
[data-gtm-cta="hr_unified_signup_button"]

/* Candidate landing page buttons */
[data-gtm-cta="candidate_hero_upload_cv_button"]
[data-gtm-cta="candidate_hero_get_matched_cv_button"]
[data-gtm-cta="candidate_final_cta_button"]

/* HR landing page buttons */
[data-gtm-cta="hr_hero_cta_button"]
[data-gtm-cta="hr_how_it_works_cta_button"]
[data-gtm-cta="hr_final_cta_button"]
```

### Form Fields

```css
/* Candidate form */
[data-gtm-form="candidate_signup_step1"]
[data-gtm-element="candidate_signup_name_input"]
[data-gtm-element="candidate_signup_phone_input"]
[data-gtm-element="candidate_signup_email_input"]

/* HR form */
[data-gtm-form="hr_signup_step1"]
[data-gtm-element="hr_signup_name_input"]
[data-gtm-element="hr_signup_phone_input"]
[data-gtm-element="hr_signup_email_input"]
[data-gtm-element="hr_signup_designation_input"]
```

### Navigation Elements

```css
/* Logo clicks */
[data-gtm-nav="candidate_signup_logo_home"]
[data-gtm-nav="hr_signup_logo_home"]

/* Sign in links */
[data-gtm-nav="candidate_signup_signin_link"]
[data-gtm-nav="hr_signup_signin_link"]
```

---

## 🔧 GTM Variables to Create

### 1. Click Element CTA ID

```javascript
function() {
  var element = {{Click Element}};
  return element ? element.getAttribute('data-gtm-cta') : undefined;
}
```

### 2. Click Element CTA Text

```javascript
function() {
  var element = {{Click Element}};
  return element ? element.getAttribute('data-gtm-cta-text') : undefined;
}
```

### 3. Click Element CTA Position

```javascript
function() {
  var element = {{Click Element}};
  return element ? element.getAttribute('data-gtm-cta-position') : undefined;
}
```

### 4. Form Funnel Name

```javascript
function() {
  var form = {{Click Element}}.closest('[data-gtm-form]');
  return form ? form.getAttribute('data-gtm-cta-funnel') : undefined;
}
```

### 5. Form Step Number

```javascript
function() {
  var form = {{Click Element}}.closest('[data-gtm-form]');
  return form ? form.getAttribute('data-gtm-cta-step') : undefined;
}
```

---

## 📈 Recommended Conversion Goals

### Primary Conversions

1. **Candidate Signup Submit** - `candidate_unified_signup_button` click
2. **HR Signup Submit** - `hr_unified_signup_button` click

### Secondary Conversions

3. **Candidate Landing CTA** - Any CTA click on `/candidate`
4. **HR Landing CTA** - Any CTA click on `/hr`

### Micro Conversions

5. **Form Field Engagement** - Any input field interaction
6. **Page Scroll Depth** - 25%, 50%, 75%, 100%
7. **Time on Signup Page** - >30 seconds

---

## 🎯 Sample GTM Tag Configuration

### Example: Track Candidate Signup Button Click

**Tag Name:** GA4 - Candidate Signup Button Click

**Tag Type:** Google Analytics: GA4 Event

**Configuration:**

-   Measurement ID: `G-XXXXXXXXXX`
-   Event Name: `signup_button_click`

**Event Parameters:**
| Parameter Name | Value |
|----------------|-------|
| cta_id | `{{DLV - CTA ID}}` |
| cta_text | `{{DLV - CTA Text}}` |
| cta_position | `{{DLV - CTA Position}}` |
| funnel | `candidate_signup` |
| step | `1` |
| page_path | `{{Page Path}}` |
| user_role | `candidate` |

**Triggering:**

-   Trigger: Click - All Elements
-   Condition: Click Element matches CSS selector `[data-gtm-cta="candidate_unified_signup_button"]`

---

## ✅ Testing Checklist

### Before Going Live:

-   [ ] Verify all tracking IDs are present in GTM_TRACKING_SPREADSHEET.csv
-   [ ] Test GTM Preview mode on all pages
-   [ ] Verify dataLayer events in browser console
-   [ ] Check GA4 DebugView for real-time events
-   [ ] Test on both desktop and mobile
-   [ ] Verify UTM parameters are captured correctly
-   [ ] Test form field interactions fire events
-   [ ] Confirm button clicks fire events
-   [ ] Check navigation clicks are tracked

---

## 📞 Support

For technical questions about tracking implementation:

-   See: `GTM_TRACKING_IMPLEMENTATION_STATUS.md`
-   See: `GTM_TRACKING_SPREADSHEET.csv`

**Last Updated:** November 7, 2025
