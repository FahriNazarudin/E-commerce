const { comparePassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");
const { User } = require("../models");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client();

module.exports = class UserController {
  static async googleLogin(req, res, next) {
    try {
      const { googleToken } = req.body;
      const ticket = await client.verifyIdToken({
        idToken: googleToken,
        audience: process.env.WEB_CLIENT_ID,
      });
      const payload = ticket.getPayload();

      let user = await User.findOne({ where: { email: payload.email } });
      if (!user) {
        user = await User.create({
          username: payload.name,
          email: payload.email,
          phoneNumber: "Not provided",
          password: Math.random().toString(36).substring(2),
          address: "Not provided",
        });
      }

      const access_token = signToken({ id: user.id });
      res.status(200).json({
        access_token,
        userId: user.id,
        role: user.role,
      });
    } catch (error) {
      next(error);
    }
  }

  static async register(req, res, next) {
    try {
      const { username, email, phoneNumber, password, address, role } =
        req.body;
      if (!username || !email || !phoneNumber || !password || !address) {
        throw {
          name: "ValidationError",
          message: "All data must be filled.",
        };
      }
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw {
          name: "ValidationError",
          message: "Email already registered",
        };
      }
      const user = await User.create({
        username,
        email,
        phoneNumber,
        password,
        address,
        role,
      });
      res.status(201).json({
        username: user.username,
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
      res.status(200).json({
        access_token,
        userId: user.id,
        role: user.role,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id, {
        attributes: { exclude: ["password"] }, 
      });

      if (!user) {
        throw { name: "NotFoundError", message: "User not found" };
      }


      if (req.user.id !== +id) {
        throw {
          name: "ForbiddenError",
          message: "You don't have permission to access this profile",
        };
      }

      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  static async updateUserById(req, res, next) {
    try {
      const { id } = req.params;
      const { username, email, phoneNumber, address } = req.body;

      if (req.user.id !== +id) {
        throw {
          name: "ForbiddenError",
          message: "You don't have permission to update this profile",
        };
      }

      const user = await User.findByPk(id);
      if (!user) {
        throw { name: "NotFoundError", message: "User not found" };
      }

      const updated = await user.update({
        username,
        email,
        phoneNumber,
        address,
      });

      res.status(200).json({
        message: "Profile updated successfully",
        user: {
          id: updated.id,
          username: updated.username,
          email: updated.email,
          phoneNumber: updated.phoneNumber,
          address: updated.address,
        },
      });
    } catch (error) {
      next(error);
    }
  }
};
