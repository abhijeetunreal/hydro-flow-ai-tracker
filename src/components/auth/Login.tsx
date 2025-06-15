import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Droplet, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const Login = () => {
  const { login } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsSigningIn(true);
      try {
        await login(tokenResponse);
        toast.success("Successfully signed in!");
      } catch (error) {
        toast.error('Sign-In failed. Please try again.');
        console.error(error);
      } finally {
        setIsSigningIn(false);
      }
    },
    onError: () => {
      toast.error('Google Sign-In failed. Please try again.');
    },
    scope: 'openid email profile https://www.googleapis.com/auth/drive.appdata',
  });

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-background relative">
      <div className="absolute -inset-40 z-0 opacity-20 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]">
         {/* You can add a subtle background pattern here if you want */}
      </div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-6 max-w-sm w-full z-10"
      >
        <div className="flex justify-center items-center gap-3">
          <Droplet className="h-12 w-12 text-primary" />
          <h1 className="text-5xl font-black text-foreground tracking-tighter">AquaTrack</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          A minimalist approach to hydration.
        </p>
        <motion.div
          className="flex justify-center pt-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Button onClick={() => handleLogin()} size="lg" disabled={isSigningIn}>
            <LogIn className="mr-2 h-5 w-5" />
            {isSigningIn ? 'Signing In...' : 'Sign in with Google'}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
