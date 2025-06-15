
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Droplet } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
  const { login } = useAuth();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-6 max-w-sm w-full"
      >
        <div className="flex justify-center items-center gap-2">
            <Droplet className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">AquaTrack</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Sign in to track your hydration and build healthy habits.
        </p>
        <motion.div 
          className="flex justify-center pt-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
            <GoogleLogin
                onSuccess={login}
                onError={() => {
                    toast.error('Google Sign-In failed. Please try again.');
                }}
                theme="filled_blue"
                size="large"
                shape="pill"
                width="300px"
            />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
