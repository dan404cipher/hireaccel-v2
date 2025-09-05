import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Lock, CheckCircle, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { apiClient } from '@/services/api';
import { toast } from 'sonner';

interface ResetPasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [formData, setFormData] = useState<ResetPasswordFormData>({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Password validation
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);
  const isPasswordMatch = formData.newPassword === formData.confirmPassword && formData.confirmPassword !== '';
  const isFormValid = isPasswordValid && isPasswordMatch;

  useEffect(() => {
    if (!token) {
      toast.error('Invalid reset link');
      navigate('/forget-password');
    }
  }, [token, navigate]);

  useEffect(() => {
    const password = formData.newPassword;
    setPasswordValidation({
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  }, [formData.newPassword]);

  const handleInputChange = (field: keyof ResetPasswordFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) {
      toast.error('Please fix the form errors before submitting');
      return;
    }

    setIsLoading(true);
    
    try {
      await apiClient.resetPassword({
        token: token!,
        newPassword: formData.newPassword
      });
      
      setIsSuccess(true);
      toast.success('Password reset successfully!');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error: any) {
      console.error('Password reset failed:', error);
      toast.error(error.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Password Reset Successful!
            </h1>
            <p className="text-gray-600 mb-6">
              Your password has been successfully updated. You can now log in with your new password.
            </p>
          </div>

          <Card className="border border-gray-200 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Next Steps:</h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>You will be redirected to the login page automatically</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Use your new password to log in</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>All your existing sessions have been logged out for security</span>
                    </li>
                  </ul>
                </div>

                <Button 
                  onClick={() => navigate('/login')}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg transition-all duration-200"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Go to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-1 mb-4">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-blue-500 font-medium">Password Reset</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Create New Password
          </h1>
          <p className="text-gray-600">
            Enter your new password below. Make sure it's secure and easy to remember.
          </p>
        </div>

        <Card className="border border-gray-200 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                    required
                    className="bg-white border border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                {/* Password validation */}
                {formData.newPassword && (
                  <div className="space-y-1 text-xs">
                    <div className={`flex items-center space-x-2 ${passwordValidation.minLength ? 'text-green-600' : 'text-red-500'}`}>
                      {passwordValidation.minLength ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      <span>At least 8 characters</span>
                    </div>
                    <div className={`flex items-center space-x-2 ${passwordValidation.hasUppercase ? 'text-green-600' : 'text-red-500'}`}>
                      {passwordValidation.hasUppercase ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      <span>One uppercase letter</span>
                    </div>
                    <div className={`flex items-center space-x-2 ${passwordValidation.hasLowercase ? 'text-green-600' : 'text-red-500'}`}>
                      {passwordValidation.hasLowercase ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      <span>One lowercase letter</span>
                    </div>
                    <div className={`flex items-center space-x-2 ${passwordValidation.hasNumber ? 'text-green-600' : 'text-red-500'}`}>
                      {passwordValidation.hasNumber ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      <span>One number</span>
                    </div>
                    <div className={`flex items-center space-x-2 ${passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-red-500'}`}>
                      {passwordValidation.hasSpecialChar ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      <span>One special character</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    required
                    className="bg-white border border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                {/* Password match validation */}
                {formData.confirmPassword && (
                  <div className={`flex items-center space-x-2 text-xs ${isPasswordMatch ? 'text-green-600' : 'text-red-500'}`}>
                    {isPasswordMatch ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    <span>{isPasswordMatch ? 'Passwords match' : 'Passwords do not match'}</span>
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                disabled={!isFormValid || isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white mt-6 shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Resetting Password...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Reset Password
                  </>
                )}
              </Button>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full flex items-center justify-center space-x-2 text-gray-600 hover:text-gray-900 mt-4 py-2 transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Login</span>
              </button>
            </form>

            {/* Security notice */}
            <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-700 text-center">
                <strong>Security:</strong> Your new password will be encrypted and stored securely. All existing sessions will be logged out for your protection.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
