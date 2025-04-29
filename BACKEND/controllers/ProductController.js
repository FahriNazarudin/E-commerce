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


};
