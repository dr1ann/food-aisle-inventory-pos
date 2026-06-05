import { Fragment, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Receipt, Search } from 'lucide-react';
import { useStore } from '../store';

function formatCurrency(amount: number): string {
  return `PHP ${amount.toFixed(2)}`;
}

export function Sales() {
  const { sales, loading } = useStore();
  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);

  const totalRevenue = useMemo(() => {
    return sales.reduce((total, sale) => total + sale.totalAmount, 0);
  }, [sales]);

  const totalItemsSold = useMemo(() => {
    return sales.reduce(
      (total, sale) => total + sale.items.reduce((saleTotal, item) => saleTotal + item.quantity, 0),
      0
    );
  }, [sales]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl text-gray-900 mb-1">Sales</h1>
          <p className="text-sm text-gray-500">Loading sales records...</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
          <div className="h-5 w-36 bg-gray-100 rounded mb-6" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-12 bg-gray-50 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl text-gray-900 mb-1">Sales</h1>
        <p className="text-sm text-gray-500">Review completed POS sales and receipts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Total Sales</p>
          <p className="text-3xl text-gray-900">{sales.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Items Sold</p>
          <p className="text-3xl text-gray-900">{totalItemsSold}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Revenue</p>
          <p className="text-3xl text-gray-900">{formatCurrency(totalRevenue)}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
          <Receipt className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg text-gray-900">Recent Sales</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs text-gray-500 uppercase tracking-wider">Receipt</th>
                <th className="text-left px-6 py-3 text-xs text-gray-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-3 text-xs text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="text-left px-6 py-3 text-xs text-gray-500 uppercase tracking-wider">Items</th>
                <th className="text-left px-6 py-3 text-xs text-gray-500 uppercase tracking-wider">Paid</th>
                <th className="text-left px-6 py-3 text-xs text-gray-500 uppercase tracking-wider">Change</th>
                <th className="text-left px-6 py-3 text-xs text-gray-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sales.length > 0 ? (
                sales.map((sale) => (
                  <Fragment key={sale.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <button
                          type="button"
                          onClick={() => setExpandedSaleId(expandedSaleId === sale.id ? null : sale.id)}
                          className="inline-flex items-center gap-2 text-left text-gray-900 hover:text-blue-700"
                          aria-expanded={expandedSaleId === sale.id}
                        >
                          {expandedSaleId === sale.id ? (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          )}
                          {sale.receiptNo}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{sale.date}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{sale.customerName || 'Walk-in'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{sale.items.length}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatCurrency(sale.paidAmount)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatCurrency(sale.changeAmount)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(sale.totalAmount)}</td>
                    </tr>
                    {expandedSaleId === sale.id && (
                      <tr className="bg-gray-50">
                        <td colSpan={7} className="px-6 py-4">
                          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                            <table className="w-full">
                              <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                  <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">
                                    Product
                                  </th>
                                  <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">
                                    Quantity
                                  </th>
                                  <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">
                                    Unit Price
                                  </th>
                                  <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">
                                    Line Total
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {sale.items.map((item) => (
                                  <tr key={`${sale.id}-${item.productId}`}>
                                    <td className="px-4 py-3 text-sm text-gray-900">{item.productName}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{item.quantity}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                      {formatCurrency(item.unitPrice)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                      {formatCurrency(item.lineTotal)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                      <Search className="w-8 h-8 text-gray-300" />
                      <p className="text-sm">No sales recorded yet.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
