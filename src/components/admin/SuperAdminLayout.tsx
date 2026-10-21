import { Outlet, useNavigate } from 'react-router-dom';
import { LogOut, ShieldCheck } from 'lucide-react';
import { useAuthContext } from '../../hooks/useAuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { LanguageToggle } from '../ui/LanguageToggle';

export function SuperAdminLayout() {
  const navigate = useNavigate();
  const { user, signOut } = useAuthContext();
  const { t } = useLanguage();

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-[100dvh] bg-surface">
      <header
        className="sticky top-0 z-30 bg-surface/90 backdrop-blur-lg border-b border-stone-200/50"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="flex items-center gap-3 h-16 px-4 max-w-5xl mx-auto">
          <div className="w-10 h-10 rounded-2xl bg-ink text-white flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 leading-tight">
            <p className="font-extrabold text-ink tracking-tight">{t('superAdmin', 'title')}</p>
            <p className="text-[11px] text-ink-muted truncate">{user?.email}</p>
          </div>
          <LanguageToggle variant="minimal" />
          <button
            onClick={handleLogout}
            className="w-11 h-11 rounded-full flex items-center justify-center text-ink-muted hover:text-red-600 hover:bg-red-50 transition-colors"
            aria-label={t('nav', 'logout')}
            title={t('nav', 'logout')}
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>
      <main className="animate-fade-in">
        <Outlet />
      </main>
    </div>
  );
}
