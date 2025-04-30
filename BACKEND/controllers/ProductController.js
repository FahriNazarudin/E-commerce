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
        throw { name: "BadRequestError", message: "Invalid product ID" };
      }
      const product = await Product.findByPk(id);
      if (!product) {
        throw { name: "NotFoundError", message: `Product id:${id} not found` };
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
      if (!name || !price || !stock || !categoryId || !userId) {
        throw {
          name: "BadRequestError",
          message: "Required fields are missing",
        };
      }
      const product = await Product.create({
        name,
        description,
        price,
        stock,
        imgUrl,
        categoryId,
        userId,
      });
      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  }

  static async putProductById(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw { name: "BadRequestError", message: "Invalid product ID" };
      }
      const product = await Product.findByPk(id);
      if (!product) {
        throw { name: "NotFoundError", message: `Product id:${id} not found` };
      }
      await product.update(req.body);
      res.status(200).json({ message: `Product id:${id} updated` });
    } catch (error) {
      next(error);
    }
  }

  static async deleteProductById(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw { name: "BadRequestError", message: "Invalid product ID" };
      }
      const product = await Product.findByPk(id);
      if (!product) {
        throw { name: "NotFoundError", message: `Product id:${id} not found` };
      }
      await product.destroy();
      res
        .status(200)
        .json({ message: `Product id:${id} successfully deleted` });
    } catch (error) {
      next(error);
    }
  }
};
