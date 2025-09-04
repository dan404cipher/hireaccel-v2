import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, RefreshCw, ArrowLeft } from 'lucide-react';
import { apiClient } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface OTPVerificationPageProps {
  onVerificationSuccess?: () => void;
}

export const OTPVerificationPage: React.FC<OTPVerificationPageProps> = ({
  onVerificationSuccess
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  // Get email from location state (passed from signup)
  const email = location.state?.email;
  const userType = location.state?.userType || 'hr';
  
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      navigate('/signup/hr', { replace: true });
    }
  }, [email, navigate]);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError('Please enter the OTP');
      return;
    }

    if (otp.length !== 6) {
      setError('OTP must be 6 digits');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/auth/verify-otp', {
        email,
        otp: otp.trim(),
      });

      console.log('OTP verification response:', response);

      if (response.success) {
        setSuccess('Account verified successfully! Redirecting to dashboard...');
        
        // Store auth data using AuthContext
        const { user, accessToken } = response.data;
        apiClient.setToken(accessToken);
        
        // Update user context (manually since we're not using login method)
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Force page refresh to update auth context
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      } else {
        setError('Verification failed. Please try again.');
      }
    } catch (error: any) {
      console.error('OTP verification failed:', error);
      setError(
        error.message || 
        error.detail || 
        'Invalid or expired OTP. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiClient.post('/auth/resend-otp', { email });
      
      console.log('Resend OTP response:', response);
      
      if (response.success) {
        setSuccess('New OTP sent to your email!');
        setTimeRemaining(600); // Reset timer to 10 minutes
        setOtp(''); // Clear current OTP input
      }
    } catch (error: any) {
      console.error('Resend OTP failed:', error);
      setError(
        error.message || 
        error.detail || 
        'Failed to resend OTP. Please try again.'
      );
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToSignup = () => {
    const signupPath = userType === 'candidate' ? '/signup/candidate' : '/signup/hr';
    navigate(signupPath, { replace: true });
  };

  const handleOTPInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 6) {
      setOtp(value);
      setError(''); // Clear error when user starts typing
    }
  };

  if (!email) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Verify Your Email
            </CardTitle>
            <CardDescription className="text-gray-600">
              We've sent a 6-digit verification code to
              <div className="font-semibold text-gray-900 mt-1">{email}</div>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-sm font-medium text-gray-700">
                  Verification Code
                </Label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={handleOTPInputChange}
                  placeholder="Enter 6-digit code"
                  className="text-center text-lg tracking-widest font-mono"
                  maxLength={6}
                  autoComplete="one-time-code"
                  autoFocus
                />
                <div className="text-xs text-gray-500 text-center">
                  Code expires in: <span className="font-mono font-semibold">{formatTime(timeRemaining)}</span>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Email'
                )}
              </Button>
            </form>

            <div className="space-y-3">
              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleResendOTP}
                  disabled={isResending || timeRemaining > 540} // Allow resend after 1 minute
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Resend Code
                    </>
                  )}
                </Button>
              </div>

              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBackToSignup}
                  className="text-sm text-gray-600 hover:text-gray-700"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Sign Up
                </Button>
              </div>
            </div>

            <div className="text-xs text-gray-500 text-center space-y-1">
              <p>Didn't receive the email? Check your spam folder.</p>
              <p>Still having trouble? Contact support.</p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
