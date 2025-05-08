import axios from "axios";
import { useEffect, useState } from "react";
import { BsCart2, BsPersonCircle } from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import PropTypes from "prop-types";

export default function Navbar({ baseUrl, cartCount }) {
  const navigate = useNavigate();
  const [carts, setCarts] = useState([]);
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/");
    Swal.fire({
      position: "center",
      icon: "success",
      title: "Bye!",
      showConfirmButton: false,
      timer: 1500,
    });
  };

  const fetchCart = async () => {
    try {
      const response = await axios.get(`${baseUrl}/carts`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      setCarts(response.data);
      // console.log(response.data, "<<<<");
    } catch (err) {
      console.error("Gagal mengambil produk:", err);
      Swal.fire({
        title: "Error!",
        text: "Gagal memuat daftar produk",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <img
            src="https://awsimages.detik.net.id/community/media/visual/2020/03/31/c463a3c7-c327-4a91-a382-343074960b08_169.jpeg?w=700&q=90"
            alt="Home"
            width={100}
            className="img-fluid"
          />
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarContent" 
          aria-controls="navbarContent" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <div className="ms-auto d-flex align-items-center">
            <div className="navbar-nav">
              <div className="nav-item position-relative me-3">
                <Link className="nav-link" aria-current="page" to="/cart">
                  <BsCart2 size={25} />
                  {cartCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>
              <div className="nav-item me-3">
                <Link className="nav-link" to="/editprofile">
                  <BsPersonCircle size={25} />
                </Link>
              </div>
              <div className="nav-item">
                <Link className="nav-link" to="/login">
                  <button className="btn btn-dark btn-sm" onClick={handleLogout}>
                    Logout
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

Navbar.propTypes = {
  baseUrl: PropTypes.string,
  cartCount: PropTypes.number,
};

Navbar.defaultProps = {
  cartCount: 0,
};
