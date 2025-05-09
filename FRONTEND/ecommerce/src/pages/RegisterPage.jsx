import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

export default function RegisterPage({ baseUrl }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate phone number
    if (!/^\d{8,}$/.test(phoneNumber.replace(/[+\-\s]/g, ""))) {
      Swal.fire({
        title: "Error!",
        text: "Phone number must be at least 8 digits",
        icon: "error",
        confirmButtonText: "OK",
      });
      setIsLoading(false);
      return;
    }

    try {
      await axios.post(`${baseUrl}/register`, {
        username,
        email,
        password,
        phoneNumber,
        address,
      });
      Swal.fire({
        position: "top-center",
        icon: "success",
        title: "Registration Successful",
        showConfirmButton: false,
        timer: 1500,
      });
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Registration failed",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
          Register
        </h2>
        <form id="registerForm" onSubmit={handleRegister}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              type="text"
              className="form-control"
              id="username"
              name="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              aria-label="Username"
            />
          </div>
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
              onChange={(e) => setEmail(e.target.value)}
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
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-label="Password"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="phoneNumber" className="form-label">
              Phone Number
            </label>
            <input
              type="text"
              className="form-control"
              id="phoneNumber"
              name="phoneNumber"
              placeholder="Enter your phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              aria-label="Phone number"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="address" className="form-label">
              Address
            </label>
            <input
              type="text"
              className="form-control"
              id="address"
              name="address"
              placeholder="Enter your address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              aria-label="Address"
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
                  Registering...
                </>
              ) : (
                "Register"
              )}
            </button>
          </div>
        </form>
        <p className="text-center mb-0">
          Already have an account?{" "}
          <Link to="/login" className="text-secondary">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
