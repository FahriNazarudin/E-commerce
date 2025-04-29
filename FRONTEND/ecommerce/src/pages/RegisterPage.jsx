import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../assets/styles.css";
import Swal from "sweetalert2";

const FormRegister = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        // "https://h8-phase2-gc.vercel.app/apis/lectures/pub/register",
        {
          email,
          password,
        }
      );
      navigate("/login");
    } catch (error) {
      console.log(error, "REGISTRATION FAILED");
      Swal.fire({
        title: "Error!",
        text: "Registration failed",
        icon: "error",
        confirmButtonText: "Cool",
      });
    }
  };

  return (
    <div className="Register-container">
      <h2 className="Register-title">Register</h2>
      <form id="registerForm" onSubmit={handleRegister}>
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
          />
        </div>
        <div className="d-grid">
          <button
            type="submit"
            className="btn btn-primary"
          >
          </button>
        </div>
      </form>
      <p className="text-center mt-3">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default FormRegister;
