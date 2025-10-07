import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, Users, Briefcase, TrendingUp, Shield } from 'lucide-react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { apiClient } from '@/services/api';
import logoColor from '@/assets/logo-color.png';
import heroBackground from '@/assets/Hero-background.jpeg';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  department?: string;
  currentLocation?: string;
  yearsOfExperience?: string;
  source: string;
}

interface SignupPageProps {
  onSwitchToSignin: () => void;
}

export function SignupPage({ onSwitchToSignin }: SignupPageProps): React.JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  // Determine initial user type from route
  const getInitialUserType = (): 'hr' | 'candidate' => {
    if (location.pathname === '/signup/candidate') return 'candidate';
    if (location.pathname === '/signup/hr') return 'hr';
    return 'hr'; // default to hr
  };
  
  const [userType, setUserType] = useState<'hr' | 'candidate'>(getInitialUserType());
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    department: '',
    currentLocation: '',
    yearsOfExperience: '',
    source: ''
  });
  
  // Update user type when route changes
  useEffect(() => {
    const newUserType = getInitialUserType();
    setUserType(newUserType);
  }, [location.pathname]);
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleUserTypeChange = (newUserType: 'hr' | 'candidate') => {
    setUserType(newUserType);
    // Update the URL to match the selected tab
    const newPath = newUserType === 'hr' ? '/signup/hr' : '/signup/candidate';
    navigate(newPath, { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate required fields
    if (!formData.source) {
      toast({
        title: "Validation Error",
        description: "Please select how you heard about us.",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    try {
      // Prepare signup data
      const signupData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: userType,
        source: formData.source,
        ...(userType === 'hr' && { department: formData.department }),
        ...(userType === 'candidate' && { 
          currentLocation: formData.currentLocation,
          yearsOfExperience: formData.yearsOfExperience 
        })
      };

      // Call signup API
      const response = await apiClient.signup(signupData);

      if (!response.success) {
        const errorData = response.data as any;
        throw new Error(errorData.message || 'Signup failed');
      }

      const result = response.data as { requiresOTP?: boolean; email: string; message: string };

      // Check if OTP verification is required
      if (result.requiresOTP) {
        toast({
          title: "Verification Required",
          description: result.message || "Please check your email for the verification code.",
        });

        // Navigate to OTP verification page with email and userType
        navigate('/auth/verify-otp', {
          state: {
            email: signupData.email,
            userType: userType,
          },
          replace: true,
        });
      } else {
        // Fallback: if for some reason OTP is not required, try auto-login
        await login(signupData.email, formData.password);
        
        toast({
          title: 'Account created successfully!',
          description: 'Welcome to Hiring Accelerator. Your account has been created and you are now logged in.',
        });
        
        navigate('/dashboard');
      }
    } catch (error: any) {
      
      // Extract error message from different possible structures
      let errorMessage = "Something went wrong. Please try again.";
      
      if (error?.type === 'network_error') {
        errorMessage = "Server is under maintenance, please try again";
      } else if (error?.detail) {
        errorMessage = error.detail;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.status === 500) {
        errorMessage = "Please try again later";
      }
      
      
      toast({
        title: error?.type === 'network_error' ? "Server Under Maintenance" : "Signup Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const passwordValidation = {
    hasMinLength: formData.password.length >= 8,
    hasUppercase: /[A-Z]/.test(formData.password),
    hasLowercase: /[a-z]/.test(formData.password),
    hasNumber: /\d/.test(formData.password),
    hasSpecialChar: /[^a-zA-Z0-9]/.test(formData.password),
    hasNoSpaces: !/\s/.test(formData.password),
    hasNoRepeated: !/(.)\1{3,}/.test(formData.password),
    hasNoCommon: !/^(password|password123|123456|123456789|qwerty|abc123|password1|admin|letmein|welcome|12345678|monkey|1234567890|dragon|master|baseball|football|basketball|superman|batman|trustno1|hello|welcome123|admin123|root|test|guest|user|demo|temp|temporary)$/i.test(formData.password)
  };


  const isPasswordValid = Object.values(passwordValidation).every(Boolean);
  const isPasswordMatch = formData.password === formData.confirmPassword;
  const isFormValid = isPasswordValid && isPasswordMatch;

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Left Side - Branding */}
      <div 
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{
          backgroundImage: `url(${heroBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Enhanced gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/70 to-black/40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-transparent to-transparent"></div>

        {/* Content container with proper spacing */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Header with logo and text */}
          <div className="flex-shrink-0 p-8 cursor-pointer" onClick={()=>navigate('/')} style={{ cursor: 'pointer' }}>
            <div className="flex items-center gap-3">
              <img 
                src={logoColor} 
                alt="HireAccel Logo" 
                className="w-12 h-12"
              />
              <div>
                <h1 className="font-bold text-white text-xl">Hire Accel</h1>
                <p className="text-xs text-white/80 font-medium">powered by v-accel</p>
              </div>
            </div>
          </div>

          {/* Central content section */}
          <div className="flex-1 flex flex-col justify-center px-8">
            <div className="mb-8">
              <h1 className="max-w-xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Join the <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Future</span> of Recruitment
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-white/80">
                Connect talent with opportunity through our innovative platform designed for modern recruitment needs. Join hundreds of HR professionals transforming their hiring process.
              </p>
            </div>
          </div>

          {/* Floating glassmorphism stats card */}
          <div className="flex-shrink-0 px-8 pb-8 w-full">
            <div className="bg-white/40 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl w-full">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-4 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/20">
                  <div className="text-3xl font-bold text-blue-600 mb-2">5000+</div>
                  <div className="text-sm text-gray-700 font-medium">Active Users</div>
                </div>
                <div className="text-center p-4 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/20">
                  <div className="text-3xl font-bold text-purple-600 mb-2">200+</div>
                  <div className="text-sm text-gray-700 font-medium">Companies</div>
                </div>
                <div className="text-center p-4 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/20">
                  <div className="text-3xl font-bold text-green-600 mb-2">24/7</div>
                  <div className="text-sm text-gray-700 font-medium">Support</div>
                </div>
                <div className="text-center p-4 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/20">
                  <div className="text-3xl font-bold text-orange-600 mb-2">98%</div>
                  <div className="text-sm text-gray-700 font-medium">Success Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-1 mb-4">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-blue-500">Create Account</span>
            </div>
            <p className="text-gray-600">
              Join our platform and start your journey
            </p>
          </div>

          <Card className="border-0 shadow-none">
            <CardContent className="p-0">
              <Tabs value={userType} onValueChange={(value) => handleUserTypeChange(value as 'hr' | 'candidate')}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="hr">HR Professional</TabsTrigger>
                  <TabsTrigger value="candidate">Candidate</TabsTrigger>
                </TabsList>

                {/* HR Professional Tab */}
                <TabsContent value="hr" className="mt-0">
                  <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    {/* Common Fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name*</Label>
                        <Input
                          id="firstName"
                          placeholder="Enter your first name"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          required
                          className="border border-gray-300 focus:border-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name*</Label>
                        <Input
                          id="lastName"
                          placeholder="Enter your last name"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          required
                          className="border border-gray-300 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email*</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@company.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        className="border border-gray-300 focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone*</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="e.g., +91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        required
                        className="border border-gray-300 focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="department">Designation</Label>
                      <Input
                        id="department"
                        placeholder="e.g., HR Manager, Talent Acquisition"
                        value={formData.department}
                        onChange={(e) => handleInputChange('department', e.target.value)}
                        className="border border-gray-300 focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password*</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          required
                          className="border border-gray-300 focus:border-blue-500 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {formData.password && (
                        <div className="text-xs text-gray-600 mt-2">
                          {isPasswordValid ? (
                            <div className="text-green-600">
                              ✓ Password meets all security requirements
                            </div>
                          ) : (
                            <div>
                              <div className="text-red-500 mb-1">Password requirements:</div>
                              <div className="mt-1 space-y-1">
                                {!passwordValidation.hasMinLength && (
                                  <div className="text-red-500">• At least 8 characters</div>
                                )}
                                {!passwordValidation.hasUppercase && (
                                  <div className="text-red-500">• Uppercase letter</div>
                                )}
                                {!passwordValidation.hasLowercase && (
                                  <div className="text-red-500">• Lowercase letter</div>
                                )}
                                {!passwordValidation.hasNumber && (
                                  <div className="text-red-500">• Number</div>
                                )}
                                {!passwordValidation.hasSpecialChar && (
                                  <div className="text-red-500">• Special character (!@#$%^&*)</div>
                                )}
                                {!passwordValidation.hasNoSpaces && (
                                  <div className="text-red-500">• No spaces</div>
                                )}
                                {!passwordValidation.hasNoRepeated && (
                                  <div className="text-red-500">• No repeated characters (aaaa)</div>
                                )}
                                {!passwordValidation.hasNoCommon && (
                                  <div className="text-red-500">• Not a common password</div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password*</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          required
                          className="border border-gray-300 focus:border-blue-500 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {formData.confirmPassword && (
                        <div className="text-xs mt-2">
                          {isPasswordMatch ? (
                            <div className="text-green-600">
                              ✓ Passwords match
                            </div>
                          ) : (
                            <div className="text-red-500">
                              • Passwords do not match
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="source">How did you hear about us?*</Label>
                      <Select
                        value={formData.source}
                        onValueChange={(value) => handleInputChange('source', value)}
                      >
                        <SelectTrigger className="border border-gray-300 focus:border-blue-500">
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
                          <SelectItem value="Conversational AI (GPT, Gemini etc)">Conversational AI (GPT, Gemini etc)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-6"
                      disabled={!isFormValid || loading}
                    >
                      {loading ? 'Creating Account...' : 'Create Account →'}
                    </Button>

                    <div className="text-center text-sm text-gray-600 mt-4">
                      Already have an account?{' '}
                      <button 
                        type="button" 
                        onClick={() => navigate('/login')}
                        className="text-blue-600 hover:underline"
                      >
                        Sign in here
                      </button>
                    </div>
                  </form>
                </TabsContent>

                {/* Candidate Tab */}
                <TabsContent value="candidate" className="mt-0">
                  <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    {/* Common Fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name*</Label>
                        <Input
                          id="firstName"
                          placeholder="Enter your first name"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          required
                          className="border border-gray-300 focus:border-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name*</Label>
                        <Input
                          id="lastName"
                          placeholder="Enter your last name"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          required
                          className="border border-gray-300 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email*</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@email.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        className="border border-gray-300 focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone*</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="e.g., +91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        required
                        className="border border-gray-300 focus:border-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentLocation">Current Location</Label>
                        <Input
                          id="currentLocation"
                          placeholder="e.g., New York, NY"
                          value={formData.currentLocation}
                          onChange={(e) => handleInputChange('currentLocation', e.target.value)}
                          className="border border-gray-300 focus:border-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                        <Select
                          value={formData.yearsOfExperience}
                          onValueChange={(value) => handleInputChange('yearsOfExperience', value)}
                        >
                          <SelectTrigger className="border border-gray-300 focus:border-blue-500">
                            <SelectValue placeholder="Select experience level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0-1">0-1 years</SelectItem>
                            <SelectItem value="2-3">2-3 years</SelectItem>
                            <SelectItem value="4-5">4-5 years</SelectItem>
                            <SelectItem value="6-8">6-8 years</SelectItem>
                            <SelectItem value="9-12">9-12 years</SelectItem>
                            <SelectItem value="13+">13+ years</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password*</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          required
                          className="border border-gray-300 focus:border-blue-500 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {formData.password && (
                        <div className="text-xs text-gray-600 mt-2">
                          {isPasswordValid ? (
                            <div className="text-green-600">
                              ✓ Password meets all security requirements
                            </div>
                          ) : (
                            <div>
                              <div className="text-red-500 mb-1">Password requirements:</div>
                              <div className="mt-1 space-y-1">
                                {!passwordValidation.hasMinLength && (
                                  <div className="text-red-500">• At least 8 characters</div>
                                )}
                                {!passwordValidation.hasUppercase && (
                                  <div className="text-red-500">• Uppercase letter</div>
                                )}
                                {!passwordValidation.hasLowercase && (
                                  <div className="text-red-500">• Lowercase letter</div>
                                )}
                                {!passwordValidation.hasNumber && (
                                  <div className="text-red-500">• Number</div>
                                )}
                                {!passwordValidation.hasSpecialChar && (
                                  <div className="text-red-500">• Special character (!@#$%^&*)</div>
                                )}
                                {!passwordValidation.hasNoSpaces && (
                                  <div className="text-red-500">• No spaces</div>
                                )}
                                {!passwordValidation.hasNoRepeated && (
                                  <div className="text-red-500">• No repeated characters (aaaa)</div>
                                )}
                                {!passwordValidation.hasNoCommon && (
                                  <div className="text-red-500">• Not a common password</div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password*</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          required
                          className="border border-gray-300 focus:border-blue-500 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {formData.confirmPassword && (
                        <div className="text-xs mt-2">
                          {isPasswordMatch ? (
                            <div className="text-green-600">
                              ✓ Passwords match
                            </div>
                          ) : (
                            <div className="text-red-500">
                              • Passwords do not match
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="source">How did you hear about us?*</Label>
                      <Select
                        value={formData.source}
                        onValueChange={(value) => handleInputChange('source', value)}
                      >
                        <SelectTrigger className="border border-gray-300 focus:border-blue-500">
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
                          <SelectItem value="Conversational AI (GPT, Gemini etc)">Conversational AI (GPT, Gemini etc)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-6"
                      disabled={!isFormValid || loading}
                    >
                      {loading ? 'Creating Account...' : 'Create Account →'}
                    </Button>

                    <div className="text-center text-sm text-gray-600 mt-4">
                      Already have an account?{' '}
                      <button 
                        type="button" 
                        onClick={() => navigate('/login')}
                        className="text-blue-600 hover:underline"
                      >
                        Sign in here
                      </button>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;