/**
 * ============================================================
 * APP — Routes + Global Bootstrap + Socket Connection
 * ============================================================
 */

import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { loadUser } from "./features/auth/authSlice";
import { fetchSettings } from "./features/settings/settingsSlice";
import { fetchMyOrders } from "./features/orders/ordersSlice";
import { revalidateCoupon } from "./features/cart/cartSlice";
import { connectSocket } from "./services/socket"; // ✅ Import socket

import AppLayout from "./components/layout/AppLayout";

/* ---------- Pages ---------- */
import Home from "./pages/Home";
import Restaurants from "./pages/Restaurants";
import RestaurantDetail from "./pages/RestaurantDetail";
import ItemDetail from "./pages/ItemDetail";
import Checkout from "./pages/Checkout";
import StripeCheckout from "./pages/StripeCheckout";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import Cuisines from "./pages/Cuisines";
import Offers from "./pages/Offers";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Search from "./pages/Search";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Favorites from "./pages/Favorites";

import Careers from "./pages/Careers";
import Team from "./pages/Team";
import Blog from "./pages/Blog";
import Press from "./pages/Press";
import Help from "./pages/Help";
import Partner from "./pages/Partner";
import Ride from "./pages/Ride";
import Report from "./pages/Report";

import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Cookies from "./pages/Cookies";
import Refunds from "./pages/Refunds";
import Licenses from "./pages/Licenses";

import Support from "./pages/Support";
import TicketDetail from "./pages/TicketDetail";

/* ---------- Helpers ---------- */
const PrivateRoute = ({ children }) => {
  const { token, authLoaded } = useSelector((s) => s.auth);
  const location = useLocation();

  if (!authLoaded) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
        <div style={{ color: "var(--text-3)" }}>Loading...</div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
};

function App() {
  const dispatch = useDispatch();
  const { token, user, authLoaded } = useSelector((s) => s.auth);
  const settings = useSelector((s) => s.settings?.data);

  // Bootstrap settings
  useEffect(() => {
    if (!settings) dispatch(fetchSettings());
  }, [dispatch, settings]);

  // Bootstrap auth
  useEffect(() => {
    if (token && !user && !authLoaded) {
      dispatch(loadUser());
    }
  }, [dispatch, token, user, authLoaded]);

  // Fetch orders
  useEffect(() => {
    if (!token || !user || !authLoaded) return;
    dispatch(fetchMyOrders());
  }, [token, user, authLoaded]);

  // Revalidate coupon
  useEffect(() => {
    if (!token || !user || !authLoaded) return;
    dispatch(revalidateCoupon());
  }, [dispatch, token, user, authLoaded]);

  // ✅ Connect Socket once user is authenticated
  useEffect(() => {
    if (token && user) {
      connectSocket();
    }
  }, [token, user]);

  return (
    <>
      <ScrollToTop />
      <AppLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/restaurants" element={<Restaurants />} />
          <Route path="/restaurants/:id" element={<RestaurantDetail />} />
          <Route
            path="/restaurants/:id/item/:itemId"
            element={<ItemDetail />}
          />
          <Route path="/cuisines" element={<Cuisines />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/search" element={<Search />} />

          <Route path="/careers" element={<Careers />} />
          <Route path="/team" element={<Team />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/press" element={<Press />} />
          <Route path="/help" element={<Help />} />
          <Route path="/partner" element={<Partner />} />
          <Route path="/ride" element={<Ride />} />
          <Route path="/report" element={<Report />} />

          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="/refunds" element={<Refunds />} />
          <Route path="/licenses" element={<Licenses />} />

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/favorites" element={<Favorites />} />

          <Route
            path="/checkout"
            element={
              <PrivateRoute>
                <Checkout />
              </PrivateRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <PrivateRoute>
                <Orders />
              </PrivateRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <PrivateRoute>
                <OrderDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/stripe-checkout/:orderId"
            element={
              <PrivateRoute>
                <StripeCheckout />
              </PrivateRoute>
            }
          />

          <Route
            path="/support"
            element={
              <PrivateRoute>
                <Support />
              </PrivateRoute>
            }
          />
          <Route
            path="/support/:id"
            element={
              <PrivateRoute>
                <TicketDetail />
              </PrivateRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppLayout>
    </>
  );
}

export default App;
