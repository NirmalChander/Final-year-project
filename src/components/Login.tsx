import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Scale, Shield, BookOpen, Users, Sparkles, LogIn, Loader2 } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await login();
      // The login function will redirect to Supabase OAuth
      // Loading state will be reset when auth state changes
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      alert('Failed to start sign-in. Please check your internet connection and try again.');
    }
  };

  const features = [
    { icon: Shield, text: "Secure & Encrypted", color: "text-green-600" },
    { icon: BookOpen, text: "Indian Law Expertise", color: "text-blue-600" },
    { icon: Sparkles, text: "AI-Powered Analysis", color: "text-purple-600" },
    { icon: Users, text: "24/7 Legal Support", color: "text-orange-600" },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(125deg, hsl(var(--gradient-start) / 0.7) 0%, hsl(var(--gradient-middle) / 0.1) 48%, hsl(var(--gradient-middle) / 0.7) 52%, hsl(var(--gradient-end) / 0.6) 100%)' }}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-700/25 bg-[size:20px_20px] [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />

      {/* Subtle Pattern Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-30" />

      {/* Chakra Symbol */}
      <div
        className="absolute inset-0 flex items-center justify-center opacity-15 pointer-events-none"
        style={{
          backgroundImage: 'url(/image.png)',
          backgroundSize: '350px 350px',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      />

      {/* Enhanced Floating Elements */}
      <div className="absolute top-20 left-10 w-16 h-16 bg-orange-200 dark:bg-orange-800 rounded-full opacity-20 animate-pulse" />
      <div className="absolute top-32 right-16 w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-full opacity-20 animate-pulse delay-1000" />
      <div className="absolute bottom-24 left-16 w-20 h-20 bg-green-200 dark:bg-green-800 rounded-full opacity-20 animate-pulse delay-500" />
      <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-blue-200 dark:bg-blue-800 rounded-full opacity-15 animate-bounce delay-2000" />
      <div className="absolute bottom-1/3 right-1/3 w-14 h-14 bg-purple-200 dark:bg-purple-800 rounded-full opacity-15 animate-pulse delay-3000" />
      <div className="absolute top-1/4 right-1/5 w-6 h-6 bg-yellow-200 dark:bg-yellow-800 rounded-full opacity-20 animate-ping delay-1500" />

      {/* Floating Particles */}
      <div className="absolute top-10 left-20 w-2 h-2 bg-white/30 rounded-full animate-float delay-500" />
      <div className="absolute top-40 right-10 w-1.5 h-1.5 bg-white/40 rounded-full animate-float delay-1000" />
      <div className="absolute bottom-20 left-1/3 w-2.5 h-2.5 bg-white/20 rounded-full animate-float delay-2000" />
      <div className="absolute top-1/3 right-20 w-1 h-1 bg-white/50 rounded-full animate-float delay-3000" />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-3 sm:p-4">
        <div className="w-full max-w-sm sm:max-w-md mx-auto">
          {/* Mobile-First Single Column Layout */}
          <div className="space-y-6">
            {/* Logo and Title Section - Enhanced Animation */}
            <div className="text-center space-y-4 animate-fade-in-up">
              <div className="flex justify-center animate-bounce-in delay-300">
                <div className="p-3 rounded-2xl bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
                  <Scale className="h-10 w-10 text-orange-600 animate-pulse" />
                </div>
              </div>
              <div className="space-y-2 animate-fade-in-up delay-500">
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 via-orange-500 to-green-600 bg-clip-text text-transparent leading-tight animate-gradient-x">
                  LegalAI Assistant
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 px-4 leading-relaxed animate-fade-in-up delay-700">
                  Your intelligent legal companion powered by advanced AI for Indian law.
                </p>
              </div>
            </div>

            {/* Features - Enhanced with Hover Effects and Stagger Animation */}
            {/* <div className="grid grid-cols-2 gap-2 sm:gap-3 animate-fade-in-up delay-900">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 sm:p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg backdrop-blur-sm border border-white/30 dark:border-gray-700/30 hover:bg-white/80 dark:hover:bg-gray-800/80 hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-pointer group animate-slide-in-up"
                  style={{ animationDelay: `${1000 + index * 200}ms` }}
                >
                  <feature.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${feature.color} group-hover:scale-110 transition-transform duration-300`} />
                  <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 leading-tight group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors duration-300">{feature.text}</span>
                </div>
              ))}
            </div> */}

            {/* Custom Login Button with Glass Morphism - Enhanced */}
            <div className="relative animate-fade-in-up delay-1500">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/40 via-white/30 to-green-500/40 rounded-2xl sm:rounded-3xl blur-xl animate-pulse-slow"></div>
              <div className="relative bg-white/10 dark:bg-gray-800/10 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-1 border border-white/20 dark:border-gray-700/20 shadow-2xl hover:shadow-3xl transition-all duration-500 group">

                <Button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-orange-500 via-orange-400 to-green-500 hover:from-orange-600 hover:via-orange-500 hover:to-green-600 text-white font-semibold py-4 px-8 rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-0 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none group-hover:shadow-2xl"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="h-5 w-5 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                      Sign in with Google
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Footer Text - Enhanced */}
            <div className="text-center space-y-3 animate-fade-in-up delay-1700">
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed px-4 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-300">
                By signing in, you agree to our{' '}
                <a href="#" className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 underline font-medium transition-all duration-300 hover:scale-105 inline-block">
                  Terms
                </a>{' '}
                and{' '}
                <a href="#" className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 underline font-medium transition-all duration-300 hover:scale-105 inline-block">
                  Privacy Policy
                </a>
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 transition-colors duration-300 group">
                <Shield className="h-3 w-3 group-hover:scale-110 transition-transform duration-300" />
                <span className="group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300">Enterprise-grade security protection</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
