import { createBrowserRouter, Navigate } from "react-router";
import { Login } from "./components/Login";
import { Layout } from "./components/Layout";
import { CashierLayout } from "./components/CashierLayout";
import { Dashboard } from "./components/Dashboard";
import { Products } from "./components/Products";
import { StockManagement } from "./components/StockManagement";
import { Suppliers } from "./components/Suppliers";
import { Categories } from "./components/Categories";
import { PurchaseOrders } from "./components/PurchaseOrders";
import { POS } from "./components/POS";
import { Sales } from "./components/Sales";
import { apiService } from "../services/api";

// Protected route wrapper
function ProtectedRoute({ Component, roles }: { Component: React.ComponentType; roles?: string[] }) {
  const token = apiService.getToken();
  const user = apiService.getUser();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !user) {
    apiService.clearToken();
    return <Navigate to="/login" replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to={user?.role === "cashier" ? "/pos" : "/"} replace />;
  }

  return <Component />;
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
      { index: true, Component: () => <ProtectedRoute Component={Dashboard} roles={["admin", "staff"]} /> },
      { path: "products", Component: () => <ProtectedRoute Component={Products} roles={["admin", "staff"]} /> },
      { path: "stock", Component: () => <ProtectedRoute Component={StockManagement} roles={["admin", "staff"]} /> },
      { path: "suppliers", Component: () => <ProtectedRoute Component={Suppliers} roles={["admin", "staff"]} /> },
      { path: "categories", Component: () => <ProtectedRoute Component={Categories} roles={["admin", "staff"]} /> },
      { path: "purchase-orders", Component: () => <ProtectedRoute Component={PurchaseOrders} roles={["admin", "staff"]} /> },
      { path: "sales", Component: () => <ProtectedRoute Component={Sales} roles={["admin", "staff"]} /> },
    ],
  },
  {
    path: "/pos",
    Component: CashierLayout,
    children: [
      { index: true, Component: () => <ProtectedRoute Component={POS} roles={["cashier"]} /> },
    ],
  },
  {
    path: "*",
    Component: () => <Navigate to="/login" replace />,
  },
]);
