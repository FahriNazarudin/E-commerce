import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PropTypes from "prop-types";
import axios from "axios";
import Swal from "sweetalert2";

function PaymentStatusPage({ baseUrl, setCartCount }) {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [orderDetails, setOrderDetails] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkStatus = async () => {
      const orderId = searchParams.get("order_id");
      if (!orderId) {
        setStatus("error");
        return;
      }

      try {
        const response = await axios.get(
          `${baseUrl}/transaction/status/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );

        const transactionStatus = response.data.transaction_status;
        setOrderDetails(response.data);

        if (
          transactionStatus === "settlement" ||
          transactionStatus === "capture" ||
          transactionStatus === "success"
        ) {
          setStatus("success");
          setCartCount(0);
        } else if (
          transactionStatus === "pending" ||
          transactionStatus === "process"
        ) {
          setStatus("pending");
        } else {
          setStatus("failed");
        }
      } catch (error) {
        console.error("Error checking transaction status:", error);
        setStatus("error");
      }
    };

    checkStatus();
  }, [baseUrl, searchParams, setCartCount]);

  const handleContinueShopping = () => {
    navigate("/");
  };

  const handleViewOrders = () => {
    navigate("/");
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card border-0 shadow">
            <div className="card-body p-4">
              {status === "loading" && (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3">Checking payment status...</p>
                </div>
              )}

              {status === "success" && (
                <div className="text-center py-4">
                  <div className="mb-4">
                    <i
                      className="bi bi-check-circle-fill text-success"
                      style={{ fontSize: "4rem" }}
                    ></i>
                  </div>
                  <h2 className="mb-3">Payment Successful!</h2>
                  <p className="text-muted">
                    Your transaction has been completed successfully. Thank you
                    for your purchase!
                  </p>

                  {orderDetails && (
                    <div className="card bg-light mt-4 mb-4">
                      <div className="card-body text-start">
                        <h6 className="card-title">Order Details</h6>
                        <div className="row mb-2">
                          <div className="col-6 text-muted">Order ID:</div>
                          <div className="col-6 text-end">
                            {orderDetails.order_id}
                          </div>
                        </div>
                        <div className="row mb-2">
                          <div className="col-6 text-muted">
                            Transaction Time:
                          </div>
                          <div className="col-6 text-end">
                            {new Date(
                              orderDetails.transaction_time
                            ).toLocaleString()}
                          </div>
                        </div>
                        <div className="row mb-2">
                          <div className="col-6 text-muted">
                            Payment Method:
                          </div>
                          <div className="col-6 text-end">
                            {orderDetails.payment_type}
                          </div>
                        </div>
                        <div className="row mb-2">
                          <div className="col-6 text-muted">Amount:</div>
                          <div className="col-6 text-end fw-bold">
                            Rp{" "}
                            {parseInt(orderDetails.gross_amount).toLocaleString(
                              "id-ID"
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="d-grid gap-2 d-md-flex justify-content-md-center mt-4">
                    <button
                      className="btn btn-primary px-4"
                      onClick={handleContinueShopping}
                    >
                      Continue Shopping
                    </button>
                    <button
                      className="btn btn-outline-secondary px-4"
                      onClick={handleViewOrders}
                    >
                      View Orders
                    </button>
                  </div>
                </div>
              )}

              {status === "pending" && (
                <div className="text-center py-4">
                  <div className="mb-4">
                    <i
                      className="bi bi-clock-fill text-warning"
                      style={{ fontSize: "4rem" }}
                    ></i>
                  </div>
                  <h2 className="mb-3">Payment Pending</h2>
                  <p className="text-muted">
                    Your payment is still being processed. We'll notify you once
                    it's completed.
                  </p>
                  {orderDetails && (
                    <div className="alert alert-warning">
                      <p className="mb-0">
                        <strong>Order ID:</strong> {orderDetails.order_id}
                      </p>
                      <p className="mb-0">
                        <strong>Status:</strong>{" "}
                        {orderDetails.transaction_status}
                      </p>
                    </div>
                  )}
                  <button
                    className="btn btn-primary mt-3"
                    onClick={handleContinueShopping}
                  >
                    Continue Shopping
                  </button>
                </div>
              )}

              {status === "failed" && (
                <div className="text-center py-4">
                  <div className="mb-4">
                    <i
                      className="bi bi-x-circle-fill text-danger"
                      style={{ fontSize: "4rem" }}
                    ></i>
                  </div>
                  <h2 className="mb-3">Payment Failed</h2>
                  <p className="text-muted">
                    Your payment was not successful. Please try again or choose
                    a different payment method.
                  </p>
                  {orderDetails && (
                    <div className="alert alert-danger">
                      <p className="mb-0">
                        <strong>Order ID:</strong> {orderDetails.order_id}
                      </p>
                      <p className="mb-0">
                        <strong>Status:</strong>{" "}
                        {orderDetails.transaction_status}
                      </p>
                      {orderDetails.status_message && (
                        <p className="mb-0">
                          <strong>Message:</strong>{" "}
                          {orderDetails.status_message}
                        </p>
                      )}
                    </div>
                  )}
                  <button
                    className="btn btn-primary mt-3"
                    onClick={() => navigate("/cart")}
                  >
                    Try Again
                  </button>
                </div>
              )}

              {status === "error" && (
                <div className="text-center py-4">
                  <div className="mb-4">
                    <i
                      className="bi bi-exclamation-triangle-fill text-danger"
                      style={{ fontSize: "4rem" }}
                    ></i>
                  </div>
                  <h2 className="mb-3">Something Went Wrong</h2>
                  <p className="text-muted">
                    We couldn't check your payment status. Please contact our
                    customer service.
                  </p>
                  <button
                    className="btn btn-primary mt-3"
                    onClick={handleContinueShopping}
                  >
                    Back to Home
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

PaymentStatusPage.propTypes = {
  baseUrl: PropTypes.string.isRequired,
  setCartCount: PropTypes.func.isRequired,
};

export default PaymentStatusPage;
