import PropTypes from "prop-types";

export default function CardProduct({ product }) {
  return (
    <div className="col">
      <div
        className="card h-100 text-center shadow-sm"
        style={{
          borderRadius: "10px",
          transition: "transform 0.3s, box-shadow 0.3s",
          border: "none",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-5px)";
          e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
        }}
      >
        <div
          style={{
            overflow: "hidden",
            borderTopLeftRadius: "10px",
            borderTopRightRadius: "10px",
          }}
        >
          <img
            src={product.imgUrl || "https://via.placeholder.com/286x180"}
            className="card-img-top p-4"
            alt={product.name || "Product"}
            style={{
              maxHeight: "200px",
              objectFit: "cover",
              transition: "transform 0.3s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.05)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />
        </div>
        <div className="card-body d-flex flex-column">
          <h5
            className="card-title fw-bold mb-2"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontSize: "1.1rem",
            }}
          >
            {product.name || "Unnamed Product"}
          </h5>
          {/* <p
            className="card-text text-muted mb-3"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontSize: "0.9rem",
            }}
          >
            {product.description || "No description available"}
          </p> */}
          <div className="mt-auto">
            <span
              className="badge bg-warning text-dark px-3 py-2 mb-2 fw-bold d-inline-block"
              style={{ borderRadius: "20px", fontSize: "0.95rem" }}
            >
              ${product.price || 0}
            </span>
            <br />
            <span
              className="badge bg-success text-white px-3 py-2 fw-bold d-inline-block"
              style={{ borderRadius: "20px", fontSize: "0.95rem" }}
            >
              Stock: {product.stock || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

CardProduct.propTypes = {
  product: PropTypes.exact({
    id: PropTypes.number.isRequired,
    name: PropTypes.string,
    description: PropTypes.string,
    price: PropTypes.number,
    stock: PropTypes.number,
    imgUrl: PropTypes.string,
    categoryId: PropTypes.number,
  }).isRequired,
};
