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
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthContext } from '../../hooks/useAuthContext';
import { useBusiness } from '../../providers/BusinessProvider';
import { AdminBottomNav } from '../ui/BottomNav';
import { BusinessTypeIcon, getBusinessTypeMeta } from '../ui/BusinessTypeIcon';
import { cn } from '../ui/utils';

const NAV_ITEMS = [
  { name: 'Beranda', path: '/admin', icon: Home },
  { name: 'Kelola Menu', path: '/admin/menu', icon: Utensils },
  { name: 'Akses WiFi', path: '/admin/wifi', icon: Wifi },
  { name: 'Google Review', path: '/admin/review', icon: Star },
  { name: 'QR Code', path: '/admin/qr', icon: QrCode },
  { name: 'Cetak QR', path: '/admin/qr/print', icon: Printer },
];

const PAGE_TITLES: Record<string, string> = {
  '/admin/menu': 'Kelola Menu',
  '/admin/wifi': 'Akses WiFi',
  '/admin/review': 'Google Review',
  '/admin/qr': 'QR Code',
  '/admin/qr/print': 'Cetak QR',
  '/onboarding': 'Buat Bisnis',
};

function DrawerContent({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  const { user, signOut } = useAuthContext();
  const { businesses, selectedBusiness } = useBusiness();
  const currentBusiness = selectedBusiness || businesses[0] || null;

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 h-16 shrink-0">
        <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-md shadow-primary/30">
          <Logo className="w-5 h-5 text-white" />
        </div>
        <div className="leading-tight">
          <p className="font-extrabold text-ink tracking-tight">SmartQR</p>
          <p className="text-[11px] font-medium text-ink-muted">Panel Admin</p>
        </div>
      </div>

      {currentBusiness && (
        <div className="mx-4 mt-2 mb-3 p-3 rounded-3xl bg-primary-50 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white text-primary flex items-center justify-center shrink-0 overflow-hidden">
            {currentBusiness.logo_url ? (
              <img src={currentBusiness.logo_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <BusinessTypeIcon type={currentBusiness.business_type} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-ink truncate">{currentBusiness.name}</p>
            <p className="text-xs text-ink-muted">{getBusinessTypeMeta(currentBusiness.business_type).label}</p>
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-3 py-1 space-y-0.5" aria-label="Menu admin">
        {NAV_ITEMS.map((item) => (
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
            <span>Lihat Halaman Publik</span>
          </a>
        )}
      </nav>

      <div className="p-4 shrink-0">
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
            aria-label="Keluar"
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

  const currentBusiness = selectedBusiness || businesses[0] || null;
  const isHome = ['/admin', '/admin/'].includes(location.pathname);
  const title = isHome ? currentBusiness?.name || 'SmartQR' : PAGE_TITLES[location.pathname] || 'SmartQR';

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
        className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-surface/90 backdrop-blur-lg print:hidden"
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
              aria-label="Kembali"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
          <h1 className="flex-1 min-w-0 text-lg font-bold text-ink truncate tracking-tight">{title}</h1>
          {currentBusiness && (
            <a
              href={`/q/${currentBusiness.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full flex items-center justify-center text-ink-muted active:bg-primary-100 transition-colors"
              aria-label="Lihat halaman publik"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
          )}
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
              aria-label="Tutup menu"
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
