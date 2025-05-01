import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import PropTypes from "prop-types";

export default function LoginPage({ baseUrl }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(`${baseUrl}/login`, {
        email,
        password,
      });
      console.log("Login response:", response.data); // Debug
      localStorage.setItem("access_token", response.data.access_token);
      localStorage.setItem("userId", response.data.userId);
      navigate("/");
      Swal.fire({
        position: "top-center",
        icon: "success",
        title: "Login Berhasil",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Email atau Password salah",
        icon: "error",
        confirmButtonText: "OK",
      });
      console.error("Login error:", error.response?.data || error);
      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("userId");
        navigate("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCredentialResponse = async (response) => {
    try {
      console.log("Google JWT Token:", response.credential);
      const { data } = await axios.post(`${baseUrl}/login/google`, {
        googleToken: response.credential,
      });
      console.log("Google login response:", data); // Debug
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("userId", data.userId);
      navigate("/");
      Swal.fire({
        position: "top-center",
        icon: "success",
        title: "Login Google Berhasil",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Google Login Gagal",
        icon: "error",
        confirmButtonText: "OK",
      });
      console.error("Google login error:", error.response?.data || error);
    }
  };

  useEffect(() => {
    if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      console.error("Google Client ID tidak ditemukan. Periksa file .env.");
      return;
    }
    if (!window.google) {
      console.error("Google SDK tidak dimuat. Periksa script di index.html.");
      return;
    }
    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
    });
    window.google.accounts.id.renderButton(
      document.getElementById("buttonDiv"),
      { theme: "outline", size: "large" }
    );
  }, []);

  return (
    <div
      className="d-flex justify-content-center align-items-center w-100 vh-100"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1605774337664-7a846e9cdf17?q=80&w=3174&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div
        className="card shadow-sm p-4 rounded-3"
        style={{
          maxWidth: "400px",
          width: "100%",
          backgroundColor: "rgba(237, 237, 237, 0.83)",
        }}
      >
        <h2
          className="text-center mb-4"
          style={{
            fontFamily: "Poppins",
          }}
        >
          Login
        </h2>
        <form id="loginForm" onSubmit={handleLogin}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email address
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              placeholder="Masukkan email Anda"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              aria-label="Email address"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              placeholder="Masukkan password Anda"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              aria-label="Password"
            />
          </div>
          <div className="d-grid mb-3">
            <button
              type="submit"
              className="btn btn-outline-secondary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Sedang login...
                </>
              ) : (
                "Login"
              )}
            </button>
          </div>
        </form>
        <div
          id="buttonDiv"
          className="d-flex justify-content-center mb-3"
        ></div>
        <p className="text-center mb-0">
          Belum punya akun?{" "}
          <Link to="/register" className="text-secondary">
            Daftar
          </Link>
        </p>
      </div>
    </div>
  );
}

LoginPage.propTypes = {
  baseUrl: PropTypes.string.isRequired,
};
