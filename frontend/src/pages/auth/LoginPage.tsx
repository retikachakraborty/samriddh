import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Lock, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LotusLogo } from '../../components/ui/LotusLogo';

export const LoginPage: React.FC = () => {
  const { signin, loginAsDemo, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/app/overview';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await signin(email, password);
      const from = (location.state as any)?.from?.pathname || '/app/overview';
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid credentials or connection error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await loginAsDemo();
      navigate('/app/overview', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Demo session initialisation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory-100 flex flex-col md:flex-row antialiased">
      {/* Left Brand Showcase Panel */}
      <section className="md:w-1/2 bg-gradient-to-br from-forest-950 via-forest-900 to-forest-800 text-ivory-100 p-8 sm:p-14 lg:p-20 flex flex-col justify-between relative overflow-hidden border-r border-gold-500/20">
        {/* Visible Lotus Watermark */}
        <div className="absolute -bottom-16 -right-16 text-gold-400/10 pointer-events-none">
          <LotusLogo size={320} />
        </div>
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-forest-900 border border-gold-500/30 flex items-center justify-center text-gold-400 shadow-gold-glow">
              <LotusLogo size={28} className="text-gold-400" />
            </div>
            <div>
              <span className="font-serif font-bold text-2xl tracking-tight text-white block">
                SAMRIDDH
              </span>
              <span className="text-[10px] uppercase tracking-[0.25em] text-gold-400 font-semibold block">
                Prosperity &amp; Intelligence
              </span>
            </div>
          </div>

          <div className="pt-8 space-y-4 max-w-lg">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/15 border border-gold-400/30 text-gold-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Executive SaaS Platform
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-ivory-50 leading-[1.15]">
              See your business <br />
              <span className="gold-sheen italic">move forward in abundance.</span>
            </h1>

            <p className="text-sm sm:text-base text-ivory-300 font-normal leading-relaxed">
              Enterprise customer segmentation, retail velocity analytics, voice-of-customer synthesis,
              and SAM autonomous intelligence—grounded in verified production data.
            </p>
          </div>
        </div>

        {/* Feature badges */}
        <div className="relative z-10 pt-12 space-y-3">
          <div className="flex items-center gap-3 text-xs text-ivory-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>536,641 Clean Retail Transactions &amp; 100K Reviews</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-ivory-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Multi-dimensional RFM Customer Intelligence Engine</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-ivory-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Zero Data Hallucination — Protected PostgREST Backend</span>
          </div>
        </div>
      </section>

      {/* Right Form Panel */}
      <section className="md:w-1/2 bg-ivory-100 p-8 sm:p-14 lg:p-20 flex items-center justify-center">
        <div className="w-full max-w-md space-y-8 bg-white p-8 sm:p-10 rounded-2xl border border-ivory-300 shadow-luxury">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-gold-700">
              Access Portal
            </span>
            <h2 className="text-2xl font-serif font-bold text-forest-950 mt-1">
              Sign In to Samriddh
            </h2>
            <p className="text-xs text-forest-600 mt-1">
              Enter your executive credentials to access the analytics workspace
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Demo Access Button */}
          <div className="p-4 rounded-xl bg-forest-950 text-white border border-gold-500/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gold-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                1-Click Demo Access
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Read-only
              </span>
            </div>
            <p className="text-xs text-ivory-300 leading-snug">
              Evaluate full live data, RFM customers, Voice of Customer spatial stream, priorities, and SAM intelligence.
            </p>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-lg bg-gold-500 hover:bg-gold-400 text-forest-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-gold-glow active:scale-98"
            >
              <span>Launch Samriddh Demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-ivory-300" />
            <span className="flex-shrink mx-4 text-[11px] text-forest-500 uppercase tracking-widest font-medium">
              Or with credentials
            </span>
            <div className="flex-grow border-t border-ivory-300" />
          </div>

          {/* Standard Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-forest-800 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-forest-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="executive@samriddh.io"
                  className="w-full pl-10 pr-4 py-2.5 bg-ivory-50 border border-ivory-300 rounded-xl text-sm text-forest-950 focus:outline-none focus:border-gold-500 focus:bg-white transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-forest-800 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-forest-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-ivory-50 border border-ivory-300 rounded-xl text-sm text-forest-950 focus:outline-none focus:border-gold-500 focus:bg-white transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-forest-600">
            <span>Don't have an account? </span>
            <Link to="/signup" className="font-semibold text-gold-700 hover:text-gold-800 underline">
              Create an account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
