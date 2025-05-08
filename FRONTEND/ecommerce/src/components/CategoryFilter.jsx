import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";

function CategoryFilter({ onCategoryChange, baseUrl }) {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await axios.get(`${baseUrl}/categories`, {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
        });
        setCategories(response.data);
      } catch (err) {
        console.error("Gagal mengambil kategori:", err);
      }
    };
    fetchCategories();
  }, [baseUrl]);

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value === "all" ? null : Number(e.target.value);
    setActiveCategory(categoryId);
    onCategoryChange(categoryId);
  };

  return (
    <div className="d-flex col-5  p-3">
      <h4 style={{fontSize: "15px"}}> Select Category</h4>
      <select
        className="form-select"
        style={{ width: "150px", marginLeft: "10px" }}
        value={activeCategory === null ? "all" : activeCategory}
        onChange={handleCategoryChange}
      >
        <option value="all">All</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
    </div>
  );
}

CategoryFilter.propTypes = {
  onCategoryChange: PropTypes.func.isRequired,
  baseUrl: PropTypes.string.isRequired,
};

export default CategoryFilter;
