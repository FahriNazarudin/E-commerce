import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import PropTypes from "prop-types";
import ProductCard from "../components/ProductCard";
import CategoryFilter from "../components/CategoryFilter";

export default function HomePage({ baseUrl, setCartCount }) {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(8);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(`${baseUrl}/products`, {
        params: {
          search: searchQuery || "",
          page: currentPage,
          limit: limit,
        },
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      });
      setProducts(response.data);

      if (response.data.length < limit && currentPage > 1) {
        setTotalPages(currentPage);
      } else if (response.data.length === limit) {
        setTotalPages(Math.max(totalPages, currentPage + 1));
      } else if (response.data.length === 0 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else if (currentPage === 1) {
        setTotalPages(Math.max(1, Math.ceil(response.data.length / limit)));
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
      Swal.fire({
        title: "Error!",
        text: "Failed to load product list",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      const response = await axios.post(
        `${baseUrl}/carts`,
        { productId, quantity: 1 },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      console.log(response.data, "RESPONSE");

      Swal.fire({
        position: "top-center",
        icon: "success",
        title: "Item added to cart",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (err) {
      console.error("Failed to add to cart:", err);
      Swal.fire({
        title: "Error!",
        text: "Could not add item to cart. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    fetchProducts();
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, limit]); // Re-fetch when page or limit changes

  const filteredProducts = selectedCategory
    ? products.filter((product) => product.categoryId === selectedCategory)
    : products;

  return (
    <div className="container-fluid px-4">
      <div className="row">
        {/* Sidebar with CategoryFilter */}
        <div className="col-lg-3 col-md-4">
          <div className="position-sticky" style={{ top: "80px", zIndex: 100 }}>
            <div className="mt-4 pt-2">
              <CategoryFilter
                onCategoryChange={setSelectedCategory}
                baseUrl={baseUrl}
              />

              <div className="p-3">
                <form
                  role="search"
                  onSubmit={handleSearchSubmit}
                  className="mb-4"
                >
                  <div className="input-group">
                    <input
                      className="form-control"
                      type="search"
                      placeholder="Search products..."
                      aria-label="Search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span>
                          <span
                            className="spinner-border spinner-border-sm me-1"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Searching...
                        </span>
                      ) : (
                        "Search"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="col-lg-9 col-md-8">
          <div className="p-3">
            <h4 className="mb-4">
              {selectedCategory ? "Products by Category" : "All Products"}
              {searchQuery && <span> - Search: "{searchQuery}"</span>}
            </h4>

            {isLoading ? (
              <div className="d-flex justify-content-center my-5">
                <div className="spinner-border text-secondary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="alert alert-info text-center my-5" role="alert">
                No products found
              </div>
            ) : (
              <>
                <div className="row row-cols-1 row-cols-sm-2 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="col">
                      <ProductCard
                        product={product}
                        onAddToCart={handleAddToCart}
                      />
                    </div>
                  ))}
                </div>

                <div className="d-flex justify-content-center mt-4 ">
                  <nav aria-label="Product pagination">
                    <ul className="pagination">
                      <li
                        className={`page-item ${
                          currentPage === 1 ? "disabled" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          style={{ color: "grey" }}
                          onClick={() => handlePageChange(currentPage - 1)}
                          aria-label="Previous"
                          disabled={currentPage === 1}
                        >
                          <span aria-hidden="true">&laquo;</span>
                        </button>
                      </li>

                      {[...Array(totalPages)].map((_, index) => (
                        <li
                          key={index + 1}
                          className={`page-item ${
                            currentPage === index + 1 ? "active" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            style={
                              currentPage === index + 1
                                ? {
                                    backgroundColor: "grey",
                                    color: "white",
                                    borderColor: "grey",
                                  }
                                : { color: "grey" }
                            }
                            onClick={() => handlePageChange(index + 1)}
                          >
                            {index + 1}
                          </button>
                        </li>
                      ))}

                      <li
                        className={`page-item ${
                          currentPage === totalPages ? "disabled" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          style={{ color: "grey" }}
                          onClick={() => handlePageChange(currentPage + 1)}
                          aria-label="Next"
                          disabled={currentPage === totalPages}
                        >
                          <span aria-hidden="true">&raquo;</span>
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

HomePage.propTypes = {
  baseUrl: PropTypes.string.isRequired,
  setCartCount: PropTypes.func.isRequired,
};
