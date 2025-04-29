const { Product } = require("../models");

module.exports = class ProductController {
  static async getProduct(req, res) {
    try {
      const products = await Product.findAll();

      res.status(200).json(products);
    } catch (error) {
      console.log(error, "get products");
    }
  }

  static async getProductById(req, res) {
    try {
      const id = req.params.id;
      const products = await Product.findByPk(id);
      res.status(200).json(products);

      res.json(products);
    } catch (error) {
      console.log(error, "get products by ID");
    }
  }

  static async postProduct(req, res) {
    try {
      const products = await Product.create(req.body);
      res.status(201).json(products);
    } catch (error) {
      console.log(error, "get products by ID");
    }
  }

  static async putProductById(req, res) {
    try {
      const id = req.params.id;

      const products = await Product.findByPk(id);
      if (!products) {
        res.status(404).json({ message: `Product id:${id} not found` });
      } else {
        await products.update(req.body);
        res.status(200).json({ message: `Product id:${id} updated` });
      }
    } catch (error) {
      console.log(error, "update products by ID");
      res.status(500).json({ message: `Internal Server Error` });
    }
  }

  static async deleteProductById(req, res) {
    try {
      const id = req.params.id;
      const products = await Product.findByPk(id);
      if (!products) {
        res.status(404).json({ message: `Product id:${id} not found` });
      } else {
        await products.destroy();
        res.status(200).json({ message: `Product id:${id} success to deleted` });
      }
    } catch (error) {
      console.log(error, "delete product by ID");
      res.status(500).json({ message: `Internal Server Error` });
    }
  }
};
