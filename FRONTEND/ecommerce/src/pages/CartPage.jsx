import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

function CartPage({ baseUrl, setCartCount }) {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      navigate("/login");
      return;
    }

    const fetchCart = async () => {
      try {
        const response = await axios.get(`${baseUrl}/carts`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        setCartItems(response.data);
      } catch (err) {
        console.error("Failed to fetch cart:", err);
        Swal.fire({
          title: "Error!",
          text: "Failed to load cart",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    };
    fetchCart();
  }, [baseUrl, navigate]);

  const handleUpdateQuantity = async (id, productId, quantity) => {
    if (quantity <= 0) {
      Swal.fire({
        title: "Error!",
        text: "Quantity must be greater than 0",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }
    try {
      await axios.put(
        `${baseUrl}/carts/${id}`,
        { productId, quantity },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      setCartItems(
        cartItems.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    } catch (err) {
      console.error("Failed to update cart:", err);
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await axios.delete(`${baseUrl}/carts/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      setCartItems(cartItems.filter((item) => item.id !== id));
      setCartCount((prev) => prev - 1);
    } catch (err) {
      console.error("Failed to delete item:", err);
    }
  };

  return (
    <div>
      <h2 style={{ textAlign: "center" }}>Shopping Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <div className="d-flex justify-content-center">
          <div className="card mx-4 rounded-4 w-75 ">
            <div className="table-responsive mt-4">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.Product?.name || "Product not found"}</td>
                      <td>
                        Rp {item.Product?.price?.toLocaleString("id-ID") || 0}
                      </td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleUpdateQuantity(
                              item.id,
                              item.productId,
                              parseInt(e.target.value)
                            )
                          }
                          className="form-control"
                          style={{ width: "80px" }}
                        />
                      </td>
                      <td>
                        Rp{" "}
                        {(item.Product?.price * item.quantity)?.toLocaleString(
                          "id-ID"
                        ) || 0}
                      </td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      <div className="d-flex justify-content-center ">
        <Link
          className="btn btn-outline-secondary mt-4 d-flex justify-content-center align-items-center mx-4 w-25"
          to="/"
        >
          Back
        </Link>
        <Link
          className="btn btn-secondary mt-4 d-flex justify-content-center align-items-center mx-4 w-25"
          to="/"
        >
          Buy
        </Link>
      </div>
    </div>
  );
}

CartPage.propTypes = {
  baseUrl: PropTypes.string.isRequired,
  setCartCount: PropTypes.func.isRequired,
};

export default CartPage;
