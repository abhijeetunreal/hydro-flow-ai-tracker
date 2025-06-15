
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { CredentialResponse } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

interface UserProfile {
  name: string;
  email: string;
  picture: string;
  exp: number;
}

interface AuthContextType {
  user: UserProfile | null;
  login: (credentialResponse: CredentialResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USER_STORAGE_KEY = 'aquaTrackUser';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        const parsedUser: UserProfile = JSON.parse(storedUser);
        // Check if token is expired
        if (parsedUser.exp * 1000 > Date.now()) {
          return parsedUser;
        }
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
    }
    return null;
  });

  const login = (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      const decoded: UserProfile = jwtDecode(credentialResponse.credential);
      setUser(decoded);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(decoded));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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
