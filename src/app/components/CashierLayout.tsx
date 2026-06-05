import { Outlet, useNavigate } from 'react-router';
import { LogOut, ShoppingCart, User } from 'lucide-react';
import { StoreProvider } from '../store';
import { apiService } from '../../services/api';

export function CashierLayout() {
  const navigate = useNavigate();
  const user = apiService.getUser();

  const handleLogout = () => {
    apiService.clearToken();
    navigate('/login', { replace: true });
  };

  return (
    <StoreProvider scope="pos">
      <div className="flex h-screen flex-col bg-gray-50">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">FoodAisle POS</div>
              <div className="text-xs text-gray-500">Cashier Terminal</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
              <User className="w-4 h-4 text-blue-700" />
              <span className="text-sm text-gray-700">{user?.name ?? 'Cashier'}</span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </StoreProvider>
  );
}
