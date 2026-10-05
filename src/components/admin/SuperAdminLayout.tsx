import { Outlet, useNavigate } from 'react-router-dom';
import { LogOut, ShieldCheck } from 'lucide-react';
import { useAuthContext } from '../../hooks/useAuthContext';

export function SuperAdminLayout() {
  const navigate = useNavigate();
  const { signOut } = useAuthContext();

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="h-16 bg-white border-b border-stone-200 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-red-600" />
          <span className="font-bold text-lg text-stone-900">Platform Admin</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-stone-600 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
