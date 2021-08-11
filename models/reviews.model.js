module.exports = (sequelize, Sequelize) => {
    const Reviews = sequelize.define('reviews', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        reviewer: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        reviewFor: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        rating: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            min: 1,
            max: 5
        },
        feedback: {
            type: Sequelize.TEXT,
            allowNull: false
        }
    }, {
        freezeTableName: true
    })

    return Reviews
}