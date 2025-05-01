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

function App() {
  const baseUrl = "http://localhost:3000";

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login baseUrl={baseUrl} />} />
        <Route path="/register" element={<RegisterPage baseUrl={baseUrl} />} />
        <Route
          element={
            <div>
              <Navbar />
              <Outlet />
            </div>
          }
        >
          <Route path="/" element={<HomePage baseUrl={baseUrl} />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
