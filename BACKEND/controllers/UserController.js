const { comparePassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");
const { User } = require("../models");

module.exports = class UserController {
  static async register(req, res) {
    try {
      console.log(req.user);

      const user = await User.create(req.body);
      res.status(201).json({
        userName: user.userName,
        email: user.email,
      });
    } catch (error) {
      console.log(error, "error register");
      if (
        error.name === "SequelizeUniqueConstraintError" ||
        error.name === "SequelizeValidationError"
      ) {
        res.status(400).json({ message: error.errors[0] });
        console.log(error.errors[0].message, "<<<<<<");
      } else {
        res.status(500).json({ message: `Internal Server Error` });
      }
    }
  }

  static async login(req, res) {
    const { email, password } = req.body;

    if (!email) {
        res.status(400).json({ name: "ValidationError", message: "Email is required" });
    }
    if (!password) {
        res
        .status(400)
        .json({ name: "ValidationError", message: "Password is required" });
    }
    
    try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        res.status(401).json({ message: "Invalid email/password" }) 
      }
      const isValiPassword = comparePassword(password, user.password);
      if (!isValiPassword) {
        res.status(401).json({ message: "Invalid email/password" }); 
        return
      }
      const access_token = signToken({ id: user.id });
      res.status(200).json({
        access_token,
      });
    } catch (error) {
      console.log(error, "<<<< Error Login");

    }
  }
};
