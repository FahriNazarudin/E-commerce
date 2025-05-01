"use strict";
const fs = require("fs").promises;
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const data = JSON.parse(
      await fs.readFile("./data/products.json", "utf8")
    ).map((el) => {
      delete el.id;
      el.createdAt = new Date();
      el.updatedAt = new Date();
      return el;
    });

    await queryInterface.bulkInsert("Products", data, {});

     const cart = JSON.parse(
       await fs.readFile("./data/carts.json", "utf8")
     ).map((el) => {
       delete el.id;
       el.createdAt = new Date();
       el.updatedAt = new Date();
       return el;
     });

     await queryInterface.bulkInsert("Carts", cart, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Products", null, {});
    await queryInterface.bulkDelete("Carts", null, {});
  },
};
