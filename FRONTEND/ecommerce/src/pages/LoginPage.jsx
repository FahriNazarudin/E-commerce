import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@mail.com");
  const [password, setPassword] = useState("123456");

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(
        "https://h8-phase2-gc.vercel.app/apis/login",
        {
          email,
          password,
        }
      );
      localStorage.setItem("access_token", response.data.access_token);
      navigate("/");
      Swal.fire({
        position: "top-center",
        icon: "success",
        title: "Login Successful",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Email or Password wrong",
        icon: "error",
        confirmButtonText: "OK",
      });
      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        navigate("/login");
      }
      console.error("Login error:", error);
    }
  };

  const handleCredentialResponse = async (response) => {
    try {
      console.log("Google JWT Token:", response.credential);
      const { data } = await axios.post(
        "https://h8-phase2-gc.vercel.app/apis/login/google",
        {
          googleToken: response.credential,
        }
      );
      localStorage.setItem("access_token", data.access_token);
      navigate("/");
      Swal.fire({
        position: "top-center",
        icon: "success",
        title: "Google Login Successful",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Google Login Failed",
        icon: "error",
        confirmButtonText: "OK",
      });
      console.error("Google login error:", error);
    }
  };

  useEffect(() => {
    // console.log("Google Client ID:", import.meta.env.VITE_GOOGLE_CLIENT_ID);
    if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      console.error("Google Client ID is not defined. Check .env file.");
      return;
    }
    if (!window.google) {
      // console.error("Google SDK not loaded. Check index.html script.");
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
      className="login-container"
      style={{ maxWidth: "400px", margin: "50px auto", padding: "20px" }}
    >
      <h2 className="login-title" style={{ textAlign: "center" }}>
        Login
      </h2>
      <form onSubmit={handleLogin} id="loginForm">
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email address
          </label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
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
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
        <div className="d-grid">
          <button type="submit" className="btn btn-warning text-white">
            Login
          </button>
        </div>
      </form>
      <p className="text-center mt-3">
        Don't have an account? <Link to="/register">Register</Link>
      </p>
      <div
        id="buttonDiv"
        style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}
      ></div>
    </div>
  );
};

export default Login;
