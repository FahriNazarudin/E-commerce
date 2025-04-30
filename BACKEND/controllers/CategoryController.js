const { Category } = require('../models')
 
module.exports = class CategoryController {
  static async getCategory(req, res) {
    try {
      const categories = await Category.findAll();
      res.status(201).json(categories);
    } catch (error) {
      console.log(error, "");
    }
  }

  static async postCategory(req, res) {
    try {
      const categories = await Category.create(req.body);
      res.status(200).json(categories);
    } catch (error) {
      console.log(error, "create category");
    }
  }

  static async updateCategoryById(req, res) {
    try {
      const id = req.params.id;
      const categories = await Category.findByPk(id);
      if (!categories) {
        throw { message: `Category id:${id} not found` };
      } else {
        await categories.update(req.body);
        res.status(200).json({ message: `Category id:${id} updated` });
      }
    } catch (error) {
      console.log(error, "error update category");
    }
  }

  static async deleteCategoryById(req, res) {
    try {
      const id = req.params.id;
      const categories = await Category.findByPk(id);
      if (!categories) {
        res.status(404).json({ message: `Category id:${id} not found` });
      } else {
        await categories.destroy();
        res
          .status(200)
          .json({ message: `Category id:${id} success to deleted` });
      }
    } catch (error) {
      console.log(error, "delete Category by ID");
      res.status(500).json({ message: `Internal Server Error` });
    }
  }
};
