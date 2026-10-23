import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRider from "./components/ProtectedRider";
import RiderLayout from "./components/layout/RiderLayout";
import Login from "./pages/Login";
import OrderList from "./pages/OrderList";
import OrderDetail from "./pages/OrderDetail";
import Profile from "./pages/Profile";

const App = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route
      path="/"
      element={
        <ProtectedRider>
          <RiderLayout />
        </ProtectedRider>
      }
    >
      <Route index element={<OrderList />} />
      <Route path="orders/:id" element={<OrderDetail />} />
      <Route path="profile" element={<Profile />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
