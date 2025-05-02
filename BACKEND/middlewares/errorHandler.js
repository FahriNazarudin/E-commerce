function errorHandler(error, req, res, next) {
  let status = 500;
  let message = "Internal Server Error";

  if (
    error.name === "SequelizeValidationError" ||
    error.name === "SequelizeUniqueConstraintError"
  ) {
    status = 400;
    message = error.errors.map((e) => e.message).join(", ");
  } else if (error.name === "ValidationError") {
    status = 400;
    message = error.message;
  } else if (error.name === "BadRequest" || error.name === "BadRequestError") {
    status = 400;
    message = error.message;
  } else if (
    error.name === "NotFound" ||
    error.name === "NotFoundError" ||
    (!error.name && error.message.includes("not found"))
  ) {
    status = 404;
    message = error.message;
  } else if (error.name === "Forbidden" || error.name === "ForbiddenError") {
    status = 403;
    message = error.message || "Admin access required";
  } else if (
    error.name === "Unauthorized" ||
    error.name === "UnauthorizedError" ||
    error.name === "JsonWebTokenError" ||
    error.name === "TokenExpiredError"
  ) {
    status = 401;
    message = error.message || "Unauthorized access";
  }

  res.status(status).json({ message });
}

module.exports = errorHandler;
