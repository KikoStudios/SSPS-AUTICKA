'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthActions } from '@convex-dev/auth/react';
import { useConvexAuth, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import styles from './login.module.css';
import Image from 'next/image';
import { Input, Spacer } from '@heroui/react';
import { PrimaryButton, SecondaryButton, AlertBox, FormContainer } from '@/components/heroui-components';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');

  const loginInputClassNames = {
    inputWrapper:
      'bg-default-100/85 border-default-300/80 data-[hover=true]:bg-default-100 data-[focus=true]:bg-default-100',
    input: 'text-foreground placeholder:text-default-500',
  };

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
        <FormContainer onSubmit={handleSubmit}>
          {/* Error/Success Message */}
          {error && (
            <>
              <AlertBox 
                type={error.includes('✅') ? 'success' : 'error'} 
                message={error.replace('✅ ', '').replace('❌ ', '')} 
              />
              <Spacer y={2} />
            </>
          )}

          {/* Username Input */}
          <Input
            id="username"
            name="username"
            placeholder="uživatelské jméno"
            type="text"
            variant="bordered"
            size="lg"
            radius="md"
            fullWidth
            classNames={loginInputClassNames}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
            required
            autoComplete="username"
          />

          {/* Password Input */}
          <Input
            id="password"
            name="password"
            placeholder="heslo"
            type="password"
            variant="bordered"
            size="lg"
            radius="md"
            fullWidth
            classNames={loginInputClassNames}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
            autoComplete="current-password"
          />

          {/* Login Button */}
          <PrimaryButton
            type="submit"
            disabled={isLoading}
            className="mt-4"
          >
            {isLoading
              ? (mode === 'signUp' ? 'CREATING ACCOUNT...' : 'LOGGING IN...')
              : (mode === 'signUp' ? 'CREATE ACCOUNT' : 'LOGIN')
            }
          </PrimaryButton>

          {/* Toggle between Sign In and Sign Up */}
          <SecondaryButton
            type="button"
            onClick={() => setMode(mode === 'signIn' ? 'signUp' : 'signIn')}
            className="mt-2 w-full"
            variant="light"
          >
            {mode === 'signIn'
              ? 'Need to create an account? Sign up'
              : 'Already have an account? Sign in'
            }
          </SecondaryButton>
        </FormContainer>

        {/* Verification Info - Only show during signup */}
        {mode === 'signUp' && (
          <div className="mt-4">
            <AlertBox 
              type="info" 
              message="You must be verified by an administrator before you can log in. New accounts require approval." 
            />
          </div>
        )}
      </div>
    </div>
  );
}
