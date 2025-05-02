import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import PropTypes from "prop-types";
import { useNavigate } from "react-router";

function AdminCategoryPage({ baseUrl }) {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${baseUrl}/categories`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        setCategories(response.data);
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: error.response?.data?.message || "Failed to load categories",
          icon: "error",
          confirmButtonText: "OK",
        });
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, [baseUrl]);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) {
      Swal.fire({
        title: "Error!",
        text: "Category name cannot be empty",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }
    try {
      const response = await axios.post(
        `${baseUrl}/categories`,
        { name: newCategory.trim() },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      setCategories([...categories, response.data]);
      setNewCategory("");
      Swal.fire({
        position: "top-center",
        icon: "success",
        title: "Category added successfully",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to add category",
        icon: "error",
        confirmButtonText: "OK",
      });
      console.error("Error adding category:", error);
    }
  };

  const handleUpdateCategory = async (id, name) => {
    if (!name.trim()) {
      Swal.fire({
        title: "Error!",
        text: "Category name cannot be empty",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }
    try {
      await axios.put(
        `${baseUrl}/categories/${id}`,
        { name: name.trim() },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      setCategories(
        categories.map((c) => (c.id === id ? { ...c, name: name.trim() } : c))
      );
      Swal.fire({
        position: "top-center",
        icon: "success",
        title: "Category updated successfully",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to update category",
        icon: "error",
        confirmButtonText: "OK",
      });
      console.error("Error updating category:", error);
    }
  };

  const handleDeleteCategory = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This category will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });
    if (result.isConfirmed) {
      try {
        await axios.delete(`${baseUrl}/categories/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        setCategories(categories.filter((c) => c.id !== id));
        Swal.fire({
          position: "top-center",
          icon: "success",
          title: "Category deleted successfully",
          showConfirmButton: false,
          timer: 1500,
        });
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: error.response?.data?.message || "Failed to delete category",
          icon: "error",
          confirmButtonText: "OK",
        });
        console.error("Error deleting category:", error);
      }
    }
  };

  return (
    <div
      className="d-flex justify-content-center w-100 vh-100"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1605774337664-7a846e9cdf17?q=80&w=3174&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div
        className="card shadow-sm p-5 rounded-3 h-75 mt-4"
        style={{
          maxWidth: "600px",
          width: "150%",
          backgroundColor: "rgba(237, 237, 237, 0.83)",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        <h2 className="text-center mb-4" style={{ color: "#343a40" }}></h2>
        {isLoading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Add Category Form */}
            <div className="mb-4">
              <h4 className="mb-3" style={{ color: "#343a40" }}>
                Add Category
              </h4>
              <form onSubmit={handleAddCategory}>
                <div className="input-group mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Category Name"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    required
                    aria-label="Category Name"
                  />
                  <button
                    className="btn btn-outline-secondary"
                    type="submit"
                    disabled={!newCategory.trim()}
                  >
                    Add
                  </button>
                </div>
              </form>
            </div>

            <div
              className="table-responsive"
              style={{
                backgroundColor: "rgba(237, 237, 237, 0.83)",
              }}
            >
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th scope="col">Category Name</th>
                    <th scope="col"></th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          value={category.name}
                          onBlur={(e) =>
                            handleUpdateCategory(category.id, e.target.value)
                          }
                          onChange={(e) =>
                            setCategories(
                              categories.map((c) =>
                                c.id === category.id
                                  ? { ...c, name: e.target.value }
                                  : c
                              )
                            )
                          }
                          aria-label={`Edit category name ${category.name}`}
                        />
                      </td>
                      <td>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        <div className="d-flex justify-content-between mt-4">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

AdminCategoryPage.propTypes = {
  baseUrl: PropTypes.string.isRequired,
};

export default AdminCategoryPage;
