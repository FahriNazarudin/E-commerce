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

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${baseUrl}/products`, {
        params: {
          search: searchQuery || "",
        },
      });
      setProducts(response.data);
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
    fetchProducts();
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = selectedCategory
    ? products.filter((product) => product.categoryId === selectedCategory)
    : products;

  return (
    <div>
      <CategoryFilter
        onCategoryChange={setSelectedCategory}
        baseUrl={baseUrl}
      />
      <form
        className="d-flex p-3"
        role="search"
        onSubmit={handleSearchSubmit}
        style={{ maxWidth: "", width: "100%" }}
      >
        <input
          className="form-control me-2"
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
          {isLoading ? "Searching..." : "Search"}
        </button>
      </form>
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4 p-3">
        {isLoading ? (
          <p className="text-center w-100">Loading products...</p>
        ) : filteredProducts.length === 0 ? (
          <p className="text-center w-100">No products found</p>
        ) : (
          filteredProducts.map((product) => (
            <div key={product.id} className="col">
              <ProductCard product={product} onAddToCart={handleAddToCart} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

HomePage.propTypes = {
  baseUrl: PropTypes.string.isRequired,
  setCartCount: PropTypes.func.isRequired,
};
