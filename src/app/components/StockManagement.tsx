import { useState } from 'react';
import { useStore } from '../store';
import { Plus, TrendingUp, TrendingDown } from 'lucide-react';

export function StockManagement() {
  const { products, stockMovements, loading, addStockMovement } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const productId = formData.get('productId')?.toString() ?? '';
    const type = formData.get('type')?.toString() ?? '';
    const quantity = Number(formData.get('quantity'));
    const date = formData.get('date')?.toString().trim() ?? '';
    const notes = formData.get('notes')?.toString().trim() ?? '';
    const product = products.find(p => p.id === productId);

    if (!productId) {
      setFormError('Select a product.');
      return;
    }

    if (!product) {
      setFormError('Selected product was not found.');
      return;
    }

    if (type !== 'IN' && type !== 'OUT') {
      setFormError('Select a stock movement type.');
      return;
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      setFormError('Quantity must be a whole number greater than 0.');
      return;
    }

    if (!date) {
      setFormError('Date is required.');
      return;
    }

    if (type === 'OUT' && quantity > product.stock) {
      setFormError(`Cannot remove more than the current stock level (${product.stock}).`);
      return;
    }

    addStockMovement({
      productId,
      productName: product.name,
      type: type as 'IN' | 'OUT',
      quantity,
      date,
      notes,
    });

    setFormError('');
    setShowModal(false);
    e.currentTarget.reset();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl text-gray-900 mb-1">Stock Management</h1>
          <p className="text-sm text-gray-500">Track and manage stock movements</p>
        </div>
        <button
          onClick={() => {
            setFormError('');
            setShowModal(true);
          }}
          disabled={loading || products.length === 0}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Add Stock Movement
        </button>
      </div>

      {products.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg">
          Add a product before recording stock movements.
        </div>
      )}

      {/* Stock Movement History */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs text-gray-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-3 text-xs text-gray-500 uppercase tracking-wider">Product</th>
                <th className="text-left px-6 py-3 text-xs text-gray-500 uppercase tracking-wider">Type</th>
                <th className="text-left px-6 py-3 text-xs text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="text-left px-6 py-3 text-xs text-gray-500 uppercase tracking-wider">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
                    Loading stock movements...
                  </td>
                </tr>
              ) : stockMovements.length > 0 ? (
                stockMovements.map((movement) => (
                  <tr key={movement.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{movement.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{movement.productName}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {movement.type === 'IN' ? (
                          <>
                            <div className="w-6 h-6 bg-blue-50 rounded flex items-center justify-center">
                              <TrendingUp className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="text-sm text-blue-700">Stock In</span>
                          </>
                        ) : (
                          <>
                            <div className="w-6 h-6 bg-red-50 rounded flex items-center justify-center">
                              <TrendingDown className="w-4 h-4 text-red-600" />
                            </div>
                            <span className="text-sm text-red-700">Stock Out</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {movement.type === 'IN' ? '+' : '-'}
                      {movement.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{movement.notes}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
                    No stock movements recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Movement Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/45 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl text-gray-900 mb-4">Add Stock Movement</h2>
            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                  {formError}
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-700 mb-1">Product</label>
                <select
                  name="productId"
                  required
                  disabled={products.length === 0}
                  autoComplete="off"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Product</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} (Current: {product.stock})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                    <input type="radio" name="type" value="IN" required className="sr-only" autoComplete="off" />
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-gray-900">Stock In</span>
                  </label>
                  <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-red-500 has-[:checked]:border-red-500 has-[:checked]:bg-red-50">
                    <input type="radio" name="type" value="OUT" required className="sr-only" autoComplete="off" />
                    <TrendingDown className="w-5 h-5 text-red-600" />
                    <span className="text-sm text-gray-900">Stock Out</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  min="1"
                  required
                  autoComplete="off"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  required
                  autoComplete="off"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  rows={3}
                  placeholder="Optional notes..."
                  autoComplete="off"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormError('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Movement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
