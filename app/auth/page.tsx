'use client'

import { useState, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

// ============================================
// TYPES
// ============================================
type AuthMode = 'login' | 'signup'

interface AuthFormData {
  email: string
  password: string
}

interface AuthError {
  message: string
}

// ============================================
// AUTH FORM COMPONENT
// ============================================
function AuthForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/scan'
  
  const [mode, setMode] = useState<AuthMode>('login')
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)

  const getSupabase = () => {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient()
    }
    return supabaseRef.current
  }

  // Toggle between login and signup
  const toggleMode = () => {
    setMode((prev) => (prev === 'login' ? 'signup' : 'login'))
    setError(null)
  }

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError(null)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = getSupabase()
      if (mode === 'signup') {
        // Sign up new user
        const { error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (signUpError) throw signUpError

        // Show success message for email confirmation
        setError('Check your email for the confirmation link!')
      } else {
        // Sign in existing user
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })

        if (signInError) throw signInError

        // Redirect on successful login
        router.push(redirectTo)
        router.refresh()
      }
    } catch (err) {
      const authError = err as AuthError
      setError(authError.message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-gray-100">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          {mode === 'login'
            ? 'Sign in to continue scanning'
            : 'Sign up to start scanning crops'}
        </p>
      </div>

      {/* Error/Success Message */}
      {error && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${
            error.includes('Check your email')
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Auth Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Field */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-colors"
            placeholder="you@example.com"
          />
        </div>

        {/* Password Field */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            required
            minLength={6}
            value={formData.password}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-colors"
            placeholder="••••••••"
          />
          <p className="mt-1 text-xs text-gray-500">
            {mode === 'signup' && 'Must be at least 6 characters'}
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : mode === 'login' ? (
            'Sign in'
          ) : (
            'Create account'
          )}
        </button>
      </form>

      {/* Toggle Mode */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={toggleMode}
            className="font-medium text-emerald-600 hover:text-emerald-500 focus:outline-none focus:underline transition-colors"
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>

      {/* Back to Home */}
      <div className="mt-4 text-center">
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  )
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================
export default function AuthPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col justify-center px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <svg
              className="h-10 w-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 22V12h6v10"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            CropScan
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            AI-powered crop disease detection
          </p>
        </div>

        <Suspense fallback={
          <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-gray-100">
            <div className="flex justify-center">
              <svg className="animate-spin h-8 w-8 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          </div>
        }>
          <AuthForm />
        </Suspense>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-gray-500">
          By continuing, you agree to our{' '}
          <Link href="#" className="text-emerald-600 hover:text-emerald-500">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="#" className="text-emerald-600 hover:text-emerald-500">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}
