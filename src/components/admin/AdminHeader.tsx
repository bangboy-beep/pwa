import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, ExternalLink, ArrowLeft } from 'lucide-react';
import { useBusiness } from '../../providers/BusinessProvider';
import { useState } from 'react';

export function AdminHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const { selectedBusiness } = useBusiness();
  const location = useLocation();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const isSubpage = !['/admin', '/admin/qr'].includes(location.pathname);
  const pageTitle = isSubpage
    ? location.pathname === '/admin/menu' ? 'Menu'
    : location.pathname === '/admin/wifi' ? 'WiFi'
    : location.pathname === '/admin/review' ? 'Review'
    : location.pathname === '/admin/qr/print' ? 'Print QR'
    : 'QR Code'
    : 'Dashboard';

  return (
    <header className="h-14 bg-white border-b border-stone-200 sticky top-0 z-30 flex items-center justify-between px-4 shadow-[0_1px_0_rgba(231,229,228,0.8)]">
      <div className="flex items-center gap-2">
        {isSubpage ? (
          <button onClick={() => navigate(-1)} className="p-2 -ml-1 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors" aria-label="Kembali">
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <button onClick={onMenuClick} className="p-2 -ml-1 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 lg:hidden transition-colors" aria-label="Buka menu">
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center lg:hidden">
          <span className="text-white text-[11px] font-bold">S</span>
        </div>
        <div>
          <p className="text-sm font-bold text-stone-900 leading-none">{pageTitle}</p>
          {selectedBusiness && <p className="text-[11px] text-stone-500 mt-0.5 truncate max-w-[120px] sm:max-w-none">{selectedBusiness.name}</p>}
        </div>
      </div>

      {/* Dropdown for public link */}
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold border border-amber-200 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Publik</span>
        </button>
        {showMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-stone-200 z-20 py-1">
              {selectedBusiness && (
                <>
                  <a href={`/q/${selectedBusiness.slug}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 text-xs text-stone-700 hover:bg-stone-50">
                    <ExternalLink className="w-3.5 h-3.5 text-amber-600" /> Customer Hub
                  </a>
                  <a href={`/m/${selectedBusiness.slug}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 text-xs text-stone-700 hover:bg-stone-50">
                    <ExternalLink className="w-3.5 h-3.5 text-amber-600" /> Menu Publik
                  </a>
                  <a href={`/w/${selectedBusiness.slug}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 text-xs text-stone-700 hover:bg-stone-50">
                    <ExternalLink className="w-3.5 h-3.5 text-amber-600" /> WiFi Publik
                  </a>
                  <a href={`/r/${selectedBusiness.slug}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 text-xs text-stone-700 hover:bg-stone-50">
                    <ExternalLink className="w-3.5 h-3.5 text-amber-600" /> Review Publik
                  </a>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
