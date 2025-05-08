jest.mock("midtrans-client", () => {
  const mockSnap = jest.fn().mockImplementation(() => ({
    transaction: {
      notification: jest.fn().mockResolvedValue({
        order_id: "SNAP-123-12345678",
        transaction_status: "capture",
        fraud_status: "accept",
      }),
      status: jest.fn().mockResolvedValue({
        order_id: "SNAP-123-12345678",
        transaction_status: "capture",
        fraud_status: "accept",
      }),
    },
    createTransaction: jest.fn().mockResolvedValue({
      token: "test-snap-token-12345",
      redirect_url:
        "https://app.midtrans.com/snap/v2/vtweb/test-snap-token-12345",
    }),
  }));

  mockSnap.prototype = {
    transaction: {
      notification: jest.fn().mockResolvedValue({
        order_id: "SNAP-123-12345678",
        transaction_status: "capture",
        fraud_status: "accept",
      }),
      status: jest.fn().mockResolvedValue({
        order_id: "SNAP-123-12345678",
        transaction_status: "capture",
        fraud_status: "accept",
      }),
    },
    createTransaction: jest.fn().mockResolvedValue({
      token: "test-snap-token-12345",
      redirect_url:
        "https://app.midtrans.com/snap/v2/vtweb/test-snap-token-12345",
    }),
  };

  const mockCoreApi = jest.fn().mockImplementation(() => ({
    transaction: {
      status: jest.fn().mockResolvedValue({
        order_id: "QRIS-123-12345678",
        transaction_status: "settlement",
      }),
      notification: jest.fn().mockResolvedValue({
        order_id: "QRIS-123-12345678",
        transaction_status: "settlement",
      }),
    },
    charge: jest.fn().mockResolvedValue({
      actions: [
        {
          name: "generate-qr-code",
          method: "GET",
          url: "https://api.midtrans.com/v2/qris/test-qr-code",
        },
      ],
      expiry_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }),
  }));

  mockCoreApi.prototype = {
    transaction: {
      status: jest.fn().mockResolvedValue({
        order_id: "QRIS-123-12345678",
        transaction_status: "settlement",
      }),
      notification: jest.fn().mockResolvedValue({
        order_id: "QRIS-123-12345678",
        transaction_status: "settlement",
      }),
    },
    charge: jest.fn().mockResolvedValue({
      actions: [
        {
          name: "generate-qr-code",
          method: "GET",
          url: "https://api.midtrans.com/v2/qris/test-qr-code",
        },
      ],
      expiry_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }),
  };

  return {
    Snap: mockSnap,
    CoreApi: mockCoreApi,
  };
});

const midtransClient = require("midtrans-client");
const app = require("../app");
const request = require("supertest");
const { test, expect, beforeAll, afterAll } = require("@jest/globals");
const { User, Product, Category, Cart, sequelize } = require("../models");
const { hashPassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");
const { queryInterface } = sequelize;
const fs = require("fs").promises;
const { DialogflowController } = require("../controllers/DialogflowController");
const path = require("path");
const { struct } = require("pb-util");
const mockSessionsClient = {
  projectAgentSessionPath: jest.fn(),
  detectIntent: jest.fn(),
};

let access_token_admin;
let access_token_user;
let testCartItemId;

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
      username: "user33",
      email: "user33@example.com",
      password: "user123",
      phoneNumber: "08123456789",
      address: "Jl. Test No. 123",
    };

    const response = await request(app).post("/register").send(duplicateUser);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message");
  });

  test("Gagal mendaftar karena data tidak lengkap", async () => {
    const invalidUser = {
      username: "testuser",

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

describe("POST /checkout/qris", () => {
  test("berhasil membuat pembayaran QRIS ", async () => {
    const response = await request(app)
      .post("/checkout/qris")
      .set("Authorization", `Bearer ${access_token_user}`);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("orderId");
    expect(response.body).toHaveProperty("totalAmount");
    expect(response.body).toHaveProperty("qrCode");
    expect(response.body).toHaveProperty("expiry_time");
  });

  test("gagal membuat pembayatan QRIS karena token tidak sesuai", async () => {
    const response = await request(app)
      .post("/checkout/qris")
      .set("Authorization", "Bearer invalid_token");

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Unauthorized access");
  });
});

describe("GET /checkout/status/:orderId", () => {
  test("berhasil menampilkan status transaksi", async () => {
    const response = await request(app)
      .get("/checkout/status/QRIS-123-12345678")
      .set("Authorization", `Bearer ${access_token_user}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("order_id", "QRIS-123-12345678");
  });

  test("gagal menampilkan status transaksi  karena token tidak sesuai", async () => {
    const response = await request(app)
      .get("/checkout/status/QRIS-123-12345678")
      .set("Authorization", "Bearer invalid_token");

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Unauthorized access");
  });
});

describe("POST /checkout/notification", () => {
  test("berhail membuat notifikasi ketika checkout", async () => {
    const notificationData = {
      transaction_id: "test-transaction-id",
      order_id: "QRIS-123-12345678",
      status_code: "200",
      gross_amount: "100000.00",
      payment_type: "qris",
      transaction_time: "2023-01-01 12:00:00",
      transaction_status: "settlement",
      fraud_status: "accept",
    };

    const response = await request(app)
      .post("/checkout/notification")
      .set("Authorization", `Bearer ${access_token_user}`)
      .send(notificationData);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Notification processed");
  });
});

describe("POST /checkout/snap", () => {
  test("berhasil membuat transaksi pembayaran Snap.", async () => {
    const response = await request(app)
      .post("/checkout/snap")
      .set("Authorization", `Bearer ${access_token_user}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token", "test-snap-token-12345");
    expect(response.body).toHaveProperty("orderId");
    expect(response.body).toHaveProperty("redirect_url");
    expect(response.body).toHaveProperty("totalAmount");
  });

  test("gagal membuat transaksi pembayaran karena token tidak sesuai", async () => {
    const response = await request(app)
      .post("/checkout/snap")
      .set("Authorization", "Bearer invalid_token");

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Unauthorized access");
  });
});

describe("POST /notification/handling", () => {
  test("berhasil menangani notifikasi Snap", async () => {
    const notificationData = {
      transaction_id: "test-transaction-id",
      order_id: "SNAP-123-12345678",
      status_code: "200",
      gross_amount: "100000.00",
      payment_type: "credit_card",
      transaction_time: "2023-01-01 12:00:00",
      transaction_status: "capture",
      fraud_status: "accept",
    };

    const response = await request(app)
      .post("/notification/handling")
      .send(notificationData);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Notification processed");
  });
});

describe("GET /transaction/status/:orderId", () => {
  test("berhasil menampilkan status transaksi Snap", async () => {
    const response = await request(app)
      .get("/transaction/status/SNAP-123-12345678")
      .set("Authorization", `Bearer ${access_token_user}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("transaction_status", "capture");
    expect(response.body).toHaveProperty("order_id", "SNAP-123-12345678");
    expect(response.body).toHaveProperty("fraud_status", "accept");
  });

  test("gagal menampilkan status Snap dengan karena token yang tidak valid", async () => {
    const response = await request(app)
      .get("/transaction/status/SNAP-123-12345678")
      .set("Authorization", "Bearer invalid_token");

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Unauthorized access");
  });
});

describe("GET /getUserById ", () => {
  test("Should successfully get user by ID", async () => {
    const regularUser = 2;

    const response = await request(app)
      .get(`/users/${regularUser}`)
      .set("Authorization", `Bearer ${access_token_user}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("username");
    expect(response.body).toHaveProperty("email");
    expect(response.body).not.toHaveProperty("password");
  });

  test("Should fail to get another user's profile", async () => {
    const response = await request(app)
      .get(`/users/999`)
      .set("Authorization", `Bearer ${access_token_user}`);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty(
      "message",
      "You don't have permission to access this profile"
    );
  });

  test("Should fail to get user that doesn't exist", async () => {
    const regularUser = "99";
    const fakeUserId = regularUser;
    const response = await request(app)
      .get(`/users/${fakeUserId}`)
      .set("Authorization", `Bearer ${access_token_admin}`);

    expect(response.status).toBe(403);
  });
});

describe("PUT /updateUserById", () => {
  test("berhasil mengupdate profil user", async () => {
    const updatedUser = {
      username: "Updated Username",
      email: "updated@example.com",
      phoneNumber: "9876543210",
      address: "Updated Address",
    };
    const regularUser = 2;
    const response = await request(app)
      .put(`/users/${regularUser}`)
      .set("Authorization", `Bearer ${access_token_user}`)
      .send(updatedUser);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty(
      "message",
      "Profile updated successfully"
    );
    expect(response.body.user).toHaveProperty("username", updatedUser.username);
  });

  test("gagal memperbarui profil user lain", async () => {
    const response = await request(app)
      .put(`/users/999`)
      .set("Authorization", `Bearer ${access_token_user}`)
      .send({ username: "Hacked" });

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty(
      "message",
      "You don't have permission to update this profile"
    );
  });
});

describe("Filter dan Paginasi Produk", () => {
  test("berhasil memfilter produk berdasarkan category", async () => {
    const categoryId = 2;
    const response = await request(app)
      .get(`/products?categoryId=${categoryId}`)
      .set("Authorization", `Bearer ${access_token_user}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });

  test("berhasil menangani parameter paginasi yang tidak valid", async () => {
    const response = await request(app)
      .get("/products?page=invalid&limit=invalid")
      .set("Authorization", `Bearer ${access_token_user}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });
});

describe("cart Keranjang", () => {
  test(" gagal menambahkan produk jika stok tidak mencukupi", async () => {
    const cartItem = {
      productId: 1,
      quantity: 10000,
    };

    const response = await request(app)
      .post("/carts")
      .set("Authorization", `Bearer ${access_token_user}`)
      .send(cartItem);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Insufficient stock");
  });
});

describe("Pengujian Tambahan Manajemen Transaksi", () => {
  test(" gagal membuat QRIS jika keranjang kosong", async () => {
    const regularUser = 2;
    const carts = await Cart.findAll({ where: { userId: regularUser } });
    for (const cart of carts) {
      await cart.destroy();
    }

    const response = await request(app)
      .post("/checkout/qris")
      .set("Authorization", `Bearer ${access_token_user}`);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Cart is empty");
  });

  test(" gagal membuat transaksi Snap jika keranjang kosong", async () => {
    const response = await request(app)
      .post("/checkout/snap")
      .set("Authorization", `Bearer ${access_token_user}`);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Cart is empty");
  });

  test(" menangani error saat membuat transaksi QRIS", async () => {
    await Cart.create({
      userId: 2,
      productId: 1,
      quantity: 1,
    });

    const originalCharge = midtransClient.CoreApi.prototype.charge;
    midtransClient.CoreApi.prototype.charge = jest.fn().mockRejectedValue({
      httpStatusCode: 500,
      message: "Kesalahan API Midtrans",
    });

    const response = await request(app)
      .post("/checkout/qris")
      .set("Authorization", `Bearer ${access_token_user}`);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("message", "Internal server error");

    midtransClient.CoreApi.prototype.charge = originalCharge;
  });

  test(" menangani error saat memeriksa status transaksi", async () => {
    const originalStatus = midtransClient.CoreApi.prototype.transaction.status;
    midtransClient.CoreApi.prototype.transaction.status = jest
      .fn()
      .mockImplementation(() => {
        throw new Error("Gagal memeriksa status");
      });

    const response = await request(app)
      .get("/checkout/status/INVALID-ORDER-ID")
      .set("Authorization", `Bearer ${access_token_user}`);

    expect(response.status).toBe(500);

    midtransClient.CoreApi.prototype.transaction.status = originalStatus;
  });

  test("berhasil menangani notifikasi dengan transaksi tidak valid", async () => {
    const originalNotification =
      midtransClient.CoreApi.prototype.transaction.notification;
    midtransClient.CoreApi.prototype.transaction.notification = jest
      .fn()
      .mockRejectedValue(new Error("Notifikasi tidak valid"));

    const response = await request(app)
      .post("/checkout/notification")
      .set("Authorization", `Bearer ${access_token_user}`)
      .send({
        order_id: "INVALID-ORDER-ID",
        transaction_status: "deny",
      });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty(
      "message",
      "Error processing notification"
    );

    midtransClient.CoreApi.prototype.transaction.notification =
      originalNotification;
  });
});
jest.mock("@google-cloud/dialogflow", () => {
  return {
    SessionsClient: jest.fn().mockImplementation(() => mockSessionsClient),
  };
});

describe("DialogflowController", () => {
  let dialogflowController;
  const mockProjectId = "ecommerce-459220";
  const mockSessionId = "test-session-123";
  const mockCredentialsPath = path.join(
    __dirname,
    "ecommerce-459220-e1aa0723bcf0.json"
  );

  beforeEach(() => {

    jest.clearAllMocks();


    mockSessionsClient.projectAgentSessionPath.mockReturnValue(
      "projects/ecommerce-459220/agent/sessions/test-session-123"
    );


    mockSessionsClient.detectIntent.mockResolvedValue([
      {
        responseId: "response-id",
        queryResult: {
          fulfillmentText: "Hello, how can I help you?",
          intent: {
            displayName: "Welcome Intent",
            confidence: 0.9,
          },
          parameters: struct.encode({ key: "value" }),
          allRequiredParamsPresent: true,
        },
      },
    ]);

    // Create a new instance for each test, but inject the mock session client
    dialogflowController = new DialogflowController(
      mockProjectId,
      mockCredentialsPath,
      mockSessionsClient // Pass the mock directly
    );
  });

  test("should initialize with correct credentials", () => {
    expect(dialogflowController.projectId).toBe(mockProjectId);
    expect(dialogflowController.sessionClient).toBeDefined();
  });

  test("should detect intent successfully", async () => {
    const query = "Hello";
    const languageCode = "en-US";

    const response = await dialogflowController.detectIntent(
      mockSessionId,
      query,
      languageCode
    );

    expect(mockSessionsClient.projectAgentSessionPath).toHaveBeenCalledWith(
      mockProjectId,
      mockSessionId
    );
    expect(mockSessionsClient.detectIntent).toHaveBeenCalled();
    expect(response.fulfillmentText).toBe("Hello, how can I help you?");
    expect(response.intent).toBe("Welcome Intent");
    expect(response.confidence).toBe(0.9);
    expect(response.parameters).toEqual({ key: "value" });
  });

  test("berhasil menangani kesalahan apabila proses deteksi intent gagal", async () => {
    mockSessionsClient.detectIntent.mockRejectedValue(new Error("API Error"));

    await expect(
      dialogflowController.detectIntent(mockSessionId, "Hello", "en-US")
    ).rejects.toThrow("API Error");
  });

  test("berhasil mengirimkan permintaan yang sesuai ke fungsi detectIntent", async () => {
    const query = "Hello";
    const languageCode = "en-US";

    await dialogflowController.detectIntent(mockSessionId, query, languageCode);

    const expectedRequest = {
      session: "projects/ecommerce-459220/agent/sessions/test-session-123",
      queryInput: {
        text: {
          text: query,
          languageCode: languageCode,
        },
      },
    };

    expect(mockSessionsClient.detectIntent).toHaveBeenCalledWith(
      expectedRequest
    );
  });

  test("berhasil mengelola konteks yang disertakan dalam permintaan", async () => {
    const query = "Hello";
    const languageCode = "en-US";
    const contexts = [
      { name: "test-context", lifespanCount: 5, parameters: { foo: "bar" } },
    ];

    await dialogflowController.detectIntentWithContext(
      mockSessionId,
      query,
      languageCode,
      contexts
    );

    const expectedRequest = {
      session: "projects/ecommerce-459220/agent/sessions/test-session-123",
      queryInput: {
        text: {
          text: query,
          languageCode: languageCode,
        },
      },
      queryParams: {
        contexts: contexts.map((context) => ({
          name: `projects/ecommerce-459220/agent/sessions/test-session-123/contexts/${context.name}`,
          lifespanCount: context.lifespanCount,
          parameters: struct.encode(context.parameters),
        })),
      },
    };

    expect(mockSessionsClient.detectIntent).toHaveBeenCalledWith(
      expectedRequest
    );
  });

  test("berhasi membuat ID sesi baru ketika tidak disediakan", () => {
    const sessionId = dialogflowController.createSession();
    expect(typeof sessionId).toBe("string");
    expect(sessionId.length).toBeGreaterThan(0);
  });
});

describe("DialogflowController Additional Tests", () => {
  // Test constructor error handling
  test("berhasil  menangani kesalahan ketika file kredensial tidak ada", () => {
    const nonExistentPath = "/path/to/nonexistent/file.json";
    const controller = new DialogflowController(
      "test-project",
      nonExistentPath
    );
    expect(controller.sessionClient).toBeNull();
  });
  
  test("berhasil menangani kesalahan pada konstruktor", () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    const mockError = new Error("Initialization error");
    const originalSessionsClient =
      require("@google-cloud/dialogflow").SessionsClient;
    require("@google-cloud/dialogflow").SessionsClient = jest
      .fn()
      .mockImplementation(() => {
        throw mockError;
      });

    const controller = new DialogflowController("test-project", "test-path");
    expect(controller.sessionClient).toBeNull();
    expect(console.error).toHaveBeenCalled();

    require("@google-cloud/dialogflow").SessionsClient = originalSessionsClient;
    console.error.mockRestore();
  });
  
  // Test simulateResponse for all possible conditions
  test("berhasil merespons simulasi yang sesuai untuk berbagai permintaan", () => {
    const testCases = [
      {
        input: "hello",
        expected: "Hello there! How can I help you with our products today?",
      },
      {
        input: "hi there",
        expected: "Hello there! How can I help you with our products today?",
      },
      {
        input: "product information",
        expected:
          "We offer a wide range of products including furniture, kitchen appliances, and home decor. You can browse our collection on the main page.",
      },
      {
        input: "what's the price",
        expected:
          "Our prices range from affordable to premium options. You can check the price of each product on its details page.",
      },
      {
        input: "delivery options",
        expected:
          "We offer free shipping on orders over $50. Delivery usually takes 3-5 business days.",
      },
      {
        input: "shipping cost",
        expected:
          "We offer free shipping on orders over $50. Delivery usually takes 3-5 business days.",
      },
      {
        input: "payment methods",
        expected:
          "We accept various payment methods including credit cards, QRIS, and digital wallets like OVO and GoPay.",
      },
      {
        input: "return policy",
        expected:
          "Our return policy allows you to return products within 14 days of delivery if you're not satisfied.",
      },
      {
        input: "refund process",
        expected:
          "Our return policy allows you to return products within 14 days of delivery if you're not satisfied.",
      },
      {
        input: "how to contact support",
        expected:
          "You can contact our customer support team at support@ikeastore.com or call us at +62 123-4567-8900.",
      },
      {
        input: "help me please",
        expected:
          "You can contact our customer support team at support@ikeastore.com or call us at +62 123-4567-8900.",
      },
      {
        input: "thank you",
        expected:
          "You're welcome! Feel free to ask if you need further assistance.",
      },
      {
        input: "goodbye",
        expected: "Thank you for chatting with us. Have a great day!",
      },
      {
        input: "bye",
        expected: "Thank you for chatting with us. Have a great day!",
      },
      {
        input: "random question",
        expected:
          "I'm not sure I understand. Could you rephrase your question? You can ask about our products, prices, delivery, payment methods, or return policy.",
      },
    ];

    testCases.forEach(({ input, expected }) => {
      const response = DialogflowController.simulateResponse(input);
      expect(response).toBe(expected);
    });
  });
  
  // Test simulateResponse as instance method
  test("berhasil menggunakan metode instans simulateResponse", () => {
    const controller = new DialogflowController(
      "test-project",
      "test-path",
      null
    );
    const spy = jest.spyOn(DialogflowController, "simulateResponse");

    const response = controller.simulateResponse("hello");
    expect(spy).toHaveBeenCalledWith("hello");
    expect(response).toBe(
      "Hello there! How can I help you with our products today?"
    );

    spy.mockRestore();
  });

  // Test fallback to simulateResponse when sessionClient is null
  test("berhasil menggunakan simulateResponse ketika sessionClient bernilai null", async () => {
    const controller = new DialogflowController(
      "test-project",
      "test-path",
      null
    );
    const spy = jest.spyOn(controller, "simulateResponse");

    await controller.detectIntent("test-session", "hello", "en-US");
    expect(spy).toHaveBeenCalledWith("hello");

    spy.mockRestore();
  });
  
  test("berhasil menggunakan simulateResponse dalam detectIntentWithContext ketika sessionClient bernilai nul", async () => {
    const controller = new DialogflowController(
      "test-project",
      "test-path",
      null
    );
    const spy = jest.spyOn(controller, "simulateResponse");

    await controller.detectIntentWithContext("test-session", "hello", "en-US");
    expect(spy).toHaveBeenCalledWith("hello");

    spy.mockRestore();
  });

  // Test processMessage static method
  test("berhasil memproses pesan sukses", async () => {
    const req = {
      body: { message: "hello" }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();
    
    await DialogflowController.processMessage(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Hello there! How can I help you with our products today?"
    });
  });
  
  test("berhasil mengembalikan kesalahan ketika pesan tidak ada", async () => {
    const req = { body: {} };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    await DialogflowController.processMessage(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Message is required" });
  });
  
  test("berhasil menghandle error di processMessage", async () => {
    const req = {
      body: { message: "hello" }
    };
    const res = {};
    const next = jest.fn();
    
    // Force an error by calling a method on undefined
    res.status = undefined;
    
    await DialogflowController.processMessage(req, res, next);
    
    expect(next).toHaveBeenCalled();
    expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
  });
});
