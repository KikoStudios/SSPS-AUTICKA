'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAction } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useAuth } from '../auth-context';
import styles from './login.module.css';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const loginUser = useAction((api.context as any).loginUserAction);
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await loginUser({
        username,
        password,
      });

      if (result.success) {
        // Login successful
        console.log('Login successful:', result);
        
        // Parse user data
        let userData = {};
        try {
          userData = JSON.parse(result.usrData || '{}');
        } catch (error) {
          console.error('Error parsing user data:', error);
          userData = { role: 'user' };
        }
        
        // Store user data in auth context
        login(username, userData, result.userId);
        
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '18px',
        color: '#666'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #007bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p>Checking authentication...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Don't render login form if already authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className={styles.loginContainer}>
      {/* SSPS Logo in top left */}
      <div className={styles.logoContainer}>
        <img 
          src="/media/logo_ssps.svg" 
          alt="SSPS Logo" 
          className={styles.sspsLogo}
        />
      </div>

      {/* Main Login Card */}
      <div className={styles.loginCard}>
        {/* LockedIN Logo */}
        <div className={styles.lockedinLogoContainer}>
          <img 
            src="/media/LOGO.svg" 
            alt="LockedIN Logo" 
            className={styles.lockedinLogo}
          />
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Error Message */}
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          {/* Username Input */}
          <div className={styles.inputGroup}>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              className={styles.input}
              placeholder="uživatelské jméno"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Password Input */}
          <div className={styles.inputGroup}>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className={styles.input}
              placeholder="heslo"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className={styles.loginButton}
            disabled={isLoading}
          >
            {isLoading ? 'LOGGING IN...' : 'LOGIN'}
          </button>
        </form>
      </div>
    </div>
  );
}
