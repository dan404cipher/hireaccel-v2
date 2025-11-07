import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Eye, EyeOff } from 'lucide-react';
import { apiClient } from '@/services/api';
import { getUTMParams, mapUTMToSource, storeReferrer, clearUTMParams, clearReferrer } from '@/utils/utmTracking';
import intlTelInput from 'intl-tel-input';
import 'intl-tel-input/build/css/intlTelInput.css';

interface UnifiedSignupFormProps {
    role: 'candidate' | 'hr';
    variant?: 'default' | 'inline'; // default for full page, inline for embedded
    onSuccess?: () => void; // Optional callback after successful signup
    className?: string; // Additional classes for form container
}

// Role-specific configuration
const roleConfig = {
    candidate: {
        formId: 'candidate_signup_step1',
        funnel: 'candidate_signup',
        ctaId: 'candidate_unified_signup_button',
        ctaText: 'Create Job Seeker Account',
        headerTitle: 'Create Account as a Job Seeker',
        headerSubtitle: 'Join our platform and start your job search journey',
        headerColor: 'purple',
        buttonText: 'Create Job Seeker Account →',
        elementPrefix: 'candidate_signup',
    },
    hr: {
        formId: 'hr_signup_step1',
        funnel: 'hr_signup',
        ctaId: 'hr_unified_signup_button',
        ctaText: 'Create Employer Account',
        headerTitle: 'Create Account as an Employer',
        headerSubtitle: 'Join our platform and start your hiring journey',
        headerColor: 'blue',
        buttonText: 'Create Employer Account →',
        elementPrefix: 'hr_signup',
    },
};

const UnifiedSignupForm = ({ role, variant = 'default', onSuccess, className = '' }: UnifiedSignupFormProps) => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const phoneInputRef = useRef<HTMLInputElement>(null);
    const itiRef = useRef<ReturnType<typeof intlTelInput> | null>(null);

    const config = roleConfig[role];

    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [source, setSource] = useState('');
    const [designation, setDesignation] = useState('');

    const [phoneError, setPhoneError] = useState('');
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Store referrer on component mount
    useEffect(() => {
        storeReferrer();
    }, []);

    // Initialize intl-tel-input
    useEffect(() => {
        const currentInput = phoneInputRef.current;
        if (currentInput && !itiRef.current) {
            itiRef.current = intlTelInput(currentInput, {
                initialCountry: 'in',
                // @ts-expect-error - utilsScript is a valid option but types may be incomplete
                utilsScript: 'https://cdn.jsdelivr.net/npm/intl-tel-input@19.5.6/build/js/utils.js',
            });

            // Ensure the intl-tel-input wrapper is block-level
            setTimeout(() => {
                const itiWrapper = currentInput.closest('.iti');
                if (itiWrapper) {
                    (itiWrapper as HTMLElement).style.display = 'block';
                    (itiWrapper as HTMLElement).style.width = '100%';
                }
            }, 0);

            const handleCountryChange = () => {
                if (currentInput && itiRef.current) {
                    const number = itiRef.current.getNumber();
                    if (number) {
                        setPhone(number);
                        setPhoneError('');
                    }
                }
            };

            currentInput.addEventListener('countrychange', handleCountryChange);

            return () => {
                if (currentInput) {
                    currentInput.removeEventListener('countrychange', handleCountryChange);
                }
                if (itiRef.current) {
                    itiRef.current.destroy();
                    itiRef.current = null;
                }
            };
        }

        return () => {
            if (itiRef.current) {
                itiRef.current.destroy();
                itiRef.current = null;
            }
        };
    }, []);

    const validateName = (name: string): boolean => {
        const nameRegex = /^[a-zA-Z\s'-]{2,50}$/;
        return nameRegex.test(name.trim());
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const filtered = value.replace(/[^a-zA-Z\s'-]/g, '');
        setFullName(filtered);
        if (nameError) {
            setNameError('');
        }
    };

    const getPhoneErrorMessage = (errorCode: number): string => {
        switch (errorCode) {
            case 0:
                return 'Please select a valid country';
            case 1:
                return 'Phone number is too short for this country';
            case 2:
                return 'Phone number is too long for this country';
            case 3:
                return 'Phone number length is invalid for this country';
            default:
                return 'Please enter a valid phone number';
        }
    };

    const getNationalDigits = (phoneNumber: string): string => {
        if (!phoneNumber || !itiRef.current) return '';
        const allDigits = phoneNumber.replace(/\D/g, '');
        const countryData = itiRef.current.getSelectedCountryData();
        const countryDialCode = countryData.dialCode || '';
        if (allDigits.startsWith(countryDialCode)) {
            return allDigits.slice(countryDialCode.length);
        }
        if (phoneNumber.startsWith('+91')) {
            return allDigits.slice(2);
        }
        return allDigits;
    };

    const validatePhoneStartsWithZero = (phoneNumber: string): boolean => {
        const nationalDigits = getNationalDigits(phoneNumber);
        return nationalDigits.startsWith('0');
    };

    const validateAllDigitsSame = (phoneNumber: string): boolean => {
        const nationalDigits = getNationalDigits(phoneNumber);
        if (nationalDigits.length === 0) return false;
        const firstDigit = nationalDigits[0];
        return nationalDigits.split('').every((digit) => digit === firstDigit);
    };

    const validateIndiaPhoneLength = (phoneNumber: string): boolean => {
        if (!phoneNumber || !itiRef.current) return false;
        const countryCode = itiRef.current.getSelectedCountryData().iso2;
        if (countryCode === 'in') {
            const nationalDigits = getNationalDigits(phoneNumber);
            return nationalDigits.length === 10;
        }
        return true;
    };

    const validatePhone = (phoneNumber: string): boolean => {
        if (!phoneNumber || !phoneNumber.trim()) return false;

        if (itiRef.current) {
            const isValid = itiRef.current.isValidNumber();
            if (!isValid && phoneNumber.startsWith('+91')) {
                const digitsOnly = phoneNumber.replace(/\D/g, '');
                const nationalDigits = digitsOnly.slice(2);
                if (nationalDigits.length === 10 && /^[6-9]/.test(nationalDigits)) {
                    if (nationalDigits.startsWith('0')) return false;
                    if (nationalDigits.split('').every((d) => d === nationalDigits[0])) return false;
                    return true;
                }
                return false;
            }
            if (!isValid) return false;
        } else {
            if (phoneNumber.startsWith('+91')) {
                const digitsOnly = phoneNumber.replace(/\D/g, '');
                const nationalDigits = digitsOnly.slice(2);
                if (nationalDigits.length !== 10 || !/^[6-9]/.test(nationalDigits)) {
                    return false;
                }
            }
        }

        if (validatePhoneStartsWithZero(phoneNumber)) return false;
        if (validateAllDigitsSame(phoneNumber)) return false;
        if (!validateIndiaPhoneLength(phoneNumber)) return false;

        return true;
    };

    const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (
            [
                'Backspace',
                'Delete',
                'Tab',
                'Escape',
                'Enter',
                'ArrowLeft',
                'ArrowRight',
                'ArrowUp',
                'ArrowDown',
            ].includes(e.key)
        ) {
            return;
        }
        if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x', 'z'].includes(e.key.toLowerCase())) {
            return;
        }
        if (/^[0-9+\s-]$/.test(e.key)) {
            return;
        }
        e.preventDefault();
    };

    const handlePhoneChange = () => {
        if (phoneInputRef.current) {
            let inputValue = phoneInputRef.current.value.trim();
            const digitsOnly = inputValue.replace(/\D/g, '');
            if (inputValue !== digitsOnly) {
                phoneInputRef.current.value = digitsOnly;
                inputValue = digitsOnly;
            }
            if (!inputValue) {
                setPhone('');
                setPhoneError('');
                return;
            }
            let countryDialCode = '91';
            if (itiRef.current) {
                const countryData = itiRef.current.getSelectedCountryData();
                countryDialCode = countryData?.dialCode || '91';
            }
            let formattedNumber = '';
            if (digitsOnly.startsWith(countryDialCode)) {
                formattedNumber = `+${digitsOnly}`;
            } else {
                formattedNumber = `+${countryDialCode}${digitsOnly}`;
            }
            setPhone(formattedNumber);
            if (phoneError) {
                setPhoneError('');
            }
            if (digitsOnly.length >= 10) {
                const nationalDigits = digitsOnly.startsWith(countryDialCode)
                    ? digitsOnly.slice(countryDialCode.length)
                    : digitsOnly;
                if (nationalDigits.startsWith('0')) {
                    setPhoneError('Phone number cannot start with 0');
                    return;
                }
                if (nationalDigits.split('').every((d) => d === nationalDigits[0])) {
                    setPhoneError('Phone number cannot have all same digits');
                    return;
                }
                if (countryDialCode === '91' && nationalDigits.length !== 10) {
                    setPhoneError('Indian phone number must be exactly 10 digits');
                    return;
                }
                setPhoneError('');
            }
        }
    };

    const validateEmail = (email: string): boolean => {
        if (!email || !email.trim()) return false;
        const emailRegex =
            /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        if (!emailRegex.test(email)) return false;
        const parts = email.split('@');
        if (parts.length !== 2) return false;
        const [localPart, domain] = parts;
        if (!localPart || localPart.length < 2 || localPart.length > 64) return false;
        if (localPart.includes('..')) return false;
        if (localPart.startsWith('.') || localPart.endsWith('.')) return false;
        if (!domain || domain.length < 2 || domain.length > 255) return false;
        if (domain.includes('..')) return false;
        if (domain.startsWith('.') || domain.endsWith('.') || domain.startsWith('-') || domain.endsWith('-'))
            return false;
        if (!domain.includes('.')) return false;
        const domainParts = domain.split('.');
        const domainName = domainParts.slice(0, -1).join('.');
        const tld = domainParts[domainParts.length - 1];
        if (!domainName || domainName.length < 2) return false;
        if (!tld || tld.length < 2) return false;
        if (!/^[a-zA-Z]+$/.test(tld)) return false;
        return true;
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEmail(value);
        if (value && !validateEmail(value)) {
            setEmailError('Please enter a valid email address');
        } else {
            setEmailError('');
        }
    };

    const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
        const errors: string[] = [];
        if (password.length < 8) errors.push('at least 8 characters');
        if (!/[A-Z]/.test(password)) errors.push('one uppercase letter');
        if (!/[a-z]/.test(password)) errors.push('one lowercase letter');
        if (!/[0-9]/.test(password)) errors.push('one number');
        return { isValid: errors.length === 0, errors };
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPassword(value);
        if (value) {
            const validation = validatePassword(value);
            if (!validation.isValid) {
                setPasswordError(`Password must contain ${validation.errors.join(', ')}`);
            } else {
                setPasswordError('');
            }
        } else {
            setPasswordError('');
        }
        if (confirmPassword && value !== confirmPassword) {
            setConfirmPasswordError('Passwords do not match');
        } else {
            setConfirmPasswordError('');
        }
    };

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setConfirmPassword(value);
        if (value && value !== password) {
            setConfirmPasswordError('Passwords do not match');
        } else {
            setConfirmPasswordError('');
        }
    };

    const handleSubmit = async () => {
        // Validate name
        if (!fullName.trim()) {
            setNameError('Name is required');
            return;
        }
        if (!validateName(fullName)) {
            setNameError('Please enter a valid name (2-50 characters, letters only)');
            return;
        }
        setNameError('');

        // Validate phone
        const inputValue = phoneInputRef.current?.value.trim() || '';
        if (!inputValue) {
            setPhoneError('Phone number is required');
            return;
        }
        const digitsOnly = inputValue.replace(/\D/g, '');
        let currentPhone = phone;
        if (digitsOnly.length >= 10) {
            let countryDialCode = '91';
            if (itiRef.current) {
                const countryData = itiRef.current.getSelectedCountryData();
                countryDialCode = countryData?.dialCode || '91';
            }
            if (digitsOnly.startsWith(countryDialCode)) {
                currentPhone = `+${digitsOnly}`;
            } else {
                currentPhone = `+${countryDialCode}${digitsOnly}`;
            }
            setPhone(currentPhone);
        } else {
            setPhoneError('Please enter a valid phone number');
            return;
        }
        if (!currentPhone.trim()) {
            setPhoneError('Phone number is required');
            return;
        }
        if (!validatePhone(currentPhone)) {
            if (itiRef.current) {
                if (!itiRef.current.isValidNumber()) {
                    const errorCode = itiRef.current.getValidationError();
                    setPhoneError(getPhoneErrorMessage(errorCode));
                    return;
                }
                if (validatePhoneStartsWithZero(currentPhone)) {
                    setPhoneError('Phone number cannot start with 0');
                    return;
                }
                if (validateAllDigitsSame(currentPhone)) {
                    setPhoneError('Phone number cannot have all same digits');
                    return;
                }
                const countryCode = itiRef.current.getSelectedCountryData().iso2;
                if (countryCode === 'in' && !validateIndiaPhoneLength(currentPhone)) {
                    setPhoneError('Indian phone number must be exactly 10 digits');
                    return;
                }
            }
            setPhoneError('Please enter a valid phone number');
            return;
        }
        setPhoneError('');

        // Validate email
        if (!email.trim()) {
            setEmailError('Email is required');
            return;
        }
        if (!validateEmail(email)) {
            setEmailError('Please enter a valid email address');
            return;
        }
        setEmailError('');

        // Validate password
        if (!password) {
            setPasswordError('Password is required');
            return;
        }
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            setPasswordError(`Password must contain ${passwordValidation.errors.join(', ')}`);
            return;
        }
        setPasswordError('');

        // Validate confirm password
        if (!confirmPassword) {
            setConfirmPasswordError('Please confirm your password');
            return;
        }
        if (password !== confirmPassword) {
            setConfirmPasswordError('Passwords do not match');
            return;
        }
        setConfirmPasswordError('');

        setIsLoading(true);
        try {
            const utmParams = getUTMParams();
            const utmSource = mapUTMToSource(utmParams);
            let finalPhoneNumber = phone;
            if (itiRef.current) {
                const numberFromInput = itiRef.current.getNumber();
                if (numberFromInput) {
                    finalPhoneNumber = numberFromInput;
                }
            }

            const response = await apiClient.registerUnified({
                fullName: fullName.trim(),
                phoneNumber: finalPhoneNumber,
                email: email.trim().toLowerCase(),
                password: password,
                role: role,
                source: source || utmSource,
                designation: role === 'hr' ? designation.trim() || undefined : undefined,
                utmData: utmParams,
            });

            if (response.success) {
                toast({
                    title: 'Verification Code Sent',
                    description: `We've sent a verification code via ${response.data.verificationType}.`,
                });

                sessionStorage.setItem(
                    'unified_verification_data',
                    JSON.stringify({
                        leadId: response.data.leadId,
                        verificationType: response.data.verificationType,
                        maskedContact: response.data.maskedContact,
                        tempToken: response.data.tempToken,
                        fullName: fullName.trim(),
                        phoneNumber: phone,
                        email: email.trim().toLowerCase(),
                        password: password,
                        role: role,
                        source: source || utmSource,
                        designation: role === 'hr' ? designation.trim() || undefined : undefined,
                        utmData: utmParams,
                        timestamp: Date.now(),
                    }),
                );

                if (onSuccess) {
                    onSuccess();
                } else {
                    navigate('/auth/verify-unified');
                }
            }
        } catch (error) {
            if (error && typeof error === 'object' && 'status' in error) {
                const apiError = error as { status: number; detail?: string };
                if (apiError.status === 409) {
                    toast({
                        title: 'Account Already Exists',
                        description:
                            'An account with this email or phone number already exists. Please sign in instead.',
                        variant: 'destructive',
                    });
                    return;
                }
            }
            toast({
                title: 'Signup Failed',
                description: (error as Error).message || 'Failed to send verification code. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Determine form field IDs based on variant
    const getFieldId = (fieldName: string) => {
        return variant === 'inline' ? `${fieldName}Inline` : fieldName;
    };

    // Render header based on variant
    const renderHeader = () => {
        if (variant === 'inline') {
            return null; // Inline variant doesn't show header
        }

        const dotColorClass = config.headerColor === 'purple' ? 'bg-purple-500' : 'bg-blue-500';
        const textColorClass = config.headerColor === 'purple' ? 'text-purple-500' : 'text-blue-500';

        return (
            <div className='text-center mb-8'>
                <div className='flex items-center justify-center space-x-1 mb-4'>
                    <div className={`w-4 h-4 ${dotColorClass} rounded-full`}></div>
                    <span className={`text-sm ${textColorClass}`}>{config.headerTitle}</span>
                </div>
                <p className='text-gray-600'>{config.headerSubtitle}</p>
            </div>
        );
    };

    return (
        <div className={className}>
            {renderHeader()}
            <form
                className='space-y-4 sm:space-y-5'
                data-gtm-form={config.formId}
                data-gtm-cta-funnel={config.funnel}
                data-gtm-cta-step='1'
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                }}
            >
                <div className='space-y-2'>
                    <Label htmlFor={getFieldId('fullName')} className='text-gray-700 font-medium text-sm sm:text-base'>
                        Name*
                    </Label>
                    <Input
                        id={getFieldId('fullName')}
                        type='text'
                        placeholder='Enter your full name'
                        value={fullName}
                        onChange={handleNameChange}
                        onBlur={() => {
                            if (!fullName.trim()) {
                                setNameError('Name is required');
                            } else if (!validateName(fullName)) {
                                setNameError('Please enter a valid name (2-50 characters, letters only)');
                            }
                        }}
                        required
                        className={`h-10 sm:h-11 ${nameError ? 'border-red-500 focus:border-red-500' : ''}`}
                        data-gtm-element={`${config.elementPrefix}_name_input`}
                    />
                    {nameError && <p className='text-xs sm:text-sm text-red-500'>{nameError}</p>}
                </div>

                <div className='space-y-2'>
                    <Label
                        htmlFor={getFieldId('phone')}
                        className='block text-gray-700 font-medium text-sm sm:text-base'
                    >
                        Phone number*
                    </Label>
                    <div className='w-full'>
                        <Input
                            ref={phoneInputRef}
                            id={getFieldId('phone')}
                            type='tel'
                            inputMode='numeric'
                            placeholder='Enter your phone number'
                            onKeyDown={handlePhoneKeyDown}
                            onChange={handlePhoneChange}
                            onBlur={() => {
                                const inputValue = phoneInputRef.current?.value.trim() || '';
                                if (!inputValue) {
                                    setPhoneError('Phone number is required');
                                    return;
                                }
                                const digitsOnly = inputValue.replace(/\D/g, '');
                                if (digitsOnly.length < 10) {
                                    setPhoneError('Please enter a valid phone number');
                                    return;
                                }
                                let countryDialCode = '91';
                                if (itiRef.current) {
                                    const countryData = itiRef.current.getSelectedCountryData();
                                    countryDialCode = countryData?.dialCode || '91';
                                }
                                const nationalDigits = digitsOnly.startsWith(countryDialCode)
                                    ? digitsOnly.slice(countryDialCode.length)
                                    : digitsOnly;
                                const formattedNumber = digitsOnly.startsWith(countryDialCode)
                                    ? `+${digitsOnly}`
                                    : `+${countryDialCode}${digitsOnly}`;
                                setPhone(formattedNumber);
                                if (nationalDigits.startsWith('0')) {
                                    setPhoneError('Phone number cannot start with 0');
                                    return;
                                }
                                if (nationalDigits.split('').every((d) => d === nationalDigits[0])) {
                                    setPhoneError('Phone number cannot have all same digits');
                                    return;
                                }
                                if (countryDialCode === '91' && nationalDigits.length !== 10) {
                                    setPhoneError('Indian phone number must be exactly 10 digits');
                                    return;
                                }
                                setPhoneError('');
                            }}
                            required
                            className={`h-10 sm:h-11 ${phoneError ? 'border-red-500 focus:border-red-500' : ''}`}
                            data-gtm-element={`${config.elementPrefix}_phone_input`}
                        />
                    </div>
                    {phoneError && <p className='text-xs sm:text-sm text-red-500'>{phoneError}</p>}
                </div>

                <div className='space-y-2'>
                    <Label htmlFor={getFieldId('email')} className='text-gray-700 font-medium text-sm sm:text-base'>
                        Email*
                    </Label>
                    <Input
                        id={getFieldId('email')}
                        type='email'
                        placeholder={role === 'hr' ? 'jane@company.com' : 'john@example.com'}
                        value={email}
                        onChange={handleEmailChange}
                        onBlur={() => {
                            if (!email.trim()) {
                                setEmailError('Email is required');
                            } else if (!validateEmail(email)) {
                                setEmailError('Please enter a valid email address');
                            }
                        }}
                        required
                        className={`h-10 sm:h-11 ${emailError ? 'border-red-500 focus:border-red-500' : ''}`}
                        data-gtm-element={`${config.elementPrefix}_email_input`}
                    />
                    {emailError && <p className='text-xs sm:text-sm text-red-500'>{emailError}</p>}
                </div>

                {role === 'hr' && (
                    <div className='space-y-2'>
                        <Label
                            htmlFor={getFieldId('designation')}
                            className='text-gray-700 font-medium text-sm sm:text-base'
                        >
                            Designation (Optional)
                        </Label>
                        <Input
                            id={getFieldId('designation')}
                            type='text'
                            placeholder='e.g., HR Manager, Recruiter'
                            value={designation}
                            onChange={(e) => setDesignation(e.target.value)}
                            maxLength={100}
                            className='h-10 sm:h-11'
                            data-gtm-element={`${config.elementPrefix}_designation_input`}
                        />
                        <p className='text-xs text-gray-500'>Help us understand your role</p>
                    </div>
                )}

                <div className='space-y-2'>
                    <Label htmlFor={getFieldId('password')} className='text-gray-700 font-medium text-sm sm:text-base'>
                        Password*
                    </Label>
                    <div className='relative'>
                        <Input
                            id={getFieldId('password')}
                            type={showPassword ? 'text' : 'password'}
                            placeholder='••••••••'
                            value={password}
                            onChange={handlePasswordChange}
                            onBlur={() => {
                                if (!password) {
                                    setPasswordError('Password is required');
                                }
                            }}
                            required
                            className={`h-10 sm:h-11 pr-10 ${
                                passwordError ? 'border-red-500 focus:border-red-500' : ''
                            }`}
                            data-gtm-element={`${config.elementPrefix}_password_input`}
                        />
                        <button
                            type='button'
                            onClick={() => setShowPassword(!showPassword)}
                            className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700'
                            tabIndex={-1}
                        >
                            {showPassword ? (
                                <EyeOff size={18} className='sm:w-5 sm:h-5' />
                            ) : (
                                <Eye size={18} className='sm:w-5 sm:h-5' />
                            )}
                        </button>
                    </div>
                    {passwordError && <p className='text-xs sm:text-sm text-red-500'>{passwordError}</p>}
                    {password && !passwordError && (
                        <p className='text-xs text-green-600'>✓ Password meets requirements</p>
                    )}
                </div>

                <div className='space-y-2'>
                    <Label
                        htmlFor={getFieldId('confirmPassword')}
                        className='text-gray-700 font-medium text-sm sm:text-base'
                    >
                        Confirm Password*
                    </Label>
                    <div className='relative'>
                        <Input
                            id={getFieldId('confirmPassword')}
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder='••••••••'
                            value={confirmPassword}
                            onChange={handleConfirmPasswordChange}
                            onBlur={() => {
                                if (!confirmPassword) {
                                    setConfirmPasswordError('Please confirm your password');
                                }
                            }}
                            required
                            className={`h-10 sm:h-11 pr-10 ${
                                confirmPasswordError ? 'border-red-500 focus:border-red-500' : ''
                            }`}
                            data-gtm-element={`${config.elementPrefix}_confirm_password_input`}
                        />
                        <button
                            type='button'
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700'
                            tabIndex={-1}
                        >
                            {showConfirmPassword ? (
                                <EyeOff size={18} className='sm:w-5 sm:h-5' />
                            ) : (
                                <Eye size={18} className='sm:w-5 sm:h-5' />
                            )}
                        </button>
                    </div>
                    {confirmPasswordError && <p className='text-xs sm:text-sm text-red-500'>{confirmPasswordError}</p>}
                    {confirmPassword && password === confirmPassword && (
                        <p className='text-xs text-green-600'>✓ Passwords match</p>
                    )}
                </div>

                <div className='space-y-2'>
                    <Label htmlFor={getFieldId('source')} className='text-gray-700 font-medium text-sm sm:text-base'>
                        How did you hear about us? (Optional)
                    </Label>
                    <Select value={source || undefined} onValueChange={setSource}>
                        <SelectTrigger
                            id={getFieldId('source')}
                            className='w-full h-10 sm:h-11'
                            data-gtm-element={`${config.elementPrefix}_source_select`}
                        >
                            <SelectValue placeholder='Select how you heard about us' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='Email'>Email</SelectItem>
                            <SelectItem value='WhatsApp'>WhatsApp</SelectItem>
                            <SelectItem value='Telegram'>Telegram</SelectItem>
                            <SelectItem value='Instagram'>Instagram</SelectItem>
                            <SelectItem value='Facebook'>Facebook</SelectItem>
                            <SelectItem value='Journals'>Journals</SelectItem>
                            <SelectItem value='Posters'>Posters</SelectItem>
                            <SelectItem value='Brochures'>Brochures</SelectItem>
                            <SelectItem value='Forums'>Forums</SelectItem>
                            <SelectItem value='Google'>Google</SelectItem>
                            <SelectItem value='Conversational AI (GPT, Gemini etc)'>
                                Conversational AI (GPT, Gemini etc)
                            </SelectItem>
                            <SelectItem value='Referral'>Referral</SelectItem>
                            <SelectItem value='Direct'>Direct</SelectItem>
                            <SelectItem value='Other'>Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Button
                    type='submit'
                    disabled={
                        isLoading ||
                        !fullName.trim() ||
                        !validateName(fullName) ||
                        !phone.trim() ||
                        !validatePhone(phone) ||
                        !email.trim() ||
                        !validateEmail(email) ||
                        !password ||
                        !validatePassword(password).isValid ||
                        !confirmPassword ||
                        password !== confirmPassword
                    }
                    className='w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-5 sm:py-6 text-base sm:text-lg font-semibold hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300'
                    data-gtm-cta={config.ctaId}
                    data-gtm-cta-text={config.ctaText}
                    data-gtm-cta-position='signup_page'
                    data-gtm-cta-funnel={config.funnel}
                    data-gtm-cta-step='1'
                >
                    {isLoading ? 'Creating Account...' : config.buttonText}
                </Button>
            </form>
        </div>
    );
};

export default UnifiedSignupForm;
