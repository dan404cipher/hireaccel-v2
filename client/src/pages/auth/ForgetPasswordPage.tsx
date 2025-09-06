import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Mail, Shield, CheckCircle, Clock, Users, TrendingUp, RotateCcw } from 'lucide-react';
import { apiClient } from '@/services/api';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';
import { useNavigate } from 'react-router-dom';

interface ForgetPasswordFormData {
  email: string;
}

interface ForgetPasswordPageProps {
  onBackToSignin: () => void;
  onContinueToResetPassword: (email: string) => void;
}

export function ForgetPasswordPage({ onBackToSignin, onContinueToResetPassword }: ForgetPasswordPageProps) {
  const navigate=useNavigate();
  const [formData, setFormData] = useState<ForgetPasswordFormData>({
    email: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof ForgetPasswordFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    
    try {
      await apiClient.forgotPassword({ email: formData.email });
      setIsSubmitted(true);
      toast.success('Password reset email sent! Check your inbox.');
    } catch (error: any) {
      console.error('Password reset request failed:', error);
      toast.error(error.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden items-center justify-center">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-40 h-40 bg-gradient-to-br from-blue-200/30 to-blue-300/30 rounded-full blur-xl"></div>
          <div className="absolute bottom-32 right-16 w-32 h-32 bg-gradient-to-br from-purple-200/40 to-purple-300/40 rounded-full blur-lg"></div>
          <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-gradient-to-br from-indigo-200/20 to-indigo-300/20 rounded-full blur-lg"></div>
          <div className="absolute bottom-1/4 left-20 w-28 h-28 bg-gradient-to-br from-pink-200/30 to-pink-300/30 rounded-full blur-xl"></div>
        </div>

        {/* Content container with proper spacing */}
        <div className="relative z-10 flex flex-col h-ful w-[90%]">
          {/* Header with logo only */}
          <div className="flex-shrink-0 p-8">
            <div className="flex items-center space-x-3" onClick={()=>navigate('/')}>
              <img src={logo} alt="HireAccel" className="w-30 h-10" />
            </div>
          </div>

          {/* Body content */}
          <div className="flex-shrink-0 px-8 pb-8">
            <p className="text-gray-600 leading-relaxed max-w-md">
              Secure password recovery for your HireAccel account. We'll help you regain access quickly and safely to continue your recruitment journey.
            </p>
          </div>

          {/* Central content section with welcome message and illustration */}
          <div className="flex-1 flex flex-col justify-center items-center px-8">
            {/* Welcome title centered in middle */}
            <div className="text-center mb-12">
              <h2 className="text-3xl font-semibold text-gray-800 leading-tight mb-6">
                Secure Account<br />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Recovery</span>
              </h2>
            </div>

            {/* Central illustration */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-64 h-64 bg-gradient-to-br from-blue-100/80 to-purple-100/80 rounded-full flex items-center justify-center relative backdrop-blur-sm border border-white/30 shadow-2xl">
                  <div className="absolute inset-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-inner">
                    <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                        <Shield className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Floating feature icons */}
                  <div className="absolute -top-2 right-8 w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                    <Mail className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute bottom-2 -left-2 w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg animate-bounce delay-500">
                    <CheckCircle className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute top-20 -left-6 w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg animate-bounce delay-1000">
                    <RotateCcw className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute bottom-20 -right-6 w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg animate-bounce delay-1500">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating glassmorphism stats card */}
          <div className="flex-shrink-0 p-8 flex justify-center">
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

      {/* Right Side - Forgot Password Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {!isSubmitted ? (
            <>
              <div className="text-center mb-8">
                <div className="flex items-center justify-center space-x-1 mb-4">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-blue-500 font-medium">Account Recovery</span>
                </div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                  Reset Your Password
                </h1>
                <p className="text-gray-600">
                  Enter your email address and we'll send you a link to reset your password
                </p>
              </div>

              <Card className="border border-gray-200 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@company.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        className="bg-white border border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white mt-6 shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4 mr-2" />
                          Send Reset Link
                        </>
                      )}
                    </Button>

                    <button
                      type="button"
                      onClick={onBackToSignin}
                      className="w-full flex items-center justify-center space-x-2 text-gray-600 hover:text-gray-900 mt-4 py-2 transition-colors duration-200"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Sign In</span>
                    </button>
                  </form>

                  {/* Security notice */}
                  <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-700 text-center">
                      <strong>Secure Recovery:</strong> We'll send a secure reset link to your email. The link will expire in 24 hours for your protection.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                  Check Your Email
                </h1>
                <p className="text-gray-600 mb-6">
                  We've sent a password reset link to <strong>{formData.email}</strong>
                </p>
              </div>

              <Card className="border border-gray-200 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
                      <h3 className="font-semibold text-gray-900 mb-2">Next Steps:</h3>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>Check your email inbox (and spam folder)</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>Click the reset link in the email</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>Create a new secure password</span>
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-3">
                      {/* <Button 
                        onClick={() => onContinueToResetPassword(formData.email)}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg transition-all duration-200"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        I received the email - Reset Password
                      </Button> */}
                      
                      <Button 
                        onClick={() => setIsSubmitted(false)}
                        variant="outline"
                        className="w-full border-gray-300 hover:bg-gray-50 transition-all duration-200"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Send Another Email
                      </Button>
                    </div>

                    <button
                      type="button"
                      onClick={onBackToSignin}
                      className="w-full flex items-center justify-center space-x-2 text-gray-600 hover:text-gray-900 py-2 transition-colors duration-200"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Sign In</span>
                    </button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}