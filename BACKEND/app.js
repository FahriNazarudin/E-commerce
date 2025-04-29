const express = require("express");
const app = express();
const port = 3000;


app.use(express.urlencoded({ extended:false}))


app.get("/", (req, res) => {
  res.send("Hello World!");
});

// //user endpoint
// app.post("/register", UserController.register);
// app.post("/login", userController.login);
// app.get("/pub/product", Controller.getBloggerPublicSite);
// app.get("/pub/product/:id", Controller.getBloggerPublicSiteById);


//middleware
// app.use(authentication);
// app.get("/bloggers", Controller.getBlogger);
// app.get("/bloggers/:id", Controller.getBloggerById);
// app.post("/bloggers", authorizationAdmin, Controller.createBlogger);
// app.put("/bloggers/:id", authorizationAdmin, Controller.updateBloggerById);
// app.delete("/bloggers/:id", authorizationAdmin, Controller.deleteBloggerById);

// app.post("/categories", authorizationAdmin, Controller.createCategory);
// app.get("/categories", Controller.getCategories);
// app.put("/categories/:id", authorizationAdmin, Controller.updateCategoryById);


// const errorHandler = require("./middlewares/errorHanddler");
// app.use(errorHandler);




app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
