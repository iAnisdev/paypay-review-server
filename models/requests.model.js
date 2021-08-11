module.exports = (sequelize, Sequelize) => {
    const Requests = sequelize.define('requests', {
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
                key: 'id',
                msg: "Invalid reviewer id, user doesn't exists"
            }
        },
        reviewFor: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
                msg: "Invalid reviewFor id, user doesn't exists"
            }
        },
        status: {
            type: Sequelize.DataTypes.ENUM('pending', 'reviewed'),
            defaultValue: 'pending'
        }
    }, {
        freezeTableName: true
    })

    return Requests
}