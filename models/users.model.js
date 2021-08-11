const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const { secret } = require('./../config/config.json')
module.exports = (sequelize, Sequelize) => {
    const Users = sequelize.define("users", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        firstname: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        lastname: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        email: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false
        },
        role: {
            type: Sequelize.DataTypes.ENUM('user', 'admin'),
            defaultValue: 'user'
        }
    }, {
        freezeTableName: true,
        hooks: {
            beforeCreate: async (user) => {
                const salt = bcrypt.genSaltSync(10);
                user.password = bcrypt.hashSync(user.password, salt);
            },
            afterCreate: async (user) => {
                //can use for signup
                // var token = await jwt.sign({
                //     id: user.id,
                //     role: user.role
                // }, secret)
                // user.dataValues.accessToken = token
                delete user.dataValues.password
            }
        }
    });

    return Users;
};