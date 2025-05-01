import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import PropTypes from "prop-types";

function AdminProductPage({ baseUrl }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    imgUrl: "",
    categoryId: "",
    userId: localStorage.getItem("userId"),
  });
  const [editProduct, setEditProduct] = useState(null);

  // Fetch products and categories
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [productResponse, categoryResponse] = await Promise.all([
          axios.get(`${baseUrl}/products`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }),
          axios.get(`${baseUrl}/categories`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }),
        ]);
        setProducts(productResponse.data);
        setCategories(categoryResponse.data);
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text:
            error.response?.data?.message ||
            "Failed to load products or categories",
          icon: "error",
          confirmButtonText: "OK",
        });
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [baseUrl]);

  // Validate and handle adding a new product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    const { name, description, price, stock, imgUrl, categoryId } = newProduct;
    if (
      !name.trim() ||
      !description.trim() ||
      !price ||
      !stock ||
      !imgUrl.trim() ||
      !categoryId
    ) {
      Swal.fire({
        title: "Error!",
        text: "All fields must be filled out correctly",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }
    try {
      const response = await axios.post(
        `${baseUrl}/products`,
        {
          ...newProduct,
          price: parseInt(price),
          stock: parseInt(stock),
          categoryId: parseInt(categoryId),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      setProducts([...products, response.data]);
      setNewProduct({
        name: "",
        description: "",
        price: "",
        stock: "",
        imgUrl: "",
        categoryId: "",
        userId: localStorage.getItem("userId"),
      });
      Swal.fire({
        position: "top-center",
        icon: "success",
        title: "Product successfully added",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to add product",
        icon: "error",
        confirmButtonText: "OK",
      });
      console.error("Error adding product:", error);
    }
  };

  // Handle updating a product
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editProduct) return;
    const { id, name, description, price, stock, imgUrl, categoryId } =
      editProduct;
    if (
      !name.trim() ||
      !description.trim() ||
      !price ||
      !stock ||
      !imgUrl.trim() ||
      !categoryId
    ) {
      Swal.fire({
        title: "Error!",
        text: "All fields must be filled out correctly",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }
    try {
      await axios.put(
        `${baseUrl}/products/${id}`,
        {
          ...editProduct,
          price: parseInt(price),
          stock: parseInt(stock),
          categoryId: parseInt(categoryId),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      setProducts(products.map((p) => (p.id === id ? { ...editProduct } : p)));
      setEditProduct(null);
      Swal.fire({
        position: "top-center",
        icon: "success",
        title: "Product successfully updated",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to update product",
        icon: "error",
        confirmButtonText: "OK",
      });
      console.error("Error updating product:", error);
    }
  };


  const handleDeleteProduct = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This product will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });
    if (result.isConfirmed) {
      try {
        await axios.delete(`${baseUrl}/products/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        setProducts(products.filter((p) => p.id !== id));
        Swal.fire({
          position: "top-center",
          icon: "success",
          title: "Product successfully deleted",
          showConfirmButton: false,
          timer: 1500,
        });
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: error.response?.data?.message || "Failed to delete product",
          icon: "error",
          confirmButtonText: "OK",
        });
        console.error("Error deleting product:", error);
      }
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center w-100 vh-100"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1605774337664-7a846e9cdf17?q=80&w=3174&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div
        className="card shadow-sm p-4 rounded-3 h-100"
        style={{
          maxWidth: "1200px",
          width: "100%",
          backgroundColor: "rgba(237, 237, 237, 0.83)",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        <h2 className="text-center mb-4" style={{ color: "#343a40" }}>
          Your Are Admin!
        </h2>
        {isLoading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Add Product Form */}
            <div className="mb-4">
              <h4 className="mb-3" style={{ color: "#343a40" }}>
                Add New Product
              </h4>
              <form onSubmit={handleAddProduct}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Product Name"
                      value={newProduct.name}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, name: e.target.value })
                      }
                      required
                      aria-label="Product Name"
                    />
                  </div>
                  <div className="col-md-6">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Description"
                      value={newProduct.description}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          description: e.target.value,
                        })
                      }
                      required
                      aria-label="Description"
                    />
                  </div>
                  <div className="col-md-6">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Price"
                      value={newProduct.price}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, price: e.target.value })
                      }
                      min="0"
                      required
                      aria-label="Price"
                    />
                  </div>
                  <div className="col-md-6">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Stock"
                      value={newProduct.stock}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, stock: e.target.value })
                      }
                      min="0"
                      required
                      aria-label="Stock"
                    />
                  </div>
                  <div className="col-md-6">
                    <input
                      type="url"
                      className="form-control"
                      placeholder="Image URL"
                      value={newProduct.imgUrl}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, imgUrl: e.target.value })
                      }
                      required
                      aria-label="Image URL"
                    />
                  </div>
                  <div className="col-md-6">
                    <select
                      className="form-select"
                      value={newProduct.categoryId}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          categoryId: e.target.value,
                        })
                      }
                      required
                      aria-label="Category"
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-12">
                    <button
                      type="submit"
                      className="btn btn-outline-secondary"
                      disabled={
                        !newProduct.name.trim() ||
                        !newProduct.description.trim() ||
                        !newProduct.price ||
                        !newProduct.stock ||
                        !newProduct.imgUrl.trim() ||
                        !newProduct.categoryId
                      }
                    >
                      Add Product
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Edit Product Form */}
            {editProduct && (
              <div className="mb-4">
                <h4 className="mb-3" style={{ color: "#343a40" }}>
                  Edit Product
                </h4>
                <form onSubmit={handleUpdateProduct}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Product Name"
                        value={editProduct.name}
                        onChange={(e) =>
                          setEditProduct({
                            ...editProduct,
                            name: e.target.value,
                          })
                        }
                        required
                        aria-label="Product Name"
                      />
                    </div>
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Description"
                        value={editProduct.description}
                        onChange={(e) =>
                          setEditProduct({
                            ...editProduct,
                            description: e.target.value,
                          })
                        }
                        required
                        aria-label="Description"
                      />
                    </div>
                    <div className="col-md-6">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Price"
                        value={editProduct.price}
                        onChange={(e) =>
                          setEditProduct({
                            ...editProduct,
                            price: e.target.value,
                          })
                        }
                        min="0"
                        required
                        aria-label="Price"
                      />
                    </div>
                    <div className="col-md-6">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Stock"
                        value={editProduct.stock}
                        onChange={(e) =>
                          setEditProduct({
                            ...editProduct,
                            stock: e.target.value,
                          })
                        }
                        min="0"
                        required
                        aria-label="Stock"
                      />
                    </div>
                    <div className="col-md-6">
                      <input
                        type="url"
                        className="form-control"
                        placeholder="Image URL"
                        value={editProduct.imgUrl}
                        onChange={(e) =>
                          setEditProduct({
                            ...editProduct,
                            imgUrl: e.target.value,
                          })
                        }
                        required
                        aria-label="Image URL"
                      />
                    </div>
                    <div className="col-md-6">
                      <select
                        className="form-select"
                        value={editProduct.categoryId}
                        onChange={(e) =>
                          setEditProduct({
                            ...editProduct,
                            categoryId: e.target.value,
                          })
                        }
                        required
                        aria-label="Category"
                      >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12">
                      <button
                        type="submit"
                        className="btn btn-outline-secondary me-2"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() => setEditProduct(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            <div className="table-responsive ">
              <table className="table table-hover ">
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Price</th>
                    <th scope="col">Stock</th>
                    <th scope="col">Category</th>
                    <th scope="col"></th>
                  </tr>
                </thead>
                <tbody
                  style={{
                    fontSize: "14px",
                  }}
                >
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>Rp {product.price.toLocaleString()}</td>
                      <td>{product.stock}</td>
                      <td>
                        {categories.find((c) => c.id === product.categoryId)
                          ?.name || "N/A"}
                      </td>
                      <td>
                        <button
                          className="btn btn-outline-secondary btn-sm me-2"
                          onClick={() => setEditProduct({ ...product })}
                        >
                          Edit
                        </button>
                        <div>
                          <button
                            className="btn btn-outline-danger btn-sm mt-2"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

AdminProductPage.propTypes = { baseUrl: PropTypes.string.isRequired };
export default AdminProductPage;