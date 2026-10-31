// SmartQR Admin Layout — Android-style top app bar, navigation drawer & bottom navigation bar
// Route: /admin/*

import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  ExternalLink,
  ArrowLeft,
  LogOut,
  Home,
  Utensils,
  Wifi,
  Star,
  QrCode,
  Printer,
  QrCode as Logo,
  Dumbbell,
  Hotel,
  Scissors,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthContext } from '../../hooks/useAuthContext';
import { useBusiness } from '../../providers/BusinessProvider';
import { AdminBottomNav } from '../ui/BottomNav';
import { BusinessTypeIcon, getBusinessTypeMeta } from '../ui/BusinessTypeIcon';
import { cn } from '../ui/utils';
import { useLanguage } from '../../i18n/LanguageContext';
import { LanguageToggle } from '../ui/LanguageToggle';

function DrawerContent({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  const { user, signOut } = useAuthContext();
  const { businesses, selectedBusiness } = useBusiness();
  const { t, language } = useLanguage();
  const currentBusiness = selectedBusiness || businesses[0] || null;

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const bizNameLower = currentBusiness?.name?.toLowerCase() || '';
  const bizSlugLower = currentBusiness?.slug?.toLowerCase() || '';
  const isGym = currentBusiness && (
    currentBusiness.business_type === 'gym' ||
    bizNameLower.includes('gym') ||
    bizNameLower.includes('fitness') ||
    bizSlugLower.includes('gym') ||
    bizSlugLower.includes('fitness')
  );
  const isHospitality = currentBusiness && (
    ['hotel', 'villa', 'homestay'].includes(currentBusiness.business_type) ||
    bizNameLower.includes('hotel') ||
    bizNameLower.includes('villa') ||
    bizNameLower.includes('homestay') ||
    bizNameLower.includes('resort')
  );
  const isBeauty = currentBusiness && (
    ['salon', 'barbershop'].includes(currentBusiness.business_type) ||
    bizNameLower.includes('salon') ||
    bizNameLower.includes('barber')
  );

  const menuLabel = isGym
    ? (language === 'id' ? 'Paket & Layanan' : 'Plans & Services')
    : isHospitality
    ? (language === 'id' ? 'Katalog & Layanan' : 'Directory & Services')
    : isBeauty
    ? (language === 'id' ? 'Price List & Layanan' : 'Services & Rates')
    : t('nav', 'menu');

  const MenuIcon = isGym
    ? Dumbbell
    : isHospitality
    ? Hotel
    : isBeauty
    ? Scissors
    : Utensils;

  const navItems = [
    { name: t('nav', 'dashboard'), path: '/admin', icon: Home },
    { name: menuLabel, path: '/admin/menu', icon: MenuIcon },
    { name: t('nav', 'wifi'), path: '/admin/wifi', icon: Wifi },
    { name: t('nav', 'review'), path: '/admin/review', icon: Star },
    { name: t('nav', 'qrCode'), path: '/admin/qr', icon: QrCode },
    { name: t('nav', 'printQr'), path: '/admin/qr/print', icon: Printer },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 h-16 shrink-0 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-md shadow-primary/30">
            <Logo className="w-5 h-5 text-white" />
          </div>
          <div className="leading-tight">
            <p className="font-extrabold text-ink tracking-tight">SmartQR</p>
            <p className="text-[11px] font-medium text-ink-muted">{t('nav', 'adminPanel')}</p>
          </div>
        </div>
        <LanguageToggle variant="minimal" />
      </div>

      {currentBusiness && (
        <div className="mx-4 mt-3 mb-3 p-3 rounded-3xl bg-primary-50 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white text-primary flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
            {currentBusiness.logo_url ? (
              <img src={currentBusiness.logo_url} alt="" className="w-full h-full object-cover" decoding="async" />
            ) : (
              <BusinessTypeIcon type={currentBusiness.business_type} fallbackName={currentBusiness.name} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-ink truncate">{currentBusiness.name}</p>
            <p className="text-xs text-ink-muted">
              {getBusinessTypeMeta(currentBusiness.business_type, language, currentBusiness.name).label}
            </p>
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-3 py-1 space-y-0.5" aria-label="Menu admin">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3.5 px-4 h-12 rounded-full text-sm transition-colors',
                isActive ? 'bg-primary-100 text-primary-800 font-bold' : 'text-ink-muted font-medium hover:bg-surface'
              )
            }
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <span className="truncate">{item.name}</span>
          </NavLink>
        ))}
        {currentBusiness && (
          <a
            href={`/q/${currentBusiness.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3.5 px-4 h-12 rounded-full text-sm font-medium text-ink-muted hover:bg-surface"
          >
            <ExternalLink className="w-5 h-5 shrink-0" />
            <span>{t('nav', 'viewPublicPage')}</span>
          </a>
        )}
      </nav>

      <div className="p-4 shrink-0 space-y-2">
        <div className="flex items-center gap-3 p-2 pl-3 rounded-full bg-surface">
          <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shrink-0">
            {(user?.email || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-ink truncate">{user?.email || 'Owner'}</p>
            <p className="text-[11px] text-ink-muted">Administrator</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-9 h-9 rounded-full flex items-center justify-center text-ink-muted hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
            aria-label={t('nav', 'logout')}
            title={t('nav', 'logout')}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { businesses, selectedBusiness } = useBusiness();
  const { t } = useLanguage();

  const pageTitles: Record<string, string> = {
    '/admin/menu': t('nav', 'menu'),
    '/admin/wifi': t('nav', 'wifi'),
    '/admin/review': t('nav', 'review'),
    '/admin/qr': t('nav', 'qrCode'),
    '/admin/qr/print': t('nav', 'printQr'),
    '/onboarding': t('nav', 'onboarding'),
  };

  const currentBusiness = selectedBusiness || businesses[0] || null;
  const isHome = ['/admin', '/admin/'].includes(location.pathname);
  const title = isHome ? currentBusiness?.name || 'SmartQR' : pageTitles[location.pathname] || 'SmartQR';

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setDrawerOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-[100dvh] bg-surface print:bg-white flex flex-col">
      {/* Top app bar (mobile) */}
      <header
        className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-surface/90 backdrop-blur-lg print:hidden border-b border-stone-200/40"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="flex items-center gap-1 h-16 px-2 max-w-md mx-auto">
          {isHome ? (
            <button
              onClick={() => setDrawerOpen(true)}
              className="w-12 h-12 rounded-full flex items-center justify-center text-ink active:bg-primary-100 transition-colors"
              aria-label="Buka menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          ) : (
            <button
              onClick={() => navigate(-1)}
              className="w-12 h-12 rounded-full flex items-center justify-center text-ink active:bg-primary-100 transition-colors"
              aria-label={t('common', 'back')}
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
          <h1 className="flex-1 min-w-0 text-lg font-bold text-ink truncate tracking-tight">{title}</h1>
          <div className="flex items-center gap-1">
            <LanguageToggle variant="minimal" />
            {currentBusiness && (
              <a
                href={`/q/${currentBusiness.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center text-ink-muted active:bg-primary-100 transition-colors"
                aria-label={t('nav', 'viewPublicPage')}
                title={t('nav', 'viewPublicPage')}
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Permanent drawer (desktop) */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:w-72 bg-white border-r border-outline/50 print:hidden">
        <DrawerContent />
      </aside>

      {/* Main content */}
      <div className="lg:ml-72 flex-1 flex flex-col">
        <main
          className="flex-1 pt-[calc(4rem+env(safe-area-inset-top,0px))] lg:pt-0 print:pt-0"
        >
          <div
            className="w-full max-w-md lg:max-w-3xl mx-auto px-4 pt-2 lg:px-8 lg:py-8 animate-fade-in pb-[calc(6rem+env(safe-area-inset-bottom,0px))] lg:pb-10 print:p-0"
            key={location.pathname}
          >
            <Outlet />
          </div>
        </main>
      </div>

      <div className="print:hidden">
        <AdminBottomNav />
      </div>

      {/* Modal navigation drawer (mobile) */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Menu navigasi">
          <div className="absolute inset-0 bg-ink/40 animate-scrim" onClick={() => setDrawerOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-[86%] max-w-[320px] bg-white rounded-r-[28px] shadow-2xl animate-slide-in overflow-hidden">
            <button
              onClick={() => setDrawerOpen(false)}
              className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full flex items-center justify-center text-ink-muted hover:bg-surface"
              aria-label={t('common', 'close')}
            >
              <X className="w-5 h-5" />
            </button>
            <DrawerContent onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}
    </div>
  );
}
