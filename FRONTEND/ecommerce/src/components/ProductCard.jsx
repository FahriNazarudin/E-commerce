import PropTypes from "prop-types";

function ProductCard({ product, onAddToCart }) {
  return (
    <div className="d-flex flex-row flex-wrap justify-content-center">
      <div className="shadow-sm p-3 rounded-3 bg-light ">
        <img
          src={product.imgUrl }
          className="card-img-top"
          alt={product.name}
          style={{
            height: "250px",
            objectFit: "cover",
          }}
        />
        <div className="card-body d-flex flex-column">
          <h5 className="card-title">{product.name}</h5>
          <p className="card-text fw-bold">
            Rp {product.price.toLocaleString("id-ID")}
          </p>
          <button
            className="btn btn-outline-secondary mt-auto"
            onClick={() => onAddToCart(product.id)}
            disabled={product.stock <= 0}
          >
            {product.stock <= 0 ? "Sold" : "Add to Cart"}
          </button>
        </div>
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
