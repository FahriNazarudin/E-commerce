"use strict";
const { Model } = require("sequelize");
const { hashPassword } = require("../helpers/bcrypt");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.Product, { foreignKey: "userId" });
      User.hasMany(models.Cart, { foreignKey: "userId" });
    }
  }
  User.init(
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: { args: true, msg: "username is already exists" },
        validate: {
          notNull: { msg: "username is required!" },
          notEmpty: { msg: "username cannot be empty" },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: { args: true, msg: "Email is already exists" },
        validate: {
          notNull: { msg: "Email is required!" },
          notEmpty: { msg: "Email cannot be empty" },
          isEmail: { msg: "Email format is wrong" },
        },
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Phone Number is required!" },
          notEmpty: { msg: "Phone Number cannot be empty" },
          len: { args: [8], msg: "Phone Number minimal 8 character" },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Password is required!" },
          notEmpty: { msg: "Password cannot be empty" },
          len: { args: [6], msg: "Password minimal 6 character" },
        },
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Address is required!" },
          notEmpty: { msg: "Address cannot be empty" },
        },
      },
    },
    {
      sequelize,
      modelName: "User",
    }
  );

User.beforeCreate((user) =>{
  user.password = hashPassword(user.password)
})
  return User;
};
