/**
 * ============================================================
 * ADMIN APP — Routes + Socket Connection
 * ============================================================
 */

import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loadAdmin } from "./features/adminAuth/adminAuthSlice";
import { connectSocket } from "./services/socket";

import AdminLayout from "./components/layout/AdminLayout";
import ProtectedAdmin from "./components/ProtectedAdmin";

import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import Users from "./pages/Users";
import Restaurants from "./pages/Restaurants";
import MenuItems from "./pages/MenuItems";
import Coupons from "./pages/Coupons";
import Settings from "./pages/Settings";
import Announcements from "./pages/Announcements";
import HeroBanners from "./pages/HeroBanners";
import AdminSupport from "./pages/Support";
import Riders from "./pages/Riders";

function App() {
  const dispatch = useDispatch();
  const { token, user } = useSelector((s) => s.adminAuth);

  useEffect(() => {
    if (token && !user) dispatch(loadAdmin());
  }, [dispatch, token, user]);

  useEffect(() => {
    if (token && user) connectSocket();
  }, [token, user]);

  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLogin />} />

      <Route
        path="/admin"
        element={
          <ProtectedAdmin>
            <AdminLayout />
          </ProtectedAdmin>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="orders" element={<Orders />} />
        <Route path="orders/:id" element={<OrderDetail />} />
        <Route path="users" element={<Users />} />
        <Route path="restaurants" element={<Restaurants />} />
        <Route path="restaurants/:id" element={<MenuItems />} />
        <Route path="coupons" element={<Coupons />} />
        <Route path="settings" element={<Settings />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="hero-banners" element={<HeroBanners />} />
        <Route path="support" element={<AdminSupport />} />
        <Route path="riders" element={<Riders />} />
      </Route>

      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}

export default App;
