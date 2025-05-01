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

describe("POST /login", () => {
  test("should login successfully and return access_token", async () => {
    const requestBody = {
      email: "admin@example.com",
      password: "admin123",
    };

    const response = await request(app).post("/login").send(requestBody);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("access_token");
  });

  test("should fail if email is missing", async () => {
    const requestBody = {
      password: "admin123",
    };

    const response = await request(app).post("/login").send(requestBody);
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Email is required");
  });

  test("should fail if password is missing", async () => {
    const requestBody = {
      email: "admin@example.com",
    };

    const response = await request(app).post("/login").send(requestBody);
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Password is required");
  });

  test("should fail if email is not registered", async () => {
    const requestBody = {
      email: "nonexistent@example.com",
      password: "admin123",
    };

    const response = await request(app).post("/login").send(requestBody);
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Invalid email/password");
  });

  test("should fail if password is incorrect", async () => {
    const requestBody = {
      email: "admin@example.com",
      password: "wrongpassword",
    };

    const response = await request(app).post("/login").send(requestBody);
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Invalid email/password");
  });
});

describe("POST /products", () => {
  test("should create a product successfully", async () => {
    const product = {
      name: "Cubic Lemari Pakaian Minimalis / Wardrobe Baju / LUNA LPM 301 - SonomaBl - Grey",
      description:
        "Store your favorite clothes in the LUNA LPM 301 wardrobe, equipped with racks, a table, and a beautiful mirror that can be opened.",
      price: 1029000,
      stock: 587,
      imgUrl:
        "https://res.cloudinary.com/dpjqm8kkk/image/upload/v1723522920/hacktiv8/branded/cubic-lemari-pakaian-minimalis-wardrobe-baju-luna-lpm-301-sonomabl-grey-qswxtjtx14i.jpg",
      categoryId: 2,
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
    expect(response.body).toHaveProperty("userId", product.userId);

    // Verify product is saved in the database
    const savedProduct = await Product.findOne({
      where: { name: product.name },
    });
    expect(savedProduct).toBeTruthy();
  });

  test("should fail with invalid token", async () => {
    const product = {
      name: "Kota kembang Bandung",
      description: "Tourist attractions and snacks in Bandung",
      price: 100000,
      stock: 10,
      imgUrl: "https://suarautama.id/wp-content/uploads/2024/10/images-15.jpeg",
      categoryId: 1,
      userId: 2,
    };

    const response = await request(app)
      .post("/products")
      .set("Authorization", "Bearer invalid_token")
      .send(product);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Unauthorized access");
  });

  test("should fail when required fields are missing", async () => {
    const product = {
      description: "Tourist attractions and snacks in Bandung",
      imgUrl: "https://suarautama.id/wp-content/uploads/2024/10/images-15.jpeg",
      categoryId: 1,
    };

    const response = await request(app)
      .post("/products")
      .set("Authorization", `Bearer ${access_token_admin}`)
      .send(product);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Name is required!");
  });

  test("should fail for non-admin user", async () => {
    const product = {
      name: "Non-Admin Product",
      description: "A product created by a non-admin user",
      price: 500000,
      stock: 100,
      imgUrl: "https://example.com/image.jpg",
      categoryId: 1,
      userId: 2,
    };

    const response = await request(app)
      .post("/products")
      .set("Authorization", `Bearer ${access_token_user}`)
      .send(product);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("message", "Admin access required");
  });
});
