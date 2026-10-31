import { NavLink, useParams } from 'react-router-dom';
import { Home, Utensils, Wifi, Star, QrCode, Dumbbell, Hotel, Scissors } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useBusiness } from '../../providers/BusinessProvider';

interface NavItem {
  name: string;
  path: string;
  icon: LucideIcon;
  end?: boolean;
}

function NavBar({ items, className = '' }: { items: NavItem[]; className?: string }) {
  return (
    <nav
      aria-label="Navigasi utama"
      className={`fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-outline/60 ${className}`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-stretch justify-around h-[72px] max-w-md mx-auto px-1">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className="group flex-1 flex flex-col items-center justify-center gap-1 min-w-0"
          >
            {({ isActive }) => (
              <>
                <span
                  className={`flex items-center justify-center h-8 w-14 rounded-full transition-all duration-200 ${
                    isActive ? 'bg-primary-100 text-primary-800' : 'text-ink-muted group-active:bg-primary-50'
                  }`}
                >
                  <item.icon className="w-[22px] h-[22px]" strokeWidth={isActive ? 2.4 : 2} />
                </span>
                <span
                  className={`text-[11px] leading-none truncate ${
                    isActive ? 'font-bold text-ink' : 'font-medium text-ink-muted'
                  }`}
                >
                  {item.name}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export function CustomerBottomNav() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useLanguage();
  if (!slug) return null;

  return (
    <NavBar
      items={[
        { name: t('nav', 'dashboard'), path: `/q/${slug}`, icon: Home },
        { name: t('nav', 'menu'), path: `/m/${slug}`, icon: Utensils },
        { name: t('nav', 'wifi'), path: `/w/${slug}`, icon: Wifi },
        { name: t('nav', 'review'), path: `/r/${slug}`, icon: Star },
      ]}
    />
  );
}

export function AdminBottomNav() {
  const { t, language } = useLanguage();
  const { selectedBusiness } = useBusiness();

  const bizNameLower = selectedBusiness?.name?.toLowerCase() || '';
  const bizSlugLower = selectedBusiness?.slug?.toLowerCase() || '';
  const isGym = selectedBusiness && (
    selectedBusiness.business_type === 'gym' ||
    bizNameLower.includes('gym') ||
    bizNameLower.includes('fitness') ||
    bizSlugLower.includes('gym') ||
    bizSlugLower.includes('fitness')
  );
  const isHospitality = selectedBusiness && (
    ['hotel', 'villa', 'homestay'].includes(selectedBusiness.business_type) ||
    bizNameLower.includes('hotel') ||
    bizNameLower.includes('villa') ||
    bizNameLower.includes('homestay') ||
    bizNameLower.includes('resort')
  );
  const isBeauty = selectedBusiness && (
    ['salon', 'barbershop'].includes(selectedBusiness.business_type) ||
    bizNameLower.includes('salon') ||
    bizNameLower.includes('barber')
  );

  const menuLabel = isGym
    ? (language === 'id' ? 'Paket' : 'Plans')
    : isHospitality
    ? (language === 'id' ? 'Katalog' : 'Services')
    : isBeauty
    ? (language === 'id' ? 'Layanan' : 'Services')
    : t('nav', 'menu');

  const MenuIcon = isGym
    ? Dumbbell
    : isHospitality
    ? Hotel
    : isBeauty
    ? Scissors
    : Utensils;

  return (
    <NavBar
      className="lg:hidden"
      items={[
        { name: t('nav', 'dashboard'), path: '/admin', icon: Home, end: true },
        { name: menuLabel, path: '/admin/menu', icon: MenuIcon },
        { name: t('nav', 'wifi'), path: '/admin/wifi', icon: Wifi },
        { name: t('nav', 'review'), path: '/admin/review', icon: Star },
        { name: t('nav', 'qrCode'), path: '/admin/qr', icon: QrCode },
      ]}
    />
  );
}
