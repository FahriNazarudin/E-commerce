const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

/** @type {import('sequelize-cli').Migration} */
("use strict");

module.exports = {
  async up(queryInterface, Sequelize) {
    const users = [
      {
        userName: "admin",
        email: "admin@mail.com",
        phoneNumber: 1234567890,
        password: "admin123",
        adress: "Jalan Merdeka, Jakarta",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userName: "user",
        email: "user@mail.com",
        phoneNumber: 987654321,
        password: "user123",
        adress: "Jalan Merdeka, Bandung",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    await queryInterface.bulkInsert("Users", users, {});

    const categoryRes = await fetch(
      "https://h8-phase2-gc.vercel.app/apis/pub/branded-things/categories"
    );
    const categoryData = await categoryRes.json();
    console.log("API Category Data:", categoryData);

    const categoryInsertData = categoryData.data.map((el) => ({
      name: el.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    await queryInterface.bulkInsert("Categories", categoryInsertData, {});

    const productRes = await fetch(
      "https://h8-phase2-gc.vercel.app/apis/branded-things/products", 
    );
    const productData = await productRes.json();
    console.log("API Product Data:", productData);
    const productInsertData = productData.data.query.map((el) => ({
      name: el.name,
      description: el.description,
      price: el.price,
      stock: el.stock,
      imgUrl: el.imgUrl,
      categoryId: el.categoryId,
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    await queryInterface.bulkInsert("Products", productInsertData, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Products", null, {});
    await queryInterface.bulkDelete("Categories", null, {});
    await queryInterface.bulkDelete("Users", null, {});
  },
};
