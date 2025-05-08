const { Product, Category, User } = require("../models");
const { Op } = require("sequelize");

module.exports = class ProductController {
  static async getProduct(req, res, next) {
    try {
      const { page = 1, limit = 10, search = "", categoryId } = req.query;

      // Safely parse pagination parameters
      const parsedPage = parseInt(page) || 1;
      const parsedLimit = parseInt(limit) || 10;

      // Calculate offset safely
      const offset = (parsedPage - 1) * parsedLimit;

      let whereConditions = {};

      // Add search condition if provided
      if (search) {
        whereConditions.name = { [Op.iLike]: `%${search}%` };
      }

      // Add category filter if provided
      if (categoryId) {
        whereConditions.categoryId = categoryId;
      }

      const products = await Product.findAll({
        where: whereConditions,
        limit: parsedLimit,
        offset: offset,
        include: [
          { model: Category, attributes: ["name"] },
          { model: User, attributes: ["username"] },
        ],
        order: [["id", "ASC"]],
      });

      res.status(200).json(products);
    } catch (error) {
      next(error);
    }
  }

  static async getProductById(req, res, next) {
    try {
      const { id } = req.params;
      const productId = parseInt(id);

      if (isNaN(productId)) {
        throw { name: "ValidationError", message: "Invalid product ID" };
      }

      const product = await Product.findByPk(productId, {
        include: [
          { model: Category, attributes: ["name"] },
          { model: User, attributes: ["username"] },
        ],
      });

      if (!product) {
        throw {
          name: "NotFoundError",
          message: `Product with ID ${productId} not found`,
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

      if (!userId || isNaN(parseInt(userId))) {
        throw {
          name: "ValidationError",
          message: "User ID is required and must be a number!",
        };
      }

      const newProduct = await Product.create({
        name,
        description,
        price,
        stock,
        imgUrl,
        categoryId,
        userId,
      });

      res.status(201).json(newProduct);
    } catch (error) {
      next(error);
    }
  }

  static async putProductById(req, res, next) {
    try {
      const { id } = req.params;
      const productId = parseInt(id);

      if (isNaN(productId)) {
        throw { name: "ValidationError", message: "Invalid product ID" };
      }

      const { name, description, price, stock, imgUrl, categoryId } = req.body;

      const product = await Product.findByPk(productId);
      if (!product) {
        throw {
          name: "NotFoundError",
          message: `Product with ID ${productId} not found`,
        };
      }

      await product.update({
        name: name || product.name,
        description: description || product.description,
        price: price || product.price,
        stock: stock || product.stock,
        imgUrl: imgUrl || product.imgUrl,
        categoryId: categoryId || product.categoryId,
      });

      res.status(200).json({
        message: `Product with ID ${productId} has been updated`,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteProductById(req, res, next) {
    try {
      const { id } = req.params;
      const productId = parseInt(id);

      if (isNaN(productId)) {
        throw { name: "ValidationError", message: "Invalid product ID" };
      }

      const product = await Product.findByPk(productId);
      if (!product) {
        throw {
          name: "NotFoundError",
          message: `Product with ID ${productId} not found`,
        };
      }

      await product.destroy();

      res.status(200).json({
        message: `Product with ID ${productId} has been deleted`,
      });
    } catch (error) {
      next(error);
    }
  }
};
