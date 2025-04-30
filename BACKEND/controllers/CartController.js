const { Cart, Product } = require("../models");

module.exports = class CartController {
  static async postCart(req, res, next) {
    try {
      const { ProductId, quantity } = req.body;
      const userId = req.user.id;

      if (!ProductId || !quantity || quantity <= 0) {
        throw {
          name: "BadRequestError",
          message: "ProductId and quantity are required and must be positive",
        };
      }

      const product = await Product.findByPk(ProductId);
      if (!product) {
        throw { name: "NotFoundError", message: "Product not found" };
      }

      if (product.stock < quantity) {
        throw { name: "BadRequestError", message: "Insufficient stock" };
      }

      let cartItem = await Cart.findOne({
        where: { userId, ProductId },
      });

      if (cartItem) {
        cartItem.quantity += quantity;
        await cartItem.save();
      } else {
        cartItem = await Cart.create({
          userId,
          ProductId,
          quantity,
        });
      }

      res.status(201).json({ message: "Item added to cart", data: cartItem });
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
      const { quantity } = req.body;
      const userId = req.user.id;

      if (isNaN(id)) {
        throw { name: "BadRequestError", message: "Invalid cart item ID" };
      }
      if (!quantity || quantity <= 0) {
        throw { name: "BadRequestError", message: "Quantity must be positive" };
      }

      const cartItem = await Cart.findOne({
        where: { id, userId },
        include: [Product],
      });

      if (!cartItem) {
        throw {
          name: "NotFoundError",
          message: `Cart item id:${id} not found`,
        };
      }

      if (cartItem.Product.stock < quantity) {
        throw { name: "BadRequestError", message: "Insufficient stock" };
      }

      cartItem.quantity = quantity;
      await cartItem.save();

      res
        .status(200)
        .json({ message: `Cart item id:${id} updated`, data: cartItem });
    } catch (error) {
      next(error);
    }
  }

  static async deleteCartItem(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;

      if (isNaN(id)) {
        throw { name: "BadRequestError", message: "Invalid cart item ID" };
      }

      const cartItem = await Cart.findOne({
        where: { id, userId },
      });

      if (!cartItem) {
        throw {
          name: "NotFoundError",
          message: `Cart item id:${id} not found`,
        };
      }

      await cartItem.destroy();
      res.status(200).json({ message: `Cart item id:${id} deleted` });
    } catch (error) {
      next(error);
    }
  }

  static async clearCart(req, res, next) {
    try {
      const userId = req.user.id;
      await Cart.destroy({ where: { userId } });
      res.status(200).json({ message: "Cart cleared successfully" });
    } catch (error) {
      next(error);
    }
  }
};
