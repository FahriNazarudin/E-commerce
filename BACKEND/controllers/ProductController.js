const {Product} = require("../models");

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
      res.status(201).json(products);;
    } catch (error) {
      console.log(error, "get products by ID");
    }
  }

  
};
