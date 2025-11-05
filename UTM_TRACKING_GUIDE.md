# UTM Tracking Implementation Guide

## 🎯 Overview

We've implemented **automatic UTM tracking** across all signup flows. This captures detailed campaign attribution data without requiring any manual user input.

---

## ✅ What's Implemented

### Backend Changes

1. **Lead Model** - Stores UTM data for phone-verified signups
2. **User Model** - Transfers UTM data when account is completed
3. **API Endpoints** - Accept UTM parameters in all signup requests

### Frontend Changes

1. **Automatic Capture** - UTM parameters captured when user first lands
2. **Session Storage** - Persists UTM data throughout signup flow
3. **All Signup Forms** - Send UTM data with every signup request

### Source Attribution

-   **Automatic Mapping** - UTM sources mapped to predefined categories
-   **Direct Traffic** - Unknown sources automatically labeled as "Direct"
-   **No User Input** - Completely invisible to users

---

## 📊 Available Sources

Users can come from these sources (automatically detected):

1. ✅ **Email**
2. ✅ **WhatsApp**
3. ✅ **Telegram**
4. ✅ **Instagram**
5. ✅ **Facebook**
6. ✅ **Journals**
7. ✅ **Posters**
8. ✅ **Brochures**
9. ✅ **Forums**
10. ✅ **Google**
11. ✅ **Conversational AI (GPT, Gemini etc)**
12. ✅ **Direct** ← NEW (for unknown/organic traffic)

---

## 🔗 How to Use UTM Parameters

### Campaign URL Structure

```
https://yoursite.com/register/candidate?utm_source=<source>&utm_medium=<medium>&utm_campaign=<campaign>&utm_content=<content>&utm_term=<term>
```

### Example Campaign URLs

#### Facebook Ads

```
https://yoursite.com/register/candidate?utm_source=facebook&utm_medium=cpc&utm_campaign=q4_hiring_2024&utm_content=video_ad_carousel
```

#### Instagram Story

```
https://yoursite.com/register/candidate?utm_source=instagram&utm_medium=story&utm_campaign=brand_awareness_nov&utm_content=swipe_up_link
```

#### Google Search Ads

```
https://yoursite.com/register/candidate?utm_source=google&utm_medium=cpc&utm_campaign=engineer_keywords&utm_term=software+engineer+jobs
```

#### WhatsApp Campaign

```
https://yoursite.com/register/candidate?utm_source=whatsapp&utm_medium=broadcast&utm_campaign=referral_program
```

#### Email Newsletter

```
https://yoursite.com/register/candidate?utm_source=email&utm_medium=newsletter&utm_campaign=weekly_digest_nov
```

---

## 📝 UTM Parameter Guide

| Parameter      | Required?      | Purpose          | Example Values                                     |
| -------------- | -------------- | ---------------- | -------------------------------------------------- |
| `utm_source`   | ✅ Yes         | Traffic source   | `facebook`, `google`, `instagram`, `whatsapp`      |
| `utm_medium`   | ✅ Recommended | Marketing medium | `cpc`, `email`, `social`, `story`, `referral`      |
| `utm_campaign` | ✅ Recommended | Campaign name    | `q4_hiring`, `brand_awareness`, `referral_program` |
| `utm_content`  | Optional       | Ad variation     | `video_ad_1`, `carousel_ad`, `hero_banner`         |
| `utm_term`     | Optional       | Paid keywords    | `software+engineer`, `remote+jobs`                 |

---

## 🎨 Source Mapping

UTM sources are automatically mapped to predefined categories:

| UTM Source                                      | Maps To                             |
| ----------------------------------------------- | ----------------------------------- |
| `facebook`                                      | Facebook                            |
| `instagram`                                     | Instagram                           |
| `whatsapp`                                      | WhatsApp                            |
| `telegram`                                      | Telegram                            |
| `google`                                        | Google                              |
| `email`                                         | Email                               |
| `gpt`, `gemini`, `chatgpt`, `conversational-ai` | Conversational AI (GPT, Gemini etc) |
| `journal`                                       | Journals                            |
| `poster`                                        | Posters                             |
| `brochure`                                      | Brochures                           |
| `forum`                                         | Forums                              |
| **No UTM params**                               | **Direct**                          |
| **Unknown source**                              | Google (default paid)               |

---

## 🚀 Campaign Setup Examples

### Example 1: Facebook Video Ad Campaign

**Goal**: Track Q4 2024 hiring campaign on Facebook

**URLs**:

-   Video Ad 1: `?utm_source=facebook&utm_medium=cpc&utm_campaign=q4_2024_hiring&utm_content=video_ad_1`
-   Video Ad 2: `?utm_source=facebook&utm_medium=cpc&utm_campaign=q4_2024_hiring&utm_content=video_ad_2`
-   Carousel Ad: `?utm_source=facebook&utm_medium=cpc&utm_campaign=q4_2024_hiring&utm_content=carousel_ad`

**What You'll Track**:

-   Total signups from Facebook
-   Which ad creative performed best
-   Campaign ROI
-   Cost per acquisition

---

### Example 2: Google Ads (Search)

**Goal**: Track keyword performance

**URLs**:

-   Keyword "software jobs": `?utm_source=google&utm_medium=cpc&utm_campaign=engineer_keywords&utm_term=software+jobs`
-   Keyword "remote work": `?utm_source=google&utm_medium=cpc&utm_campaign=remote_keywords&utm_term=remote+work`

**What You'll Track**:

-   Which keywords drive signups
-   Keyword-level conversion rates
-   Search vs Display performance

---

### Example 3: Instagram Influencer Campaign

**Goal**: Track influencer partnerships

**URLs**:

-   Influencer A: `?utm_source=instagram&utm_medium=influencer&utm_campaign=tech_influencers&utm_content=influencer_a`
-   Influencer B: `?utm_source=instagram&utm_medium=influencer&utm_campaign=tech_influencers&utm_content=influencer_b`

**What You'll Track**:

-   Which influencer drives more signups
-   Influencer ROI
-   Audience quality by influencer

---

### Example 4: WhatsApp Referral Program

**Goal**: Track referral signups

**URL**: `?utm_source=whatsapp&utm_medium=referral&utm_campaign=employee_referral_program`

**What You'll Track**:

-   Referral signup rate
-   WhatsApp as acquisition channel
-   Viral coefficient

---

## 📈 Data You Can Analyze

### In Your Database

Every Lead and User now has two fields:

1. **source** (string) - Simple category (e.g., "Facebook", "Google", "Direct")
2. **utmData** (object) - Full UTM parameters:
    ```json
    {
        "utm_source": "facebook",
        "utm_medium": "cpc",
        "utm_campaign": "q4_2024_hiring",
        "utm_content": "video_ad_1",
        "utm_term": null,
        "referrer": "https://facebook.com",
        "landing_page": "/register/candidate",
        "captured_at": "2024-11-05T14:30:00.000Z"
    }
    ```

### Key Metrics You Can Track

1. **Signups by Source**

    - Count users where `source = 'Facebook'`
    - Compare Facebook vs Instagram vs Google

2. **Campaign Performance**

    - Count users where `utmData.utm_campaign = 'q4_2024_hiring'`
    - Compare campaigns side-by-side

3. **Ad Creative Performance**

    - Count users where `utmData.utm_content = 'video_ad_1'`
    - Find which ad variation converts best

4. **Keyword Performance (Google Ads)**

    - Count users where `utmData.utm_term = 'software+jobs'`
    - Calculate CPA per keyword

5. **Landing Page Performance**

    - Count users where `utmData.landing_page = '/register/candidate'`
    - Hero section vs dedicated page conversion

6. **Referrer Analysis**
    - See which external sites drive traffic

---

## 🔍 How It Works (Technical)

### Step 1: User Clicks Ad

```
User clicks: https://yoursite.com?utm_source=facebook&utm_campaign=q4_2024
```

### Step 2: App Captures UTM

```javascript
// Automatically runs when app loads
captureUTMParams() → stores in sessionStorage
```

### Step 3: User Signs Up

```javascript
// When user submits signup form
{
  phoneNumber: "+919876543210",
  name: "John Doe",
  role: "candidate",
  source: "Facebook",  // Mapped from utm_source
  utmData: {           // Full UTM data
    utm_source: "facebook",
    utm_campaign: "q4_2024",
    ...
  }
}
```

### Step 4: Data Stored

```
Lead created → UTM data stored
↓
Phone verified → UTM data preserved
↓
Email added → UTM data transferred to User
```

---

## 🎯 Best Practices

### 1. Consistent Naming

```
✅ Good: utm_campaign=q4_2024_hiring
❌ Bad:  utm_campaign=Campaign1
```

### 2. Descriptive Sources

```
✅ Good: utm_source=facebook
✅ Good: utm_source=instagram
❌ Bad:  utm_source=social
```

### 3. Use All Parameters

```
✅ Complete: ?utm_source=facebook&utm_medium=cpc&utm_campaign=q4_2024&utm_content=video_1
⚠️  Basic:   ?utm_source=facebook
```

### 4. Lowercase Everything

```
✅ Good: utm_source=facebook
❌ Bad:  utm_source=Facebook
```

### 5. Use Hyphens, Not Spaces

```
✅ Good: utm_campaign=q4-hiring-campaign
❌ Bad:  utm_campaign=q4 hiring campaign
```

---

## 🛠️ Tools for Creating UTM Links

### Google Campaign URL Builder

https://ga-dev-tools.google/campaign-url-builder/

### Spreadsheet Template

Create a spreadsheet with columns:

-   Base URL
-   Source
-   Medium
-   Campaign
-   Content
-   Final URL

Formula: `=A2&"?utm_source="&B2&"&utm_medium="&C2&"&utm_campaign="&D2&"&utm_content="&E2`

---

## 📊 Sample Queries

### MongoDB Queries

**Count signups by source:**

```javascript
db.users.aggregate([{ $group: { _id: '$source', count: { $sum: 1 } } }, { $sort: { count: -1 } }]);
```

**Find all Facebook campaign signups:**

```javascript
db.users.find({
    'utmData.utm_source': 'facebook',
    'utmData.utm_campaign': 'q4_2024_hiring',
});
```

**Count by campaign:**

```javascript
db.users.aggregate([{ $group: { _id: '$utmData.utm_campaign', count: { $sum: 1 } } }, { $sort: { count: -1 } }]);
```

**Direct traffic (no UTM):**

```javascript
db.users.find({ source: 'Direct' });
```

---

## ✅ Testing Your Campaigns

### Test URL

```
http://localhost:5173/register/candidate?utm_source=test&utm_medium=email&utm_campaign=test_campaign_123
```

### Check in Browser Console

```javascript
// Open DevTools Console, paste this:
JSON.parse(sessionStorage.getItem('utm_params'));
```

### Expected Output

```json
{
    "utm_source": "test",
    "utm_medium": "email",
    "utm_campaign": "test_campaign_123",
    "referrer": "",
    "landing_page": "/register/candidate"
}
```

---

## 🚨 Troubleshooting

### Problem: UTM not captured

**Solution**: Ensure URL has `?` before first parameter and `&` between parameters

### Problem: Source shows "Direct" instead of Facebook

**Solution**: Check utm_source spelling: must be lowercase `facebook` not `Facebook`

### Problem: Lost UTM after page navigation

**Solution**: UTM is stored in sessionStorage, persists during signup flow

### Problem: Want to clear old UTM

**Solution**: Close browser tab or call `sessionStorage.removeItem('utm_params')`

---

## 📞 Support

For technical questions about UTM implementation:

-   Check this guide first
-   Review the technical documentation in the code
-   Contact development team if issues persist

**Last Updated**: November 5, 2024  
**Version**: 1.0
