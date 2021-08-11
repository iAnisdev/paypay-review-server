const dbConfig = require("./../config/db.config")

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.DIALECT,
  pool: dbConfig.POOL
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = require("./users.model.js")(sequelize, Sequelize);
db.requests = require("./requests.model.js")(sequelize, Sequelize);
db.reviews = require("./reviews.model.js")(sequelize, Sequelize);

db.users.hasMany(db.reviews, { foreignKey: 'reviewer', as: 'givenReviews' })

db.users.hasMany(db.reviews, { foreignKey: 'reviewFor', as: 'recivedReviews' })

db.requests.belongsTo(db.users, { foreignKey: 'reviewer', as: 'reviewerUser' })

db.requests.belongsTo(db.users, { foreignKey: 'reviewFor', as: 'reviewForUser' })

db.reviews.belongsTo(db.users, { foreignKey: 'reviewFor', as: 'reviewForUser' })

db.reviews.belongsTo(db.users, { foreignKey: 'reviewer', as: 'reviewerUser' })

module.exports = db;