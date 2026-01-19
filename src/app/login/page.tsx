'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Mail, Loader2, ArrowLeft, CheckCircle2, Lock } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showPasswordInput, setShowPasswordInput] = useState(false)

    const supabase = createClient()

    const handleMagicLink = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        setIsLoading(true)
        setError(null)

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        })

        setIsLoading(false)

        if (error) {
            setError(error.message)
        } else {
            setIsSubmitted(true)
        }
    }

    const handlePasswordSignIn = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        setIsLoading(false)

        if (error) {
            setError(error.message)
        } else {
            // Redirect happens automatically or we can force it
            window.location.href = '/dashboard'
        }
    }

    const handleSignUp = async () => {
        setIsLoading(true)
        setError(null)

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        })

        setIsLoading(false)

        if (error) {
            setError(error.message)
        } else if (data.session) {
            // Email confirmation is disabled, redirect immediately
            window.location.href = '/dashboard'
        } else {
            setError('Check your email to confirm your account')
            setIsSubmitted(true)
        }
    }

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 text-center">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-8 h-8 text-green-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
                        <p className="text-slate-400 mb-6">
                            We&apos;ve sent a confirmation link to <span className="text-purple-400">{email}</span>
                        </p>
                        <p className="text-sm text-slate-500">
                            Click the link in your email to sign in. The link will expire in 1 hour.
                        </p>
                        <button
                            onClick={() => {
                                setIsSubmitted(false)
                                setShowPasswordInput(false)
                            }}
                            className="mt-6 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                        >
                            Back to login
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Back to home */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to home
                </Link>

                {/* Login Card */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <img src="/logo.png" alt="Rader" className="w-12 h-12 rounded-xl shadow-lg shadow-purple-500/20" />
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Rader
                        </h1>
                        <p className="text-slate-400 mt-2">Find high-intent leads across the web</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                                Email address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@company.com"
                                    required
                                    disabled={showPasswordInput && password.length > 0}
                                    className="w-full bg-slate-900/50 border border-slate-600 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {showPasswordInput ? (
                            <form onSubmit={handlePasswordSignIn} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                                            Password
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswordInput(false)}
                                            className="text-xs text-purple-400 hover:text-purple-300"
                                        >
                                            Use Magic Link instead
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 flex items-center justify-center">
                                            <Lock className="w-4 h-4" />
                                        </div>
                                        <input
                                            id="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                            className="w-full bg-slate-900/50 border border-slate-600 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                                        {error}
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={isLoading || !password}
                                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSignUp}
                                        disabled={isLoading || !password}
                                        className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        Sign Up
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                {error && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                                        {error}
                                    </div>
                                )}
                                <button
                                    onClick={handleMagicLink}
                                    disabled={isLoading || !email}
                                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Mail className="w-5 h-5" />
                                            Send Magic Link
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => setShowPasswordInput(true)}
                                    disabled={isLoading}
                                    className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    Continue with Password
                                </button>
                            </div>
                        )}
                    </div>

                    <p className="text-center text-sm text-slate-500 mt-6">
                        By continuing, you agree to our{' '}
                        <Link href="/terms" className="text-purple-400 hover:underline">
                            Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="text-purple-400 hover:underline">
                            Privacy Policy
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
