const app = require("../app");
const request = require("supertest");
const { test, expect, beforeAll, afterAll } = require("@jest/globals");
const { User, Product, Category, Cart, sequelize } = require("../models");
const { hashPassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");
const { queryInterface } = sequelize;
const fs = require("fs").promises;

let access_token_admin;
let access_token_user;
let testCartItemId; // Added at top level for cart tests

beforeAll(async () => {
  try {
    const usersData = await fs.readFile("./data/users.json", "utf8");
    const users = JSON.parse(usersData).map((user) => {
      if (!user.email) {
        throw new Error("User missing email in users.json");
      }
      if (!user.password) {
        throw new Error("User missing password in users.json");
      }
      return {
        ...user,
        createdAt: new Date(),
        updatedAt: new Date(),
        password: hashPassword(user.password),
        role: user.role || "user",
      };
    });

    const categoriesData = await fs.readFile("./data/categories.json", "utf8");
    const categories = JSON.parse(categoriesData).map((category) => ({
      ...category,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const productsData = await fs.readFile("./data/products.json", "utf8");
    const products = JSON.parse(productsData).map((product) => ({
      ...product,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const cartsData = await fs.readFile("./data/carts.json", "utf8");
    const carts = JSON.parse(cartsData).map((cart) => ({
      ...cart,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await queryInterface.bulkDelete("Carts", null, {
      truncate: true,
      restartIdentity: true,
      cascade: true,
    });
    await queryInterface.bulkDelete("Products", null, {
      truncate: true,
      restartIdentity: true,
      cascade: true,
    });
    await queryInterface.bulkDelete("Categories", null, {
      truncate: true,
      restartIdentity: true,
      cascade: true,
    });
    await queryInterface.bulkDelete("Users", null, {
      truncate: true,
      restartIdentity: true,
      cascade: true,
    });

    await queryInterface.bulkInsert("Users", users);
    await queryInterface.bulkInsert("Categories", categories);
    await queryInterface.bulkInsert("Products", products);
    await queryInterface.bulkInsert("Carts", carts);

    const adminUser = await User.findOne({
      where: { email: "admin@example.com" },
    });
    if (!adminUser) {
      throw new Error("Admin user not found in database");
    }
    access_token_admin = signToken({ id: adminUser.id });

    const regularUser = await User.findOne({
      where: { email: "user@example.com" },
    });
    if (!regularUser) {
      throw new Error("Regular user not found in database");
    }
    access_token_user = signToken({ id: regularUser.id });
  } catch (error) {
    console.error("Error in beforeAll:", error);
    throw error;
  }
});

afterAll(async () => {
  await queryInterface.bulkDelete("Carts", null, {
    truncate: true,
    restartIdentity: true,
    cascade: true,
  });
  await queryInterface.bulkDelete("Products", null, {
    truncate: true,
    restartIdentity: true,
    cascade: true,
  });
  await queryInterface.bulkDelete("Categories", null, {
    truncate: true,
    restartIdentity: true,
    cascade: true,
  });
  await queryInterface.bulkDelete("Users", null, {
    truncate: true,
    restartIdentity: true,
    cascade: true,
  });
});

describe("POST /register", () => {
  test("Berhasil mendaftarkan pengguna baru", async () => {
    const newUser = {
      username: "user1",
      email: "user1@mail.com",
      password: "user123",
      phoneNumber: "000000000",
      address: "Jl. Test No. 123",
    };

    const response = await request(app).post("/register").send(newUser);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("username", newUser.username);
    expect(response.body).toHaveProperty("email", newUser.email);
  });

  test("Gagal mendaftar karena email sudah terdaftar", async () => {
    const duplicateUser = {
      username: "adminuser",
      email: "admin@example.com",
      password: "password123",
      phoneNumber: "08123456789",
      address: "Jl. Test No. 123",
    };

    const response = await request(app).post("/register").send(duplicateUser);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Email already registered");
  });

  test("Gagal mendaftar karena data tidak lengkap", async () => {
    const invalidUser = {
      username: "testuser",
      // email tidak ada
      password: "password123",
    };

    const response = await request(app).post("/register").send(invalidUser);

    expect(response.status).toBe(400);
  });

  test("Gagal mendaftar karena format email tidak valid", async () => {
    const invalidEmailUser = {
      username: "testuser",
      email: "invalid-email",
      password: "password123",
    };

    const response = await request(app)
      .post("/register")
      .send(invalidEmailUser);

    expect(response.status).toBe(400);
  });
});

describe("POST /login", () => {
  test("Berhasil login dan mengirimkan access_token", async () => {
    const requestBody = {
      email: "admin@example.com",
      password: "admin123",
    };

    const response = await request(app).post("/login").send(requestBody);
    // console.log(response.status, "<<< STATUS CODE");

    expect(response.status).toBe(200);
    // console.log(response.body, "<<< BODY CODE");
    expect(response.body).toHaveProperty("access_token");
  });

  test("Email tidak diberikan / tidak diinput", async () => {
    const requestBody = {
      password: "admin123",
    };

    const response = await request(app).post("/login").send(requestBody);
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Email is required");
  });

  test("Password tidak diberikan / tidak diinput", async () => {
    const requestBody = {
      email: "admin@example.com",
    };

    const response = await request(app).post("/login").send(requestBody);
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Password is required");
  });

  test("Email diberikan invalid / tidak terdaftar", async () => {
    const requestBody = {
      email: "admin1@example.com",
      password: "admin123",
    };

    const response = await request(app).post("/login").send(requestBody);
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Invalid email/password");
  });

  test("Password diberikan salah / tidak match", async () => {
    const requestBody = {
      email: "admin@example.com",
      password: "admin321",
    };

    const response = await request(app).post("/login").send(requestBody);
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Invalid email/password");
  });
});

describe("POST /login/google", () => {
  test("Gagal login dengan Google karena token tidak valid", async () => {
    const response = await request(app)
      .post("/login/google")
      .send({ googleToken: "invalid_token" });

    expect(response.status).toBe(401);
  });
});

describe("POST /products", () => {
  test("Berhasil membuat produk baru", async () => {
    const product = {
      name: "Rinso Matic Deterjen Cair Mesin Bukaan Depan 1.45L Twin Pack",
      description:
        'Rinso Matic Deterjen Cair Mesin Cuci Bukaan Depan dengan keharuman tahan lama. Menghilangkan noda membandel 3x lebih efektif, tersedia dalam ukuran 1.45L. Formula ini rendah busa dan tidak meninggalkan residu pada pakaian, serta direkomendasikan oleh mesin cuci terkemuka. Detergen ini mengandung aroma pink rose, jasmine, dan apple, yang tahan hingga 21 hari.\n\n**Cara Pemakaian:**\nCukup gunakan 1 tutup botol untuk cucian Anda (20-25 potong pakaian). Untuk noda membandel, oleskan deterjen pada noda, gosok sebentar, lalu masukkan ke dalam mesin cuci.\n\nDengan tagline "Berani Kotor Demi Kebaikan", Rinso Deterjen Mesin Cuci mengajak kamu untuk berani berbuat kebaikan tanpa takut kotor, serta meningkatkan kesadaran akan lingkungan dengan kemasan yang dapat didaur ulang.',
      price: 98800,
      stock: 71,
      imgUrl:
        "https://res.cloudinary.com/dpjqm8kkk/image/upload/v1723522930/hacktiv8/branded/rinso-matic-deterjen-cair-mesin-bukaan-depan-1.45l-twin-pack-9tgfl9aox1q.jpg",
      categoryId: 6,
      userId: 1,
    };

    const response = await request(app)
      .post("/products")
      .set("Authorization", `Bearer ${access_token_admin}`)
      .send(product);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("name", product.name);
    expect(response.body).toHaveProperty("description", product.description);
    expect(response.body).toHaveProperty("price", product.price);
    expect(response.body).toHaveProperty("stock", product.stock);
    expect(response.body).toHaveProperty("imgUrl", product.imgUrl);
    expect(response.body).toHaveProperty("categoryId", product.categoryId);
  });

  test("Gagal membuat produk karena token tidak valid", async () => {
    const product = {
      name: "Cubic Lemari Pakaian Minimalis",
      description: "Deskripsi produk Cubic Lemari Pakaian Minimalis",
      price: 1029000,
      stock: 587,
      imgUrl: "https://example.com/image.jpg",
      categoryId: 2,
    };

    const response = await request(app)
      .post("/products")
      .set("Authorization", "Bearer invalid_token")
      .send(product);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Unauthorized access");
  });

  test("Gagal membuat produk karena data tidak lengkap", async () => {
    const product = {
      description: "Deskripsi produk Cubic Lemari Pakaian Minimalis",
      price: 1029000,
      stock: 587,
      imgUrl: "https://example.com/image.jpg",
      categoryId: 2,
    };

    const response = await request(app)
      .post("/products")
      .set("Authorization", `Bearer ${access_token_admin}`)
      .send(product);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty(
      "message",
      "User ID is required and must be a number!"
    );
  });
});

describe("GET /products", () => {
  test("Berhasil mendapatkan daftar produk dengan filter kategori", async () => {
    const response = await request(app)
      .get("/products?categoryId=2")
      .set("Authorization", `Bearer ${access_token_user}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    if (response.body.length > 0) {
      expect(response.body[0].categoryId).toBe(2);
    }
  });

  test("Berhasil mendapatkan daftar produk dengan pencarian", async () => {
    const response = await request(app)
      .get("/products?search=Rinso")
      .set("Authorization", `Bearer ${access_token_user}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });

  test("Berhasil mendapatkan daftar produk dengan pagination", async () => {
    const response = await request(app)
      .get("/products?page=1&limit=5")
      .set("Authorization", `Bearer ${access_token_user}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeLessThanOrEqual(5);
  });
});

describe("GET /products/:id", () => {
  test("Gagal mendapatkan produk dengan ID tidak valid", async () => {
    const response = await request(app)
      .get("/products/invalid_id")
      .set("Authorization", `Bearer ${access_token_user}`);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Invalid product ID");
  });

  test("Gagal mendapatkan produk dengan ID yang tidak ditemukan", async () => {
    const productId = 99999;
    const response = await request(app)
      .get(`/products/${productId}`)
      .set("Authorization", `Bearer ${access_token_user}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty(
      "message",
      `Product with ID ${productId} not found`
    );
  });
});

describe("POST /products", () => {
  test("Gagal membuat produk dengan harga negatif", async () => {
    const product = {
      name: "Test Product",
      description: "Test Description",
      price: -100,
      stock: 10,
      imgUrl: "https://example.com/image.jpg",
      categoryId: 2,
      userId: 1,
    };

    const response = await request(app)
      .post("/products")
      .set("Authorization", `Bearer ${access_token_admin}`)
      .send(product);

    expect(response.status).toBe(400);
  });

  test("Gagal membuat produk dengan stok negatif", async () => {
    const product = {
      name: "Test Product",
      description: "Test Description",
      price: 10000,
      stock: -5,
      imgUrl: "https://example.com/image.jpg",
      categoryId: 2,
      userId: 1,
    };

    const response = await request(app)
      .post("/products")
      .set("Authorization", `Bearer ${access_token_admin}`)
      .send(product);

    expect(response.status).toBe(400);
  });
});

describe("PUT /products/:id ", () => {
  test("Gagal mengupdate produk dengan ID tidak valid", async () => {
    const updatedProduct = {
      name: "Updated Product",
      description: "Updated Description",
      price: 20000,
      stock: 15,
      imgUrl: "https://example.com/updated.jpg",
      categoryId: 2,
      userId: 1,
    };

    const response = await request(app)
      .put("/products/invalid_id")
      .set("Authorization", `Bearer ${access_token_admin}`)
      .send(updatedProduct);

    expect(response.status).toBe(400);
  });

  test("Gagal mengupdate produk dengan ID yang tidak ditemukan", async () => {
    const productId = 99999;
    const updatedProduct = {
      name: "Updated Product",
      description: "Updated Description",
      price: 20000,
      stock: 15,
      imgUrl: "https://example.com/updated.jpg",
      categoryId: 2,
      userId: 1,
    };

    const response = await request(app)
      .put(`/products/${productId}`)
      .set("Authorization", `Bearer ${access_token_admin}`)
      .send(updatedProduct);

    expect(response.status).toBe(404);
  });
});

describe("DELETE /products/:id ", () => {
  test("Gagal menghapus produk dengan ID tidak valid", async () => {
    const response = await request(app)
      .delete("/products/invalid_id")
      .set("Authorization", `Bearer ${access_token_admin}`);

    expect(response.status).toBe(400);
  });

  test("Gagal menghapus produk dengan ID yang tidak ditemukan", async () => {
    const productId = 99999;
    const response = await request(app)
      .delete(`/products/${productId}`)
      .set("Authorization", `Bearer ${access_token_admin}`);

    expect(response.status).toBe(404);
  });
});

describe("GET /categories", () => {
  test("Berhasil mendapatkan daftar kategori", async () => {
    const response = await request(app)
      .get("/categories")
      .set("Authorization", `Bearer ${access_token_user}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });
});

describe("POST /categories", () => {
  test("Berhasil membuat kategori baru", async () => {
    const category = { name: "Furniture" };

    const response = await request(app)
      .post("/categories")
      .set("Authorization", `Bearer ${access_token_admin}`)
      .send(category);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("name", category.name);
  });

  test("Gagal membuat kategori karena nama tidak diberikan", async () => {
    const response = await request(app)
      .post("/categories")
      .set("Authorization", `Bearer ${access_token_admin}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty(
      "message",
      "Category name is required"
    );
  });
});

describe("GET /categories/:id", () => {
  test("Berhasil mendapatkan kategori berdasarkan ID", async () => {
    const categoryId = 1;
    const response = await request(app)
      .get(`/categories/${categoryId}`)
      .set("Authorization", `Bearer ${access_token_user}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id", categoryId);
  });

  test("Gagal mendapatkan kategori karena ID tidak valid", async () => {
    const response = await request(app)
      .get("/categories/invalid_id")
      .set("Authorization", `Bearer ${access_token_user}`);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Invalid category ID");
  });

  test("Gagal mendapatkan kategori karena ID tidak ditemukan", async () => {
    const categoryId = 999;

    const response = await request(app)
      .get(`/categories/${categoryId}`)
      .set("Authorization", `Bearer ${access_token_user}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty(
      "message",
      `Category with ID ${categoryId} not found`
    );
  });
});

describe("PUT /categories/:id", () => {
  test("Berhasil memperbarui kategori berdasarkan ID", async () => {
    const categoryId = 1;
    const updatedCategory = { name: "Updated Category" };

    const response = await request(app)
      .put(`/categories/${categoryId}`)
      .set("Authorization", `Bearer ${access_token_admin}`)
      .send(updatedCategory);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty(
      "message",
      `Category with ID ${categoryId} has been successfully updated`
    );
  });

  test("Gagal memperbarui kategori karena ID tidak valid", async () => {
    const response = await request(app)
      .put("/categories/invalid_id")
      .set("Authorization", `Bearer ${access_token_admin}`)
      .send({ name: "Updated Category" });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty(
      "message",
      "Invalid category invalid_id"
    );
  });

  test("Gagal memperbarui kategori karena ID tidak ditemukan", async () => {
    const categoryId = 999;
    const updatedCategory = { name: "Updated Category" };

    const response = await request(app)
      .put(`/categories/${categoryId}`)
      .set("Authorization", `Bearer ${access_token_admin}`)
      .send(updatedCategory);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty(
      "message",
      `Category with ID ${categoryId} not found`
    );
  });

  test("Gagal memperbarui kategori karena nama tidak diberikan", async () => {
    const categoryId = 1;

    const response = await request(app)
      .put(`/categories/${categoryId}`)
      .set("Authorization", `Bearer ${access_token_admin}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty(
      "message",
      "Category name is required"
    );
  });
});

describe("DELETE /categories/:id", () => {
  test("Berhasil menghapus kategori berdasarkan ID", async () => {
    const categoryId = 1;

    const response = await request(app)
      .delete(`/categories/${categoryId}`)
      .set("Authorization", `Bearer ${access_token_admin}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty(
      "message",
      `Category with ID ${categoryId} has been successfully deleted`
    );
  });

  test("Gagal menghapus kategori karena ID tidak valid", async () => {
    const response = await request(app)
      .delete("/categories/invalid_id")
      .set("Authorization", `Bearer ${access_token_admin}`);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Invalid category ID");
  });

  test("Gagal menghapus kategori karena ID tidak ditemukan", async () => {
    const categoryId = 999;

    const response = await request(app)
      .delete(`/categories/${categoryId}`)
      .set("Authorization", `Bearer ${access_token_admin}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty(
      "message",
      `Category with ID ${categoryId} not found`
    );
  });
});

describe("POST /carts", () => {
  test("Berhasil menambahkan item ke keranjang", async () => {
    const cartItem = {
      productId: 1,
      quantity: 2,
    };

    const response = await request(app)
      .post("/carts")
      .set("Authorization", `Bearer ${access_token_user}`)
      .send(cartItem);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("message", "Item added to cart");
  });

  test("Berhasil menambah kuantitas item yang sudah ada di keranjang", async () => {
    const cartItem = {
      productId: 1,
      quantity: 1,
    };

    const response = await request(app)
      .post("/carts")
      .set("Authorization", `Bearer ${access_token_user}`)
      .send(cartItem);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("message", "Item added to cart");
  });

  test("Gagal menambahkan item dengan productId yang tidak valid", async () => {
    const cartItem = {
      productId: "invalid",
      quantity: 2,
    };

    const response = await request(app)
      .post("/carts")
      .set("Authorization", `Bearer ${access_token_user}`)
      .send(cartItem);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Invalid product ID");
  });

  test("Gagal menambahkan item dengan kuantitas tidak valid", async () => {
    const cartItem = {
      productId: 1,
      quantity: 0,
    };

    const response = await request(app)
      .post("/carts")
      .set("Authorization", `Bearer ${access_token_user}`)
      .send(cartItem);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty(
      "message",
      "Quantity must be greater than 0"
    );
  });

  test("Gagal menambahkan item dengan productId yang tidak ditemukan", async () => {
    const cartItem = {
      productId: 99999,
      quantity: 1,
    };

    const response = await request(app)
      .post("/carts")
      .set("Authorization", `Bearer ${access_token_user}`)
      .send(cartItem);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "Product not found");
  });
});

describe("GET /carts", () => {
  test("Berhasil mendapatkan daftar item keranjang", async () => {
    const response = await request(app)
      .get("/carts")
      .set("Authorization", `Bearer ${access_token_user}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);

    if (response.body.length > 0) {
      testCartItemId = response.body[0].id;
    }
  });
});

describe("PUT /carts/:id", () => {
  test("Berhasil mengupdate item keranjang", async () => {
    const updatedCartItem = {
      productId: 1,
      quantity: 5,
    };

    const response = await request(app)
      .put(`/carts/${testCartItemId}`)
      .set("Authorization", `Bearer ${access_token_user}`)
      .send(updatedCartItem);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty(
      "message",
      `Cart with ID ${testCartItemId} successfully updated`
    );
  });

  test("Gagal mengupdate item dengan ID keranjang tidak valid", async () => {
    const updatedCartItem = {
      productId: 1,
      quantity: 3,
    };

    const response = await request(app)
      .put("/carts/invalid_id")
      .set("Authorization", `Bearer ${access_token_user}`)
      .send(updatedCartItem);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Invalid cart ID");
  });

  test("Gagal mengupdate item dengan productId tidak valid", async () => {
    const updatedCartItem = {
      productId: "invalid",
      quantity: 3,
    };

    const response = await request(app)
      .put(`/carts/${testCartItemId}`)
      .set("Authorization", `Bearer ${access_token_user}`)
      .send(updatedCartItem);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Invalid product ID");
  });

  test("Gagal mengupdate item dengan kuantitas tidak valid", async () => {
    const updatedCartItem = {
      productId: 1,
      quantity: -1,
    };

    const response = await request(app)
      .put(`/carts/${testCartItemId}`)
      .set("Authorization", `Bearer ${access_token_user}`)
      .send(updatedCartItem);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty(
      "message",
      "Quantity must be greater than 0"
    );
  });

  test("Gagal mengupdate item dengan ID keranjang tidak ditemukan", async () => {
    const updatedCartItem = {
      productId: 1,
      quantity: 3,
    };

    const response = await request(app)
      .put("/carts/999999")
      .set("Authorization", `Bearer ${access_token_user}`)
      .send(updatedCartItem);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty(
      "message",
      "Cart with ID 999999 not found"
    );
  });
});

describe("DELETE /carts/:id", () => {
  test("Berhasil menghapus item keranjang", async () => {
    const response = await request(app)
      .delete(`/carts/${testCartItemId}`)
      .set("Authorization", `Bearer ${access_token_user}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty(
      "message",
      `Cart with ID ${testCartItemId} successfully deleted`
    );
  });

  test("Gagal menghapus item dengan ID keranjang tidak valid", async () => {
    const response = await request(app)
      .delete("/carts/invalid_id")
      .set("Authorization", `Bearer ${access_token_user}`);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "ID Invalid cart");
  });

  test("Gagal menghapus item dengan ID keranjang tidak ditemukan", async () => {
    const response = await request(app)
      .delete(`/carts/${testCartItemId}`)
      .set("Authorization", `Bearer ${access_token_user}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty(
      "message",
      `Cart with ID ${testCartItemId} not found`
    );
  });
});
