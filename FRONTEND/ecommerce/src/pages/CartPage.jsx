import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

function CartPage({ baseUrl, setCartCount }) {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      navigate("/login");
      return;
    }

    const fetchCart = async () => {
      setIsLoading(true);
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
      } finally {
        setIsLoading(false);
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

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.Product?.price || 0) * item.quantity;
    }, 0);
  };

  const handleCheckout = async () => {
    setIsProcessingCheckout(true);
    try {
      console.log("Initiating Snap checkout process");
      const response = await axios.post(
        `${baseUrl}/checkout/snap`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      console.log("Snap checkout response:", response.data);
      const { token } = response.data;

      // Trigger Snap popup
      window.snap.pay(token, {
        onSuccess: function (result) {
          console.log("Payment success:", result);
          Swal.fire({
            title: "Payment Successful!",
            text: "Your payment has been processed successfully.",
            icon: "success",
            confirmButtonText: "OK",
          }).then(() => {
            navigate(`/payment-status?order_id=${response.data.orderId}`);
          });
        },
        onPending: function (result) {
          console.log("Payment pending:", result);
          navigate(`/payment-status?order_id=${response.data.orderId}`);
        },
        onError: function (result) {
          console.log("Payment error:", result);
          Swal.fire({
            title: "Payment Error",
            text: "There was an error processing your payment. Please try again.",
            icon: "error",
            confirmButtonText: "OK",
          });
        },
        onClose: function () {
          console.log("Payment closed without completing");
          Swal.fire({
            title: "Payment Cancelled",
            text: "You closed the payment window before completing the payment.",
            icon: "warning",
            confirmButtonText: "OK",
          });
        },
      });
    } catch (error) {
      console.error("Checkout failed:", error);

      let errorMessage = "Failed to process checkout";

      if (error.response) {
        console.error("Error response data:", error.response.data);
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 500) {
          errorMessage =
            "Server error. Please try again later or contact support.";
        }
      } else if (error.request) {
        errorMessage = "No response from server. Please check your connection.";
      }

      Swal.fire({
        title: "Checkout Error",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white py-3">
              <h3 className="mb-0">Shopping Cart</h3>
            </div>
            <div className="card-body">
              {isLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3">Loading your cart...</p>
                </div>
              ) : cartItems.length === 0 ? (
                <div className="text-center py-5">
                  <i
                    className="bi bi-cart-x"
                    style={{ fontSize: "4rem", color: "#ccc" }}
                  ></i>
                  <h4 className="mt-3">Your cart is empty</h4>
                  <p className="text-muted">
                    Browse our products and add something to your cart
                  </p>
                  <Link to="/" className="btn btn-outline-secondary mt-3">
                    Continue Shopping
                  </Link>
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead>
                        <tr>
                          <th scope="col">Product</th>
                          <th scope="col">Price</th>
                          <th scope="col" className="text-center">
                            Quantity
                          </th>
                          <th scope="col" className="text-end">
                            Total
                          </th>
                          <th scope="col" className="text-center">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {cartItems.map((item) => (
                          <tr key={item.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                {item.Product?.imgUrl && (
                                  <img
                                    src={item.Product.imgUrl}
                                    alt={item.Product?.name}
                                    className="rounded me-3"
                                    style={{
                                      width: "60px",
                                      height: "60px",
                                      objectFit: "cover",
                                    }}
                                  />
                                )}
                                <div>
                                  <h6 className="mb-0">
                                    {item.Product?.name || "Product not found"}
                                  </h6>
                                  {item.Product?.description && (
                                    <small className="text-muted">
                                      {item.Product.description.substring(
                                        0,
                                        60
                                      )}
                                      ...
                                    </small>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td>
                              Rp{" "}
                              {item.Product?.price?.toLocaleString("id-ID") ||
                                0}
                            </td>
                            <td className="text-center">
                              <div
                                className="input-group"
                                style={{ width: "120px", margin: "0 auto" }}
                              >
                                <button
                                  className="btn btn-sm btn-outline-secondary"
                                  type="button"
                                  onClick={() =>
                                    handleUpdateQuantity(
                                      item.id,
                                      item.productId,
                                      item.quantity - 1
                                    )
                                  }
                                  disabled={item.quantity <= 1}
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    handleUpdateQuantity(
                                      item.id,
                                      item.productId,
                                      parseInt(e.target.value) || 1
                                    )
                                  }
                                  className="form-control form-control-sm text-center"
                                />
                                <button
                                  className="btn btn-sm btn-outline-secondary"
                                  type="button"
                                  onClick={() =>
                                    handleUpdateQuantity(
                                      item.id,
                                      item.productId,
                                      item.quantity + 1
                                    )
                                  }
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="text-end">
                              Rp{" "}
                              {(
                                (item.Product?.price || 0) * item.quantity
                              ).toLocaleString("id-ID")}
                            </td>
                            <td className="text-center">
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeleteItem(item.id)}
                                aria-label="Delete item"
                              >
                                <i className="bi bi-trash"></i> Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="card mt-4 border-0 bg-light">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span>Subtotal:</span>
                        <span className="fw-bold">
                          Rp {calculateTotal().toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span>Shipping:</span>
                        <span className="fw-bold">Free</span>
                      </div>
                      <hr />
                      <div className="d-flex justify-content-between align-items-center mb-0">
                        <span className="fs-5">Total:</span>
                        <span className="fs-5 fw-bold">
                          Rp {calculateTotal().toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="card-footer bg-white border-0 py-3">
                <div className="row g-3">
                  <div className="col-md-6">
                    <Link className="btn btn-outline-secondary w-100" to="/">
                      <i className="bi bi-arrow-left me-2"></i> Continue
                      Shopping
                    </Link>
                  </div>
                  <div className="col-md-6">
                    <button
                      className="btn btn-secondary w-100"
                      onClick={handleCheckout}
                      disabled={isProcessingCheckout}
                    >
                      {isProcessingCheckout ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Processing...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-credit-card me-2"></i> Pay Now
                        </>
                      )}
                    </button>
                    <div className="mt-2 text-center small text-muted">
                      <i className="bi bi-shield-check me-1"></i>
                      Secured by Midtrans Payment Gateway
                    </div>
                    <div className="mt-2 d-flex justify-content-center align-items-center gap-2">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png"
                        alt="Visa"
                        height="20"
                      />
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png"
                        alt="Mastercard"
                        height="20"
                      />
                      <img
                        src="https://images.seeklogo.com/logo-png/39/2/quick-response-code-indonesia-standard-qris-logo-png_seeklogo-391791.png"
                        alt="QRIS"
                        height="40"
                      />
                      <img
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSW9YUwWTjUqlO04YDbTs51HpkmZSZLe2Px6g&s"
                        alt="GoPay"
                        height="30"
                      />
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Logo_ovo_purple.svg/2560px-Logo_ovo_purple.svg.png"
                        alt="OVO"
                        height="16"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

CartPage.propTypes = {
  baseUrl: PropTypes.string.isRequired,
  setCartCount: PropTypes.func.isRequired,
};

export default CartPage;
