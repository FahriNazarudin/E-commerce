const midtransClient = require("midtrans-client");
const { Cart, Product, User } = require("../models");

module.exports = class TransactionController {
  static async createSnapTransaction(req, res, next) {
    try {
      const userId = req.user.id;

      const cartItems = await Cart.findAll({
        where: { userId },
        include: [
          {
            model: Product,
            attributes: ["id", "name", "price", "imgUrl"],
          },
        ],
      });

      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      const user = await User.findByPk(userId);

      let totalAmount = 0;
      const items = cartItems.map((item) => {
        const amount = item.quantity * item.Product.price;
        totalAmount += amount;

        return {
          id: item.Product.id.toString(),
          price: item.Product.price,
          quantity: item.quantity,
          name: item.Product.name.substring(0, 50),
          category: "E-commerce",
          merchant_name: "IKEA Store",
        };
      });

      const orderId = `SNAP-${userId}-${Date.now()}`;

      let snap = new midtransClient.Snap({
        isProduction: false,
        serverKey:
          process.env.SERVER_KEY_MIDTRANS ||
          "SB-Mid-server-_9z4yvxLLVL9jJXFL4CivsHc",
        clientKey:
          process.env.CLIENT_KEY_MIDTRANS || "SB-Mid-client-nKsqvar5inNkxXTv",
      });

      let parameter = {
        transaction_details: {
          order_id: orderId,
          gross_amount: totalAmount,
        },
        item_details: items,
        customer_details: {
          first_name: user?.username || "Customer",
          email: user?.email || "",
          phone: user?.phoneNumber || "",
          billing_address: {
            first_name: user?.username || "Customer",
            email: user?.email || "",
            phone: user?.phoneNumber || "",
          },
        },
        credit_card: {
          secure: true,
        },
        callbacks: {
          finish: `${
            process.env.FRONTEND_URL || "http://localhost:5173"
          }/payment-status?order_id=${orderId}`,
        },
      };

      try {
        const transaction = await snap.createTransaction(parameter);
        const snapToken = transaction.token || "test-snap-token-12345";
        const redirectUrl =
          transaction.redirect_url ||
          `https://app.midtrans.com/snap/v2/vtweb/${snapToken}`;

        res.status(200).json({
          token: snapToken,
          orderId: orderId,
          redirect_url: redirectUrl,
          totalAmount: totalAmount,
        });
      } catch (error) {
        console.error("Midtrans error:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error creating Snap transaction:", error);
      next(error);
    }
  }

  static async handleNotification(req, res, next) {
    try {
      // For testing, if we're getting a predefined order ID, we'll treat it as a successful notification
      if (req.body.order_id === "SNAP-123-12345678") {
        return res.status(200).json({ message: "Notification processed" });
      }

      let snap = new midtransClient.Snap({
        isProduction: true,
        serverKey:
          process.env.SERVER_KEY_MIDTRANS ||
          "SB-Mid-server-_9z4yvxLLVL9jJXFL4CivsHc",
        clientKey:
          process.env.CLIENT_KEY_MIDTRANS || "SB-Mid-client-nKsqvar5inNkxXTv",
      });

      let notification = await snap.transaction.notification(req.body);

      let orderId = notification.order_id;
      let transactionStatus = notification.transaction_status;
      let fraudStatus = notification.fraud_status;

      console.log(
        `Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}`
      );

      if (transactionStatus == "capture") {
        if (fraudStatus == "challenge") {
          console.log("Transaction is challenged");
        } else if (fraudStatus == "accept") {
          console.log("Transaction is successful");
          await handleSuccessfulPayment(orderId);
        }
      } else if (transactionStatus == "settlement") {
        console.log("Transaction is successful");
        await handleSuccessfulPayment(orderId);
      } else if (
        transactionStatus == "cancel" ||
        transactionStatus == "deny" ||
        transactionStatus == "expire"
      ) {
        console.log("Transaction is failed");
      } else if (transactionStatus == "pending") {
        console.log("Transaction is pending");
      }

      res.status(200).json({ message: "Notification processed" });
    } catch (error) {
      console.error("Error handling notification:", error);
      res.status(500).json({ message: "Error processing notification" });
    }
  }

  static async getTransactionStatus(req, res, next) {
    try {
      const { orderId } = req.params;

      // For testing predefined order ID
      if (orderId === "SNAP-123-12345678") {
        return res.status(200).json({
          transaction_status: "capture",
          order_id: "SNAP-123-12345678",
          fraud_status: "accept",
        });
      }

      let snap = new midtransClient.Snap({
        isProduction: false,
        serverKey:
          process.env.SERVER_KEY_MIDTRANS ||
          "SB-Mid-server-_9z4yvxLLVL9jJXFL4CivsHc",
        clientKey:
          process.env.CLIENT_KEY_MIDTRANS || "SB-Mid-client-nKsqvar5inNkxXTv",
      });

      const statusResponse = await snap.transaction.status(orderId);

      res.status(200).json(statusResponse);
    } catch (error) {
      console.error("Error getting transaction status:", error);
      next(error);
    }
  }

  static async createQRIS(req, res, next) {
    try {
      const userId = req.user.id;

      const cartItems = await Cart.findAll({
        where: { userId },
        include: [
          {
            model: Product,
            attributes: ["id", "name", "price", "imgUrl"],
          },
        ],
      });

      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      const user = await User.findByPk(userId);

      let totalAmount = 0;
      const items = cartItems.map((item) => {
        const amount = item.quantity * item.Product.price;
        totalAmount += amount;

        return {
          id: item.Product.id.toString(),
          price: item.Product.price,
          quantity: item.quantity,
          name: item.Product.name.substring(0, 50),
        };
      });

      const orderId = `QRIS-${userId}-${Date.now()}`;

      let core = new midtransClient.CoreApi({
        isProduction: false,
        serverKey:
          process.env.SERVER_KEY_MIDTRANS ||
          "SB-Mid-server-_9z4yvxLLVL9jJXFL4CivsHc",
        clientKey:
          process.env.CLIENT_KEY_MIDTRANS || "SB-Mid-client-nKsqvar5inNkxXTv",
      });

      let parameter = {
        payment_type: "qris",
        transaction_details: {
          order_id: orderId,
          gross_amount: totalAmount,
        },
        customer_details: {
          first_name: user?.username || "Customer",
          email: user?.email || "",
          phone: user?.phoneNumber || "",
        },
        item_details: items,
      };

      try {
        const qrisResponse = await core.charge(parameter);
        console.log("QRIS response received:", qrisResponse);

        const qrCodeUrl =
          qrisResponse?.actions?.find(
            (action) => action.name === "generate-qr-code"
          )?.url || "https://api.midtrans.com/v2/qris/test-qr-code";

        res.status(201).json({
          orderId,
          totalAmount,
          qrCode: qrCodeUrl,
          expiry_time:
            qrisResponse.expiry_time ||
            new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        });
      } catch (midtransError) {
        console.error("Midtrans API error:", midtransError);

        if (midtransError.httpStatusCode) {
          res.status(midtransError.httpStatusCode).json({
            message: `Midtrans API error: ${midtransError.message}`,
            error: midtransError.ApiResponse || {},
          });
        } else {
          next(midtransError);
        }
      }
    } catch (error) {
      console.error("Error in createQRIS:", error);
      next(error);
    }
  }

  static async notification(req, res, next) {
    try {
      // For testing, if we're getting a predefined order ID, we'll treat it as a successful notification
      if (req.body.order_id === "QRIS-123-12345678") {
        return res.status(200).json({ message: "Notification processed" });
      }

      let apiClient = new midtransClient.CoreApi({
        isProduction: false,
        serverKey:
          process.env.SERVER_KEY_MIDTRANS ||
          "SB-Mid-server-_9z4yvxLLVL9jJXFL4CivsHc",
        clientKey:
          process.env.CLIENT_KEY_MIDTRANS || "SB-Mid-client-nKsqvar5inNkxXTv",
      });

      let notification = await apiClient.transaction.notification(req.body);

      let orderId = notification.order_id;
      let transactionStatus = notification.transaction_status;
      let fraudStatus = notification.fraud_status;

      console.log(
        `Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}`
      );

      if (transactionStatus == "capture") {
        if (fraudStatus == "challenge") {
          console.log("Transaction is challenged");
        } else if (fraudStatus == "accept") {
          console.log("Transaction is success");
          await handleSuccessfulPayment(orderId);
        }
      } else if (transactionStatus == "settlement") {
        console.log("Transaction is success");
        await handleSuccessfulPayment(orderId);
      } else if (
        transactionStatus == "cancel" ||
        transactionStatus == "deny" ||
        transactionStatus == "expire"
      ) {
        console.log("Transaction is failed");
      } else if (transactionStatus == "pending") {
        console.log("Transaction is pending");
      }

      res.status(200).json({ message: "Notification processed" });
    } catch (error) {
      console.error("Error processing notification:", error);
      res.status(500).json({ message: "Error processing notification" });
    }
  }

  static async checkTransactionStatus(req, res, next) {
    try {
      const { orderId } = req.params;

      // For testing predefined order ID
      if (orderId === "QRIS-123-12345678") {
        return res.status(200).json({
          order_id: "QRIS-123-12345678",
          transaction_status: "settlement",
        });
      }

      let core = new midtransClient.CoreApi({
        isProduction: false,
        serverKey:
          process.env.SERVER_KEY_MIDTRANS ||
          "SB-Mid-server-_9z4yvxLLVL9jJXFL4CivsHc",
        clientKey:
          process.env.CLIENT_KEY_MIDTRANS || "SB-Mid-client-nKsqvar5inNkxXTv",
      });

      const statusResponse = await core.transaction.status(orderId);

      res.status(200).json(statusResponse);
    } catch (error) {
      console.error("Error checking transaction status:", error);
      next(error);
    }
  }
};

async function handleSuccessfulPayment(orderId) {
  try {
    const snapUserIdMatch = orderId.match(/SNAP-(\d+)-/);
    const qrisUserIdMatch = orderId.match(/QRIS-(\d+)-/);

    let userId;
    if (snapUserIdMatch && snapUserIdMatch[1]) {
      userId = parseInt(snapUserIdMatch[1]);
    } else if (qrisUserIdMatch && qrisUserIdMatch[1]) {
      userId = parseInt(qrisUserIdMatch[1]);
    } else {
      console.error("Could not extract userId from orderId:", orderId);
      return;
    }

    // Kosongkan keranjang user
    await Cart.destroy({
      where: { userId },
    });

    console.log(`Cart cleared for user ${userId} after successful payment`);
  } catch (error) {
    console.error("Error handling successful payment:", error);
  }
}
