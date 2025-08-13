"use client"

import type React from "react"
import { useState } from "react"
import { Zap, Activity, BarChart3, Shield, Settings, Eye, EyeOff, LogIn, AlertCircle } from "lucide-react"

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<void>
  error: string | null
  isLoading: boolean
}

export default function LoginPage({ onLogin, error: loginError, isLoading: isLoginLoading }: LoginPageProps) {
  const [email, setEmail] = useState("admin@gmail.com")
  const [password, setPassword] = useState("admin")
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await onLogin(email, password)
    } catch (err) {
      console.error("Login error:", err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -right-8 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-8 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Branding & Features */}
          <div className="hidden lg:block space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 p-4 bg-blue-600/20 rounded-2xl backdrop-blur-sm border border-blue-500/20">
                <div className="p-3 bg-blue-600 rounded-xl">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Instrumental</h1>
                  <p className="text-blue-200">Industrial Monitoring Platform</p>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-4xl font-bold text-white leading-tight">
                  Monitor Your
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                    Industrial Assets
                  </span>
                </h2>
                <p className="text-xl text-gray-300 leading-relaxed">
                  Real-time monitoring, predictive analytics, and comprehensive asset management for industrial
                  operations worldwide.
                </p>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                <Activity className="h-8 w-8 text-green-400 mb-3" />
                <h3 className="font-semibold text-white mb-2">Real-time Monitoring</h3>
                <p className="text-sm text-gray-400">Live asset health and performance tracking</p>
              </div>
              <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                <BarChart3 className="h-8 w-8 text-blue-400 mb-3" />
                <h3 className="font-semibold text-white mb-2">Analytics</h3>
                <p className="text-sm text-gray-400">Advanced predictive insights and trends</p>
              </div>
              <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                <Shield className="h-8 w-8 text-purple-400 mb-3" />
                <h3 className="font-semibold text-white mb-2">Safety First</h3>
                <p className="text-sm text-gray-400">NAMUR compliance and safety protocols</p>
              </div>
              <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                <Settings className="h-8 w-8 text-orange-400 mb-3" />
                <h3 className="font-semibold text-white mb-2">CMMS Integration</h3>
                <p className="text-sm text-gray-400">Seamless maintenance workflow management</p>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8 lg:p-10">
              {/* Mobile Logo */}
              <div className="lg:hidden text-center mb-8">
                <div className="inline-flex items-center gap-3 p-4 bg-blue-600/20 rounded-2xl backdrop-blur-sm border border-blue-500/20 mb-4">
                  <div className="p-2 bg-blue-600 rounded-xl">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">Instrumental</h1>
                  </div>
                </div>
              </div>

              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                <p className="text-gray-300">Sign in to access your monitoring dashboard</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div>
                    <label htmlFor="password-input" className="block text-sm font-medium text-gray-300 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password-input"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        required
                        className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-center text-gray-400 p-3 bg-blue-900/20 rounded-lg border border-blue-500/20">
                  <Shield className="h-4 w-4 inline mr-2" />
                  Secure authentication
                </div>

                {loginError && (
                  <div
                    className="flex items-center p-4 text-sm text-red-300 bg-red-900/30 rounded-xl border border-red-500/30 backdrop-blur-sm"
                    role="alert"
                  >
                    <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span className="font-medium">{loginError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoginLoading}
                  className="group relative w-full flex justify-center items-center py-4 px-6 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-[1.02] disabled:hover:scale-100 shadow-lg"
                >
                  {isLoginLoading ? (
                    <>
                      <div className="w-5 h-5 mr-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="h-5 w-5 mr-3 group-hover:translate-x-1 transition-transform duration-200" />
                      Sign in to Dashboard
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="text-center space-y-3">
                  <p className="text-xs text-gray-400">Protected by enterprise-grade security</p>

                  {/* Stats */}
                  <div className="flex gap-8 mt-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white">99.9%</div>
                      <div className="text-sm text-gray-400">Uptime</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white">10k+</div>
                      <div className="text-sm text-gray-400">Assets Monitored</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white">24/7</div>
                      <div className="text-sm text-gray-400">Support</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
