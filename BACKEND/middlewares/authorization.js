const { User } = require("../models");

const authorizationAdmin = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user || user.role !== "admin") {
      throw { name: "ForbiddenError", message: "Admin access required" };
    }
    next();
  } catch (error) {
    next(error);
    console.log(error,"<<<ERROR");
    
  }
};

module.exports = { authorizationAdmin };
