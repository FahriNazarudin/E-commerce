import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";

function CategoryFilter({ onCategoryChange, baseUrl }) {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${baseUrl}/categories`);
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
    <div className="p-3" style={{ width: "150px" }}>
      <h4 className="mb-2"> Select Category</h4>
      <select
        className="form-select"
        value={activeCategory === null ? "all" : activeCategory}
        onChange={handleCategoryChange}
      >
        <option value="all">Semua</option>
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
