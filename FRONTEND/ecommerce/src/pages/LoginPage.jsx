import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import PropTypes from "prop-types";

export default function LoginPage({ baseUrl }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(`${baseUrl}/login`, {
        email,
        password,
      });
      localStorage.setItem("access_token", response.data.access_token);
      localStorage.setItem("userId", response.data.userId);
      console.log(response.data.role, "APA INI ROLE");

      if (response.data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
      Swal.fire({
        position: "top-center",
        icon: "success",
        title: "Login successful",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Invalid email or password",
        icon: "error",
        confirmButtonText: "OK",
      });
      console.error("Login failed:", error.response?.data || error);
      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("userId");
        navigate("/login");
      }
    }
  };

  const handleCredentialResponse = async (response) => {
    try {
      console.log("Google token received:", response.credential);

      const { data } = await axios.post(`${baseUrl}/login/google`, {
        googleToken: response.credential,
      });

      console.log("Google login successful:", data);
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("userId", data.userId);
      if (data.role === "admin") {
        navigate("/admin/products");
      } else {
        navigate("/");
      }
      Swal.fire({
        position: "top-center",
        icon: "success",
        title: "Logged in with Google successfully",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      console.error("Google login error details:", error);

      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to log in with Google",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  useEffect(() => {
    // Check if Google SDK is loaded and client ID is available
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    console.log("Google Client ID available:", !!googleClientId);

    if (!googleClientId) {
      console.error("Google Client ID not found. Check your .env file.");
      return;
    }

    // Initialize Google Sign-In with a slight delay to ensure DOM is ready
    const initializeGoogle = () => {
      if (window.google && window.google.accounts) {
        console.log("Initializing Google Sign-In button");
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleCredentialResponse,
        });

        const buttonDiv = document.getElementById("buttonDiv");
        if (buttonDiv) {
          window.google.accounts.id.renderButton(buttonDiv, {
            theme: "outline",
            size: "large",
            text: "signin_with", // Options: signin_with, signup_with, continue_with
            shape: "rectangular", // Options: rectangular, pill, circle
            logo_alignment: "center",
          });
        } else {
          console.error("Google Sign-In button container not found");
        }
      } else {
        console.error("Google SDK not loaded properly");
      }
    };

    // Try initializing, or wait for the SDK to load
    if (window.google && window.google.accounts) {
      initializeGoogle();
    } else {
      // Add a script to check if Google SDK gets loaded later
      const checkGoogleInterval = setInterval(() => {
        if (window.google && window.google.accounts) {
          clearInterval(checkGoogleInterval);
          initializeGoogle();
        }
      }, 100);

      // Clear interval after 10 seconds to prevent infinite checking
      setTimeout(() => clearInterval(checkGoogleInterval), 10000);
    }

    return () => {
      // Clean up any intervals if component unmounts
      if (window.checkGoogleInterval) {
        clearInterval(window.checkGoogleInterval);
      }
    };
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
        <h2 className="text-center mb-4" style={{ fontFamily: "Poppins" }}>
          Login
        </h2>
        <form id="loginForm" onSubmit={handleLogin}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email
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
              aria-label="Email"
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
              aria-label="Password"
            />
          </div>
          <div className="d-grid mb-3">
            <button type="submit" className="btn btn-outline-secondary">
              Login
            </button>
          </div>
        </form>
        <div
          id="buttonDiv"
          className="d-flex justify-content-center mb-3"
        ></div>
        <p className="text-center mb-0">
          Don't have an account?{" "}
          <Link to="/register" className="text-secondary">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

LoginPage.propTypes = {
  baseUrl: PropTypes.string.isRequired,
};
