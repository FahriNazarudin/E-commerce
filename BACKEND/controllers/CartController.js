const { Cart, Product } = require("../models");

module.exports = class CartController {
  static async postCart(req, res, next) {
    try {
      const { productId, quantity } = req.body;
      const userId = req.user.id;

      if (!productId || isNaN(productId)) {
        throw { name: "ValidationError", message: "Invalid product ID" };
      }
      if (!quantity || isNaN(quantity) || quantity <= 0) {
        throw {
          name: "ValidationError",
          message: "Quantity must be greater than 0",
        };
      }

      const product = await Product.findByPk(productId);
      if (!product) {
        throw { name: "NotFoundError", message: "Product not found" };
      }
      if (product.stock < quantity) {
        throw { name: "ValidationError", message: "Insufficient stock" };
      }

      let cartItem = await Cart.findOne({
        where: { userId, productId },
      });

      if (cartItem) {
        cartItem.quantity += quantity;
        await cartItem.save();
      } else {
        cartItem = await Cart.create({
          userId,
          productId,
          quantity,
        });
      }

      res.status(201).json({ message: "Item added to cart" });
    } catch (error) {
      next(error);
    }
  }

  static async getCart(req, res, next) {
    try {
      const userId = req.user.id;
      const cartItems = await Cart.findAll({
        where: { userId },
        include: [
          {
            model: Product,
            attributes: ["id", "name", "price", "imgUrl", "stock"],
          },
        ],
      });

      res.status(200).json(cartItems);
    } catch (error) {
      next(error);
    }
  }

  static async updateCartItem(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      const { productId, quantity } = req.body;

      if (isNaN(id)) {
        throw { name: "ValidationError", message: "Invalid cart ID" };
      }
      if (!productId || isNaN(productId)) {
        throw { name: "ValidationError", message: "Invalid product ID" };
      }
      if (!quantity || isNaN(quantity) || quantity <= 0) {
        throw {
          name: "ValidationError",
          message: "Quantity must be greater than 0",
        };
      }

      const cart = await Cart.findByPk(id);
      if (!cart) {
        throw {
          name: "NotFoundError",
          message: `Cart with ID ${id} not found`
        };
      }

      await cart.update({ productId, quantity });
      res
        .status(200)
        .json({ message: `Cart with ID ${id} successfully updated` });
    } catch (error) {
      next(error);
    }
  }

  static async deleteCartItem(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;

      if (isNaN(id)) {
        throw { name: "ValidationError", message: "ID Invalid cart" };
      }

      const cartItem = await Cart.findOne({
        where: { id, userId },
      });

      if (!cartItem) {
        throw {
          name: "NotFoundError",
          message: `Cart with ID ${id} not found`,
        };
      }

      await cartItem.destroy();
      res
        .status(200)
        .json({ message: `Cart with ID ${id} successfully deleted` });
    } catch (error) {
      next(error);
    }
  }
};
