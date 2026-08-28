import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  MessageSquareHeart,
  Globe2,
  Sparkles,
  LogOut,
  Menu,
  X,
  Clock,
  ShieldCheck,
  ChevronRight,
  CheckSquare,
  ShieldAlert,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LotusEffect } from '../components/effects/LotusEffect';
import { LotusLogo } from '../components/ui/LotusLogo';

export const AppLayout: React.FC = () => {
  const { user, profile, isDemo, signout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-GB', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000 * 30);
    return () => clearInterval(timer);
  }, []);

  const handleSignout = async () => {
    await signout();
    navigate('/login');
  };

  const navItems = [
    {
      to: '/app/overview',
      label: 'Executive Overview',
      icon: <LayoutDashboard className="w-4 h-4" />,
      badge: 'Flagship',
    },
    {
      to: '/app/customers',
      label: 'Customer Intelligence',
      icon: <Users className="w-4 h-4" />,
      badge: 'RFM',
    },
    {
      to: '/app/products',
      label: 'Product Performance',
      icon: <Package className="w-4 h-4" />,
    },
    {
      to: '/app/reviews',
      label: 'Voice of Customer',
      icon: <MessageSquareHeart className="w-4 h-4" />,
      badge: 'Spatial Flow',
    },
    {
      to: '/app/countries',
      label: 'Global Geography',
      icon: <Globe2 className="w-4 h-4" />,
    },
    {
      to: '/app/priorities',
      label: 'Priorities & Action',
      icon: <CheckSquare className="w-4 h-4" />,
      badge: 'Action',
    },
    {
      to: '/app/sam',
      label: 'SAM Analytics Agent',
      icon: <Sparkles className="w-4 h-4 text-gold-400" />,
      isAi: true,
      badge: 'Agent',
    },
  ];

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/overview')) return 'Executive Overview';
    if (path.includes('/customers')) return 'Customer Intelligence & RFM';
    if (path.includes('/products')) return 'Product Portfolio & Returns';
    if (path.includes('/reviews')) return 'Voice of Customer & Sentiment';
    if (path.includes('/countries')) return 'Global Geographic Markets';
    if (path.includes('/priorities')) return 'Priorities & Action Directives';
    if (path.includes('/sam')) return 'SAM Agentic Analytics Workspace';
    return 'Intelligence Portal';
  };

  return (
    <div className="min-h-screen bg-ivory-100 flex flex-col md:flex-row text-forest-900 font-sans antialiased relative">
      {/* Ambient Lotus Floating Background */}
      <LotusEffect />

      {/* Desktop Luxury Sidebar */}
      <aside className="hidden md:flex md:w-64 lg:w-72 bg-gradient-to-b from-forest-950 via-forest-900 to-forest-950 text-ivory-100 flex-col sticky top-0 h-screen border-r border-gold-500/20 shadow-2xl z-30 shrink-0">
        {/* Brand Badge */}
        <div className="p-6 border-b border-ivory-300/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-forest-900 border border-gold-500/30 flex items-center justify-center text-gold-400 shadow-gold-glow">
              <LotusLogo size={24} className="text-gold-400" />
            </div>
            <div>
              <span className="font-serif font-bold text-xl tracking-tight text-white block leading-none">
                SAMRIDDH
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-gold-400 font-semibold block mt-1">
                Prosperity &amp; Intelligence
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] uppercase tracking-[0.2em] font-semibold text-ivory-400/60">
            Intelligence Modules
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group ${
                  isActive
                    ? item.isAi
                      ? 'bg-gradient-to-r from-gold-500/20 to-gold-500/10 text-gold-300 border border-gold-500/40 shadow-sm font-semibold'
                      : 'bg-forest-800 text-white border border-forest-600/40 shadow-sm font-semibold'
                    : 'text-ivory-300 hover:text-white hover:bg-forest-800/50'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <span className="transition-transform group-hover:scale-110">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[9px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    item.isAi
                      ? 'bg-gold-500 text-forest-950 font-bold shadow-sm'
                      : 'bg-forest-700 text-ivory-200'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer: Clear Demo / User Profile */}
        <div className="p-4 border-t border-ivory-300/10 bg-forest-950/90">
          <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-forest-900/80 border border-ivory-300/10">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gold-500/20 border border-gold-400/40 text-gold-300 font-bold text-xs flex items-center justify-center shrink-0">
                {profile.avatarInitials}
              </div>
              <div className="truncate text-left">
                <p className="text-xs font-semibold text-white truncate">
                  {profile.name}
                </p>
                <p className="text-[10px] text-emerald-300 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  {profile.accessLevel}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignout}
              title="Sign out"
              className="p-1.5 rounded-lg text-ivory-400 hover:text-rose-300 hover:bg-forest-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Navigation Bar */}
      <header className="md:hidden bg-forest-950 text-white px-4 py-3.5 flex items-center justify-between sticky top-0 z-40 border-b border-gold-500/20 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-forest-950 font-serif font-bold text-base shadow-sm">
            ✦
          </div>
          <span className="font-serif font-bold text-lg tracking-tight text-white">
            SAMRIDDH
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isDemo && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-400/30">
              DEMO MODE
            </span>
          )}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-ivory-200 hover:text-white hover:bg-forest-800"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-forest-950 flex flex-col pt-16 px-6 pb-6 overflow-y-auto">
          <div className="flex items-center justify-between pb-6 border-b border-ivory-300/10 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gold-500 flex items-center justify-center text-forest-950 font-serif font-bold text-lg">
                ✦
              </div>
              <span className="font-serif font-bold text-xl text-white">SAMRIDDH</span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg text-ivory-200 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gold-500 text-forest-950 font-bold'
                      : 'text-ivory-200 hover:bg-forest-900'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-forest-800 text-gold-300 font-semibold">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="pt-6 border-t border-ivory-300/10 mt-6 flex items-center justify-between">
            <div className="text-xs text-ivory-300">
              <p className="font-semibold text-white">{profile.name}</p>
              <p className="text-[10px] text-emerald-400">{profile.accessLevel}</p>
            </div>
            <button
              onClick={handleSignout}
              className="px-4 py-2 rounded-lg bg-forest-900 text-rose-300 text-xs font-semibold hover:bg-forest-800 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden relative z-10">
        {/* Top Header Bar */}
        <header className="hidden md:flex items-center justify-between px-8 lg:px-12 py-4 bg-white/80 backdrop-blur-md border-b border-ivory-300 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-xs text-forest-600 font-medium">Samriddh</span>
            <ChevronRight className="w-3.5 h-3.5 text-forest-400" />
            <h1 className="text-sm font-semibold text-forest-950 font-serif">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-4 text-xs">
            {/* Subtle Demo Indicator */}
            {isDemo ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-900 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="tracking-wide text-[11px] uppercase">DEMO MODE · Read-only</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest-50 border border-forest-200 text-forest-800 font-medium">
                <span className="w-2 h-2 rounded-full bg-forest-600" />
                <span>Authorized Session</span>
              </div>
            )}

            {currentTime && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ivory-200/60 border border-ivory-300 text-forest-700">
                <Clock className="w-3.5 h-3.5 text-gold-600" />
                <span>{currentTime}</span>
              </div>
            )}

            {/* Profile Menu Trigger */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl bg-ivory-100 hover:bg-ivory-200 border border-ivory-300 text-forest-950 transition-colors"
                aria-label="User profile menu"
              >
                <div className="w-7 h-7 rounded-full bg-forest-900 text-gold-300 font-bold text-xs flex items-center justify-center">
                  {profile.avatarInitials}
                </div>
                <div className="text-left hidden lg:block pr-2">
                  <p className="text-xs font-semibold leading-tight">{profile.name}</p>
                  <p className="text-[10px] text-forest-600 leading-tight">{profile.roleTitle}</p>
                </div>
              </button>

              {/* Profile Dropdown */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-ivory-300 shadow-luxury-lg p-4 space-y-3 z-50">
                  <div className="border-b border-ivory-200 pb-2.5">
                    <p className="text-xs font-bold text-forest-950">{profile.name}</p>
                    <p className="text-[11px] text-forest-600">{profile.roleTitle}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {profile.accessLevel}
                    </span>
                  </div>

                  <button
                    onClick={handleSignout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Outlet */}
        <main className="flex-1 px-4 sm:px-8 lg:px-12 py-8 max-w-7xl w-full mx-auto space-y-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
