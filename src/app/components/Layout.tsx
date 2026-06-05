import { Outlet, NavLink, useNavigate } from 'react-router';
import { LayoutDashboard, Package, TrendingUp, Users, Tag, FileText, Menu, X, User, Receipt } from 'lucide-react';
import { useState } from 'react';
import { StoreProvider } from '../store';
import { apiService } from '../../services/api';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/products', label: 'Products', icon: Package },
  { path: '/stock', label: 'Stock Management', icon: TrendingUp },
  { path: '/suppliers', label: 'Suppliers', icon: Users },
  { path: '/categories', label: 'Categories', icon: Tag },
  { path: '/purchase-orders', label: 'Purchase Orders', icon: FileText },
  { path: '/sales', label: 'Sales', icon: Receipt },
];

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    apiService.clearToken();
    navigate('/login', { replace: true });
  };

  return (
    <StoreProvider>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-gray-200">
          <div className="flex items-center gap-2 h-16 px-6 border-b border-gray-200">
            {/* <Package className="w-6 h-6 text-blue-600" /> */}
            <span className="font-semibold text-gray-900">FoodAisle Grocery Store</span>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
            <aside className="fixed inset-y-0 left-0 w-64 bg-white">
              <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Package className="w-6 h-6 text-blue-600" />
                  <span className="font-semibold text-gray-900">FoodAisle Grocery Store</span>
                </div>
                <button onClick={() => setSidebarOpen(false)}>
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
              <nav className="px-4 py-6 space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>
              <div className="px-4 pb-6">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
            <button
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-700" />
                </div>
                <div className="hidden md:block">
                  <div className="text-sm text-gray-900">Admin User</div>
                  <div className="text-xs text-gray-500">admin@foodaisle.com</div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </StoreProvider>
  );
}
