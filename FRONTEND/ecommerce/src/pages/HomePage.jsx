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

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${baseUrl}/products`, {
        params: {
          searchQuery: searchQuery 
        },
      });
      setProducts(response.data);
    } catch (err) {
      console.error("Gagal mengambil produk:", err);
      Swal.fire({
        title: "Error!",
        text: "Gagal memuat daftar produk",
        icon: "error",
        confirmButtonText: "OK",
      });
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
      setCartCount((prev) => prev + 1);
      Swal.fire({
        position: "top-center",
        icon: "success",
        title: "Barang ditambahkan ke keranjang",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (err) {
      console.error("Gagal menambahkan ke keranjang:", err);
      Swal.fire({
        title: "Error!",
        text: "Silakan login untuk menambahkan barang ke keranjang",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchQuery]);

  const filteredProducts = selectedCategory
    ? products.filter((product) => product.categoryId === selectedCategory)
    : products;

  return (
    <div>
      <div className="mb-4">
        <div className="input-group">
          <input
            type="text"
            className="form-control rounded-start"
            placeholder="Cari produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="btn btn-primary" type="button">
            Seach
          </button>
        </div>
      </div>
      <CategoryFilter
        onCategoryChange={setSelectedCategory}
        baseUrl={baseUrl}
      />
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4 p-3">
        {filteredProducts.length === 0 ? (
          <p className="text-center w-100">Tidak ada produk yang ditemukan</p>
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
