# Google Tag Manager (GTM) Tracking Implementation Guide

## Overview

This document outlines all GTM tracking attributes implemented across the HR and Candidate signup flows. All elements are tagged with `data-gtm-*` attributes that GTM can detect and use for event tracking.

## Implementation Details

### How It Works

-   **No JavaScript Required**: All tracking uses HTML `data-gtm-*` attributes
-   **GTM Already Installed**: The GTM container snippet is already in `client/index.html`
-   **Automatic Detection**: GTM reads these attributes from the DOM
-   **Configure in GTM**: Use these attribute values to set up Triggers and Tags in your GTM dashboard

### Data Attributes Used

| Attribute               | Purpose                                   | Example Values                                             |
| ----------------------- | ----------------------------------------- | ---------------------------------------------------------- |
| `data-gtm-form`         | Identifies form containers                | `candidate_hero_signup`, `hr_signup_step1`                 |
| `data-gtm-element`      | Identifies input fields                   | `candidate_signup_name_input`, `hr_otp_input`              |
| `data-gtm-cta`          | Identifies CTA buttons (primary tracking) | `candidate_hero_signup_button`, `hr_create_account_button` |
| `data-gtm-cta-text`     | The button text shown to users            | `Sign Up`, `Verify Mobile`, `Create Account`               |
| `data-gtm-cta-position` | Where the button appears                  | `hero`, `signup_page`, `otp_page`, `email_setup_page`      |
| `data-gtm-cta-funnel`   | Which signup flow                         | `candidate_signup`, `hr_signup`                            |
| `data-gtm-cta-step`     | Step in the 3-step funnel                 | `1`, `2`, `3`                                              |

---

## Candidate Signup Flow Tracking

### Step 1: Initial Signup (Name + Phone)

#### Page 1A: Hero Section (Landing Page)

**File**: `client/src/components/landingpage/condidate/CandidateFeatures.tsx`

| Element Type | Tracking ID                    | Description                | Additional Attributes                                                    |
| ------------ | ------------------------------ | -------------------------- | ------------------------------------------------------------------------ |
| Form         | `candidate_hero_signup`        | Hero signup form container | funnel: `candidate_signup`, step: `1`                                    |
| Input        | `candidate_hero_name_input`    | Name input field           | -                                                                        |
| Input        | `candidate_hero_phone_input`   | Phone number input field   | -                                                                        |
| Button       | `candidate_hero_signup_button` | Submit button              | text: `Sign Up`, position: `hero`, funnel: `candidate_signup`, step: `1` |

#### Page 1B: Dedicated Signup Page

**File**: `client/src/pages/ForJobSeekersSignup.tsx`

| Element Type | Tracking ID                        | Description              | Additional Attributes                                                                            |
| ------------ | ---------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------ |
| Form         | `candidate_signup_step1`           | Candidate signup form    | funnel: `candidate_signup`, step: `1`                                                            |
| Input        | `candidate_signup_name_input`      | Name input field         | -                                                                                                |
| Input        | `candidate_signup_phone_input`     | Phone number input field | -                                                                                                |
| Button       | `candidate_signup_continue_button` | Submit button            | text: `Continue as a Job Seeker`, position: `signup_page`, funnel: `candidate_signup`, step: `1` |

### Step 2: OTP Verification

**File**: `client/src/pages/auth/SMSOTPVerificationPage.tsx`

| Element Type | Tracking ID                   | Description           | Additional Attributes                                                              |
| ------------ | ----------------------------- | --------------------- | ---------------------------------------------------------------------------------- |
| Form         | `candidate_otp_verify`        | OTP verification form | funnel: `candidate_signup`, step: `2`                                              |
| Input        | `candidate_otp_input`         | 6-digit OTP input     | -                                                                                  |
| Button       | `candidate_otp_verify_button` | Verify button         | text: `Verify Mobile`, position: `otp_page`, funnel: `candidate_signup`, step: `2` |
| Button       | `candidate_otp_resend_button` | Resend OTP button     | text: `Resend Code`, position: `otp_page`                                          |
| Button       | `candidate_otp_back_button`   | Back to signup        | text: `Back to Sign Up`, position: `otp_page`                                      |

### Step 3: Email & Password Setup

**File**: `client/src/pages/auth/CompleteRegistrationPage.tsx`

| Element Type | Tracking ID                        | Description            | Additional Attributes                                                                       |
| ------------ | ---------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------- |
| Form         | `candidate_email_setup`            | Email/password form    | funnel: `candidate_signup`, step: `3`                                                       |
| Input        | `candidate_email_input`            | Email address input    | -                                                                                           |
| Input        | `candidate_password_input`         | Password input         | -                                                                                           |
| Input        | `candidate_confirm_password_input` | Confirm password input | -                                                                                           |
| Button       | `candidate_create_account_button`  | Final submit           | text: `Create Account`, position: `email_setup_page`, funnel: `candidate_signup`, step: `3` |

---

## HR/Employer Signup Flow Tracking

### Step 1: Initial Signup (Name + Phone)

**File**: `client/src/pages/ForEmployerSignup.tsx`

| Element Type | Tracking ID                 | Description              | Additional Attributes                                                                    |
| ------------ | --------------------------- | ------------------------ | ---------------------------------------------------------------------------------------- |
| Form         | `hr_signup_step1`           | HR signup form           | funnel: `hr_signup`, step: `1`                                                           |
| Input        | `hr_signup_name_input`      | Name input field         | -                                                                                        |
| Input        | `hr_signup_phone_input`     | Phone number input field | -                                                                                        |
| Button       | `hr_signup_continue_button` | Submit button            | text: `Continue as an Employer`, position: `signup_page`, funnel: `hr_signup`, step: `1` |

### Step 2: OTP Verification

**File**: `client/src/pages/auth/SMSOTPVerificationPage.tsx`

| Element Type | Tracking ID            | Description           | Additional Attributes                                                       |
| ------------ | ---------------------- | --------------------- | --------------------------------------------------------------------------- |
| Form         | `hr_otp_verify`        | OTP verification form | funnel: `hr_signup`, step: `2`                                              |
| Input        | `hr_otp_input`         | 6-digit OTP input     | -                                                                           |
| Button       | `hr_otp_verify_button` | Verify button         | text: `Verify Mobile`, position: `otp_page`, funnel: `hr_signup`, step: `2` |
| Button       | `hr_otp_resend_button` | Resend OTP button     | text: `Resend Code`, position: `otp_page`                                   |
| Button       | `hr_otp_back_button`   | Back to signup        | text: `Back to Sign Up`, position: `otp_page`                               |

### Step 3: Email & Password Setup

**File**: `client/src/pages/auth/CompleteRegistrationPage.tsx`

| Element Type | Tracking ID                 | Description            | Additional Attributes                                                                |
| ------------ | --------------------------- | ---------------------- | ------------------------------------------------------------------------------------ |
| Form         | `hr_email_setup`            | Email/password form    | funnel: `hr_signup`, step: `3`                                                       |
| Input        | `hr_email_input`            | Email address input    | -                                                                                    |
| Input        | `hr_password_input`         | Password input         | -                                                                                    |
| Input        | `hr_confirm_password_input` | Confirm password input | -                                                                                    |
| Button       | `hr_create_account_button`  | Final submit           | text: `Create Account`, position: `email_setup_page`, funnel: `hr_signup`, step: `3` |

---

## Funnel Analysis Setup

### Key Metrics to Track

#### Candidate Funnel

1. **Step 1 Start**: Form view on `candidate_hero_signup` OR `candidate_signup_step1`
2. **Step 1 Complete**: Click on `candidate_hero_signup_button` OR `candidate_signup_continue_button`
3. **Step 2 Start**: Form view on `candidate_otp_verify`
4. **Step 2 Complete**: Click on `candidate_otp_verify_button`
5. **Step 3 Start**: Form view on `candidate_email_setup`
6. **Step 3 Complete**: Click on `candidate_create_account_button`

#### HR Funnel

1. **Step 1 Start**: Form view on `hr_signup_step1`
2. **Step 1 Complete**: Click on `hr_signup_continue_button`
3. **Step 2 Start**: Form view on `hr_otp_verify`
4. **Step 2 Complete**: Click on `hr_otp_verify_button`
5. **Step 3 Start**: Form view on `hr_email_setup`
6. **Step 3 Complete**: Click on `hr_create_account_button`

### Conversion Goals

#### Primary Goals

-   **Candidate Signup Started**: Any Step 1 form view
-   **Candidate Signup Completed**: `candidate_create_account_button` click
-   **HR Signup Started**: Step 1 form view
-   **HR Signup Completed**: `hr_create_account_button` click

#### Secondary Goals

-   **OTP Verification Success**: Step 2 complete (both funnels)
-   **OTP Resend Rate**: `*_otp_resend_button` clicks
-   **Form Abandonment**: Form view without subsequent button click
-   **Hero CTA Performance**: `candidate_hero_signup_button` vs `candidate_signup_continue_button`

---

## GTM Configuration Guide

### 1. Create Triggers

#### Example: Track Candidate Signup Button Clicks

```
Trigger Type: Click - All Elements
Trigger Fires On: Some Clicks
Conditions:
  - Click Element matches CSS selector: [data-gtm-cta="candidate_hero_signup_button"]
  OR
  - Click Element matches CSS selector: [data-gtm-cta="candidate_signup_continue_button"]
```

#### Example: Track Form Visibility (Step 1 Start)

```
Trigger Type: Element Visibility
Trigger Fires On:
  - Selection Method: CSS Selector
  - Element Selector: [data-gtm-form="candidate_signup_step1"]
  - Minimum Percent Visible: 50%
```

#### Example: Track All Candidate Funnel Buttons

```
Trigger Type: Click - All Elements
Conditions:
  - Click Element matches CSS selector: [data-gtm-cta-funnel="candidate_signup"]
```

### 2. Create Variables

#### Custom JavaScript Variables

```javascript
// Get CTA Text
function() {
  return {{Click Element}}.getAttribute('data-gtm-cta-text');
}

// Get Funnel Step
function() {
  return {{Click Element}}.getAttribute('data-gtm-cta-step');
}

// Get CTA Position
function() {
  return {{Click Element}}.getAttribute('data-gtm-cta-position');
}
```

### 3. Create Tags

#### Example: GA4 Event - Signup Button Click

```
Tag Type: Google Analytics: GA4 Event
Event Name: signup_button_click
Event Parameters:
  - button_id: {{Click Element}}.getAttribute('data-gtm-cta')
  - button_text: {{Click Element}}.getAttribute('data-gtm-cta-text')
  - funnel: {{Click Element}}.getAttribute('data-gtm-cta-funnel')
  - step: {{Click Element}}.getAttribute('data-gtm-cta-step')
  - position: {{Click Element}}.getAttribute('data-gtm-cta-position')
```

---

## Testing Your Implementation

### 1. GTM Preview Mode

1. Go to your GTM workspace
2. Click **Preview** in the top right
3. Enter your website URL
4. Navigate through the signup flows
5. Check that events fire correctly in the Tag Assistant

### 2. What to Test

#### For Each Flow (Candidate & HR):

-   ✅ Form visibility detection
-   ✅ Input field interactions
-   ✅ Button clicks at each step
-   ✅ Correct funnel attribution
-   ✅ Step numbers (1, 2, 3)
-   ✅ Position tracking (hero vs signup_page)

#### Edge Cases:

-   OTP resend button clicks
-   Back button tracking
-   Form abandonment detection
-   Multiple entries (hero vs dedicated page)

### 3. Debug Console Commands

Open browser console and test:

```javascript
// List all forms with tracking
document.querySelectorAll('[data-gtm-form]');

// List all tracked buttons
document.querySelectorAll('[data-gtm-cta]');

// Check specific button attributes
const btn = document.querySelector('[data-gtm-cta="candidate_hero_signup_button"]');
console.log({
    id: btn.getAttribute('data-gtm-cta'),
    text: btn.getAttribute('data-gtm-cta-text'),
    funnel: btn.getAttribute('data-gtm-cta-funnel'),
    step: btn.getAttribute('data-gtm-cta-step'),
});
```

---

## Best Practices

### 1. Event Naming Convention

Use clear, consistent event names in GTM:

-   `signup_started` - When form becomes visible
-   `signup_step_completed` - When user completes a step
-   `signup_completed` - Final account creation
-   `signup_abandoned` - User leaves without completing

### 2. Enhanced Tracking

Consider adding these custom dimensions:

-   User Agent (device type)
-   Time spent on each step
-   Error messages encountered
-   Source/UTM parameters
-   A/B test variants

### 3. Reports to Build

-   **Funnel Visualization**: Step 1 → Step 2 → Step 3 drop-off rates
-   **Source Performance**: Which traffic sources convert best
-   **Hero vs Page**: Compare `hero` vs `signup_page` conversion rates
-   **Time Analysis**: Hour of day / day of week patterns
-   **Device Breakdown**: Mobile vs Desktop completion rates

---

## Quick Reference: All Tracking IDs

### Candidate Flow

```
Forms:
- candidate_hero_signup
- candidate_signup_step1
- candidate_otp_verify
- candidate_email_setup

Inputs:
- candidate_hero_name_input
- candidate_hero_phone_input
- candidate_signup_name_input
- candidate_signup_phone_input
- candidate_otp_input
- candidate_email_input
- candidate_password_input
- candidate_confirm_password_input

Buttons:
- candidate_hero_signup_button
- candidate_signup_continue_button
- candidate_otp_verify_button
- candidate_otp_resend_button
- candidate_otp_back_button
- candidate_create_account_button
```

### HR Flow

```
Forms:
- hr_signup_step1
- hr_otp_verify
- hr_email_setup

Inputs:
- hr_signup_name_input
- hr_signup_phone_input
- hr_otp_input
- hr_email_input
- hr_password_input
- hr_confirm_password_input

Buttons:
- hr_signup_continue_button
- hr_otp_verify_button
- hr_otp_resend_button
- hr_otp_back_button
- hr_create_account_button
```

---

## Support & Questions

For technical questions about the implementation, contact the development team.
For GTM configuration help, refer to [Google Tag Manager Documentation](https://support.google.com/tagmanager).

**Last Updated**: $(date)
**Implementation Version**: 1.0
