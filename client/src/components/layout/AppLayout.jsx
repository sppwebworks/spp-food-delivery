import AnnouncementBar from "./AnnouncementBar";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CartSidebar from "../cart/CartSidebar";

const AppLayout = ({ children }) => {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className="app-main-full">{children}</main>
      <CartSidebar />
      <Footer />
    </>
  );
};

export default AppLayout;
