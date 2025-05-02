import axios from "axios";
import {  useEffect, useState } from "react";
import { BsCart2, BsPersonCircle } from "react-icons/bs";
import { Link, useNavigate } from "react-router";
import Swal from "sweetalert2";

export default function Navbar({baseUrl}) {
  const navigate = useNavigate();
  const [carts, setCarts] = useState()
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
    const response = await axios.get(
      `${baseUrl}/carts`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );
    setCarts(response.data) 
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
    <nav className="navbar navbar-expand-lg mx-4 center ">
      <nav className="navbar ">
        <div className="container">
          <Link className="navbar-brand" to="/">
            <img
              src="https://awsimages.detik.net.id/community/media/visual/2020/03/31/c463a3c7-c327-4a91-a382-343074960b08_169.jpeg?w=700&q=90"
              alt="Home"
              width={80}
            /> 
          </Link> 
        </div>
      </nav>
      <form
        className="d-flex ms-auto "
        role="search"
        style={{ width: "2000vh" }}
      ></form>
      <div className="container-fluid">
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item position-relative">
              <Link className="nav-link active" aria-current="page" to="/cart">
                <BsCart2 size={25} />
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/editprofile">
                <BsPersonCircle size={25} />
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/login">
                <button className=" btn btn-secondary" onClick={handleLogout}>
                  Logout
                </button>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );

}