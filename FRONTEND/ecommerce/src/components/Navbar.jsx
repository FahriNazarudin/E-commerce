import { BsCart2, BsPersonCircle } from "react-icons/bs";
import { Link } from "react-router";

export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg mx-4 center ">
      <nav className="navbar ">
        <div className="container">
          <Link className="navbar-brand" to="/">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRS8oaKbTJY4O5L1zrnPY9XRINuJuHEW03ROw&s"
              alt="IKEA"
              width={80}
            />
          </Link>
        </div>
      </nav>
      <form
        className="d-flex ms-auto "
        role="search"
        style={{ width: "2000vh" }}
      >
        <input
          className="form-control me-3"
          type="search"
          placeholder="Search"
          aria-label="Search"
          style={{ width: "100%" }}
        />
        <button className="btn btn-outline-seconda" type="submit">
          Search
        </button>
      </form>
      <div className="container-fluid">
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link active" aria-current="page" href="#">
                <BsCart2 size={25} />
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="#">
                <BsPersonCircle size={25} />
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
