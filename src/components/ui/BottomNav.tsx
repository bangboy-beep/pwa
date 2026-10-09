import { NavLink, useParams } from 'react-router-dom';
import { Home, Utensils, Wifi, Star, QrCode } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

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
  if (!slug) return null;

  return (
    <NavBar
      items={[
        { name: 'Beranda', path: `/q/${slug}`, icon: Home },
        { name: 'Menu', path: `/m/${slug}`, icon: Utensils },
        { name: 'WiFi', path: `/w/${slug}`, icon: Wifi },
        { name: 'Ulasan', path: `/r/${slug}`, icon: Star },
      ]}
    />
  );
}

export function AdminBottomNav() {
  return (
    <NavBar
      className="lg:hidden"
      items={[
        { name: 'Beranda', path: '/admin', icon: Home, end: true },
        { name: 'Menu', path: '/admin/menu', icon: Utensils },
        { name: 'WiFi', path: '/admin/wifi', icon: Wifi },
        { name: 'Review', path: '/admin/review', icon: Star },
        { name: 'QR', path: '/admin/qr', icon: QrCode },
      ]}
    />
  );
}
