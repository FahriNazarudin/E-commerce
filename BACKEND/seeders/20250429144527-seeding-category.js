'use strict';
const fs = require("fs").promises;
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const user = JSON.parse(
      await fs.readFile("./data/users.json", "utf8")
    ).map((el) => {
      delete el.id;
      el.createdAt = new Date();
      el.updatedAt = new Date();
      return el;
    });

    await queryInterface.bulkInsert("Users", user, {});
    const category = JSON.parse(
      await fs.readFile("./data/categories.json", "utf8")
    ).map((el) => {
      delete el.id;
      el.createdAt = new Date();
      el.updatedAt = new Date();
      return el;
    });

    await queryInterface.bulkInsert("Categories", category, {});
  },

  async down(queryInterface, Sequelize) {

    await queryInterface.bulkDelete("Users", null, {});
    await queryInterface.bulkDelete("Categories", null, {});
  },
};
