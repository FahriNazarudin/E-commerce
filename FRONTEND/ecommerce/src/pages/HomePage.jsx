import axios from "axios";
import React, { useEffect, useState } from "react";
import CardProduct from "../components/CardProduct";
import Swal from "sweetalert2";

export default function HomePage() {
  const [products, setProduct] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get(
          "https://h8-phase2-gc.vercel.app/apis/pub/branded-things/products",
        );
        setProduct(response.data.data.query);
        // console.log("Products:", response.data.data.query);
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: "Failed to fetch products!",
          icon: "error",
          confirmButtonText: "OK",
        });
        console.error("Error fetching products:", error);
      }
    }
    fetchData();
  }, []); 
  
//   console.log("Current products:", products);

  return (
    
    <section className="container my-5">
      <h1 className="mb-4">Our Products</h1>
      {products.length === 0 ? (
        <div className="text-center">No products available</div>
      ) : (
        <div className="d-flex gap-4 flex-wrap">
          {products.map((product) => (
            <CardProduct key={product.id} product={product} />
          ))}
        </div>
      )}
      <div id="carouselExample" className="carousel slide">
  <div className="carousel-inner">
    <div className="carousel-item active">
      <img src="..." className="d-block w-100" alt="..." />
    </div>
    <div className="carousel-item">
      <img src="..." className="d-block w-100" alt="..." />
    </div>
    <div className="carousel-item">
      <img src="..." className="d-block w-100" alt="..." />
    </div>
  </div>
  <button
    className="carousel-control-prev"
    type="button"
    data-bs-target="#carouselExample"
    data-bs-slide="prev"
  >
    <span className="carousel-control-prev-icon" aria-hidden="true" />
    <span className="visually-hidden">Previous</span>
  </button>
  <button
    className="carousel-control-next"
    type="button"
    data-bs-target="#carouselExample"
    data-bs-slide="next"
  >
    <span className="carousel-control-next-icon" aria-hidden="true" />
    <span className="visually-hidden">Next</span>
  </button>
</div>

    </section>
  );
}
