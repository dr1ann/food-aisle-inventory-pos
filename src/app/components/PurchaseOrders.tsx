import { useState } from 'react';
import { useStore } from '../store';
import { Plus, Check, X } from 'lucide-react';

interface POItem {
  productId: string;
  productName: string;
  quantity: number;
}

function updateDraftItemQuantity(items: POItem[], productId: string, quantity: number): POItem[] {
  return items.map((item) =>
    item.productId === productId ? { ...item, quantity } : item
  );
}

export function PurchaseOrders() {
  const { purchaseOrders, suppliers, products, loading, addPurchaseOrder, completePurchaseOrder } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [items, setItems] = useState<POItem[]>([]);
  const [formError, setFormError] = useState('');

  const handleAddItem = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const productId = formData.get('productId')?.toString() ?? '';
    const quantity = Number(formData.get('quantity'));
    const product = products.find((p) => p.id === productId);

    if (!productId) {
      setFormError('Select a product before adding an item.');
      return;
    }

    if (!product) {
      setFormError('Selected product was not found.');
      return;
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      setFormError('Quantity must be a whole number greater than 0.');
      return;
    }

    setItems((prev) => {
      const existingItem = prev.find((item) => item.productId === productId);

      if (existingItem) {
        return updateDraftItemQuantity(prev, productId, existingItem.quantity + quantity);
      }

      return [
        ...prev,
        {
          productId,
          productName: product.name,
          quantity,
        },
      ];
    });

    setFormError('');
    e.currentTarget.reset();
  };

  const handleUpdateItemQuantity = (productId: string, quantity: number) => {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      setFormError('Quantity must be a whole number greater than 0.');
      return;
    }

    setItems((prev) => updateDraftItemQuantity(prev, productId, quantity));
    setFormError('');
  };

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitPO = () => {
    if (suppliers.length === 0 || products.length === 0) {
      setFormError('Add suppliers and products before creating purchase orders.');
      return;
    }

    if (!selectedSupplier) {
      setFormError('Select a supplier.');
      return;
    }

    if (items.length === 0) {
      setFormError('Add at least one item.');
      return;
    }

    const supplier = suppliers.find(s => s.id === selectedSupplier);
    if (!supplier) return;

    setFormError('');

    addPurchaseOrder({
      supplierId: selectedSupplier,
      supplierName: supplier.name,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
      items,
    });

    setShowModal(false);
    setSelectedSupplier('');
    setItems([]);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      'Pending': 'bg-orange-100 text-orange-800',
      'Completed': 'bg-blue-100 text-blue-800',
    };
    return (
      <span className={`px-2 py-1 rounded text-xs ${styles[status as keyof typeof styles]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl text-gray-900 mb-1">Purchase Orders</h1>
          <p className="text-sm text-gray-500">Create and manage purchase orders</p>
        </div>
        <button
          onClick={() => {
            setFormError('');
            setShowModal(true);
          }}
          disabled={loading || suppliers.length === 0 || products.length === 0}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Create Purchase Order
        </button>
      </div>

      {(suppliers.length === 0 || products.length === 0) && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg">
          Add suppliers and products before creating purchase orders.
        </div>
      )}

      {/* Purchase Orders List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-sm text-gray-500">
            Loading purchase orders...
          </div>
        ) : purchaseOrders.length > 0 ? (
          purchaseOrders.map((po) => (
            <div key={po.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg text-gray-900">PO #{po.id}</h3>
                      {getStatusBadge(po.status)}
                    </div>
                    <p className="text-sm text-gray-600">Supplier: {po.supplierName}</p>
                    <p className="text-sm text-gray-500">Date: {po.date}</p>
                  </div>
                  {po.status === 'Pending' && (
                    <button
                      onClick={() => completePurchaseOrder(po.id)}
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      Mark as Completed
                    </button>
                  )}
                </div>

                {/* PO Items */}
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-500 mb-3">Items:</p>
                  <div className="space-y-2">
                    {po.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 rounded px-4 py-2">
                        <span className="text-sm text-gray-900">{item.productName}</span>
                        <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
            No purchase orders created yet.
          </div>
        )}
      </div>

      {/* Create PO Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/45 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl text-gray-900 mb-4">Create Purchase Order</h2>

            <div className="space-y-4 mb-6">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                  {formError}
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-700 mb-1">Supplier</label>
                <select
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                  disabled={suppliers.length === 0}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                  ))}
                </select>
              </div>

              {selectedSupplier ? (
                <>
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm text-gray-700 mb-3">Add Items</p>
                    <form onSubmit={handleAddItem} className="flex gap-3" autoComplete="off">
                      <select
                        name="productId"
                        required
                        disabled={products.length === 0}
                        autoComplete="off"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Product</option>
                        {products.map(product => (
                          <option key={product.id} value={product.id}>{product.name}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        name="quantity"
                        min="1"
                        placeholder="Qty"
                        required
                        autoComplete="off"
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="submit"
                          disabled={products.length === 0}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Add
                      </button>
                    </form>
                  </div>

                  {items.length > 0 && (
                    <div className="border-t border-gray-200 pt-4">
                      <p className="text-sm text-gray-700 mb-3">Items in this PO:</p>
                      <div className="space-y-2">
                        {items.map((item, index) => (
                          <div key={index} className="flex items-center justify-between gap-3 bg-gray-50 rounded px-4 py-2">
                            <span className="text-sm text-gray-900 flex-1">{item.productName}</span>
                            <div className="flex items-center gap-2">
                              <label className="text-xs text-gray-500">Qty</label>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(event) => handleUpdateItemQuantity(item.productId, Number(event.target.value))}
                                className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(index)}
                                className="text-red-600 hover:text-red-700"
                                aria-label={`Remove ${item.productName}`}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-500">
                  Select a supplier to start adding items.
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setSelectedSupplier('');
                  setItems([]);
                  setFormError('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitPO}
                disabled={!selectedSupplier || items.length === 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Purchase Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
