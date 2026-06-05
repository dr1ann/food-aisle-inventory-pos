import { useState, useMemo } from 'react';
import { useStore, Product } from '../store';
import { Plus, Search, Edit2, Filter } from 'lucide-react';

export function Products() {
  const { products, categories, loading, addProduct, updateProduct } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formError, setFormError] = useState('');
  const [listError, setListError] = useState('');

  const productCategoryNames = useMemo(() => {
    return Array.from(new Set(products.map(p => p.category)));
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !categoryFilter || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, categoryFilter]);

  const getProductErrorMessage = (error: unknown, fallbackMessage: string) => {
    if (error instanceof Error && error.message.trim()) {
      return error.message;
    }
    return fallbackMessage;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name')?.toString().trim() ?? '';
    const categoryId = formData.get('categoryId')?.toString().trim() ?? '';
    const description = formData.get('description')?.toString().trim() ?? '';
    const costPrice = Number(formData.get('costPrice'));
    const sellingPrice = Number(formData.get('sellingPrice'));

    if (!name) {
      setFormError('Product name is required.');
      return;
    }

    if (!categoryId) {
      setFormError('Category is required.');
      return;
    }

    if (!Number.isFinite(costPrice) || costPrice <= 0) {
      setFormError('Cost price must be greater than 0.');
      return;
    }

    if (!Number.isFinite(sellingPrice) || sellingPrice <= 0) {
      setFormError('Selling price must be greater than 0.');
      return;
    }

    const productData = {
      name,
      categoryId,
      description: description || undefined,
      costPrice,
      sellingPrice,
    };

    setFormError('');
    setListError('');

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
      } else {
        await addProduct(productData);
      }

      setShowModal(false);
      setEditingProduct(null);
    } catch (error) {
      const errorMessage = getProductErrorMessage(
        error,
        editingProduct ? 'Failed to update product.' : 'Failed to add product.'
      );
      setFormError(errorMessage);
      setListError(errorMessage);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      'In Stock': 'bg-blue-100 text-blue-800',
      'Low Stock': 'bg-orange-100 text-orange-800',
      'Out of Stock': 'bg-red-100 text-red-800',
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
          <h1 className="text-2xl text-gray-900 mb-1">Products</h1>
          <p className="text-sm text-gray-500">Manage your product catalog</p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setFormError('');
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {listError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {listError}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="">All Categories</option>
              {productCategoryNames.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs text-gray-500 uppercase tracking-wider">Product Name</th>
                <th className="text-left px-6 py-3 text-xs text-gray-500 uppercase tracking-wider">Category</th>
                <th className="text-left px-6 py-3 text-xs text-gray-500 uppercase tracking-wider">Description</th>
                <th className="text-left px-6 py-3 text-xs text-gray-500 uppercase tracking-wider">Cost Price</th>
                <th className="text-left px-6 py-3 text-xs text-gray-500 uppercase tracking-wider">Selling Price</th>
                <th className="text-left px-6 py-3 text-xs text-gray-500 uppercase tracking-wider">Current Stock</th>
                <th className="text-left px-6 py-3 text-xs text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-sm text-gray-500">
                    Loading products...
                  </td>
                </tr>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{product.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {product.description || <span className="italic text-gray-400">—</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">₱{product.costPrice.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">₱{product.sellingPrice.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{product.stock}</td>
                    <td className="px-6 py-4">{getStatusBadge(product.status)}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setFormError('');
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-sm text-gray-500">
                    {searchTerm || categoryFilter
                      ? 'No products match the current filters.'
                      : 'No products available yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/45 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl text-gray-900 mb-4">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                  {formError}
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-700 mb-1">Product Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingProduct?.name}
                  required
                  autoComplete="off"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Category</label>
                <select
                  name="categoryId"
                  defaultValue={editingProduct ? categories.find(c => c.name === editingProduct.category && c.isActive)?.id ?? '' : ''}
                  required
                  autoComplete="off"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Category</option>
                  {categories.filter(cat => cat.isActive).map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Description <span className="text-gray-400">(optional)</span>
                </label>
                <textarea
                  name="description"
                  defaultValue={editingProduct?.description}
                  rows={2}
                  autoComplete="off"
                  placeholder="Brief product description..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Cost Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₱</span>
                    <input
                      type="number"
                      name="costPrice"
                      step="0.01"
                      min="0.01"
                      defaultValue={editingProduct?.costPrice}
                      required
                      autoComplete="off"
                      placeholder="0.00"
                      className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Purchase price from supplier</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Selling Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₱</span>
                    <input
                      type="number"
                      name="sellingPrice"
                      step="0.01"
                      min="0.01"
                      defaultValue={editingProduct?.sellingPrice}
                      required
                      autoComplete="off"
                      placeholder="0.00"
                      className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Retail price for POS</p>
                </div>
              </div>
              {editingProduct && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">
                    Current Stock: <span className="text-gray-900">{editingProduct.stock}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Stock can only be updated through Stock Management or Purchase Orders
                  </p>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProduct(null);
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
                  {editingProduct ? 'Update' : 'Add'} Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
