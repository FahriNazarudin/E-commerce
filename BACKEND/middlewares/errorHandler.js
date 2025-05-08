const errorHandler = (err, req, res, next) => {
  console.log(err);
  let code = 500;
  let message = "Internal server error";

  if (err.name === "SequelizeValidationError") {
    code = 400;
    message = err.errors[0].message;
  } else if (err.name === "SequelizeUniqueConstraintError") {
    code = 400;
    message = err.errors[0].message;
  } else if (err.name === "ValidationError") {
    code = 400;
    message = err.message;
  } else if (err.name === "JsonWebTokenError") {
    code = 401;
    message = "Invalid token";
  } else if (err.name === "InvalidToken") {
    code = 401;
    message = "Invalid token";
  } else if (err.name === "Unauthorized" || err.name === "UnauthorizedError") {
    code = 401;
    message = err.message || "Unauthorized access";
  } else if (err.name === "ForbiddenError") {
    code = 403;
    message = err.message || "Forbidden access";
  } else if (err.name === "NotFoundError") {
    code = 404;
    message = err.message;
  }

  res.status(code).json({ message });
};

module.exports = errorHandler;
