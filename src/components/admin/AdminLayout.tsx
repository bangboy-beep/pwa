// SmartQR Admin Layout — Mobile top bar with back nav + Desktop sidebar
// Route: /admin/*

import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ExternalLink, ChevronLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthContext } from '../../hooks/useAuthContext';
import { useBusiness } from '../../providers/BusinessProvider';
import { cn } from '../ui/utils';

const NAV_ITEMS = [
  { name: 'Home', path: '/admin', icon: '🏠' },
  { name: 'Menu', path: '/admin/menu', icon: '📋' },
  { name: 'WiFi', path: '/admin/wifi', icon: '📶' },
  { name: 'Review', path: '/admin/review', icon: '⭐' },
  { name: 'QR', path: '/admin/qr', icon: '🔲' },
];


const PAGE_TITLES: Record<string, string> = {
  '/admin/menu': 'Kelola Menu',
  '/admin/wifi': 'Kelola WiFi',
  '/admin/review': 'Google Review',
  '/admin/qr': 'QR Code',
  '/admin/qr/print': 'Cetak QR',
};

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuthContext();
  const { businesses, selectedBusiness } = useBusiness();

  const currentBusiness = selectedBusiness || businesses[0] || null;
  const isSubpage = !['/admin', '/admin/'].includes(location.pathname);
  const currentPageName = PAGE_TITLES[location.pathname] || NAV_ITEMS.find(n => n.path !== '/admin' && location.pathname.startsWith(n.path))?.name || 'SmartQR';

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 1024) setSidebarOpen(false) };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  const handleBack = () => navigate(-1);

  return (
    <div className="min-h-[100dvh] bg-[#f5f0eb] print:bg-white antialiased flex flex-col">
      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-stone-200" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="relative flex items-center h-14 px-4 max-w-[420px] mx-auto">
          {isSubpage ? (
            <button onClick={handleBack} className="flex h-10 w-10 items-center justify-center rounded-full text-stone-700 active:bg-stone-100 transition-colors z-10 -ml-2" aria-label="Kembali">
              <ChevronLeft className="w-6 h-6" />
            </button>
          ) : (
            <button onClick={() => setSidebarOpen(true)} className="flex h-10 w-10 items-center justify-center rounded-full text-stone-700 active:bg-stone-100 transition-colors z-10 -ml-2" aria-label="Menu">
              <Menu className="w-6 h-6" />
            </button>
          )}

          <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
            <h1 className="text-[16px] font-bold text-stone-900 truncate tracking-tight">
              {isSubpage ? currentPageName : (currentBusiness?.name || 'SmartQR')}
            </h1>
          </div>

          <div className="w-8 h-8 shrink-0" />
        </div>
      </header>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-64 border-r border-stone-200" style={{ background: '#ffffff' }}>
        <div className="h-14 flex items-center gap-2.5 px-4 border-b border-stone-100 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#f0883a] flex items-center justify-center shadow-sm">
            <span className="text-white text-[11px] font-black">QR</span>
          </div>
          <span className="font-bold text-base text-stone-900 tracking-tight">SmartQR</span>
          <span className="ml-auto text-[10px] text-stone-400 font-medium">Admin</span>
        </div>


        <nav className="flex-1 overflow-y-auto px-3 space-y-1 py-2">
          {currentBusiness && (
            <a href={`/q/${currentBusiness.slug}`} target="_blank" rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-all duration-200">
              <ExternalLink className="w-4 h-4 shrink-0" />
              <span className="text-sm leading-5 font-medium">Lihat Publik</span>
            </a>
          )}
        </nav>

        <div className="p-4 border-t border-stone-100 shrink-0">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-stone-50">
            <div className="w-8 h-8 rounded-lg bg-[#f0883a] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {(user?.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold text-stone-900 truncate">{user?.email || 'Owner'}</p>
              <p className="text-[9px] text-stone-500 uppercase font-bold tracking-tighter">Administrator</p>
            </div>
            <button onClick={handleLogout} className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0" title="Logout">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64 flex-1 flex flex-col">
        <main
          className="flex-1 lg:pt-0"
          style={{
            paddingTop: 'calc(3.5rem + env(safe-area-inset-top, 0px))',
          }}
        >
          <div
            className="w-full max-w-[420px] mx-auto px-4 py-6 lg:px-8 lg:py-8"
            style={{
              paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))',
            }}
          >
            <Outlet />
          </div>
        </main>

        {/* Mobile bottom nav — MD3 Navigation Bar style */}
        <div
          className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-stone-200"
          style={{
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          }}
        >
          <div className="flex items-center justify-around h-16 max-w-[420px] mx-auto px-2">
            {NAV_ITEMS.slice(0, 4).map((item) => (
              <button key={item.path} onClick={() => navigate(item.path)}
                className={cn(
                  'flex flex-col items-center gap-1 py-1 px-2 min-w-[64px] transition-all duration-200',
                  isActive(item.path) ? 'text-stone-900' : 'text-stone-500'
                )}>
                <div className={cn(
                  'px-5 py-1 rounded-xl transition-colors',
                  isActive(item.path) ? 'bg-orange-100 text-[#f0883a]' : 'active:bg-stone-100'
                )}>
                  <span className="text-xl leading-none">{item.icon}</span>
                </div>
                <span className={cn(
                  'text-[11px] leading-none tracking-tight font-medium',
                  isActive(item.path) && 'font-bold'
                )}>{item.name}</span>
              </button>
            ))}
            <button onClick={() => navigate('/admin/qr')}
              className={cn(
                'flex flex-col items-center gap-1 py-1 px-2 min-w-[64px] transition-all duration-200',
                location.pathname.startsWith('/admin/qr') ? 'text-stone-900' : 'text-stone-500'
              )}>
              <div className={cn(
                'px-5 py-1 rounded-xl transition-colors',
                location.pathname.startsWith('/admin/qr') ? 'bg-orange-100 text-[#f0883a]' : 'active:bg-stone-100'
              )}>
                <span className="text-xl leading-none">⚙️</span>
              </div>
              <span className={cn(
                'text-[11px] leading-none tracking-tight font-medium',
                location.pathname.startsWith('/admin/qr') && 'font-bold'
              )}>Lainnya</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-white flex flex-col shadow-2xl">
            <div className="h-14 flex items-center gap-2.5 px-4 border-b border-stone-100 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-[#f0883a] flex items-center justify-center shadow-sm">
                <span className="text-white text-[11px] font-black">QR</span>
              </div>
              <span className="font-bold text-base text-stone-900 tracking-tight">SmartQR</span>
              <button onClick={() => setSidebarOpen(false)} className="p-2 -mr-1 rounded-full text-stone-400 active:bg-stone-100 ml-auto" aria-label="Tutup">
                <X className="w-5 h-5" />
              </button>
            </div>

            {currentBusiness && (
              <div className="mx-4 my-4 px-3 py-3 rounded-xl bg-stone-50 border border-stone-100">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Bisnis Aktif</p>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-white border border-stone-100 flex items-center justify-center text-lg shrink-0">
                    {currentBusiness.business_type === 'cafe' && '☕'}
                    {currentBusiness.business_type === 'restaurant' && '🍽️'}
                    {currentBusiness.business_type === 'hotel' && '🏨'}
                    {currentBusiness.business_type === 'bar' && '🍸'}
                    {currentBusiness.business_type === 'salon' && '💇'}
                    {currentBusiness.business_type === 'barbershop' && '💈'}
                    {currentBusiness.business_type === 'other' && '📋'}
                    {['homestay', 'villa'].includes(currentBusiness.business_type || '') && '🏠'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-stone-900 truncate">{currentBusiness.name}</p>
                    <p className="text-[10px] text-stone-500 capitalize">{currentBusiness.business_type}</p>
                  </div>
                </div>
              </div>
            )}

            <nav className="flex-1 overflow-y-auto px-3 space-y-1 py-2">
              {currentBusiness && (
                <a href={`/q/${currentBusiness.slug}`} target="_blank" rel="noopener noreferrer"
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-all duration-200">
                  <ExternalLink className="w-4 h-4 shrink-0" />
                  <span className="text-sm leading-5 font-medium">Lihat Publik</span>
                </a>
              )}
            </nav>

            <div className="p-4 border-t border-stone-100 shrink-0">
              <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-stone-50">
                <div className="w-8 h-8 rounded-lg bg-[#f0883a] flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {(user?.email || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold text-stone-900 truncate">{user?.email || 'Owner'}</p>
                  <p className="text-[9px] text-stone-500 uppercase font-bold tracking-tighter">Administrator</p>
                </div>
                <button onClick={handleLogout} className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0" title="Logout">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
