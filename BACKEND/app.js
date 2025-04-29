const express = require("express");
const ProductController = require("./controllers/ProductController");



const app = express();
const port = 3000;


app.use(express.urlencoded({ extended: false}))
app.use(express.json())



app.get("/products", ProductController.getProduct)
app.get("/products/:id", ProductController.getProductById);
app.post("/products", ProductController.postProduct);
app.put("/products/:id", ProductController.putProductById);
// app.delete("/products/:id", ProductController.deleteProductById);




app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
