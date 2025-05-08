const { comparePassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");
const { User } = require("../models");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client();

module.exports = class UserController {
  static async googleLogin(req, res, next) {
    try {
      const { googleToken } = req.body;

      if (!googleToken) {
        return res.status(401).json({
          message: "Google token is required",
        });
      }

      let ticket;
      try {
        ticket = await client.verifyIdToken({
          idToken: googleToken,
          audience: process.env.WEB_CLIENT_ID,
        });
      } catch (error) {
        return res.status(401).json({
          message: "Invalid Google token",
        });
      }

      const payload = ticket.getPayload();

      let user = await User.findOne({ where: { email: payload.email } });
      if (!user) {
        user = await User.create({
          username: payload.name,
          email: payload.email,
          phoneNumber: "00000000",
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
        return res.status(400).json({
          message: "All data must be filled.",
        });
      }

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          message: "Email already registered",
        });
      }

      const user = await User.create({
        username,
        email,
        phoneNumber,
        password,
        address,
        role: role || "user",
      });

      return res.status(201).json({
        id: user.id,
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
      const userId = parseInt(id);
      const currentUserId = req.user.id;

      if (req.user.role !== "admin" && userId !== currentUserId) {
        throw {
          name: "ForbiddenError",
          message: "You don't have permission to access this profile",
        };
      }

      const user = await User.findByPk(userId, {
        attributes: { exclude: ["password"] },
      });

      if (!user) {
        if (req.user.role === "admin") {
          throw {
            name: "NotFoundError",
            message: `User with ID ${userId} not found`,
          };
        }
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
      const userId = parseInt(id);
      const currentUserId = req.user.id;

      if (req.user.role !== "admin" && userId !== currentUserId) {
        throw {
          name: "ForbiddenError",
          message: "You don't have permission to update this profile",
        };
      }

      const { username, email, phoneNumber, address } = req.body;

      const user = await User.findByPk(userId);
      if (!user) {
        throw {
          name: "NotFoundError",
          message: `User with ID ${userId} not found`,
        };
      }

      await user.update({
        username: username || user.username,
        email: email || user.email,
        phoneNumber: phoneNumber || user.phoneNumber,
        address: address || user.address,
      });

      res.status(200).json({
        message: "Profile updated successfully",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          phoneNumber: user.phoneNumber,
          address: user.address,
        },
      });
    } catch (error) {
      next(error);
    }
  }
};
