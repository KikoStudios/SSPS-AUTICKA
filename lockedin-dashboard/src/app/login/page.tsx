'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthActions } from '@convex-dev/auth/react';
import { useConvexAuth, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import styles from './login.module.css';

import Image from 'next/image';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');

  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();

  // Check if any users exist - if not, allow sign-up for first admin
  const hasUsers = useQuery(api.publicApi.hasAnyUsers);
  const canSignUp = hasUsers === false; // explicitly false means we know there are 0 users

  // Auto-switch to signUp mode if no users exist
  useEffect(() => {
    if (canSignUp) {
      setMode('signUp');
    }
  }, [canSignUp]);

  // Check for error parameters in URL (e.g., redirected from dashboard due to pending approval)
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'pending_approval') {
      setError('❌ Váš účet čeká na schválení správcem. Kontaktujte správce.');
    }
  }, [searchParams]);

  // Redirect to dashboard if authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      console.log('Authenticated! Redirecting to dashboard...');
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Create FormData to pass to Convex Auth
      // Password provider expects 'email' field, not 'username'
      const formData = new FormData();
      formData.append('email', username); // Send as email field
      formData.append('password', password);
      formData.append('flow', mode);

      console.log('Attempting sign in...', { mode, username });
      await signIn('password', formData);
      console.log('Sign in successful!');

      // NEW: Check if account is approved (if just signed up)
      if (mode === 'signUp') {
        // Account was just created - may need approval
        // Show success message
        setError('✅ Účet vytvořen! Čeká na schválení správcem.');
        setIsLoading(false);
        // Optionally redirect back to sign in after delay
        setTimeout(() => {
          setMode('signIn');
          setError('');
        }, 3000);
        return;
      }

      // For signIn mode, redirect to dashboard
      // The dashboard will verify authentication
      console.log('Redirecting to dashboard...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 500); // Small delay to let auth state settle
      
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);

      // Check if account already exists
      if (errorMessage.includes('already exists')) {
        setError('Účet již existuje! Přihlašování...');
        // Auto-login with same credentials
        setTimeout(async () => {
          try {
            const loginFormData = new FormData();
            loginFormData.append('email', username);
            loginFormData.append('password', password);
            loginFormData.append('flow', 'signIn');
            
            console.log('Auto-logging in with existing account...');
            await signIn('password', loginFormData);
            console.log('Auto-login successful!');
            
            setTimeout(() => {
              router.push('/dashboard');
            }, 500);
          } catch (loginErr) {
            console.error('Auto-login failed:', loginErr);
            setError('Neplatné uživatelské jméno nebo heslo. Zkuste to znovu.');
            setIsLoading(false);
          }
        }, 1000);
      } else if (mode === 'signUp') {
        setError('Chyba při vytváření účtu. Zkuste to znovu.');
      } else if (errorMessage.includes('pending approval') || errorMessage.includes('not approved')) {
        setError('Váš účet čeká na schválení správcem.');
      } else {
        setError('Neplatné uživatelské jméno nebo heslo. Zkuste to znovu.');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      {/* SSPS Logo in top left */}
      <div className={styles.logoContainer}>
        <Image
          src="/media/logo_ssps.svg"
          alt="SSPS Logo"
          width={318}
          height={111}
          className={styles.sspsLogo}
          priority
        />
      </div>

      {/* Main Login Card */}
      <div className={styles.loginCard}>
        {/* LockedIN Logo */}
        <div className={styles.lockedinLogoContainer}>
          <Image
            src="/media/logo-v2.svg"
            alt="LockedIN Logo"
            width={718}
            height={521}
            className={styles.lockedinLogo}
            priority
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
            {isLoading
              ? (mode === 'signUp' ? 'CREATING ACCOUNT...' : 'LOGGING IN...')
              : (mode === 'signUp' ? 'CREATE ACCOUNT' : 'LOGIN')
            }
          </button>

          {/* Toggle between Sign In and Sign Up - Always visible */}
          <button
            type="button"
            onClick={() => setMode(mode === 'signIn' ? 'signUp' : 'signIn')}
            style={{
              marginTop: '10px',
              background: 'transparent',
              border: 'none',
              color: '#666',
              cursor: 'pointer',
              fontSize: '14px',
              textDecoration: 'underline',
            }}
          >
            {mode === 'signIn'
              ? 'Need to create an account? Sign up'
              : 'Already have an account? Sign in'
            }
          </button>

          {/* Show message about approval if signing up */}
          {mode === 'signUp' && (
            <div style={{ marginTop: '10px', color: '#999', fontSize: '12px' }}>
              New accounts require admin approval to login
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
