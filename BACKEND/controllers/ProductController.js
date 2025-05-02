const { Product } = require("../models");

module.exports = class ProductController {
  static async getProduct(req, res, next) {
    try {
      const products = await Product.findAll();
      res.status(200).json(products);
    } catch (error) {
      next(error);
    }
  }

  static async getProductById(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw { name: "ValidationError", message: "Invalid product ID" };
      }
      const product = await Product.findByPk(id);
      if (!product) {
        throw {
          name: "NotFoundError",
          message: `Product with ID ${id} not found`,
        };
      }
      res.status(200).json(product);
    } catch (error) {
      next(error);
    }
  }

  static async postProduct(req, res, next) {
    try {
      const { name, description, price, stock, imgUrl, categoryId, userId } =
        req.body;
      if (!name)
        throw { name: "ValidationError", message: "Name is required!" };
      if (!description)
        throw { name: "ValidationError", message: "Description is required!" };
      if (!price || isNaN(price))
        throw {
          name: "ValidationError",
          message: "Price is required and must be a number!",
        };
      if (!stock || isNaN(stock))
        throw {
          name: "ValidationError",
          message: "Stock is required and must be a number!",
        };
      if (!imgUrl)
        throw { name: "ValidationError", message: "Image URL is required!" };
      if (!categoryId || isNaN(categoryId))
        throw {
          name: "ValidationError",
          message: "Category ID is required and must be a number!",
        };
      if (!userId || isNaN(userId))
        throw {
          name: "ValidationError",
          message: "User ID is required and must be a number!",
        };

      const product = await Product.create(req.body);
      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  }

  static async putProductById(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      const { name, description, price, stock, imgUrl, categoryId, userId } =
        req.body;

      if (isNaN(id)) {
        throw { name: "ValidationError", message: "Invalid product ID" };
      }
      if (!name)
        throw { name: "ValidationError", message: "Name is required!" };
      if (!description)
        throw { name: "ValidationError", message: "Description is required!" };
      if (!price || isNaN(price))
        throw {
          name: "ValidationError",
          message: "Price is required and must be a number!",
        };
      if (!stock || isNaN(stock))
        throw {
          name: "ValidationError",
          message: "Stock is required and must be a number!",
        };
      if (!imgUrl)
        throw { name: "ValidationError", message: "Image URL is required!" };
      if (!categoryId || isNaN(categoryId))
        throw {
          name: "ValidationError",
          message: "Category ID is required and must be a number!",
        };
      if (!userId || isNaN(userId))
        throw {
          name: "ValidationError",
          message: "User ID is required and must be a number!",
        };

      const product = await Product.findByPk(id);
      if (!product) {
        throw {
          name: "NotFoundError",
          message: `Product with ID ${id} not found`,
        };
      }
      await product.update(req.body);
      res
        .status(200)
        .json({ message: `Product with ID ${id} successfully updated` });
    } catch (error) {
      next(error);
    }
  }

  static async deleteProductById(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw { name: "ValidationError", message: "Invalid product ID" };
      }
      const product = await Product.findByPk(id);
      if (!product) {
        throw {
          name: "NotFoundError",
          message: `Product with ID ${id} not found`,
        };
      }
      await product.destroy();
      res
        .status(200)
        .json({ message: `Product with ID ${id} successfully deleted` });
    } catch (error) {
      next(error);
    }
  }
};
