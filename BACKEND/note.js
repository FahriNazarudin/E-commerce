const { Cart, Product } = require("../models");

module.exports = class CartController {
  static async postCart(req, res, next) {
    try {
      const { productId, quantity } = req.body;
      const userId = req.user.id;
      const products = await Product.findByPk(productId);

      if (!products) {
        throw { message: "Product not found" };
      }
      if (products.stock < quantity) {
        throw { message: "plese insert stock" };
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
      const id = req.params.id;
      if (!req.body.productId) {
        throw { name: "ValidationError", message: "product is required!" };
      }
      if (!req.body.quantity) {
        throw { name: "ValidationError", message: "quantity is required!" };
      }
      const carts = await Cart.findByPk(id);
      if (!carts) {
        throw { message: `Cart id:${id} not found` };
      }
      if (!req.user.id === 4) {
        throw { name: "ForbiddenError" };
      }
      await carts.update(req.body);
      res.status(200).json({ message: `Cart item id:${id} updated` });
    } catch (error) {
      console.log(error, "ERROR");

      next(error);
    }
  }

  static async deleteCartItem(req, res, next) {
    try {
      const id = req.params.id;
      const userId = req.user.id;

      if (isNaN(id)) {
        throw { message: "Invalid cart item ID" };
      }

      const cartItem = await Cart.findOne({
        where: { id, userId },
      });

      if (!cartItem) {
        throw {
          message: `Cart item id:${id} not found`,
        };
      }

      await cartItem.destroy();
      res.status(200).json({ message: `Cart item id:${id} deleted` });
    } catch (error) {
      next(error);
    }
  }
};
