import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ApiErrorAlert } from '@/components/ui/error-boundary';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@hireaccel.com');
  const [password, setPassword] = useState('Admin123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      toast({
        title: 'Welcome back!',
        description: 'You have been successfully logged in.',
      });
      navigate('/');
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Sign in to Hire Accel
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Access your recruitment dashboard
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Enter your credentials to access the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </div>

              {error && (
                <ApiErrorAlert 
                  error={error} 
                  onRetry={() => setError(null)} 
                />
              )}

              <Button 
                type="submit" 
                className="w-full"
                disabled={loading}
              >
                {loading && <LoadingSpinner size="sm" className="mr-2" />}
                Sign In
              </Button>
            </form>

            <div className="mt-6 text-center">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800">Demo Credentials</h4>
                <div className="text-sm text-blue-600 mt-2 space-y-1">
                  <p><strong>Admin:</strong> admin@hireaccel.com / Admin123!</p>
                  <p><strong>HR Users:</strong></p>
                  <p className="ml-4">• sarah.johnson@hireaccel.com / Hr123!</p>
                  <p className="ml-4">• mike.chen@hireaccel.com / Hr123!</p>
                  <p className="ml-4">• john.doe@hireaccel.com / Hr123!</p>
                  <p><strong>Agents:</strong></p>
                  <p className="ml-4">• alex.smith@hireaccel.com / Agent123!</p>
                  <p className="ml-4">• emily.davis@hireaccel.com / Agent123!</p>
                  <p><strong>Candidates:</strong></p>
                  <p className="ml-4">• jane.smith@hireaccel.com / Candidate123!</p>
                  <p className="ml-4">• john.developer@email.com / Candidate123!</p>
                  <p className="ml-4">• sarah.data@email.com / Candidate123!</p>
                  <p className="ml-4">• mike.product@email.com / Candidate123!</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
