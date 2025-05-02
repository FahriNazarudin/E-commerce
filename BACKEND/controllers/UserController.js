const { comparePassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");
const { User } = require("../models");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client();

module.exports = class UserController {
  static async googleLogin(res, req, next) {
    try {
      const { googleToken } = req.body;
      const ticket = await client.verifyIdToken({
        idToken: googleToken,
        audience: WEB_CLIENT_ID,
      });
      const payload = ticket.getPayload();

      let user = await User.findOne({ where: { email:payload.email } });
      if (!user) {
       user = await user.create({
         name: payload.name,
         email: payload.email,
         phoneNumber: Math.random(),
         password: Math.random().toString(),
         address: Math.random().toString()
       });
      }

      console.log(req.body, "<<< body");

      res.status(200).json({ message: "Login Success" });
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
      });
    } catch (error) {
      next(error);
    }
  }
};
