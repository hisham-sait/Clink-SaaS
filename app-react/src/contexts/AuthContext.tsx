import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  companyId?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch('http://localhost:3000/api/auth/refresh-token', {
            method: 'POST',
            headers: {
              ...defaultHeaders,
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Invalid token');
          }
          
          const data = await response.json();
          setUser({
            id: data.user.id,
            name: `${data.user.firstName} ${data.user.lastName}`,
            email: data.user.email,
            role: data.user.roles[0],
            companyId: data.user.companyId
          });
          localStorage.setItem('token', data.token);
        } catch (error) {
          console.error('Invalid token:', error);
          localStorage.removeItem('token');
          setUser(null);
          navigate('/auth/login');
        }
      }
      setLoading(false);
    };

    validateToken();
  }, [navigate]);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('token', data.token);

      setUser({
        id: data.user.id,
        name: `${data.user.firstName} ${data.user.lastName}`,
        email: data.user.email,
        role: data.user.roles[0],
        companyId: data.user.companyId
      });

      navigate('/dashboard');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      console.error('Login error:', message);
      throw new Error(message);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ');
    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify({
          company: {
            name: 'New Company',
            legalName: 'New Company Ltd',
            registrationNumber: 'TBD',
            vatNumber: 'TBD',
            address: 'TBD',
            city: 'TBD',
            state: 'TBD',
            country: 'TBD',
            postalCode: 'TBD',
            taxId: 'TBD'
          },
          admin: {
            firstName,
            lastName,
            email,
            password
          }
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }

      // After successful registration, log the user in
      await login(email, password);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/auth/login');
  };

  const forgotPassword = async (email: string) => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/forgot-password', {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Password reset request failed');
      }

      // Handle success (e.g., show message to check email)
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    forgotPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
