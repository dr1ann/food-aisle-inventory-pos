import { useMemo, useState } from 'react';
import { useStore, Product, Sale } from '../store';
import { Minus, Plus, Search, ShoppingCart, Trash2 } from 'lucide-react';

interface CartItem {
  productId: string;
  productName: string;
  sellingPrice: number;
  stock: number;
  quantity: number;
}

function formatCurrency(amount: number): string {
  return `PHP ${amount.toFixed(2)}`;
}

function updateCartQuantity(items: CartItem[], productId: string, quantity: number): CartItem[] {
  return items
    .map((item) => (item.productId === productId ? { ...item, quantity } : item))
    .filter((item) => item.quantity > 0);
}

export function POS() {
  const { products, loading, checkoutSale } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paidAmount, setPaidAmount] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [checkoutError, setCheckoutError] = useState('');
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sellableProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return products
      .filter((product) => product.stock > 0)
      .filter((product) => !term || product.name.toLowerCase().includes(term));
  }, [products, searchTerm]);

  const cartTotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.sellingPrice * item.quantity, 0);
  }, [cartItems]);

  const paidValue = Number(paidAmount);
  const changeAmount = Number.isFinite(paidValue) ? paidValue - cartTotal : 0;
  const canCheckout =
    cartItems.length > 0 &&
    Number.isFinite(paidValue) &&
    paidValue >= cartTotal &&
    !isSubmitting;

  const addToCart = (product: Product) => {
    setCheckoutError('');
    setCompletedSale(null);
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.productId === product.id);

      if (existingItem) {
        if (existingItem.quantity >= product.stock) {
          setCheckoutError(`Only ${product.stock} ${product.name} available.`);
          return prev;
        }

        return updateCartQuantity(prev, product.id, existingItem.quantity + 1);
      }

      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          sellingPrice: product.sellingPrice,
          stock: product.stock,
          quantity: 1,
        },
      ];
    });
  };

  const changeCartQuantity = (productId: string, quantity: number) => {
    const item = cartItems.find((currentItem) => currentItem.productId === productId);

    if (!item) {
      return;
    }

    if (!Number.isInteger(quantity)) {
      setCheckoutError('Quantity must be a whole number.');
      return;
    }

    if (quantity > item.stock) {
      setCheckoutError(`Only ${item.stock} ${item.productName} available.`);
      return;
    }

    setCheckoutError('');
    setCartItems((prev) => updateCartQuantity(prev, productId, quantity));
  };

  const removeCartItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      setCheckoutError('Add at least one product to the cart.');
      return;
    }

    if (!Number.isFinite(paidValue) || paidValue < cartTotal) {
      setCheckoutError('Paid amount must cover the total amount.');
      return;
    }

    setIsSubmitting(true);
    setCheckoutError('');

    try {
      const sale = await checkoutSale({
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        paymentMethod: 'CASH',
        paidAmount: paidValue.toFixed(2),
        customerName: customerName.trim() || undefined,
      });

      setCompletedSale(sale);
      setCartItems([]);
      setPaidAmount('');
      setCustomerName('');
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : 'Failed to checkout sale.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearCart = () => {
    setCartItems([]);
    setCheckoutError('');
    setCompletedSale(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl text-gray-900 mb-1">Point of Sale</h1>
        <p className="text-sm text-gray-500">Checkout customer purchases and deduct stock automatically</p>
      </div>

      {products.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg">
          Add products and stock before using the POS.
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="text-left px-6 py-3 text-xs text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="text-left px-6 py-3 text-xs text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="text-left px-6 py-3 text-xs text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="text-left px-6 py-3 text-xs text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
                        Loading products...
                      </td>
                    </tr>
                  ) : sellableProducts.length > 0 ? (
                    sellableProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{product.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{product.stock}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(product.sellingPrice)}</td>
                        <td className="px-6 py-4">
                          <button
                            type="button"
                            onClick={() => addToCart(product)}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white transition-colors hover:bg-blue-700"
                          >
                            <Plus className="w-4 h-4" />
                            Add
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
                        {searchTerm ? 'No in-stock products match your search.' : 'No products currently in stock.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <aside className="bg-white rounded-lg border border-gray-200 h-fit">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg text-gray-900">Current Cart</h2>
            </div>
            <button
              type="button"
              onClick={clearCart}
              disabled={cartItems.length === 0}
              className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear
            </button>
          </div>

          <div className="p-5 space-y-5">
            {completedSale && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                Sale completed. Receipt: {completedSale.receiptNo}
              </div>
            )}

            {checkoutError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {checkoutError}
              </div>
            )}

            <div className="space-y-3">
              {cartItems.length > 0 ? (
                cartItems.map((item) => (
                  <div key={item.productId} className="rounded-lg border border-gray-200 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-gray-900">{item.productName}</p>
                        <p className="text-xs text-gray-500">{formatCurrency(item.sellingPrice)} each</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCartItem(item.productId)}
                        className="text-red-600 hover:text-red-700"
                        aria-label={`Remove ${item.productName}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => changeCartQuantity(item.productId, item.quantity - 1)}
                          className="rounded border border-gray-300 p-1 text-gray-700 hover:bg-gray-50"
                          aria-label={`Decrease ${item.productName}`}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          min="1"
                          max={item.stock}
                          value={item.quantity}
                          onChange={(event) => changeCartQuantity(item.productId, Number(event.target.value))}
                          className="w-16 rounded border border-gray-300 px-2 py-1 text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => changeCartQuantity(item.productId, item.quantity + 1)}
                          className="rounded border border-gray-300 p-1 text-gray-700 hover:bg-gray-50"
                          aria-label={`Increase ${item.productName}`}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="text-sm text-gray-900">{formatCurrency(item.sellingPrice * item.quantity)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                  Add products to start a sale.
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total</span>
                <span className="text-xl text-gray-900">{formatCurrency(cartTotal)}</span>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="text-gray-900">Cash</span>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Paid Amount</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={paidAmount}
                  onChange={(event) => setPaidAmount(event.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  placeholder="Optional"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="rounded-lg bg-gray-50 px-4 py-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Change</span>
                  <span className={changeAmount >= 0 ? 'text-gray-900' : 'text-red-700'}>
                    {formatCurrency(Math.max(changeAmount, 0))}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={!canCheckout}
                className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Processing...' : 'Complete Sale'}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
