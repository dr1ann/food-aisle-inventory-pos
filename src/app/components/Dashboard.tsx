import { useStore } from '../store';
import { Package, AlertTriangle, XCircle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Dashboard() {
  const { products, stockMovements, loading } = useStore();

  const totalProducts = products.length;
  const lowStockItems = products.filter(p => p.status === 'Low Stock').length;
  const outOfStockItems = products.filter(p => p.status === 'Out of Stock').length;
  const recentMovements = stockMovements.slice(0, 5);

  const categoryData = products.reduce((acc, product) => {
    const existing = acc.find(item => item.category === product.category);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ category: product.category, count: 1 });
    }
    return acc;
  }, [] as { category: string; count: number }[]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl text-gray-900 mb-1">Dashboard</h1>
          <p className="text-sm text-gray-500">Loading inventory data...</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
              <div className="h-4 w-24 bg-gray-100 rounded mb-3" />
              <div className="h-8 w-16 bg-gray-100 rounded" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="h-5 w-40 bg-gray-100 rounded mb-6" />
            <div className="h-[300px] bg-gray-50 rounded" />
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="h-5 w-32 bg-gray-100 rounded mb-6" />
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-28 bg-gray-100 rounded" />
                    <div className="h-3 w-36 bg-gray-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl text-gray-900 mb-1">Dashboard</h1>
        <p className="text-sm text-gray-500">Overview of your inventory system</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Products</p>
              <p className="text-3xl text-gray-900">{totalProducts}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Low Stock Items</p>
              <p className="text-3xl text-gray-900">{lowStockItems}</p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Out of Stock</p>
              <p className="text-3xl text-gray-900">{outOfStockItems}</p>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Recent Transactions</p>
              <p className="text-3xl text-gray-900">{stockMovements.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Chart and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products by Category Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg text-gray-900 mb-4">Products by Category</h2>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-sm text-gray-500 rounded-lg border border-dashed border-gray-200 bg-gray-50">
              Add products to see category insights.
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg text-gray-900 mb-4">Recent Activity</h2>
          {recentMovements.length > 0 ? (
            <div className="space-y-4">
              {recentMovements.map((movement) => (
                <div key={movement.id} className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      movement.type === 'IN' ? 'bg-blue-50' : 'bg-red-50'
                    }`}
                  >
                    <TrendingUp
                      className={`w-4 h-4 ${
                        movement.type === 'IN' ? 'text-blue-600' : 'text-red-600 rotate-180'
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{movement.productName}</p>
                    <p className="text-xs text-gray-500">
                      {movement.type === 'IN' ? '+' : '-'}
                      {movement.quantity} units • {movement.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-sm text-gray-500 rounded-lg border border-dashed border-gray-200 bg-gray-50">
              Stock activity will appear here once movements are recorded.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
