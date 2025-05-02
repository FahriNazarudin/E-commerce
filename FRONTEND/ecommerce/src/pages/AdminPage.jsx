import { Link, useNavigate } from "react-router";
import Swal from "sweetalert2";

export default function AdminProductPage() {
    const navigate = useNavigate()

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
      <section className="position-absolute top-50 start-50 translate-middle d-flex flex-column align-items-center gap-3">
        <h1
          style={{
            color: "rgba(44, 44, 44, 0.83)",
          }}
        >
          WellCome Admin!
        </h1>
        <div className="card-body">
          <Link to="/admin/products" className="btn btn-secondary">
            UPDATE PRODUCTS
          </Link>
        </div>
        <div className="card-body">
          <Link to="/admin/category" className="btn btn-secondary">
            UPDATE CATEGORY
          </Link>
        </div>
        <div className="card-body">
          <Link
            to="/login"
            className="btn btn-secondary"
            onClick={handleLogout}
          >
            LOGOUT
          </Link>
        </div>
      </section>
    </div>
  );
}
