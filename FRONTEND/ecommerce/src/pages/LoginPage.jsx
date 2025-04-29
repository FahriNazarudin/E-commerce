import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../assets/styles.css";
import Swal from "sweetalert2";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@mail.com");
  const [password, setPassword] = useState("123456");


  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(
        // "https://h8-phase2-gc.vercel.app/apis/login",
        {
          email,
          password,
        }
      );
      localStorage.setItem("access_token", response.data.data.access_token);
      navigate("/dashboard");
      Swal.fire({
        position: "top-center",
        icon: "success",
        title: "Your login now",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Email or Password wrong",
        icon: "error",
        confirmButtonText: "Cool",
      });
      if (
        error.status === 401 &&
        error.response.data.error === "Invalid token"
      ) {
        localStorage.removeItem("access_token");
        navigate("/login");
      }

      console.log(error);
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Login</h2>
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
          <button type="submit" className="btn btn-primary">
            Login
          </button>
        </div>
      </form>
      <p className="text-center mt-3">
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
};

export default Login;
