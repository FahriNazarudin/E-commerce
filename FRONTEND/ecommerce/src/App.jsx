import Navbar from "./components/Navbar";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import Login from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import AdminCategoryPage from "./pages/AdminCategoryPage";
import AdminProductPage from "./pages/AdminProductPage";
import AdminPage from "./pages/AdminPage";
import CartPage from "./pages/CartPage";
import EditProfilePage from "./pages/EditProfile";
import PaymentStatusPage from "./pages/PaymentStatusPage";
import ChatBot from "./components/ChatBot"; 
import { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const baseUrl = "http://localhost:80";
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const fetchCartCount = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      try {
        const response = await axios.get(`${baseUrl}/carts`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data && Array.isArray(response.data)) {
          setCartCount(response.data.length);
        }
      } catch (error) {
        console.error("Failed to fetch cart count:", error);
      }
    };

    fetchCartCount();
  }, [baseUrl]);

  return (
    <Router>
      <Routes>
        <Route path="/register" element={<RegisterPage baseUrl={baseUrl} />} />
        <Route
          path="/login"
          element={<Login baseUrl={baseUrl} setCartCount={setCartCount} />}
        />
        <Route path="/admin" element={<AdminPage baseUrl={baseUrl} />} />
        <Route
          path="/admin/products"
          element={<AdminProductPage baseUrl={baseUrl} />}
        />
        <Route
          path="/admin/category"
          element={<AdminCategoryPage baseUrl={baseUrl} />}
        />
        <Route
          element={
            <div>
              <Navbar cartCount={cartCount} />
              <Outlet />
              {/* Add the ChatBot component here */}
              <ChatBot baseUrl={baseUrl} />
            </div>
          }
        >
          <Route
            path="/"
            element={<HomePage baseUrl={baseUrl} setCartCount={setCartCount} />}
          />
          <Route
            path="/editprofile"
            element={<EditProfilePage baseUrl={baseUrl} />}
          />
          <Route
            path="/cart"
            element={<CartPage baseUrl={baseUrl} setCartCount={setCartCount} />}
          />
          <Route
            path="/payment-status"
            element={
              <PaymentStatusPage
                baseUrl={baseUrl}
                setCartCount={setCartCount}
              />
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
