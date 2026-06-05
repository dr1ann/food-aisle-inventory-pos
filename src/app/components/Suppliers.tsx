import { useState } from 'react';
import { useStore, Supplier } from '../store';
import { Plus, Edit2, Phone, MapPin } from 'lucide-react';

export function Suppliers() {
  const { suppliers, loading, addSupplier, updateSupplier } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formError, setFormError] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name')?.toString().trim() ?? '';
    const contact = formData.get('contact')?.toString().trim() ?? '';
    const address = formData.get('address')?.toString().trim() ?? '';

    if (!name) {
      setFormError('Supplier name is required.');
      return;
    }

    if (!contact) {
      setFormError('Contact information is required.');
      return;
    }

    if (!address) {
      setFormError('Address is required.');
      return;
    }

    const supplierData = {
      name,
      contact,
      address,
    };

    setFormError('');

    if (editingSupplier) {
      updateSupplier(editingSupplier.id, supplierData);
    } else {
      addSupplier(supplierData);
    }
    setShowModal(false);
    setEditingSupplier(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl text-gray-900 mb-1">Suppliers</h1>
          <p className="text-sm text-gray-500">Manage your supplier relationships</p>
        </div>
        <button
          onClick={() => {
            setEditingSupplier(null);
            setFormError('');
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Supplier
        </button>
      </div>

        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-sm text-gray-500">
            Loading suppliers...
          </div>
        ) : suppliers.length === 0 ? (
          <div className="bg-white rounded-lg border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
            No suppliers yet. Add one to start creating products and purchase orders.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliers.map((supplier) => (
              <div key={supplier.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg text-gray-900">{supplier.name}</h3>
                  <button
                    onClick={() => {
                      setEditingSupplier(supplier);
                      setFormError('');
                      setShowModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Contact</p>
                      <p className="text-sm text-gray-900">{supplier.contact}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Address</p>
                      <p className="text-sm text-gray-900">{supplier.address}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/45 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl text-gray-900 mb-4">
              {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                  {formError}
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-700 mb-1">Supplier Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingSupplier?.name}
                  required
                  autoComplete="off"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Contact</label>
                <input
                  type="text"
                  name="contact"
                  defaultValue={editingSupplier?.contact}
                  required
                  autoComplete="off"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Address</label>
                <textarea
                  name="address"
                  rows={3}
                  defaultValue={editingSupplier?.address}
                  required
                  autoComplete="off"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingSupplier(null);
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
                  {editingSupplier ? 'Update' : 'Add'} Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
