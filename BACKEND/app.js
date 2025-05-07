// if(process.env.NODE_ENV !== "production"){
//   require("dotenv").config();  
// }

const express = require("express");
const ProductController = require("./controllers/ProductController");
const CategoryController = require("./controllers/CategoryController");
const UserController = require("./controllers/UserController");
const CartController = require("./controllers/CartController");
const authentication = require("./middlewares/authentication");
const { authorizationAdmin } = require("./middlewares/authorization");
const errorHandler = require("./middlewares/errorHandler");


const app = express();
const port = process.env.PORT || 3000; 

const cors = require("cors")
app.use(cors())

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// User endpoints
app.post("/register", UserController.register);
app.post("/login", UserController.login);
app.post("/login/google", UserController.googleLogin);

app.use(authentication);

// User profile endpoints
app.get("/users/:id", UserController.getUserById);
app.put("/users/:id", UserController.updateUserById);

// Product endpoints
app.get("/products", ProductController.getProduct);
app.get("/products/:id", ProductController.getProductById);
app.post("/products",authorizationAdmin, ProductController.postProduct);
app.put("/products/:id",authorizationAdmin, ProductController.putProductById);
app.delete("/products/:id",authorizationAdmin, ProductController.deleteProductById);

// Category endpoints
app.get("/categories", CategoryController.getCategory);
app.get("/categories/:id", CategoryController.getCategorybyId);
app.post("/categories",authorizationAdmin, CategoryController.postCategory);
app.put(
  "/categories/:id",
  authorizationAdmin, CategoryController.updateCategoryById
);
app.delete(
  "/categories/:id",
  authorizationAdmin, CategoryController.deleteCategoryById
);

// Cart endpoints
app.post("/carts", CartController.postCart);
app.get("/carts", CartController.getCart);
app.put("/carts/:id", CartController.updateCartItem);
app.delete("/carts/:id", CartController.deleteCartItem);

// Error handler middleware
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});


module.exports = app