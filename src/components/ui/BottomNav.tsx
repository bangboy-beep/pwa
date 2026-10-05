import { NavLink, useParams } from 'react-router-dom';
import { Home, Utensils, Wifi, Star } from 'lucide-react';

export function CustomerBottomNav() {
  const { slug } = useParams<{ slug: string }>();
  if (!slug) return null;

  const navItems = [
    { name: 'Beranda', path: `/q/${slug}`, icon: Home },
    { name: 'Menu', path: `/m/${slug}`, icon: Utensils },
    { name: 'WiFi', path: `/w/${slug}`, icon: Wifi },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md bg-white/95 backdrop-blur-md border border-stone-200/80 rounded-[1.25rem] shadow-xl px-2 py-1.5 flex items-center justify-around">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all duration-150 flex-1 ${
              isActive
                ? 'text-[#f0883a] font-bold bg-orange-50/60'
                : 'text-stone-400 font-medium hover:text-stone-700 hover:bg-stone-50'
            }`
          }
        >
          <item.icon className="w-5 h-5 shrink-0" />
          <span className="text-[10px] leading-none tracking-wide">{item.name}</span>
        </NavLink>
      ))}
    </div>
  );
}

export function AdminBottomNav() {
  const navItems = [
    { name: 'Home', path: '/admin', icon: Home },
    { name: 'Menu', path: '/admin/menu', icon: Utensils },
    { name: 'WiFi', path: '/admin/wifi', icon: Wifi },
    { name: 'Review', path: '/admin/review', icon: Star },
  ];

  return (
    <div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] bg-white/95 backdrop-blur-md border border-stone-200/80 rounded-[1.25rem] shadow-xl px-2 py-1.5 flex items-center justify-around">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/admin'}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all duration-150 flex-1 ${
              isActive
                ? 'text-[#f0883a] font-bold bg-orange-50/60'
                : 'text-stone-400 font-medium hover:text-stone-700 hover:bg-stone-50'
            }`
          }
        >
          <item.icon className="w-5 h-5 shrink-0" />
          <span className="text-[10px] leading-none tracking-wide">{item.name}</span>
        </NavLink>
      ))}
    </div>
  );
}
