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
import AdminPage from "./pages/AdminPage"
import CartPage from "./pages/CartPage";
import EditProfilePage from "./pages/EditProfile";

function App() {
  const baseUrl = "http://localhost:3000";

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login baseUrl={baseUrl} />} />
        <Route path="/register" element={<RegisterPage baseUrl={baseUrl} />} />
        <Route path="/admin" element={<AdminPage  baseUrl={baseUrl} />} /> 
        <Route path="/admin/products" element={<AdminProductPage baseUrl={baseUrl} />} />
        <Route path="/admin/category" element={<AdminCategoryPage baseUrl={baseUrl} />} /> 
        <Route
          element={
            <div>
              <Navbar />
              <Outlet />
            </div>
          }
        >
          <Route path="/" element={<HomePage baseUrl={baseUrl} />} />
          <Route path="/editprofile"element={<EditProfilePage baseUrl={baseUrl} />}/>
          <Route path="/cart" element={<CartPage  baseUrl={baseUrl} />} /> 
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
