const { Category } = require("../models");

module.exports = class CategoryController {
  static async getCategory(req, res, next) {
    try {
      const categories = await Category.findAll();
      res.status(200).json(categories); // Perbaiki status dari 201 ke 200
    } catch (error) {
      next(error);
    }
  }

  static async postCategory(req, res, next) {
    try {
      const { name } = req.body;
      if (!name) {
        throw { name: "BadRequestError", message: "Category name is required" };
      }
      const category = await Category.create({ name });
      res.status(201).json(category);
    } catch (error) {
      next(error);
    }
  }

  static async getCategorybyId(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw { name: "BadRequestError", message: "Invalid Category ID" };
      }
      const categories = await Category.findByPk(id);
      if (!categories) {
        throw { name: "NotFoundError", message: `Category id:${id} not found` };
      }
      res.status(200).json(categories);
    } catch (error) {
      next(error);
    }
  }

  static async updateCategoryById(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw { name: "BadRequestError", message: "Invalid category ID" };
      }
      const category = await Category.findByPk(id);
      if (!category) {
        throw { name: "NotFoundError", message: `Category id:${id} not found` };
      }
      await category.update(req.body);
      res.status(200).json({ message: `Category id:${id} updated` });
    } catch (error) {
      next(error);
    }
  }

  static async deleteCategoryById(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw { name: "BadRequestError", message: "Invalid category ID" };
      }
      const category = await Category.findByPk(id);
      if (!category) {
        throw { name: "NotFoundError", message: `Category id:${id} not found` };
      }
      await category.destroy();
      res
        .status(200)
        .json({ message: `Category id:${id} successfully deleted` });
    } catch (error) {
      next(error);
    }
  }
};
