import { createBrowserRouter, Navigate } from "react-router";
import { Login } from "./components/Login";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { Products } from "./components/Products";
import { StockManagement } from "./components/StockManagement";
import { Suppliers } from "./components/Suppliers";
import { Categories } from "./components/Categories";
import { PurchaseOrders } from "./components/PurchaseOrders";
import { apiService } from "../services/api";

// Protected route wrapper
function ProtectedRoute({ Component }: { Component: React.ComponentType }) {
  const token = apiService.getToken();
  return token ? <Component /> : <Navigate to="/login" replace />;
}

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: () => <ProtectedRoute Component={Dashboard} /> },
      { path: "products", Component: () => <ProtectedRoute Component={Products} /> },
      { path: "stock", Component: () => <ProtectedRoute Component={StockManagement} /> },
      { path: "suppliers", Component: () => <ProtectedRoute Component={Suppliers} /> },
      { path: "categories", Component: () => <ProtectedRoute Component={Categories} /> },
      { path: "purchase-orders", Component: () => <ProtectedRoute Component={PurchaseOrders} /> },
    ],
  },
  {
    path: "*",
    Component: () => <Navigate to="/login" replace />,
  },
]);
