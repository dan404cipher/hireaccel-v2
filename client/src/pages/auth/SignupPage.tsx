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
import logo from '@/assets/logo.png';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  department?: string;
  currentLocation?: string;
  yearsOfExperience?: string;
}

interface SignupPageProps {
  onSwitchToSignin: () => void;
}

export function SignupPage({ onSwitchToSignin }: SignupPageProps) {
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
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    department: '',
    currentLocation: '',
    yearsOfExperience: ''
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

    try {
      // Prepare signup data
      const signupData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: userType,
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
      toast({
        title: 'Signup failed',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
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
    hasNoSequential: !hasSequentialCharacters(formData.password),
    hasNoRepeated: !/(.)\1{3,}/.test(formData.password),
    hasNoCommon: !/^(password|password123|123456|123456789|qwerty|abc123|password1|admin|letmein|welcome|12345678|monkey|1234567890|dragon|master|baseball|football|basketball|superman|batman|trustno1|hello|welcome123|admin123|root|test|guest|user|demo|temp|temporary)$/i.test(formData.password)
  };

  // Helper function to check for sequential characters (matches backend logic)
  function hasSequentialCharacters(password: string): boolean {
    const sequences = [
      'abcdefghijklmnopqrstuvwxyz',
      'qwertyuiopasdfghjklzxcvbnm',
      '0123456789'
    ];
    
    const lowerPassword = password.toLowerCase();
    
    for (const sequence of sequences) {
      for (let i = 0; i <= sequence.length - 3; i++) {
        const subseq = sequence.substring(i, i + 3);
        if (lowerPassword.includes(subseq)) {
          return true;
        }
        // Check reverse sequence
        const reverseSubseq = subseq.split('').reverse().join('');
        if (lowerPassword.includes(reverseSubseq)) {
          return true;
        }
      }
    }
    
    return false;
  }

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-40 h-40 bg-gradient-to-br from-blue-200/30 to-blue-300/30 rounded-full blur-xl"></div>
          <div className="absolute bottom-32 right-16 w-32 h-32 bg-gradient-to-br from-purple-200/40 to-purple-300/40 rounded-full blur-lg"></div>
          <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-gradient-to-br from-indigo-200/20 to-indigo-300/20 rounded-full blur-lg"></div>
          <div className="absolute bottom-1/4 left-20 w-28 h-28 bg-gradient-to-br from-pink-200/30 to-pink-300/30 rounded-full blur-xl"></div>
        </div>

        {/* Content container with proper spacing */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Header with logo and title on same line */}
          <div className="flex-shrink-0 p-8">
            <div className="flex items-center justify-between">
              <img src={logo} alt="HireAccel" className="w-30 h-10" onClick={()=>navigate('/')}/>
              <div className="text-right">
                <h2 className="text-xl font-bold text-gray-800 leading-tight">
                  Revolutionizing<br />
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Recruitment</span>
                </h2>
              </div>
            </div>
          </div>

          {/* Body content */}
          <div className="flex-shrink-0 px-8 pb-8">
            <p className="text-gray-600 leading-relaxed">
              Join the next generation of hiring technology. Connect talent with opportunity through our innovative platform designed for modern recruitment needs.
            </p>
          </div>

          {/* Central illustration */}
          <div className="flex-1 flex items-center justify-center px-8">
            <div className="relative">
              <div className="w-64 h-64 mx-auto bg-gradient-to-br from-blue-100/80 to-purple-100/80 rounded-full flex items-center justify-center relative backdrop-blur-sm border border-white/30 shadow-2xl">
                <div className="absolute inset-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-inner">
                  <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-3xl">H</span>
                    </div>
                  </div>
                </div>
                
                {/* Floating feature icons */}
                <div className="absolute -top-2 right-8 w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div className="absolute bottom-2 -left-2 w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg animate-bounce delay-500">
                  <Briefcase className="w-7 h-7 text-white" />
                </div>
                <div className="absolute top-20 -left-6 w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg animate-bounce delay-1000">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="absolute bottom-20 -right-6 w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg animate-bounce delay-1500">
                  <Shield className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Floating glassmorphism stats card */}
          <div className="flex-shrink-0 p-8">
            <div className="bg-white/40 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
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
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-1 mb-4">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-blue-500">Create Account</span>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Create Your Account
            </h1>
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
                        Password must meet all security requirements
                        <div className="mt-1 space-y-1">
                          <div className={passwordValidation.hasMinLength ? "text-green-600" : "text-red-500"}>
                            ✓ At least 8 characters
                          </div>
                          <div className={passwordValidation.hasUppercase ? "text-green-600" : "text-red-500"}>
                            ✓ Uppercase letter
                          </div>
                          <div className={passwordValidation.hasLowercase ? "text-green-600" : "text-red-500"}>
                            ✓ Lowercase letter
                          </div>
                          <div className={passwordValidation.hasNumber ? "text-green-600" : "text-red-500"}>
                            ✓ Number
                          </div>
                          <div className={passwordValidation.hasSpecialChar ? "text-green-600" : "text-red-500"}>
                            ✓ Special character (!@#$%^&*)
                          </div>
                          <div className={passwordValidation.hasNoSpaces ? "text-green-600" : "text-red-500"}>
                            ✓ No spaces
                          </div>
                          <div className={passwordValidation.hasNoSequential ? "text-green-600" : "text-red-500"}>
                            ✓ No sequential characters (123, abc, qwe)
                          </div>
                          <div className={passwordValidation.hasNoRepeated ? "text-green-600" : "text-red-500"}>
                            ✓ No repeated characters (aaaa)
                          </div>
                          <div className={passwordValidation.hasNoCommon ? "text-green-600" : "text-red-500"}>
                            ✓ Not a common password
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* HR Specific Fields */}
                  <TabsContent value="hr" className="mt-4">
                    <div className="min-h-[120px] flex flex-col justify-start">
                      <div className="space-y-2">
                        <Label htmlFor="department">Designation</Label>
                        <Input
                          id="department"
                          placeholder="e.g., Engineering, Sales"
                          value={formData.department}
                          onChange={(e) => handleInputChange('department', e.target.value)}
                          className="border border-gray-300 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* Candidate Specific Fields */}
                  <TabsContent value="candidate" className="mt-4">
                    <div className="min-h-[120px] space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentLocation">Current Location (Optional)</Label>
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
                    </div>
                  </TabsContent>

                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-6"
                    disabled={!isPasswordValid || loading}
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
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}