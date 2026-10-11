import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Wifi,
  Star,
  QrCode,
  Printer,
  LogOut,
  X,
} from 'lucide-react';
import { useAuthContext } from '../../hooks/useAuthContext';
import { useBusiness } from '../../providers/BusinessProvider';
import { cn } from '../ui/utils';

const navItems = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { name: 'Menu', path: '/admin/menu', icon: UtensilsCrossed },
  { name: 'WiFi', path: '/admin/wifi', icon: Wifi },
  { name: 'Google Review', path: '/admin/review', icon: Star },
  { name: 'QR Code', path: '/admin/qr', icon: QrCode },
  { name: 'Print QR', path: '/admin/qr/print', icon: Printer },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const { user, signOut } = useAuthContext();
  const { businesses, selectedBusiness } = useBusiness();
  const currentBusiness = selectedBusiness || businesses[0] || null;

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[272px] bg-white border-r border-stone-200 flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand */}
        <div className="h-14 flex items-center gap-2.5 px-5 border-b border-stone-100 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-primary-500 flex items-center justify-center shadow-sm">
            <QrCode className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-base text-stone-900 tracking-tight">SmartQR</span>
          <button
            onClick={onClose}
            className="p-1 -mr-1 rounded-md text-stone-400 hover:text-stone-600 hover:bg-stone-100 lg:hidden ml-auto"
            aria-label="Tutup menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Business Selector */}
        {currentBusiness && (
          <div className="mx-3 my-3 px-3.5 py-3 rounded-xl bg-stone-50 border border-stone-100 shrink-0">
            <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-2.5">Bisnis Aktif</p>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-base shrink-0">
                {currentBusiness.business_type === 'cafe' && '☕'}
                {currentBusiness.business_type === 'restaurant' && '🍽️'}
                {currentBusiness.business_type === 'hotel' && '🏨'}
                {currentBusiness.business_type === 'bar' && '🍸'}
                {currentBusiness.business_type === 'salon' && '💇'}
                {currentBusiness.business_type === 'barbershop' && '💈'}
                {currentBusiness.business_type === 'other' && '📋'}
                {['homestay', 'villa'].includes(currentBusiness.business_type) && '🏠'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-stone-900 truncate">{currentBusiness.name}</p>
                <p className="text-[10px] text-stone-400 capitalize mt-0.5">{currentBusiness.business_type}</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm transition-all duration-150",
                  isActive
                    ? "bg-primary-500 text-white font-semibold shadow-sm"
                    : "text-stone-Stone-600 font-medium hover:bg-stone-100 hover:text-stone-900"
                )
              }
            >
              <item.icon className="w-4 h-4 shrink-0 opacity-80" />
              <span className="text-sm leading-5 truncate">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-stone-100 shrink-0">
          <div className="flex items-center gap-2 px-2 py-2.5 rounded-xl bg-stone-50">
            <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-bold shrink-0">
              {(user?.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-stone-800 truncate">{user?.email || 'Owner'}</p>
              <p className="text-[10px] text-stone-500">Admin</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
