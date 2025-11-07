import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff } from "lucide-react";
import logoColor from "@/assets/logo-color.png";
import heroBackground from "@/assets/Hero-background.jpeg";
import { apiClient } from "@/services/api";
import { getUTMParams, mapUTMToSource } from "@/utils/utmTracking";
import intlTelInput from "intl-tel-input";
import "intl-tel-input/build/css/intlTelInput.css";

const ForJobSeekersSignup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const itiRef = useRef<ReturnType<typeof intlTelInput> | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [source, setSource] = useState("");

  const [phoneError, setPhoneError] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize intl-tel-input
  useEffect(() => {
    const currentInput = phoneInputRef.current;
    if (currentInput && !itiRef.current) {
      itiRef.current = intlTelInput(currentInput, {
        initialCountry: "in",
        // @ts-expect-error - utilsScript is a valid option but types may be incomplete
        utilsScript:
          "https://cdn.jsdelivr.net/npm/intl-tel-input@19.5.6/build/js/utils.js",
      });

      // Ensure the intl-tel-input wrapper is block-level
      setTimeout(() => {
        const itiWrapper = currentInput.closest(".iti");
        if (itiWrapper) {
          (itiWrapper as HTMLElement).style.display = "block";
          (itiWrapper as HTMLElement).style.width = "100%";
        }
      }, 0);

      // Handle phone number change
      const handleCountryChange = () => {
        if (currentInput && itiRef.current) {
          const number = itiRef.current.getNumber();
          if (number) {
            setPhone(number);
            setPhoneError("");
          }
        }
      };

      // Note: onChange handler on Input component will call handlePhoneChange
      // No need for separate input event listener

      currentInput.addEventListener("countrychange", handleCountryChange);

      return () => {
        if (currentInput) {
          currentInput.removeEventListener(
            "countrychange",
            handleCountryChange
          );
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
    // Name should contain only letters, spaces, hyphens, and apostrophes
    // Should be at least 2 characters and at most 50 characters
    const nameRegex = /^[a-zA-Z\s'-]{2,50}$/;
    return nameRegex.test(name.trim());
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Only allow letters, spaces, hyphens, and apostrophes
    // Filter out numbers and other special characters
    const filtered = value.replace(/[^a-zA-Z\s'-]/g, "");

    setFullName(filtered);

    // Clear error when user starts typing
    if (nameError) {
      setNameError("");
    }
  };

  const getPhoneErrorMessage = (errorCode: number): string => {
    // Error codes from libphonenumber validation
    switch (errorCode) {
      case 0: // INVALID_COUNTRY_CODE
        return "Please select a valid country";
      case 1: // TOO_SHORT
        return "Phone number is too short for this country";
      case 2: // TOO_LONG
        return "Phone number is too long for this country";
      case 3: // INVALID_LENGTH
        return "Phone number length is invalid for this country";
      default:
        return "Please enter a valid phone number";
    }
  };

  // Helper function to get national number (digits without country code)
  const getNationalDigits = (phoneNumber: string): string => {
    if (!phoneNumber || !itiRef.current) return "";

    // Extract all digits from E.164 format
    const allDigits = phoneNumber.replace(/\D/g, "");

    // Get country code from selected country
    const countryData = itiRef.current.getSelectedCountryData();
    const countryDialCode = countryData.dialCode || "";

    // Remove country code from the beginning
    if (allDigits.startsWith(countryDialCode)) {
      return allDigits.slice(countryDialCode.length);
    }

    // Fallback: if starts with +91, remove 91
    if (phoneNumber.startsWith("+91")) {
      return allDigits.slice(2);
    }

    return allDigits;
  };

  // Custom validation: Check if phone number starts with 0
  const validatePhoneStartsWithZero = (phoneNumber: string): boolean => {
    const nationalDigits = getNationalDigits(phoneNumber);
    return nationalDigits.startsWith("0");
  };

  // Custom validation: Check if all digits are the same
  const validateAllDigitsSame = (phoneNumber: string): boolean => {
    const nationalDigits = getNationalDigits(phoneNumber);
    if (nationalDigits.length === 0) return false;
    const firstDigit = nationalDigits[0];
    return nationalDigits.split("").every((digit) => digit === firstDigit);
  };

  // Custom validation: For India (+91), ensure exactly 10 digits
  const validateIndiaPhoneLength = (phoneNumber: string): boolean => {
    if (!phoneNumber || !itiRef.current) return false;
    const countryCode = itiRef.current.getSelectedCountryData().iso2;
    if (countryCode === "in") {
      const nationalDigits = getNationalDigits(phoneNumber);
      return nationalDigits.length === 10;
    }
    return true; // Not India, so this validation doesn't apply
  };

  const validatePhone = (phoneNumber: string): boolean => {
    if (!phoneNumber || !phoneNumber.trim()) return false;

    // If intl-tel-input is available, use its validation
    if (itiRef.current) {
      // Check if the number is valid according to intl-tel-input
      const isValid = itiRef.current.isValidNumber();

      // If intl-tel-input says it's invalid, but we have a manually constructed number,
      // do basic format check for India
      if (!isValid && phoneNumber.startsWith("+91")) {
        const digitsOnly = phoneNumber.replace(/\D/g, "");
        const nationalDigits = digitsOnly.slice(2); // Remove "91"

        // Basic validation for Indian numbers
        if (nationalDigits.length === 10 && /^[6-9]/.test(nationalDigits)) {
          // Check custom validations
          if (nationalDigits.startsWith("0")) return false;
          if (nationalDigits.split("").every((d) => d === nationalDigits[0]))
            return false;
          return true; // Basic format is valid
        }
        return false;
      }

      if (!isValid) {
        return false;
      }
    } else {
      // Fallback: basic validation if intl-tel-input is not available
      if (phoneNumber.startsWith("+91")) {
        const digitsOnly = phoneNumber.replace(/\D/g, "");
        const nationalDigits = digitsOnly.slice(2);
        if (nationalDigits.length !== 10 || !/^[6-9]/.test(nationalDigits)) {
          return false;
        }
      }
    }

    // Custom validations
    if (validatePhoneStartsWithZero(phoneNumber)) {
      return false;
    }

    if (validateAllDigitsSame(phoneNumber)) {
      return false;
    }

    if (!validateIndiaPhoneLength(phoneNumber)) {
      return false;
    }

    return true;
  };

  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter, and arrow keys
    if (
      [
        "Backspace",
        "Delete",
        "Tab",
        "Escape",
        "Enter",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
      ].includes(e.key)
    ) {
      return;
    }

    // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z
    if (
      (e.ctrlKey || e.metaKey) &&
      ["a", "c", "v", "x", "z"].includes(e.key.toLowerCase())
    ) {
      return;
    }

    // Allow: digits (0-9), plus (+), space, and hyphen (-)
    // These are needed for intl-tel-input formatting
    if (/^[0-9+\s-]$/.test(e.key)) {
      return;
    }

    // Block everything else (letters and other special characters)
    e.preventDefault();
  };

  const handlePhoneChange = () => {
    if (phoneInputRef.current) {
      // Get the actual input value directly
      let inputValue = phoneInputRef.current.value.trim();

      // Remove all non-digit characters immediately
      const digitsOnly = inputValue.replace(/\D/g, "");

      // Update the input field to show only digits
      if (inputValue !== digitsOnly) {
        phoneInputRef.current.value = digitsOnly;
        inputValue = digitsOnly;
      }

      if (!inputValue) {
        setPhone("");
        setPhoneError("");
        return;
      }

      // Get country code from intl-tel-input if available, otherwise default to India
      let countryDialCode = "91";
      if (itiRef.current) {
        const countryData = itiRef.current.getSelectedCountryData();
        countryDialCode = countryData?.dialCode || "91";
      }

      // Construct E.164 format
      let formattedNumber = "";
      if (digitsOnly.startsWith(countryDialCode)) {
        formattedNumber = `+${digitsOnly}`;
      } else {
        formattedNumber = `+${countryDialCode}${digitsOnly}`;
      }

      // Update phone state
      setPhone(formattedNumber);

      // Clear error when user starts typing
      if (phoneError) {
        setPhoneError("");
      }

      // Validate as user types
      if (digitsOnly.length >= 10) {
        // Get national digits (without country code)
        const nationalDigits = digitsOnly.startsWith(countryDialCode)
          ? digitsOnly.slice(countryDialCode.length)
          : digitsOnly;

        // Check custom validations
        if (nationalDigits.startsWith("0")) {
          setPhoneError("Phone number cannot start with 0");
          return;
        }

        if (nationalDigits.split("").every((d) => d === nationalDigits[0])) {
          setPhoneError("Phone number cannot have all same digits");
          return;
        }

        // For India, check length
        if (countryDialCode === "91" && nationalDigits.length !== 10) {
          setPhoneError("Indian phone number must be exactly 10 digits");
          return;
        }

        // All validations passed
        setPhoneError("");
      }
    }
  };

  const validateEmail = (email: string): boolean => {
    if (!email || !email.trim()) return false;

    // More robust email validation regex
    // This follows RFC 5322 specification more closely
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    // Basic structure check
    if (!emailRegex.test(email)) {
      return false;
    }

    // Additional checks
    const parts = email.split("@");
    if (parts.length !== 2) {
      return false;
    }

    const [localPart, domain] = parts;

    // Local part validation - must be at least 2 characters
    if (!localPart || localPart.length < 2 || localPart.length > 64) {
      return false;
    }

    // Check for consecutive dots in local part
    if (localPart.includes("..")) {
      return false;
    }

    // Local part cannot start or end with dot
    if (localPart.startsWith(".") || localPart.endsWith(".")) {
      return false;
    }

    // Domain validation - must be at least 2 characters before TLD
    if (!domain || domain.length < 2 || domain.length > 255) {
      return false;
    }

    // Check for consecutive dots in domain
    if (domain.includes("..")) {
      return false;
    }

    // Domain cannot start or end with dot or hyphen
    if (
      domain.startsWith(".") ||
      domain.endsWith(".") ||
      domain.startsWith("-") ||
      domain.endsWith("-")
    ) {
      return false;
    }

    // Must have at least one dot in domain (for TLD)
    if (!domain.includes(".")) {
      return false;
    }

    // Split domain to check parts before TLD
    const domainParts = domain.split(".");
    const domainName = domainParts.slice(0, -1).join("."); // Everything before TLD
    const tld = domainParts[domainParts.length - 1];

    // Domain name (before TLD) must be at least 2 characters
    if (!domainName || domainName.length < 2) {
      return false;
    }

    // TLD (top-level domain) should be at least 2 characters
    if (!tld || tld.length < 2) {
      return false;
    }

    // TLD should only contain letters
    if (!/^[a-zA-Z]+$/.test(tld)) {
      return false;
    }

    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    if (value && !validateEmail(value)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const validatePassword = (
    password: string
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("at least 8 characters");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("one uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("one lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("one number");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);

    if (value) {
      const validation = validatePassword(value);
      if (!validation.isValid) {
        setPasswordError(
          `Password must contain ${validation.errors.join(", ")}`
        );
      } else {
        setPasswordError("");
      }
    } else {
      setPasswordError("");
    }

    // Check confirm password match
    if (confirmPassword && value !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError("");
    }
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setConfirmPassword(value);

    if (value && value !== password) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError("");
    }
  };

  const handleContinue = async () => {
    // Validate name
    if (!fullName.trim()) {
      setNameError("Name is required");
      return;
    }

    if (!validateName(fullName)) {
      setNameError("Please enter a valid name (2-50 characters, letters only)");
      return;
    }

    setNameError("");

    // Validate phone - get the current number from input field
    const inputValue = phoneInputRef.current?.value.trim() || "";

    if (!inputValue) {
      setPhoneError("Phone number is required");
      return;
    }

    // Extract digits and construct E.164 format
    const digitsOnly = inputValue.replace(/\D/g, "");
    let currentPhone = phone;

    if (digitsOnly.length >= 10) {
      // Get country code from intl-tel-input if available
      let countryDialCode = "91";
      if (itiRef.current) {
        const countryData = itiRef.current.getSelectedCountryData();
        countryDialCode = countryData?.dialCode || "91";
      }

      // Construct E.164 format
      if (digitsOnly.startsWith(countryDialCode)) {
        currentPhone = `+${digitsOnly}`;
      } else {
        currentPhone = `+${countryDialCode}${digitsOnly}`;
      }
      setPhone(currentPhone);
    } else {
      setPhoneError("Please enter a valid phone number");
      return;
    }

    if (!currentPhone.trim()) {
      setPhoneError("Phone number is required");
      return;
    }

    if (!validatePhone(currentPhone)) {
      if (itiRef.current) {
        // Check basic intl-tel-input validation first
        if (!itiRef.current.isValidNumber()) {
          const errorCode = itiRef.current.getValidationError();
          setPhoneError(getPhoneErrorMessage(errorCode));
          return;
        }

        // Check custom validations
        if (validatePhoneStartsWithZero(currentPhone)) {
          setPhoneError("Phone number cannot start with 0");
          return;
        }

        if (validateAllDigitsSame(currentPhone)) {
          setPhoneError("Phone number cannot have all same digits");
          return;
        }

        const countryCode = itiRef.current.getSelectedCountryData().iso2;
        if (countryCode === "in" && !validateIndiaPhoneLength(currentPhone)) {
          setPhoneError("Indian phone number must be exactly 10 digits");
          return;
        }
      }
      setPhoneError("Please enter a valid phone number");
      return;
    }

    setPhoneError("");

    // Validate email
    if (!email.trim()) {
      setEmailError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setEmailError("");

    // Validate password
    if (!password) {
      setPasswordError("Password is required");
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setPasswordError(
        `Password must contain ${passwordValidation.errors.join(", ")}`
      );
      return;
    }

    setPasswordError("");

    // Validate confirm password
    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your password");
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      return;
    }

    setConfirmPasswordError("");

    // Start unified registration
    setIsLoading(true);
    try {
      // Get UTM parameters
      const utmParams = getUTMParams();
      const utmSource = mapUTMToSource(utmParams);

      // Get the final phone number from intl-tel-input to ensure it's in E.164 format
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
        role: "candidate",
        source: source || utmSource,
        utmData: utmParams,
      });

      if (response.success) {
        toast({
          title: "Verification Code Sent",
          description: `We've sent a verification code via ${response.data.verificationType}.`,
        });

        // Store data securely in sessionStorage
        sessionStorage.setItem(
          "unified_verification_data",
          JSON.stringify({
            leadId: response.data.leadId,
            verificationType: response.data.verificationType,
            maskedContact: response.data.maskedContact,
            tempToken: response.data.tempToken,
            fullName: fullName.trim(),
            phoneNumber: phone,
            email: email.trim().toLowerCase(),
            password: password, // Store for resend functionality
            role: "candidate",
            source: source || utmSource,
            utmData: utmParams,
            timestamp: Date.now(),
          })
        );

        // Navigate to unified OTP verification page
        navigate("/auth/verify-unified");
      }
    } catch (error) {
      // Handle specific error cases
      if (error && typeof error === "object" && "status" in error) {
        const apiError = error as { status: number; detail?: string };

        if (apiError.status === 409) {
          toast({
            title: "Account Already Exists",
            description:
              "An account with this email or phone number already exists. Please sign in instead.",
            variant: "destructive",
          });
          return;
        }
      }

      toast({
        title: "Signup Failed",
        description:
          (error as Error).message ||
          "Failed to send verification code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="h-screen relative overflow-hidden flex"
      style={{
        backgroundImage: `url(${heroBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Enhanced gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/70 to-black/40"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-transparent to-transparent"></div>

      {/* Mobile Header - Logo */}
      <div className="lg:hidden absolute top-0 left-0 right-0 z-20 p-4">
        <div
          className="flex items-center gap-3 cursor-pointer hover:opacity-80"
          onClick={() => navigate("/")}
        >
          <img
            src={logoColor}
            alt="HireAccel Logo"
            className="w-10 h-10 sm:w-12 sm:h-12"
          />
          <div>
            <h1 className="font-bold text-white text-lg sm:text-xl">
              Hire Accel
            </h1>
            <p className="text-xs text-white/80 font-medium">
              powered by v-accel
            </p>
          </div>
        </div>
      </div>

      {/* Left Side - Content */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 overflow-hidden">
        {/* Content container with proper spacing */}
        <div className="relative z-10 flex flex-col h-full w-full">
          {/* Header with logo and text */}
          <div
            className="flex-shrink-0 p-8 cursor-pointer hover:opacity-80"
            onClick={() => navigate("/")}
            style={{ cursor: "pointer", transition: "opacity 0.3s ease" }}
          >
            <div
              className="flex items-center gap-3 animate-fade-in"
              style={{
                animationDelay: "0.3s",
                animationDuration: "1.5s",
                animationTimingFunction: "ease-in-out",
              }}
            >
              <img
                src={logoColor}
                alt="HireAccel Logo"
                className="w-12 h-12 hover:scale-110"
                style={{ transition: "transform 0.5s ease-in-out" }}
              />
              <div>
                <h1 className="font-bold text-white text-xl">Hire Accel</h1>
                <p className="text-xs text-white/80 font-medium">
                  powered by v-accel
                </p>
              </div>
            </div>
          </div>

          {/* Central content section */}
          <div className="flex-1 flex flex-col justify-center items-center px-8">
            <div className="mb-8 text-center">
              <h1
                className="max-w-xl text-2xl sm:text-3xl lg:text-3xl xl:text-4xl font-extrabold tracking-tight text-white animate-slide-up mx-auto px-4"
                style={{
                  animationDelay: "0.6s",
                  animationDuration: "1.5s",
                  animationTimingFunction: "ease-in-out",
                }}
              >
                Get started as a{" "}
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Job Seeker
                </span>
              </h1>
              <p
                className="mt-4 max-w-xl text-xs sm:text-sm leading-6 text-white/80 mb-6 animate-slide-up mx-auto px-4"
                style={{
                  animationDelay: "1s",
                  animationDuration: "1.5s",
                  animationTimingFunction: "ease-in-out",
                }}
              >
                Share your contact details and continue to complete your
                Candidate signup. Join hundreds of job seekers finding their
                dream jobs.
              </p>

              {/* Stats section as badges */}
              <div className="flex flex-wrap gap-2 justify-center px-4">
                <div
                  className="bg-blue-500/80 backdrop-blur-md rounded-full px-3 py-1.5 sm:px-4 sm:py-2 border border-blue-400/50 shadow-lg hover:scale-105 hover:shadow-xl animate-slide-in-left"
                  style={{
                    animationDelay: "1.4s",
                    animationDuration: "1.2s",
                    animationTimingFunction: "ease-in-out",
                    transition: "all 0.5s ease-in-out",
                  }}
                >
                  <div className="text-sm sm:text-base font-bold text-white">
                    5000+{" "}
                    <span className="text-xs font-medium text-white/90">
                      Active Users
                    </span>
                  </div>
                </div>
                <div
                  className="bg-purple-500/80 backdrop-blur-md rounded-full px-3 py-1.5 sm:px-4 sm:py-2 border border-purple-400/50 shadow-lg hover:scale-105 hover:shadow-xl animate-slide-in-left"
                  style={{
                    animationDelay: "1.6s",
                    animationDuration: "1.2s",
                    animationTimingFunction: "ease-in-out",
                    transition: "all 0.5s ease-in-out",
                  }}
                >
                  <div className="text-sm sm:text-base font-bold text-white">
                    200+{" "}
                    <span className="text-xs font-medium text-white/90">
                      Companies
                    </span>
                  </div>
                </div>
                <div
                  className="bg-green-500/80 backdrop-blur-md rounded-full px-3 py-1.5 sm:px-4 sm:py-2 border border-green-400/50 shadow-lg hover:scale-105 hover:shadow-xl animate-slide-in-left"
                  style={{
                    animationDelay: "1.8s",
                    animationDuration: "1.2s",
                    animationTimingFunction: "ease-in-out",
                    transition: "all 0.5s ease-in-out",
                  }}
                >
                  <div className="text-sm sm:text-base font-bold text-white">
                    24/7{" "}
                    <span className="text-xs font-medium text-white/90">
                      Support
                    </span>
                  </div>
                </div>
                <div
                  className="bg-orange-500/80 backdrop-blur-md rounded-full px-3 py-1.5 sm:px-4 sm:py-2 border border-orange-400/50 shadow-lg hover:scale-105 hover:shadow-xl animate-slide-in-left"
                  style={{
                    animationDelay: "2s",
                    animationDuration: "1.2s",
                    animationTimingFunction: "ease-in-out",
                    transition: "all 0.5s ease-in-out",
                  }}
                >
                  <div className="text-sm sm:text-base font-bold text-white">
                    98%{" "}
                    <span className="text-xs font-medium text-white/90">
                      Success Rate
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col overflow-y-auto relative z-10">
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 pt-16 sm:pt-20 lg:pt-8">
          <div className="w-full max-w-md">
            <div
              className="bg-white/95 backdrop-blur-xl rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/20 shadow-2xl hover:shadow-3xl"
              style={{ transition: "box-shadow 0.5s ease-in-out" }}
            >
              <div className="text-center mb-8">
                <div className="flex items-center justify-center space-x-1 mb-4">
                  <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-purple-500">
                    Create Account as a Job Seeker
                  </span>
                </div>
                <p className="text-gray-600">
                  Join our platform and start your job search journey
                </p>
              </div>

              <form
                className="space-y-4"
                data-gtm-form="candidate_signup_step1"
                data-gtm-cta-funnel="candidate_signup"
                data-gtm-cta-step="1"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleContinue();
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="fullName">Name*</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={handleNameChange}
                    onBlur={() => {
                      if (!fullName.trim()) {
                        setNameError("Name is required");
                      } else if (!validateName(fullName)) {
                        setNameError(
                          "Please enter a valid name (2-50 characters, letters only)"
                        );
                      }
                    }}
                    required
                    className={
                      nameError ? "border-red-500 focus:border-red-500" : ""
                    }
                    data-gtm-element="candidate_signup_name_input"
                  />
                  {nameError && (
                    <p className="text-sm text-red-500">{nameError}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="block">
                    Phone number*
                  </Label>
                  <div className="w-full">
                    <Input
                      ref={phoneInputRef}
                      id="phone"
                      type="tel"
                      inputMode="numeric"
                      placeholder="Enter your phone number"
                      onKeyDown={handlePhoneKeyDown}
                      onChange={handlePhoneChange}
                      onBlur={() => {
                        const inputValue =
                          phoneInputRef.current?.value.trim() || "";

                        if (!inputValue) {
                          setPhoneError("Phone number is required");
                          return;
                        }

                        // Extract digits and validate
                        const digitsOnly = inputValue.replace(/\D/g, "");

                        if (digitsOnly.length < 10) {
                          setPhoneError("Please enter a valid phone number");
                          return;
                        }

                        // Get country code
                        let countryDialCode = "91";
                        if (itiRef.current) {
                          const countryData =
                            itiRef.current.getSelectedCountryData();
                          countryDialCode = countryData?.dialCode || "91";
                        }

                        // Construct E.164 format
                        const nationalDigits = digitsOnly.startsWith(
                          countryDialCode
                        )
                          ? digitsOnly.slice(countryDialCode.length)
                          : digitsOnly;

                        const formattedNumber = digitsOnly.startsWith(
                          countryDialCode
                        )
                          ? `+${digitsOnly}`
                          : `+${countryDialCode}${digitsOnly}`;

                        setPhone(formattedNumber);

                        // Check custom validations
                        if (nationalDigits.startsWith("0")) {
                          setPhoneError("Phone number cannot start with 0");
                          return;
                        }

                        if (
                          nationalDigits
                            .split("")
                            .every((d) => d === nationalDigits[0])
                        ) {
                          setPhoneError(
                            "Phone number cannot have all same digits"
                          );
                          return;
                        }

                        // For India, check length
                        if (
                          countryDialCode === "91" &&
                          nationalDigits.length !== 10
                        ) {
                          setPhoneError(
                            "Indian phone number must be exactly 10 digits"
                          );
                          return;
                        }

                        // All validations passed
                        setPhoneError("");
                      }}
                      required
                      className={
                        phoneError ? "border-red-500 focus:border-red-500" : ""
                      }
                      data-gtm-element="candidate_signup_phone_input"
                    />
                  </div>
                  {phoneError && (
                    <p className="text-sm text-red-500">{phoneError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email*</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={handleEmailChange}
                    onBlur={() => {
                      if (!email.trim()) {
                        setEmailError("Email is required");
                      } else if (!validateEmail(email)) {
                        setEmailError("Please enter a valid email address");
                      }
                    }}
                    required
                    className={
                      emailError ? "border-red-500 focus:border-red-500" : ""
                    }
                    data-gtm-element="candidate_signup_email_input"
                  />
                  {emailError && (
                    <p className="text-sm text-red-500">{emailError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password*</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={handlePasswordChange}
                      onBlur={() => {
                        if (!password) {
                          setPasswordError("Password is required");
                        }
                      }}
                      required
                      className={
                        passwordError
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }
                      data-gtm-element="candidate_signup_password_input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="text-sm text-red-500">{passwordError}</p>
                  )}
                  {password && !passwordError && (
                    <p className="text-xs text-green-600">
                      ✓ Password meets requirements
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password*</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      onBlur={() => {
                        if (!confirmPassword) {
                          setConfirmPasswordError(
                            "Please confirm your password"
                          );
                        }
                      }}
                      required
                      className={
                        confirmPasswordError
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }
                      data-gtm-element="candidate_signup_confirm_password_input"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                  {confirmPasswordError && (
                    <p className="text-sm text-red-500">
                      {confirmPasswordError}
                    </p>
                  )}
                  {confirmPassword && password === confirmPassword && (
                    <p className="text-xs text-green-600">✓ Passwords match</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="source">
                    How did you hear about us? (Optional)
                  </Label>
                  <Select value={source || undefined} onValueChange={setSource}>
                    <SelectTrigger
                      id="source"
                      className="w-full"
                      data-gtm-element="candidate_signup_source_select"
                    >
                      <SelectValue placeholder="Select how you heard about us" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Email">Email</SelectItem>
                      <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                      <SelectItem value="Telegram">Telegram</SelectItem>
                      <SelectItem value="Instagram">Instagram</SelectItem>
                      <SelectItem value="Facebook">Facebook</SelectItem>
                      <SelectItem value="Journals">Journals</SelectItem>
                      <SelectItem value="Posters">Posters</SelectItem>
                      <SelectItem value="Brochures">Brochures</SelectItem>
                      <SelectItem value="Forums">Forums</SelectItem>
                      <SelectItem value="Google">Google</SelectItem>
                      <SelectItem value="Conversational AI (GPT, Gemini etc)">
                        Conversational AI (GPT, Gemini etc)
                      </SelectItem>
                      <SelectItem value="Referral">Referral</SelectItem>
                      <SelectItem value="Direct">Direct</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
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
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-2 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ transition: "all 0.5s ease-in-out" }}
                  data-gtm-cta="candidate_unified_signup_button"
                  data-gtm-cta-text="Create Job Seeker Account"
                  data-gtm-cta-position="signup_page"
                  data-gtm-cta-funnel="candidate_unified_signup"
                  data-gtm-cta-step="1"
                >
                  {isLoading
                    ? "Creating Account..."
                    : "Create Job Seeker Account →"}
                </Button>
              </form>

              <div className="text-center text-sm text-gray-600 mt-4">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-blue-600 hover:underline"
                >
                  Sign in here
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForJobSeekersSignup;
