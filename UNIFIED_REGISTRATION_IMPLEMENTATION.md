# Unified Registration Flow - Implementation Guide

## ✅ Completed Backend Changes

### 1. Environment Configuration

-   ✅ Added `OTP_VERIFICATION_METHOD` to `api/src/config/env.ts`
-   Value: `'sms'` or `'email'`
-   Default: `'sms'`

### 2. Lead Model Updates (`api/src/models/Lead.ts`)

-   ✅ Added fields:
    -   `email?: string`
    -   `designation?: string`
    -   `isPhoneVerified: boolean`
    -   `isEmailVerified: boolean`
    -   `isVerified: boolean`
    -   `verificationMethod?: 'sms' | 'email'`
-   ✅ Made `source` optional
-   ✅ Added 'Referral' and 'Other' to source enum

### 3. Auth Controller (`api/src/controllers/AuthController.ts`)

-   ✅ Added `unifiedRegisterSchema` validation
-   ✅ Added `verifyUnifiedOTPSchema` validation
-   ✅ Added `AuthController.registerUnified()` method
-   ✅ Added `AuthController.verifyUnifiedOTP()` method

### 4. Auth Service (`api/src/services/AuthService.ts`)

-   ✅ Added `AuthService.registerUnified()` method
    -   Parses full name → firstName + lastName
    -   Creates/updates Lead with all data
    -   Sends OTP via SMS or Email (based on env)
    -   Returns leadId, verificationType, maskedContact, tempToken
-   ✅ Added `AuthService.verifyUnifiedOTP()` method
    -   Verifies OTP
    -   Creates User account
    -   Marks Lead as verified
    -   Returns user + auth tokens

### 5. Routes (`api/src/routes/auth.ts`)

-   ✅ Added `POST /auth/register-unified`
-   ✅ Added `POST /auth/verify-otp-unified`

### 6. Email Service

-   ✅ Already exists with OTP functionality

---

## ✅ Completed Frontend Changes

### 1. API Client (`client/src/services/api.ts`)

-   ✅ Added `apiClient.registerUnified()` method
-   ✅ Added `apiClient.verifyUnifiedOTP()` method

### 2. Unified OTP Verification Page

-   ✅ Created `client/src/pages/auth/UnifiedOTPVerificationPage.tsx`
-   Features:
    -   Dynamic icon (SMS/Email) based on verification type
    -   Masked contact display
    -   6-digit OTP input
    -   Resend OTP functionality
    -   10-minute countdown timer
    -   GTM tracking
    -   Auto-redirect to dashboard on success

---

## 🚧 Pending Frontend Changes

### 3. Update ForEmployerSignup.tsx

**File**: `client/src/pages/ForEmployerSignup.tsx`

**Required Changes**:

1. **Add new state variables**:

```tsx
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
const [source, setSource] = useState('');
const [designation, setDesignation] = useState('');

const [emailError, setEmailError] = useState('');
const [passwordError, setPasswordError] = useState('');
const [confirmPasswordError, setConfirmPasswordError] = useState('');
const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
```

2. **Add validation functions**:

```tsx
const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    if (password.length < 8) errors.push('at least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('one uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('one lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('one number');
    return { isValid: errors.length === 0, errors };
};
```

3. **Update handleContinue to call unified API**:

```tsx
const handleContinue = async () => {
    // Validate all fields...

    setIsLoading(true);
    try {
        const utmParams = getUTMParams();
        const source = mapUTMToSource(utmParams);

        const response = await apiClient.registerUnified({
            fullName: fullName.trim(),
            phoneNumber: phone,
            email: email.trim().toLowerCase(),
            password,
            role: 'hr',
            source: sourceValue || source,
            designation: designation || undefined,
            utmData: utmParams,
        });

        if (response.success) {
            toast({
                title: 'Verification Code Sent',
                description: `We've sent a verification code via ${response.data.verificationType}.`,
            });

            // Store data in sessionStorage
            sessionStorage.setItem(
                'unified_verification_data',
                JSON.stringify({
                    leadId: response.data.leadId,
                    verificationType: response.data.verificationType,
                    maskedContact: response.data.maskedContact,
                    tempToken: response.data.tempToken,
                    fullName: fullName.trim(),
                    phoneNumber: phone,
                    email: email.trim(),
                    password, // Store for resend functionality
                    role: 'hr',
                    source: sourceValue,
                    designation,
                    utmData: utmParams,
                    timestamp: Date.now(),
                }),
            );

            // Navigate to unified OTP page
            navigate('/auth/verify-unified');
        }
    } catch (error) {
        // Error handling...
    } finally {
        setIsLoading(false);
    }
};
```

4. **Add new form fields in JSX** (after phone number field):

```tsx
<div className='space-y-2'>
    <Label htmlFor='email'>Email*</Label>
    <Input
        id='email'
        type='email'
        placeholder='jane@company.com'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className={emailError ? 'border-red-500' : ''}
    />
    {emailError && <p className='text-sm text-red-500'>{emailError}</p>}
</div>

<div className='space-y-2'>
    <Label htmlFor='password'>Password*</Label>
    <div className='relative'>
        <Input
            id='password'
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={passwordError ? 'border-red-500' : ''}
        />
        <button
            type='button'
            onClick={() => setShowPassword(!showPassword)}
            className='absolute right-3 top-1/2 -translate-y-1/2'
        >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
    </div>
    {passwordError && <p className='text-sm text-red-500'>{passwordError}</p>}
</div>

<div className='space-y-2'>
    <Label htmlFor='confirmPassword'>Confirm Password*</Label>
    <div className='relative'>
        <Input
            id='confirmPassword'
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className={confirmPasswordError ? 'border-red-500' : ''}
        />
        <button
            type='button'
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className='absolute right-3 top-1/2 -translate-y-1/2'
        >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
    </div>
    {confirmPasswordError && <p className='text-sm text-red-500'>{confirmPasswordError}</p>}
</div>

<div className='space-y-2'>
    <Label htmlFor='designation'>Designation (Optional)</Label>
    <Input
        id='designation'
        type='text'
        placeholder='HR Manager'
        value={designation}
        onChange={(e) => setDesignation(e.target.value)}
        maxLength={100}
    />
</div>

<div className='space-y-2'>
    <Label htmlFor='source'>How did you hear about us? (Optional)</Label>
    <select
        id='source'
        value={source}
        onChange={(e) => setSource(e.target.value)}
        className='w-full px-3 py-2 border rounded-md'
    >
        <option value=''>Select source</option>
        <option value='Email'>Email</option>
        <option value='WhatsApp'>WhatsApp</option>
        <option value='Instagram'>Instagram</option>
        <option value='Facebook'>Facebook</option>
        <option value='Google'>Google</option>
        <option value='Referral'>Referral</option>
        <option value='Other'>Other</option>
    </select>
</div>
```

---

### 4. Update ForJobSeekersSignup.tsx

**File**: `client/src/pages/ForJobSeekersSignup.tsx`

**Required Changes**: Same as ForEmployerSignup.tsx BUT:

-   Remove `designation` field (candidate doesn't need it)
-   Change role to `'candidate'`
-   Update button text to "Continue as a Job Seeker"

---

### 5. Update App Routes

**File**: `client/src/App.tsx` or routing file

**Add new route**:

```tsx
import UnifiedOTPVerificationPage from '@/pages/auth/UnifiedOTPVerificationPage';

// In routes:
<Route path='/auth/verify-unified' element={<UnifiedOTPVerificationPage />} />;
```

---

## 📝 Environment Variables

### Backend (.env)

```bash
# OTP Verification Method
OTP_VERIFICATION_METHOD=sms  # or 'email'

# If using SMS
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=your_number
TEST_SMS=false  # Set to true in development for testing

# If using Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

---

## 🔄 Migration Plan

### For Existing Unverified Leads:

1. Run a migration script to add default values:
    - `isPhoneVerified: false`
    - `isEmailVerified: false`
    - `isVerified: false`
    - `verificationMethod: 'sms'` (based on existing data)

### For Existing Verified Users:

-   No changes needed - they continue to work as before

---

## ✅ Testing Checklist

### Backend:

-   [ ] POST /auth/register-unified returns correct data
-   [ ] OTP sent via SMS when OTP_VERIFICATION_METHOD=sms
-   [ ] OTP sent via Email when OTP_VERIFICATION_METHOD=email
-   [ ] POST /auth/verify-otp-unified creates user correctly
-   [ ] Lead marked as verified after OTP verification
-   [ ] User account created with correct role
-   [ ] Candidate profile created for candidate role
-   [ ] Google Sheets logging works

### Frontend:

-   [ ] All form fields validate correctly
-   [ ] Name parsing works (John Doe → firstName: John, lastName: Doe)
-   [ ] Password strength indicator works
-   [ ] OTP page shows correct verification type (SMS/Email)
-   [ ] Masked contact displays correctly
-   [ ] Resend OTP works
-   [ ] Countdown timer works
-   [ ] Auto-redirect to dashboard on success
-   [ ] GTM tracking attributes present

### Integration:

-   [ ] Complete flow works end-to-end (register → OTP → dashboard)
-   [ ] Error handling works correctly
-   [ ] Session expiry handled properly
-   [ ] Duplicate email/phone detection works

---

## 📊 GTM Tracking Updates

### New Elements to Track:

1. **Unified Signup Form** (`/register/hr` and `/register/candidate`):

    - `unified_signup_email_input`
    - `unified_signup_password_input`
    - `unified_signup_source_select`
    - `unified_signup_designation_input` (HR only)
    - `unified_signup_submit_button`

2. **Unified OTP Page** (`/auth/verify-unified`):
    - `unified_verify_otp_button`
    - `unified_resend_otp_button`
    - `unified_back_to_signup_button`

Update `GTM_TRACKING_SPREADSHEET.csv` with these new elements.

---

## 🚀 Deployment Steps

1. **Deploy Backend First**:

    - Ensure database migrations run
    - Set `OTP_VERIFICATION_METHOD` in production env
    - Test API endpoints

2. **Deploy Frontend**:

    - Update both signup pages
    - Add new OTP verification page
    - Update routing

3. **Monitor**:
    - Check error logs
    - Verify OTP delivery (SMS/Email)
    - Monitor signup completion rate

---

## 📞 Support

If you encounter issues:

1. Check logs in `api/logs`
2. Verify environment variables
3. Test OTP delivery manually
4. Check Lead model in database

---

**Implementation Status**: Backend Complete ✅ | Frontend Partial ⏳
**Next Steps**: Update ForEmployerSignup.tsx and ForJobSeekersSignup.tsx with all fields
