function errorHandler(error, req, res, next) {
  console.error("Error:", error); // Log error untuk debugging

  if (
    error.name === "SequelizeValidationError" ||
    error.name === "SequelizeUniqueConstraintError"
  ) {
    return res.status(400).json({ message: error.errors[0].message });
  } else if (error.name === "ValidationError") {
    return res.status(400).json({ message: error.message });
  } else if (error.name === "BadRequestError") {
    return res.status(400).json({ message: error.message });
  } else if (error.name === "NotFoundError") {
    return res.status(404).json({ message: error.message });
  } else if (error.name === "ForbiddenError") {
    return res.status(403).json({ message: "Forbidden access" });
  } else if (
    error.name === "JsonWebTokenError" ||
    error.name === "UnauthorizedError"
  ) {
    return res.status(401).json({ message: "Unauthorized access" });
  } else {
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = errorHandler;
