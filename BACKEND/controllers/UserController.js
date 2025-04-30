const { comparePassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");
const { User } = require("../models");

module.exports = class UserController {
  static async register(req, res, next) {
    try {
      const { userName, email, password } = req.body;
      if (!userName || !email || !password) {
        throw {
          name: "BadRequestError",
          message: "Required fields are missing",
        };
      }
      const user = await User.create({ userName, email, password });
      res.status(201).json({
        userName: user.userName,
        email: user.email,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email) {
        throw { name: "ValidationError", message: "Email is required" };
      }
      if (!password) {
        throw { name: "ValidationError", message: "Password is required" };
      }
      const user = await User.findOne({ where: { email } });
      if (!user) {
        throw { name: "UnauthorizedError", message: "Invalid email/password" };
      }
      const isValidPassword = comparePassword(password, user.password);
      if (!isValidPassword) {
        throw { name: "UnauthorizedError", message: "Invalid email/password" };
      }
      const access_token = signToken({ id: user.id });
      res.status(200).json({ access_token });
    } catch (error) {
      next(error);
    }
  }
};
