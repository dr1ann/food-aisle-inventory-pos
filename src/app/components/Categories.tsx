import { useState } from 'react';
import { useStore, Category } from '../store';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export function Categories() {
  const { categories, loading, addCategory, updateCategory, toggleCategoryStatus } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formError, setFormError] = useState('');
  const [categoryName, setCategoryName] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = categoryName.trim();

    if (!name) {
      setFormError('Category name is required.');
      return;
    }

    setFormError('');

    if (editingCategory) {
      updateCategory(editingCategory.id, name);
    } else {
      addCategory(name);
    }
    
    setShowModal(false);
    setEditingCategory(null);
    setCategoryName('');
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setCategoryName('');
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setFormError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setCategoryName('');
    setFormError('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl text-gray-900 mb-1">Categories</h1>
          <p className="text-sm text-gray-500">Manage product categories</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-sm text-gray-500">
          Loading categories...
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-lg border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
          No categories yet. Add one to start organizing products.
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs text-gray-500 uppercase tracking-wider">Category Name</th>
                  <th className="text-left px-6 py-3 text-xs text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-xs text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{category.name}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          category.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-3">
                      <button
                        onClick={() => openEditModal(category)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleCategoryStatus(category.id)}
                        className={`${
                          category.isActive
                            ? 'text-red-600 hover:text-red-700'
                            : 'text-green-600 hover:text-green-700'
                        }`}
                        title={category.isActive ? 'Deactivate' : 'Activate'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/45 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl text-gray-900 mb-4">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                  {formError}
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-700 mb-1">Category Name</label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  required
                  autoComplete="off"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingCategory ? 'Update' : 'Add'} Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
