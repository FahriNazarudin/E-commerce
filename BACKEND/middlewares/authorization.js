const authorizationAdmin = async (req, res, next) => {
  try {
    const email = req.user.email.toLowerCase();
    if (email.includes("admin")) {
      next();
    } else {
      throw { name: "ForbiddenError", message: "Admin access required" };
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { authorizationAdmin };
