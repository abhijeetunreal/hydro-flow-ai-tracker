
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { googleLogout, TokenResponse } from '@react-oauth/google';

interface UserProfile {
  name: string;
  email: string;
  picture: string;
}

interface AuthContextType {
  user: UserProfile | null;
  accessToken: string | null;
  login: (tokenResponse: Omit<TokenResponse, "error" | "error_description" | "error_uri">) => Promise<void>;
  logout: () => void;
  isLoggingIn: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AUTH_STORAGE_KEY = 'aquaTrackAuthV2';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(true);

  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedAuth) {
        const { user, accessToken, expiresAt } = JSON.parse(storedAuth);
        if (expiresAt > Date.now()) {
          setUser(user);
          setAccessToken(accessToken);
        } else {
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      }
    } catch (e) {
      console.error("Failed to parse auth from localStorage", e);
    } finally {
      setIsLoggingIn(false);
    }
  }, []);

  const login = async (tokenResponse: Omit<TokenResponse, "error" | "error_description" | "error_uri">) => {
    setIsLoggingIn(true);
    const gAccessToken = tokenResponse.access_token;
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${gAccessToken}` },
      });
      if (!response.ok) throw new Error('Failed to fetch user info');
      
      const profile: UserProfile = await response.json();
      
      const userProfile: UserProfile = {
        name: profile.name,
        email: profile.email,
        picture: profile.picture,
      };

      setUser(userProfile);
      setAccessToken(gAccessToken);
      
      const expiresAt = Date.now() + (tokenResponse.expires_in * 1000);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: userProfile, accessToken: gAccessToken, expiresAt }));
    } catch(error) {
        console.error("Login failed", error);
        logout();
        throw error;
    } finally {
        setIsLoggingIn(false);
    }
  };

  const logout = () => {
    googleLogout();
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout, isLoggingIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
