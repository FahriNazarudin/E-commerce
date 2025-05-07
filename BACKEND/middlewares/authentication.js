const { User } = require("../models");
const { verifyToken } = require("../helpers/jwt");

const authentication = async (req, res, next) => {
  try {
    const bearerToken = req.headers.authorization;
    if (!bearerToken) {
      throw { name: "UnauthorizedError", message: "Unauthorized access" };
    }
    const accessToken = bearerToken.split(" ")[1];
    if (!accessToken) {
      throw { name: "UnauthorizedError", message: "Unauthorized access" };
    }

    let data;
    try {
      data = verifyToken(accessToken);
    } catch (err) {
      throw { name: "UnauthorizedError", message: "Unauthorized access" };
    }

    const user = await User.findByPk(data.id);
    if (!user) {
      throw { name: "UnauthorizedError", message: "Unauthorized access" };
    }

    req.user = {
      id: user.id,
      email: user.email,
    };
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authentication;
