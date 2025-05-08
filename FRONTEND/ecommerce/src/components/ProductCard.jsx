import PropTypes from "prop-types";

function ProductCard({ product, onAddToCart }) {
  // Fungsi untuk memotong teks deskripsi agar tidak terlalu panjang
  const truncateDescription = (text, maxLength = 50) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  return (
    <div className="card h-100 shadow-sm border-0">
      <div className="position-relative">
        <img
          src={product.imgUrl}
          className="card-img-top"
          alt={product.name}
          style={{
            height: "200px",
            width: "100%",
            objectFit: "cover",
            borderTopLeftRadius: "0.25rem",
            borderTopRightRadius: "0.25rem",
          }}
        />
        {product.stock <= 0 && (
          <div
            className="position-absolute top-0 end-0 bg-danger text-white px-2 py-1 m-2 rounded-pill"
            style={{ fontSize: "0.8rem" }}
          >
            Sold Out
          </div>
        )}
        {product.stock > 0 && product.stock <= 5 && (
          <div
            className="position-absolute top-0 end-0 bg-warning text-dark px-2 py-1 m-2 rounded-pill"
            style={{ fontSize: "0.8rem" }}
          >
            Only {product.stock} left
          </div>
        )}
      </div>

      <div className="card-body d-flex flex-column">
        <h5 className="card-title text-truncate mb-1">{product.name}</h5>
        <p className="card-text text-muted small mb-2">
          {truncateDescription(product.description)}
        </p>
        <p className="card-text fw-bold fs-5 text-secondary mt-auto mb-2">
          Rp {product.price.toLocaleString("id-ID")}
        </p>
        <button
          className={`btn ${
            product.stock <= 0 ? "btn-secondary" : "btn-outline-secondary"
          } w-100`}
          onClick={() => onAddToCart(product.id)}
          disabled={product.stock <= 0}
        >
          {product.stock <= 0 ? "Sold Out" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    price: PropTypes.number.isRequired,
    stock: PropTypes.number.isRequired,
    imgUrl: PropTypes.string,
  }).isRequired,
  onAddToCart: PropTypes.func.isRequired,
};

export default ProductCard;
